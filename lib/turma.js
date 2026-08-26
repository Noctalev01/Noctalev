// ============================================================
// SUA TURMA — coorte padrão que "começou junto" com a usuária.
// - Os 23 perfis (20 mulheres + 3 homens) são os MESMOS para todas.
// - A evolução é determinística por DIA DO PROTOCOLO da usuária:
//   todas veem a mesma história, ancorada na data de início dela.
// - A posição da usuária no rank é REAL: calculada dos dados dela
//   com a mesma fórmula usada para as demais.
// Roteiro do dia 1: nem todo mundo entrou ainda — alguns fazem o
// primeiro login nos dias 2–6; quem entrou pode ou não ter montado
// a Mistura. Fotos vão aparecendo dia a dia. Fase 2 libera a partir
// do dia 5. Ritmos variados, platôs realistas. Fátima nunca põe foto.
// ============================================================
import { diaProtocolo, pesoPerdido, scoreSono, hojeSP } from "./store";

// interpola valor acumulado nos marcos [dia, valor]
function interp(marcos, dia) {
  if (!marcos.length) return 0;
  if (dia <= marcos[0][0]) return marcos[0][1];
  for (let i = 1; i < marcos.length; i++) {
    const [d1, v1] = marcos[i - 1], [d2, v2] = marcos[i];
    if (dia <= d2) {
      const f = (dia - d1) / (d2 - d1);
      return v1 + (v2 - v1) * f;
    }
  }
  return marcos[marcos.length - 1][1];
}

// Fotos em /public/turma/<id>.jpg; sem arquivo → fallback de iniciais.
const FOTO = (id) => `/turma/${id}.jpg`;

