"use client";
// ============================================================
// 1.6 — Confete de verdade (canvas), leve e sem bibliotecas.
// Uso: <Confete /> em telas de celebração/conquista.
// Cores da identidade: dourado, lilás, verde e branco.
// ============================================================
import { useEffect, useRef } from "react";

const CORES = ["#fbd38d", "#f6ad55", "#a5b4fc", "#7ee8b2", "#ffffff", "#e9d8fd"];

export default function Confete({ duracao = 3800, quantidade = 130 }) {
  const ref = useRef(null);

  useEffect(() => {
    // respeita acessibilidade (menos movimento)
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = (canvas.width = canvas.offsetWidth * dpr);
    let h = (canvas.height = canvas.offsetHeight * dpr);

    // partículas: mistura de retângulos (papel) e círculos
    const parts = Array.from({ length: quantidade }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * h * 0.5,
      vx: (Math.random() - 0.5) * 1.6 * dpr,
      vy: (1.2 + Math.random() * 2.2) * dpr,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.18,
      tam: (4 + Math.random() * 6) * dpr,
      cor: CORES[Math.floor(Math.random() * CORES.length)],
      circulo: Math.random() < 0.25,
      balanco: Math.random() * Math.PI * 2, // oscilação lateral (efeito papel)
    }));

    const t0 = performance.now();
    let raf;
    function frame(t) {
      const decorrido = t - t0;
      ctx.clearRect(0, 0, w, h);
      const fade = decorrido > duracao ? Math.max(0, 1 - (decorrido - duracao) / 800) : 1;
      ctx.globalAlpha = fade;

      for (const p of parts) {
        p.balanco += 0.05;
        p.x += p.vx + Math.sin(p.balanco) * 0.7 * dpr;
        p.y += p.vy;
        p.rot += p.vrot;
        if (p.y > h + 20 && fade === 1) { p.y = -15; p.x = Math.random() * w; }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.cor;
        if (p.circulo) {
          ctx.beginPath();
          ctx.arc(0, 0, p.tam / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.tam / 2, -p.tam / 4, p.tam, p.tam / 2);
        }
        ctx.restore();
      }

      if (decorrido < duracao + 850) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, w, h);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [duracao, quantidade]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-50 w-full h-full max-w-md mx-auto"
      aria-hidden="true"
    />
  );
}
