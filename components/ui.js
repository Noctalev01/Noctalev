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

export function Logo({ size = "text-[22px]" }) {
  return (
    <div className={`flex items-center justify-center gap-2 font-black tracking-tight ${size}`}>
      <span>🌙</span>
      <span>
        Nocta<span className="text-lilac">Lev</span>
      </span>
    </div>
  );
}

const TABS = [
  { href: "/", icon: "🏠", label: "Início" },
  { href: "/receita", icon: "🌿", label: "Receita" },
  { href: "/progresso", icon: "📈", label: "Progresso" },
  { href: "/bonus", icon: "🎁", label: "Bônus" },
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
            className={`flex-1 flex flex-col items-center justify-center gap-[3px] text-[11px] font-bold ${
              on ? "text-gold" : "text-taboff"
            }`}
          >
            <span className="text-[20px]">{t.icon}</span>
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
