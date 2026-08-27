"use client";
// ============================================================
// 4.2 — Respiração 4-7-8 guiada (técnica do Dr. Andrew Weil)
// Círculo que cresce (inspira 4s), segura (7s) e encolhe (expira 8s).
// 4 ciclos ≈ 76s. Perfeita para fazer na cama depois do chá.
// ============================================================
import { useEffect, useRef, useState } from "react";
import { vibrar } from "./ui";

const FASES = [
  { nome: "inspire", txt: "Inspire pelo nariz", dur: 4, cor: "#7ee8b2", escala: 1 },
  { nome: "segure",  txt: "Segure o ar",        dur: 7, cor: "#fbd38d", escala: 1 },
  { nome: "expire",  txt: "Expire pela boca",   dur: 8, cor: "#a5b4fc", escala: 0.55 },
];
const CICLOS = 4;

export default function Respiracao478() {
  const [rodando, setRodando] = useState(false);
  const [fase, setFase] = useState(0);      // índice em FASES
  const [ciclo, setCiclo] = useState(1);
  const [seg, setSeg] = useState(FASES[0].dur);
  const [fim, setFim] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  function iniciar() {
    vibrar(12);
    setFim(false); setFase(0); setCiclo(1); setSeg(FASES[0].dur); setRodando(true);
    clearInterval(timerRef.current);
    let f = 0, c = 1, s = FASES[0].dur;
    timerRef.current = setInterval(() => {
      s -= 1;
      if (s > 0) { setSeg(s); return; }
      // fase acabou → próxima
      f += 1;
      if (f >= FASES.length) {
        f = 0; c += 1;
        if (c > CICLOS) {
          clearInterval(timerRef.current);
          setRodando(false); setFim(true); vibrar([20, 50, 20]);
          return;
        }
        setCiclo(c);
      }
      vibrar(8); // toque suave a cada troca de fase
      setFase(f); s = FASES[f].dur; setSeg(s);
    }, 1000);
  }

  function parar() {
    clearInterval(timerRef.current);
    setRodando(false); setFim(false);
  }

  const F = FASES[fase];

  return (
    <div className="card p-5 mt-4" style={{ background: "rgba(165,180,252,.05)" }}>
      <div className="eyebrow" style={{ color: "#a5b4fc" }}>Respiração do sono · 4-7-8</div>

      {!rodando && !fim && (
        <>
          <div className="text-[13px] text-sub2 font-semibold leading-relaxed mt-2">
            Depois do chá, já na cama: <b className="text-txt">inspire 4s, segure 7s, expire 8s</b>.
            São 4 ciclos guiados (~1 min e meio) que acalmam o corpo e aceleram o sono profundo. 😴
          </div>
          <button onClick={iniciar} className="btn-ghost w-full py-3 mt-4 text-[14px] font-extrabold">
            🌬️ Começar respiração guiada
          </button>
        </>
      )}

      {rodando && (
        <div className="flex flex-col items-center mt-4">
          <div className="relative flex items-center justify-center" style={{ width: 190, height: 190 }}>
            {/* círculo que respira junto */}
            <div className="absolute rounded-full"
              style={{
                width: 170, height: 170,
                background: `radial-gradient(circle, ${F.cor}33, ${F.cor}0d)`,
                border: `2.5px solid ${F.cor}`,
                transform: `scale(${F.nome === "inspire" ? 1 : F.escala})`,
                // no "inspire" cresce em 4s; no "expire" encolhe em 8s; no "segure" fica parado
                transition: F.nome === "segure" ? "none" : `transform ${F.dur}s ease-in-out, border-color 0.5s, background 0.5s`,
              }} />
            <div className="relative text-center">
              <div className="text-[38px] font-black tabular-nums" style={{ color: F.cor }}>{seg}</div>
              <div className="text-[13px] font-extrabold mt-0.5" style={{ color: F.cor }}>{F.txt}</div>
            </div>
          </div>
          <div className="text-[12px] text-sub font-bold mt-3">ciclo {ciclo} de {CICLOS}</div>
          <button onClick={parar} className="text-[12.5px] text-sub font-bold mt-2 underline">parar</button>
        </div>
      )}

      {fim && (
        <div className="text-center mt-4">
          <div className="text-[40px]">😌</div>
          <div className="text-[15px] font-extrabold text-green mt-2">Corpo acalmado, mente pronta pra dormir</div>
          <div className="text-[12.5px] text-sub2 font-semibold mt-1.5 leading-relaxed">
            Agora é só se aconchegar. Se quiser, repita mais uma rodada.
          </div>
          <button onClick={iniciar} className="btn-ghost w-full py-3 mt-3.5 text-[13.5px] font-extrabold">
            Repetir mais 4 ciclos
          </button>
        </div>
      )}
    </div>
  );
}
