"use client";
// Card "Registro de hoy" — a tela de 20 segundos
import { useState } from "react";
import { registrar, pesoActual, racha, marcarVisto } from "../lib/store";
import { hoyMadrid, kg } from "../lib/fechas";
import { vibrar, Confeti } from "./ui";

const CARITAS = [
  { v: 1, e: "😫", t: "Fatal" },
  { v: 2, e: "😕", t: "Mal" },
  { v: 3, e: "😐", t: "Regular" },
  { v: 4, e: "🙂", t: "Bien" },
  { v: 5, e: "😴", t: "Perfecto" },
];

export function Caritas({ valor, onChange, peq }) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {CARITAS.map((c) => (
        <button type="button" key={c.v} onClick={() => { vibrar(8); onChange(c.v); }}
          className={`opcion flex flex-col items-center ${peq ? "py-1.5" : "py-2.5"} ${valor === c.v ? "on" : ""}`}>
          <span className={peq ? "text-[20px]" : "text-[26px]"}>{c.e}</span>
          <span className="text-[10px] font-bold text-sub mt-0.5">{c.t}</span>
        </button>
      ))}
    </div>
  );
}
export const caritaDe = (v) => CARITAS.find((c) => c.v === v)?.e || "·";

function Escala({ label, valor, onChange, ext = ["Poca", "Mucha"] }) {
  return (
    <div>
      <div className="flex justify-between text-[12px] font-bold"><span>{label}</span><span className="text-sub2 font-semibold">{ext[0]} → {ext[1]}</span></div>
      <div className="grid grid-cols-5 gap-1.5 mt-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => onChange(n)} className={`opcion py-2 text-[13px] font-bold ${valor === n ? "on" : ""}`}>{n}</button>
        ))}
      </div>
    </div>
  );
}

// Dia em que o frasco chega: só o peso de partida (ainda não tomou a cápsula)
export function RegistroInicio({ s, onGuardado }) {
  const hoy = hoyMadrid();
  const [peso, setPeso] = useState(s.registros[hoy]?.peso ? kg(s.registros[hoy].peso) : "");
  const [ok, setOk] = useState(!!s.vistos?.pesoInicio);
  const [msg, setMsg] = useState("");
  function guardar() {
    const p = parseFloat(String(peso).replace(",", "."));
    if (isNaN(p) || p < 35 || p > 220) { setMsg("Escribe tu peso (ej. 81,9)."); return; }
    registrar(hoy, { peso: Math.round(p * 10) / 10 });
    const st = marcarVisto("pesoInicio");
    vibrar(20); setOk(true); onGuardado?.(st);
  }
  if (ok) {
    return (
      <div className="card p-5" style={{ borderColor: "#BFE3CB", background: "linear-gradient(160deg,#F2FBF5,#fff)" }}>
        <div className="eyebrow text-verde">Peso de partida ✓</div>
        <div className="font-sora font-extrabold text-[20px] mt-1.5">{kg(s.registros[hoy]?.peso || pesoActual(s))} kg</div>
        <p className="text-[12.5px] text-sub font-medium mt-2">Mañana empieza tu registro diario: cómo has dormido, tu peso y la cápsula. Ahí empiezas a sumar puntos.</p>
      </div>
    );
  }
  return (
    <div className="card p-5">
      <div className="eyebrow">Hoy · tu peso de partida</div>
      <p className="text-[13px] text-sub font-medium mt-2 leading-snug">Pésate ahora para ver mañana cuánto has bajado con tu primera cápsula.</p>
      <div className="relative mt-3">
        <input inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder={pesoActual(s) ? kg(pesoActual(s)) : "80,0"}
          className="w-full pl-4 pr-10 py-3.5 text-[18px] font-bold" />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sub2 font-bold text-[13px]">kg</span>
      </div>
      {msg && <div className="text-[13px] font-semibold text-rojo mt-2">{msg}</div>}
      <button onClick={guardar} className="btn-oro w-full py-4 text-[16px] mt-4">Guardar peso de partida</button>
    </div>
  );
}