export const MEMBROS = [
  // ---------- quem entra no DIA 1 ----------
  {
    id: "marcia", nome: "Márcia", idade: 52, cor: "#f6ad55",
    loginDia: 1, fotoDia: 2, receitaDia: 1, fase2Dia: 5,
    marcos: [[1, 0], [2, 0.2], [3, 0.5], [5, 1.0], [7, 1.5], [10, 2.0], [14, 2.7], [21, 3.8], [30, 4.8]],
    sono: [[1, 42], [5, 62], [10, 76], [21, 88]],
  },
  {
    id: "anapaula", nome: "Ana Paula", idade: 47, cor: "#7ee8b2",
    loginDia: 1, fotoDia: 2, receitaDia: 1, fase2Dia: 7,
    marcos: [[1, 0], [3, 0.3], [5, 0.7], [7, 1.2], [10, 1.7], [14, 2.4], [21, 3.4], [30, 4.2]],
    sono: [[1, 38], [5, 55], [10, 72], [21, 85]],
  },
  {
    id: "juliana", nome: "Juliana", idade: 36, cor: "#f687b3",
    loginDia: 1, fotoDia: 1, receitaDia: 1, fase2Dia: 6,
    marcos: [[1, 0], [2, 0.3], [3, 0.6], [5, 1.1], [7, 1.6], [10, 2.2], [14, 3.0], [21, 4.0], [30, 5.0]],
    sono: [[1, 40], [5, 63], [10, 78], [21, 90]],
  },
  {
    // homem 1 — perde mais rápido (metabolismo), realista
    id: "carlos", nome: "Carlos", idade: 50, cor: "#90cdf4", sexo: "m",
    loginDia: 1, fotoDia: 2, receitaDia: 1, fase2Dia: 8,
    marcos: [[1, 0], [2, 0.3], [3, 0.7], [5, 1.2], [7, 1.8], [10, 2.5], [14, 3.3], [21, 4.4], [30, 5.5]],
    sono: [[1, 36], [5, 58], [10, 74], [21, 86]],
  },
  {
    id: "claudia", nome: "Cláudia", idade: 44, cor: "#f687b3",
    loginDia: 1, fotoDia: 3, receitaDia: 1, fase2Dia: 9,
    marcos: [[1, 0], [3, 0.3], [5, 0.5], [7, 0.9], [10, 1.4], [14, 2.0], [21, 2.8], [30, 3.5]],
    sono: [[1, 35], [5, 52], [10, 68], [21, 82]],
  },
  {
    id: "simone", nome: "Simone", idade: 49, cor: "#a5b4fc",
    loginDia: 1, fotoDia: 2, receitaDia: 2, fase2Dia: 8,
    marcos: [[2, 0], [3, 0.2], [5, 0.6], [7, 1.0], [10, 1.5], [14, 2.1], [21, 3.0], [30, 3.8]],
    sono: [[2, 45], [5, 58], [10, 70], [21, 84]],
  },
  {
    id: "renata", nome: "Renata", idade: 43, cor: "#fc8181",
    loginDia: 1, fotoDia: 3, receitaDia: 2, fase2Dia: 7,
    marcos: [[2, 0], [3, 0.2], [5, 0.6], [7, 1.1], [10, 1.6], [14, 2.3], [21, 3.3], [30, 4.1]],
    sono: [[2, 41], [6, 58], [10, 73], [21, 86]],
  },
  {
    // platô proposital nos dias 12–15 (realista)
    id: "michele", nome: "Michele", idade: 39, cor: "#c3a6ff",
    loginDia: 1, fotoDia: 2, receitaDia: 2, fase2Dia: 9,
    marcos: [[2, 0], [4, 0.3], [6, 0.7], [9, 1.2], [12, 1.6], [15, 1.6], [18, 2.0], [21, 2.4], [30, 3.2]],
    sono: [[2, 39], [6, 55], [12, 70], [21, 83]],
  },
  {
    id: "rosana", nome: "Rosana", idade: 58, cor: "#fbd38d",
    loginDia: 1, fotoDia: 4, receitaDia: 2, fase2Dia: 10,
    marcos: [[2, 0], [4, 0.2], [6, 0.5], [8, 0.9], [10, 1.2], [14, 1.8], [21, 2.5], [30, 3.1]],
    sono: [[2, 40], [7, 55], [12, 68], [21, 80]],
  },
  {
    id: "vera", nome: "Vera", idade: 56, cor: "#c3a6ff",
    loginDia: 1, fotoDia: 6, receitaDia: 2, fase2Dia: 13,
    marcos: [[2, 0], [5, 0.2], [7, 0.4], [10, 0.8], [14, 1.3], [21, 2.0], [30, 2.6]],
    sono: [[2, 44], [7, 54], [14, 66], [21, 76]],
  },
  // ---------- primeiro login no DIA 2 ----------
  {
    id: "camila", nome: "Camila", idade: 35, cor: "#7ee8b2",
    loginDia: 2, fotoDia: 2, receitaDia: 2, fase2Dia: 8,
    marcos: [[2, 0], [4, 0.4], [6, 0.8], [8, 1.2], [10, 1.6], [14, 2.2], [21, 3.2], [30, 4.0]],
    sono: [[2, 37], [6, 56], [12, 72], [21, 84]],
  },
  {
    // homem 2
    id: "rodrigo", nome: "Rodrigo", idade: 45, cor: "#90cdf4", sexo: "m",
    loginDia: 2, fotoDia: 3, receitaDia: 2, fase2Dia: 10,
    marcos: [[2, 0], [4, 0.4], [6, 0.9], [8, 1.4], [10, 1.9], [14, 2.6], [21, 3.6], [30, 4.6]],
    sono: [[2, 34], [6, 52], [11, 68], [21, 82]],
  },
  {
    id: "patricia", nome: "Patrícia", idade: 41, cor: "#90cdf4",
    loginDia: 2, fotoDia: 5, receitaDia: 3, fase2Dia: 12,
    marcos: [[3, 0], [4, 0.1], [6, 0.4], [8, 0.7], [10, 1.0], [14, 1.6], [21, 2.3], [30, 2.9]],
    sono: [[3, 33], [7, 50], [12, 64], [21, 78]],
  },
  {
    id: "adriana", nome: "Adriana", idade: 46, cor: "#7ee8b2",
    loginDia: 2, fotoDia: 4, receitaDia: 3, fase2Dia: 11,
    marcos: [[3, 0], [5, 0.3], [7, 0.6], [10, 1.1], [14, 1.7], [21, 2.6], [30, 3.3]],
    sono: [[3, 36], [8, 52], [14, 67], [21, 79]],
  },
  {
    id: "eliane", nome: "Eliane", idade: 51, cor: "#f6ad55",
    loginDia: 2, fotoDia: 6, receitaDia: 3, fase2Dia: 13,
    marcos: [[3, 0], [6, 0.3], [8, 0.6], [11, 1.0], [14, 1.4], [21, 2.1], [30, 2.8]],
    sono: [[3, 32], [8, 49], [14, 62], [21, 74]],
  },
  // ---------- primeiro login no DIA 3 ----------
  {
    // platô proposital nos dias 8–11 (realista)
    id: "denise", nome: "Denise", idade: 54, cor: "#f6ad55",
    loginDia: 3, fotoDia: 8, receitaDia: 4, fase2Dia: 15,
    marcos: [[4, 0], [5, 0.1], [7, 0.5], [8, 0.7], [11, 0.7], [14, 1.1], [21, 1.7], [30, 2.2]],
    sono: [[4, 30], [8, 46], [14, 60], [21, 72]],
  },
  {
    id: "sandra", nome: "Sandra", idade: 48, cor: "#a5b4fc",
    loginDia: 3, fotoDia: 5, receitaDia: 4, fase2Dia: 14,
    marcos: [[4, 0], [6, 0.2], [9, 0.6], [12, 1.0], [14, 1.3], [21, 2.0], [30, 2.7]],
    sono: [[4, 34], [9, 50], [15, 63], [21, 75]],
  },
  {
    id: "rosangela", nome: "Rosângela", idade: 57, cor: "#f687b3",
    loginDia: 3, fotoDia: 4, receitaDia: 4, fase2Dia: 17,
    marcos: [[4, 0], [7, 0.3], [10, 0.6], [14, 1.1], [18, 1.5], [21, 1.8], [30, 2.5]],
    sono: [[4, 31], [9, 46], [15, 59], [21, 71]],
  },
  {
    // homem 3 — o mais velho, começa devagar e é constante
    id: "antonio", nome: "Antônio", idade: 63, cor: "#90cdf4", sexo: "m",
    loginDia: 3, fotoDia: 5, receitaDia: 4, fase2Dia: 14,
    marcos: [[4, 0], [6, 0.3], [8, 0.7], [11, 1.2], [14, 1.6], [21, 2.4], [30, 3.2]],
    sono: [[4, 30], [9, 45], [15, 58], [21, 72]],
  },
  // ---------- primeiro login nos DIAS 4–6 ----------
  {
    id: "luciana", nome: "Luciana", idade: 38, cor: "#7ee8b2",
    loginDia: 4, fotoDia: 10, receitaDia: 5, fase2Dia: 18,
    marcos: [[5, 0], [6, 0], [8, 0.3], [11, 0.5], [14, 0.8], [21, 1.3], [30, 1.8]],
    sono: [[5, 36], [9, 48], [15, 58], [21, 68]],
  },
  {
    id: "tatiane", nome: "Tatiane", idade: 37, cor: "#fc8181",
    loginDia: 4, fotoDia: 7, receitaDia: 5, fase2Dia: 16,
    marcos: [[5, 0], [7, 0.2], [10, 0.5], [13, 0.9], [16, 1.2], [21, 1.7], [30, 2.4]],
    sono: [[5, 35], [10, 48], [16, 60], [21, 70]],
  },
  {
    id: "cristina", nome: "Cristina", idade: 42, cor: "#a5b4fc",
    loginDia: 5, fotoDia: 8, receitaDia: 6, fase2Dia: 19,
    marcos: [[6, 0], [8, 0.2], [11, 0.5], [14, 0.8], [18, 1.2], [21, 1.5], [30, 2.1]],
    sono: [[6, 33], [11, 46], [17, 57], [21, 66]],
  },
  {
    // a única que nunca coloca foto — começa devagar, mas não desiste
    id: "fatima", nome: "Fátima", idade: 60, cor: "#a5b4fc",
    loginDia: 6, fotoDia: 999, receitaDia: 7, fase2Dia: null,
    marcos: [[7, 0], [8, 0], [10, 0.2], [14, 0.4], [21, 0.8], [30, 1.2]],
    sono: [[7, 28], [10, 40], [16, 50], [21, 60]],
  },
];

