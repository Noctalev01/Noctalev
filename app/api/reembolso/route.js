// ============================================================
// Pedido de reembolso — direto da página de vendas (/oferta)
// A cliente digita o email da compra e o pedido fica registrado
// para o admin processar na Cakto. Prova pública de que o
// reembolso é simples: um campo, um botão.
// ============================================================
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, motivo: "Requisição inválida." }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!email || !email.includes("@") || email.length > 200) {
    return NextResponse.json({ ok: false, motivo: "Digite o email que você usou na compra." }, { status: 400 });
  }

  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, motivo: "Servidor indisponível. Escreva para suporte@noctalev.app." }, { status: 500 });

  const registro = {
    email,
    motivo: String(body.motivo || "").slice(0, 500) || null,
    criado_em: new Date().toISOString(),
    status: "pendente",
  };

  // tenta a tabela dedicada; se ela ainda não existir, guarda em
  // "configuracoes" (chave única por email+hora) para nunca perder o pedido
  const { error } = await db.from("reembolsos").insert(registro);
  if (error) {
    await db.from("configuracoes").upsert(
      {
        chave: `reembolso:${email}`,
        valor: registro,
        atualizado_em: registro.criado_em,
      },
      { onConflict: "chave" }
    );
  }

  return NextResponse.json({ ok: true });
}
