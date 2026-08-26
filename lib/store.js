"use client";

// ============================================================
// NoctaLev — camada de dados (localStorage, pronta p/ Supabase)
// Toda lógica de "dia" usa America/Sao_Paulo
// ============================================================

const KEY = "noctalev_v1";

export const DEFAULT_CONFIG = {
  diasInternos: 7,          // dias corridos após preparo p/ liberar Fase 2
  minCheckins: 4,           // mínimo de check-ins no período
  maxDias: 14,              // libera de qualquer forma após 14 dias
  curva: { 1: 30, 2: 45, 3: 60, 4: 72, 5: 80, 6: 95, 7: 100 }, // % por dia
  checkoutFase2: "https://pay.cakto.com.br/SEU-LINK-FASE-2",
  checkoutFase3: "https://pay.cakto.com.br/SEU-LINK-FASE-3",
  suporte: "https://wa.me/5554920011946",
  lembreteRitual: "21:30",
  lembreteCheckin: "08:30",
};

export function hojeSP(d = new Date()) {
  // yyyy-mm-dd no fuso America/Sao_Paulo
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

export function horaSP(d = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit",
  }).format(d);
}

export function horaNumSP(d = new Date()) {
  return parseInt(new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", hour: "numeric", hour12: false,
  }).format(d), 10) % 24;
}

export function saudacao() {
  const h = horaNumSP();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

function diffDias(dataISO1, dataISO2) {
  const a = new Date(dataISO1 + "T12:00:00Z");
  const b = new Date(dataISO2 + "T12:00:00Z");
  return Math.round((b - a) / 86400000);
}

// ---------------- estado ----------------

function estadoInicial() {
  return {
    perfil: null, // {nome, email, pesoInicial, pesoMeta, dificuldade, refluxo, cafeina, criadoEm}
    fotoAntes: null,                // dataURL JPEG comprimido da foto "antes" (opcional)
    fotoAntesEm: null,              // ISO datetime de quando a foto foi tirada
    receitaPreparadaEm: null,       // ISO datetime
    preparoIniciadoEm: null,        // ISO datetime (início do descanso 24h)
    preparoPasso: 0,
    checkins: {},                   // { "2026-08-26": {sono:1-5, horas, acordou, peso|null, criadoEm} }
    rituais: {},                    // { "2026-08-26": "21:30" }
    pontos: 0,
    conquistas: {},                 // { tipo: ISO datetime }
    protecaoUsadaEm: null,          // data ISO da última proteção de streak
    fase2LiberadaEm: null,
    fase2Paga: false,
    fase3LiberadaEm: null,
    fase3Paga: false,
    celebracaoVista: false,
    config: { ...DEFAULT_CONFIG },
    impulsos: {},        // { kiwi: {ativo, hora}, banana: {...}, banho: {...} }
    impulsosFeitos: {},  // { "2026-08-26": { kiwi: ISO, banana: ISO } }
    notasAdmin: [],
  };
}

export function load() {
  if (typeof window === "undefined") return estadoInicial();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return estadoInicial();
    const s = { ...estadoInicial(), ...JSON.parse(raw) };
    s.config = { ...DEFAULT_CONFIG, ...(s.config || {}) };
    return s;
  } catch { return estadoInicial(); }
}

export function save(s) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

export function resetAll() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

// ---------------- pontos & conquistas ----------------

export const CONQUISTAS = {
  alquimista:   { emoji: "🧪", nome: "Alquimista", desc: "Montou sua Mistura do Sono!" },
  primeira_noite:{ emoji: "🌙", nome: "Primeira noite", desc: "Fez seu 1º check-in" },
  tres_noites:  { emoji: "🔥", nome: "3 noites seguidas", desc: "Streak de 3 dias" },
  uma_semana:   { emoji: "⭐", nome: "1 semana de ritual", desc: "7 dias de ritual" },
  primeiro_kg:  { emoji: "⚖️", nome: "Primeiro kg", desc: "Perdeu o 1º quilo" },
  dorminhoca:   { emoji: "😴", nome: "Dorminhoca oficial", desc: "5 noites Bom/Excelente" },
  kiwi_lover:   { emoji: "🥝", nome: "Kiwi Lover", desc: "5 kiwis da noite" },
  ritual_completo:{ emoji: "🛁", nome: "Ritual completo", desc: "Chá + banho + kiwi na mesma noite" },
  jantar_blindado:{ emoji: "🍌", nome: "Jantar blindado", desc: "7 jantares com banana" },
};

