"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stars } from "../../components/ui";
import { load, save } from "../../lib/store";

export default function Celebracao() {
  const router = useRouter();
  const [s, setS] = useState(null);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    if (!st.fase2LiberadaEm) { router.replace("/"); return; }
    setS(st);
  }, [router]);

  if (!s) return <div className="app-bg min-h-dvh" />;

  function fechar() {
    const st = { ...s, celebracaoVista: true };
    save(st);
    router.replace("/");
  }

  return (
    <div className="app-bg relative max-w-md mx-auto min-h-dvh">
      <Stars />
      {/* confete simples */}
      {["🎉", "✨", "🌟", "💛", "🎊"].map((e, i) => (
        <div key={i} className="absolute text-[28px] anim-float pointer-events-none"
          style={{ top: `${8 + i * 6}%`, left: `${10 + i * 18}%`, animationDelay: `${i * 0.4}s` }}>{e}</div>
      ))}
      <div className="relative z-10 px-6 pt-16 pb-10 flex flex-col min-h-dvh justify-center text-center">
        <div className="text-[86px] anim-pop">🎉</div>
        <h1 className="text-[30px] font-black tracking-tight mt-6 leading-tight">
          Seu corpo <span className="text-green">respondeu!</span>
        </h1>
        <p className="text-[17px] font-extrabold text-gold mt-3">
          A Fase 2 foi liberada para você
        </p>
        <p className="text-sub2 text-[15px] font-semibold mt-5 leading-relaxed px-2">
          Seu organismo completou a adaptação da Fase 1. Agora é hora das
          <b className="text-txt"> Gotas Termo-Metabólicas</b> — que atacam o apetite diurno
          e os picos de glicemia. ☀️
        </p>

        <div className="card p-5 mt-7">
          <div className="text-[15px] font-extrabold">☀️ Fase 2 — Gotas Termo-Metabólicas</div>
          <ul className="text-left text-[13.5px] text-sub2 font-semibold mt-3 space-y-2">
            <li>✓ Controla a fome descontrolada da tarde</li>
            <li>✓ Estabiliza os picos de glicemia</li>
            <li>✓ Mesmo preparo simples de 10 minutos</li>
          </ul>
        </div>

        <a href={s.config?.checkoutFase2 || "#"} target="_blank" rel="noreferrer"
          className="cta-gold block w-full py-4 mt-7 text-[16px]">
          Quero desbloquear a Fase 2 🔓
        </a>
        <button onClick={fechar} className="mt-4 text-[13.5px] font-bold text-sub">
          Continuar na Fase 1 por enquanto
        </button>
      </div>
    </div>
  );
}
