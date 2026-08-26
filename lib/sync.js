"use client";
// ============================================================
// Sincronização localStorage ⇄ Supabase
// Estratégia: local-first (app funciona offline), com push/pull
// para a nuvem quando há sessão. O estado local continua sendo a
// fonte da UI; a nuvem é a fonte da verdade entre dispositivos.
// ============================================================
import { supabase } from "./supabase";
import { load, save, hojeSP } from "./store";

// ---------- PULL: nuvem → local (no login / abertura) ----------
export async function pullFromCloud(userId) {
  if (!supabase || !userId) return null;
  try {
    const [{ data: prof }, { data: cks }, { data: rits }, { data: conqs }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("checkins").select("*").eq("user_id", userId),
      supabase.from("rituais").select("*").eq("user_id", userId),
      supabase.from("conquistas").select("*").eq("user_id", userId),
    ]);
    if (!prof) return null; // primeiro acesso: ainda sem perfil → onboarding

    const s = load();
    s.perfil = {
      nome: prof.nome,
      email: prof.email || "",
      pesoInicial: prof.peso_inicial != null ? Number(prof.peso_inicial) : null,
      pesoMeta: prof.peso_meta != null ? Number(prof.peso_meta) : null,
      dificuldade: prof.perfil_dificuldade,
      refluxo: !!prof.refluxo,
      cafeina: !!prof.sensivel_cafeina,
      criadoEm: prof.criado_em,
    };
    s.receitaPreparadaEm = prof.receita_preparada_em;
    s.preparoIniciadoEm = prof.preparo_iniciado_em;
    s.fase2LiberadaEm = prof.fase2_liberada_em;
    s.fase2Paga = !!prof.fase2_paga;
    s.fase3LiberadaEm = prof.fase3_liberada_em;
    s.fase3Paga = !!prof.fase3_paga;
    s.pontos = prof.pontos || 0;
    s.celebracaoVista = !!prof.celebracao_vista;

    s.checkins = {};
    (cks || []).forEach((c) => {
      s.checkins[c.data] = {
        sono: c.sono_qualidade, horas: c.horas_sono, acordou: c.acordou_madrugada,
        peso: c.peso != null ? Number(c.peso) : null,
        criadoEm: c.criado_em, editadoEm: c.editado_em,
      };
    });
    s.rituais = {};
    (rits || []).forEach((r) => { s.rituais[r.data] = String(r.horario).slice(0, 5); });
    s.conquistas = {};
    (conqs || []).forEach((c) => { s.conquistas[c.tipo] = c.desbloqueada_em; });

    save(s);
    return s;
  } catch (e) {
    console.warn("pullFromCloud falhou (seguindo offline):", e?.message);
    return null;
  }
}

// ---------- PUSH: local → nuvem (após cada ação) ----------
export async function pushProfile(userId) {
  if (!supabase || !userId) return;
  const s = load();
  if (!s.perfil) return;
  try {
    await supabase.from("profiles").upsert({
      id: userId,
      nome: s.perfil.nome,
      email: s.perfil.email || null,
      peso_inicial: s.perfil.pesoInicial,
      peso_meta: s.perfil.pesoMeta,
      perfil_dificuldade: s.perfil.dificuldade,
      refluxo: s.perfil.refluxo,
      sensivel_cafeina: s.perfil.cafeina,
      receita_preparada_em: s.receitaPreparadaEm,
      preparo_iniciado_em: s.preparoIniciadoEm,
      fase2_liberada_em: s.fase2LiberadaEm,
      fase2_paga: s.fase2Paga,
      fase3_liberada_em: s.fase3LiberadaEm,
      fase3_paga: s.fase3Paga,
      pontos: s.pontos,
      celebracao_vista: s.celebracaoVista,
      fase_atual: s.fase2Paga ? 2 : 1,
    });
  } catch (e) { console.warn("pushProfile:", e?.message); }
}

export async function pushCheckin(userId, data) {
  if (!supabase || !userId) return;
  const s = load();
  const c = s.checkins[data];
  if (!c) return;
  try {
    await supabase.from("checkins").upsert({
      user_id: userId, data,
      sono_qualidade: c.sono, horas_sono: c.horas,
      acordou_madrugada: c.acordou, peso: c.peso,
      editado_em: new Date().toISOString(),
    }, { onConflict: "user_id,data" });
  } catch (e) { console.warn("pushCheckin:", e?.message); }
}

export async function pushRitual(userId, data) {
  if (!supabase || !userId) return;
  const s = load();
  const h = s.rituais[data];
  if (!h) return;
  try {
    await supabase.from("rituais").upsert(
      { user_id: userId, data, horario: h + ":00" },
      { onConflict: "user_id,data" }
    );
  } catch (e) { console.warn("pushRitual:", e?.message); }
}

export async function pushConquistas(userId) {
  if (!supabase || !userId) return;
  const s = load();
  const rows = Object.entries(s.conquistas).map(([tipo, em]) => ({
    user_id: userId, tipo, desbloqueada_em: em,
  }));
  if (!rows.length) return;
  try {
    await supabase.from("conquistas").upsert(rows, { onConflict: "user_id,tipo" });
  } catch (e) { console.warn("pushConquistas:", e?.message); }
}

// Push completo (perfil + dia de hoje + conquistas)
export async function pushAll(userId) {
  const d = hojeSP();
  await Promise.all([
    pushProfile(userId),
    pushCheckin(userId, d),
    pushRitual(userId, d),
    pushConquistas(userId),
  ]);
}

// Helper "dispare e esqueça": pega a sessão e sobe tudo para a nuvem.
export async function syncNow() {
  if (!supabase) return;
  try {
    const { data } = await supabase.auth.getSession();
    const uid = data?.session?.user?.id;
    if (uid) await pushAll(uid);
  } catch {}
}
