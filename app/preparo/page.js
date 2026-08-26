"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stars, Logo } from "../../components/ui";
import { load, save, concluirPreparo } from "../../lib/store";
import { syncNow } from "../../lib/sync";
import { FASE1 } from "../../lib/receitas";

function fmtCountdown(ms) {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function Preparo() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [passo, setPasso] = useState(0);
  const [agora, setAgora] = useState(Date.now());
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    if (st.receitaPreparadaEm) { router.replace("/receita"); return; }
    setS(st);
    setPasso(st.preparoPasso || 0);
  }, [router]);

  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!s) return <div className="app-bg min-h-dvh" />;

  const total = FASE1.passos.length;
  const p = FASE1.passos[passo];
  const esperaFim = s.preparoIniciadoEm ? new Date(s.preparoIniciadoEm).getTime() + 24 * 3600000 : null;
  const restante = esperaFim ? esperaFim - agora : null;
  const esperaConcluida = restante !== null && restante <= 0;

  function avancar() {
    const st = { ...s };
    if (p.espera24h && !st.preparoIniciadoEm) {
      st.preparoIniciadoEm = new Date().toISOString();
      st.preparoPasso = passo;
      setS(save(st));
      syncNow();
      return; // fica na tela do countdown
    }
    if (passo + 1 >= total) {
      concluirPreparo(st);
      setPronto(true);
      syncNow();
      return;
    }
    st.preparoPasso = passo + 1;
    setS(save(st));
    setPasso(passo + 1);
  }

  if (pronto) {
    return (
      <div className="app-bg relative max-w-md mx-auto min-h-dvh">
        <Stars />
        <div className="relative z-10 px-6 pt-16 pb-10 flex flex-col items-center text-center min-h-dvh justify-center">
          <div className="text-[80px] anim-pop">🧪</div>
          <h1 className="text-[28px] font-black tracking-tight mt-6">Conquista desbloqueada!</h1>
          <div className="card px-6 py-4 mt-5">
            <div className="text-[18px] font-extrabold text-gold">🏆 Alquimista</div>
            <div className="text-[13.5px] text-sub2 font-semibold mt-1">Você preparou suas gotas! +50 pontos ⭐</div>
          </div>
          <p className="text-[15px] text-sub2 font-semibold mt-6 leading-relaxed">
            Seu acompanhamento diário está liberado.<br />
            <b className="text-txt">Hoje à noite: sua primeira dose 🌙</b>
          </p>
          <button onClick={() => router.replace("/")} className="cta-gold w-full py-4 mt-8 text-[16px]">
            Ir para o meu painel
          </button>
        </div>
      </div>
    );
  }

  // tela de countdown de 24h
  if (p.espera24h && s.preparoIniciadoEm && !esperaConcluida) {
    const pct = Math.min(100, ((24 * 3600000 - restante) / (24 * 3600000)) * 100);
    return (
      <div className="app-bg relative max-w-md mx-auto min-h-dvh">
        <Stars />
        <div className="relative z-10 px-6 pt-12 pb-10 flex flex-col min-h-dvh">
          <Logo />
          <div className="flex-1 flex flex-col justify-center text-center">
            <div className="text-[64px] anim-float">⏳</div>
            <h1 className="text-[24px] font-black tracking-tight mt-5">Suas gotas estão descansando</h1>
            <p className="text-sub2 text-[14.5px] font-semibold mt-3 leading-relaxed">
              Deixe o pote no armário (escuro) e <b className="text-gold">agite 2–3 vezes</b> durante o período.
            </p>
            <div className="card p-6 mt-7">
              <div className="text-[42px] font-black text-gold tracking-tight tabular-nums">{fmtCountdown(restante)}</div>
              <div className="text-[12.5px] text-sub font-bold mt-1">faltam para o próximo passo</div>
              <div className="bar-track mt-4"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
            </div>
            <div className="card p-4 mt-4 text-[13px] text-sub2 font-semibold">
              🔔 Lembrete: agite o pote agora se ainda não agitou nesta parte do dia!
            </div>
            <button onClick={() => { const st = { ...s }; st.preparoPasso = passo + 1; setS(save(st)); setPasso(passo + 1); }}
              className="mt-6 text-[13px] font-bold text-sub underline">
              Já se passaram 24h fora do app? Pular espera
            </button>
          </div>
        </div>
      </div>
    );
  }

  // countdown terminou → pode avançar
  const passoLiberado = !p.espera24h || !s.preparoIniciadoEm || esperaConcluida;

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
        <div className="text-[12.5px] text-sub font-bold mt-3">Passo {passo + 1} de {total}</div>

        <div className="flex-1 flex flex-col justify-center text-center">
          <div className="text-[72px] anim-pop" key={passo}>{p.emoji}</div>
          <h1 className="text-[26px] font-black tracking-tight mt-5">{p.titulo}</h1>
          <p className="text-sub2 text-[15.5px] font-semibold mt-4 leading-relaxed px-1">{p.txt}</p>
          {p.espera24h && esperaConcluida && (
            <div className="card p-4 mt-5 text-[14px] font-extrabold text-green">
              ✅ As 24 horas passaram! Pode continuar.
            </div>
          )}
        </div>

        <button onClick={avancar} className="cta-gold w-full py-4 text-[16px]">
          {p.espera24h && !s.preparoIniciadoEm
            ? "Iniciar contagem de 24h ⏳"
            : passo + 1 >= total
            ? "Concluir preparo ✅"
            : "Próximo passo →"}
        </button>
        {passo > 0 && (
          <button onClick={() => { const st = { ...s }; st.preparoPasso = passo - 1; setS(save(st)); setPasso(passo - 1); }}
            className="mt-3 text-[13px] font-bold text-sub">← Voltar</button>
        )}
      </div>
    </div>
  );
}
