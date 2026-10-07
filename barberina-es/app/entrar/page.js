"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { accederEmail, load, perfilCompleto } from "../../lib/store";
import { linkCamila } from "../../lib/config";
import { vibrar, Logo } from "../../components/ui";

const ERRORES = {
  formato: "Revisa tu email (ej. maria@gmail.com).",
  email: "No encontramos un pedido con este email. Usa el mismo email de tu compra o el enlace que te enviamos.",
  cancelado: "Este pedido figura como cancelado o devuelto.",
  red: "No hemos podido conectar. Revisa tu conexión e inténtalo de nuevo.",
};

function Entrar() {
  const router = useRouter();
  const q = useSearchParams();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const t = q.get("t") || q.get("token");
    if (t) { router.replace(`/a/${t}`); return; }
    const s = load();
    if (s.token) router.replace(perfilCompleto(s) ? "/" : "/bienvenida");
  }, [q, router]);

  async function entrar(e) {
    e.preventDefault();
    setErr("");
    setCargando(true);
    const r = await accederEmail(email);
    setCargando(false);
    if (!r.ok) { vibrar([30, 40, 30]); setErr(ERRORES[r.error] || ERRORES.email); return; }
    vibrar(15);
    router.replace(perfilCompleto(r.s) ? "/" : "/bienvenida");
  }

  return (
    <div className="max-w-md mx-auto min-h-dvh bg-fondo">
      <div className="hero" style={{ minHeight: 400 }}>
        <img className="fondo" src="/img/playa.jpg" alt="" style={{ objectPosition: "center 70%" }} />
        <div className="contenido px-6 pt-7 pb-16 flex flex-col justify-between" style={{ minHeight: 400 }}>
          <Logo claro />
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <h1 className="font-sora font-extrabold text-[30px] leading-[1.1] text-white">Tu acompañamiento con Barberina Max</h1>
              <p className="text-[14px] text-white/80 font-medium mt-2 leading-relaxed">Cada mañana, 20 segundos. El Dr. Castellanos y tu grupo te acompañan.</p>
            </div>
            <img src="/img/frasco.png" alt="Barberina Max" className="w-[96px] h-[120px] object-contain drop-shadow-2xl flotar flex-none" />
          </div>
        </div>
      </div>

      <form onSubmit={entrar} className="card p-5 mx-5 -mt-10 relative z-10 space-y-4 entrada">
        <div>
          <div className="font-sora font-extrabold text-[18px]">Entra en tu acompañamiento</div>
          <div className="text-[12.5px] text-sub font-medium mt-1 leading-snug">Abre el enlace que te enviamos o escribe el email de tu pedido.</div>
        </div>
        <label className="block">
          <span className="text-[12.5px] font-bold text-sub">Email del pedido</span>
          <input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" placeholder="maria@gmail.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1.5 px-4 py-4 text-[16px] font-semibold" />
        </label>
        {err && <div className="text-[13px] font-semibold text-rojo bg-[#FDECEE] rounded-2xl px-3 py-2.5 leading-snug">{err}</div>}
        <button disabled={cargando || email.length < 5} className="btn-verde w-full py-4 text-[16px] disabled:opacity-40">
          {cargando ? "Entrando…" : "Entrar"}
        </button>
        <a href={linkCamila("", "No encuentro mi enlace de la app.")} target="_blank" rel="noreferrer" className="block text-center text-[12.5px] font-bold text-oro2">¿No tienes tu enlace? Pídelo a Camila →</a>
      </form>

      <div className="flex justify-center gap-5 mt-6 text-[11.5px] font-bold text-sub">
        <span>🔒 Datos protegidos</span><span>👩‍⚕️ Dr. Castellanos</span><span>👭 Grupo semanal</span>
      </div>
      <p className="text-[11px] text-sub2 font-medium text-center mt-4 pb-8 px-8 leading-relaxed">
        Tus datos solo se usan para tu acompañamiento.
      </p>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Entrar /></Suspense>;
}
