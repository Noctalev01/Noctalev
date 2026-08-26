"use client";
// Guia em áudio: lê o texto em voz alta (voz do próprio celular, pt-BR).
// Funciona offline, sem baixar nada, e sempre lê o texto mais atual.
import { useEffect, useRef, useState } from "react";

function pegarVozPtBR() {
  try {
    const vozes = window.speechSynthesis.getVoices() || [];
    return (
      vozes.find((v) => v.lang === "pt-BR" && /female|feminin|Luciana|Francisca|Maria/i.test(v.name)) ||
      vozes.find((v) => v.lang === "pt-BR") ||
      vozes.find((v) => (v.lang || "").startsWith("pt")) ||
      null
    );
  } catch {
    return null;
  }
}

export default function GuiaAudio({ texto, rotulo = "Ouvir em voz alta", compacto = false }) {
  const [suporta, setSuporta] = useState(false);
  const [falando, setFalando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const utterRef = useRef(null);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window;
    setSuporta(ok);
    if (ok) {
      // dispara o carregamento das vozes (alguns navegadores só carregam depois)
      window.speechSynthesis.getVoices();
    }
    return () => {
      try { window.speechSynthesis.cancel(); } catch {}
    };
  }, []);

  // se o texto mudar (ex.: próximo passo), para a fala anterior
  useEffect(() => {
    if (falando || pausado) {
      try { window.speechSynthesis.cancel(); } catch {}
      setFalando(false);
      setPausado(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  if (!suporta || !texto) return null;

  function tocar() {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "pt-BR";
      u.rate = 0.92;   // um pouco mais devagar, tom calmo
      u.pitch = 1.0;
      const voz = pegarVozPtBR();
      if (voz) u.voice = voz;
      u.onend = () => { setFalando(false); setPausado(false); };
      u.onerror = () => { setFalando(false); setPausado(false); };
      utterRef.current = u;
      window.speechSynthesis.speak(u);
      setFalando(true);
      setPausado(false);
    } catch {}
  }

  function pausarOuContinuar() {
    try {
      if (pausado) { window.speechSynthesis.resume(); setPausado(false); }
      else { window.speechSynthesis.pause(); setPausado(true); }
    } catch {}
  }

  function parar() {
    try { window.speechSynthesis.cancel(); } catch {}
    setFalando(false);
    setPausado(false);
  }

  if (!falando) {
    return (
      <button
        onClick={tocar}
        className={compacto ? "text-[12.5px] font-extrabold rounded-full px-3.5 py-2" : "w-full py-3 text-[13.5px] font-extrabold rounded-xl"}
        style={{ background: "rgba(165,180,252,.12)", border: "1px solid rgba(165,180,252,.35)", color: "#a5b4fc" }}
      >
        🎧 {rotulo}
      </button>
    );
  }

  return (
    <div className={compacto ? "flex gap-2" : "flex gap-2.5"}>
      <button
        onClick={pausarOuContinuar}
        className={compacto ? "flex-1 text-[12.5px] font-extrabold rounded-full px-3 py-2" : "flex-1 py-3 text-[13.5px] font-extrabold rounded-xl"}
        style={{ background: "rgba(165,180,252,.16)", border: "1px solid rgba(165,180,252,.4)", color: "#a5b4fc" }}
      >
        {pausado ? "▶️ Continuar" : "⏸️ Pausar"}
      </button>
      <button
        onClick={parar}
        className={compacto ? "text-[12.5px] font-extrabold rounded-full px-3 py-2" : "py-3 px-5 text-[13.5px] font-extrabold rounded-xl"}
        style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.2)", color: "#cbd5e1" }}
      >
        ⏹️
      </button>
    </div>
  );
}
