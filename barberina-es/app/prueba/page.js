"use client";
// Página de TESTE (só para o Joaquim): simula o dia do grupo, o frasco e registros.
// Acesse /prueba. Não aparece em nenhum menu.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { load, save, logout } from "../../lib/store";
import { hoyMadrid, sumarDias } from "../../lib/fechas";

export default function Prueba() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  function aplicar(fn, txt) { const s = load(); fn(s); save(s); setMsg(txt); }

  function diaGrupo(d) {
    aplicar((s) => {
      if (!s.tel) { s.tel = "600000000"; s.pin = "1234"; }
      const ini = sumarDias(hoyMadrid(), -(d - 1));
      s.perfil = { nombre: "María J.", ciudad: "Madrid", pesoInicial: 82, objetivo: 8, avatar: "🌸", publico: true, ...s.perfil, creadoEn: ini };
      s.registros = { [ini]: { peso: s.perfil.pesoInicial } };
      s.frasco = { estado: "esperando", recibidoEn: null };
      s.vistos = {};
    }, `Ahora estás en el día ${d} del grupo (esperando frasco).`);
  }
  function recibir(haceDias) {
    aplicar((s) => {
      if (!s.perfil) return;
      const hoy = hoyMadrid();
      const rec = sumarDias(hoy, -haceDias);
      s.frasco = { estado: "recibido", recibidoEn: rec };
      s.vistos = { ...s.vistos, recibido: haceDias > 0 };
      const ini = s.perfil.pesoInicial;
      const curva = [0, 1.0, 1.4, 1.8, 2.1, 2.5, 2.8, 3.0, 3.3, 3.5, 3.8];
      for (let k = 1; k < haceDias; k++) { // hoje fica para a usuária registrar
        const f = sumarDias(rec, k);
        s.registros[f] = { peso: Math.round((ini - (curva[k] ?? 3.8 + (k - 10) * 0.12)) * 10) / 10, sueno: Math.min(5, 3 + Math.floor(k / 3)), tomo: true };
      }
    }, haceDias === 0 ? "Frasco recibido HOY." : `Frasco recibido hace ${haceDias} días, con registros hasta ayer.`);
  }

  const B = ({ onClick, children }) => <button onClick={onClick} className="btn-linea w-full py-3 text-[14px]">{children}</button>;
  return (
    <div className="max-w-md mx-auto min-h-dvh bg-fondo p-6 space-y-3">
      <h1 className="font-sora font-extrabold text-[22px]">🧪 Modo prueba</h1>
      <p className="text-[13px] text-sub">Simula la historia del grupo. Todo es local (este móvil).</p>
      <div className="eyebrow pt-2">Esperando el frasco</div>
      {[1, 2, 3, 4, 5, 7].map((d) => <B key={d} onClick={() => diaGrupo(d)}>Día {d} del grupo</B>)}
      <div className="eyebrow pt-2">Estado del envío (lo que la equipe marca en app_entregas)</div>
      {[["preparando", "Preparando"], ["enviado", "Enviado / en camino"], ["reparto", "En reparto"]].map(([k, t]) => (
        <B key={k} onClick={() => aplicar((s) => { s.frasco = { estado: "esperando", recibidoEn: null, envio: k }; }, `Envío: ${t}`)}>{t}</B>
      ))}
      <div className="eyebrow pt-2">Entregado (simula la liberación automática)</div>
      <B onClick={() => recibir(0)}>Entregado hoy (abre la celebración)</B>
      <B onClick={() => recibir(1)}>Entregado ayer (hoy toca el 1er registro)</B>
      <B onClick={() => recibir(5)}>Entregado hace 5 días</B>
      <B onClick={() => recibir(10)}>Entregado hace 10 días</B>
      <div className="eyebrow pt-2">Otros</div>
      <B onClick={() => { logout(); setMsg("Borrado."); }}>Borrar todo</B>
      {msg && <div className="text-[13px] font-bold text-verde">{msg}</div>}
      <button onClick={() => router.push("/")} className="btn-oro w-full py-3.5">Ir a la app</button>
    </div>
  );
}