function darConquista(s, tipo) {
  if (!s.conquistas[tipo]) {
    s.conquistas[tipo] = new Date().toISOString();
    s.pontos += 20;
    return true;
  }
  return false;
}

// ---------------- streak ----------------

export function calcStreak(s) {
  // dias consecutivos (até hoje ou ontem) com ritual OU check-in
  const dias = new Set([...Object.keys(s.checkins), ...Object.keys(s.rituais)]);
  if (dias.size === 0) return 0;
  let streak = 0;
  let cursor = hojeSP();
  if (!dias.has(cursor)) {
    // hoje ainda não fez — começa de ontem
    const d = new Date(cursor + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() - 1);
    cursor = d.toISOString().slice(0, 10);
  }
  let protecoesDisponiveis = 1; // 1 proteção a cada 7 dias
  while (dias.has(cursor) || (streak > 0 && protecoesDisponiveis > 0 && streak % 7 !== 0)) {
    if (dias.has(cursor)) { streak++; }
    else { protecoesDisponiveis--; streak++; }
    const d = new Date(cursor + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() - 1);
    cursor = d.toISOString().slice(0, 10);
  }
  return streak;
}

// ---------------- progressão oculta (§5) ----------------

export function progressao(s) {
  const cfg = s.config || DEFAULT_CONFIG;
  if (!s.receitaPreparadaEm) return { pct: 0, liberada: false, dia: 0 };
  if (s.fase2LiberadaEm) return { pct: 100, liberada: true, dia: 99 };

  const dataPreparo = hojeSP(new Date(s.receitaPreparadaEm));
  const dias = Math.max(0, diffDias(dataPreparo, hojeSP()));
  const nCheckins = Object.keys(s.checkins).length;

  const liberar =
    (dias >= cfg.diasInternos && nCheckins >= cfg.minCheckins) ||
    dias >= cfg.maxDias;

  let pct;
  if (liberar) pct = 100;
  else {
    const curva = cfg.curva || DEFAULT_CONFIG.curva;
    const d = Math.min(Math.max(dias, 0), cfg.diasInternos);
    pct = d === 0 ? 15 : (curva[d] ?? Math.min(99, 30 + d * 10));
    // se passou dos 7 dias mas faltam check-ins, congela em 95-99
    if (dias >= cfg.diasInternos) pct = Math.min(99, 95 + (nCheckins > 0 ? 2 : 0));
  }
  return { pct, liberada: liberar, dia: dias };
}

export function verificarDesbloqueio(s) {
  const p = progressao(s);
  if (p.liberada && !s.fase2LiberadaEm) {
    s.fase2LiberadaEm = new Date().toISOString();
    save(s);
    return true;
  }
  return false;
}

// ---------------- ações ----------------

export function salvarPerfil(s, perfil) {
  s.perfil = { ...perfil, criadoEm: new Date().toISOString() };
  return save(s);
}

export function salvarFotoAntes(s, dataURL) {
  s.fotoAntes = dataURL || null;
  s.fotoAntesEm = dataURL ? new Date().toISOString() : null;
  return save(s);
}

export function concluirPreparo(s) {
  if (!s.receitaPreparadaEm) {
    s.receitaPreparadaEm = new Date().toISOString();
    s.pontos += 50;
    darConquista(s, "alquimista");
  }
  return save(s);
}

export function fazerCheckin(s, { sono, horas, acordou, peso }) {
  const data = hojeSP();
  const novo = !s.checkins[data];
  s.checkins[data] = {
    sono, horas, acordou,
    peso: peso ?? null,
    criadoEm: s.checkins[data]?.criadoEm || new Date().toISOString(),
    editadoEm: new Date().toISOString(),
  };
  if (novo) s.pontos += 10;

  darConquista(s, "primeira_noite");
  if (calcStreak(s) >= 3) darConquista(s, "tres_noites");
  const boas = Object.values(s.checkins).filter((c) => c.sono >= 4).length;
  if (boas >= 5) darConquista(s, "dorminhoca");
  const pesos = pesosOrdenados(s);
  if (pesos.length && s.perfil?.pesoInicial && s.perfil.pesoInicial - pesos[pesos.length - 1].peso >= 1)
    darConquista(s, "primeiro_kg");

  verificarDesbloqueio(s);
  return save(s);
}

