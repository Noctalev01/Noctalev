// ============================================================
// Salva (ou remove) a inscrição de PUSH da usuária.
// É isso que permite a notificação chegar MESMO COM O APP FECHADO:
// o navegador registra um "endereço de entrega" (subscription) e o
// nosso cron manda a mensagem por ele nos horários certos.
// Tabela: push_subscriptions (endpoint único por aparelho).
// ============================================================
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, motivo: "sem config" }, { status: 500 });

  // remover inscrição (usuária desligou notificações)
  if (body?.remover && body?.endpoint) {
    await db.from("push_subscriptions").delete().eq("endpoint", body.endpoint);
    return NextResponse.json({ ok: true });
  }

  const sub = body?.subscription;
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ ok: false, motivo: "inscrição inválida" }, { status: 400 });
  }

  const linha = {
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
    user_id: body?.userId || null,
    nome: body?.nome || null,
    hora_checkin: body?.horaCheckin || "08:30",
    hora_ritual: body?.horaRitual || "21:30",
    ativo: true,
    atualizado_em: new Date().toISOString(),
  };

  const { error } = await db.from("push_subscriptions").upsert(linha, { onConflict: "endpoint" });
  if (error) {
    console.warn("push/salvar:", error.message);
    return NextResponse.json({ ok: false, motivo: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
