"use client";
// ============================================================
// Barberina ES — estado local-first + Supabase (supabase/BARBERINA-ES-COMPLETO.sql)
// Acesso: LINK PRÓPRIO /a/<token> (criado pela equipe) ou EMAIL em /entrar.
// O nome vem pronto do banco — a clienta não digita nada.
// Tudo fica BLOQUEADO até a equipe marcar o pedido como 'entregado'.
// ============================================================
import { supabase } from "./supabase";
import { hoyMadrid, diffDias, sumarDias, lunesDe } from "./fechas";

const KEY = "barberina_es_v2";

function inicial() {
  return {
    token: null,
    perfil: null, // {nombre, ciudad, pesoInicial, objetivo, altura, edad, avatar, publico, creadoEn}
    frasco: { estado: "esperando", recibidoEn: null, envio: null },
    registros: {}, // { "2026-10-07": {peso, sueno, despertares, energia, antojos, tomo, nota} }
    vistos: {},
  };
}

export function load() {
  if (typeof window === "undefined") return inicial();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return inicial();
    return { ...inicial(), ...JSON.parse(raw) };
  } catch {
    return inicial();
  }
}
export function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  return s;
}
export function logout() {
  try { localStorage.removeItem(KEY); localStorage.removeItem("barberina_es_v1"); } catch {}
}

export const frascoRecibido = (s) => s?.frasco?.estado === "recibido";
export const hayBackend = () => !!supabase;
// perfil completo = já informou o peso inicial (o nome vem do banco)
export const perfilCompleto = (s) => !!(s?.perfil?.nombre && s?.perfil?.pesoInicial);

