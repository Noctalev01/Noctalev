// ============================================================
// SUA TURMA — coorte padrão que "começou junto" com a usuária.
// - Os 10 perfis são os MESMOS para todas as usuárias.
// - A evolução é determinística por DIA DO PROTOCOLO da usuária:
//   todas veem a mesma história, ancorada na data de início dela.
// - A posição da usuária no rank é REAL: calculada dos dados dela
//   com a mesma fórmula usada para as demais.
// Roteiro: dia 1 avatares padrão (3 já montaram a mistura);
// dia 2 três adicionam foto; Fase 2 começa a liberar no dia 5;
// até o dia 10, 9 de 10 (90%) com foto. Ritmos variados e platôs.
// ============================================================
import { diaProtocolo, pesoPerdido, scoreSono, hojeSP } from "./store";

// interpola perda acumulada nos marcos [dia, kg]
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

// Fotos: quando os arquivos existirem em /public/turma/<id>.jpg elas aparecem;
// enquanto não existem, o Avatar cai no fallback de iniciais automaticamente.
const FOTO = (id) => `/turma/${id}.jpg`;

export const MEMBROS = [
  {
    id: "marcia", nome: "Márcia", idade: 52, cor: "#f6ad55",
    fotoDia: 2, receitaDia: 1, fase2Dia: 5,
    marcos: [[1, 0], [2, 0.2], [3, 0.5], [5, 1.0], [7, 1.5], [10, 2.0], [14, 2.7], [21, 3.8], [30, 4.8]],
    sono: [[1, 42], [5, 62], [10, 76], [21, 88]],
  },
  {
    id: "anapaula", nome: "Ana Paula", idade: 47, cor: "#7ee8b2",
    fotoDia: 2, receitaDia: 1, fase2Dia: 7,
    marcos: [[1, 0], [3, 0.3], [5, 0.7], [7, 1.2], [10, 1.7], [14, 2.4], [21, 3.4], [30, 4.2]],
    sono: [[1, 38], [5, 55], [10, 72], [21, 85]],
  },
  {
    id: "simone", nome: "Simone", idade: 49, cor: "#a5b4fc",
    fotoDia: 2, receitaDia: 2, fase2Dia: 8,
    marcos: [[1, 0], [3, 0.2], [5, 0.6], [7, 1.0], [10, 1.5], [14, 2.1], [21, 3.0], [30, 3.8]],
    sono: [[1, 45], [5, 58], [10, 70], [21, 84]],
  },
  {
    id: "claudia", nome: "Cláudia", idade: 44, cor: "#f687b3",
    fotoDia: 3, receitaDia: 1, fase2Dia: 9,
    marcos: [[1, 0], [3, 0.3], [5, 0.5], [7, 0.9], [10, 1.4], [14, 2.0], [21, 2.8], [30, 3.5]],
    sono: [[1, 35], [5, 52], [10, 68], [21, 82]],
  },
  {
    id: "rosana", nome: "Rosana", idade: 58, cor: "#fbd38d",
    fotoDia: 4, receitaDia: 2, fase2Dia: 10,
    marcos: [[1, 0], [4, 0.2], [6, 0.5], [8, 0.9], [10, 1.2], [14, 1.8], [21, 2.5], [30, 3.1]],
    sono: [[1, 40], [7, 55], [12, 68], [21, 80]],
  },
  {
    id: "patricia", nome: "Patrícia", idade: 41, cor: "#90cdf4",
    fotoDia: 5, receitaDia: 3, fase2Dia: 12,
    marcos: [[1, 0], [4, 0.1], [6, 0.4], [8, 0.7], [10, 1.0], [14, 1.6], [21, 2.3], [30, 2.9]],
    sono: [[1, 33], [7, 50], [12, 64], [21, 78]],
  },
  {
    id: "vera", nome: "Vera", idade: 56, cor: "#c3a6ff",
    fotoDia: 6, receitaDia: 2, fase2Dia: 13,
    marcos: [[1, 0], [5, 0.2], [7, 0.4], [10, 0.8], [14, 1.3], [21, 2.0], [30, 2.6]],
    sono: [[1, 44], [7, 54], [14, 66], [21, 76]],
  },
  {
    // platô proposital nos dias 8–11 (realista)
    id: "denise", nome: "Denise", idade: 54, cor: "#f6ad55",
    fotoDia: 8, receitaDia: 4, fase2Dia: 15,
    marcos: [[1, 0], [5, 0.1], [7, 0.5], [8, 0.7], [11, 0.7], [14, 1.1], [21, 1.7], [30, 2.2]],
    sono: [[1, 30], [8, 46], [14, 60], [21, 72]],
  },
  {
    id: "luciana", nome: "Luciana", idade: 38, cor: "#7ee8b2",
    fotoDia: 10, receitaDia: 5, fase2Dia: 18,
    marcos: [[1, 0], [6, 0], [8, 0.3], [11, 0.5], [14, 0.8], [21, 1.3], [30, 1.8]],
    sono: [[1, 36], [9, 48], [15, 58], [21, 68]],
  },
  {
    // a única que nunca coloca foto (10%) — e começa devagar, mas não desiste
    id: "fatima", nome: "Fátima", idade: 60, cor: "#a5b4fc",
    fotoDia: 999, receitaDia: 6, fase2Dia: null,
    marcos: [[1, 0], [7, 0], [10, 0.2], [14, 0.4], [21, 0.8], [30, 1.2]],
    sono: [[1, 28], [10, 40], [16, 50], [21, 60]],
  },
];

