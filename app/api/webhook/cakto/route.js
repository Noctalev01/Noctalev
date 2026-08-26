// ============================================================
// Webhook da Cakto — libera acesso automático pós-compra
// Configure na Cakto: URL https://SEU-DOMINIO/api/webhook/cakto?secret=SEU_SEGREDO
// Eventos: compra aprovada (Fase 1, Fase 2, Fase 3)
// ============================================================
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function extrairEmail(body) {
  // Cobre os formatos mais comuns de payload da Cakto/checkouts BR
  return (
    body?.customer?.email ||
    body?.data?.customer?.email ||
    body?.client?.email ||
    body?.email ||
    body?.buyer?.email ||
    null
  );
}

function extrairProduto(body) {
  const nome = (
    body?.product?.name ||
    body?.data?.product?.name ||
    body?.product_name ||
    body?.offer?.name ||
    ""
  ).toLowerCase();
  if (nome.includes("fase 3") || nome.includes("fase3")) return "fase3";
  if (nome.includes("fase 2") || nome.includes("fase2")) return "fase2";
  return "fase1";
}

function extrairStatus(body) {
  const st = (
    body?.status ||
    body?.data?.status ||
    body?.event ||
    body?.type ||
    ""
  ).toString().toLowerCase();
  const aprovado = ["approved", "paid", "purchase_approved", "compra aprovada", "aprovada", "completed"];
  const reembolso = ["refunded", "refund", "chargeback", "reembolso", "estornada"];
  if (reembolso.some((k) => st.includes(k))) return "reembolso";
  if (aprovado.some((k) => st.includes(k)) || st === "") return "aprovado";
  return "outro";
}

export async function POST(req) {
  // valida segredo compartilhado (query ?secret= ou header)
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") || req.headers.get("x-webhook-secret");
  if (!process.env.CAKTO_WEBHOOK_SECRET || secret !== process.env.CAKTO_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

  const email = extrairEmail(body)?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "email não encontrado no payload" }, { status: 400 });

  const produto = extrairProduto(body);
  const status = extrairStatus(body);
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "supabase não configurado" }, { status: 500 });

  if (status === "reembolso") {
    // remove acesso da fase reembolsada
    if (produto === "fase1") {
      await db.from("compradoras").delete().eq("email", email);
    } else {
      await db.from("compradoras").update({
        [produto === "fase2" ? "fase2_paga" : "fase3_paga"]: false,
        atualizado_em: new Date().toISOString(),
      }).eq("email", email);
      // reflete no perfil se a usuária já existe
      const { data: prof } = await db.from("profiles").select("id").eq("email", email).maybeSingle();
      if (prof) await db.from("profiles").update({ [produto === "fase2" ? "fase2_paga" : "fase3_paga"]: false }).eq("id", prof.id);
    }
    return NextResponse.json({ ok: true, acao: "reembolso", email, produto });
  }

  if (status !== "aprovado") return NextResponse.json({ ok: true, acao: "ignorado", status });

  // compra aprovada → registra/atualiza compradora
  const patch = { email, atualizado_em: new Date().toISOString() };
  if (produto === "fase2") patch.fase2_paga = true;
  if (produto === "fase3") patch.fase3_paga = true;
  if (produto === "fase1") patch.produto = "fase1";
  await db.from("compradoras").upsert(patch, { onConflict: "email" });

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

  return NextResponse.json({ ok: true, acao: "liberado", email, produto });
}
