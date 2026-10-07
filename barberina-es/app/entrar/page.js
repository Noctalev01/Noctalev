"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, load, normalizarTel } from "../../lib/store";
import { vibrar } from "../../components/ui";

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
    <div className="max-w-md mx-auto min-h-dvh bg-fondo flex flex-col">
      <div className="franja h-3" />
      <div className="oro-linea" />
      <div className="px-6 pt-8 flex-1 flex flex-col entrada">
        <div className="flex flex-col items-center text-center">
          <img src="/img/frasco.png" alt="Barberina Max" className="w-40 h-40 object-contain drop-shadow-xl" />
          <h1 className="font-sora font-extrabold text-[27px] leading-tight mt-3 text-verde">
            Barberina <span className="text-rojo">·</span> <span className="text-tinta">Mi acompañamiento</span>
          </h1>
          <p className="text-[14.5px] text-sub font-medium mt-2 leading-relaxed max-w-[310px]">
            Cada mañana, 20 segundos. El Dr. Castellanos y tu grupo te acompañan.
          </p>
        </div>

        <form onSubmit={entrar} className="card p-5 mt-7 space-y-4">
          <label className="block">
            <span className="text-[13px] font-bold text-tinta">Teléfono</span>
            <div className="flex mt-1.5">
              <span className="flex items-center px-3.5 rounded-l-[14px] border-[1.5px] border-r-0 border-linea bg-[#F4F1EA] text-[16px] font-bold text-sub">🇪🇸 +34</span>
              <input inputMode="numeric" autoComplete="tel-national" placeholder="612 345 678"
                value={fmt(tel)} onChange={(e) => setTel(e.target.value.replace(/\D/g, "").slice(0, 9))}
                className="flex-1 min-w-0 px-4 py-3.5 text-[17px] font-semibold rounded-l-none" />
            </div>
          </label>
          <label className="block">
            <span className="text-[13px] font-bold text-tinta">PIN de 4 números</span>
            <input type="password" inputMode="numeric" maxLength={4} placeholder="••••"
              value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="w-full mt-1.5 px-4 py-3.5 text-[22px] tracking-[10px] font-bold text-center" />
            <span className="block text-[11.5px] text-sub2 font-medium mt-1.5">¿Primera vez? Elige ahora tu PIN y recuérdalo.</span>
          </label>
          {err && <div className="text-[13px] font-semibold text-rojo bg-[#FDECEE] rounded-xl px-3 py-2.5">{err}</div>}
          <button disabled={cargando || tel.length < 9 || pin.length < 4} className="btn-oro w-full py-4 text-[16px]">
            {cargando ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="text-[11.5px] text-sub2 font-medium text-center mt-6 mb-6 leading-relaxed">
          Usa el mismo teléfono de tu pedido.<br />Tus datos solo se usan para tu acompañamiento.
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Entrar /></Suspense>;
}
