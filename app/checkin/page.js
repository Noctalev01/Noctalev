"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stars, Logo } from "../../components/ui";
import { load, fazerCheckin, calcStreak, hojeSP, SONO_OPTS, FRASES } from "../../lib/store";
import { syncNow } from "../../lib/sync";

const HORAS = [
  { v: "<5", t: "Menos de 5h" }, { v: "5-6", t: "5 a 6h" }, { v: "6-7", t: "6 a 7h" },
  { v: "7-8", t: "7 a 8h" }, { v: "8+", t: "8h ou mais" },
];

export default function Checkin() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [tela, setTela] = useState(0);
  const [sono, setSono] = useState(null);
  const [horas, setHoras] = useState(null);
  const [acordou, setAcordou] = useState(null);
  const [peso, setPeso] = useState("");
  const [frase] = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)]);
  const [streak, setStreak] = useState(0);
  const [jaFezHoje, setJaFezHoje] = useState(false);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    const c = st.checkins[hojeSP()];
    if (c) {
      setJaFezHoje(true); // check-in de hoje já existe → modo edição (sem pontos novos)
      setSono(c.sono); setHoras(c.horas); setAcordou(c.acordou); setPeso(c.peso != null ? String(c.peso).replace(".", ",") : "");
    }
    setS(st);
  }, [router]);

  if (!s) return <div className="app-bg min-h-dvh" />;

  function finalizar(pular) {
    const p = pular ? null : parseFloat(String(peso).replace(",", "."));
    const st = fazerCheckin(s, { sono, horas, acordou, peso: p && p > 20 && p < 400 ? p : null });
    setStreak(calcStreak(st));
    setS(st);
    setTela(3);
    syncNow(); // sobe para a nuvem em segundo plano
  }

  return (
    <div className="app-bg relative max-w-md mx-auto min-h-dvh">
      <Stars />
      <div className="relative z-10 px-6 pt-12 pb-10 flex flex-col min-h-dvh">
        <Logo />
        {tela < 3 && (
          <>
            <div className="flex gap-1.5 mt-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= tela ? "bg-gold" : "bg-white/15"}`} />
              ))}
            </div>
            <button onClick={() => router.push("/")} className="text-left text-[13px] text-sub font-bold mt-3">✕ Fechar</button>
            {jaFezHoje && (
              <div className="card p-3 mt-3" style={{ background: "rgba(126,232,178,.07)", borderColor: "rgba(126,232,178,.3)" }}>
                <span className="text-[12px] text-green font-bold">✅ Você já fez o check-in de hoje — aqui você só corrige as respostas se precisar (os pontos contam 1x ao dia).</span>
              </div>
            )}
          </>
        )}

        {tela === 0 && (
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-[25px] font-black tracking-tight text-center">Como foi seu sono<br />esta noite?</h1>
            <div className="space-y-3 mt-8">
              {SONO_OPTS.map((o) => (
                <button key={o.v} onClick={() => { setSono(o.v); setTela(1); }}
                  className={`opt-btn w-full p-4 flex items-center gap-4 text-[16px] font-extrabold ${sono === o.v ? "on" : ""}`}>
                  <span className="text-[26px]">{o.emoji}</span> {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {tela === 1 && (
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-[25px] font-black tracking-tight text-center">Quantas horas<br />você dormiu?</h1>
            <div className="grid grid-cols-2 gap-3 mt-7">
              {HORAS.map((o) => (
                <button key={o.v} onClick={() => setHoras(o.v)}
                  className={`opt-btn py-4 text-[15px] font-extrabold ${horas === o.v ? "on" : ""} ${o.v === "8+" ? "col-span-2" : ""}`}>
                  {o.t}
                </button>
              ))}
            </div>
            <div className="text-[15px] font-bold text-center mt-8">Acordou no meio da noite?</div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {[{ v: true, t: "Sim 😔" }, { v: false, t: "Não 🌙" }].map((o) => (
                <button key={String(o.v)} onClick={() => setAcordou(o.v)}
                  className={`opt-btn py-4 text-[15px] font-extrabold ${acordou === o.v ? "on" : ""}`}>{o.t}</button>
              ))}
            </div>
            <button disabled={!horas || acordou === null} onClick={() => setTela(2)}
              className="cta-gold w-full py-4 mt-8 text-[16px] disabled:opacity-40">Continuar</button>
          </div>
        )}

        {tela === 2 && (
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-[25px] font-black tracking-tight text-center">Seu peso na<br />balança hoje:</h1>
            <p className="text-sub text-[13px] font-semibold text-center mt-2 leading-relaxed">
              ⚖️ Pese-se sempre do mesmo jeito: <b className="text-gold">de manhã, em jejum</b>, depois de ir ao banheiro e antes do café. É assim que a balança mostra seu resultado de verdade.
            </p>
            <div className="flex items-center gap-3 mt-7">
              <input inputMode="decimal" placeholder="Ex: 76,4" value={peso} onChange={(e) => setPeso(e.target.value)}
                className="flex-1 px-4 py-5 text-[28px] font-black text-center" autoFocus />
              <span className="text-[22px] font-extrabold text-sub2">kg</span>
            </div>
            <button disabled={!parseFloat(String(peso).replace(",", "."))} onClick={() => finalizar(false)}
              className="cta-gold w-full py-4 mt-7 text-[16px] disabled:opacity-40">Registrar ✅</button>
            <button onClick={() => finalizar(true)} className="mt-4 text-[14px] font-bold text-sub">
              Pular hoje (o sono é o mais importante)
            </button>
          </div>
        )}

        {tela === 3 && (
          <div className="flex-1 flex flex-col justify-center text-center">
            <div className="text-[76px] anim-pop">⭐</div>
            <h1 className="text-[27px] font-black tracking-tight mt-5">+10 pontos!</h1>
            <div className="card px-6 py-4 mt-5 inline-block">
              <div className="text-[17px] font-extrabold">🔥 {streak} {streak === 1 ? "noite seguida" : "noites seguidas"}</div>
            </div>
            <p className="text-[16px] text-sub2 font-semibold mt-6 leading-relaxed px-3">“{frase}”</p>
            <button onClick={() => router.replace("/")} className="cta-gold w-full py-4 mt-9 text-[16px]">Continuar</button>
          </div>
        )}
      </div>
    </div>
  );
}
