"use client";
// 1.8 — Transição suave entre telas: todo conteúdo de página entra
// com um fade + leve subida (o template remonta a cada navegação).
// 2.2 — Aplica a preferência "letra maior" em todas as telas.
import { useEffect } from "react";

export default function Template({ children }) {
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("noctalev_v1") || "{}");
      document.body.classList.toggle("texto-grande", !!s?.config?.textoGrande);
    } catch {}
  }, []);
  return <div className="page-in">{children}</div>;
}
