"use client";
// ============================================================
// 4.4 — Calendário da jornada: um mês inteiro de relance.
// 🍵 = ritual feito · ☀️ = check-in · dia cheio = os dois.
// Dá orgulho de ver o mês pintado — e vontade de não deixar buraco.
// ============================================================
import { useState } from "react";
import { vibrar } from "./ui";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS_SEM = ["D", "S", "T", "Q", "Q", "S", "S"];

function chave(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export default function CalendarioJornada({ s, hoje }) {
  const hj = new Date(hoje + "T12:00:00");
  const [ano, setAno] = useState(hj.getFullYear());
  const [mes, setMes] = useState(hj.getMonth());

  const inicio = s.receitaPreparadaEm ? String(s.receitaPreparadaEm).slice(0, 10) : null;
  const primeiroDow = new Date(ano, mes, 1).getDay();
  const nDias = new Date(ano, mes + 1, 0).getDate();

  function mudarMes(delta) {
    vibrar(8);
    let m = mes + delta, a = ano;
    if (m < 0) { m = 11; a -= 1; }
    if (m > 11) { m = 0; a += 1; }
    setMes(m); setAno(a);
  }

  // contagem do mês visível
  let nRituais = 0, nCheckins = 0;
  for (let d = 1; d <= nDias; d++) {
    const k = chave(ano, mes, d);
    if (s.rituais?.[k]) nRituais++;
    if (s.checkins?.[k]) nCheckins++;
  }

  return (
    <div className="card mt-4 p-5">
      <div className="flex justify-between items-center">
        <div className="eyebrow">Calendário da jornada</div>
        <div className="flex items-center gap-2">
          <button onClick={() => mudarMes(-1)} className="w-7 h-7 rounded-full text-[13px] font-black text-sub"
            style={{ background: "rgba(255,255,255,.06)" }}>‹</button>
          <span className="text-[12px] font-extrabold min-w-[92px] text-center">{MESES[mes]} {ano}</span>
          <button onClick={() => mudarMes(1)} className="w-7 h-7 rounded-full text-[13px] font-black text-sub"
            style={{ background: "rgba(255,255,255,.06)" }}>›</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mt-4">
        {DIAS_SEM.map((d, i) => (
          <div key={i} className="text-center text-[10px] text-sub font-black">{d}</div>
        ))}
        {Array.from({ length: primeiroDow }).map((_, i) => <div key={`v${i}`} />)}
        {Array.from({ length: nDias }).map((_, i) => {
          const dia = i + 1;
          const k = chave(ano, mes, dia);
          const ritual = !!s.rituais?.[k];
          const checkin = !!s.checkins?.[k];
          const ambos = ritual && checkin;
          const ehHoje = k === hoje;
          const futuro = k > hoje;
          const antes = inicio && k < inicio;
          return (
            <div key={k}
              className="aspect-square rounded-[10px] flex flex-col items-center justify-center"
              style={{
                background: ambos ? "linear-gradient(135deg, rgba(126,232,178,.22), rgba(251,211,141,.18))"
                  : ritual ? "rgba(251,211,141,.13)"
                  : checkin ? "rgba(165,180,252,.13)"
                  : "rgba(255,255,255,.03)",
                border: ehHoje ? "1.5px solid #fbd38d"
                  : ambos ? "1px solid rgba(126,232,178,.45)"
                  : ritual ? "1px solid rgba(251,211,141,.35)"
                  : checkin ? "1px solid rgba(165,180,252,.3)"
                  : "1px solid rgba(255,255,255,.05)",
                opacity: futuro || antes ? 0.35 : 1,
              }}>
              <span className={`text-[10.5px] font-black leading-none ${ambos ? "text-green" : ritual ? "text-gold" : checkin ? "text-lilac" : "text-sub"}`}>
                {dia}
              </span>
              {(ritual || checkin) && (
                <span className="text-[8px] leading-[1.1] mt-[1px]">
                  {ambos ? "🍵☀️" : ritual ? "🍵" : "☀️"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-3.5">
        <div className="flex gap-3 text-[10.5px] text-sub font-bold">
          <span>🍵 ritual</span><span>☀️ check-in</span>
        </div>
        <div className="text-[10.5px] font-bold">
          <span className="text-gold">{nRituais} {nRituais === 1 ? "ritual" : "rituais"}</span>
          <span className="text-sub"> · </span>
          <span className="text-lilac">{nCheckins} check-ins</span>
        </div>
      </div>
    </div>
  );
}
