"use client";
// MI EVOLUCIÓN — gráfico de peso, barras de sono, calendário de constância, histórico
import { useState } from "react";
import { useSesion } from "../../lib/useSesion";
import { PageShell, Logo, Splash, Card, Eyebrow, Bloqueo } from "../../components/ui";
import { ModalActivar, AvisoEspera } from "../../components/Frasco";
import { caritaDe } from "../../components/Registro";
import { frascoRecibido, registrosOrdenados, pesoPerdido, suenoMedio, diasRegistrados, racha } from "../../lib/store";
import { hoyMadrid, sumarDias, fechaDM, kg, fechaCorta } from "../../lib/fechas";
import { linkCamila, BLOQ_ESPERA } from "../../lib/config";

function GraficoPeso({ pts }) {
  const W = 320, H = 150, pad = 20;
  if (pts.length < 2) {
    return <div className="h-[150px] flex items-center justify-center text-[13px] text-sub2 font-semibold text-center">Apunta tu peso 2 mañanas<br />para ver tu gráfica</div>;
  }
  const v = pts.map((p) => p.peso);
  const min = Math.min(...v) - 0.3, max = Math.max(...v) + 0.3, r = max - min || 1;
  const xy = pts.map((p, i) => [pad + (i * (W - pad * 2)) / (pts.length - 1), pad + ((max - p.peso) / r) * (H - pad * 2)]);
  const linea = xy.map((p) => p.join(",")).join(" ");
  const area = `${xy[0][0]},${H} ${linea} ${xy[xy.length - 1][0]},${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[150px]">
      <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2FA35A" stopOpacity=".25" /><stop offset="1" stopColor="#2FA35A" stopOpacity="0" /></linearGradient></defs>
      <polygon points={area} fill="url(#ga)" />
      <polyline points={linea} fill="none" stroke="#1B7F3B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {xy.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === xy.length - 1 ? 5 : 3} fill={i === xy.length - 1 ? "#F59E0B" : "#1B7F3B"} />)}
      <text x={xy[0][0]} y={H - 3} fontSize="10" fill="#8A92A6" fontWeight="700">{fechaDM(pts[0].fecha)}</text>
      <text x={xy[xy.length - 1][0]} y={H - 3} fontSize="10" fill="#8A92A6" fontWeight="700" textAnchor="end">{fechaDM(pts[pts.length - 1].fecha)}</text>
    </svg>
  );
}

function BarrasSueno({ s }) {
  const hoy = hoyMadrid();
  const dias = Array.from({ length: 14 }, (_, i) => sumarDias(hoy, i - 13));
  return (
    <div className="flex items-end gap-1 h-[90px] mt-3">
      {dias.map((d) => {
        const v = s.registros[d]?.sueno || 0;
        return (
          <div key={d} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="w-full rounded-t-md" style={{ height: `${(v / 5) * 100}%`, minHeight: 3, background: v >= 4 ? "#1B7F3B" : v >= 3 ? "#F59E0B" : v ? "#E2A3AC" : "#F1EDE4" }} />
          </div>
        );
      })}
    </div>
  );
}

function Calendario({ s }) {
  const hoy = hoyMadrid();
  const dias = Array.from({ length: 35 }, (_, i) => sumarDias(hoy, i - 34));
  return (
    <div className="grid grid-cols-7 gap-1.5 mt-3">
      {dias.map((d) => {
        const r = s.registros[d];
        const on = !!r?.sueno;
        return <div key={d} title={d} className="aspect-square rounded-md" style={{ background: on ? (r.tomo ? "#1B7F3B" : "#7CC596") : d === hoy ? "#FDE68A" : "#F1EDE4" }} />;
      })}
    </div>
  );
}

export default function Evolucion() {
  const [s] = useSesion();
  const [activar, setActivar] = useState(false);
  if (!s) return <Splash />;
  const recibido = frascoRecibido(s);
  const regs = registrosOrdenados(s);
  const pesos = regs.filter((r) => r.peso);

  const contenido = (
    <>
      <div className="grid grid-cols-3 gap-2.5 mt-4">
        {[[`${pesoPerdido(s) > 0 ? "−" : ""}${kg(pesoPerdido(s))}`, "kg perdidos"], [suenoMedio(s) ? kg(suenoMedio(s)) : "—", "sueño medio"], [String(racha(s)), "días seguidos"]].map(([v, l]) => (
          <Card key={l} className="p-3 text-center">
            <div className="font-sora font-extrabold text-[21px] text-verde">{v}</div>
            <div className="text-[10.5px] font-bold text-sub2 mt-0.5">{l}</div>
          </Card>
        ))}
      </div>
      <Card className="mt-4 p-5"><Eyebrow>Peso</Eyebrow><GraficoPeso pts={recibido ? pesos.slice(-30) : [{ fecha: hoyMadrid(), peso: 80 }, { fecha: hoyMadrid(), peso: 79 }, { fecha: hoyMadrid(), peso: 78.4 }, { fecha: hoyMadrid(), peso: 77.6 }]} /></Card>
      <Card className="mt-4 p-5"><Eyebrow>Sueño · 14 días</Eyebrow><BarrasSueno s={s} /></Card>
      <Card className="mt-4 p-5">
        <div className="flex justify-between"><Eyebrow>Constancia · 5 semanas</Eyebrow><span className="text-[11px] font-bold text-sub2">{diasRegistrados(s)} días</span></div>
        <Calendario s={s} />
        <div className="flex gap-3 mt-3 text-[10.5px] font-bold text-sub2">
          <span className="flex items-center gap-1"><i className="w-3 h-3 rounded bg-verde inline-block" />con cápsula</span>
          <span className="flex items-center gap-1"><i className="w-3 h-3 rounded bg-[#7CC596] inline-block" />registrado</span>
          <span className="flex items-center gap-1"><i className="w-3 h-3 rounded bg-[#FDE68A] inline-block" />hoy</span>
        </div>
      </Card>
      <Card className="mt-4 p-5">
        <Eyebrow>Historial</Eyebrow>
        <div className="mt-2 divide-y divide-linea">
          {[...regs].reverse().slice(0, 30).map((r) => (
            <div key={r.fecha} className="flex items-center justify-between py-2.5 text-[13px] font-semibold">
              <span className="text-sub w-16">{fechaCorta(r.fecha)}</span>
              <span className="w-8 text-center">{r.sueno ? caritaDe(r.sueno) : "·"}</span>
              <span className="flex-1 text-right">{r.peso ? `${kg(r.peso)} kg` : "—"}</span>
              <span className="w-10 text-right">{r.tomo ? "💊✓" : ""}</span>
            </div>
          ))}
          {!regs.length && <div className="text-[13px] text-sub2 py-3">Aún no hay registros.</div>}
        </div>
      </Card>
    </>
  );

  return (
    <PageShell bloqueadas={recibido ? [] : BLOQ_ESPERA}>
      <Logo peq />
      <h1 className="font-sora font-extrabold text-[24px] mt-5">Mi evolución</h1>
      {recibido ? contenido : (
        <>
          <div className="mt-4"><AvisoEspera onActivar={() => setActivar(true)} /></div>
          <div className="mt-2">
            <Bloqueo onClick={() => setActivar(true)} titulo="Tus gráficas de peso y sueño" texto="Empiezan con tu primera mañana con Barberina Max">
              {contenido}
            </Bloqueo>
          </div>
        </>
      )}
      <a href={linkCamila(s.perfil.nombre)} target="_blank" rel="noreferrer" className="btn-wa block text-center w-full py-3.5 text-[14.5px] mt-5">💬 Hablar con Camila</a>
      <ModalActivar abierto={activar} onCerrar={() => setActivar(false)} nombre={s.perfil.nombre} />
    </PageShell>
  );
}
