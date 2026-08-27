"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ===== 1.5 — vibração tátil (Android; iPhone ignora sem erro) =====
export function vibrar(padrao = 18) {
  try { if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(padrao); } catch {}
}
// vibração de conquista/celebração (três toques)
export function vibrarFesta() { vibrar([28, 60, 28, 60, 48]); }

// ===== 1.1 — tela de carregamento com a lua pulsando =====
export function Splash() {
  return (
    <div className="app-bg relative max-w-md mx-auto min-h-dvh flex flex-col items-center justify-center">
      <Stars />
      <div className="splash-lua"><Lua size={54} /></div>
      <div className="flex items-center gap-2 font-black tracking-tight text-[24px] mt-4">
        <span>Nocta<span className="text-lilac">Lev</span></span>
      </div>
      <div className="flex gap-1.5 mt-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="splash-dot w-2 h-2 rounded-full bg-gold" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </div>
    </div>
  );
}

// ===== 1.4 — número que conta até o valor (0 → 127) =====
export function ContadorNumero({ valor, duracao = 900, decimais = 0, prefixo = "", sufixo = "" }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const alvo = Number(valor) || 0;
    if (alvo === 0) { setV(0); return; }
    const t0 = performance.now();
    cancelAnimationFrame(ref.current);
    function tick(t) {
      const p = Math.min((t - t0) / duracao, 1);
      const eased = 1 - Math.pow(1 - p, 3); // desacelera no final
      setV(alvo * eased);
      if (p < 1) ref.current = requestAnimationFrame(tick);
    }
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [valor, duracao]);
  const txt = decimais > 0 ? v.toFixed(decimais).replace(".", ",") : String(Math.round(v));
  return <>{prefixo}{txt}{sufixo}</>;
}

export function Stars() {
  const pts = [
    { top: "8%", left: "10%", s: 3 }, { top: "5%", right: "14%", s: 4 },
    { top: "14%", right: "30%", s: 2 }, { top: "7%", left: "38%", s: 2 },
    { top: "20%", left: "72%", s: 2 }, { top: "26%", left: "18%", s: 3 },
    { top: "33%", right: "8%", s: 2 }, { top: "44%", left: "6%", s: 2 },
  ];
  return (
    <>
      {pts.map((p, i) => (
        <div key={i} className="star" style={{ ...p, width: p.s, height: p.s }} />
      ))}
    </>
  );
}

// Lua crescente vetorial (mesma identidade da capa)
export function Lua({ size = 20, color = "#a5b4fc" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.2 14.2A8.6 8.6 0 0 1 9.8 3.8a.55.55 0 0 0-.72-.66 9.4 9.4 0 1 0 11.78 11.78.55.55 0 0 0-.66-.72Z" fill={color} />
      <path d="M17.4 5.2l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5.5-1.4Z" fill="#dbe3ff" />
    </svg>
  );
}

export function Logo({ size = "text-[22px]" }) {
  return (
    <div className={`flex items-center justify-center gap-2 font-black tracking-tight ${size}`}>
      <Lua size={22} />
      <span>
        Nocta<span className="text-lilac">Lev</span>
      </span>
    </div>
  );
}

// Ícones de navegação em traço fino (estilo iOS/Material — sem emojis)
function IconTab({ name, on }) {
  const c = on ? "#fbd38d" : "#6a72a0";
  const p = { fill: "none", stroke: c, strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "inicio")
    return (<svg width="23" height="23" viewBox="0 0 24 24"><path {...p} d="M3.5 10.5 12 3.5l8.5 7v9a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5a1.5 1.5 0 0 1-1.5-1.5v-9Z" /></svg>);
  if (name === "receita")
    return (<svg width="23" height="23" viewBox="0 0 24 24"><path {...p} d="M12 21c-5 0-8-3.4-8-8 0-4.2 3.2-8.4 8-9.5 4.8 1.1 8 5.3 8 9.5 0 4.6-3 8-8 8Z" /><path {...p} d="M12 21V9.5M12 13l3.2-2.6M12 15.5 8.8 13" /></svg>);
  if (name === "progresso")
    return (<svg width="23" height="23" viewBox="0 0 24 24"><path {...p} d="M4 20V4M4 20h16" /><path {...p} d="M7.5 15.5l4-4.5 3 2.5 5-6" /></svg>);
  if (name === "turma")
    return (<svg width="23" height="23" viewBox="0 0 24 24"><circle {...p} cx="9" cy="8.5" r="3.2" /><path {...p} d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path {...p} d="M15.5 5.8a3.2 3.2 0 0 1 0 5.4M17.5 14.9c1.8.8 3 2.3 3 4.6" /></svg>);
  return (<svg width="23" height="23" viewBox="0 0 24 24"><rect {...p} x="4" y="8.5" width="16" height="11" rx="2" /><path {...p} d="M4 12.5h16M12 8.5v11M12 8.5c-3 0-4.6-1.4-4.6-3A1.9 1.9 0 0 1 9.3 3.6c2 0 2.7 2.6 2.7 4.9 0-2.3.7-4.9 2.7-4.9a1.9 1.9 0 0 1 1.9 1.9c0 1.6-1.6 3-4.6 3Z" /></svg>);
}

