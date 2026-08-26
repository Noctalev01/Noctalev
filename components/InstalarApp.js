"use client";
// ============================================================
// Banner + modal "Instalar o app NoctaLev"
// - Android/Chrome: usa o evento beforeinstallprompt (1 toque)
// - iPhone/Safari: mostra passo a passo (Compartilhar → Adicionar à Tela de Início)
// - Já instalado (standalone): não mostra nada
// - Dispensado: guarda no localStorage e volta a oferecer depois de 3 dias
// ============================================================
import { useEffect, useState } from "react";

const KEY_DISPENSADO = "noctalev_pwa_dispensado";

function estaInstalado() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true // iOS
  );
}

function ehIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

export default function InstalarApp() {
  const [mostrar, setMostrar] = useState(false);
  const [modalIOS, setModalIOS] = useState(false);
  const [deferido, setDeferido] = useState(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (estaInstalado()) return;
    // respeita o "agora não" por 3 dias
    try {
      const disp = localStorage.getItem(KEY_DISPENSADO);
      if (disp && Date.now() - Number(disp) < 3 * 86400000) return;
    } catch {}

    setIos(ehIOS());

    if (ehIOS()) {
      // iOS não tem beforeinstallprompt — mostra o banner direto
      setMostrar(true);
      return;
    }

    // Android/desktop Chrome: espera o navegador oferecer a instalação
    const handler = (e) => {
      e.preventDefault();
      setDeferido(e);
      setMostrar(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!mostrar) return null;

  async function instalar() {
    if (ios) { setModalIOS(true); return; }
    if (deferido) {
      deferido.prompt();
      const { outcome } = await deferido.userChoice;
      if (outcome === "accepted") setMostrar(false);
      setDeferido(null);
    }
  }

  function dispensar() {
    try { localStorage.setItem(KEY_DISPENSADO, String(Date.now())); } catch {}
    setMostrar(false);
    setModalIOS(false);
  }

  return (
    <>
      {/* Banner fixo acima da tab bar */}
      <div className="fixed left-0 right-0 z-40 px-4" style={{ bottom: "calc(78px + env(safe-area-inset-bottom, 0px) + 10px)" }}>
        <div className="max-w-md mx-auto card p-3.5 flex items-center gap-3 anim-pop"
          style={{ background: "rgba(16,20,44,.97)", borderColor: "rgba(251,211,141,.45)", boxShadow: "0 8px 32px rgba(0,0,0,.5)" }}>
          <div className="w-11 h-11 flex-none rounded-[13px] flex items-center justify-center text-[22px]"
            style={{ background: "linear-gradient(135deg,#1a2150,#10142c)", border: "1px solid rgba(251,211,141,.4)" }}>🌙</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-extrabold leading-tight">Instale o app NoctaLev</div>
            <div className="text-[11.5px] text-sub font-semibold mt-0.5 leading-tight">
              Acesso em 1 toque, tela cheia e lembretes do ritual 💛
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <button onClick={instalar} className="cta-gold px-3.5 py-2 text-[12.5px] whitespace-nowrap">Instalar</button>
            <button onClick={dispensar} className="text-[11px] font-bold text-sub text-center">Agora não</button>
          </div>
        </div>
      </div>

      {/* Modal passo a passo iOS */}
      {modalIOS && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(5,7,20,.8)" }} onClick={() => setModalIOS(false)}>
          <div className="max-w-md w-full card m-4 p-6 anim-pop" style={{ background: "#141936" }} onClick={(e) => e.stopPropagation()}>
            <div className="text-center text-[40px]">📲</div>
            <h2 className="text-[19px] font-black text-center mt-2">Instalar no iPhone</h2>
            <p className="text-sub2 text-[13px] font-semibold text-center mt-1">Leva 10 segundos:</p>
            <div className="mt-5 space-y-4">
              {[
                { n: "1", t: <>Toque no botão <b className="text-gold">Compartilhar</b> <span className="inline-block px-1.5 py-0.5 rounded-md text-[12px]" style={{ background: "rgba(165,180,252,.15)", border: "1px solid rgba(165,180,252,.3)" }}>⬆️</span> na barra do Safari (embaixo, no meio)</> },
                { n: "2", t: <>Role a lista e toque em <b className="text-gold">"Adicionar à Tela de Início"</b> <span className="inline-block px-1.5 py-0.5 rounded-md text-[12px]" style={{ background: "rgba(165,180,252,.15)", border: "1px solid rgba(165,180,252,.3)" }}>➕</span></> },
                { n: "3", t: <>Toque em <b className="text-gold">"Adicionar"</b> no canto superior direito. Pronto! O NoctaLev vira um app na sua tela 🌙</> },
              ].map((p) => (
                <div key={p.n} className="flex gap-3 items-start">
                  <div className="w-7 h-7 flex-none rounded-full flex items-center justify-center text-[13px] font-black text-[#3c2a10]"
                    style={{ background: "linear-gradient(135deg,#fbd38d,#f6ad55)" }}>{p.n}</div>
                  <div className="text-[13.5px] text-sub2 font-semibold leading-relaxed">{p.t}</div>
                </div>
              ))}
            </div>
            <div className="card p-3 mt-5 text-[11.5px] text-sub font-semibold leading-relaxed" style={{ background: "rgba(255,255,255,.03)" }}>
              💡 Importante: no iPhone, isso só funciona pelo <b className="text-sub2">Safari</b>. Se você abriu por outro navegador ou pelo Instagram, copie o link e abra no Safari primeiro.
            </div>
            <a href={"https://wa.me/5554920011946?text=" + encodeURIComponent("Olá! Estou tentando instalar o app NoctaLev no meu celular e preciso de ajuda. 💛")}
              target="_blank" rel="noreferrer"
              className="block text-center mt-4 py-3 rounded-[14px] text-[13.5px] font-extrabold text-green"
              style={{ border: "1px solid rgba(126,232,178,.35)" }}>
              💬 Não consegui — me ajudem no WhatsApp
            </a>
            <button onClick={dispensar} className="w-full mt-2 py-3 text-[13.5px] font-bold text-sub">Entendi, fechar</button>
          </div>
        </div>
      )}
    </>
  );
}
