// API do painel admin — usa service_role no servidor, protegida por PIN.
// GET  ?pin=XXXX&acao=lista            → todas as usuárias com métricas
// GET  ?pin=XXXX&acao=detalhe&id=UUID  → perfil completo + check-ins + rituais
// POST { pin, acao, id, ... }          → ações manuais
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Emails de teste — NÃO contam nas métricas nem aparecem na lista do admin
const EMAILS_TESTE = ["teste@noctalev.app", "clienteteste@noctalev.com", "john.doe@example.com"];
const ehTeste = (email) => EMAILS_TESTE.includes(String(email || "").toLowerCase());

function autz(pin) {
  return pin && pin === (process.env.ADMIN_PIN || "2026");
}

export async function GET(req) {
  const url = new URL(req.url);
  if (!autz(url.searchParams.get("pin"))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "supabase não configurado" }, { status: 500 });
  const acao = url.searchParams.get("acao") || "lista";

  if (acao === "detalhe") {
    const id = url.searchParams.get("id");
    const [{ data: perfil }, { data: checkins }, { data: rituais }, { data: conquistas }, { data: notas }] = await Promise.all([
      db.from("profiles").select("*").eq("id", id).maybeSingle(),
      db.from("checkins").select("*").eq("user_id", id).order("data", { ascending: false }),
      db.from("rituais").select("*").eq("user_id", id).order("data", { ascending: false }),
      db.from("conquistas").select("*").eq("user_id", id),
      db.from("notas_admin").select("*").eq("user_id", id).order("criado_em", { ascending: false }),
    ]);
    return NextResponse.json({ perfil, checkins, rituais, conquistas, notas });
  }

  if (acao === "config") {
    const { data } = await db.from("configuracoes").select("*");
    const cfg = {};
    (data || []).forEach((r) => { cfg[r.chave] = r.valor; });
    return NextResponse.json({ config: cfg });
  }

  if (acao === "csv") {
    const { data: cks } = await db.from("checkins")
      .select("user_id, data, sono_qualidade, horas_sono, acordou_madrugada, peso, profiles(nome, email)")
      .order("data", { ascending: true });
    const linhas = [["nome", "email", "data", "sono_1a5", "horas", "acordou", "peso_kg"]];
    (cks || []).filter((c) => !ehTeste(c.profiles?.email)).forEach((c) => linhas.push([
      c.profiles?.nome || "", c.profiles?.email || "", c.data,
      c.sono_qualidade, c.horas_sono, c.acordou_madrugada ? "sim" : "nao", c.peso ?? "",
    ]));
    const csv = "\uFEFF" + linhas.map((l) => l.join(";")).join("\n");
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv;charset=utf-8", "Content-Disposition": "attachment; filename=noctalev_checkins.csv" },
    });
  }

  // lista (dashboard + funil + risco + vendas + compradoras×acesso)
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const [{ data: perfis }, { data: cksHoje }, { data: todosCks }, { data: compradoras }, { data: todosRituais }] = await Promise.all([
    db.from("profiles").select("*").order("criado_em", { ascending: false }),
    db.from("checkins").select("user_id").eq("data", hoje),
    db.from("checkins").select("user_id, data, peso"),
    db.from("compradoras").select("*"),
    db.from("rituais").select("user_id, data"),
  ]);

  // separa contas de teste (ficam fora de TUDO: lista, métricas e CSV)
  const idsTeste = new Set((perfis || []).filter((p) => ehTeste(p.email)).map((p) => p.id));
  const perfisReais = (perfis || []).filter((p) => !ehTeste(p.email));
  const cksHojeReais = (cksHoje || []).filter((c) => !idsTeste.has(c.user_id));
  const todosCksReais = (todosCks || []).filter((c) => !idsTeste.has(c.user_id));
  const compradorasReais = (compradoras || []).filter((c) => !ehTeste(c.email));
  const rituaisReais = (todosRituais || []).filter((r) => !idsTeste.has(r.user_id));

  const porUser = {};
  todosCksReais.forEach((c) => {
    porUser[c.user_id] = porUser[c.user_id] || { n: 0, ultimo: null, ultimoPeso: null, primeiroPeso: null, primeiroData: null };
    porUser[c.user_id].n++;
    if (!porUser[c.user_id].ultimo || c.data > porUser[c.user_id].ultimo) {
      porUser[c.user_id].ultimo = c.data;
      if (c.peso != null) porUser[c.user_id].ultimoPeso = Number(c.peso);
    }
    if (c.peso != null && (!porUser[c.user_id].primeiroData || c.data < porUser[c.user_id].primeiroData)) {
      porUser[c.user_id].primeiroData = c.data;
      porUser[c.user_id].primeiroPeso = Number(c.peso);
    }
  });
  // última atividade REAL = último check-in OU último ritual (o que for mais recente)
  const ultRitual = {};
  rituaisReais.forEach((r) => {
    if (!ultRitual[r.user_id] || r.data > ultRitual[r.user_id]) ultRitual[r.user_id] = r.data;
  });

  const usuarias = perfisReais.map((p) => {
    const st = porUser[p.id] || { n: 0, ultimo: null, ultimoPeso: null };
    const diaProt = p.receita_preparada_em
      ? Math.max(1, Math.round((new Date(hoje) - new Date(p.receita_preparada_em.slice(0, 10))) / 86400000) + 1)
      : 0;
    const ultimaAtividade = [st.ultimo, ultRitual[p.id], p.criado_em?.slice(0, 10)]
      .filter(Boolean).sort().pop() || null;
    const diasSemAtividade = ultimaAtividade
      ? Math.round((new Date(hoje) - new Date(ultimaAtividade)) / 86400000)
      : 999;
    const kgPerdidos = p.peso_inicial != null && st.ultimoPeso != null
      ? Math.max(0, Number(p.peso_inicial) - st.ultimoPeso) : 0;
    return {
      id: p.id, nome: p.nome, email: p.email,
      dia: diaProt, fase: p.fase_atual || 1,
      checkins: st.n, ultimoCheckin: st.ultimo,
      pesoInicial: p.peso_inicial != null ? Number(p.peso_inicial) : null,
      pesoAtual: st.ultimoPeso,
      kgPerdidos: Math.round(kgPerdidos * 10) / 10,
      pontos: p.pontos || 0,
      preparou: !!p.receita_preparada_em,
      fase2Liberada: !!p.fase2_liberada_em,
      fase2Paga: !!p.fase2_paga,
      fase3Liberada: !!p.fase3_liberada_em,
      fase3Paga: !!p.fase3_paga,
      ultimaAtividade, diasSemAtividade,
      // score de engajamento: 🔥 ativa (0-1d) · 💛 morna (2-3d) · 🚨 fria (4+d)
      engajamento: diasSemAtividade <= 1 ? "alta" : diasSemAtividade <= 3 ? "media" : "fria",
      inativa: diasSemAtividade >= 3,
      criadoEm: p.criado_em,
    };
  });

  // ===== FUNIL da jornada =====
  const nTotal = usuarias.length;
  const funil = {
    cadastrou: nTotal,
    preparou: usuarias.filter((u) => u.preparou).length,
    dia3: usuarias.filter((u) => u.dia >= 3).length,
    dia7: usuarias.filter((u) => u.dia >= 7).length,
    fase2Liberada: usuarias.filter((u) => u.fase2Liberada).length,
    fase2Paga: usuarias.filter((u) => u.fase2Paga).length,
  };

  // ===== ATIVIDADE dos últimos 14 dias (check-ins por dia) =====
  const atividade14 = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(hoje + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - i);
    const dia = d.toISOString().slice(0, 10);
    atividade14.push({ dia, n: todosCksReais.filter((c) => c.data === dia).length });
  }

  // ===== COMPRADORAS × PRIMEIRO ACESSO =====
  // cruza a lista de quem comprou (Cakto/manual) com quem tem perfil no app
  const emailsComPerfil = new Map(perfisReais.map((p) => [String(p.email || "").toLowerCase(), p]));
  const compradorasStatus = compradorasReais.map((c) => {
    const em = String(c.email || "").toLowerCase();
    const prof = emailsComPerfil.get(em);
    const u = prof ? usuarias.find((x) => x.id === prof.id) : null;
    return {
      email: em,
      nome: c.nome || u?.nome || null,
      telefone: c.telefone || null,
      compradaEm: c.criado_em || null,
      fase2Paga: !!c.fase2_paga,
      fase3Paga: !!c.fase3_paga,
      acessou: !!prof,                         // criou perfil = fez o 1º acesso
      primeiroAcesso: prof?.criado_em || null,
      dia: u?.dia ?? null,
      diasSemAtividade: u?.diasSemAtividade ?? null,
      userId: prof?.id || null,
    };
  }).sort((a, b) => Number(a.acessou) - Number(b.acessou)); // nunca acessou primeiro

  const nuncaAcessou = compradorasStatus.filter((c) => !c.acessou).length;

  // ===== VENDAS: oportunidades =====
  const oportunidades = {
    // dinheiro na mesa: Fase 2 liberada mas ainda não paga
    prontasF2: usuarias.filter((u) => u.fase2Liberada && !u.fase2Paga)
      .sort((a, b) => a.diasSemAtividade - b.diasSemAtividade),
    // quase lá: 5+ dias de protocolo, ainda sem Fase 2 liberada, ativas
    quaseLa: usuarias.filter((u) => !u.fase2Liberada && u.dia >= 5 && u.diasSemAtividade <= 3)
      .sort((a, b) => b.dia - a.dia),
    // candidatas à Fase 3: pagaram F2 e seguem ativas
    candidatasF3: usuarias.filter((u) => u.fase2Paga && !u.fase3Paga)
      .sort((a, b) => a.diasSemAtividade - b.diasSemAtividade),
  };

  // ===== RISCO: sumidas há 2+ dias (mas que já começaram) =====
  const emRisco = usuarias
    .filter((u) => u.preparou && u.diasSemAtividade >= 2 && u.diasSemAtividade < 60)
    .sort((a, b) => b.diasSemAtividade - a.diasSemAtividade);

  return NextResponse.json({
    metricas: {
      total: nTotal,
      ativasHoje: new Set(cksHojeReais.map((c) => c.user_id)).size,
      checkinsHoje: cksHojeReais.length,
      pctPreparou: nTotal ? Math.round((funil.preparou / nTotal) * 100) : 0,
      pctDia7: nTotal ? Math.round((funil.dia7 / nTotal) * 100) : 0,
      fase2Liberadas: funil.fase2Liberada,
      compradoras: compradorasReais.length,
      nuncaAcessou,
      emRisco: emRisco.length,
      oportunidadesF2: oportunidades.prontasF2.length,
      // taxa de conversão Fase 2 (liberadas → pagas)
      conversaoF2: funil.fase2Liberada ? Math.round((funil.fase2Paga / funil.fase2Liberada) * 100) : 0,
    },
    funil,
    atividade14,
    compradorasStatus,
    oportunidades,
    emRisco,
    usuarias,
  });
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid" }, { status: 400 }); }
  if (!autz(body?.pin)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "supabase não configurado" }, { status: 500 });
  const { acao, id } = body;

  if (acao === "liberar_fase2") await db.from("profiles").update({ fase2_liberada_em: new Date().toISOString(), celebracao_vista: false }).eq("id", id);
  else if (acao === "bloquear_fase2") await db.from("profiles").update({ fase2_liberada_em: null }).eq("id", id);
  else if (acao === "marcar_fase2_paga") await db.from("profiles").update({ fase2_paga: true, fase_atual: 2 }).eq("id", id);
  else if (acao === "liberar_fase3") await db.from("profiles").update({ fase3_liberada_em: new Date().toISOString() }).eq("id", id);
  else if (acao === "ajustar_dia") {
    const dt = new Date(); dt.setDate(dt.getDate() - (body.dias || 0));
    await db.from("profiles").update({ receita_preparada_em: dt.toISOString() }).eq("id", id);
  }
  else if (acao === "nota") await db.from("notas_admin").insert({ user_id: id, texto: body.texto });
  else if (acao === "push") {
    // 📣 push individual: envia notificação para todos os aparelhos da usuária
    const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
    if (!VAPID_PRIVATE) return NextResponse.json({ error: "VAPID não configurado" }, { status: 500 });
    const webpush = (await import("web-push")).default;
    webpush.setVapidDetails("mailto:suporte@noctalev.app", VAPID_PUBLIC, VAPID_PRIVATE);
    const { data: subs } = await db.from("push_subscriptions").select("*").eq("user_id", id).eq("ativo", true);
    if (!subs?.length) return NextResponse.json({ error: "ela não ativou notificações" }, { status: 404 });
    let enviadas = 0;
    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: body.titulo || "🌙 NoctaLev", body: body.texto || "", url: body.url || "/" })
        );
        enviadas++;
      } catch (e) {
        if (e?.statusCode === 410 || e?.statusCode === 404) {
          await db.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        }
      }
    }
    return NextResponse.json({ ok: true, enviadas });
  }
  else if (acao === "add_compradora") await db.from("compradoras").upsert({ email: body.email?.trim().toLowerCase() }, { onConflict: "email" });
  else if (acao === "salvar_config") {
    // body.config = { progressao: {...}, checkout: {...}, suporte: {...} }
    const entradas = Object.entries(body.config || {});
    for (const [chave, valor] of entradas) {
      await db.from("configuracoes").upsert({ chave, valor, atualizado_em: new Date().toISOString() }, { onConflict: "chave" });
    }
  }
  else return NextResponse.json({ error: "ação desconhecida" }, { status: 400 });

  return NextResponse.json({ ok: true });
}
