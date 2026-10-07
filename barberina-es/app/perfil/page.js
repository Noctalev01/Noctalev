"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSesion } from "../../lib/useSesion";
import { PageShell, Logo, Splash, Card, Eyebrow, vibrar, HeroFoto } from "../../components/ui";
import { guardarPerfil, logout, frascoRecibido } from "../../lib/store";
import { CONFIG, linkCamila, BLOQ_ESPERA } from "../../lib/config";
import { fechaLarga } from "../../lib/fechas";

const AVATARES = ["🌸", "🌷", "🌻", "🌹", "🌼", "🦋", "🌿", "🍀", "💜", "✨", "🌙", "☀️"];

export default function Perfil() {
  const router = useRouter();
  const [s, refrescar] = useSesion();
  const [f, setF] = useState(null);
  const [ok, setOk] = useState(false);
  if (!s) return <Splash />;
  const p = f || {
    nombre: s.perfil.nombre, ciudad: s.perfil.ciudad || "", objetivo: s.perfil.objetivo || "",
    altura: s.perfil.altura || "", edad: s.perfil.edad || "", avatar: s.perfil.avatar, publico: s.perfil.publico !== false,
  };
  const set = (k, v) => { setF({ ...p, [k]: v }); setOk(false); };
  const recibido = frascoRecibido(s);

  function guardar() {
    const n = (v) => { const x = parseFloat(String(v).replace(",", ".")); return isNaN(x) ? null : x; };
    guardarPerfil({ ...p, nombre: p.nombre.trim().slice(0, 18) || s.perfil.nombre, objetivo: n(p.objetivo), altura: n(p.altura), edad: n(p.edad) });
    vibrar(15); setOk(true); refrescar();
  }

  return (
    <PageShell bloqueadas={recibido ? [] : BLOQ_ESPERA} sinPadding>
      <HeroFoto src="/img/playa.jpg" alto={230} posicion="center 70%">
        <Logo claro peq />
        <div className="flex items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-full vidrio flex items-center justify-center text-[38px]">{p.avatar}</div>
          <div>
            <h1 className="font-sora font-extrabold text-[24px] leading-tight text-white">{s.perfil.nombre}</h1>
            <div className="text-[13px] text-white/75 font-semibold">{s.perfil.ciudad ? `${s.perfil.ciudad} · ` : ""}+34 {s.tel?.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}</div>
          </div>
        </div>
      </HeroFoto>
      <div className="px-5">

      <div className="card-tinta mt-4 p-4 flex items-center gap-3">
        <img src="/img/frasco.png" alt="" className="w-12 h-14 object-contain" />
        <div className="flex-1">
          <div className="text-[14px] font-extrabold">{recibido ? "Pedido entregado ✓" : "Pedido en camino"}</div>
          <div className="text-[12px] text-white/70 font-medium">{recibido ? `Acompañamiento activo desde el ${fechaLarga(s.frasco.recibidoEn)}` : "Activamos tu acceso completo automáticamente al entregarlo"}</div>
        </div>
      </div>

      <Card className="mt-4 p-5 space-y-3.5">
        <Eyebrow>Mis datos</Eyebrow>
        {[["nombre", "Nombre", "text"], ["ciudad", "Ciudad", "text"], ["objetivo", "Quiero perder (kg)", "decimal"], ["altura", "Altura (cm)", "numeric"], ["edad", "Edad", "numeric"]].map(([k, l, im]) => (
          <label key={k} className="block">
            <span className="text-[12.5px] font-bold">{l}</span>
            <input inputMode={im} value={p[k] ?? ""} onChange={(e) => set(k, e.target.value)} className="w-full mt-1.5 px-4 py-3.5 text-[15px] font-semibold" />
          </label>
        ))}
        <div>
          <span className="text-[12.5px] font-bold">Avatar</span>
          <div className="grid grid-cols-6 gap-2 mt-1.5">
            {AVATARES.map((a) => <button key={a} onClick={() => set("avatar", a)} className={`opcion h-11 text-[20px] ${p.avatar === a ? "on" : ""}`}>{a}</button>)}
          </div>
        </div>
        <label className="flex items-center justify-between pt-1">
          <span className="text-[14px] font-bold">Aparecer en el ranking</span>
          <button type="button" onClick={() => set("publico", !p.publico)} className={`w-12 h-7 rounded-full relative ${p.publico ? "bg-verde" : "bg-[#D9D4C8]"}`}>
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${p.publico ? "left-6" : "left-1"}`} />
          </button>
        </label>
        <button onClick={guardar} className="btn-oro w-full py-3.5 text-[15px]">{ok ? "Guardado ✓" : "Guardar cambios"}</button>
      </Card>

      <a href={linkCamila(s.perfil.nombre)} target="_blank" rel="noreferrer" className="btn-wa block text-center w-full py-3.5 text-[14.5px] mt-4">💬 Hablar con Camila</a>
      <button onClick={() => { logout(); router.replace("/entrar"); }} className="btn-linea w-full py-3.5 text-[14px] mt-3">Cerrar sesión</button>

      <p className="text-[11.5px] text-sub2 font-medium text-center mt-6 leading-relaxed">
        Tus datos solo se usan para tu acompañamiento. Pide borrarlos por WhatsApp.<br />
        <a href={CONFIG.legal} target="_blank" rel="noreferrer" className="underline">Política de privacidad</a>
      </p>
      <p className="text-[10.5px] text-sub2 font-medium text-center mt-3 leading-relaxed opacity-80">
        Barberina Max es un complemento alimenticio. No sustituye una dieta variada y equilibrada ni un estilo de vida saludable. Los resultados pueden variar de una persona a otra.
      </p>
      </div>
    </PageShell>
  );
}
