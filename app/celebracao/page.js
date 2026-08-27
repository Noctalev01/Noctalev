"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stars, Splash, vibrarFesta } from "../../components/ui";
import Confete from "../../components/Confete";
import { load, save } from "../../lib/store";
import { syncNow } from "../../lib/sync";

export default function Celebracao() {
  const router = useRouter();
  const [s, setS] = useState(null);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    if (!st.fase2LiberadaEm) { router.replace("/"); return; }
    setS(st);
    vibrarFesta();
  }, [router]);

  if (!s) return <Splash />;

  function fechar() {
    const st = { ...s, celebracaoVista: true };
    save(st);
    syncNow();
    router.replace("/");
  }

  return (
    <div className="app-bg relative max-w-md mx-auto min-h-dvh">
      <Stars />
      <Confete quantidade={160} duracao={4500} />
      <div className="relative z-10 px-6 pt-14 pb-10 flex flex-col min-h-dvh justify-center text-center">
        <div className="text-[64px] anim-pop">🎉</div>
        <h1 className="text-[30px] font-black tracking-tight mt-4 leading-tight">
          Seu corpo <span className="text-green">respondeu!</span>
        </h1>
        <p className="text-[17px] font-extrabold text-gold mt-3">
          Você evoluiu — a Fase 2 foi liberada
        </p>
        <p className="text-sub2 text-[15px] font-semibold mt-4 leading-relaxed px-2">
          Os seus rituais e check-ins mostraram que o seu organismo completou a
          adaptação da Fase 1. Agora é hora do
          <b className="text-txt"> Shot Termo-Metabólico</b> — que ataca o apetite diurno
          e os picos de glicemia.
        </p>

        <div className="card mt-6 overflow-hidden text-left" style={{ padding: 0 }}>
          <div className="relative h-[130px]">
            <img src="/img/fase2-shot.jpg" alt="Shot Termo-Metabólico" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(16,20,44,.05), rgba(16,20,44,.88))" }} />
            <div className="absolute bottom-3 left-4">
              <div className="text-[15px] font-extrabold">Fase 2 — Shot Termo-Metabólico</div>
            </div>
          </div>
          <ul className="text-left text-[13.5px] text-sub2 font-semibold p-[14px_18px_18px] space-y-2">
            <li>✓ Controla a fome descontrolada da tarde</li>
            <li>✓ Estabiliza os picos de glicemia</li>
            <li>✓ Mesmo preparo simples de 10 minutos</li>
          </ul>
        </div>

        <a href={s.config?.checkoutFase2 || "#"} target="_blank" rel="noreferrer"
          className="cta-gold block w-full py-4 mt-6 text-[16px]">
          Quero desbloquear a Fase 2
        </a>
        <button onClick={fechar} className="mt-4 text-[13.5px] font-bold text-sub">
          Continuar na Fase 1 por enquanto
        </button>
      </div>
    </div>
  );
}
