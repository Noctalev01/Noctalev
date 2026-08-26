// Verifica se um email tem acesso (comprou) ANTES de enviar o código de login.
// Se GATE_BY_PURCHASE=false, todo email é aceito (fase de testes).
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid" }, { status: 400 }); }
  const email = body?.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) return NextResponse.json({ permitido: false, motivo: "email inválido" });

  if (process.env.GATE_BY_PURCHASE !== "true") {
    return NextResponse.json({ permitido: true }); // gate desligado (testes)
  }

  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ permitido: true }); // fallback: não travar

  const { data } = await db.from("compradoras").select("email").eq("email", email).maybeSingle();
  return NextResponse.json({
    permitido: !!data,
    motivo: data ? null : "Não encontramos uma compra com este email. Use o mesmo email da compra ou fale com o suporte.",
  });
}
