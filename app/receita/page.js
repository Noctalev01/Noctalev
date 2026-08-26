"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell, Logo } from "../../components/ui";
import { load, save, progressao, ajustesReceita } from "../../lib/store";
import { FASE1, FASE2_TEASER, FASE3_TEASER } from "../../lib/receitas";

export default function Receita() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [checks, setChecks] = useState({});

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    setS(st);
    try { setChecks(JSON.parse(localStorage.getItem("noctalev_compras") || "{}")); } catch {}
  }, [router]);

  if (!s) return <div className="app-bg min-h-dvh" />;

  const prog = progressao(s);
  const ajustes = ajustesReceita(s.perfil);
  const preparou = !!s.receitaPreparadaEm;

  function toggle(id) {
    const n = { ...checks, [id]: !checks[id] };
    setChecks(n);
    localStorage.setItem("noctalev_compras", JSON.stringify(n));
  }

  return (
    <PageShell>
      <Logo size="text-[19px]" />
      <div className="mt-6">
        <div className="eyebrow">Fase 1</div>
        <h1 className="text-[25px] font-extrabold tracking-tight mt-1">{FASE1.nome}</h1>
      </div>

      {ajustes.length > 0 && (
        <div className="card mt-5 p-4 border-lilac/40">
          <div className="text-[13.5px] font-extrabold text-lilac">Receita ajustada para o seu perfil</div>
          <div className="mt-2 space-y-2">
            {ajustes.map((a, i) => (
              <div key={i} className="text-[13px] text-sub2 font-semibold leading-relaxed">{a.emoji} {a.texto}</div>
            ))}
          </div>
        </div>
      )}

      {/* status preparo */}
      {preparou ? (
        <div className="card mt-5 p-4 flex items-center gap-3" style={{ borderColor: "rgba(126,232,178,.35)" }}>
          <span className="text-[22px]">🧪</span>
          <div>
            <div className="text-[14.5px] font-extrabold text-green">Gotas preparadas</div>
            <div className="text-[12.5px] text-sub font-semibold">Conquista Alquimista desbloqueada</div>
          </div>
        </div>
      ) : (
        <Link href="/preparo" className="cta-gold block text-center py-4 mt-5 text-[15.5px]">
          Iniciar preparo guiado
        </Link>
      )}

      {/* ingredientes */}
      <div className="card mt-5 p-5">
        <div className="eyebrow">Lista de ingredientes</div>
        <div className="text-[12.5px] text-sub font-semibold mt-1">Custo estimado: {FASE1.custo}. Marque o que já comprou:</div>
        <div className="mt-4 space-y-3">
          {FASE1.ingredientes.map((ing) => (
            <button key={ing.id} onClick={() => toggle(ing.id)} className="flex items-start gap-3 text-left w-full">
              <span className={`w-6 h-6 flex-none rounded-lg border flex items-center justify-center text-[13px] mt-[1px] ${
                checks[ing.id] ? "bg-green/20 border-green text-green" : "border-white/25 text-transparent"
              }`}>✓</span>
              <span className={`text-[14px] font-semibold leading-snug ${checks[ing.id] ? "text-sub line-through" : "text-txt"}`}>
                {ing.txt}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* como usar */}
      <div className="card mt-5 p-5">
        <div className="eyebrow">Como usar</div>
        <p className="text-[14px] font-bold text-gold mt-2 leading-relaxed">{FASE1.uso}</p>
        <p className="text-[13px] text-sub2 font-semibold mt-3 leading-relaxed">{FASE1.ritual}</p>
        <p className="text-[13px] text-sub2 font-semibold mt-3 leading-relaxed">{FASE1.sabor}</p>
      </div>

      {/* fases bloqueadas */}
      <div className="card mt-5 p-5 opacity-95">
        <div className="flex justify-between items-center">
          <div className="text-[15px] font-extrabold">Fase 2 — {FASE2_TEASER.nome}</div>
          <span className="text-[14px] opacity-70">🔒</span>
        </div>
        <p className="text-[13px] text-sub2 font-semibold mt-2 leading-relaxed">{FASE2_TEASER.teaser}</p>
        {preparou && (
          <>
            <div className="bar-track mt-3"><div className="bar-fill" style={{ width: `${prog.pct}%` }} /></div>
            <div className="mt-2 text-[12.5px] font-bold text-gold">
              Estamos analisando a resposta do seu corpo à Fase 1 · {prog.pct}%
            </div>
          </>
        )}
      </div>

      <div className="card mt-4 p-5 opacity-75">
        <div className="flex justify-between items-center">
          <div className="text-[15px] font-extrabold">Fase 3 — {FASE3_TEASER.nome}</div>
          <span className="text-[14px] opacity-70">🔒</span>
        </div>
        <p className="text-[13px] text-sub2 font-semibold mt-2 leading-relaxed">{FASE3_TEASER.teaser}</p>
      </div>

      <div className="card mt-5 p-4 text-[12px] text-sub font-semibold leading-relaxed">
        ⚠️ Este protocolo não substitui acompanhamento médico. Não indicado para grávidas, lactantes e crianças.
        Se você usa remédios de pressão, diabetes, ansiolíticos ou anticoagulantes, consulte seu médico.
      </div>
    </PageShell>
  );
}
