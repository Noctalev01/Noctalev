"use client";
// 1.8 — Transição suave entre telas: todo conteúdo de página entra
// com um fade + leve subida (o template remonta a cada navegação).
export default function Template({ children }) {
  return <div className="page-in">{children}</div>;
}
