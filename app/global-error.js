"use client";
// ===== 5.2 — Erro global (último recurso, se até o layout quebrar) =====
export default function GlobalError({ reset }) {
  return (
    <html lang="pt-BR">
      <body style={{
        margin: 0, minHeight: "100dvh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        background: "linear-gradient(180deg,#1a2044,#10142c)", color: "#eef0fb",
        fontFamily: "Inter, -apple-system, sans-serif", padding: "0 32px",
      }}>
        <div style={{ fontSize: 58 }}>🌙</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "16px 0 0" }}>Ops, um soluço aqui…</h1>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#b9bfdd", lineHeight: 1.6, marginTop: 12 }}>
          Algo deu errado, mas seus dados estão seguros no seu celular.
        </p>
        <button onClick={() => reset()} style={{
          width: "100%", maxWidth: 320, padding: "16px 0", marginTop: 28, border: 0,
          borderRadius: 18, fontSize: 15, fontWeight: 800, color: "#3c2a10",
          background: "linear-gradient(135deg,#fbd38d,#f6ad55)", cursor: "pointer",
        }}>
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