// timeout para nenhuma chamada travar a tela
function conTiempo(promesa, ms = 8000) {
  return Promise.race([promesa, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
}
async function rpc(nome, params) {
  if (!supabase) return null;
  try {
    const { data, error } = await conTiempo(supabase.rpc(nome, params));
    if (error) throw error;
    return data;
  } catch (e) {
    console.warn(nome, "falhou:", e?.message || e);
    return { __error: e?.message || String(e) };
  }
}

function aplicarClienta(s, c) {
  s.perfil = {
    ...(s.perfil || {}),
    nombre: c.nombre,
    ciudad: c.ciudad || s.perfil?.ciudad || "",
    pesoInicial: c.peso_inicial != null ? Number(c.peso_inicial) : s.perfil?.pesoInicial || null,
    objetivo: c.objetivo != null ? Number(c.objetivo) : s.perfil?.objetivo || null,
    altura: c.altura != null ? Number(c.altura) : s.perfil?.altura || null,
    edad: c.edad ?? s.perfil?.edad ?? null,
    avatar: c.avatar || s.perfil?.avatar || "🌸",
    publico: c.publico !== false,
    creadoEn: String(c.creado_em || s.perfil?.creadoEn || new Date().toISOString()).slice(0, 10),
  };
  if (c.estado_envio === "entregado") {
    s.frasco = { estado: "recibido", recibidoEn: String(c.entregado_em || new Date().toISOString()).slice(0, 10), envio: "entregado" };
    // celebração só no dia da entrega (ao reentrar dias depois, não repete)
    if (s.frasco.recibidoEn < hoyMadrid()) s.vistos = { ...s.vistos, recibido: true };
  } else {
    s.frasco = { estado: "esperando", recibidoEn: null, envio: c.estado_envio || null };
  }
  return s;
}

// ---------------- acesso ----------------
const ERR = { link: "link", email: "email", cancelado: "cancelado" };

export async function accederToken(token) {
  token = String(token || "").trim();
  if (!token) return { ok: false, error: "link" };
  if (!supabase) {
    // modo demonstração (sem Supabase configurado)
    let s = load();
    if (s.token !== token) s = inicial();
    s.token = token;
    if (!s.perfil) s.perfil = { nombre: "María J.", ciudad: "Madrid", avatar: "🌸", publico: true, creadoEn: hoyMadrid() };
    save(s);
    return { ok: true, s };
  }
  const r = await rpc("bm_acceso", { p_token: token });
  if (!r || r.__error) return { ok: false, error: "red" };
  if (!r.ok) return { ok: false, error: ERR[r.error] || "link" };
  let s = load();
  if (s.token !== token) s = inicial();
  s.token = token;
  aplicarClienta(s, r.clienta);
  save(s);
  await pullRegistros();
  return { ok: true, s: load() };
}

export async function accederEmail(email) {
  email = String(email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "formato" };
  if (!supabase) return accederToken("demo-" + email.split("@")[0]);
  const r = await rpc("bm_acceso_email", { p_email: email });
  if (!r || r.__error) return { ok: false, error: "red" };
  if (!r.ok) return { ok: false, error: ERR[r.error] || "email" };
  return accederToken(r.clienta.token);
}

// atualiza dados da clienta (nome, estado do envio) — chamado ao abrir
export async function refrescarClienta() {
  const s = load();
  if (!s.token || !supabase) return { s };
  const r = await rpc("bm_acceso", { p_token: s.token });
  if (r?.ok) { aplicarClienta(s, r.clienta); save(s); }
  return { s: load() };
}

async function pullRegistros() {
  const s = load();
  if (!s.token || !supabase) return;
  const rows = await rpc("bm_mis_registros", { p_token: s.token });
  if (!Array.isArray(rows)) return;
  const st = load();
  for (const r of rows) {
    const f = String(r.fecha).slice(0, 10);
    st.registros[f] = {
      ...(st.registros[f] || {}),
      peso: r.peso != null ? Number(r.peso) : st.registros[f]?.peso ?? null,
      sueno: r.sueno ?? st.registros[f]?.sueno, despertares: r.despertares, energia: r.energia,
      antojos: r.antojos, tomo: r.tomo, nota: r.nota || "",
    };
  }
  save(st);
}

// ---------------- perfil ----------------
export function guardarPerfil(datos) {
  const s = load();
  s.perfil = { avatar: "🌸", publico: true, ...s.perfil, ...datos, creadoEn: s.perfil?.creadoEn || hoyMadrid() };
  save(s);
  rpc("bm_perfil", {
    p_token: s.token, p_peso_inicial: s.perfil.pesoInicial ?? null, p_objetivo: s.perfil.objetivo ?? null,
    p_altura: s.perfil.altura ?? null, p_edad: s.perfil.edad ?? null, p_avatar: s.perfil.avatar,
    p_publico: s.perfil.publico, p_ciudad: s.perfil.ciudad || null,
  });
  if (datos.pesoInicial && !Object.values(s.registros).some((r) => r.peso)) {
    s.registros[hoyMadrid()] = { ...(s.registros[hoyMadrid()] || {}), peso: datos.pesoInicial };
    save(s);
    rpc("bm_registrar", { p_token: s.token, p_fecha: hoyMadrid(), p_peso: datos.pesoInicial });
  }
  return s;
}

export function marcarVisto(clave) {
  const s = load();
  s.vistos = { ...s.vistos, [clave]: true };
  return save(s);
}

// ---------------- entrega ----------------
// A EQUIPE marca 'entregado' em bm_clientas (bm_marcar_envio). O app consulta
// bm_estado ao abrir, ao voltar ao app e a cada 60 s — sem código.
export async function comprobarEntrega() {
  const s = load();
  if (!s.token || frascoRecibido(s) || !supabase) return { recibido: frascoRecibido(s), s };
  const r = await rpc("bm_estado", { p_token: s.token });
  if (r?.ok && r.entregado) {
    const st = load();
    st.frasco = { estado: "recibido", recibidoEn: String(r.entregado_em || new Date().toISOString()).slice(0, 10), envio: "entregado" };
    save(st);
    return { recibido: true, nuevo: true, s: st };
  }
  if (r?.ok) {
    const st = load();
    st.frasco = { ...st.frasco, envio: r.estado };
    save(st);
  }
  return { recibido: false, s: load() };
}

// ---------------- registros ----------------
export function registrar(fecha, datos) {
  const s = load();
  s.registros[fecha] = { ...(s.registros[fecha] || {}), ...datos };
  save(s);
  rpc("bm_registrar", {
    p_token: s.token, p_fecha: fecha,
    p_peso: datos.peso ?? null, p_sueno: datos.sueno ?? null, p_despertares: datos.despertares ?? null,
    p_energia: datos.energia ?? null, p_antojos: datos.antojos ?? null, p_tomo: datos.tomo ?? null,
    p_nota: datos.nota || null,
  });
  return s;
}

export function registrosOrdenados(s) {
  return Object.entries(s.registros || {})
    .map(([fecha, r]) => ({ fecha, ...r }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}
export function pesoActual(s) {
  const p = registrosOrdenados(s).filter((r) => r.peso);
  return p.length ? p[p.length - 1].peso : s.perfil?.pesoInicial || null;
}
export function pesoPerdido(s) {
  const ini = s.perfil?.pesoInicial;
  const act = pesoActual(s);
  if (!ini || !act) return 0;
  return Math.max(0, Math.round((ini - act) * 10) / 10);
}
// días seguidos com registro (hoy ou ontem conta como vivo)
export function racha(s) {
  const hoy = hoyMadrid();
  let d = s.registros[hoy]?.sueno ? hoy : sumarDias(hoy, -1);
  let n = 0;
  while (s.registros[d]?.sueno) { n++; d = sumarDias(d, -1); }
  return n;
}
export function suenoMedio(s, dias = 7) {
  const hoy = hoyMadrid();
  const vals = [];
  for (let i = 0; i < dias; i++) {
    const r = s.registros[sumarDias(hoy, -i)];
    if (r?.sueno) vals.push(r.sueno);
  }
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}
export function diasRegistrados(s) {
  return Object.values(s.registros || {}).filter((r) => r.sueno).length;
}

// Dia do grupo (1 = dia em que entrou no app)
export function diaGrupo(s) {
  const ini = s.perfil?.creadoEn || hoyMadrid();
  return Math.max(1, diffDias(ini, hoyMadrid()) + 1);
}

// pontos da SEMANA (mesma fórmula da view app_ranking_semana)
// +10/dia registrado · +25/kg perdido na semana · +4/ponto de sono médio acima de 3 · +5/dia com cápsula
// regs: { fecha: {peso?, sueno?, tomo?} } — registros só de peso contam para o peso, não como dia.
export function puntosSemana(regs, hoy = hoyMadrid()) {
  const lunes = lunesDe(hoy);
  let dias = 0, suenoSum = 0, capsulas = 0, primero = null, ultimo = null;
  for (let i = 0; i < 7; i++) {
    const f = sumarDias(lunes, i);
    if (f > hoy) break;
    const r = regs[f];
    if (!r) continue;
    if (r.peso) { if (primero == null) primero = r.peso; ultimo = r.peso; }
    if (!r.sueno) continue;
    dias++;
    suenoSum += r.sueno;
    if (r.tomo) capsulas++;
  }
  const antes = Object.keys(regs).filter((f) => f < lunes && regs[f]?.peso).sort();
  const base = antes.length ? regs[antes[antes.length - 1]].peso : primero;
  const kgSemana = base && ultimo ? Math.max(0, Math.round((base - ultimo) * 10) / 10) : 0;
  const suenoMed = dias ? suenoSum / dias : 0;
  const puntos = dias * 10 + kgSemana * 25 + Math.max(0, suenoMed - 3) * 4 + capsulas * 5;
  return { puntos: Math.round(puntos), dias, kgSemana, suenoMedio: suenoMed, capsulas };
}
