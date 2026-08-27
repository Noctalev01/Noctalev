"use client";
// ============================================================
// 3.8 — Modal de celebração dos marcos da jornada (7/14/21/30 dias)
// Mesma vibe do ModalConquista: confete + vibração + bônus de pontos.
// ============================================================
import { useEffect } from "react";
import Confete from "./Confete";
import { vibrarFesta } from "./ui";

export default function ModalMarco({ marco, onFechar }) {
  useEffect(() => { vibrarFesta(); }, []);
  if (!marco) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6"
      style={{ background: "rgba(10,13,30,.82)", backdropFilter: "blur(6px)" }}>
      <Confete duracao={4200} quantidade={150} />
      <div className="card w-full max-w-[340px] p-7 text-center anim-pop"
        style={{ borderColor: "rgba(251,211,141,.45)", background: "linear-gradient(165deg, rgba(251,211,141,.10), rgba(26,32,68,.98))" }}>
        <div className="text-[54px] leading-none">{marco.emoji}</div>
        <div className="eyebrow mt-4" style={{ color: "#fbd38d" }}>Marco da jornada · Dia {marco.dia}</div>
        <div className="text-[20px] font-extrabold leading-tight mt-1.5">{marco.titulo}</div>
        <div className="text-[13px] text-sub2 font-semibold leading-relaxed mt-2.5">{marco.texto}</div>
        <div className="inline-block mt-4 px-4 py-1.5 rounded-full text-[13px] font-black text-[#3c2a10]"
          style={{ background: "linear-gradient(135deg,#fbd38d,#f6ad55)" }}>
          +15 pontos
        </div>
        <button onClick={onFechar} className="cta-gold w-full py-3.5 mt-5 text-[14.5px]">
          Continuar minha jornada 🌙
        </button>
      </div>
    </div>
  );
}
