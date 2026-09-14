// Verifica se um e-mail tem o NoctaLev Studio liberado (compra aprovada na Cakto).
// O webhook grava o marcador em configuracoes (chave studio:{email}, valor "1")
// e também tenta a coluna compradoras.studio_pago (se existir).
// GET/POST { email } → { liberado: true|false }
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

async function verificar(email) {
  const db = supabaseAdmin();
  if (!db) return false;

  // 1) marcador em configuracoes (sempre existe — é o caminho garantido)
  const { data: cfg } = await db.from("configuracoes")
    .select("valor").eq("chave", `studio:${email}`).maybeSingle();
  if (cfg) return cfg.valor === "1";

  // 2) coluna studio_pago em compradoras (se já foi criada)
  try {
    const { data: comp, error } = await db.from("compradoras")
      .select("studio_pago").eq("email", email).maybeSingle();
    if (!error && comp?.studio_pago) return true;
  } catch {}

  return false;
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ liberado: false }); }
  const email = body?.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) return NextResponse.json({ liberado: false });
  const liberado = await verificar(email);
  return NextResponse.json({ liberado });
}
