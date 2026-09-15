// ============================================================
// Webhook da Cakto — libera acesso automático pós-compra
// Configure na Cakto: URL https://SEU-DOMINIO/api/webhook/cakto?secret=SEU_SEGREDO
// (a Cakto também envia o campo "secret" no corpo — aceitamos os dois)
//
// Formato real da Cakto (tipo de disparo "Agrupado"):
//   { "secret": "...", "event": "purchase_approved", "data": [ {item1}, {item2}... ] }
// Cada item = uma venda (produto principal + order bumps), com
// customer.email, product.name, status ("paid"), refundedAt, etc.
// ============================================================
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { enviarEventoMeta, hashMeta, hashTelefone } from "../../../../lib/metaCapi";

export const dynamic = "force-dynamic";

function extrairEmail(item) {
  return (
    item?.customer?.email ||
    item?.client?.email ||
    item?.buyer?.email ||
    item?.email ||
    null
  );
}

function extrairNome(item) {
  return (
    item?.customer?.name ||
    item?.client?.name ||
    item?.buyer?.name ||
    item?.name ||
    null
  );
}

function extrairTelefone(item) {
  const t = (
    item?.customer?.phone ||
    item?.customer?.cellphone ||
    item?.client?.phone ||
    item?.buyer?.phone ||
    item?.phone ||
    null
  );
  return t ? String(t).replace(/[^\d+]/g, "") : null;
}

function extrairProduto(item) {
  // ids de oferta que identificam o Studio (upsell 1-click da Cakto)
  const offerId = String(
    item?.offer?.id || item?.offer_id || item?.offer?.code || item?.checkoutUrl || item?.checkout_url || ""
  ).toLowerCase();
  const nome = (
    item?.product?.name ||
    item?.offer?.name ||
    item?.product_name ||
    ""
  ).toLowerCase();
  if (nome.includes("studio") || offerId.includes("35gq5du")) return "studio";
  // reconhece pelo nome OU pelo código da oferta na Cakto (dupla garantia)
  if (nome.includes("fase 3") || nome.includes("fase3") || offerId.includes("t2tvh6v")) return "fase3";
  if (nome.includes("fase 2") || nome.includes("fase2") || offerId.includes("3ep394x")) return "fase2";
  return "fase1";
}

function extrairStatus(item, evento) {
  // sinais de reembolso no próprio item
  if (item?.refundedAt || item?.chargedbackAt || item?.canceledAt) return "reembolso";
  const st = (item?.status || evento || "").toString().toLowerCase();
  const reembolso = ["refunded", "refund", "chargeback", "chargedback", "reembolso", "estorn", "canceled", "cancelled"];
  const aprovado = ["approved", "paid", "purchase_approved", "compra aprovada", "aprovada", "completed"];
  if (reembolso.some((k) => st.includes(k))) return "reembolso";
  if (aprovado.some((k) => st.includes(k)) || st === "") return "aprovado";
  return "outro";
}

// -------- Meta CAPI: Purchase server-side com dedupe ----------
// event_id = id da transação na Cakto (estável): se a Cakto reenviar o
// webhook, a Meta ignora a duplicata. value/currency sempre presentes.
function extrairValor(item) {
  const cands = [item?.amount, item?.baseAmount, item?.base_amount, item?.total, item?.value, item?.price, item?.offer?.price, item?.product?.price];
  for (const c of cands) {
    const n = Number(c);
    if (Number.isFinite(n) && n > 0) return n > 1000 ? n / 100 : n; // centavos → reais
  }
  return null;
}

function extrairTransacaoId(item) {
  return item?.refId || item?.ref_id || item?.id || item?.transaction_id || item?.saleId || item?.sale_id || null;
}

const NOMES_PRODUTO = {
  fase1: "NoctaLev Protocolo 60 dias",
  fase2: "NoctaLev Fase 2 - Shot Termo-Metabolico",
  fase3: "NoctaLev Fase 3 - Energia e Manutencao",
  studio: "NoctaLev Studio",
};

async function dispararPurchaseMeta(item, produto, email) {
  const valor = extrairValor(item);
  const txId = extrairTransacaoId(item);
  // event_id estável por transação (dedupe entre reenvios do webhook)
  const eventId = "pur_" + (txId ? String(txId) : `${email}_${produto}_${new Date().toISOString().slice(0, 10)}`);
  const user_data = { em: [hashMeta(email)] };
  const tel = extrairTelefone(item);
  if (tel) user_data.ph = [hashTelefone(tel)];
  const nome = extrairNome(item);
  if (nome) user_data.fn = [hashMeta(String(nome).split(" ")[0])];
  const evt = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: "website",
    event_source_url: "https://noctalev.online/oferta/",
    user_data,
    custom_data: {
      value: Number.isFinite(valor) && valor ? valor : 47.9, // fallback: preço à vista
      currency: "BRL",
      content_name: NOMES_PRODUTO[produto] || "NoctaLev",
    },
  };
  // não bloqueia a liberação do acesso se a Meta falhar
  try { await enviarEventoMeta(evt); } catch {}
}

