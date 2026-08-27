// ============================================================
// CRON DE NOTIFICAÇÕES — roda no servidor da Vercel nos horários
// agendados (vercel.json) e envia push para TODOS os aparelhos
// inscritos, MESMO COM O APP FECHADO. Esta é a correção real do
// "lembrete das 8:30 que não chegava".
//
// ?tipo=manha → frase do dia + convite ao check-in (≈ 08:30 BRT)
// ?tipo=noite → lembrete do chá/ritual          (≈ 21:30 BRT)
//
// Inteligência:
// - manhã: se a usuária JÁ fez o check-in hoje, manda só a frase.
// - noite: se a usuária JÁ fez o ritual hoje, NÃO manda nada.
// - inscrições mortas (410/404) são removidas automaticamente.
// ============================================================
import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { fraseDeHoje, hojeSaoPaulo } from "../../../../lib/frases";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BOubL_ioRi0mvZCrVaYlwkOI1FNE7BtmtfNcPaBEPrxgWQE7FhLMjL2J_uwvj94cqsgSkI6_dxQGg4xIOaxhh8E";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

export async function GET(req) {
  // segurança: só a Vercel (cron) ou quem tem o segredo pode disparar
  const auth = req.headers.get("authorization") || "";
  const segredo = process.env.CRON_SECRET;
  if (segredo && auth !== `Bearer ${segredo}`) {
    return NextResponse.json({ ok: false, motivo: "não autorizado" }, { status: 401 });
  }

  if (!VAPID_PRIVATE) {
    return NextResponse.json({ ok: false, motivo: "VAPID_PRIVATE_KEY não configurada na Vercel" }, { status: 500 });
  }
  webpush.setVapidDetails("mailto:suporte@noctalev.app", VAPID_PUBLIC, VAPID_PRIVATE);

  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, motivo: "sem config" }, { status: 500 });

  const tipo = new URL(req.url).searchParams.get("tipo") === "noite" ? "noite" : "manha";
  const hoje = hojeSaoPaulo();

  const { data: subs, error } = await db.from("push_subscriptions").select("*").eq("ativo", true);
  if (error) return NextResponse.json({ ok: false, motivo: error.message }, { status: 500 });
  if (!subs?.length) return NextResponse.json({ ok: true, enviadas: 0, motivo: "nenhuma inscrição" });

  // quem já fez check-in / ritual hoje (para personalizar ou pular)
  const userIds = [...new Set(subs.map((s) => s.user_id).filter(Boolean))];
  let fezCheckin = new Set(), fezRitual = new Set();
  if (userIds.length) {
    const [{ data: cks }, { data: rits }] = await Promise.all([
      db.from("checkins").select("user_id").eq("data", hoje).in("user_id", userIds),
      db.from("rituais").select("user_id").eq("data", hoje).in("user_id", userIds),
    ]);
    fezCheckin = new Set((cks || []).map((c) => c.user_id));
    fezRitual = new Set((rits || []).map((r) => r.user_id));
  }

  let enviadas = 0, removidas = 0, puladas = 0;
  const frase = fraseDeHoje();

  for (const sub of subs) {
    const nome = sub.nome ? `, ${sub.nome}` : "";
    let payload;

    if (tipo === "manha") {
      payload = fezCheckin.has(sub.user_id)
        ? { title: `💛 Sua frase de hoje${nome}`, body: frase, url: "/" }
        : { title: `☀️ Bom dia${nome}!`, body: `${frase}\nRegistre sua noite em poucos toques (+10 pontos ⭐)`, url: "/checkin" };
    } else {
      if (sub.user_id && fezRitual.has(sub.user_id)) { puladas++; continue; } // já fez o ritual → não incomoda
      payload = { title: `🍵 Hora do seu chá da noite${nome}`, body: "Seu chá morno + luz baixa. Leva 3 minutinhos e vale +5 pontos ⭐", url: "/ritual" };
    }

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      );
      enviadas++;
    } catch (e) {
      const status = e?.statusCode;
      if (status === 404 || status === 410) {
        // aparelho desinscreveu / inscrição expirou → limpa
        await db.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        removidas++;
      } else {
        console.warn("push/cron:", status, e?.message);
      }
    }
  }

  return NextResponse.json({ ok: true, tipo, enviadas, puladas, removidas, total: subs.length });
}
