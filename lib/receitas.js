// Conteúdo oficial das receitas (Fase 1 completa; 2 e 3 como teaser bloqueado)

export const FASE1 = {
  nome: "Gotas do Sono Profundo",
  emoji: "🌙",
  alvo: "Dormir melhor, baixar o modo alerta noturno e cortar os beliscos da noite.",
  custo: "~R$15–25 (tudo de mercado/feira)",
  ingredientes: [
    { id: "camomila", txt: "2 colheres de sopa de camomila (flores secas)" },
    { id: "melissa", txt: "2 colheres de sopa de erva-cidreira / melissa (folhas secas)" },
    { id: "maracuja", txt: "1 colher de sopa de folhas de maracujá secas OU 2 sachês de chá de maracujá" },
    { id: "lavanda", txt: "1 colher de chá de lavanda alimentar (opcional)" },
    { id: "vinagre", txt: "200 ml de vinagre de maçã (ou álcool de cereais)" },
    { id: "mel", txt: "1 colher de sopa de mel" },
  ],
  passos: [
    { titulo: "Separe o pote", emoji: "🫙", txt: "Separe um pote de vidro com tampa (de azeitona ou geleia), bem lavado e seco." },
    { titulo: "Coloque as ervas", emoji: "🌿", txt: "Coloque todas as ervas dentro do pote: camomila, melissa, maracujá e a lavanda (se tiver)." },
    { titulo: "Aqueça o vinagre", emoji: "🔥", txt: "Aqueça o vinagre numa panelinha até começar a soltar vaporzinho — QUASE ferver. Se ferver, perde os compostos. Desligue o fogo.", timer: 180 },
    { titulo: "Despeje sobre as ervas", emoji: "🫗", txt: "Despeje o vinagre quente sobre as ervas até cobrir tudo. Misture bem com uma colher." },
    { titulo: "Acrescente o mel", emoji: "🍯", txt: "Acrescente 1 colher de sopa de mel, misture e tampe o pote." },
    { titulo: "Descanse 24 horas", emoji: "⏳", txt: "Deixe descansar 24h dentro do armário (no escuro). Agite o pote 2 ou 3 vezes nesse período. O app vai contar o tempo para você!", espera24h: true },
    { titulo: "Coe bem", emoji: "🧺", txt: "Coe com peneira fina (ou pano de prato limpo), espremendo bem as ervas para tirar todo o líquido." },
    { titulo: "Guarde na geladeira", emoji: "🧊", txt: "Guarde o líquido coado num vidro fechado NA GELADEIRA. Validade: 14 dias (vinagre) ou 6+ meses (álcool). Se tiver conta-gotas, encha o frasquinho." },
  ],
  uso: "15 gotas OU 1 colher de chá rasa em 2 dedos de água, 30 min antes de dormir.",
  ritual: "Ritual associado: luz baixa depois das gotas + celular fora da cama. É esse combo que faz o sono realmente melhorar.",
  sabor: "Parece um chazinho gelado concentrado, não um remédio. Achou forte? Dilua em meio copo de água com gelo — o efeito é o mesmo. 🍯",
};

export const FASE2_TEASER = {
  nome: "Gotas Termo-Metabólicas",
  emoji: "☀️",
  teaser: "Ataca o apetite diurno e os picos de glicemia. Seu corpo precisa estar pronto para ela.",
};

export const FASE3_TEASER = {
  nome: "Gotas de Energia & Manutenção",
  emoji: "🔥",
  teaser: "Consolida seus resultados e evita o efeito sanfona.",
};
