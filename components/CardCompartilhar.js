"use client";
// ============================================================
// 3.6 — "Compartilhar minha evolução": gera uma imagem bonita
// (1080×1350, formato ideal p/ WhatsApp/Instagram) com os números
// da usuária e abre o compartilhamento nativo do celular.
// Nunca inclui foto — só números. Privacidade garantida.
// ============================================================
import { useState } from "react";
import { vibrar } from "./ui";

function arred(x, r) {
  // retângulo arredondado
  return (ctx) => {
    const { x: X, y: Y, w, h } = x;
    ctx.beginPath();
    ctx.moveTo(X + r, Y);
    ctx.arcTo(X + w, Y, X + w, Y + h, r);
    ctx.arcTo(X + w, Y + h, X, Y + h, r);
    ctx.arcTo(X, Y + h, X, Y, r);
    ctx.arcTo(X, Y, X + w, Y, r);
    ctx.closePath();
  };
}

async function gerarImagem({ nome, dias, kg, sonoPct, streak, nivel }) {
  const W = 1080, H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // fundo noturno com gradiente da marca
  const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
  g.addColorStop(0, "#1a2044"); g.addColorStop(0.45, "#141936"); g.addColorStop(1, "#10142c");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // estrelas
  ctx.fillStyle = "rgba(255,255,255,.35)";
  const seed = [[90,120,4],[240,80,5],[420,180,3],[640,90,4],[860,150,5],[980,260,3],[150,320,3],[520,300,4],[780,360,3],[300,240,2],[940,420,2],[60,460,3]];
  for (const [x, y, r] of seed) { ctx.beginPath(); ctx.arc(x, y, r / 2, 0, Math.PI * 2); ctx.fill(); }

  // lua crescente
  ctx.fillStyle = "#a5b4fc";
  ctx.beginPath(); ctx.arc(W - 170, 190, 70, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#161b3d";
  ctx.beginPath(); ctx.arc(W - 140, 165, 62, 0, Math.PI * 2); ctx.fill();

  // logo
  ctx.fillStyle = "#eef0fb";
  ctx.font = "900 64px Inter, sans-serif";
  ctx.fillText("NoctaLev", 80, 190);
  ctx.fillStyle = "#8f97c0";
  ctx.font = "700 30px Inter, sans-serif";
  ctx.fillText("PROTOCOLO NOTURNO", 82, 240);

  // título
  ctx.fillStyle = "#eef0fb";
  ctx.font = "900 72px Inter, sans-serif";
  ctx.fillText("Minha evolução", 80, 420);
  ctx.fillStyle = "#fbd38d";
  ctx.font = "800 40px Inter, sans-serif";
  ctx.fillText(`${dias} ${dias === 1 ? "dia" : "dias"} de jornada · ${nivel.emoji} ${nivel.nome}`, 80, 490);

  // cartões de métricas
  const cards = [
    { v: kg > 0 ? `−${kg.toFixed(1).replace(".", ",")} kg` : "Em progresso", l: "eliminados", cor: "#7ee8b2" },
    { v: sonoPct != null ? `${sonoPct}%` : "—", l: "qualidade do sono", cor: "#a5b4fc" },
    { v: `${streak}`, l: streak === 1 ? "noite seguida" : "noites seguidas", cor: "#fbd38d" },
  ];
  cards.forEach((c, i) => {
    const y = 580 + i * 200;
    ctx.fillStyle = "rgba(255,255,255,.05)";
    arred({ x: 80, y, w: W - 160, h: 168 }, 28)(ctx); ctx.fill();
    ctx.strokeStyle = "rgba(165,180,252,.2)"; ctx.lineWidth = 2;
    arred({ x: 80, y, w: W - 160, h: 168 }, 28)(ctx); ctx.stroke();
    ctx.fillStyle = c.cor;
    ctx.font = "900 84px Inter, sans-serif";
    ctx.fillText(c.v, 130, y + 108);
    ctx.fillStyle = "#8f97c0";
    ctx.font = "700 34px Inter, sans-serif";
    const wv = ctx.measureText(c.v).width;
    ctx.fillText(c.l, 150 + ctx.measureText(" ").width + (c.v.length * 46), y + 104);
  });

  // rodapé
  ctx.fillStyle = "rgba(251,211,141,.12)";
  arred({ x: 80, y: 1195, w: W - 160, h: 90 }, 24)(ctx); ctx.fill();
  ctx.fillStyle = "#fbd38d";
  ctx.font = "800 36px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🌙 Dormir bem virou meu segredo", W / 2, 1253);
  ctx.textAlign = "left";

  return new Promise((res) => canvas.toBlob((b) => res(b), "image/png", 0.95));
}

export default function CardCompartilhar({ nome, dias, kg, sonoPct, streak, nivel }) {
  const [gerando, setGerando] = useState(false);

  async function compartilhar() {
    vibrar();
    setGerando(true);
    try {
      const blob = await gerarImagem({ nome, dias, kg, sonoPct, streak, nivel });
      const file = new File([blob], "minha-evolucao-noctalev.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Minha evolução no NoctaLev" });
      } else {
        // computador / navegador sem share: baixa a imagem
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "minha-evolucao-noctalev.png"; a.click();
        URL.revokeObjectURL(url);
      }
    } catch {}
    setGerando(false);
  }

  return (
    <button onClick={compartilhar} disabled={gerando}
      className="cta-gold w-full py-3.5 text-[14.5px] disabled:opacity-60">
      {gerando ? "Preparando sua imagem…" : "Compartilhar minha evolução 💛"}
    </button>
  );
}
