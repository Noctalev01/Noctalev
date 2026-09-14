"use client";
// Página de introdução da Fase 2 — explica o que é, para que serve e o que
// esperar ANTES de levar ao pagamento. O acesso é liberado automaticamente
// pelo webhook da Cakto após o pagamento (nome do produto contém "Fase 2").
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stars, Splash } from "../../components/ui";
import { load } from "../../lib/store";

export default function IntroFase2() {
  const router = useRouter();
  const [s, setS] = useState(null);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    setS(st);
  }, [router]);

  if (!s) return <Splash />;

  const email = s.perfil?.email || "";
  const link = (s.config?.checkoutFase2 || "") + (email ? `?email=${encodeURIComponent(email)}` : "");
  const jaPagou = !!s.fase2Paga;

  return (
    <div className="app-bg relative max-w-md mx-auto min-h-dvh">
      <Stars />
      <div className="relative z-10 pb-10">

        {/* hero */}
        <div className="relative h-[210px]">
          <img src="/img/fase2-shot.jpg" alt="Shot Termo-Metabólico" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(16,20,44,.15), rgba(16,20,44,.97))" }} />
          <button onClick={() => router.back()} className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center text-[18px] font-black"
            style={{ background: "rgba(16,20,44,.72)", border: "1px solid rgba(255,255,255,.14)" }} aria-label="Voltar">‹</button>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="eyebrow" style={{ color: "#7ee8b2" }}>✓ SEU CORPO ESTÁ PRONTO · FASE 2</div>
            <h1 className="text-[26px] font-black tracking-tight leading-tight mt-1">
              Shot <span className="text-gold">Termo-Metabólico</span> ☀️
            </h1>
          </div>
        </div>

        <div className="px-5">
          {/* o que é */}
          <p className="text-sub2 text-[15px] font-semibold mt-4 leading-relaxed">
            A Fase 1 cuidou da sua <b className="text-txt">noite</b>: sono profundo, cortisol baixo,
            beliscos noturnos sob controle. A Fase 2 ataca a outra metade do problema —
            <b className="text-txt"> o seu dia</b>.
          </p>

          <div className="card mt-4 p-5">
            <div className="text-[14px] font-extrabold text-lilac">💡 O que é o Shot?</div>
            <p className="text-[13.5px] text-sub2 font-semibold mt-2 leading-relaxed">
              Uma dose pequena e concentrada, tomada de manhã, feita com ingredientes
              termogênicos naturais de mercado (na linha de gengibre, cúrcuma e limão).
              Preparo de 10 minutos que rende vários dias — igualzinho à sua mistura da noite.
            </p>
          </div>

          {/* para que serve */}
          <div className="card mt-4 p-5">
            <div className="text-[14px] font-extrabold text-gold">🎯 Para que serve</div>
            <ul className="text-[13.5px] text-sub2 font-semibold mt-3 space-y-2.5 leading-relaxed">
              <li>✓ <b className="text-txt">Corta a fome descontrolada da tarde</b> — aquela vontade de atacar a cozinha às 16h</li>
              <li>✓ <b className="text-txt">Estabiliza os picos de glicemia</b> — menos "sobe e desce" de energia e de vontade de doce</li>
              <li>✓ <b className="text-txt">Acelera o metabolismo diurno</b> — seu corpo passa a queimar melhor também de dia</li>
            </ul>
          </div>

          {/* o que esperar */}
          <div className="card mt-4 p-5" style={{ background: "rgba(165,180,252,.05)" }}>
            <div className="text-[14px] font-extrabold text-lilac">🗓️ O que esperar nesta etapa</div>
            <div className="mt-3 space-y-3">
              <div className="flex gap-3">
                <div className="text-[13px] font-black text-gold shrink-0 w-[86px]">Dias 1–3</div>
                <p className="text-[13px] text-sub2 font-semibold leading-relaxed">Adaptação ao sabor e ao ritual da manhã. Você já sente o corpo "acordar" mais rápido.</p>
              </div>
              <div className="flex gap-3">
                <div className="text-[13px] font-black text-gold shrink-0 w-[86px]">Dias 4–7</div>
                <p className="text-[13px] text-sub2 font-semibold leading-relaxed">A fome da tarde começa a perder força. Menos beliscos entre as refeições.</p>
              </div>
              <div className="flex gap-3">
                <div className="text-[13px] font-black text-gold shrink-0 w-[86px]">Semana 2+</div>
                <p className="text-[13px] text-sub2 font-semibold leading-relaxed">Noite + dia trabalhando juntos: é aqui que a balança costuma responder mais rápido.</p>
              </div>
            </div>
          </div>

          {/* como funciona no app */}
          <div className="card mt-4 p-5">
            <div className="text-[14px] font-extrabold text-green">📲 Como funciona</div>
            <ul className="text-[13.5px] text-sub2 font-semibold mt-3 space-y-2 leading-relaxed">
              <li>1. Você garante a Fase 2 no botão abaixo</li>
              <li>2. O acesso libera <b className="text-txt">automaticamente aqui no app</b> (mesmo e-mail da compra)</li>
              <li>3. Receita completa, passo a passo guiado e lista de compras — igual à Fase 1</li>
            </ul>
            <p className="text-[12.5px] text-sub font-semibold mt-3">
              🔒 Você continua com a Fase 1 normalmente — o chá da noite não para.
            </p>
          </div>

          {/* CTA */}
          {jaPagou ? (
            <div className="card mt-6 py-4 px-5 text-center">
              <div className="text-[15px] font-extrabold text-green">✅ Você já desbloqueou a Fase 2!</div>
              <p className="text-[12.5px] text-sub2 font-semibold mt-1">O conteúdo aparece na sua aba Receita.</p>
            </div>
          ) : (
            <>
              <a href={link} target="_blank" rel="noreferrer" className="cta-gold block w-full py-4 mt-6 text-center text-[16px]">
                Quero desbloquear a Fase 2 🔓
              </a>
              <p className="text-center text-[12px] text-sub font-semibold mt-2 px-2">
                Pagamento seguro pela Cakto · Acesso automático e imediato · Garantia de 30 dias
              </p>
            </>
          )}

          <button onClick={() => router.replace("/")} className="block mx-auto mt-5 text-[13.5px] font-bold text-sub">
            Continuar na Fase 1 por enquanto
          </button>
        </div>
      </div>
    </div>
  );
}
