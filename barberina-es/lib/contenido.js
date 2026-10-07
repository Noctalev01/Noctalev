// Conteúdo do app (es-ES). "libre" = visível já durante a espera do frasco.

export const CONSEJOS_DR = [
  {
    semana: 1,
    titulo: "La cápsula, siempre a la misma hora",
    texto:
      "Tómala por la noche, después de cenar, con un vaso de agua. Tu cuerpo funciona por ritmos: si la tomas cada día a la misma hora, la berberina trabaja mejor mientras duermes. Y apunta tu peso por la mañana, antes de desayunar.",
  },
  {
    semana: 2,
    titulo: "Cena antes de las 21:00",
    texto:
      "Cuanto más temprano cenas, mejor duermes y menos picoteas al día siguiente. No hace falta pasar hambre: plato con verdura, una proteína y poco pan. La constancia gana a la perfección.",
  },
  {
    semana: 3,
    titulo: "Agua al despertar",
    texto:
      "Un vaso grande de agua nada más levantarte, antes del café. Ayuda a deshinchar y a que la báscula refleje lo que de verdad estás logrando.",
  },
  {
    semana: 4,
    titulo: "Si la báscula se para, no te pares tú",
    texto:
      "Es normal que algún día el peso no baje o suba 200 gramos. Mira la semana, no el día. Las que más pierden en este grupo son las que apuntan cada mañana, también los días malos.",
  },
];

export const CONSEJO_ESPERA = {
  titulo: "Mientras llega tu frasco",
  texto:
    "Aprovecha estos días para preparar a tu cuerpo: cena un poco antes, bebe agua y acuéstate a la misma hora. Cuando llegue Barberina Max, empezarás con ventaja. Y recuerda: pagas al recibirlo, así que ten el importe preparado para el repartidor.",
};

export const RECETAS = [
  {
    id: "tostada-aguacate", libre: true, tipo: "Desayuno", nombre: "Tostada de centeno con aguacate y huevo",
    kcal: 310, min: 8, emoji: "🥑",
    ingredientes: ["1 rebanada de pan de centeno", "½ aguacate", "1 huevo", "Tomate rallado", "Pimienta y una pizca de sal"],
    pasos: ["Tuesta el pan y úntale el tomate.", "Machaca el aguacate y ponlo encima.", "Haz el huevo a la plancha o escalfado y corónalo."],
  },
  {
    id: "gazpacho", libre: true, tipo: "Comida", nombre: "Gazpacho andaluz ligero",
    kcal: 140, min: 10, emoji: "🍅",
    ingredientes: ["4 tomates maduros", "½ pepino", "½ pimiento verde", "1 diente de ajo", "1 cda. de aceite de oliva virgen extra", "Vinagre de Jerez"],
    pasos: ["Trocea todo y tritúralo con un vaso de agua fría.", "Añade el aceite y el vinagre y vuelve a triturar.", "Enfría en la nevera al menos 1 hora."],
  },
  {
    id: "merluza", tipo: "Cena", nombre: "Merluza al horno con verduras",
    kcal: 290, min: 25, emoji: "🐟",
    ingredientes: ["1 lomo de merluza", "1 calabacín", "½ cebolla", "1 tomate", "Limón, perejil y aceite de oliva"],
    pasos: ["Corta las verduras en láminas y hornéalas 10 min a 200 °C.", "Pon la merluza encima con limón y perejil.", "Hornea 12 minutos más."],
  },
  {
    id: "tortilla-calabacin", tipo: "Cena", nombre: "Tortilla de calabacín sin patata",
    kcal: 240, min: 15, emoji: "🍳",
    ingredientes: ["2 huevos + 1 clara", "1 calabacín", "½ cebolla", "1 cdta. de aceite de oliva"],
    pasos: ["Pocha la cebolla y el calabacín en la sartén.", "Bate los huevos y mézclalos con la verdura.", "Cuaja a fuego lento por ambos lados."],
  },
  {
    id: "ensalada-garbanzos", tipo: "Comida", nombre: "Ensalada templada de garbanzos y espinacas",
    kcal: 380, min: 12, emoji: "🥗",
    ingredientes: ["150 g de garbanzos cocidos", "Un puñado de espinacas", "1 huevo duro", "Pimentón de la Vera", "Aceite y limón"],
    pasos: ["Saltea los garbanzos con pimentón 3 minutos.", "Añade las espinacas hasta que se ablanden.", "Sirve con el huevo y aliña con limón."],
  },
  {
    id: "crema-calabaza", tipo: "Cena", nombre: "Crema de calabaza y jengibre",
    kcal: 180, min: 25, emoji: "🎃",
    ingredientes: ["400 g de calabaza", "1 puerro", "Un trocito de jengibre", "Caldo de verduras", "Semillas de calabaza"],
    pasos: ["Rehoga el puerro, añade calabaza y jengibre.", "Cubre con caldo y cuece 20 minutos.", "Tritura y sirve con semillas por encima."],
  },
  {
    id: "pollo-limon", tipo: "Comida", nombre: "Pollo al limón con judías verdes",
    kcal: 340, min: 20, emoji: "🍋",
    ingredientes: ["150 g de pechuga de pollo", "200 g de judías verdes", "1 limón", "Ajo y romero"],
    pasos: ["Marina el pollo con limón, ajo y romero.", "Hazlo a la plancha 5 min por lado.", "Acompaña con las judías al vapor."],
  },
  {
    id: "yogur-frutos", tipo: "Merienda", nombre: "Yogur griego con frutos rojos y canela",
    kcal: 160, min: 3, emoji: "🫐",
    ingredientes: ["1 yogur griego natural sin azúcar", "Un puñado de frutos rojos", "Canela", "5 nueces"],
    pasos: ["Pon el yogur en un bol.", "Añade frutos rojos y nueces troceadas.", "Espolvorea canela (ayuda con los antojos de dulce)."],
  },
  {
    id: "infusion-noche", tipo: "Noche", nombre: "Infusión de la noche (para dormir mejor)",
    kcal: 5, min: 6, emoji: "🌙",
    ingredientes: ["1 cdta. de melisa", "1 cdta. de manzanilla", "1 rama de canela", "Unas gotas de limón"],
    pasos: ["Hierve 250 ml de agua con la canela.", "Apaga y añade melisa y manzanilla 5 minutos.", "Tómala 30 minutos antes de dormir, junto a tu cápsula."],
  },
];

