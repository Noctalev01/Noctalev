// Fechas siempre en hora de Madrid (Europe/Madrid)
const TZ = "Europe/Madrid";
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// yyyy-mm-dd en Madrid
export function hoyMadrid(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
export function horaMadrid(d = new Date()) {
  return parseInt(new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hour12: false }).format(d), 10) % 24;
}
export function sumarDias(iso, n) {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function diffDias(a, b) {
  return Math.round((new Date(b + "T12:00:00Z") - new Date(a + "T12:00:00Z")) / 86400000);
}
export function diaSemana(iso) { return new Date(iso + "T12:00:00Z").getUTCDay(); }
// lunes de la semana de iso
export function lunesDe(iso) {
  const w = diaSemana(iso);
  return sumarDias(iso, w === 0 ? -6 : 1 - w);
}
// "martes 7 de octubre"
export function fechaLarga(iso) {
  const d = new Date(iso + "T12:00:00Z");
  return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`;
}
// "7 oct"
export function fechaCorta(iso) {
  const d = new Date(iso + "T12:00:00Z");
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()].slice(0, 3)}`;
}
export function fechaDM(iso) {
  const d = new Date(iso + "T12:00:00Z");
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
export function diaNombre(iso) { return DIAS[diaSemana(iso)]; }
export function saludo() {
  const h = horaMadrid();
  if (h >= 6 && h < 13) return "Buenos días";
  if (h >= 13 && h < 21) return "Buenas tardes";
  return "Buenas noches";
}
// decimal con coma
export function kg(n, dec = 1) {
  return (Math.round((Number(n) || 0) * 10 ** dec) / 10 ** dec).toFixed(dec).replace(".", ",");
}
// ms hasta domingo 23:59:59 (Madrid) de la semana actual
export function msHastaCierre(ahora = new Date()) {
  const hoy = hoyMadrid(ahora);
  const w = diaSemana(hoy);
  const diasRest = w === 0 ? 0 : 7 - w;
  const h = horaMadrid(ahora);
  const m = parseInt(new Intl.DateTimeFormat("en-US", { timeZone: TZ, minute: "numeric" }).format(ahora), 10);
  const s = ahora.getSeconds();
  const transcurrido = (h * 3600 + m * 60 + s) * 1000;
  return diasRest * 86400000 + (86400000 - 1000 - transcurrido);
}