// pontuação do ranking (mesma fórmula para fictícias e usuária real)
function scoreRank(perdaKg, sonoPct) {
  return perdaKg * 100 + sonoPct * 0.5;
}

// estado de um membro no dia D do protocolo da usuária
export function membroNoDia(m, dia) {
  const d = Math.max(1, dia);
  const montou = d >= m.receitaDia;
  const perda = montou ? Math.round(interp(m.marcos, d) * 10) / 10 : 0;
  const sono = montou ? Math.round(interp(m.sono, d)) : 0;
  const fase2 = !!(m.fase2Dia && d >= m.fase2Dia);
  const temFoto = d >= m.fotoDia;
  return {
    id: m.id, nome: m.nome, idade: m.idade, cor: m.cor,
    foto: temFoto ? FOTO(m.id) : null,
    montou, perda, sono, fase2, fase2Dia: m.fase2Dia,
    score: montou ? scoreRank(perda, sono) : -1,
    eu: false,
  };
}

// linha da usuária real, com a MESMA fórmula
export function minhaLinha(s) {
  const perda = Math.round((pesoPerdido(s) || 0) * 10) / 10;
  const sono = scoreSono(s)?.pct || 0;
  const montou = !!s.receitaPreparadaEm;
  return {
    id: "eu", nome: s.perfil?.nome || "Você", idade: null, cor: "#fbd38d",
    foto: null,
    montou, perda, sono, fase2: !!s.fase2LiberadaEm, fase2Dia: null,
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
  return { dia, linhas: todas, posicao: todas.findIndex((l) => l.eu) + 1, total: todas.length };
}

// novidades do dia (feed curto e vivo)
export function novidadesDoDia(s) {
  const dia = diaProtocolo(s);
  const evs = [];
  for (const m of MEMBROS) {
    if (m.fotoDia === dia) evs.push(`📸 ${m.nome} adicionou a foto de perfil`);
    if (m.receitaDia === dia) evs.push(`🍵 ${m.nome} montou a Mistura do Sono`);
    if (m.fase2Dia === dia) evs.push(`🎉 ${m.nome} liberou a Fase 2 em ${m.fase2Dia} dias!`);
  }
  // eventos de "ontem" para o feed nunca ficar vazio nos primeiros dias
  if (!evs.length) {
    for (const m of MEMBROS) {
      if (m.fase2Dia && m.fase2Dia === dia - 1) evs.push(`🎉 ${m.nome} liberou a Fase 2 ontem!`);
      if (m.fotoDia === dia - 1) evs.push(`📸 ${m.nome} adicionou a foto de perfil ontem`);
    }
  }
  if (!evs.length) evs.push("🌙 A turma segue firme no ritual — faça o seu de hoje!");
  return evs.slice(0, 3);
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
