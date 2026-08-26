"use client";
// ============================================================
// Página de OBRIGADO — destino após a compra na Cakto.
// Objetivo: confirmar o pedido, instalar o app na hora certa
// e levar a cliente ao acesso com o MESMO email da compra.
// Fluxo: 🎉 Pedido confirmado → 📲 Instalar o app → 🌙 Entrar
// ============================================================
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stars } from "../../components/ui";

function estaInstalado() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function ehIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}
function ehCelular() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

const LINK_APP = "https://noctalev.vercel.app";
const ZAP = "https://wa.me/5554920011946?text=" + encodeURIComponent("Olá! Acabei de comprar o Protocolo Noturno e preciso de ajuda para instalar o app NoctaLev. 💛");

export default function Obrigado() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [celular, setCelular] = useState(true);
  const [ios, setIos] = useState(false);
  const [instalado, setInstalado] = useState(false);
  const [deferido, setDeferido] = useState(null);
  const [instalou, setInstalou] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setCelular(ehCelular());
    setIos(ehIOS());
    setInstalado(estaInstalado());
    setPronto(true);
    const handler = (e) => { e.preventDefault(); setDeferido(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function instalarAndroid() {
    if (!deferido) return;
    deferido.prompt();
    const { outcome } = await deferido.userChoice;
    setDeferido(null);
    if (outcome === "accepted") setInstalou(true);
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(LINK_APP);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {}
  }

  if (!pronto) return <div className="app-bg min-h-dvh" />;

  return (
    <div className="app-bg relative max-w-md mx-auto min-h-dvh">
      <Stars />
      <div className="relative z-10 px-6 pt-12 pb-12">

        {/* ===== 1. CONFIRMAÇÃO DA COMPRA ===== */}
        <div className="text-center">
          <div className="text-[68px] anim-pop">🎉</div>
          <div className="inline-block mt-3 text-[11.5px] font-black rounded-full px-3.5 py-1.5 text-green"
            style={{ background: "rgba(126,232,178,.13)", border: "1px solid rgba(126,232,178,.4)" }}>
            ✓ PEDIDO CONFIRMADO
          </div>
          <h1 className="text-[26px] font-black tracking-tight mt-3 leading-tight">
            Bem-vinda ao<br /><span className="text-gold">Protocolo Noturno</span> 🌙
          </h1>
          <p className="text-sub2 text-[14px] font-semibold mt-3 leading-relaxed px-2">
            Sua compra foi aprovada e seu acesso já está liberado.
            A partir de hoje, seu sono trabalha a favor do seu emagrecimento. 💛
          </p>
        </div>

        {/* ===== O QUE ELA RECEBEU ===== */}
        <div className="card p-5 mt-6">
          <div className="eyebrow">O que você acabou de destravar</div>
          <div className="mt-3 space-y-2.5">
            {[
              { e: "🍵", t: "A Mistura do Sono Profundo — seu chá ritual (5 min de preparo, sem fogão)" },
              { e: "📱", t: "O app NoctaLev com acompanhamento diário, lembretes e conquistas" },
              { e: "⚡", t: "Os Aceleradores naturais que turbinam a queima durante o sono" },
              { e: "🔓", t: "As Fases 2 e 3, liberadas conforme seu corpo responde" },
            ].map((p, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-[17px] flex-none">{p.e}</span>
                <span className="text-[13px] text-sub2 font-semibold leading-relaxed">{p.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== 2. INSTALAR O APP ===== */}
        {celular && !instalado ? (
          <>
            <div className="mt-7">
              <div className="eyebrow" style={{ color: "#fbd38d" }}>Próximo passo · leva 30 segundos</div>
              <h2 className="text-[20px] font-extrabold tracking-tight mt-1">📲 Instale o app no seu celular</h2>
              <p className="text-sub2 text-[13px] font-semibold mt-1.5 leading-relaxed">
                Assim o NoctaLev fica na sua tela de início e você entra <b className="text-gold">uma única vez</b> — sem digitar o email de novo depois.
              </p>
            </div>

            {instalou ? (
              <div className="card p-5 mt-4 text-center" style={{ borderColor: "rgba(126,232,178,.4)" }}>
                <div className="text-[34px]">🎉</div>
                <div className="text-[15px] font-extrabold mt-2">App instalado!</div>
                <p className="text-sub2 text-[13px] font-semibold mt-2 leading-relaxed">
                  Agora procure o ícone <b className="text-gold">🌙 NoctaLev</b> na sua tela de início e abra por lá para fazer seu acesso. 💛
                </p>
              </div>
            ) : ios ? (
              <div className="card p-5 mt-4">
                <div className="space-y-4">
                  {[
                    { n: "1", t: <>Toque no botão <b className="text-gold">Compartilhar</b> <span className="inline-block px-1.5 py-0.5 rounded-md text-[12px]" style={{ background: "rgba(165,180,252,.15)", border: "1px solid rgba(165,180,252,.3)" }}>⬆️</span> na barra do Safari (embaixo, no meio)</> },
                    { n: "2", t: <>Role a lista e toque em <b className="text-gold">"Adicionar à Tela de Início"</b> <span className="inline-block px-1.5 py-0.5 rounded-md text-[12px]" style={{ background: "rgba(165,180,252,.15)", border: "1px solid rgba(165,180,252,.3)" }}>➕</span></> },
                    { n: "3", t: <>Toque em <b className="text-gold">"Adicionar"</b> no canto superior direito</> },
                    { n: "4", t: <>Abra o app <b className="text-gold">🌙 NoctaLev</b> que apareceu na sua tela — e faça seu acesso por lá 💛</> },
                  ].map((p) => (
                    <div key={p.n} className="flex gap-3 items-start">
                      <div className="w-7 h-7 flex-none rounded-full flex items-center justify-center text-[13px] font-black text-[#3c2a10]"
                        style={{ background: "linear-gradient(135deg,#fbd38d,#f6ad55)" }}>{p.n}</div>
                      <div className="text-[13.5px] text-sub2 font-semibold leading-relaxed">{p.t}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-3 mt-4 text-[11.5px] text-sub font-semibold leading-relaxed" style={{ background: "rgba(255,255,255,.03)" }}>
                  💡 No iPhone, isso só funciona pelo <b className="text-sub2">Safari</b>. Se esta página abriu dentro do Instagram ou de outro app, toque nos 3 pontinhos e escolha "Abrir no Safari" primeiro.
                </div>
              </div>
            ) : deferido ? (
              <button onClick={instalarAndroid} className="cta-gold w-full py-4 mt-4 text-[16px]">
                📲 Instalar o app agora (1 toque)
              </button>
            ) : (
              <div className="card p-5 mt-4">
                <div className="space-y-4">
                  {[
                    { n: "1", t: <>Toque nos <b className="text-gold">3 pontinhos ⋮</b> no canto superior direito do navegador</> },
                    { n: "2", t: <>Toque em <b className="text-gold">"Adicionar à tela inicial"</b> (ou "Instalar aplicativo")</> },
                    { n: "3", t: <>Confirme — e abra o app <b className="text-gold">🌙 NoctaLev</b> pela sua tela de início 💛</> },
                  ].map((p) => (
                    <div key={p.n} className="flex gap-3 items-start">
                      <div className="w-7 h-7 flex-none rounded-full flex items-center justify-center text-[13px] font-black text-[#3c2a10]"
                        style={{ background: "linear-gradient(135deg,#fbd38d,#f6ad55)" }}>{p.n}</div>
                      <div className="text-[13.5px] text-sub2 font-semibold leading-relaxed">{p.t}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aviso do email ANTES do botão de continuar */}
            <div className="card p-4 mt-4" style={{ background: "rgba(251,211,141,.06)", borderColor: "rgba(251,211,141,.35)" }}>
              <div className="text-[13px] font-extrabold text-gold">🔑 Muito importante</div>
              <p className="text-[12.5px] text-sub2 font-semibold mt-1.5 leading-relaxed">
                Para entrar no app, use <b className="text-txt">o mesmo email que você usou nesta compra</b>. É ele que libera seu acesso — sem senha, sem código.
              </p>
            </div>

            <button onClick={() => router.push("/onboarding")} className="w-full mt-4 py-3.5 rounded-[14px] text-[14px] font-extrabold text-sub2"
              style={{ border: "1px solid rgba(255,255,255,.18)" }}>
              {instalou ? "Ou continuar por aqui mesmo →" : "Prefiro continuar sem instalar →"}
            </button>
          </>
        ) : celular && instalado ? (
          /* Já está dentro do app instalado */
          <>
            <div className="card p-4 mt-6" style={{ background: "rgba(251,211,141,.06)", borderColor: "rgba(251,211,141,.35)" }}>
              <div className="text-[13px] font-extrabold text-gold">🔑 Muito importante</div>
              <p className="text-[12.5px] text-sub2 font-semibold mt-1.5 leading-relaxed">
                Para entrar, use <b className="text-txt">o mesmo email da sua compra</b>. É ele que libera seu acesso — sem senha, sem código.
              </p>
            </div>
            <button onClick={() => router.push("/onboarding")} className="cta-gold w-full py-4 mt-4 text-[16px]">
              Começar meu protocolo agora 🌙
            </button>
          </>
        ) : (
          /* Desktop: orienta a abrir no celular */
          <>
            <div className="mt-7">
              <div className="eyebrow" style={{ color: "#fbd38d" }}>Próximo passo</div>
              <h2 className="text-[20px] font-extrabold tracking-tight mt-1">📲 Abra no seu celular</h2>
              <p className="text-sub2 text-[13px] font-semibold mt-1.5 leading-relaxed">
                O NoctaLev foi feito para viver no seu celular — é lá que chegam os lembretes do chá e do ritual. Copie o link e abra no navegador do celular:
              </p>
            </div>
            <div className="card p-4 mt-4 flex items-center gap-3">
              <span className="text-[14px] font-extrabold text-lilac flex-1 break-all">{LINK_APP}</span>
              <button onClick={copiarLink} className="cta-gold flex-none px-4 py-2.5 text-[13px]">
                {copiado ? "✅ Copiado!" : "Copiar"}
              </button>
            </div>
            <div className="card p-4 mt-4" style={{ background: "rgba(251,211,141,.06)", borderColor: "rgba(251,211,141,.35)" }}>
              <div className="text-[13px] font-extrabold text-gold">🔑 Muito importante</div>
              <p className="text-[12.5px] text-sub2 font-semibold mt-1.5 leading-relaxed">
                Para entrar, use <b className="text-txt">o mesmo email desta compra</b> — é ele que libera seu acesso, sem senha e sem código.
              </p>
            </div>
            <button onClick={() => router.push("/onboarding")} className="w-full mt-4 py-3.5 rounded-[14px] text-[14px] font-extrabold text-sub2"
              style={{ border: "1px solid rgba(255,255,255,.18)" }}>
              Ou continuar pelo computador →
            </button>
          </>
        )}

        {/* ===== AJUDA ===== */}
        <a href={ZAP} target="_blank" rel="noreferrer"
          className="card flex items-center gap-3 mt-5 p-4 active:opacity-80"
          style={{ borderColor: "rgba(126,232,178,.35)" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="flex-none">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Z" fill="#25D366" />
            <path d="M16.6 13.8c-.25-.13-1.47-.72-1.7-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06a6.7 6.7 0 0 1-3.35-2.93c-.25-.43.25-.4.72-1.34.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.9 2.4 1.02 2.57.12.17 1.76 2.68 4.25 3.76.6.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" fill="#fff" />
          </svg>
          <div className="flex-1">
            <div className="text-[14px] font-extrabold">Qualquer dúvida, fale com a gente</div>
            <div className="text-[12px] text-sub2 font-semibold mt-0.5">Suporte no WhatsApp 💛</div>
          </div>
          <span className="text-green text-[18px]">›</span>
        </a>

        <p className="text-[11.5px] text-sub font-semibold text-center mt-6 leading-relaxed">
          Guarde este email de acesso com carinho.<br />Seu protocolo começa hoje à noite. 🌙
        </p>
      </div>
    </div>
  );
}
