// Conteúdo oficial das receitas (Fase 1 completa; 2 e 3 como teaser bloqueado)

export const FASE1 = {
  nome: "Mistura do Sono Profundo",
  emoji: "🍵",
  alvo: "Dormir melhor, baixar o modo alerta noturno e cortar os beliscos da noite.",
  custo: "~R$12–20 (tudo de mercado/feira) — rende ~14 noites",
  ingredientes: [
    {
      id: "camomila", txt: "4 colheres de sopa de camomila (flores secas)",
      onde: "Mercado (corredor de chás), feira, loja de produtos naturais ou farmácia.",
      alt: "Não achou a granel? Use 8 sachês de chá de camomila puro — é só abrir os sachês e usar o conteúdo.",
      dica: "Prefira 'camomila flores' pura, sem mistura com outros sabores.",
    },
    {
      id: "melissa", txt: "4 colheres de sopa de erva-cidreira / melissa (folhas secas)",
      onde: "Feira, loja de produtos naturais ou mercado (às vezes vem escrito 'melissa' ou 'erva-cidreira').",
      alt: "Não achou? Use 8 sachês de chá de erva-cidreira (abertos). Em último caso, capim-limão (capim-santo) seco também serve.",
      dica: "Erva-cidreira e melissa são a mesma planta — pode comprar qualquer uma das duas.",
    },
    {
      id: "maracuja", txt: "2 colheres de sopa de folhas de maracujá secas OU 4 sachês de chá de maracujá (abertos)",
      onde: "Mercado (sachês de 'chá de maracujá' são fáceis de achar) ou loja de produtos naturais.",
      alt: "Não achou de jeito nenhum? Pode montar a mistura sem ele — o chá continua funcionando. Acrescente depois, quando encontrar.",
      dica: "O sachê comum de chá de maracujá do mercado resolve — é só abrir e despejar.",
    },
    {
      id: "lavanda", txt: "1 colher de chá de lavanda alimentar (opcional)",
      onde: "Loja de produtos naturais ou internet (procure 'lavanda alimentar' ou 'lavanda para chá').",
      alt: "É opcional! Não achou? Pule sem culpa — a mistura funciona igual sem ela.",
      dica: "Só use lavanda própria para consumo (alimentar). Não use a de sabonete/decoração.",
    },
    {
      id: "mel", txt: "Mel (você usa na hora do chá: 1 colher de chá por xícara)",
      onde: "Qualquer mercado. Um pote pequeno já dura o protocolo todo.",
      alt: "Se preferir, pode usar sem mel ou com algumas gotas de adoçante natural (stevia). O mel é pelo sabor e conforto.",
      dica: "Adicione o mel só na hora de tomar, nunca dentro do pote da mistura.",
    },
  ],
  listaCompras: "🍵 Lista de compras — Mistura do Sono Profundo (NoctaLev)\n\n☐ Camomila (flores secas) — 4 colheres de sopa (ou 8 sachês de chá puro)\n☐ Erva-cidreira / melissa (folhas secas) — 4 colheres de sopa (ou 8 sachês)\n☐ Chá de maracujá — 2 colheres de sopa das folhas OU 4 sachês\n☐ Lavanda alimentar — 1 colher de chá (OPCIONAL, pode pular)\n☐ Mel — 1 pote pequeno\n☐ Pote de vidro com tampa (pode reaproveitar um de geleia/azeitona)\n\n💰 Custo total: ~R$12–20 · Rende ~14 noites",
  passos: [
    { titulo: "Separe o pote", emoji: "🫙", txt: "Pegue um pote de vidro com tampa (de azeitona ou geleia), bem lavado e seco." },
    { titulo: "Coloque a camomila", emoji: "🌼", txt: "Coloque 4 colheres de sopa de camomila (flores secas) dentro do pote." },
    { titulo: "Coloque a melissa", emoji: "🌿", txt: "Agora 4 colheres de sopa de erva-cidreira / melissa (folhas secas)." },
    { titulo: "Coloque o maracujá", emoji: "🍃", txt: "2 colheres de sopa de folhas de maracujá secas — ou abra 4 sachês de chá de maracujá e despeje o conteúdo." },
    { titulo: "Lavanda (opcional)", emoji: "💜", txt: "Se tiver, adicione 1 colher de chá de lavanda alimentar. Não achou? Sem problema — pule este passo." },
    { titulo: "Tampe e agite", emoji: "✨", txt: "Tampe o pote e agite bem para misturar tudo. Pronta! Rende ~14 noites. Guarde fechado em local escuro e seco (validade: 3+ meses)." },
  ],
  uso: "Toda noite: 1 colher de sopa da mistura na xícara, água quente por cima (quente, não fervendo), abafe 5–10 min com um pires, coe, adoce com 1 colher de chá de mel e tome morno, 30–60 min antes de deitar.",
  ritual: "Depois do chá: luz baixa + celular fora da cama. É esse combo que faz o sono realmente melhorar.",
  educativo: "O chá morno aquece seu corpo e, ao esfriar, dispara o sinal natural de sono. Dormir profundamente reduz o cortisol e a grelina — os hormônios que travam a queima de gordura. Seu chá da noite É parte do emagrecimento.",
  sabor: "Um chá floral suave e docinho com o mel. Achou forte? Use menos tempo de abafamento (5 min) — o efeito continua. 🍯",
  audioRitual:
    "Olá! Vamos preparar juntas o seu chá da noite. Respire fundo... esse momento é só seu. " +
    "Primeiro passo: coloque uma colher de sopa da sua mistura do sono na xícara. " +
    "Segundo passo: despeje água quente por cima. Atenção: água quente, mas não fervendo. Se a água ferveu, espere um minutinho antes de despejar. " +
    "Agora cubra a xícara com um pires e deixe abafar por cinco a dez minutos. Você pode usar o timer do aplicativo. " +
    "Enquanto o chá descansa, aproveite para diminuir as luzes da casa e deixar o celular de lado. " +
    "Quando o tempo terminar: coe o chá, adoce com uma colher de chá de mel, e tome morno, com calma, de trinta a sessenta minutos antes de deitar. " +
    "Lembre-se: dormir profundamente reduz o cortisol e a grelina, os hormônios que travam a queima de gordura. Seu chá da noite é parte do seu emagrecimento. " +
    "Boa noite... e bom descanso.",
};

export const FASE2_TEASER = {
  nome: "Shot Termo-Metabólico",
  emoji: "☀️",
  teaser: "Ataca o apetite diurno e os picos de glicemia. Seu corpo precisa estar pronto para ele.",
};

export const FASE3_TEASER = {
  nome: "Fórmula de Energia & Manutenção",
  emoji: "🔥",
  teaser: "Consolida seus resultados e evita o efeito sanfona.",
};
