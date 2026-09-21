// LOGIN INSTANTÂNEO SEM EMAIL — a cliente digita só o email e entra na hora.
// Fluxo: 1) valida se o email comprou (tabela compradoras, alimentada pelo webhook da Cakto)
//        2) cria a conta se ainda não existir (já confirmada, sem senha)
//        3) gera um token de sessão no servidor (generateLink) e devolve para o app
//        4) o app troca o token por uma sessão real — sem enviar nenhum email!
// Se GATE_BY_PURCHASE=false, qualquer email entra (modo testes).
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { pedidosPagosPorEmail, liberarPedidoNoApp } from "../../../lib/cakto";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ erro: "requisição inválida" }, { status: 400 }); }
  const email = body?.email?.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, motivo: "Digite um email válido." }, { status: 400 });
  }

  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, motivo: "Servidor sem configuração. Tente mais tarde." }, { status: 500 });

  // 1) Gate de compra (só quem comprou na Cakto entra)
  //    Reembolso remove a linha de compradoras (via webhook), então basta checar existência.
  //    FALLBACK AUTOMÁTICO: se o email não está na lista (webhook não pegou — ex.: produto/
  //    variante criado antes de configurar o webhook), consulta a API oficial da Cakto na hora.
  //    Se há pedido pago, libera e deixa entrar — sem precisar de ninguém do suporte.
  if (process.env.GATE_BY_PURCHASE === "true") {
    const { data: compra } = await db.from("compradoras").select("email").eq("email", email).maybeSingle();
    if (!compra) {
      let liberouAgora = false;
      try {
        const pedidos = await pedidosPagosPorEmail(db, email);
        for (const p of pedidos) {
          const r = await liberarPedidoNoApp(db, p);
          if (r) liberouAgora = true;
        }
      } catch (e) {
        // Cakto fora do ar / sem credenciais → segue para a recusa normal
        console.error("[entrar] fallback Cakto falhou:", e?.message || e);
      }
      if (!liberouAgora) {
        return NextResponse.json({
          ok: false,
          motivo: "Não encontramos uma compra com este email. Use o MESMO email da compra na Cakto ou fale com o suporte. 💛",
        }, { status: 403 });
      }
    }
  }

  // 2) Garante que a conta existe (criada já confirmada, sem senha)
  //    generateLink falha se o usuário não existir, então tentamos criar antes (idempotente).
  const { error: createErr } = await db.auth.admin.createUser({ email, email_confirm: true });
  if (createErr && !String(createErr.message || "").toLowerCase().includes("already")) {
    // erro diferente de "já existe" — reporta
    if (createErr.status !== 422) {
      return NextResponse.json({ ok: false, motivo: "Não foi possível criar sua conta: " + createErr.message }, { status: 500 });
    }
  }

  // 3) Gera o token de login no servidor — NENHUM email é enviado
  const { data, error } = await db.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data?.properties?.hashed_token) {
    return NextResponse.json({ ok: false, motivo: "Não foi possível gerar seu acesso: " + (error?.message || "tente de novo") }, { status: 500 });
  }

  // 4) Devolve o token — o app troca por sessão com verifyOtp (sem email!)
  return NextResponse.json({ ok: true, token_hash: data.properties.hashed_token });
}
