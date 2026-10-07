// ============================================================
// GRUPO DE LA SEMANA — mesmo conceito da "turma" do app Brasil.
// - Perfis de roteiro, IGUAIS para todas as usuárias, ancorados no
//   dia em que a usuária entrou no app (dia 1 = fez o pedido).
// - No começo a MAIORIA está esperando o frasco chegar (COD).
//   O frasco de cada uma chega num dia diferente (dias 2–7);
//   algumas veteranas já receberam antes e mostram resultado.
// - Depois que recebe, a perda é rápida no começo (água/inchaço)
//   e desacelera — há casos de −1 kg no 1º dia.
// - A posição da usuária é REAL: mesma fórmula de pontos
//   da view app_ranking_semana aplicada aos dados dela.
// ============================================================
import { hoyMadrid, sumarDias, diffDias, lunesDe } from "./fechas";
import { puntosSemana, frascoRecibido, diaGrupo } from "./store";

function interp(marcos, x) {
  if (!marcos.length) return 0;
  if (x <= marcos[0][0]) return marcos[0][1];
  for (let i = 1; i < marcos.length; i++) {
    const [x1, y1] = marcos[i - 1], [x2, y2] = marcos[i];
    if (x <= x2) return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
  }
  return marcos[marcos.length - 1][1];
}

// curvas de perda acumulada (kg) por dia DESDE a entrega (k=0 dia da entrega, 1ª cápsula à noite)
const CURVA = {
  // "explosiva": −1 kg já na 1ª manhã
  rayo: [[0, 0], [1, 1.0], [2, 1.5], [3, 1.9], [5, 2.5], [7, 3.1], [10, 3.7], [14, 4.5], [21, 5.6], [30, 6.8], [60, 9.4]],
  rayo2: [[0, 0], [1, 1.2], [2, 1.6], [3, 2.0], [5, 2.6], [7, 3.0], [10, 3.6], [14, 4.2], [21, 5.2], [30, 6.3], [60, 8.8]],
  rapida: [[0, 0], [1, 0.7], [2, 1.1], [3, 1.4], [5, 2.0], [7, 2.6], [10, 3.2], [14, 3.9], [21, 4.9], [30, 5.9], [60, 8.2]],
  media: [[0, 0], [1, 0.5], [2, 0.8], [3, 1.1], [5, 1.6], [7, 2.1], [10, 2.6], [14, 3.2], [21, 4.1], [30, 5.0], [60, 7.1]],
  // meseta nos dias 6–9 (realista)
  meseta: [[0, 0], [1, 0.6], [2, 0.9], [4, 1.4], [6, 1.8], [9, 1.8], [12, 2.5], [14, 2.9], [21, 3.8], [30, 4.7], [60, 6.6]],
  lenta: [[0, 0], [1, 0.3], [2, 0.5], [4, 0.9], [7, 1.4], [10, 1.9], [14, 2.4], [21, 3.2], [30, 4.0], [60, 5.8]],
};

// sono (1–5) por dias desde a entrega; antes da entrega dormem mal
const SUENO = {
  bueno: [[0, 2.4], [2, 3.4], [5, 4.1], [10, 4.6], [20, 4.8]],
  normal: [[0, 2.2], [3, 3.0], [7, 3.8], [14, 4.3], [21, 4.5]],
  lento: [[0, 2.0], [4, 2.7], [9, 3.4], [16, 4.0], [25, 4.3]],
};

