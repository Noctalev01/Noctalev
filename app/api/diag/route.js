// DIAGNÓSTICO — mostra APENAS quais variáveis de ambiente existem (nunca os valores).
// Útil para depurar configuração na Vercel. Pode ser removida depois.
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ESPERADAS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_PIN",
  "CAKTO_WEBHOOK_SECRET",
  "GATE_BY_PURCHASE",
];

export async function GET() {
  const presentes = {};
  for (const k of ESPERADAS) {
    const v = process.env[k];
    presentes[k] = v ? `definida (${String(v).length} caracteres)` : "❌ FALTANDO";
  }
  // detecta nomes parecidos porém errados (typo, espaço, etc.) — só os NOMES, nunca valores
  const parecidas = Object.keys(process.env)
    .filter((k) => /SUPA|CAKTO|ADMIN|GATE/i.test(k) && !ESPERADAS.includes(k))
    .sort();
  return NextResponse.json({ esperadas: presentes, nomes_parecidos_encontrados: parecidas });
}
