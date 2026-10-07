"use client";
// ============================================================
// Barberina ES — estado local-first + sincronização Supabase (RPCs SQL-6/SQL-7)
// Regra central: quase tudo fica BLOQUEADO até o frasco ser recebido
// (pagamento contra-reembolso = só paga ao receber).
// ============================================================
import { supabase } from "./supabase";
import { CONFIG } from "./config";
import { hoyMadrid, diffDias, sumarDias, lunesDe } from "./fechas";

const KEY = "barberina_es_v1";

function inicial() {
  return {
    tel: null,
    pin: null,
    perfil: null, // {nombre, ciudad, pesoInicial, objetivo, altura, edad, avatar, publico, creadoEn}
    frasco: { estado: "esperando", recibidoEn: null }, // "esperando" | "recibido"
    registros: {}, // { "2026-10-07": {peso, sueno, despertares, energia, antojos, tomo, nota} }
    preparacion: {}, // checklist da espera { objetivo:true, instalar:true, consejo:true }
    vistos: {}, // flags de UI (celebración vista etc.)
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
  try { localStorage.removeItem(KEY); } catch {}
}

export const frascoRecibido = (s) => s?.frasco?.estado === "recibido";

// ---------------- teléfono / PIN ----------------
export function normalizarTel(t) {
  let d = String(t || "").replace(/\D/g, "");
  if (d.startsWith("0034")) d = d.slice(4);
  if (d.length === 11 && d.startsWith("34")) d = d.slice(2);
  return d;
}
export const telValido = (t) => /^[6789]\d{8}$/.test(normalizarTel(t));
export const pinValido = (p) => /^\d{4}$/.test(String(p || ""));

// Login: Supabase (RPC app_login) se configurado; senão local.
export async function login(telRaw, pin) {
  const tel = normalizarTel(telRaw);
  if (!telValido(tel)) return { ok: false, error: "telefono" };
  if (!pinValido(pin)) return { ok: false, error: "pin" };
  let s = load();
  // trocou de número neste aparelho → estado limpo
  if (s.tel && s.tel !== tel) s = inicial();

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc("app_login", { p_tel: tel, p_pin: pin });
      if (error) throw error;
      if (!data?.ok) return { ok: false, error: data?.error || "pin_incorrecto" };
      const u = data.usuaria || {};
      s.tel = tel; s.pin = pin;
      if (u.nombre && !s.perfil) {
        s.perfil = {
          nombre: u.nombre, ciudad: u.ciudad || "", pesoInicial: u.peso_inicial || null,
          objetivo: u.objetivo || null, altura: u.altura || null, edad: u.edad || null,
          avatar: u.avatar || "🌸", publico: u.publico !== false,
          creadoEn: (u.created_at || u.creado_en || new Date().toISOString()).slice(0, 10),
        };
      }
      // backend marcou entrega (crear_pedido / transportadora / Camila) → libera
      if (u.frasco_recibido_em && !frascoRecibido(s)) {
        s.frasco = { estado: "recibido", recibidoEn: String(u.frasco_recibido_em).slice(0, 10) };
      }
      save(s);
      pullRegistros(); // segundo plano
      return { ok: true, s };
    } catch (e) {
      // sem rede / SQL ainda não rodado → segue local (não trava a cliente)
      console.warn("app_login falhou, modo local:", e?.message || e);
    }
  }
  if (s.tel === tel && s.pin && s.pin !== pin) return { ok: false, error: "pin_incorrecto" };
  s.tel = tel; s.pin = pin;
  save(s);
  return { ok: true, s };
}

async function rpc(nome, params) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc(nome, params);
    if (error) throw error;
    return data;
  } catch (e) {
    console.warn(nome, "falhou:", e?.message || e);
    return null;
  }
}

async function pullRegistros() {
  const s = load();
  if (!s.tel) return;
  const rows = await rpc("app_mis_registros", { p_tel: s.tel, p_pin: s.pin });
  if (!Array.isArray(rows)) return;
  const st = load();
  for (const r of rows) {
    const f = String(r.fecha).slice(0, 10);
    if (!st.registros[f]) {
      st.registros[f] = {
        peso: r.peso != null ? Number(r.peso) : null, sueno: r.sueno, despertares: r.despertares,
        energia: r.energia, antojos: r.antojos, tomo: r.tomo, nota: r.nota || "",
      };
    }
  }
  save(st);
}

// ---------------- perfil ----------------
export function guardarPerfil(datos) {
  const s = load();
  s.perfil = {
    avatar: "🌸", publico: true, ...s.perfil, ...datos,
    creadoEn: s.perfil?.creadoEn || hoyMadrid(),
  };
  save(s);
  rpc("app_perfil", {
    p_tel: s.tel, p_pin: s.pin, p_nombre: s.perfil.nombre, p_ciudad: s.perfil.ciudad,
    p_objetivo: s.perfil.objetivo, p_altura: s.perfil.altura, p_edad: s.perfil.edad,
    p_avatar: s.perfil.avatar, p_publico: s.perfil.publico,
  });
  // peso inicial vira o 1º registro (só peso) — base da evolução
  if (datos.pesoInicial && !Object.keys(s.registros).length) {
    s.registros[hoyMadrid()] = { peso: datos.pesoInicial };
    save(s);
    rpc("app_registrar", { p_tel: s.tel, p_pin: s.pin, p_fecha: hoyMadrid(), p_peso: datos.pesoInicial });
  }
  return s;
}

export function marcarPreparacion(clave) {
  const s = load();
  s.preparacion = { ...s.preparacion, [clave]: true };
  return save(s);
}
export function marcarVisto(clave) {
  const s = load();
  s.vistos = { ...s.vistos, [clave]: true };
  return save(s);
}

// ---------------- frasco ----------------
export function codigoValido(c) {
  const x = String(c || "").trim().toUpperCase().replace(/\s+/g, "");
  return CONFIG.codigos.includes(x);
}
export async function confirmarFrasco(codigo) {
  if (!codigoValido(codigo)) return { ok: false };
  const s = load();
  s.frasco = { estado: "recibido", recibidoEn: hoyMadrid() };
  save(s);
  rpc("app_frasco_recibido", { p_tel: s.tel, p_pin: s.pin, p_codigo: String(codigo).trim().toUpperCase() });
  return { ok: true, s };
}

// ---------------- registros ----------------
export function registrar(fecha, datos) {
  const s = load();
  s.registros[fecha] = { ...(s.registros[fecha] || {}), ...datos };
  save(s);
  rpc("app_registrar", {
    p_tel: s.tel, p_pin: s.pin, p_fecha: fecha,
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
