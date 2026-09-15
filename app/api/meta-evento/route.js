// ============================================================
// Espelho server-side dos eventos do pixel (Meta CAPI)
// O navegador dispara fbq(...) com um eventID e manda o MESMO id
// para cá — a Meta desduplica por event_name + event_id.
// CORS liberado para noctalev.online (VSL/oferta estáticas).
// ============================================================
import { NextResponse } from "next/server";
import { enviarEventoMeta, hashMeta } from "../../../lib/metaCapi";

export const dynamic = "force-dynamic";

const ORIGENS = [
  "https://noctalev.online",
  "https://www.noctalev.online",
  "https://noctalev.vercel.app",
];

function cors(req) {
  const o = req.headers.get("origin") || "";
  const permitida = ORIGENS.includes(o) ? o : ORIGENS[0];
  return {
    "Access-Control-Allow-Origin": permitida,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(req) {
  return new NextResponse(null, { status: 204, headers: cors(req) });
}

const EVENTOS_PERMITIDOS = ["InitiateCheckout", "ViewContent", "PageView", "Lead"];

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "json" }, { status: 400, headers: cors(req) }); }

  const nome = String(body?.event_name || "");
  if (!EVENTOS_PERMITIDOS.includes(nome)) {
    return NextResponse.json({ error: "evento não permitido" }, { status: 400, headers: cors(req) });
  }
  const eventId = String(body?.event_id || "").slice(0, 80);
  if (!eventId) return NextResponse.json({ error: "event_id obrigatório" }, { status: 400, headers: cors(req) });

  // sinais do usuário: IP e UA vêm da própria requisição; fbp/fbc do navegador
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || undefined;
  const ua = req.headers.get("user-agent") || undefined;

  const user_data = {
    client_ip_address: ip,
    client_user_agent: ua,
  };
  if (body.fbp) user_data.fbp = String(body.fbp).slice(0, 120);
  if (body.fbc) user_data.fbc = String(body.fbc).slice(0, 200);
  if (body.email) user_data.em = [hashMeta(body.email)];

  const evt = {
    event_name: nome,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: "website",
    event_source_url: String(body.event_source_url || "https://noctalev.online/").slice(0, 500),
    user_data,
  };

  // custom_data: value numérico + currency BRL sempre que houver valor
  const cd = {};
  const valor = Number(body.value);
  if (Number.isFinite(valor) && valor > 0) { cd.value = valor; cd.currency = "BRL"; }
  if (body.content_name) cd.content_name = String(body.content_name).slice(0, 120);
  if (Object.keys(cd).length) evt.custom_data = cd;

  const r = await enviarEventoMeta(evt, body.test_event_code);
  return NextResponse.json({ ok: true, enviado: !r?.skipped }, { headers: cors(req) });
}
