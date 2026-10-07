"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function vibrar(p = 15) {
  try { navigator.vibrate && navigator.vibrate(p); } catch {}
}

export function Logo({ peq = false }) {
  return (
    <div className="flex items-center gap-2">
      <img src="/img/frasco.png" alt="" className={peq ? "w-7 h-7 object-contain" : "w-9 h-9 object-contain"} />
      <div className="leading-none">
        <div className={`font-sora font-extrabold tracking-tight text-verde ${peq ? "text-[16px]" : "text-[19px]"}`}>
          Barberina<span className="text-rojo">·</span>
        </div>
        <div className="text-[10px] font-bold text-sub2 uppercase tracking-[1.3px] mt-[3px]">Mi acompañamiento</div>
      </div>
    </div>
  );
}

export function Splash() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-fondo">
      <img src="/img/frasco.png" alt="" className="w-24 h-24 object-contain latido" />
      <div className="font-sora font-extrabold text-verde text-[22px] mt-3">Barberina</div>
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="punto w-2 h-2 rounded-full bg-oro" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
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
  const c = on ? "#D97706" : "#9AA1B2";
  const p = { fill: "none", stroke: c, strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" };
  if (n === "hoy") return <svg width="23" height="23" viewBox="0 0 24 24"><circle {...p} cx="12" cy="12" r="4" /><path {...p} d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></svg>;
  if (n === "grupo") return <svg width="23" height="23" viewBox="0 0 24 24"><circle {...p} cx="9" cy="8.5" r="3.2" /><path {...p} d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path {...p} d="M15.5 5.8a3.2 3.2 0 0 1 0 5.4M17.5 14.9c1.8.8 3 2.3 3 4.6" /></svg>;
  if (n === "plan") return <svg width="23" height="23" viewBox="0 0 24 24"><path {...p} d="M12 21c-5 0-8-3.4-8-8 0-4.2 3.2-8.4 8-9.5 4.8 1.1 8 5.3 8 9.5 0 4.6-3 8-8 8Z" /><path {...p} d="M12 21V9.5M12 13l3.2-2.6M12 15.5 8.8 13" /></svg>;
  if (n === "evo") return <svg width="23" height="23" viewBox="0 0 24 24"><path {...p} d="M4 20V4M4 20h16" /><path {...p} d="M7.5 15.5l4-4.5 3 2.5 5-6" /></svg>;
  return <svg width="23" height="23" viewBox="0 0 24 24"><circle {...p} cx="12" cy="8" r="3.6" /><path {...p} d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" /></svg>;
}

export function TabBar({ bloqueadas = [] }) {
  const path = usePathname();
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  if (!ok) return null;
  return createPortal(
    <nav className="tabbar fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white/95 backdrop-blur border-t border-linea">
      <div className="h-[68px] flex">
        {TABS.map((t) => {
          const on = path === t.href;
          const lock = bloqueadas.includes(t.href);
          return (
            <Link key={t.href} href={t.href} onClick={() => vibrar(8)}
              className={`relative flex-1 flex flex-col items-center justify-center gap-[3px] text-[10.5px] font-bold ${on ? "text-oro2" : "text-[#9AA1B2]"}`}>
              <Icono n={t.icon} on={on} />
              {t.label}
              {lock && <span className="absolute top-2 right-[calc(50%-18px)] text-[10px]">🔒</span>}
            </Link>
          );
        })}
      </div>
    </nav>,
    document.body
  );
}

export function PageShell({ children, tabbar = true, bloqueadas }) {
  return (
    <div className="max-w-md mx-auto min-h-dvh bg-fondo relative overflow-x-hidden">
      <div className="px-5 pt-6 entrada" style={{ paddingBottom: tabbar ? 100 : 32 }}>{children}</div>
      {tabbar && <TabBar bloqueadas={bloqueadas} />}
    </div>
  );
}

export function Card({ children, className = "", style }) {
  return <div className={`card ${className}`} style={style}>{children}</div>;
}

export function Eyebrow({ children, className = "" }) {
  return <div className={`eyebrow ${className}`}>{children}</div>;
}

export function Avatar({ l, size = 42 }) {
  return (
    <div className="rounded-full flex-none flex items-center justify-center"
      style={{
        width: size, height: size, fontSize: size * 0.5,
        background: l.eu ? "linear-gradient(135deg,#FDE68A,#F59E0B)" : "#F4F1EA",
        border: l.eu ? "2px solid #D97706" : "1px solid #ECE8DF",
        opacity: l.recibido === false && !l.eu ? 0.75 : 1,
      }}>
      {l.avatar || "🌸"}
    </div>
  );
}

// Overlay de cadeado sobre um conteúdo "prévia" desfocado
export function Bloqueo({ children, titulo = "Se desbloquea al recibir tu frasco", texto, onClick, alto }) {
  return (
    <div className="relative rounded-[20px] overflow-hidden" style={alto ? { minHeight: alto } : undefined}>
      <div className="pointer-events-none select-none blur-[5px] opacity-60" aria-hidden="true">{children}</div>
      <button type="button" onClick={onClick}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        style={{ background: "linear-gradient(180deg,rgba(251,250,247,.35),rgba(251,250,247,.85))" }}>
        <div className="w-12 h-12 rounded-full bg-white border border-linea shadow-sm flex items-center justify-center text-[22px]">🔒</div>
        <div className="font-sora font-bold text-[14.5px] text-tinta mt-2.5">{titulo}</div>
        {texto && <div className="text-[12.5px] text-sub font-medium mt-1 leading-snug">{texto}</div>}
      </button>
    </div>
  );
}

export function Modal({ abierto, onCerrar, children }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  if (!ok || !abierto) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onCerrar}>
      <div className="w-full max-w-md bg-white rounded-t-[26px] p-6 pb-9 subir" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1.5 rounded-full bg-linea mx-auto mb-5" />
        {children}
      </div>
    </div>,
    document.body
  );
}

export function Confeti({ activo }) {
  if (!activo) return null;
  const cols = ["#F59E0B", "#C8102E", "#1B7F3B", "#FDE68A", "#2FA35A"];
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <span key={i} className="confeti" style={{
          left: `${(i * 37) % 100}%`, background: cols[i % cols.length],
          animationDelay: `${(i % 10) * 0.07}s`, transform: `rotate(${i * 23}deg)`,
        }} />
      ))}
    </div>
  );
}
