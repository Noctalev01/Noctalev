"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell, Logo, Splash } from "../../components/ui";
import { load, save, progressao, ajustesReceita } from "../../lib/store";
import { FASE1, FASE2_TEASER, FASE3_TEASER } from "../../lib/receitas";
import { Icone } from "../../components/icones";

export default function Receita() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [checks, setChecks] = useState({});
  const [ingAberto, setIngAberto] = useState(null); // id do ingrediente com ajuda aberta
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    setS(st);
    try { setChecks(JSON.parse(localStorage.getItem("noctalev_compras") || "{}")); } catch {}
  }, [router]);

  if (!s) return <Splash />;

  const prog = progressao(s);
  const ajustes = ajustesReceita(s.perfil);
  const preparou = !!s.receitaPreparadaEm;

  function toggle(id) {
    const n = { ...checks, [id]: !checks[id] };
    setChecks(n);
    localStorage.setItem("noctalev_compras", JSON.stringify(n));
  }

  async function copiarLista() {
    try {
      await navigator.clipboard.writeText(FASE1.listaCompras);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // fallback antigo
      const ta = document.createElement("textarea");
      ta.value = FASE1.listaCompras;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopiado(true); setTimeout(() => setCopiado(false), 2500); } catch {}
      document.body.removeChild(ta);
    }
  }

  function enviarWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(FASE1.listaCompras)}`;
    window.open(url, "_blank");
  }

  return (
    <PageShell>
      <Logo size="text-[19px]" />
      <div className="card mt-6 overflow-hidden" style={{ padding: 0 }}>
        <div className="relative h-[150px]">
          <img src="/img/cha-noturno.jpg" alt="Mistura do Sono Profundo" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(16,20,44,.05), rgba(16,20,44,.9))" }} />
          <div className="absolute bottom-3.5 left-4 right-4">
            <div className="eyebrow">Fase 1</div>
            <h1 className="text-[22px] font-extrabold tracking-tight mt-0.5">{FASE1.nome}</h1>
          </div>
        </div>
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
            <div className="text-[14.5px] font-extrabold text-green">Mistura pronta — rende ~14 noites</div>
            <div className="text-[12.5px] text-sub font-semibold">Conquista Alquimista desbloqueada</div>
          </div>
        </div>
      ) : (
        <Link href="/preparo" className="cta-gold block text-center py-4 mt-5 text-[15.5px]">
          Montar minha mistura (5 min, sem fogão)
        </Link>
      )}

      {/* ingredientes */}
      <div className="card mt-5 overflow-hidden" style={{ padding: 0 }}>
        <img src="/img/ingredientes.jpg" alt="Ingredientes naturais da mistura" className="w-full h-[110px] object-cover" />
        <div className="p-5 pt-4">
        <div className="eyebrow">Lista de ingredientes</div>
        <div className="text-[12.5px] text-sub font-semibold mt-1">Custo estimado: {FASE1.custo}. Marque o que já comprou:</div>
        <div className="mt-4 space-y-1">
          {FASE1.ingredientes.map((ing) => (
            <div key={ing.id} className="py-1.5">
              <div className="flex items-start gap-3">
                <button onClick={() => toggle(ing.id)} className="flex items-start gap-3 text-left flex-1">
                  <span className={`w-6 h-6 flex-none rounded-lg border flex items-center justify-center text-[13px] mt-[1px] ${
                    checks[ing.id] ? "bg-green/20 border-green text-green" : "border-white/25 text-transparent"
                  }`}>✓</span>
                  <span className={`text-[14px] font-semibold leading-snug ${checks[ing.id] ? "text-sub line-through" : "text-txt"}`}>
                    {ing.txt}
                  </span>
                </button>
                <button
                  onClick={() => setIngAberto(ingAberto === ing.id ? null : ing.id)}
                  className="flex-none text-[11px] font-extrabold rounded-full px-2.5 py-1 mt-[1px]"
                  style={{
                    background: ingAberto === ing.id ? "rgba(165,180,252,.2)" : "rgba(255,255,255,.07)",
                    color: "#a5b4fc", border: "1px solid rgba(165,180,252,.3)",
                  }}
                >
                  {ingAberto === ing.id ? "fechar" : "não achou?"}
                </button>
              </div>
              {ingAberto === ing.id && (
                <div className="mt-2 ml-9 rounded-xl p-3.5 space-y-2" style={{ background: "rgba(165,180,252,.07)", border: "1px solid rgba(165,180,252,.2)" }}>
                  <div className="text-[12.5px] text-sub2 font-semibold leading-relaxed">📍 <b className="text-lilac">Onde achar:</b> {ing.onde}</div>
                  <div className="text-[12.5px] text-sub2 font-semibold leading-relaxed">🔄 <b className="text-lilac">Alternativa:</b> {ing.alt}</div>
                  <div className="text-[12.5px] text-sub2 font-semibold leading-relaxed">💡 <b className="text-lilac">Dica:</b> {ing.dica}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* levar a lista para o mercado */}
        <div className="mt-4 pt-4 space-y-2.5" style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <div className="text-[12.5px] text-sub font-semibold">Vai ao mercado? Leve a lista com você:</div>
          <div className="flex gap-2.5">
            <button onClick={copiarLista} className="btn-ghost flex-1 py-3 text-[13px] font-extrabold">
              {copiado ? "✅ Copiado!" : "📋 Copiar lista"}
            </button>
            <button onClick={enviarWhatsApp} className="flex-1 py-3 text-[13px] font-extrabold rounded-xl"
              style={{ background: "rgba(37,211,102,.13)", border: "1px solid rgba(37,211,102,.4)", color: "#7ee8b2" }}>
              💬 Enviar no WhatsApp
            </button>
          </div>
          <div className="text-[11.5px] text-sub font-semibold text-center">
            Dica: envie para você mesma ou para quem for comprar por você
          </div>
        </div>
        </div>
      </div>

      {/* ritual noturno — card fixo */}
      <div className="card mt-5 p-5" style={{ borderColor: "rgba(251,211,141,.3)" }}>
        <div className="eyebrow" style={{ color: "#fbd38d" }}>Seu ritual de toda noite (~3 min)</div>
        <div className="mt-3 space-y-3">
          {[
            { e: "🥄", t: <><b className="text-txt">1 colher de sopa</b> da mistura na xícara</> },
            { e: "☕", t: <>Água quente por cima (<b className="text-txt">quente, não fervendo</b>) e abafe 5–10 min com um pires — o app tem um timer!</> },
            { e: "🍯", t: <>Coe, adoce com <b className="text-txt">1 colher de chá de mel</b> e tome morno, 30–60 min antes de deitar</> },
            { e: "🕯️", t: <>Depois do chá: <b className="text-txt">luz baixa + celular fora da cama</b></> },
          ].map((p, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-[18px] flex-none">{p.e}</span>
              <span className="text-[13.5px] text-sub2 font-semibold leading-relaxed">{p.t}</span>
            </div>
          ))}
        </div>
        {preparou && (
          <Link href="/ritual" className="cta-gold block text-center py-3.5 mt-4 text-[14.5px]">
            Fazer meu ritual de hoje
          </Link>
        )}
      </div>

      {/* por que funciona */}
      <div className="card mt-4 p-4" style={{ background: "rgba(165,180,252,.05)" }}>
        <p className="text-[12.5px] text-lilac font-semibold leading-relaxed">💡 {FASE1.educativo}</p>
      </div>

      <div className="card mt-4 p-4">
        <p className="text-[13px] text-sub2 font-semibold leading-relaxed">{FASE1.sabor}</p>
      </div>

      {/* fases bloqueadas */}
      <div className="card mt-5 overflow-hidden opacity-95" style={{ padding: 0 }}>
        <div className="relative h-[110px]">
          <img src="/img/fase2-shot.jpg" alt="" className="w-full h-full object-cover" style={{ filter: "saturate(.7) brightness(.75)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(16,20,44,.2), rgba(16,20,44,.92))" }} />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div className="text-[15px] font-extrabold">Fase 2 — {FASE2_TEASER.nome}</div>
            <Icone nome="cadeado" cor="#fbd38d" size={16} />
          </div>
        </div>
        <div className="p-[14px_18px_18px]">
          <p className="text-[13px] text-sub2 font-semibold leading-relaxed">{FASE2_TEASER.teaser}</p>
          {preparou && (
            <>
              <div className="bar-track mt-3"><div className="bar-fill" style={{ width: `${prog.pct}%` }} /></div>
              <div className="mt-2 text-[12.5px] font-bold text-gold">
                Analisando a resposta do seu corpo à Fase 1 · {prog.pct}%
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card mt-4 p-5 opacity-75">
        <div className="flex justify-between items-center">
          <div className="text-[15px] font-extrabold">Fase 3 — {FASE3_TEASER.nome}</div>
          <Icone nome="cadeado" cor="#8f97c0" size={16} />
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
