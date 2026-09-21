// ============================================================
// Cliente da API oficial da Cakto (servidor apenas)
//
// Usado para liberar acesso AUTOMATICAMENTE mesmo quando o webhook não
// pegou a compra (ex.: produto/variante criado antes do webhook, ou a
// Cakto não entregou o evento). Consulta pedidos pagos direto na fonte.
//
// Credenciais (Client ID / Client Secret) — ordem de busca:
//   1) tabela configuracoes, chave "cakto_api" (salva pelo painel /admin)
//   2) variáveis de ambiente CAKTO_CLIENT_ID / CAKTO_CLIENT_SECRET
// Escopos necessários na chave: read + orders
// ============================================================

const API = "https://api.cakto.com.br/public_api";

// status que representam "comprou e está valendo" (sem reembolso/chargeback)
const STATUS_PAGO = new Set(["paid", "in_settlement", "authorized", "partially_paid"]);

export async function credenciaisCakto(db) {
  let clientId = "", clientSecret = "";
  try {
    if (db) {
      const { data } = await db.from("configuracoes").select("valor").eq("chave", "cakto_api").maybeSingle();
      clientId = data?.valor?.clientId || "";
      clientSecret = data?.valor?.clientSecret || "";
    }
  } catch {}
  clientId = clientId || process.env.CAKTO_CLIENT_ID || "";
  clientSecret = clientSecret || process.env.CAKTO_CLIENT_SECRET || "";
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export async function tokenCakto(clientId, clientSecret) {
  const r = await fetch(`${API}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret }),
    cache: "no-store",
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error("Credenciais da Cakto inválidas — confira o Client ID e o Client Secret");
  return j.access_token;
}

// cache leve do token em memória (dura enquanto a função serverless estiver quente)
let _tok = { valor: null, ate: 0 };
async function tokenComCache(db) {
  if (_tok.valor && Date.now() < _tok.ate) return _tok.valor;
  const cred = await credenciaisCakto(db);
  if (!cred) return null;
  const t = await tokenCakto(cred.clientId, cred.clientSecret);
  _tok = { valor: t, ate: Date.now() + 20 * 60 * 1000 }; // 20 min
  return t;
}

// Classifica o pedido em fase1 (acesso principal) / fase2 / fase3 / studio.
// Qualquer produto/variante que não seja Fase 2, Fase 3 ou Studio → acesso principal.
export function classificarPedido(p) {
  const nome = String(p?.product?.name || "").toLowerCase();
  const url = String(p?.checkoutUrl || "").toLowerCase();
  if (nome.includes("studio") || url.includes("35gq5du")) return "studio";
  if (nome.includes("fase 3") || nome.includes("fase3") || url.includes("t2tvh6v")) return "fase3";
  if (nome.includes("fase 2") || nome.includes("fase2") || url.includes("3ep394x")) return "fase2";
  return "fase1";
}

export function pedidoValido(p) {
  if (p?.refundedAt || p?.chargedbackAt || p?.canceledAt) return false;
  return STATUS_PAGO.has(String(p?.status || "").toLowerCase());
}

// Busca pedidos PAGOS de um email específico (todos os produtos).
// Retorna [] se não há credenciais configuradas (nunca lança para não travar o login).
export async function pedidosPagosPorEmail(db, email) {
  const em = String(email || "").trim().toLowerCase();
  if (!em) return [];
  const token = await tokenComCache(db);
  if (!token) return [];
  const url = `${API}/orders/?customer=${encodeURIComponent(em)}&status=paid,in_settlement,authorized,partially_paid&limit=50`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (r.status === 401) { _tok = { valor: null, ate: 0 }; } // token expirou — próxima chamada renova
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.detail || "Erro ao consultar pedidos na Cakto");
  // a Cakto busca "customer" por id/nome/email/documento — garante que o email bate exatamente
  return (j.results || []).filter((p) => pedidoValido(p) && String(p?.customer?.email || "").trim().toLowerCase() === em);
}

// Itera TODOS os pedidos pagos da conta (paginado). Chama cb(pedido) para cada um.
export async function paraCadaPedidoPago(db, cb, { maxPaginas = 60 } = {}) {
  const token = await tokenComCache(db);
  if (!token) throw new Error("precisa_credenciais");
  let url = `${API}/orders/?status=paid,in_settlement,authorized,partially_paid&limit=100&ordering=-paidAt`;
  let paginas = 0, total = 0;
  while (url && paginas < maxPaginas) {
    paginas++;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.detail || "Erro ao listar pedidos na Cakto — confira se a chave tem os escopos read + orders");
    for (const p of j.results || []) {
      if (!pedidoValido(p)) continue;
      total++;
      await cb(p);
    }
    url = j.next || null;
  }
  return { paginas, total };
}

// Aplica um pedido pago na base do app (idempotente): garante a compradora
// em `compradoras`, marca fase2/fase3/studio quando for o caso e guarda o contato.
// Retorna { email, produto, novo } — novo=true quando o email ainda não tinha acesso.
export async function liberarPedidoNoApp(db, p) {
  const email = String(p?.customer?.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return null;
  const produto = classificarPedido(p);
  const agora = new Date().toISOString();

  const { data: existente } = await db.from("compradoras").select("email").eq("email", email).maybeSingle();
  const novo = !existente;

  // contato (nome + telefone) — marcador que nunca falha
  const nome = p?.customer?.name || null;
  const telefone = p?.customer?.phone ? String(p.customer.phone).replace(/[^\d+]/g, "") : null;
  if (nome || telefone) {
    try {
      const { data: ct } = await db.from("configuracoes").select("valor").eq("chave", `contato:${email}`).maybeSingle();
      const atual = ct?.valor || {};
      await db.from("configuracoes").upsert(
        { chave: `contato:${email}`, valor: { nome: atual.nome || nome, telefone: atual.telefone || telefone }, atualizado_em: agora },
        { onConflict: "chave" }
      );
    } catch {}
  }

  if (produto === "studio") {
    await db.from("configuracoes").upsert({ chave: `studio:${email}`, valor: "1", atualizado_em: agora }, { onConflict: "chave" });
    // Studio é upsell: quem comprou Studio também tem o acesso principal
    try { await db.from("compradoras").upsert({ email, atualizado_em: agora }, { onConflict: "email" }); } catch {}
    return { email, produto, novo };
  }

  const patch = { email, atualizado_em: agora };
  if (nome) patch.nome = nome;
  if (telefone) patch.telefone = telefone;
  if (produto === "fase2") patch.fase2_paga = true;
  if (produto === "fase3") patch.fase3_paga = true;
  if (produto === "fase1") patch.produto = "fase1";
  let { error } = await db.from("compradoras").upsert(patch, { onConflict: "email" });
  if (error) { // colunas nome/telefone podem não existir
    delete patch.nome; delete patch.telefone;
    ({ error } = await db.from("compradoras").upsert(patch, { onConflict: "email" }));
    if (error) throw new Error(error.message);
  }

  if (produto === "fase2" || produto === "fase3") {
    const { data: prof } = await db.from("profiles").select("id").eq("email", email).maybeSingle();
    if (prof) {
      await db.from("profiles").update({
        [produto === "fase2" ? "fase2_paga" : "fase3_paga"]: true,
        fase_atual: produto === "fase2" ? 2 : 3,
      }).eq("id", prof.id);
    }
  }
  return { email, produto, novo };
}
