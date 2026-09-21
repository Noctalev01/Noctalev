// ============================================================
// SINCRONIZAÇÃO AUTOMÁTICA COM A CAKTO (rede de segurança do webhook)
//
// Roda a cada hora pelo cron da Vercel (vercel.json). Puxa os pedidos pagos
// das últimas horas na API oficial da Cakto e libera o acesso de qualquer
// compradora que ainda não esteja na lista — qualquer produto/variante.
// Assim, mesmo que o webhook falhe ou uma variante nova seja criada sem
// avisar ninguém, o acesso sai automaticamente em até 1 hora.
//
// ?completo=1 → varre TODO o histórico (útil uma vez, ou pelo botão do admin)
// Segurança: header "Authorization: Bearer CRON_SECRET" (Vercel envia) ou ?pin=ADMIN_PIN
// ============================================================
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { credenciaisCakto, tokenCakto, liberarPedidoNoApp, pedidoValido } from "../../../../lib/cakto";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req) {
  const url = new URL(req.url);
  const auth = req.headers.get("authorization") || "";
  const segredo = process.env.CRON_SECRET;
  const pinOk = url.searchParams.get("pin") && url.searchParams.get("pin") === (process.env.ADMIN_PIN || "2026");
  if (!pinOk && segredo && auth !== `Bearer ${segredo}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "supabase não configurado" }, { status: 500 });

  const cred = await credenciaisCakto(db);
  if (!cred) return NextResponse.json({ ok: false, motivo: "Chaves da Cakto não configuradas — cole no /admin (aba Compradoras → Sincronizar)." });

  try {
    const token = await tokenCakto(cred.clientId, cred.clientSecret);
    const completo = url.searchParams.get("completo") === "1";
    // janela: últimas 36h (folga generosa para o cron de 1h) — ou tudo, se completo
    const desde = new Date(Date.now() - 36 * 3600 * 1000).toISOString().slice(0, 19);
    let urlPag = `https://api.cakto.com.br/public_api/orders/?status=paid,in_settlement,authorized,partially_paid&limit=100&ordering=-paidAt`
      + (completo ? "" : `&updatedAt__gte=${encodeURIComponent(desde)}`);

    let paginas = 0, pedidos = 0, novas = 0;
    const liberadas = [];
    while (urlPag && paginas < (completo ? 60 : 10)) {
      paginas++;
      const r = await fetch(urlPag, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.detail || "Erro ao listar pedidos na Cakto");
      for (const p of j.results || []) {
        if (!pedidoValido(p)) continue;
        pedidos++;
        const res = await liberarPedidoNoApp(db, p);
        if (res?.novo) { novas++; liberadas.push({ email: res.email, produto: res.produto }); }
      }
      urlPag = j.next || null;
    }
    // registra a última execução para o admin ver que está vivo
    try {
      await db.from("configuracoes").upsert(
        { chave: "cakto_sync_ultima", valor: { em: new Date().toISOString(), pedidos, novas, completo }, atualizado_em: new Date().toISOString() },
        { onConflict: "chave" }
      );
    } catch {}
    return NextResponse.json({ ok: true, completo, paginas, pedidos, novas, liberadas });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 502 });
  }
}