export const PLAN_SEMANAL = [
  { dia: "Lunes", desayuno: "Tostada de centeno con aguacate", comida: "Pollo al limón con judías", cena: "Crema de calabaza" },
  { dia: "Martes", desayuno: "Yogur griego con frutos rojos", comida: "Ensalada de garbanzos", cena: "Merluza al horno" },
  { dia: "Miércoles", desayuno: "Tostada con tomate y pavo", comida: "Lentejas con verduras", cena: "Tortilla de calabacín" },
  { dia: "Jueves", desayuno: "Yogur griego con nueces", comida: "Gazpacho + pechuga a la plancha", cena: "Crema de calabaza" },
  { dia: "Viernes", desayuno: "Tostada de centeno con aguacate", comida: "Salmón con espárragos", cena: "Ensalada templada" },
  { dia: "Sábado", desayuno: "Huevos revueltos con espinacas", comida: "Paella de verduras (ración pequeña)", cena: "Merluza al horno" },
  { dia: "Domingo", desayuno: "Yogur con frutos rojos", comida: "Cocido ligero (sin tocino)", cena: "Tortilla de calabacín" },
];

export const GUIA_CAPSULA = [
  "1 cápsula al día, por la noche, después de cenar.",
  "Con un vaso grande de agua.",
  "Mejor siempre a la misma hora (ej. 22:00).",
  "Por la mañana: agua, báscula y registro en la app (20 segundos).",
  "No superes la dosis indicada. Si tomas medicación para la diabetes, consulta a tu médico.",
];

// funcionalidades bloqueadas enquanto o frasco não chega (para a tela de "espera")
export const BLOQUEADAS = [
  { icono: "⚖️", titulo: "Registro diario de peso y sueño", texto: "20 segundos cada mañana" },
  { icono: "🏆", titulo: "Ranking y premio semanal", texto: "Compite con tu grupo" },
  { icono: "🥗", titulo: "Recetas fit y plan semanal", texto: "Menús para acelerar resultados" },
  { icono: "📈", titulo: "Mi evolución", texto: "Gráficas de peso y sueño" },
  { icono: "👩‍⚕️", titulo: "Consejos del Dr. Castellanos", texto: "Uno nuevo cada semana" },
];