export default function Registro({ s, onGuardado }) {
  const hoy = hoyMadrid();
  const previo = s.registros[hoy];
  const yaHecho = !!previo?.sueno;
  const [editando, setEditando] = useState(!yaHecho);
  const ultimo = pesoActual(s);
  const [f, setF] = useState({
    sueno: previo?.sueno || null,
    peso: previo?.peso ? kg(previo.peso) : "",
    tomo: previo?.tomo ?? null,
    despertares: previo?.despertares ?? null,
    energia: previo?.energia ?? null,
    antojos: previo?.antojos ?? null,
    nota: previo?.nota || "",
  });
  const [mas, setMas] = useState(false);
  const [fiesta, setFiesta] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  function guardar() {
    const p = parseFloat(String(f.peso).replace(",", "."));
    if (!f.sueno) { setMsg("Dinos cómo has dormido 🙂"); return; }
    if (f.peso && (isNaN(p) || p < 35 || p > 220)) { setMsg("Revisa el peso (ej. 77,6)."); return; }
    const st = registrar(hoy, {
      sueno: f.sueno, peso: f.peso ? Math.round(p * 10) / 10 : null, tomo: f.tomo,
      despertares: f.despertares, energia: f.energia, antojos: f.antojos, nota: f.nota.trim().slice(0, 140),
    });
    vibrar([28, 60, 28]);
    setFiesta(true);
    setTimeout(() => setFiesta(false), 2400);
    setEditando(false);
    setMsg("");
    onGuardado?.(st);
  }

  if (!editando) {
    const r = s.registros[hoy];
    const n = racha(s);
    return (
      <div className="card p-5" style={{ borderColor: "#BFE3CB", background: "linear-gradient(160deg,#F2FBF5,#fff)" }}>
        <Confeti activo={fiesta} />
        <div className="flex items-center justify-between">
          <div className="eyebrow text-verde">Registro de hoy ✓</div>
          <button onClick={() => setEditando(true)} className="text-[12.5px] font-bold text-oro2">Editar</button>
        </div>
        <div className="font-sora font-extrabold text-[20px] mt-1.5">¡Día {n} seguido! 🔥</div>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-white border border-linea text-[13px] font-bold">{caritaDe(r.sueno)} Sueño {r.sueno}/5</span>
          {r.peso && <span className="px-3 py-1.5 rounded-full bg-white border border-linea text-[13px] font-bold">⚖️ {kg(r.peso)} kg</span>}
          {r.tomo != null && <span className="px-3 py-1.5 rounded-full bg-white border border-linea text-[13px] font-bold">{r.tomo ? "💊 Cápsula ✓" : "💊 Sin cápsula"}</span>}
        </div>
        <p className="text-[12.5px] text-sub font-medium mt-3">Mañana, lo mismo: 20 segundos. Así se sube en el ranking.</p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <Confeti activo={fiesta} />
      <div className="eyebrow">Registro de hoy</div>
      <div className="text-[15px] font-bold mt-3">¿Cómo has dormido?</div>
      <div className="mt-2"><Caritas valor={f.sueno} onChange={(v) => set("sueno", v)} /></div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <label className="block">
          <span className="text-[13px] font-bold">Peso</span>
          <div className="relative mt-1.5">
            <input inputMode="decimal" value={f.peso} onChange={(e) => set("peso", e.target.value)}
              placeholder={ultimo ? kg(ultimo) : "77,6"} className="w-full pl-4 pr-10 py-3 text-[17px] font-bold" />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sub2 font-bold text-[13px]">kg</span>
          </div>
          {ultimo && <span className="text-[11px] text-sub2 font-semibold">Último: {kg(ultimo)} kg</span>}
        </label>
        <div>
          <span className="text-[13px] font-bold">¿Cápsula anoche?</span>
          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            <button type="button" onClick={() => set("tomo", true)} className={`opcion py-3 text-[14px] font-bold ${f.tomo === true ? "on" : ""}`}>Sí</button>
            <button type="button" onClick={() => set("tomo", false)} className={`opcion py-3 text-[14px] font-bold ${f.tomo === false ? "on" : ""}`}>No</button>
          </div>
        </div>
      </div>

      <button type="button" onClick={() => setMas(!mas)} className="text-[12.5px] font-bold text-sub mt-4">
        {mas ? "▾ Menos detalles" : "▸ Más detalles (opcional)"}
      </button>
      {mas && (
        <div className="space-y-3.5 mt-3">
          <div>
            <div className="text-[12px] font-bold">Despertares por la noche</div>
            <div className="grid grid-cols-4 gap-1.5 mt-1.5">
              {[0, 1, 2, 3].map((n) => (
                <button type="button" key={n} onClick={() => set("despertares", n)} className={`opcion py-2 text-[13px] font-bold ${f.despertares === n ? "on" : ""}`}>{n === 3 ? "3+" : n}</button>
              ))}
            </div>
          </div>
          <Escala label="Energía" valor={f.energia} onChange={(v) => set("energia", v)} />
          <Escala label="Antojos de dulce" valor={f.antojos} onChange={(v) => set("antojos", v)} />
          <textarea value={f.nota} onChange={(e) => set("nota", e.target.value)} rows={2} placeholder="Una nota corta (opcional)"
            className="w-full px-4 py-3 text-[14px] font-medium" />
        </div>
      )}
      {msg && <div className="text-[13px] font-semibold text-rojo mt-3">{msg}</div>}
      <button onClick={guardar} className="btn-oro w-full py-4 text-[16px] mt-4">Guardar</button>
    </div>
  );
}