// entrega = dia do grupo em que o frasco chega (≤0 = já tinha recebido antes da usuária entrar)
// salta = a cada quantos dias falha o registro (0 = nunca falha)
export const MIEMBROS = [
  // ---------- veteranas: já receberam (prova social desde o dia 1) ----------
  { id: "mcarmen", nombre: "M.ª Carmen R.", ciudad: "Sevilla", edad: 54, avatar: "🌻", peso: 86.4, entrega: -9, curva: "rapida", sueno: "bueno", salta: 0 },
  { id: "ana", nombre: "Ana P.", ciudad: "Pontevedra", edad: 49, avatar: "🌷", peso: 79.8, entrega: -6, curva: "rayo2", sueno: "bueno", salta: 9 },
  { id: "rosa", nombre: "Rosa M.", ciudad: "Valencia", edad: 58, avatar: "🌹", peso: 91.2, entrega: -3, curva: "media", sueno: "normal", salta: 6 },
  // recebeu na véspera da usuária entrar → no dia 1 já aparece "−1,1 kg no 1º dia"
  { id: "carmenv", nombre: "Carmen V.", ciudad: "Cádiz", edad: 48, avatar: "🌺", peso: 83.9, entrega: 0, curva: "rayo2", sueno: "bueno", salta: 0 },
  // ---------- esperando: chega amanhã (dia 2) ----------
  { id: "lucia", nombre: "Lucía G.", ciudad: "Madrid", edad: 46, avatar: "🦋", peso: 82.5, entrega: 2, curva: "rayo", sueno: "bueno", salta: 0 },
  { id: "pilar", nombre: "Pilar S.", ciudad: "Zaragoza", edad: 61, avatar: "🌿", peso: 88.0, entrega: 2, curva: "media", sueno: "normal", salta: 8 },
  // ---------- dia 3 ----------
  { id: "isabel", nombre: "Isabel F.", ciudad: "Málaga", edad: 52, avatar: "🌼", peso: 84.7, entrega: 3, curva: "rayo2", sueno: "bueno", salta: 0 },
  { id: "montse", nombre: "Montse V.", ciudad: "Barcelona", edad: 50, avatar: "🍀", peso: 77.9, entrega: 3, curva: "meseta", sueno: "normal", salta: 7 },
  { id: "elena", nombre: "Elena C.", ciudad: "Bilbao", edad: 44, avatar: "💜", peso: 74.6, entrega: 3, curva: "rapida", sueno: "bueno", salta: 10 },
  // ---------- dia 4 ----------
  { id: "conchi", nombre: "Conchi L.", ciudad: "Murcia", edad: 57, avatar: "🌺", peso: 93.5, entrega: 4, curva: "rayo", sueno: "normal", salta: 0 },
  { id: "marisa", nombre: "Marisa T.", ciudad: "Valladolid", edad: 55, avatar: "🍓", peso: 81.3, entrega: 4, curva: "media", sueno: "lento", salta: 5 },
  { id: "raquel", nombre: "Raquel B.", ciudad: "Alicante", edad: 41, avatar: "✨", peso: 72.8, entrega: 4, curva: "lenta", sueno: "normal", salta: 6 },
  // ---------- dia 5 ----------
  { id: "dolores", nombre: "Dolores A.", ciudad: "Córdoba", edad: 63, avatar: "🌸", peso: 89.9, entrega: 5, curva: "rapida", sueno: "lento", salta: 0 },
  { id: "silvia", nombre: "Silvia N.", ciudad: "Gijón", edad: 47, avatar: "🌙", peso: 78.4, entrega: 5, curva: "rayo2", sueno: "bueno", salta: 8 },
  { id: "yolanda", nombre: "Yolanda P.", ciudad: "Granada", edad: 53, avatar: "🍋", peso: 85.1, entrega: 5, curva: "meseta", sueno: "normal", salta: 0 },
  // ---------- dia 6–7 (as últimas) ----------
  { id: "teresa", nombre: "Teresa D.", ciudad: "Salamanca", edad: 59, avatar: "🌾", peso: 87.6, entrega: 6, curva: "media", sueno: "lento", salta: 7 },
  { id: "begona", nombre: "Begoña U.", ciudad: "San Sebastián", edad: 51, avatar: "🐚", peso: 80.2, entrega: 6, curva: "rapida", sueno: "normal", salta: 0 },
  { id: "amparo", nombre: "Amparo J.", ciudad: "Castellón", edad: 66, avatar: "☀️", peso: 92.3, entrega: 7, curva: "lenta", sueno: "lento", salta: 6 },
  { id: "nuria", nombre: "Nuria O.", ciudad: "Tarragona", edad: 45, avatar: "🌊", peso: 76.0, entrega: 7, curva: "rayo", sueno: "bueno", salta: 9 },
];

