"use client";
// ===== 5.3 — Indicador de conexão + re-sync automático =====
// Sem internet: barrinha discreta avisando que está tudo salvo no
// celular. Internet voltou: sincroniza sozinha com a nuvem e confirma.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { syncNow } from "../lib/sync";

export default function StatusConexao() {
  const [montado, setMontado] = useState(false);
  const [offline, setOffline] = useState(false);
  const [voltou, setVoltou] = useState(false);

  useEffect(() => {
    setMontado(true);
    setOffline(typeof navigator !== "undefined" && !navigator.onLine);

    function caiu() { setOffline(true); setVoltou(false); }
    function voltouNet() {
      setOffline(false);
      setVoltou(true);
      syncNow(); // 🔄 re-sincroniza com a nuvem sozinha
      setTimeout(() => setVoltou(false), 4000);
    }
    window.addEventListener("offline", caiu);
    window.addEventListener("online", voltouNet);
    return () => {
      window.removeEventListener("offline", caiu);
      window.removeEventListener("online", voltouNet);
    };
  }, []);

  if (!montado || (!offline && !voltou)) return null;

  return createPortal(
    <div className="fixed top-0 left-0 right-0 z-[80] max-w-md mx-auto px-4 pt-3 pointer-events-none">
      <div className="rounded-2xl px-4 py-2.5 text-center text-[12px] font-extrabold backdrop-blur-md anim-pop"
        style={offline
          ? { background: "rgba(30,24,8,.92)", border: "1px solid rgba(246,173,85,.5)", color: "#f6ad55" }
          : { background: "rgba(8,26,18,.92)", border: "1px solid rgba(126,232,178,.5)", color: "#7ee8b2" }}>
        {offline
          ? "📴 Sem internet — pode usar normal, está tudo salvo no seu celular"
          : "✅ Internet de volta — seus dados foram sincronizados"}
      </div>
    </div>,
    document.body
  );
}
