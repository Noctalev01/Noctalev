"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stars, Logo } from "../../components/ui";
import { load, registrarRitual, calcStreak, hojeSP, FRASES } from "../../lib/store";
import { syncNow } from "../../lib/sync";
import { FASE1 } from "../../lib/receitas";

export default function Ritual() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [feito, setFeito] = useState(false);
  const [streak, setStreak] = useState(0);
  const [frase] = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)]);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    setS(st);
  }, [router]);

  if (!s) return <div className="app-bg min-h-dvh" />;

  const dose = s.perfil?.dificuldade === "madrugada"
    ? "15 gotas OU 1 colher de chá rasa em 2 dedos de água, 60 min antes de deitar (seu perfil)"
    : FASE1.uso;

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
          <div className="text-[76px] anim-pop">🌙</div>
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
        <div className="flex-1 flex flex-col justify-center text-center">
          <div className="text-[70px] anim-float">🌙</div>
          <h1 className="text-[26px] font-black tracking-tight mt-5">Hora do seu ritual noturno</h1>
          <div className="card p-5 mt-6 text-left">
            <div className="text-[14px] font-extrabold text-gold">💧 Sua dose de hoje</div>
            <p className="text-[14.5px] font-semibold mt-2 leading-relaxed">{dose}</p>
            <div className="text-[13px] text-sub2 font-semibold mt-3 leading-relaxed">
              🕯️ Depois das gotas: luz baixa<br />📵 Celular fora da cama
            </div>
          </div>
          <button onClick={confirmar} className="cta-gold w-full py-4 mt-8 text-[16px]">✓ Fiz meu ritual de hoje</button>
        </div>
      </div>
    </div>
  );
}
