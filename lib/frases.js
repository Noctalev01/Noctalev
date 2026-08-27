// ============================================================
// Frases motivacionais da MANHÃ — módulo COMPARTILHADO
// (sem "use client": pode ser importado tanto pelo app quanto
// pelas rotas de servidor, ex. o cron de push das 08:30).
// Rotação por data: todas as usuárias veem a mesma frase no dia.
// ============================================================

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

// Data de hoje em São Paulo no formato YYYY-MM-DD (funciona no servidor e no cliente)
export function hojeSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function fraseDeHoje() {
  const seed = parseInt(hojeSaoPaulo().replaceAll("-", ""), 10);
  return FRASES_MANHA[seed % FRASES_MANHA.length];
}
