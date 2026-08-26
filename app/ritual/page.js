"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Stars, Logo } from "../../components/ui";
import { load, registrarRitual, calcStreak, FRASES } from "../../lib/store";
import { syncNow } from "../../lib/sync";
import { FASE1 } from "../../lib/receitas";

function fmtTimer(seg) {
  const m = Math.floor(seg / 60), s = seg % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Ritual() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [feito, setFeito] = useState(false);
  const [streak, setStreak] = useState(0);
  const [frase] = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)]);
  // timer de abafar (5 min)
  const [restante, setRestante] = useState(null); // segundos; null = não iniciado
  const timerRef = useRef(null);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    setS(st);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [router]);

  if (!s) return <div className="app-bg min-h-dvh" />;

  const madrugada = s.perfil?.dificuldade === "madrugada";
  const quando = madrugada ? "60 min antes de deitar (seu perfil)" : "30–60 min antes de deitar";

  function iniciarTimer() {
    setRestante(5 * 60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRestante((r) => {
        if (r === null || r <= 1) { clearInterval(timerRef.current); return r === null ? null : 0; }
        return r - 1;
      });
    }, 1000);
  }

  function confirmar() {
    const st = registrarRitual(s);
    setStreak(calcStreak(st));
    setS(st);
    setFeito(true);
    syncNow();
  }

  if (feito) {
    return (
      <div className="app-bg relative max-w-md mx-auto min-h-dvh">
        <Stars />
        <div className="relative z-10 px-6 pt-12 pb-10 flex flex-col min-h-dvh justify-center text-center">
          <div className="text-[76px] anim-pop">🍵</div>
          <h1 className="text-[27px] font-black tracking-tight mt-5">Ritual registrado!</h1>
          <div className="card px-6 py-4 mt-5">
            <div className="text-[16px] font-extrabold">+5 pontos ⭐ · 🔥 {streak} {streak === 1 ? "noite seguida" : "noites seguidas"}</div>
          </div>
          <p className="text-[15.5px] text-sub2 font-semibold mt-6 leading-relaxed px-3">“{frase}”</p>
          <p className="text-[13.5px] text-sub font-semibold mt-4">Agora: luz baixa e celular fora da cama. Boa noite! ✨</p>
          <button onClick={() => router.replace("/")} className="cta-gold w-full py-4 mt-9 text-[16px]">Continuar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-bg relative max-w-md mx-auto min-h-dvh">
      <Stars />
      <div className="relative z-10 px-6 pt-12 pb-10 flex flex-col min-h-dvh">
        <Logo />
        <button onClick={() => router.push("/")} className="text-left text-[13px] text-sub font-bold mt-6">← Voltar</button>
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-[64px] text-center anim-float">🍵</div>
          <h1 className="text-[25px] font-black tracking-tight mt-4 text-center">Hora do seu chá da noite</h1>
          <p className="text-sub text-[13px] font-semibold text-center mt-1.5">Tome {quando}</p>

          <div className="card p-5 mt-5">
            <div className="space-y-3.5">
              {[
                { n: "1", t: <>Coloque <b className="text-gold">1 colher de sopa</b> da mistura na xícara</> },
                { n: "2", t: <>Água quente por cima (<b className="text-gold">quente, não fervendo</b>) e abafe com um pires por 5–10 min</> },
                { n: "3", t: <>Coe, adoce com <b className="text-gold">1 colher de chá de mel</b> e tome morno</> },
              ].map((p) => (
                <div key={p.n} className="flex gap-3 items-start">
                  <div className="w-6 h-6 flex-none rounded-full flex items-center justify-center text-[12px] font-black text-[#3c2a10]"
                    style={{ background: "linear-gradient(135deg,#fbd38d,#f6ad55)" }}>{p.n}</div>
                  <div className="text-[13.5px] text-sub2 font-semibold leading-relaxed">{p.t}</div>
                </div>
              ))}
            </div>

            {/* Timer de abafar */}
            <div className="mt-4">
              {restante === null ? (
                <button onClick={iniciarTimer} className="btn-ghost w-full py-3 text-[14px] font-extrabold">
                  ⏱️ Abafei — iniciar timer de 5 min
                </button>
              ) : restante > 0 ? (
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(165,180,252,.08)", border: "1px solid rgba(165,180,252,.25)" }}>
                  <div className="text-[34px] font-black text-lilac tracking-tight tabular-nums">{fmtTimer(restante)}</div>
                  <div className="text-[12px] text-sub font-bold mt-0.5">abafando... deixe o pires na xícara ☕</div>
                </div>
              ) : (
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(126,232,178,.1)", border: "1px solid rgba(126,232,178,.35)" }}>
                  <div className="text-[15px] font-extrabold text-green">✅ Pronto! Pode coar, adoçar e aproveitar</div>
                </div>
              )}
            </div>
          </div>

          <div className="card p-4 mt-4" style={{ background: "rgba(165,180,252,.05)" }}>
            <p className="text-[12.5px] text-lilac font-semibold leading-relaxed">
              💡 {FASE1.educativo}
            </p>
          </div>

          <div className="text-[13px] text-sub2 font-semibold text-center mt-4">
            🕯️ Depois do chá: luz baixa · 📵 Celular fora da cama
          </div>

          <button onClick={confirmar} className="cta-gold w-full py-4 mt-5 text-[16px]">✓ Tomei meu chá de hoje</button>
        </div>
      </div>
    </div>
  );
}