// pontuação do ranking (mesma fórmula para fictícias e usuária real)
function scoreRank(perdaKg, sonoPct) {
  return perdaKg * 100 + sonoPct * 0.5;
}

function perdaNoDia(m, d) {
  if (d < m.receitaDia) return 0;
  return Math.round(interp(m.marcos, d) * 10) / 10;
}
function sonoNoDia(m, d) {
  if (d < m.receitaDia) return 0;
  return Math.round(interp(m.sono, d));
}

// estado de um membro no dia D do protocolo da usuária
export function membroNoDia(m, dia) {
  const d = Math.max(1, dia);
  const entrou = d >= m.loginDia;
  const montou = entrou && d >= m.receitaDia;
  const perda = montou ? perdaNoDia(m, d) : 0;
  const sono = montou ? sonoNoDia(m, d) : 0;
  // variação de HOJE (em relação a ontem) — progressão diária visível
  const perdaOntem = montou && d - 1 >= m.receitaDia ? perdaNoDia(m, d - 1) : 0;
  const sonoOntem = montou && d - 1 >= m.receitaDia ? sonoNoDia(m, d - 1) : 0;
  const deltaPerda = montou ? Math.round((perda - perdaOntem) * 10) / 10 : 0;
  const deltaSono = montou ? sono - sonoOntem : 0;
  const fase2 = !!(m.fase2Dia && d >= m.fase2Dia);
  const temFoto = entrou && d >= m.fotoDia;
  return {
    id: m.id, nome: m.nome, idade: m.idade, cor: m.cor, sexo: m.sexo || "f",
    foto: temFoto ? FOTO(m.id) : null,
    entrou, montou, perda, sono, deltaPerda, deltaSono,
    fase2, fase2Dia: m.fase2Dia,
    score: montou ? scoreRank(perda, sono) : entrou ? -1 : -2,
    eu: false,
  };
}