const TABS = [
  { href: "/", icon: "inicio", label: "Início" },
  { href: "/receita", icon: "receita", label: "Receita" },
  { href: "/turma", icon: "turma", label: "Turma" },
  { href: "/progresso", icon: "progresso", label: "Progresso" },
  { href: "/bonus", icon: "bonus", label: "Bônus" },
];

// ===== 1.7 — TabBar com indicador deslizante + área segura do iPhone =====
// FIX: renderizada via portal direto no <body>. Antes, ela ficava dentro do
// contêiner da página que tem animação com transform — e transform no pai
// quebra o position:fixed (o menu "descia" junto com a página). No body,
// o menu fica SEMPRE travado na base da tela.
export function TabBar() {
  const path = usePathname();
  const idx = TABS.findIndex((t) => t.href === path);
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  if (!montado) return null;
  return createPortal(
    <nav className="tabbar-safe fixed bottom-0 left-0 right-0 z-40 bg-[rgba(8,11,26,.92)] border-t border-[rgba(165,180,252,.14)] backdrop-blur-md max-w-md mx-auto">
      <div className="relative h-[78px] flex">
        {idx >= 0 && (
          <div className="tab-dot" style={{ left: `calc(${(idx + 0.5) * (100 / TABS.length)}% - 17px)` }} />
        )}
        {TABS.map((t) => {
          const on = path === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              onClick={() => vibrar(10)}
              className={`flex-1 flex flex-col items-center justify-center gap-[4px] text-[10.5px] font-bold transition-colors duration-200 ${
                on ? "text-gold" : "text-taboff"
              }`}
            >
              <span className={on ? "anim-pop" : ""} style={{ animationDuration: "0.3s" }}>
                <IconTab name={t.icon} on={on} />
              </span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>,
    document.body
  );
}

// ===== 1.3 — anel que sempre anima do zero até o valor =====
export function Ring({ pct, label = "SONO", size = 110, color = "#7ee8b2" }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const [mostrado, setMostrado] = useState(0);
  useEffect(() => {
    setMostrado(0);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setMostrado(Math.min(pct, 100))));
    return () => cancelAnimationFrame(id);
  }, [pct]);
  const off = c * (1 - mostrado / 100);
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.09)" strokeWidth="10" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="10" fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.34, 1.2, 0.5, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <b className="text-[26px] font-black" style={{ color }}>
          <ContadorNumero valor={Math.round(pct)} duracao={1100} sufixo="%" />
        </b>
        <span className="text-[10.5px] text-sub font-bold mt-[1px]">{label}</span>
      </div>
    </div>
  );
}

export function Sparkline({ pesos, width = 150, height = 84 }) {
  if (!pesos || pesos.length < 2) {
    return (
      <div className="flex-none text-center text-sub text-[12px] font-semibold w-[150px]">
        Registre seu peso<br />para ver o gráfico
      </div>
    );
  }
  const vals = pesos.map((p) => p.peso);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const pad = 10;
  const pts2 = vals.map((v, i) => {
    const x = pad + (i * (width - pad * 2)) / (vals.length - 1);
    const y = pad + ((max - v) / range) * (height - pad * 2);
    return [x, y];
  });
  const line = pts2.map((p) => p.join(",")).join(" ");
  return (
    <svg className="flex-none" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={line} fill="none" stroke="#7ee8b2" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts2.slice(0, -1).filter((_, i) => i % 2 === 0).map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#7ee8b2" />
      ))}
      <circle cx={pts2[pts2.length - 1][0]} cy={pts2[pts2.length - 1][1]} r="5.5" fill="#fbd38d" stroke="#10142c" strokeWidth="2" />
    </svg>
  );
}

// ===== 1.2 — stagger: cada filho entra em cascata (fade + subida) =====
export function PageShell({ children, tabbar = true, cascata = true }) {
  return (
    <div className="app-bg relative max-w-md mx-auto min-h-dvh overflow-x-hidden">
      <Stars />
      <div className={`relative z-10 px-6 pt-8 ${cascata ? "stagger" : ""}`} style={{ paddingBottom: tabbar ? 110 : 40 }}>
        {children}
      </div>
      {tabbar && <TabBar />}
    </div>
  );
}
