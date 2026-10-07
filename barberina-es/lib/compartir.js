"use client";
// Gera imagem 1080x1350 do progresso e abre o Web Share (ou baixa)
import { pesoPerdido, diasRegistrados } from "./store";
import { kg } from "./fechas";

function cargar(src) {
  return new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
}

export async function compartirProgreso(s, rk) {
  const W = 1080, H = 1350;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");
  x.fillStyle = "#FBFAF7"; x.fillRect(0, 0, W, H);
  x.fillStyle = "#C8102E"; x.fillRect(0, 0, W, 34);
  const g = x.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "#B8860B"); g.addColorStop(0.5, "#F5D27A"); g.addColorStop(1, "#B8860B");
  x.fillStyle = g; x.fillRect(0, 34, W, 10);

  const img = await cargar("/img/frasco.png");
  if (img) { const h = 420, w = (img.width / img.height) * h; x.drawImage(img, W - w - 60, 120, w, h); }

  x.textAlign = "left";
  x.fillStyle = "#1B7F3B"; x.font = "800 64px Sora, sans-serif"; x.fillText("Barberina", 70, 170);
  x.fillStyle = "#8A92A6"; x.font = "700 30px Inter, sans-serif"; x.fillText("MI ACOMPAÑAMIENTO", 70, 215);

  x.font = "120px serif"; x.fillText(s.perfil.avatar || "🌸", 70, 400);
  x.fillStyle = "#141C30"; x.font = "800 58px Sora, sans-serif"; x.fillText(s.perfil.nombre, 70, 490);
  x.fillStyle = "#5B6478"; x.font = "600 34px Inter, sans-serif"; x.fillText(s.perfil.ciudad || "", 70, 540);

  x.fillStyle = "#1B7F3B"; x.font = "800 190px Sora, sans-serif"; x.fillText(`−${kg(pesoPerdido(s))} kg`, 60, 800);

  const box = (bx, t1, t2) => {
    x.fillStyle = "#fff"; x.strokeStyle = "#ECE8DF"; x.lineWidth = 3;
    x.beginPath(); x.roundRect(bx, 880, 300, 200, 30); x.fill(); x.stroke();
    x.textAlign = "center"; x.fillStyle = "#141C30"; x.font = "800 72px Sora, sans-serif"; x.fillText(t1, bx + 150, 985);
    x.fillStyle = "#8A92A6"; x.font = "700 28px Inter, sans-serif"; x.fillText(t2, bx + 150, 1035); x.textAlign = "left";
  };
  box(70, `${diasRegistrados(s)}`, "días seguidos");
  box(390, `${rk.posicion}ª`, `de ${rk.total} en el grupo`);
  box(710, `${rk.lineas[rk.posicion - 1]?.puntos || 0}`, "puntos");

  x.fillStyle = "#D97706"; x.font = "800 38px Inter, sans-serif"; x.textAlign = "center";
  x.fillText("Con Barberina Max y el Dr. Castellanos", W / 2, 1200);
  x.fillStyle = "#8A92A6"; x.font = "600 28px Inter, sans-serif"; x.fillText("Mi grupo de la semana 🌙", W / 2, 1250);

  const blob = await new Promise((ok) => c.toBlob(ok, "image/png"));
  const file = new File([blob], "mi-progreso-barberina.png", { type: "image/png" });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text: `Llevo −${kg(pesoPerdido(s))} kg con Barberina Max 💪` });
      return;
    }
  } catch { return; }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
}
