export const CONFIG = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "5554920011946",
  grupoModo: process.env.NEXT_PUBLIC_GRUPO_MODO || "demo", // "demo" | "off"
  premioEur: 150,
  legal: "https://noctalev.online/es/legal/",
  entregaDias: "2 a 5 días laborables",
};
export function linkCamila(nombre, extra = "") {
  const txt = `Hola Camila, soy ${nombre || ""}. Vengo de la app 🌙${extra ? " " + extra : ""}`;
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(txt)}`;
}
// abas com cadeado na tabbar enquanto o frasco não chega
export const BLOQ_ESPERA = ["/plan", "/evolucion"];