// histórico diário de um membro (últimos N dias até o dia D)
export function historicoMembro(id, dia, n = 7) {
  const m = MEMBROS.find((x) => x.id === id);
  if (!m) return [];
  const d = Math.max(1, dia);
  const ini = Math.max(1, d - n + 1);
  const hist = [];
  for (let k = ini; k <= d; k++) {
    if (k < m.loginDia) { hist.push({ dia: k, estado: "fora" }); continue; }
    if (k < m.receitaDia) { hist.push({ dia: k, estado: "entrou" }); continue; }
    hist.push({ dia: k, estado: "ativo", perda: perdaNoDia(m, k), sono: sonoNoDia(m, k) });
  }
  return hist;
}

// linha da usuária real, com a MESMA fórmula
export function minhaLinha(s) {
  const perda = Math.round((pesoPerdido(s) || 0) * 10) / 10;
  const sono = scoreSono(s)?.pct || 0;
  const montou = !!s.receitaPreparadaEm;
  return {
    id: "eu", nome: s.perfil?.nome || "Você", idade: null, cor: "#fbd38d", sexo: "f",
    foto: null,
    entrou: true, montou, perda, sono, deltaPerda: 0, deltaSono: 0,
    fase2: !!s.fase2LiberadaEm, fase2Dia: null,
    score: montou ? scoreRank(perda, sono) : -1,
    eu: true,
  };
}

// ranking completo do dia (usuária vence empates — motiva!)
export function rankingDoDia(s) {
  const dia = diaProtocolo(s);
  const linhas = MEMBROS.map((m) => membroNoDia(m, dia));
  const eu = minhaLinha(s);
  const todas = [...linhas, eu].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.eu ? -1 : b.eu ? 1 : 0; // empate → usuária na frente
  });
  const semLogin = todas.filter((l) => !l.entrou).length;
  return {
    dia,
    linhas: todas,
    posicao: todas.findIndex((l) => l.eu) + 1,
    total: todas.length,
    semLogin,
    ativos: todas.filter((l) => l.montou).length,
  };
}

// novidades do dia (feed curto e vivo)
export function novidadesDoDia(s) {
  const dia = diaProtocolo(s);
  const evs = [];
  for (const m of MEMBROS) {
    if (m.loginDia === dia && dia > 1) evs.push(`👋 ${m.nome} fez o primeiro login no app`);
    if (m.receitaDia === dia) evs.push(`🍵 ${m.nome} montou a Mistura do Sono e iniciou o protocolo`);
    if (m.fotoDia === dia) evs.push(`📸 ${m.nome} adicionou a foto de perfil`);
    if (m.fase2Dia === dia) evs.push(`🎉 ${m.nome} liberou a Fase 2 em ${m.fase2Dia} dias!`);
  }
  // dia 1: mostrar quem ainda não entrou
  if (dia === 1) {
    const fora = MEMBROS.filter((m) => m.loginDia > 1).length;
    if (fora > 0) evs.push(`⏳ ${fora} pessoas da turma ainda não fizeram o primeiro login`);
  }
  // eventos de "ontem" para o feed nunca ficar vazio
  if (!evs.length) {
    for (const m of MEMBROS) {
      if (m.fase2Dia && m.fase2Dia === dia - 1) evs.push(`🎉 ${m.nome} liberou a Fase 2 ontem!`);
      if (m.fotoDia === dia - 1) evs.push(`📸 ${m.nome} adicionou a foto de perfil ontem`);
    }
  }
  if (!evs.length) evs.push("🌙 A turma segue firme no ritual — faça o seu de hoje!");
  return evs.slice(0, 4);
}

// nome da turma pela data de início da usuária
export function nomeTurma(s) {
  const base = s.receitaPreparadaEm || s.perfil?.criadoEm;
  if (!base) return "Sua turma";
  const d = new Date(base);
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  try {
    const sp = new Date(d.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    return `Turma de ${sp.getDate()} de ${meses[sp.getMonth()]}`;
  } catch {
    return `Turma de ${d.getDate()} de ${meses[d.getMonth()]}`;
  }
}
