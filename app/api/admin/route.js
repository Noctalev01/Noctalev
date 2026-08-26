// API do painel admin — usa service_role no servidor, protegida por PIN.
// GET  ?pin=XXXX&acao=lista            → todas as usuárias com métricas
// GET  ?pin=XXXX&acao=detalhe&id=UUID  → perfil completo + check-ins + rituais
// POST { pin, acao, id, ... }          → ações manuais
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

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
    (cks || []).forEach((c) => linhas.push([
      c.profiles?.nome || "", c.profiles?.email || "", c.data,
      c.sono_qualidade, c.horas_sono, c.acordou_madrugada ? "sim" : "nao", c.peso ?? "",
    ]));
    const csv = "\uFEFF" + linhas.map((l) => l.join(";")).join("\n");
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv;charset=utf-8", "Content-Disposition": "attachment; filename=noctalev_checkins.csv" },
    });
  }

  // lista (dashboard)
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const [{ data: perfis }, { data: cksHoje }, { data: todosCks }, { data: compradoras }] = await Promise.all([
    db.from("profiles").select("*").order("criado_em", { ascending: false }),
    db.from("checkins").select("user_id").eq("data", hoje),
    db.from("checkins").select("user_id, data, peso"),
    db.from("compradoras").select("*"),
  ]);

  const porUser = {};
  (todosCks || []).forEach((c) => {
    porUser[c.user_id] = porUser[c.user_id] || { n: 0, ultimo: null, ultimoPeso: null };
    porUser[c.user_id].n++;
    if (!porUser[c.user_id].ultimo || c.data > porUser[c.user_id].ultimo) {
      porUser[c.user_id].ultimo = c.data;
      if (c.peso != null) porUser[c.user_id].ultimoPeso = Number(c.peso);
    }
  });

  const usuarias = (perfis || []).map((p) => {
    const st = porUser[p.id] || { n: 0, ultimo: null, ultimoPeso: null };
    const diaProt = p.receita_preparada_em
      ? Math.max(1, Math.round((new Date(hoje) - new Date(p.receita_preparada_em.slice(0, 10))) / 86400000) + 1)
      : 0;
    return {
      id: p.id, nome: p.nome, email: p.email,
      dia: diaProt, fase: p.fase_atual || 1,
      checkins: st.n, ultimoCheckin: st.ultimo,
      pesoInicial: p.peso_inicial != null ? Number(p.peso_inicial) : null,
      pesoAtual: st.ultimoPeso,
      pontos: p.pontos || 0,
      preparou: !!p.receita_preparada_em,
      fase2Liberada: !!p.fase2_liberada_em,
      fase2Paga: !!p.fase2_paga,
      inativa: !st.ultimo || (new Date(hoje) - new Date(st.ultimo)) / 86400000 >= 3,
      criadoEm: p.criado_em,
    };
  });

  return NextResponse.json({
    metricas: {
      total: usuarias.length,
      ativasHoje: new Set((cksHoje || []).map((c) => c.user_id)).size,
      checkinsHoje: (cksHoje || []).length,
      pctPreparou: usuarias.length ? Math.round((usuarias.filter((u) => u.preparou).length / usuarias.length) * 100) : 0,
      pctDia7: usuarias.length ? Math.round((usuarias.filter((u) => u.dia >= 7).length / usuarias.length) * 100) : 0,
      fase2Liberadas: usuarias.filter((u) => u.fase2Liberada).length,
      compradoras: (compradoras || []).length,
    },
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
