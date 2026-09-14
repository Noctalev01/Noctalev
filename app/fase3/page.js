"use client";
// Página de introdução da Fase 3 — explica o que é, para que serve e o que
// esperar ANTES de levar ao pagamento. O acesso é liberado automaticamente
// pelo webhook da Cakto após o pagamento (nome do produto contém "Fase 3").
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stars, Splash } from "../../components/ui";
import { load } from "../../lib/store";

export default function IntroFase3() {
  const router = useRouter();
  const [s, setS] = useState(null);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    setS(st);
  }, [router]);

  if (!s) return <Splash />;

  const email = s.perfil?.email || "";
  const link = (s.config?.checkoutFase3 || "") + (email ? `?email=${encodeURIComponent(email)}` : "");
  const jaPagou = !!s.fase3Paga;

  return (
    <div className="app-bg relative max-w-md mx-auto min-h-dvh">
      <Stars />
      <div className="relative z-10 pb-10">

        {/* hero */}
        <div className="relative h-[210px]">
          <img src="/img/fase3-cha.jpg" alt="Fórmula de Energia e Manutenção" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(16,20,44,.15), rgba(16,20,44,.97))" }} />
          <button onClick={() => router.back()} className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center text-[18px] font-black"
            style={{ background: "rgba(16,20,44,.72)", border: "1px solid rgba(255,255,255,.14)" }} aria-label="Voltar">‹</button>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="eyebrow" style={{ color: "#a5b4fc" }}>A ETAPA FINAL · FASE 3</div>
            <h1 className="text-[26px] font-black tracking-tight leading-tight mt-1">
              Fórmula de <span className="text-gold">Energia & Manutenção</span> 🔥
            </h1>
          </div>
        </div>

        <div className="px-5">
          {/* o que é */}
          <p className="text-sub2 text-[15px] font-semibold mt-4 leading-relaxed">
            Você destravou a noite (Fase 1) e dominou o dia (Fase 2). A Fase 3 existe para
            uma coisa só: <b className="text-txt">tornar o seu resultado definitivo</b> —
            sem efeito sanfona.
          </p>

          <div className="card mt-4 p-5">
            <div className="text-[14px] font-extrabold text-lilac">💡 O que é a Fórmula?</div>
            <p className="text-[13.5px] text-sub2 font-semibold mt-2 leading-relaxed">
              Uma combinação de manutenção — ingredientes naturais de mercado que sustentam
              a sua energia durante o dia e protegem o novo ritmo do seu metabolismo.
              Mesmo padrão das outras fases: preparo simples, barato e que rende semanas.
            </p>
          </div>

          {/* para que serve */}
          <div className="card mt-4 p-5">
            <div className="text-[14px] font-extrabold text-gold">🎯 Para que serve</div>
            <ul className="text-[13.5px] text-sub2 font-semibold mt-3 space-y-2.5 leading-relaxed">
              <li>✓ <b className="text-txt">Blinda contra o efeito sanfona</b> — o corpo aprende a manter o novo peso como padrão</li>
              <li>✓ <b className="text-txt">Sustenta a energia o dia todo</b> — sem depender de café em excesso ou doce</li>
              <li>✓ <b className="text-txt">Consolida o novo equilíbrio</b> — o emagrecimento deixa de ser esforço e vira rotina</li>
            </ul>
          </div>

          {/* o que esperar */}
          <div className="card mt-4 p-5" style={{ background: "rgba(165,180,252,.05)" }}>
            <div className="text-[14px] font-extrabold text-lilac">🗓️ O que esperar nesta etapa</div>
            <div className="mt-3 space-y-3">
              <div className="flex gap-3">
                <div className="text-[13px] font-black text-gold shrink-0 w-[86px]">Semana 1</div>
                <p className="text-[13px] text-sub2 font-semibold leading-relaxed">Você integra a fórmula à rotina que já domina. Energia mais estável desde os primeiros dias.</p>
              </div>
              <div className="flex gap-3">
                <div className="text-[13px] font-black text-gold shrink-0 w-[86px]">Semanas 2–4</div>
                <p className="text-[13px] text-sub2 font-semibold leading-relaxed">O peso conquistado se estabiliza. Menos oscilação na balança, mais constância no espelho.</p>
              </div>
              <div className="flex gap-3">
                <div className="text-[13px] font-black text-gold shrink-0 w-[86px]">Daqui em diante</div>
                <p className="text-[13px] text-sub2 font-semibold leading-relaxed">O protocolo completo vira o seu novo normal — noite, dia e manutenção trabalhando juntos.</p>
              </div>
            </div>
          </div>

          {/* como funciona no app */}
          <div className="card mt-4 p-5">
            <div className="text-[14px] font-extrabold text-green">📲 Como funciona</div>
            <ul className="text-[13.5px] text-sub2 font-semibold mt-3 space-y-2 leading-relaxed">
              <li>1. Você garante a Fase 3 no botão abaixo</li>
              <li>2. O acesso libera <b className="text-txt">automaticamente aqui no app</b> (mesmo e-mail da compra)</li>
              <li>3. Receita completa, passo a passo guiado e lista de compras — igual às outras fases</li>
            </ul>
          </div>

          {/* CTA */}
          {jaPagou ? (
            <div className="card mt-6 py-4 px-5 text-center">
              <div className="text-[15px] font-extrabold text-green">✅ Você já desbloqueou a Fase 3!</div>
              <p className="text-[12.5px] text-sub2 font-semibold mt-1">O conteúdo aparece na sua aba Receita.</p>
            </div>
          ) : (
            <>
              <a href={link} target="_blank" rel="noreferrer" className="cta-gold block w-full py-4 mt-6 text-center text-[16px]">
                Quero desbloquear a Fase 3 🔓
              </a>
              <p className="text-center text-[12px] text-sub font-semibold mt-2 px-2">
                Pagamento seguro pela Cakto · Acesso automático e imediato · Garantia de 30 dias
              </p>
            </>
          )}

          <button onClick={() => router.replace("/")} className="block mx-auto mt-5 text-[13.5px] font-bold text-sub">
            Voltar para o app
          </button>
        </div>
      </div>
    </div>
  );
}
