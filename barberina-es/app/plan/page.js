"use client";
// RECETAS FIT + PLAN SEMANAL + GUÍA DE LA CÁPSULA
// Espera: 2 recetas de muestra liberadas, o resto com cadeado.
import { useState } from "react";
import { useSesion } from "../../lib/useSesion";
import { PageShell, Logo, Splash, Card, Eyebrow, Bloqueo, Modal } from "../../components/ui";
import { ModalActivar, AvisoEspera } from "../../components/Frasco";
import { frascoRecibido } from "../../lib/store";
import { RECETAS, PLAN_SEMANAL, GUIA_CAPSULA } from "../../lib/contenido";
import { BLOQ_ESPERA } from "../../lib/config";
import { diaSemana, hoyMadrid } from "../../lib/fechas";

export default function Plan() {
  const [s] = useSesion();
  const [receta, setReceta] = useState(null);
  const [activar, setActivar] = useState(false);
  const [filtro, setFiltro] = useState("Todas");
  if (!s) return <Splash />;
  const recibido = frascoRecibido(s);
  const tipos = ["Todas", ...Array.from(new Set(RECETAS.map((r) => r.tipo)))];
  const lista = RECETAS.filter((r) => filtro === "Todas" || r.tipo === filtro);
  const hoyIdx = (diaSemana(hoyMadrid()) + 6) % 7;

  return (
    <PageShell bloqueadas={recibido ? [] : BLOQ_ESPERA}>
      <Logo peq />
      <h1 className="font-sora font-extrabold text-[24px] mt-5">Recetas fit</h1>
      <p className="text-[13px] text-sub font-semibold mt-1">Cocina española ligera para acompañar a Barberina Max.</p>

      {!recibido && <div className="mt-4"><AvisoEspera onActivar={() => setActivar(true)} /></div>}

      {/* PLAN DE HOY */}
      <div className="mt-4">
        {recibido ? <PlanSemana hoyIdx={hoyIdx} /> : (
          <Bloqueo onClick={() => setActivar(true)} titulo="Plan semanal de comidas" texto="Desayuno, comida y cena para cada día">
            <PlanSemana hoyIdx={hoyIdx} />
          </Bloqueo>
        )}
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 overflow-x-auto mt-5 pb-1 -mx-5 px-5">
        {tipos.map((t) => (
          <button key={t} onClick={() => setFiltro(t)}
            className={`px-3.5 py-2 rounded-full text-[12.5px] font-bold whitespace-nowrap border ${filtro === t ? "bg-tinta text-white border-tinta" : "bg-white border-linea text-sub"}`}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        {lista.map((r) => {
          const lock = !recibido && !r.libre;
          return (
            <button key={r.id} onClick={() => (lock ? setActivar(true) : setReceta(r))} className="card p-3.5 text-left relative">
              <div className={`h-20 rounded-2xl flex items-center justify-center text-[40px] ${lock ? "bg-[#F1EDE4] blur-[1.5px]" : "bg-[#F2FBF5]"}`}>{r.emoji}</div>
              <div className="text-[10.5px] font-black text-oro2 uppercase tracking-wide mt-2.5">{r.tipo}</div>
              <div className={`text-[13px] font-bold leading-snug mt-0.5 ${lock ? "text-sub2" : ""}`}>{r.nombre}</div>
              <div className="text-[11px] text-sub2 font-semibold mt-1">{r.kcal} kcal · {r.min} min</div>
              {lock && <span className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white border border-linea flex items-center justify-center text-[12px]">🔒</span>}
              {!recibido && r.libre && <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-verde text-white text-[9.5px] font-black">GRATIS</span>}
            </button>
          );
        })}
      </div>

      {/* GUÍA */}
      <Card className="mt-5 p-5">
        <Eyebrow>Cómo tomar Barberina Max</Eyebrow>
        <ul className="mt-2.5 space-y-1.5">
          {GUIA_CAPSULA.map((g, i) => <li key={i} className="text-[13px] text-sub font-medium leading-snug">💊 {g}</li>)}
        </ul>
      </Card>

      <Modal abierto={!!receta} onCerrar={() => setReceta(null)}>
        {receta && (
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="text-[48px] text-center">{receta.emoji}</div>
            <div className="text-[11px] font-black text-oro2 uppercase tracking-wide text-center mt-1">{receta.tipo} · {receta.kcal} kcal · {receta.min} min</div>
            <h2 className="font-sora font-extrabold text-[20px] text-center mt-1 leading-tight">{receta.nombre}</h2>
            <div className="eyebrow mt-5">Ingredientes</div>
            <ul className="mt-2 space-y-1">{receta.ingredientes.map((x) => <li key={x} className="text-[13.5px] font-medium">• {x}</li>)}</ul>
            <div className="eyebrow mt-5">Preparación</div>
            <ol className="mt-2 space-y-2">{receta.pasos.map((x, i) => <li key={i} className="text-[13.5px] font-medium flex gap-2"><b className="text-oro2">{i + 1}.</b>{x}</li>)}</ol>
            <button onClick={() => setReceta(null)} className="btn-oro w-full py-3.5 mt-6">Cerrar</button>
          </div>
        )}
      </Modal>
      <ModalActivar abierto={activar} onCerrar={() => setActivar(false)} nombre={s.perfil.nombre} />
    </PageShell>
  );
}

function PlanSemana({ hoyIdx }) {
  const [d, setD] = useState(hoyIdx);
  const p = PLAN_SEMANAL[d];
  return (
    <Card className="p-5">
      <Eyebrow>Plan de la semana</Eyebrow>
      <div className="grid grid-cols-7 gap-1 mt-3">
        {PLAN_SEMANAL.map((x, i) => (
          <button key={x.dia} onClick={() => setD(i)}
            className={`py-2 rounded-xl text-[11.5px] font-bold ${i === d ? "bg-oro2 text-white" : i === hoyIdx ? "bg-[#FFF7E6] text-oro2" : "bg-[#F7F5EF] text-sub"}`}>{x.dia.slice(0, 2)}</button>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {[["☀️ Desayuno", p.desayuno], ["🍽️ Comida", p.comida], ["🌙 Cena", p.cena]].map(([t, v]) => (
          <div key={t} className="flex items-center justify-between rounded-xl bg-[#F7F5EF] px-3 py-2.5">
            <span className="text-[12px] font-bold text-sub">{t}</span>
            <span className="text-[13px] font-bold text-right">{v}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
