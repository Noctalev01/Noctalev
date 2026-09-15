// ============================================================
// Meta Conversions API (server-side) — Pixel 3045648935777848
// Regras:
//  - value sempre numérico + currency "BRL" em eventos com valor
//  - event_id único por evento (dedupe casa por event_name+event_id)
//  - user_data com máximo de sinais (em/ph hasheados, ip, ua, fbp, fbc)
// Requer META_CAPI_TOKEN (Gerenciador de Eventos → Configurações →
// API de Conversões → Gerar token). Sem token, loga e não envia.
// ============================================================
import crypto from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID || "3045648935777848";
const TOKEN = process.env.META_CAPI_TOKEN || "";

// hash SHA-256 exigido pela Meta para dados pessoais (email, fone, nome)
export function hashMeta(v) {
  if (!v) return undefined;
  return crypto.createHash("sha256").update(String(v).trim().toLowerCase()).digest("hex");
}

// telefone: só dígitos, com DDI 55 se faltar
export function hashTelefone(t) {
  if (!t) return undefined;
  let d = String(t).replace(/\D/g, "");
  if (d.length >= 10 && d.length <= 11) d = "55" + d;
  return hashMeta(d);
}

/**
 * Envia 1 evento para a Meta CAPI.
 * @param {object} evt  evento no formato da Meta (event_name, event_id, ...)
 * @param {string} [testCode]  test_event_code (aba Testar eventos)
 */
export async function enviarEventoMeta(evt, testCode) {
  if (!TOKEN) {
    console.warn("[meta-capi] META_CAPI_TOKEN ausente — evento NÃO enviado:", evt?.event_name, evt?.event_id);
    return { skipped: true, reason: "sem token" };
  }
  const body = { data: [evt] };
  const tc = testCode || process.env.META_TEST_EVENT_CODE;
  if (tc) body.test_event_code = tc;
  try {
    const r = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(TOKEN)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    const j = await r.json().catch(() => ({}));
    if (!r.ok) console.warn("[meta-capi] erro:", JSON.stringify(j));
    else console.log("[meta-capi] ok:", evt.event_name, evt.event_id);
    return j;
  } catch (e) {
    console.warn("[meta-capi] falha de rede:", e?.message);
    return { error: e?.message };
  }
}
