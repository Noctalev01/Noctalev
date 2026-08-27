"use client";
// ============================================================
// 3.1 — Modal de celebração de conquista (com confete + vibração)
// Antes, só a "Alquimista" tinha festa; as outras 8 desbloqueavam
// em silêncio. Agora TODA conquista nova abre esta celebração.
// Uso: <ModalConquista tipo="tres_noites" onFechar={...} />
// ============================================================
import { useEffect } from "react";
import { CONQUISTAS } from "../lib/store";
import { vibrarFesta } from "./ui";
import Confete from "./Confete";

export default function ModalConquista({ tipo, onFechar }) {
  const c = CONQUISTAS[tipo];
  useEffect(() => { vibrarFesta(); }, []);
  if (!c) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-7"
      style={{ background: "rgba(5,7,15,.78)", backdropFilter: "blur(4px)" }}>
      <Confete quantidade={120} duracao={3400} />
      <div className="card w-full p-7 text-center anim-pop relative z-10"
        style={{ borderColor: "rgba(251,211,141,.5)", background: "linear-gradient(165deg, #1d2350, #141936)" }}>
        <div className="eyebrow" style={{ color: "#fbd38d" }}>Conquista desbloqueada</div>
        <div className="text-[64px] mt-3 anim-float">{c.emoji}</div>
        <h2 className="text-[23px] font-black tracking-tight mt-2">{c.nome}</h2>
        <p className="text-[13.5px] text-sub2 font-semibold mt-1.5">{c.desc}</p>
        <div className="inline-block rounded-full px-4 py-1.5 mt-4 text-[13px] font-black text-gold"
          style={{ background: "rgba(251,211,141,.12)", border: "1px solid rgba(251,211,141,.4)" }}>
          +20 pontos ⭐
        </div>
        <button onClick={onFechar} className="cta-gold w-full py-3.5 mt-6 text-[15px]">
          Continuar brilhando ✨
        </button>
      </div>
    </div>
  );
}