async function processarItem(db, item, evento) {
  const email = extrairEmail(item)?.trim().toLowerCase();
  if (!email) return { erro: "sem email" };

  const produto = extrairProduto(item);
  const status = extrairStatus(item, evento);

  if (status === "reembolso") {
    if (produto === "studio") {
      // remove o acesso ao Studio (tabela + marcador de fallback)
      await db.from("configuracoes").upsert(
        { chave: `studio:${email}`, valor: "0", atualizado_em: new Date().toISOString() },
        { onConflict: "chave" }
      );
      try { await db.from("compradoras").update({ studio_pago: false, atualizado_em: new Date().toISOString() }).eq("email", email); } catch {}
      return { acao: "reembolso", email, produto };
    }
    if (produto === "fase1") {
      await db.from("compradoras").delete().eq("email", email);
    } else {
      await db.from("compradoras").update({
        [produto === "fase2" ? "fase2_paga" : "fase3_paga"]: false,
        atualizado_em: new Date().toISOString(),
      }).eq("email", email);
      const { data: prof } = await db.from("profiles").select("id").eq("email", email).maybeSingle();
      if (prof) await db.from("profiles").update({ [produto === "fase2" ? "fase2_paga" : "fase3_paga"]: false }).eq("id", prof.id);
    }
    return { acao: "reembolso", email, produto };
  }

  if (status !== "aprovado") return { acao: "ignorado", email, produto, status };

  // guarda o contato (nome + telefone) num marcador que NUNCA falha —
  // a tabela compradoras pode não ter essas colunas; configuracoes sempre tem
  const nomeContato = extrairNome(item);
  const telContato = extrairTelefone(item);
  if (nomeContato || telContato) {
    try {
      await db.from("configuracoes").upsert(
        { chave: `contato:${email}`, valor: { nome: nomeContato || null, telefone: telContato || null }, atualizado_em: new Date().toISOString() },
        { onConflict: "chave" }
      );
    } catch { /* nunca bloqueia a liberação */ }
  }

  if (produto === "studio") {
    // libera o Studio: marcador que nunca falha (configuracoes) + coluna se existir
    await db.from("configuracoes").upsert(
      { chave: `studio:${email}`, valor: "1", atualizado_em: new Date().toISOString() },
      { onConflict: "chave" }
    );
    const { error: eSt } = await db.from("compradoras")
      .update({ studio_pago: true, atualizado_em: new Date().toISOString() }).eq("email", email);
    if (eSt) { /* coluna pode não existir — o marcador em configuracoes já garante o acesso */ }
    await dispararPurchaseMeta(item, produto, email);
    return { acao: "liberado", email, produto };
  }

  // compra aprovada → registra/atualiza compradora (com nome e telefone p/ o admin)
  const patch = { email, atualizado_em: new Date().toISOString() };
  const nome = extrairNome(item);
  const telefone = extrairTelefone(item);
  if (nome) patch.nome = nome;
  if (telefone) patch.telefone = telefone;
  if (produto === "fase2") patch.fase2_paga = true;
  if (produto === "fase3") patch.fase3_paga = true;
  if (produto === "fase1") patch.produto = "fase1";
  const { error: eUp } = await db.from("compradoras").upsert(patch, { onConflict: "email" });
  if (eUp) {
    // colunas nome/telefone ainda não existem → salva sem elas (nunca perde a venda)
    delete patch.nome; delete patch.telefone;
    await db.from("compradoras").upsert(patch, { onConflict: "email" });
  }

  // se a usuária já tem perfil, libera a fase imediatamente
  if (produto === "fase2" || produto === "fase3") {
    const { data: prof } = await db.from("profiles").select("id").eq("email", email).maybeSingle();
    if (prof) {
      await db.from("profiles").update({
        [produto === "fase2" ? "fase2_paga" : "fase3_paga"]: true,
        ...(produto === "fase2" ? { fase_atual: 2 } : { fase_atual: 3 }),
      }).eq("id", prof.id);
    }
  }

  await dispararPurchaseMeta(item, produto, email);
  return { acao: "liberado", email, produto };
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

  // valida segredo: query ?secret=, header, ou campo "secret" no corpo (formato Cakto)
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") || req.headers.get("x-webhook-secret") || body?.secret;
  if (!process.env.CAKTO_WEBHOOK_SECRET || secret !== process.env.CAKTO_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const evento = body?.event || body?.type || "";
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "supabase não configurado" }, { status: 500 });

  // "data" pode ser: lista de itens (Agrupado), objeto único, ou o próprio body
  let itens;
  if (Array.isArray(body?.data)) itens = body.data;
  else if (body?.data && typeof body.data === "object") itens = [body.data];
  else itens = [body];

  const resultados = [];
  for (const item of itens) {
    try { resultados.push(await processarItem(db, item, evento)); }
    catch (e) { resultados.push({ erro: String(e?.message || e) }); }
  }

  const algumOk = resultados.some((r) => r.acao === "liberado" || r.acao === "reembolso");
  if (!algumOk && resultados.every((r) => r.erro === "sem email")) {
    return NextResponse.json({ error: "email não encontrado no payload" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, evento, resultados });
}