// ruído determinístico pequeno (o peso real oscila)
function ruido(id, k) {
  let h = 0;
  const str = id + ":" + k;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 7) - 3) / 100; // −0,03 … +0,03
}

function perdaEn(m, k) {
  if (k < 1) return 0;
  const base = interp(CURVA[m.curva], k);
  return Math.max(0, Math.round((base + (k > 2 ? ruido(m.id, k) * 3 : 0)) * 10) / 10);
}
function suenoEn(m, k) {
  const v = interp(SUENO[m.sueno], Math.max(0, k)) + ruido(m.id, k + 50) * 10;
  return Math.max(1, Math.min(5, Math.round(v)));
}

// estado da entrega no dia d do grupo
function estadoEntrega(m, d) {
  if (d >= m.entrega) return "recibido";
  if (d === m.entrega - 1) return "reparto";
  if (d >= m.entrega - 2 && d >= 2) return "camino";
  return "preparando";
}

// registros por data (calendário real) — para aplicar a mesma fórmula de pontos
function registrosDe(m, inicioISO, hoy) {
  const regs = {};
  const dHoy = diffDias(inicioISO, hoy) + 1;
  // olhamos 14 dias para trás no máximo (suficiente p/ semana + base de peso)
  for (let d = Math.max(m.entrega, dHoy - 13); d <= dHoy; d++) {
    const k = d - m.entrega;
    const fecha = sumarDias(inicioISO, d - 1);
    if (m.salta && k > 1 && k % m.salta === 0) {
      regs[fecha] = { peso: null }; // falhou o registro neste dia
      continue;
    }
    regs[fecha] = {
      peso: Math.round((m.peso - perdaEn(m, k)) * 10) / 10,
      sueno: k >= 1 ? suenoEn(m, k) : null, // dia da entrega: só o peso de partida
      tomo: k >= 1,
    };
  }
  return regs;
}

export function miembroHoy(m, s) {
  const inicio = s.perfil?.creadoEn || hoyMadrid();
  const hoy = hoyMadrid();
  const d = diaGrupo(s);
  const estado = estadoEntrega(m, d);
  const recibido = estado === "recibido";
  const k = d - m.entrega; // dias desde a entrega
  const perdido = recibido ? perdaEn(m, k) : 0;
  const ayer = recibido && k >= 2 ? perdaEn(m, k - 1) : 0;
  const deltaHoy = recibido && k >= 1 ? Math.round((perdido - ayer) * 10) / 10 : 0;
  const regs = recibido ? registrosDe(m, inicio, hoy) : {};
  const sem = recibido ? puntosSemana(regs, hoy) : { puntos: 0, dias: 0, kgSemana: 0, suenoMedio: 0 };
  return {
    id: m.id, nombre: m.nombre, ciudad: m.ciudad, edad: m.edad, avatar: m.avatar,
    estado, recibido, diasConFrasco: recibido ? k : null,
    pesoInicial: m.peso, pesoActual: Math.round((m.peso - perdido) * 10) / 10,
    perdido, deltaHoy, ...sem, eu: false,
    _m: m,
  };
}

// linha da usuária real
export function miLinea(s) {
  const hoy = hoyMadrid();
  const recibido = frascoRecibido(s);
  const sem = puntosSemana(s.registros || {}, hoy);
  const ini = s.perfil?.pesoInicial || null;
  const pesos = Object.entries(s.registros || {}).filter(([, r]) => r.peso).sort(([a], [b]) => a.localeCompare(b));
  const act = pesos.length ? pesos[pesos.length - 1][1].peso : ini;
  const perdido = ini && act ? Math.max(0, Math.round((ini - act) * 10) / 10) : 0;
  return {
    id: "yo", nombre: s.perfil?.nombre || "Tú", ciudad: s.perfil?.ciudad || "", edad: s.perfil?.edad || null,
    avatar: s.perfil?.avatar || "🌸",
    estado: recibido ? "recibido" : "esperando", recibido,
    diasConFrasco: recibido && s.frasco.recibidoEn ? diffDias(s.frasco.recibidoEn, hoy) : null,
    pesoInicial: ini, pesoActual: act, perdido, deltaHoy: 0, ...sem, eu: true,
  };
}

