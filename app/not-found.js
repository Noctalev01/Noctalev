// ===== 5.2 — Página não encontrada (404) no tema do app =====
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app-bg relative max-w-md mx-auto min-h-dvh flex flex-col items-center justify-center px-8 text-center">
      <div className="text-[58px]">🔭</div>
      <h1 className="text-[22px] font-black tracking-tight mt-4">Essa página não existe</h1>
      <p className="text-[13.5px] text-sub2 font-semibold leading-relaxed mt-3">
        O endereço que você tentou abrir não foi encontrado.
        Sem problema — seu protocolo continua te esperando no início. 🌙
      </p>
      <Link href="/" className="cta-gold block w-full py-4 mt-7 text-[15px] text-center">
        Voltar ao início
      </Link>
    </div>
  );
}