export function registrarRitual(s) {
  const data = hojeSP();
  if (s.rituais[data]) return s; // já registrado hoje — só 1x ao dia, nada muda
  s.rituais[data] = horaSP();
  s.pontos += 5;
  if (Object.keys(s.rituais).length >= 7) darConquista(s, "uma_semana");
  // ritual completo: chá + banho + kiwi na mesma noite
  const f = s.impulsosFeitos?.[data];
  if (f?.kiwi && f?.banho) darConquista(s, "ritual_completo");
  verificarDesbloqueio(s);
  return save(s);
}

// ---------------- derivados p/ UI ----------------

export function pesosOrdenados(s) {
  const arr = Object.entries(s.checkins)
    .filter(([, c]) => c.peso != null)
    .map(([data, c]) => ({ data, peso: c.peso }))
    .sort((a, b) => a.data.localeCompare(b.data));
  if (s.perfil?.pesoInicial != null) {
    const d0 = hojeSP(new Date(s.perfil.criadoEm || Date.now()));
    if (!arr.length || arr[0].data !== d0)
      arr.unshift({ data: d0, peso: s.perfil.pesoInicial });
  }
  return arr;
}

export function pesoPerdido(s) {
  const arr = pesosOrdenados(s);
  if (arr.length < 2) return 0;
  return Math.max(0, arr[0].peso - arr[arr.length - 1].peso);
}

export function diaProtocolo(s) {
  const base = s.receitaPreparadaEm || s.perfil?.criadoEm;
  if (!base) return 1;
  return Math.max(1, diffDias(hojeSP(new Date(base)), hojeSP()) + 1);
}

export function scoreSono(s) {
  const arr = Object.entries(s.checkins).sort((a, b) => a[0].localeCompare(b[0]));
  if (!arr.length) return null;
  const ult = arr.slice(-7);
  const media = ult.reduce((t, [, c]) => t + c.sono, 0) / ult.length;
  const pctAtual = Math.round((media / 5) * 100);
  const primeiro = arr[0][1].sono;
  const ultimoV = arr[arr.length - 1][1].sono;
  const melhora = primeiro > 0 ? Math.round(((ultimoV - primeiro) / primeiro) * 100) : 0;
  return { pct: pctAtual, melhora, dias: arr.length, ultimo: arr[arr.length - 1][1] };
}

export const HORAS_LABEL = { "<5": "menos de 5h", "5-6": "5–6h", "6-7": "6–7h", "7-8": "7–8h", "8+": "8h ou mais" };
export const SONO_OPTS = [
  { v: 1, emoji: "😫", label: "Péssimo" },
  { v: 2, emoji: "😕", label: "Ruim" },
  { v: 3, emoji: "😐", label: "Regular" },
  { v: 4, emoji: "🙂", label: "Bom" },
  { v: 5, emoji: "😴", label: "Excelente" },
];

export const FRASES = [
  "Seu corpo está aprendendo a desligar. Continue!",
  "Cada noite bem dormida é um passo a menos na balança.",
  "Você está cuidando de você — e isso já é uma vitória.",
  "O sono é o seu novo aliado. Ele trabalha enquanto você descansa.",
  "Devagar e sempre: é assim que o corpo destrava.",
  "Mais uma noite registrada. Seu organismo agradece!",
  "Constância vale mais que perfeição. Você está indo muito bem.",
  "Seu ritual está virando hábito — e hábito vira resultado.",
  "Quem dorme bem, belisca menos. Você está no caminho certo.",
  "Orgulhe-se: muita gente desiste antes de chegar onde você está.",
  "Hoje é mais um tijolinho na sua transformação.",
  "Seu metabolismo está reaprendendo a trabalhar a seu favor.",
  "Respire fundo. Você merece essa noite de descanso.",
  "Pequenos rituais, grandes mudanças. Continue firme!",
  "O espelho ainda não mostra tudo o que seu corpo já mudou por dentro.",
];

