"use client";
// ============================================================
// Banner "Instalar o app NoctaLev" (Home)
// - Android/Chrome: usa o evento beforeinstallprompt (1 toque)
// - iPhone/Safari: abre o passo a passo atualizado (iOS 26+ e antigo)
//   reaproveitando o mesmo componente da tela de entrada (PassosInstalar)
// - Já instalado (standalone): não mostra nada
// - Dispensado: guarda no localStorage e volta a oferecer depois de 3 dias
// ============================================================
import { useEffect, useState } from "react";
import PassosInstalar, { estaInstalado, ehIOS } from "./PassosInstalar";

const KEY_DISPENSADO = "noctalev_pwa_dispensado";

export default function InstalarApp() {
  const [mostrar, setMostrar] = useState(false);
  const [modal, setModal] = useState(false);
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
    if (ios) { setModal(true); return; }
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
    setModal(false);
  }

  return (
    <>
      {/* Banner fixo acima da tab bar */}
      <div className="fixed left-0 right-0 z-40 px-4" style={{ bottom: "calc(78px + env(safe-area-inset-bottom, 0px) + 10px)" }}>
        <div className="max-w-md mx-auto card p-3.5 flex items-center gap-3 anim-pop"
          style={{ background: "rgba(16,20,44,.97)", borderColor: "rgba(251,211,141,.45)", boxShadow: "0 8px 32px rgba(0,0,0,.5)" }}>
          <div className="w-11 h-11 flex-none rounded-[13px] flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#1a2150,#10142c)", border: "1px solid rgba(251,211,141,.4)" }}>
            <img src="/apple-touch-icon.png" alt="" className="w-8 h-8 rounded-[9px]" />
          </div>
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

      {/* Modal passo a passo (iPhone) */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(5,7,20,.82)" }} onClick={() => setModal(false)}>
          <div className="max-w-md w-full rounded-t-[24px] anim-pop flex flex-col"
            style={{ background: "#141936", maxHeight: "92dvh", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex-none pt-3 pb-2 px-5">
              <div className="w-10 h-1.5 rounded-full mx-auto" style={{ background: "rgba(255,255,255,.18)" }} />
              <div className="flex items-center justify-between mt-3">
                <h2 className="text-[18px] font-black">Instalar no iPhone 📲</h2>
                <button onClick={() => setModal(false)} className="text-[13px] font-bold text-sub px-2 py-1">Fechar</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <PassosInstalar aberto titulo="Passo a passo (30 segundos)" />
              <button onClick={dispensar} className="w-full mt-3 py-3 text-[13px] font-bold text-sub">Não quero instalar agora</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
