"use client";
// 1.8 — Transição suave entre telas: todo conteúdo de página entra
// com um fade + leve subida (o template remonta a cada navegação).
// 2.2 — Aplica a preferência "letra maior" em todas as telas.
// 5.3 — Indicador de conexão (offline/online) em todas as telas.
import { useEffect } from "react";
import StatusConexao from "../components/StatusConexao";

export default function Template({ children }) {
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("noctalev_v1") || "{}");
      document.body.classList.toggle("texto-grande", !!s?.config?.textoGrande);
    } catch {}
  }, []);
  return (
    <div className="page-in">
      <StatusConexao />
      {children}
    </div>
  );
}
