"use client";
// ============================================================
// LEMBRETE FASE 2 — para quem já teve a Fase 2 liberada (corpo pronto),
// viu a celebração e escolheu "continuar na Fase 1 por enquanto".
//
// Regra do negócio: a Fase 2 só abre para quem PAGOU (fase2Paga vem do
// webhook/Cakto). Quem pulou continua vendo, todo dia, que a Fase 2 está
// pronta — e cada toque leva à página /fase2 (explicação + pagamento).
//
// - Banner fixo no topo da Home (não dá para fechar de vez: "Depois" esconde
//   só até o próximo dia)
// - Card destacado na aba Receita (sempre visível)
// - Push noturno via /api/push/cron (ver lá)
// ============================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { load } from "../lib/store";

const KEY_ADIADO = "noctalev_f2_lembrete_adiado"; // data (YYYY-MM-DD) em que ela tocou "Depois"

export function deveLembrarFase2(s) {
  return !!(s?.perfil && s?.fase2LiberadaEm && s?.celebracaoVista && !s?.fase2Paga);
}

function hojeLocal() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

function diasDesde(iso) {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}

// ---- Banner fixo no topo (Home) ----
export function BannerFase2() {
  const [mostrar, setMostrar] = useState(false);
  const [dias, setDias] = useState(0);

  useEffect(() => {
    const s = load();
    if (!deveLembrarFase2(s)) return;
    try {
      if (localStorage.getItem(KEY_ADIADO) === hojeLocal()) return; // adiou hoje → volta amanhã
    } catch {}
    setDias(diasDesde(s.fase2LiberadaEm));
    setMostrar(true);
  }, []);

  if (!mostrar) return null;

  function depois() {
    try { localStorage.setItem(KEY_ADIADO, hojeLocal()); } catch {}
    setMostrar(false);
  }

  const urgente = dias >= 3;
  return (
    <div className="sticky top-0 z-30 px-3 pt-2 pb-1 anim-pop" style={{ background: "linear-gradient(180deg, #10142c 70%, rgba(16,20,44,0))" }}>
      <div className="card flex items-center gap-3 p-3"
        style={{ background: "rgba(16,20,44,.97)", borderColor: urgente ? "rgba(251,211,141,.7)" : "rgba(126,232,178,.5)", boxShadow: "0 8px 28px rgba(0,0,0,.45)" }}>
        <div className="w-11 h-11 flex-none rounded-[13px] overflow-hidden" style={{ border: "1px solid rgba(251,211,141,.45)" }}>
          <img src="/img/fase2-shot.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <Link href="/fase2" className="flex-1 min-w-0 active:opacity-80">
          <div className="text-[13.5px] font-extrabold leading-tight">
            {urgente ? "☀️ Fase 2 te esperando" : "🔓 Sua Fase 2 está pronta!"}
          </div>
          <div className="text-[11.5px] text-sub2 font-semibold mt-0.5 leading-tight">
            {urgente ? `Liberada há ${dias} dias · Shot Termo-Metabólico` : "Seu corpo respondeu · Shot Termo-Metabólico"}
          </div>
        </Link>
        <div className="flex flex-col gap-1.5 items-end">
          <Link href="/fase2" className="cta-gold px-3.5 py-2 text-[12.5px] whitespace-nowrap">Desbloquear</Link>
          <button onClick={depois} className="text-[11px] font-bold text-sub">Depois</button>
        </div>
      </div>
    </div>
  );
}

// ---- Card grande (Receita / Home) ----
export function CardFase2Pronta({ compacto = false }) {
  const [s, setS] = useState(null);
  useEffect(() => { const st = load(); if (deveLembrarFase2(st)) setS(st); }, []);
  if (!s) return null;
  const dias = diasDesde(s.fase2LiberadaEm);
  return (
    <Link href="/fase2" className="card block mt-4 overflow-hidden active:opacity-90" style={{ padding: 0, border: "1px solid rgba(251,211,141,.55)", boxShadow: "0 0 0 4px rgba(251,211,141,.08)" }}>
      <div className="relative" style={{ height: compacto ? 96 : 120 }}>
        <img src="/img/fase2-shot.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(16,20,44,.1), rgba(16,20,44,.92))" }} />
        <div className="absolute top-3 left-4 px-2 py-0.5 rounded-full text-[10.5px] font-black tracking-wide"
          style={{ background: "rgba(126,232,178,.18)", border: "1px solid rgba(126,232,178,.5)", color: "#7ee8b2" }}>
          PRONTA PARA VOCÊ
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div className="text-[16px] font-extrabold">Fase 2 · Shot Termo-Metabólico</div>
          <span className="text-[20px]">🔓</span>
        </div>
      </div>
      <div className="p-[14px_18px_16px]">
        <p className="text-[13px] text-sub2 font-semibold leading-relaxed">
          Seu corpo respondeu à Fase 1{dias >= 2 ? ` há ${dias} dias` : ""}. A Fase 2 ataca a <b className="text-txt">fome da tarde</b> e os
          <b className="text-txt"> picos de glicemia</b> — é onde a balança costuma responder mais rápido.
        </p>
        <div className="cta-gold text-center py-3 mt-3 text-[14.5px]">Desbloquear a Fase 2 →</div>
        <p className="text-center text-[11px] text-sub font-semibold mt-2">Acesso automático e imediato após o pagamento</p>
      </div>
    </Link>
  );
}
