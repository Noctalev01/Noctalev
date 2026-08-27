"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stars, Logo, Splash, vibrar, vibrarFesta } from "../../components/ui";
import Confete from "../../components/Confete";
import { load, save, concluirPreparo } from "../../lib/store";
import { syncNow } from "../../lib/sync";
import { FASE1 } from "../../lib/receitas";
import GuiaAudio from "../../components/GuiaAudio";

export default function Preparo() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [passo, setPasso] = useState(0);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    if (st.receitaPreparadaEm) { router.replace("/receita"); return; }
    setS(st);
    setPasso(Math.min(st.preparoPasso || 0, FASE1.passos.length - 1));
  }, [router]);

  if (!s) return <Splash />;

  const total = FASE1.passos.length;
  const p = FASE1.passos[passo];

  function avancar() {
    const st = { ...s };
    if (passo + 1 >= total) {
      concluirPreparo(st);
      setPronto(true);
      vibrarFesta();
      syncNow();
      return;
    }
    vibrar(12);
    st.preparoPasso = passo + 1;
    setS(save(st));
    setPasso(passo + 1);
  }

  if (pronto) {
    return (
      <div className="app-bg relative max-w-md mx-auto min-h-dvh">
        <Stars />
        <Confete />
        <div className="relative z-10 px-6 pt-16 pb-10 flex flex-col items-center text-center min-h-dvh justify-center">
          <div className="text-[80px] anim-pop">🧪</div>
          <h1 className="text-[28px] font-black tracking-tight mt-6">Conquista desbloqueada!</h1>
          <div className="card px-6 py-4 mt-5">
            <div className="text-[18px] font-extrabold text-gold">🏆 Alquimista</div>
            <div className="text-[13.5px] text-sub2 font-semibold mt-1">Montou sua Mistura do Sono! +50 pontos ⭐</div>
          </div>
          <p className="text-[15px] text-sub2 font-semibold mt-6 leading-relaxed">
            Seu acompanhamento diário está liberado.<br />
            <b className="text-txt">Hoje à noite: seu primeiro chá 🍵</b>
          </p>
          <button onClick={() => router.replace("/")} className="cta-gold w-full py-4 mt-8 text-[16px]">
            Ir para o meu painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-bg relative max-w-md mx-auto min-h-dvh">
      <Stars />
      <div className="relative z-10 px-6 pt-12 pb-10 flex flex-col min-h-dvh">
        <Logo />
        <div className="flex gap-1.5 mt-8">
          {FASE1.passos.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= passo ? "bg-gold" : "bg-white/15"}`} />
          ))}
        </div>
        <div className="text-[12.5px] text-sub font-bold mt-3">Passo {passo + 1} de {total} · leva só 5 minutos, sem fogão 😉</div>

        <div className="flex-1 flex flex-col justify-center text-center">
          <div className="text-[72px] anim-pop" key={passo}>{p.emoji}</div>
          <h1 className="text-[26px] font-black tracking-tight mt-5">{p.titulo}</h1>
          <p className="text-sub2 text-[15.5px] font-semibold mt-4 leading-relaxed px-1">{p.txt}</p>
          <div className="flex justify-center mt-4">
            <GuiaAudio texto={`Passo ${passo + 1}. ${p.titulo}. ${p.txt}`} rotulo="Ouvir este passo" compacto />
          </div>
        </div>

        <button onClick={avancar} className="cta-gold w-full py-4 text-[16px]">
          {passo + 1 >= total ? "Concluir preparo ✅" : "Próximo passo →"}
        </button>
        {passo > 0 && (
          <button onClick={() => { const st = { ...s }; st.preparoPasso = passo - 1; setS(save(st)); setPasso(passo - 1); }}
            className="mt-3 text-[13px] font-bold text-sub">← Voltar</button>
        )}
      </div>
    </div>
  );
}
