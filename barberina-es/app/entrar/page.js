"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, load, normalizarTel } from "../../lib/store";
import { vibrar, Logo } from "../../components/ui";

const ERRORES = {
  telefono: "Revisa tu teléfono: son 9 dígitos (ej. 612 345 678).",
  pin: "El PIN son 4 números.",
  pin_incorrecto: "PIN incorrecto. Si no lo recuerdas, escribe a Camila por WhatsApp.",
};

function Entrar() {
  const router = useRouter();
  const q = useSearchParams();
  const [tel, setTel] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const s = load();
    const t = q.get("tel");
    if (t) setTel(normalizarTel(t));
    else if (s.tel) setTel(s.tel);
    if (s.tel && s.pin && (!t || normalizarTel(t) === s.tel)) router.replace(s.perfil?.nombre ? "/" : "/bienvenida");
  }, [q, router]);

  async function entrar(e) {
    e.preventDefault();
    setErr("");
    setCargando(true);
    const r = await login(tel, pin);
    setCargando(false);
    if (!r.ok) { vibrar([30, 40, 30]); setErr(ERRORES[r.error] || "No hemos podido entrar. Inténtalo de nuevo."); return; }
    vibrar(15);
    router.replace(r.s.perfil?.nombre ? "/" : "/bienvenida");
  }

  const fmt = (v) => v.replace(/\D/g, "").slice(0, 9).replace(/(\d{3})(\d{0,3})(\d{0,3})/, (m, a, b, c) => [a, b, c].filter(Boolean).join(" "));

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
        <label className="block">
          <span className="text-[12.5px] font-bold text-sub">Teléfono del pedido</span>
          <div className="flex mt-1.5 gap-2">
            <span className="flex items-center px-3.5 rounded-[16px] bg-crema text-[15px] font-bold text-sub">🇪🇸 +34</span>
            <input inputMode="numeric" autoComplete="tel-national" placeholder="612 345 678"
              value={fmt(tel)} onChange={(e) => setTel(e.target.value.replace(/\D/g, "").slice(0, 9))}
              className="flex-1 min-w-0 px-4 py-3.5 text-[17px] font-semibold" />
          </div>
        </label>
        <label className="block">
          <span className="text-[12.5px] font-bold text-sub">PIN de 4 números</span>
          <input type="password" inputMode="numeric" maxLength={4} placeholder="••••"
            value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="w-full mt-1.5 px-4 py-3.5 text-[22px] tracking-[12px] font-bold text-center" />
          <span className="block text-[11.5px] text-sub2 font-medium mt-1.5">¿Primera vez? Elige ahora tu PIN y recuérdalo.</span>
        </label>
        {err && <div className="text-[13px] font-semibold text-rojo bg-[#FDECEE] rounded-2xl px-3 py-2.5">{err}</div>}
        <button disabled={cargando || tel.length < 9 || pin.length < 4} className="btn-verde w-full py-4 text-[16px] disabled:opacity-40">
          {cargando ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="flex justify-center gap-5 mt-6 text-[11.5px] font-bold text-sub">
        <span>🔒 Datos protegidos</span><span>👩‍⚕️ Dr. Castellanos</span><span>👭 Grupo semanal</span>
      </div>
      <p className="text-[11px] text-sub2 font-medium text-center mt-4 pb-8 px-8 leading-relaxed">
        Usa el mismo teléfono de tu pedido. Tus datos solo se usan para tu acompañamiento.
      </p>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Entrar /></Suspense>;
}
