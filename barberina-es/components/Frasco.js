"use client";
// Componentes da fase de ESPERA do frasco + ativação ao receber
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, vibrar } from "./ui";
import { confirmarFrasco, diaGrupo } from "../lib/store";
import { linkCamila, CONFIG } from "../lib/config";

// Estado aproximado do envio pelos dias desde o pedido (a cliente não vê datas exatas)
export function pasoEnvio(s) {
  const d = diaGrupo(s);
  if (d <= 1) return 1; // confirmado → preparando
  if (d === 2) return 2; // en camino
  return 3; // en reparto / llega en breve
}

const PASOS = [
  { t: "Pedido confirmado", st: "Pagas al recibirlo" },
  { t: "Preparando tu frasco", st: "En nuestro almacén" },
  { t: "En camino", st: "Con la empresa de transporte" },
  { t: "En reparto", st: "Muy pronto en tu casa" },
  { t: "Recibido", st: "Se desbloquea todo" },
];

export function SeguimientoEnvio({ s }) {
  const paso = pasoEnvio(s);
  return (
    <div className="mt-4 space-y-0">
      {PASOS.map((p, i) => {
        const hecho = i < paso, actual = i === paso;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-black flex-none
                ${hecho ? "bg-verde text-white" : actual ? "bg-oro text-white latido" : "bg-[#F1EDE4] text-sub2"}`}>
                {hecho ? "✓" : i + 1}
              </div>
              {i < PASOS.length - 1 && <div className={`w-[2px] h-6 ${hecho ? "bg-verde" : "bg-[#ECE8DF]"}`} />}
            </div>
            <div className="pb-2 -mt-[1px]">
              <div className={`text-[13.5px] font-bold ${actual ? "text-oro2" : hecho ? "text-tinta" : "text-sub2"}`}>
                {p.t} {actual && i === 2 && <span className="camion">🚚</span>}
              </div>
              <div className="text-[11.5px] text-sub2 font-medium">{p.st}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ModalActivar({ abierto, onCerrar, nombre }) {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [err, setErr] = useState(false);
  async function activar(e) {
    e.preventDefault();
    const r = await confirmarFrasco(codigo);
    if (!r.ok) { setErr(true); vibrar([30, 40, 30]); return; }
    vibrar([28, 60, 28, 60, 48]);
    router.push("/recibido");
  }
  return (
    <Modal abierto={abierto} onCerrar={onCerrar}>
      <div className="text-center">
        <img src="/img/frasco.png" alt="" className="w-24 h-24 object-contain mx-auto" />
        <h2 className="font-sora font-extrabold text-[21px] mt-2">¿Ya tienes tu Barberina Max?</h2>
        <p className="text-[13.5px] text-sub font-medium mt-1.5 leading-relaxed">
          Escribe el <b className="text-tinta">código de activación</b> que viene en el folleto dentro de la caja.
        </p>
      </div>
      <form onSubmit={activar} className="mt-5">
        <input autoFocus value={codigo} onChange={(e) => { setCodigo(e.target.value.toUpperCase()); setErr(false); }}
          placeholder="CÓDIGO" autoCapitalize="characters"
          className="w-full px-4 py-4 text-[22px] tracking-[6px] font-black text-center uppercase" />
        {err && <div className="text-[13px] font-semibold text-rojo mt-2 text-center">Ese código no es correcto. Míralo en el folleto de la caja.</div>}
        <button disabled={codigo.trim().length < 3} className="btn-verde w-full py-4 text-[16px] mt-4">Desbloquear mi app</button>
      </form>
      <a href={linkCamila(nombre, "Ya he recibido mi frasco pero no encuentro el código.")} target="_blank" rel="noreferrer"
        className="block text-center text-[13px] font-bold text-sub mt-4 underline">No encuentro el código → Camila</a>
    </Modal>
  );
}

// Faixa curta mostrada no topo das abas bloqueadas
export function AvisoEspera({ onActivar }) {
  return (
    <div className="card p-4 flex items-center gap-3 brillo" style={{ borderColor: "#FDE68A" }}>
      <div className="text-[26px] flex-none camion">📦</div>
      <div className="flex-1">
        <div className="text-[13.5px] font-extrabold">Tu frasco está en camino</div>
        <div className="text-[12px] text-sub font-medium leading-snug">Al recibirlo se desbloquea esta sección. Entrega en {CONFIG.entregaDias}.</div>
      </div>
      <button onClick={onActivar} className="btn-verde px-3 py-2 text-[12px] flex-none">Ya lo tengo</button>
    </div>
  );
}