// ranking da semana: recebidas por pontos; depois as que esperam
export function rankingGrupo(s, { demo = true } = {}) {
  const lineas = demo ? MIEMBROS.map((m) => miembroHoy(m, s)) : [];
  const yo = miLinea(s);
  const todas = [...lineas, yo].sort((a, b) => {
    if (a.recibido !== b.recibido) return a.recibido ? -1 : 1;
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    if (b.perdido !== a.perdido) return b.perdido - a.perdido;
    return a.eu ? -1 : b.eu ? 1 : 0; // empate → usuária na frente (motiva)
  });
  const esperando = todas.filter((l) => !l.recibido).length;
  return {
    lineas: todas,
    posicion: todas.findIndex((l) => l.eu) + 1,
    total: todas.length,
    esperando,
    recibidas: todas.length - esperando,
    kgGrupo: Math.round(todas.reduce((a, l) => a + (l.perdido || 0), 0) * 10) / 10,
  };
}

// histórico dia a dia de uma integrante (últimos n dias)
export function historialMiembro(id, s, n = 7) {
  const m = MIEMBROS.find((x) => x.id === id);
  if (!m) return [];
  const d = diaGrupo(s);
  const out = [];
  for (let x = Math.max(1, d - n + 1); x <= d; x++) {
    const est = estadoEntrega(m, x);
    const k = x - m.entrega;
    if (est !== "recibido") { out.push({ dia: x, estado: est }); continue; }
    out.push({
      dia: x, estado: k === 0 ? "llego" : "activo",
      perdido: perdaEn(m, k), delta: k >= 1 ? Math.round((perdaEn(m, k) - perdaEn(m, k - 1)) * 10) / 10 : 0,
      sueno: k >= 1 ? suenoEn(m, k) : null,
    });
  }
  return out.reverse();
}

// novedades do dia (feed)
export function novedades(s) {
  const d = diaGrupo(s);
  const ev = [];
  for (const m of MIEMBROS) {
    const k = d - m.entrega;
    if (k === 0) ev.push({ t: "📦", txt: `${m.nombre} ha recibido su Barberina Max. Esta noche, primera cápsula.` });
    if (k === 1) {
      const p = perdaEn(m, 1);
      ev.push({ t: "🔥", txt: `${m.nombre}: −${String(p.toFixed(1)).replace(".", ",")} kg en su primer día con el frasco`, destacado: p >= 1 });
    }
    if (k === -1) ev.push({ t: "🚚", txt: `El frasco de ${m.nombre} ya está en reparto. Llega mañana.` });
    if (k === 7) ev.push({ t: "🏅", txt: `${m.nombre} completó su primera semana: −${String(perdaEn(m, 7).toFixed(1)).replace(".", ",")} kg` });
    if (k > 1) {
      const antes = perdaEn(m, k - 1), ahora = perdaEn(m, k);
      for (const hito of [2, 3, 5]) if (antes < hito && ahora >= hito) ev.push({ t: "👏", txt: `${m.nombre} ya ha perdido ${hito} kg` });
    }
  }
  const esperando = MIEMBROS.filter((m) => d < m.entrega).length;
  if (esperando > 0) ev.push({ t: "⏳", txt: `${esperando} compañeras del grupo siguen esperando su frasco` });
  // nunca vazio
  if (ev.length < 2) ev.push({ t: "🌙", txt: "El grupo sigue firme: cápsula por la noche y registro por la mañana." });
  return ev.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0)).slice(0, 5);
}

// ganadoras de semanas anteriores (roteiro fixo; nomes de grupos anteriores)
export function semanasAnteriores() {
  const lunes = lunesDe(hoyMadrid());
  const ganadoras = [
    { nombre: "Mercedes H.", ciudad: "Toledo", pts: 148, kg: 2.6 },
    { nombre: "Lola R.", ciudad: "Huelva", pts: 141, kg: 2.3 },
    { nombre: "Pura L.", ciudad: "Ourense", pts: 152, kg: 2.9 },
  ];
  return ganadoras.map((g, i) => ({ ...g, semana: sumarDias(lunes, -7 * (i + 1)) }));
}