// Frases motivacionais da MANHÃ — uma por dia, igual na notificação e no app.
// Rotação por data: todas as usuárias veem a mesma frase no mesmo dia.
export const FRASES_MANHA = [
  "Bom dia! Cada manhã é uma nova chance de cuidar de você. 💛",
  "Você acordou mais perto do seu objetivo do que ontem. Continue!",
  "O segredo não é pressa, é constância. E você tem isso de sobra.",
  "Enquanto você dormia, seu corpo trabalhava a seu favor. 🌙",
  "Hoje é um ótimo dia para se orgulhar de quem você está se tornando.",
  "Não compare seu dia 3 com o dia 30 de ninguém. Seu ritmo é perfeito.",
  "Beba água ao acordar: seu metabolismo agradece o empurrãozinho. 💧",
  "Dormir bem é o remédio mais barato que existe — e você está tomando.",
  "Um passo por dia. Olhe para trás e veja quantos você já deu.",
  "Seu corpo escuta tudo o que sua mente diz. Fale coisas boas hoje.",
  "A balança mostra um número. O espelho e a disposição mostram a verdade.",
  "Quem cuida do sono, cuida do peso, do humor e do coração. Você está cuidando de tudo.",
  "Hoje, escolha você. O resto se ajeita.",
  "Grandes mudanças começam com pequenos rituais repetidos. Você já começou.",
  "Se ontem não foi perfeito, tudo bem. Hoje é uma página em branco.",
  "Seu descanso não é preguiça — é tratamento. Honre isso.",
  "Confie no processo: o corpo demora, mas nunca esquece o que você faz por ele.",
  "Acordar e se comprometer de novo: isso é força de verdade.",
  "Você não precisa de motivação todo dia. Precisa de rotina — e ela já é sua.",
  "Cada check-in é uma promessa cumprida com você mesma. 🤝",
  "O que parece pequeno hoje será gigante daqui a 30 dias.",
  "Seu futuro eu está torcendo por você agorinha mesmo.",
  "Menos culpa, mais cuidado. É assim que se transforma um corpo.",
  "Respire. Sorria. Você está fazendo o seu melhor — e está funcionando.",
  "Disciplina é se amar o suficiente para não desistir.",
  "A noite passada já fez a parte dela. Agora o dia é seu. ☀️",
  "Você é a prova de que nunca é tarde para recomeçar.",
  "Coma bem, durma bem, viva leve. Você está no caminho.",
  "Os resultados estão sendo construídos em silêncio. Continue firme.",
  "Que hoje você se trate com o mesmo carinho que trata quem ama.",
];

export function fraseDoDia() {
  const seed = parseInt(hojeSP().replaceAll("-", ""), 10);
  return FRASES_MANHA[seed % FRASES_MANHA.length];
}

// ---------------- personalização da receita (§6) ----------------

export function ajustesReceita(perfil) {
  const aj = [];
  if (!perfil) return aj;
  if (perfil.dificuldade === "ansiedade")
    aj.push({ emoji: "🌿", texto: "Melissa reforçada: use 6 colheres de sopa (em vez de 4) — reforço extra para desligar a mente à noite." });
  if (perfil.dificuldade === "madrugada")
    aj.push({ emoji: "🌙", texto: "Maracujá reforçado: use 3 colheres de sopa (ou 6 sachês). E tome seu chá 60 min antes de deitar (não 30)." });
  return aj;
}

// ---------------- Impulsos Naturais (aceleradores) ----------------
// Micro-ações diárias opcionais com notificação. Nunca obrigatórias.
// NÃO contam para a progressão da Fase 2 — só pontos e engajamento.
// Textos/horários padrão podem ser sobrescritos pelo admin via configuracoes (nuvem).

export const IMPULSOS_PADRAO = [
  {
    id: "kiwi",
    emoji: "🥝",
    nome: "Kiwi da Noite",
    acao: "Comer 2 kiwis",
    // offset em minutos: negativo = antes de deitar; base "deitar" ou "jantar"
    base: "deitar", offsetMin: -60,
    notif: "🥝 Hora do seu Kiwi da Noite! 2 kiwis agora = sono mais profundo e metabolismo queimando enquanto você dorme.",
    copy: "Estudos mostram que 2 kiwis 1h antes de deitar ajudam você a pegar no sono mais rápido e dormir mais tempo. E tem mais: são só ~90 kcal, ricos em fibra — seguram a fome da noite e substituem o belisco que engorda. Sono fundo + zero beliscos = seu corpo queimando a noite toda.",
  },
  {
    id: "banana",
    emoji: "🍌",
    nome: "Banana no Jantar",
    acao: "1 banana na última refeição",
    base: "jantar", offsetMin: 0,
    notif: "🍌 Lembrete do jantar: inclua 1 banana. Magnésio + triptofano relaxam o corpo e cortam a vontade de doce depois do jantar.",
    copy: "A banana entrega magnésio e triptofano — a matéria-prima do hormônio do sono. E a doçura natural dela mata a vontade de sobremesa, cortando calorias sem esforço. Relaxa o corpo E fecha a cozinha.",
  },
  {
    id: "banho",
    emoji: "🛁",
    nome: "Banho Morno",
    acao: "10 min relaxante",
    base: "deitar", offsetMin: -90,
    notif: "🛁 Seu banho morno de hoje: 10 minutinhos agora preparam seu corpo para a noite mais funda — e é no sono fundo que a gordura queima.",
    copy: "O banho morno aquece a pele e força o corpo a resfriar por dentro — o gatilho biológico do sono profundo. É no sono profundo que o corpo produz GH e queima gordura de verdade. 10 minutos de banho = horas de queima.",
  },
];

