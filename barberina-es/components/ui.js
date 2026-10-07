"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function vibrar(p = 15) {
  try { navigator.vibrate && navigator.vibrate(p); } catch {}
}

export function Logo({ claro = false, peq = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${peq ? "w-9 h-9" : "w-11 h-11"} rounded-2xl flex items-center justify-center ${claro ? "vidrio" : "bg-white shadow-sm"}`}>
        <img src="/img/frasco.png" alt="" className={peq ? "w-7 h-7 object-contain" : "w-8 h-8 object-contain"} />
      </div>
      <div className="leading-none">
        <div className={`font-sora font-extrabold tracking-tight ${claro ? "text-white" : "text-bosque"} ${peq ? "text-[16px]" : "text-[18px]"}`}>
          Barberina<span className="text-oro">.</span>
        </div>
        <div className={`text-[9.5px] font-bold uppercase tracking-[1.6px] mt-[4px] ${claro ? "text-white/70" : "text-sub2"}`}>Mi acompañamiento</div>
      </div>
    </div>
  );
}

export function Splash() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center" style={{ background: "linear-gradient(160deg,#0E3B2B,#145238)" }}>
      <div className="w-28 h-28 rounded-[32px] vidrio flex items-center justify-center latido">
        <img src="/img/frasco.png" alt="" className="w-20 h-20 object-contain" />
      </div>
      <div className="font-sora font-extrabold text-white text-[24px] mt-5">Barberina<span className="text-oro">.</span></div>
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => <div key={i} className="punto w-2 h-2 rounded-full bg-oro" style={{ animationDelay: `${i * 0.18}s` }} />)}
      </div>
    </div>
  );
}

const TABS = [
  { href: "/", label: "Hoy", icon: "hoy" },
  { href: "/grupo", label: "Grupo", icon: "grupo" },
  { href: "/plan", label: "Recetas", icon: "plan" },
  { href: "/evolucion", label: "Evolución", icon: "evo" },
  { href: "/perfil", label: "Perfil", icon: "perfil" },
];

function Icono({ n, on }) {
  const c = on ? "#0E3B2B" : "#A39E92";
  const p = { fill: "none", stroke: c, strokeWidth: on ? 2.2 : 1.9, strokeLinecap: "round", strokeLinejoin: "round" };
  if (n === "hoy") return <svg width="22" height="22" viewBox="0 0 24 24"><path {...p} d="M3.5 10.5 12 3.5l8.5 7v9a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5a1.5 1.5 0 0 1-1.5-1.5v-9Z" /></svg>;
  if (n === "grupo") return <svg width="22" height="22" viewBox="0 0 24 24"><circle {...p} cx="9" cy="8.5" r="3.2" /><path {...p} d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path {...p} d="M15.5 5.8a3.2 3.2 0 0 1 0 5.4M17.5 14.9c1.8.8 3 2.3 3 4.6" /></svg>;
  if (n === "plan") return <svg width="22" height="22" viewBox="0 0 24 24"><path {...p} d="M12 21c-5 0-8-3.4-8-8 0-4.2 3.2-8.4 8-9.5 4.8 1.1 8 5.3 8 9.5 0 4.6-3 8-8 8Z" /><path {...p} d="M12 21V9.5M12 13l3.2-2.6M12 15.5 8.8 13" /></svg>;
  if (n === "evo") return <svg width="22" height="22" viewBox="0 0 24 24"><path {...p} d="M4 20V4M4 20h16" /><path {...p} d="M7.5 15.5l4-4.5 3 2.5 5-6" /></svg>;
  return <svg width="22" height="22" viewBox="0 0 24 24"><circle {...p} cx="12" cy="8" r="3.6" /><path {...p} d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" /></svg>;
}

// TabBar flutuante (pílula branca). Abas bloqueadas mostram um cadeado pequeno.
export function TabBar({ bloqueadas = [] }) {
  const path = usePathname();
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  if (!ok) return null;
  return createPortal(
    <nav className="tabbar fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4">
      <div className="h-[66px] flex rounded-[24px] bg-white/95 backdrop-blur-xl" style={{ boxShadow: "0 12px 34px -10px rgba(19,35,27,.28)" }}>
        {TABS.map((t) => {
          const on = path === t.href;
          const lock = bloqueadas.includes(t.href);
          return (
            <Link key={t.href} href={t.href} onClick={() => vibrar(8)}
              className={`relative flex-1 flex flex-col items-center justify-center gap-[3px] text-[10px] font-bold ${on ? "text-bosque" : "text-[#A39E92]"}`}>
              <span className={`flex items-center justify-center w-11 h-7 rounded-full ${on ? "bg-[#E7F1EA]" : ""}`}><Icono n={t.icon} on={on} /></span>
              {t.label}
              {lock && (
                <span className="absolute top-1.5 right-[calc(50%-20px)] w-4 h-4 rounded-full bg-oro2 flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 24 24"><path fill="#fff" d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z" /></svg>
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>,
    document.body
  );
}

export function PageShell({ children, tabbar = true, bloqueadas, sinPadding = false }) {
  return (
    <div className="max-w-md mx-auto min-h-dvh bg-fondo relative overflow-x-hidden">
      <div className={`${sinPadding ? "" : "px-5 pt-6"} entrada`} style={{ paddingBottom: tabbar ? 112 : 32 }}>{children}</div>
      {tabbar && <TabBar bloqueadas={bloqueadas} />}
    </div>
  );
}

// Cabeçalho com FOTO de fundo (estilo app grande)
export function HeroFoto({ src, children, alto = 300, posicion = "center" }) {
  return (
    <div className="hero" style={{ minHeight: alto }}>
      <img className="fondo" src={src} alt="" style={{ objectPosition: posicion }} />
      <div className="contenido px-5 pt-6 pb-6 flex flex-col justify-between" style={{ minHeight: alto }}>{children}</div>
    </div>
  );
}

export function Card({ children, className = "", style }) {
  return <div className={`card ${className}`} style={style}>{children}</div>;
}
export function Eyebrow({ children, className = "" }) {
  return <div className={`eyebrow ${className}`}>{children}</div>;
}
export function Titulo({ children, accion }) {
  return (
    <div className="flex items-end justify-between mt-7 mb-3 px-0.5">
      <h2 className="font-sora font-extrabold text-[18px] tracking-tight">{children}</h2>
      {accion}
    </div>
  );
}

export function Avatar({ l, size = 42 }) {
  return (
    <div className="rounded-full flex-none flex items-center justify-center"
      style={{
        width: size, height: size, fontSize: size * 0.5,
        background: l.eu ? "linear-gradient(135deg,#F5D27A,#E0A63A)" : "#F3EEE4",
        boxShadow: l.eu ? "0 0 0 3px #fff, 0 0 0 5px #E0A63A" : "inset 0 0 0 1px #E9E2D4",
        filter: l.recibido === false && !l.eu ? "grayscale(.5)" : "none",
      }}>
      {l.avatar || "🌸"}
    </div>
  );
}

export function Candado({ size = 18, color = "#fff" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24"><path fill={color} d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z" /></svg>;
}

// Conteúdo real BORRADO + selo de cadeado por cima (sem ação: libera sozinho na entrega)
export function Bloqueo({ children, titulo = "Disponible al recibir tu pedido", texto, compacto = false }) {
  return (
    <div className="relative rounded-[24px] overflow-hidden">
      <div className="borrado" aria-hidden="true">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center p-5" style={{ background: "linear-gradient(180deg,rgba(246,242,234,.15),rgba(246,242,234,.55))" }}>
        <div className={`vidrio-claro rounded-[22px] ${compacto ? "px-4 py-3" : "px-5 py-4"} flex items-center gap-3 max-w-[300px]`} style={{ boxShadow: "0 14px 30px -16px rgba(19,35,27,.45)" }}>
          <div className="w-10 h-10 rounded-full flex-none flex items-center justify-center" style={{ background: "linear-gradient(135deg,#145238,#0E3B2B)" }}>
            <Candado size={17} />
          </div>
          <div>
            <div className="font-sora font-bold text-[13.5px] text-tinta leading-tight">{titulo}</div>
            {texto && <div className="text-[11.5px] text-sub font-medium mt-0.5 leading-snug">{texto}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Modal({ abierto, onCerrar, children }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  if (!ok || !abierto) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-[2px]" onClick={onCerrar}>
      <div className="w-full max-w-md bg-white rounded-t-[30px] overflow-hidden subir" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>,
    document.body
  );
}

export function Confeti({ activo }) {
  if (!activo) return null;
  const cols = ["#E0A63A", "#C8102E", "#145238", "#F5D27A", "#2FA35A"];
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {Array.from({ length: 46 }).map((_, i) => (
        <span key={i} className="confeti" style={{ left: `${(i * 37) % 100}%`, background: cols[i % cols.length], animationDelay: `${(i % 12) * 0.06}s`, transform: `rotate(${i * 23}deg)` }} />
      ))}
    </div>
  );
}
