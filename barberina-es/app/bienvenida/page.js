"use client";
// Primeiro acesso: "¿Cómo quieres aparecer en el grupo?"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { guardarPerfil } from "../../lib/store";
import { useSesion } from "../../lib/useSesion";
import { Splash, vibrar } from "../../components/ui";

const AVATARES = ["🌸", "🌷", "🌻", "🌹", "🌼", "🦋", "🌿", "🍀", "💜", "✨", "🌙", "☀️"];

export default function Bienvenida() {
  const router = useRouter();
  const [s] = useSesion({ exigePerfil: false });
  const [f, setF] = useState({ nombre: "", ciudad: "", peso: "", objetivo: "", avatar: "🌸", publico: true });
  const [err, setErr] = useState("");

  if (!s) return <Splash />;
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? null : n; };

  function guardar(e) {
    e.preventDefault();
    const peso = num(f.peso), obj = num(f.objetivo);
    if (f.nombre.trim().length < 2) return setErr("Escribe tu nombre (ej. María J.).");
    if (!peso || peso < 40 || peso > 200) return setErr("Escribe tu peso actual en kg (ej. 78,5).");
    if (obj && (obj < 1 || obj > 50)) return setErr("Tu objetivo son los kilos que quieres perder (ej. 8).");
    vibrar(15);
    guardarPerfil({
      nombre: f.nombre.trim().slice(0, 18), ciudad: f.ciudad.trim().slice(0, 24),
      pesoInicial: peso, objetivo: obj || 6, avatar: f.avatar, publico: f.publico,
    });
    router.replace("/");
  }

  return (
    <div className="max-w-md mx-auto min-h-dvh bg-fondo px-6 pt-8 pb-10 entrada">
      <div className="eyebrow">Paso 1 de 1</div>
      <h1 className="font-sora font-extrabold text-[25px] leading-tight mt-1">¿Cómo quieres aparecer en el grupo?</h1>
      <p className="text-[14px] text-sub font-medium mt-2 leading-relaxed">
        Solo tu nombre corto y tu ciudad. Nunca mostramos tu teléfono ni tu apellido.
      </p>

      <form onSubmit={guardar} className="mt-6 space-y-4">
        <div className="card p-5 space-y-4">
          <label className="block">
            <span className="text-[13px] font-bold">Nombre</span>
            <input value={f.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="María J."
              className="w-full mt-1.5 px-4 py-3 text-[16px] font-semibold" />
          </label>
          <label className="block">
            <span className="text-[13px] font-bold">Ciudad</span>
            <input value={f.ciudad} onChange={(e) => set("ciudad", e.target.value)} placeholder="Madrid"
              className="w-full mt-1.5 px-4 py-3 text-[16px] font-semibold" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[13px] font-bold">Peso actual</span>
              <div className="relative mt-1.5">
                <input inputMode="decimal" value={f.peso} onChange={(e) => set("peso", e.target.value)} placeholder="78,5"
                  className="w-full pl-4 pr-10 py-3 text-[16px] font-semibold" />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sub2 font-bold text-[13px]">kg</span>
              </div>
            </label>
            <label className="block">
              <span className="text-[13px] font-bold">Quiero perder</span>
              <div className="relative mt-1.5">
                <input inputMode="decimal" value={f.objetivo} onChange={(e) => set("objetivo", e.target.value)} placeholder="8"
                  className="w-full pl-4 pr-10 py-3 text-[16px] font-semibold" />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sub2 font-bold text-[13px]">kg</span>
              </div>
            </label>
          </div>
        </div>

        <div className="card p-5">
          <span className="text-[13px] font-bold">Tu avatar</span>
          <div className="grid grid-cols-6 gap-2 mt-2.5">
            {AVATARES.map((a) => (
              <button type="button" key={a} onClick={() => set("avatar", a)}
                className={`opcion h-12 text-[22px] ${f.avatar === a ? "on" : ""}`}>{a}</button>
            ))}
          </div>
          <label className="flex items-center justify-between mt-5">
            <div>
              <div className="text-[14px] font-bold">Aparecer en el ranking</div>
              <div className="text-[12px] text-sub font-medium">Puedes cambiarlo cuando quieras</div>
            </div>
            <button type="button" onClick={() => set("publico", !f.publico)}
              className={`w-12 h-7 rounded-full relative transition-colors ${f.publico ? "bg-verde" : "bg-[#D9D4C8]"}`}>
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${f.publico ? "left-6" : "left-1"}`} />
            </button>
          </label>
        </div>

        {err && <div className="text-[13px] font-semibold text-rojo bg-[#FDECEE] rounded-xl px-3 py-2.5">{err}</div>}
        <button className="btn-oro w-full py-4 text-[16px]">Entrar en mi grupo</button>
      </form>
    </div>
  );
}