// lista efetiva: padrão + sobrescritas do admin (config.impulsosDef)
export function impulsosDef(s) {
  const over = s?.config?.impulsosDef;
  if (!Array.isArray(over) || !over.length) return IMPULSOS_PADRAO;
  // mescla por id (admin pode editar textos/horários e até adicionar novos);
  // valores vazios do admin NÃO apagam os textos padrão
  const mapa = {};
  IMPULSOS_PADRAO.forEach((i) => { mapa[i.id] = { ...i }; });
  over.forEach((o) => {
    if (!o?.id) return;
    const limpo = {};
    Object.entries(o).forEach(([k, v]) => { if (v !== "" && v !== null && v !== undefined) limpo[k] = v; });
    mapa[o.id] = { ...(mapa[o.id] || {}), ...limpo };
  });
  return Object.values(mapa);
}

function somaMinutos(hhmm, min) {
  const [h, m] = String(hhmm || "22:00").split(":").map(Number);
  let t = h * 60 + m + min;
  t = ((t % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

// horário calculado de um impulso a partir do perfil (jantar/deitar)
export function horaImpulsoPadrao(def, perfil) {
  const jantar = perfil?.horaJantar || "19:30";
  const deitar = perfil?.horaDeitar || "22:30";
  return somaMinutos(def.base === "jantar" ? jantar : deitar, def.offsetMin || 0);
}

// estado de um impulso p/ a usuária: {ativo, hora} (hora custom > calculada)
export function estadoImpulsos(s) {
  const defs = impulsosDef(s);
  const cfg = s.impulsos || {};
  return defs.map((def) => {
    const c = cfg[def.id] || {};
    return {
      ...def,
      ativo: c.ativo !== false, // ativo por padrão
      hora: c.hora || horaImpulsoPadrao(def, s.perfil),
      feitoHoje: !!(s.impulsosFeitos?.[hojeSP()]?.[def.id]),
    };
  });
}

export function setImpulso(s, id, patch) {
  s.impulsos = s.impulsos || {};
  s.impulsos[id] = { ...(s.impulsos[id] || {}), ...patch };
  return save(s);
}

export function concluirImpulso(s, id) {
  const hoje = hojeSP();
  s.impulsosFeitos = s.impulsosFeitos || {};
  s.impulsosFeitos[hoje] = s.impulsosFeitos[hoje] || {};
  if (s.impulsosFeitos[hoje][id]) return save(s); // já feito hoje
  s.impulsosFeitos[hoje][id] = new Date().toISOString();
  s.pontos += 5;

  // conquistas dos impulsos
  const dias = Object.values(s.impulsosFeitos || {});
  const nKiwi = dias.filter((d) => d.kiwi).length;
  if (nKiwi >= 5) darConquista(s, "kiwi_lover");
  const nBanana = dias.filter((d) => d.banana).length;
  if (nBanana >= 7) darConquista(s, "jantar_blindado");
  const hojeFeitos = s.impulsosFeitos[hoje];
  if (hojeFeitos.kiwi && hojeFeitos.banho && s.rituais[hoje]) darConquista(s, "ritual_completo");

  return save(s);
}

// chamada também ao registrar o ritual (para fechar o "ritual completo")
export function checarRitualCompleto(s) {
  const hoje = hojeSP();
  const f = s.impulsosFeitos?.[hoje];
  if (f?.kiwi && f?.banho && s.rituais[hoje]) darConquista(s, "ritual_completo");
  return s;
}
