"use client";
// RECETAS FIT + PLAN SEMANAL + GUÍA DE LA CÁPSULA
// Durante a espera: TUDO visível porém borrado, com cadeado.
import { useState } from "react";
import { useSesion } from "../../lib/useSesion";
import { PageShell, Logo, Splash, Card, Eyebrow, Bloqueo, Modal, HeroFoto, Titulo, Candado } from "../../components/ui";
import { FranjaEspera } from "../../components/Frasco";
import { frascoRecibido } from "../../lib/store";
import { RECETAS, PLAN_SEMANAL, GUIA_CAPSULA } from "../../lib/contenido";
import { BLOQ_ESPERA } from "../../lib/config";
import { diaSemana, hoyMadrid } from "../../lib/fechas";

const FONDOS = ["#EEF7F0", "#FFF6E2", "#FCEDEE", "#EEF2FB"];

function Foto({ r, className = "" }) {
  if (r.img) return <img src={r.img} alt={r.nombre} className={`w-full h-full object-cover ${className}`} />;
  const i = r.id.length % FONDOS.length;
  return <div className={`w-full h-full flex items-center justify-center text-[54px] ${className}`} style={{ background: FONDOS[i] }}>{r.emoji}</div>;
}

export default function Plan() {
  const [s] = useSesion();
  const [receta, setReceta] = useState(null);
  const [filtro, setFiltro] = useState("Todas");
  if (!s) return <Splash />;
  const recibido = frascoRecibido(s);
  const tipos = ["Todas", ...Array.from(new Set(RECETAS.map((r) => r.tipo)))];
  const lista = RECETAS.filter((r) => filtro === "Todas" || r.tipo === filtro);
  const hoyIdx = (diaSemana(hoyMadrid()) + 6) % 7;
  const destacada = RECETAS.find((r) => r.img);

  const contenido = (
    <>
      {/* destaque */}
      <button onClick={() => recibido && setReceta(destacada)} className="block w-full text-left relative h-[210px] rounded-[26px] overflow-hidden mt-4" style={{ boxShadow: "0 18px 34px -18px rgba(19,35,27,.6)" }}>
        <Foto r={destacada} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(14,59,43,.92))" }} />
        <div className="absolute left-5 right-5 bottom-4 text-white">
          <div className="eyebrow !text-oro">Receta del día</div>
          <div className="font-sora font-extrabold text-[20px] leading-tight mt-1">{destacada.nombre}</div>
          <div className="text-[12px] text-white/80 font-semibold mt-1">{destacada.kcal} kcal · {destacada.min} min · {destacada.tipo}</div>
        </div>
      </button>

      <Titulo>Plan de la semana</Titulo>
      <PlanSemana hoyIdx={hoyIdx} />

      <Titulo>Todas las recetas</Titulo>
      <div className="flex gap-2 overflow-x-auto sin-scroll -mx-5 px-5 pb-1">
        {tipos.map((t) => (
          <button key={t} onClick={() => setFiltro(t)}
            className={`px-4 py-2 rounded-full text-[12.5px] font-bold whitespace-nowrap ${filtro === t ? "bg-bosque text-white" : "bg-white text-sub shadow-sm"}`}>{t}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        {lista.map((r) => (
          <button key={r.id} onClick={() => recibido && setReceta(r)} className="card overflow-hidden text-left">
            <div className="h-[118px]"><Foto r={r} /></div>
            <div className="p-3">
              <div className="text-[10px] font-black text-oro2 uppercase tracking-wide">{r.tipo}</div>
              <div className="text-[13px] font-bold leading-snug mt-0.5 line-clamp-2">{r.nombre}</div>
              <div className="text-[11px] text-sub2 font-semibold mt-1">🔥 {r.kcal} kcal · ⏱ {r.min} min</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );

  return (
    <PageShell bloqueadas={recibido ? [] : BLOQ_ESPERA} sinPadding>
      <HeroFoto src="/img/r-garbanzos.jpg" alto={220}>
        <Logo claro peq />
        <div>
          <div className="eyebrow !text-oro">Cocina ligera española</div>
          <h1 className="font-sora font-extrabold text-[28px] text-white leading-tight mt-1">Recetas fit</h1>
          <div className="text-[12.5px] text-white/80 font-semibold mt-1">{RECETAS.length} recetas · plan de 7 días · todo con Barberina Max</div>
        </div>
      </HeroFoto>
      <div className="px-5">
        {!recibido && <div className="mt-4"><FranjaEspera /></div>}

        {recibido ? contenido : (
          <div className="relative">
            <div className="borrado">{contenido}</div>
            <div className="absolute inset-x-0 top-24 flex justify-center">
              <div className="vidrio-claro rounded-[22px] px-5 py-4 flex items-center gap-3 max-w-[300px]" style={{ boxShadow: "0 14px 30px -16px rgba(19,35,27,.45)" }}>
                <div className="w-10 h-10 rounded-full flex-none flex items-center justify-center" style={{ background: "linear-gradient(135deg,#145238,#0E3B2B)" }}><Candado size={17} /></div>
                <div>
                  <div className="font-sora font-bold text-[13.5px] leading-tight">{RECETAS.length} recetas y tu plan semanal</div>
                  <div className="text-[11.5px] text-sub font-medium mt-0.5">Se abren al recibir tu pedido</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Titulo>Cómo tomar Barberina Max</Titulo>
        <Card className="p-5 flex gap-4">
          <img src="/img/frasco.png" alt="" className="w-16 h-20 object-contain flex-none" />
          <ul className="space-y-1.5">
            {GUIA_CAPSULA.map((g, i) => <li key={i} className="text-[12.5px] text-sub font-medium leading-snug">💊 {g}</li>)}
          </ul>
        </Card>
      </div>

      <Modal abierto={!!receta} onCerrar={() => setReceta(null)}>
        {receta && (
          <div className="max-h-[85vh] overflow-y-auto">
            <div className="h-[220px] relative"><Foto r={receta} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(0,0,0,.45))" }} />
            </div>
            <div className="p-6">
              <div className="text-[11px] font-black text-oro2 uppercase tracking-wide">{receta.tipo} · {receta.kcal} kcal · {receta.min} min</div>
              <h2 className="font-sora font-extrabold text-[21px] mt-1 leading-tight">{receta.nombre}</h2>
              <div className="eyebrow mt-5">Ingredientes</div>
              <ul className="mt-2 space-y-1.5">{receta.ingredientes.map((x) => <li key={x} className="text-[13.5px] font-medium flex gap-2"><span className="text-verde">●</span>{x}</li>)}</ul>
              <div className="eyebrow mt-5">Preparación</div>
              <ol className="mt-2 space-y-2.5">{receta.pasos.map((x, i) => (
                <li key={i} className="text-[13.5px] font-medium flex gap-3"><span className="w-6 h-6 rounded-full bg-[#FFF6E2] text-oro2 font-black text-[12px] flex items-center justify-center flex-none">{i + 1}</span>{x}</li>
              ))}</ol>
              <button onClick={() => setReceta(null)} className="btn-verde w-full py-4 mt-6">Cerrar</button>
            </div>
          </div>
        )}
      </Modal>
    </PageShell>
  );
}

function PlanSemana({ hoyIdx }) {
  const [d, setD] = useState(hoyIdx);
  const p = PLAN_SEMANAL[d];
  return (
    <Card className="p-4">
      <div className="grid grid-cols-7 gap-1">
        {PLAN_SEMANAL.map((x, i) => (
          <button key={x.dia} onClick={() => setD(i)}
            className={`py-2.5 rounded-2xl text-[11.5px] font-bold ${i === d ? "bg-bosque text-white" : i === hoyIdx ? "bg-[#FFF6E2] text-oro2" : "bg-crema text-sub"}`}>{x.dia.slice(0, 2)}</button>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {[["☀️", "Desayuno", p.desayuno], ["🍽️", "Comida", p.comida], ["🌙", "Cena", p.cena]].map(([e, t, v]) => (
          <div key={t} className="flex items-center gap-3 rounded-2xl bg-crema px-3 py-3">
            <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[17px]">{e}</span>
            <div className="flex-1">
              <div className="text-[10.5px] font-black text-sub2 uppercase tracking-wide">{t}</div>
              <div className="text-[13px] font-bold">{v}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
