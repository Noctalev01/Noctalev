"use client";
// ============================================================
// 4.3 — Modo Noite do ritual: escurece a tela e deixa a luz
// quente (corta o azul), para o celular não atrapalhar o sono
// enquanto ela segue o passo a passo do chá.
// ============================================================
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { vibrar } from "./ui";

export default function ModoNoite() {
  const [ativo, setAtivo] = useState(false);
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  function alternar() {
    vibrar(10);
    setAtivo((a) => !a);
  }

  return (
    <>
      <button onClick={alternar}
        className="w-full py-3 mt-3 rounded-2xl text-[13.5px] font-extrabold flex items-center justify-center gap-2"
        style={ativo
          ? { background: "rgba(246,173,85,.16)", border: "1px solid rgba(246,173,85,.5)", color: "#f6ad55" }
          : { background: "rgba(165,180,252,.08)", border: "1px solid rgba(165,180,252,.25)", color: "#a5b4fc" }}>
        {ativo ? "🕯️ Modo noite ligado — toque para desligar" : "🌙 Ligar modo noite (tela quente e escura)"}
      </button>

      {montado && ativo && createPortal(
        <>
          {/* camada quente: corta a luz azul e escurece, sem bloquear toques */}
          <div className="fixed inset-0 z-[90] pointer-events-none"
            style={{ background: "rgba(255,120,20,.16)", mixBlendMode: "multiply" }} />
          <div className="fixed inset-0 z-[90] pointer-events-none"
            style={{ background: "rgba(10,6,0,.45)" }} />
          {/* botão flutuante para desligar rápido */}
          <button onClick={alternar}
            className="fixed bottom-5 right-5 z-[95] px-4 py-2.5 rounded-full text-[12.5px] font-extrabold"
            style={{ background: "rgba(30,20,8,.92)", border: "1px solid rgba(246,173,85,.5)", color: "#f6ad55" }}>
            🕯️ desligar
          </button>
        </>,
        document.body
      )}
    </>
  );
}
