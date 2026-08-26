"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-[78px] flex bg-[rgba(8,11,26,.92)] border-t border-[rgba(165,180,252,.14)] backdrop-blur-md max-w-md mx-auto">
      {TABS.map((t) => {
        const on = path === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex-1 flex flex-col items-center justify-center gap-[4px] text-[10.5px] font-bold ${
              on ? "text-gold" : "text-taboff"
            }`}
          >
            <IconTab name={t.icon} on={on} />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Ring({ pct, label = "SONO", size = 110, color = "#7ee8b2" }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(pct, 100) / 100);
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.09)" strokeWidth="10" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="10" fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <b className="text-[26px] font-black" style={{ color }}>{Math.round(pct)}%</b>
        <span className="text-[10.5px] text-sub font-bold mt-[1px]">{label}</span>
      </div>
    </div>
  );
}

export function Sparkline({ pesos, width = 150, height = 84 }) {
  if (!pesos || pesos.length < 2) {
    return (
      <div className="flex-none text-center text-sub text-[12px] font-semibold w-[150px]">
        Registre seu peso<br />para ver o gráfico 📉
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

export function PageShell({ children, tabbar = true }) {
  return (
    <div className="app-bg relative max-w-md mx-auto min-h-dvh overflow-x-hidden">
      <Stars />
      <div className="relative z-10 px-6 pt-8" style={{ paddingBottom: tabbar ? 110 : 40 }}>
        {children}
      </div>
      {tabbar && <TabBar />}
    </div>
  );
}
