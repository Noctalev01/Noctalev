"use client";
// ===== 5.2 — Tela de erro amigável =====
// Se qualquer tela quebrar, em vez de página branca ou erro em inglês,
// ela vê isto — no tema do app, com botão para se recuperar sozinha.
// Os dados dela estão seguros no celular (localStorage não é afetado).
export default function Error({ error, reset }) {
  return (
    <div className="app-bg relative max-w-md mx-auto min-h-dvh flex flex-col items-center justify-center px-8 text-center">
      <div className="text-[58px]">🌙</div>
      <h1 className="text-[22px] font-black tracking-tight mt-4">Ops, um soluço aqui…</h1>
      <p className="text-[13.5px] text-sub2 font-semibold leading-relaxed mt-3">
        Algo deu errado ao carregar esta tela, mas fique tranquila:
        <b className="text-txt"> seus dados estão seguros</b> — rituais, check-ins e pontos, tudo guardado.
      </p>
      <button onClick={() => reset()} className="cta-gold w-full py-4 mt-7 text-[15px]">
        Tentar de novo
      </button>
      <button onClick={() => { window.location.href = "/"; }}
        className="btn-ghost w-full py-3.5 mt-3 text-[14px] font-extrabold">
        Ir para o início
      </button>
      <p className="text-[11px] text-sub font-semibold mt-6">
        Se continuar acontecendo, feche e abra o app de novo.
      </p>
    </div>
  );
}
