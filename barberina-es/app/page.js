"use client";
// HOY — duas realidades:
//  • ESPERANDO o frasco: seguimento do envio + o que já pode fazer + prévias bloqueadas
//  • RECIBIDO: registro de 20 segundos, consejo, progresso, resumo do grupo
import { useState } from "react";
import Link from "next/link";
import { useSesion } from "../lib/useSesion";
import { PageShell, Logo, Splash, Card, Eyebrow, Bloqueo } from "../components/ui";
import { SeguimientoEnvio, ModalActivar } from "../components/Frasco";
import Registro, { RegistroInicio } from "../components/Registro";
import { frascoRecibido, pesoActual, pesoPerdido, suenoMedio, diasRegistrados, marcarPreparacion, diaGrupo } from "../lib/store";
import { rankingGrupo, novedades } from "../lib/grupo";
import { CONSEJOS_DR, CONSEJO_ESPERA, BLOQUEADAS, GUIA_CAPSULA } from "../lib/contenido";
import { saludo, fechaLarga, hoyMadrid, kg, diffDias } from "../lib/fechas";
import { CONFIG, linkCamila, BLOQ_ESPERA } from "../lib/config";

export default function Hoy() {
  const [s, refrescar] = useSesion();
  const [activar, setActivar] = useState(false);
  const [guia, setGuia] = useState(false);
  if (!s) return <Splash />;

  const recibido = frascoRecibido(s);
  const demo = CONFIG.grupoModo !== "off";
  const rk = rankingGrupo(s, { demo });
  const nov = novedades(s);
  const nombre = s.perfil.nombre.split(" ")[0];

  return (
    <PageShell bloqueadas={recibido ? [] : BLOQ_ESPERA}>
      <div className="flex items-center justify-between">
        <Logo peq />
        <Link href="/perfil" className="w-10 h-10 rounded-full bg-white border border-linea flex items-center justify-center text-[20px]">{s.perfil.avatar}</Link>
      </div>
      <div className="mt-5">
        <h1 className="font-sora font-extrabold text-[24px] leading-tight">{saludo()}, {nombre}</h1>
        <div className="text-[13.5px] text-sub font-semibold mt-0.5 first-letter:uppercase">{fechaLarga(hoyMadrid())}</div>
      </div>

      {recibido ? (
        <ModoActivo s={s} rk={rk} nov={nov} refrescar={refrescar} />
      ) : (
        <ModoEspera s={s} rk={rk} nov={nov} onActivar={() => setActivar(true)} guia={guia} setGuia={setGuia} refrescar={refrescar} />
      )}

      <ModalActivar abierto={activar} onCerrar={() => setActivar(false)} nombre={s.perfil.nombre} />
    </PageShell>
  );
}

function ModoEspera({ s, rk, nov, onActivar, guia, setGuia, refrescar }) {
  const prep = s.preparacion || {};
  const tareas = [
    { k: "perfil", t: "Crear tu perfil en el grupo", hecho: true },
    { k: "guia", t: "Leer cómo tomar la cápsula", hecho: !!prep.guia, acc: () => { setGuia(!guia); marcarPreparacion("guia"); refrescar(); } },
    { k: "consejo", t: "Leer el consejo del Dr. para la espera", hecho: !!prep.consejo },
    { k: "importe", t: "Tener el importe listo para el repartidor", hecho: !!prep.importe, acc: () => { marcarPreparacion("importe"); refrescar(); } },
  ];
  const hechas = tareas.filter((t) => t.hecho).length;
  const destacada = nov.find((n) => n.destacado);
  return (
    <>
      {/* ENVÍO */}
      <Card className="mt-5 overflow-hidden" style={{ padding: 0 }}>
        <div className="franja h-2" /><div className="oro-linea" />
        <div className="p-5">
          <div className="flex items-start gap-3">
            <img src="/img/frasco.png" alt="" className="w-20 h-20 object-contain flex-none -ml-1" />
            <div className="flex-1">
              <Eyebrow className="!text-oro2">Tu pedido</Eyebrow>
              <div className="font-sora font-extrabold text-[18px] leading-tight mt-0.5">Tu Barberina Max está en camino</div>
              <div className="text-[12.5px] text-sub font-medium mt-1 leading-snug">Entrega en {CONFIG.entregaDias}. <b className="text-tinta">Pagas al recibirlo.</b></div>
            </div>
          </div>
          <SeguimientoEnvio s={s} />
          <button onClick={onActivar} className="btn-verde w-full py-3.5 text-[15px] mt-2">📦 Ya he recibido mi frasco</button>
          <p className="text-[11.5px] text-sub2 font-medium text-center mt-2">Al recibirlo se desbloquea toda la app: registro, ranking, premio, recetas y tu evolución.</p>
        </div>
      </Card>

      {/* PREPARACIÓN (liberado) */}
      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <Eyebrow>Mientras esperas</Eyebrow>
          <span className="text-[12px] font-bold text-verde">{hechas}/{tareas.length}</span>
        </div>
        <div className="barra mt-2.5"><div style={{ width: `${(hechas / tareas.length) * 100}%` }} /></div>
        <div className="mt-3 space-y-2">
          {tareas.map((t) => (
            <button key={t.k} onClick={t.acc} disabled={!t.acc}
              className="w-full flex items-center gap-3 text-left py-1.5">
              <span className={`w-6 h-6 rounded-full flex-none flex items-center justify-center text-[12px] font-black ${t.hecho ? "bg-verde text-white" : "border-2 border-linea"}`}>{t.hecho ? "✓" : ""}</span>
              <span className={`text-[13.5px] font-semibold ${t.hecho ? "text-sub line-through" : ""}`}>{t.t}</span>
            </button>
          ))}
        </div>
        {guia && (
          <div className="mt-3 rounded-2xl bg-[#F7F5EF] p-4">
            <div className="text-[13px] font-extrabold">💊 Cómo tomar Barberina Max</div>
            <ul className="mt-2 space-y-1.5">
              {GUIA_CAPSULA.map((g, i) => <li key={i} className="text-[12.5px] text-sub font-medium leading-snug">• {g}</li>)}
            </ul>
          </div>
        )}
      </Card>

      {/* CONSEJO DE ESPERA (liberado) */}
      <Card className="mt-4 p-5" style={{ background: "linear-gradient(160deg,#FFF7E6,#fff)", borderColor: "#FDE68A" }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white border border-[#FDE68A] flex items-center justify-center text-[22px] flex-none">👨‍⚕️</div>
          <div>
            <Eyebrow className="!text-oro2">Consejo del Dr. Castellanos</Eyebrow>
            <div className="font-sora font-bold text-[15.5px] leading-tight mt-0.5">{CONSEJO_ESPERA.titulo}</div>
          </div>
        </div>
        <p className="text-[13.5px] text-sub font-medium leading-relaxed mt-3">{CONSEJO_ESPERA.texto}</p>
        {!s.preparacion?.consejo && (
          <button onClick={() => { marcarPreparacion("consejo"); refrescar(); }} className="btn-linea w-full py-2.5 text-[13px] mt-3">Entendido ✓</button>
        )}
      </Card>

      {/* GRUPO (prova social — visível) */}
      <Card className="mt-4 p-5">
        <Eyebrow>Tu grupo de la semana</Eyebrow>
        <div className="font-sora font-extrabold text-[17px] mt-1 leading-snug">
          {rk.esperando > 1 ? `Tú y ${rk.esperando - 1} compañeras estáis esperando el frasco` : "Eres la última en recibir el frasco"}
        </div>
        <div className="text-[12.5px] text-sub font-medium mt-1">{rk.recibidas} ya lo tienen · el grupo lleva <b className="text-verde">−{kg(rk.kgGrupo)} kg</b></div>
        {destacada && (
          <div className="mt-3 rounded-2xl p-3 text-[13px] font-semibold flex gap-2" style={{ background: "#F2FBF5", border: "1px solid #BFE3CB" }}>
            <span>{destacada.t}</span><span>{destacada.txt}</span>
          </div>
        )}
        <Link href="/grupo" className="btn-linea block text-center w-full py-3 text-[14px] mt-3">Ver el grupo y el ranking</Link>
      </Card>

      {/* PRÉVIA BLOQUEADA DO REGISTRO */}
      <div className="mt-4">
        <Bloqueo onClick={onActivar} titulo="Tu registro diario" texto="Se activa la mañana después de tu primera cápsula">
          <Card className="p-5">
            <Eyebrow>Registro de hoy</Eyebrow>
            <div className="text-[15px] font-bold mt-3">¿Cómo has dormido?</div>
            <div className="grid grid-cols-5 gap-1.5 mt-2">{["😫", "😕", "😐", "🙂", "😴"].map((e) => <div key={e} className="opcion py-3 text-center text-[24px]">{e}</div>)}</div>
            <div className="h-12 rounded-xl bg-[#F4F1EA] mt-4" />
            <div className="h-12 rounded-xl bg-[#FDE68A] mt-4" />
          </Card>
        </Bloqueo>
      </div>

      {/* O QUE SERÁ LIBERADO */}
      <Card className="mt-4 p-5">
        <Eyebrow>Se desbloquea al recibir tu frasco</Eyebrow>
        <div className="mt-3 space-y-3">
          {BLOQUEADAS.map((b) => (
            <div key={b.titulo} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4F1EA] flex items-center justify-center text-[19px] flex-none">{b.icono}</div>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold">{b.titulo}</div>
                <div className="text-[11.5px] text-sub2 font-medium">{b.texto}</div>
              </div>
              <span className="text-[14px]">🔒</span>
            </div>
          ))}
        </div>
      </Card>

      <a href={linkCamila(s.perfil.nombre, "Tengo una duda sobre mi pedido.")} target="_blank" rel="noreferrer"
        className="btn-wa block text-center w-full py-3.5 text-[14.5px] mt-4">💬 Dudas sobre tu pedido · Camila</a>
    </>
  );
}

function ModoActivo({ s, rk, nov, refrescar }) {
  const hoy = hoyMadrid();
  const diasFrasco = s.frasco.recibidoEn ? diffDias(s.frasco.recibidoEn, hoy) : 0;
  const semanaN = Math.min(CONSEJOS_DR.length, Math.floor(diasFrasco / 7) + 1);
  const consejo = CONSEJOS_DR[semanaN - 1];
  const ini = s.perfil.pesoInicial, act = pesoActual(s), perdido = pesoPerdido(s);
  const obj = s.perfil.objetivo || 6;
  const pct = Math.min(100, (perdido / obj) * 100);
  const yo = rk.lineas[rk.posicion - 1];
  return (
    <>
      {diasFrasco === 0 && (
        <Card className="mt-5 p-4 flex gap-3 items-center" style={{ background: "#FFF7E6", borderColor: "#FDE68A" }}>
          <div className="text-[26px]">🌙</div>
          <div className="text-[13px] font-semibold leading-snug">
            <b>Esta noche, tu primera cápsula</b> después de cenar. Mañana apunta tu peso: muchas del grupo ven el primer kilo ya el primer día.
          </div>
        </Card>
      )}

      <div className="mt-5">{diasFrasco === 0 ? <RegistroInicio s={s} onGuardado={refrescar} /> : <Registro s={s} onGuardado={refrescar} />}</div>

      {/* CONSEJO */}
      <Card className="mt-4 p-5" style={{ background: "linear-gradient(160deg,#FFF7E6,#fff)", borderColor: "#FDE68A" }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white border border-[#FDE68A] flex items-center justify-center text-[22px] flex-none">👨‍⚕️</div>
          <div>
            <Eyebrow className="!text-oro2">Consejo del Dr. · semana {semanaN}</Eyebrow>
            <div className="font-sora font-bold text-[15.5px] leading-tight mt-0.5">{consejo.titulo}</div>
          </div>
        </div>
        <p className="text-[13.5px] text-sub font-medium leading-relaxed mt-3">{consejo.texto}</p>
      </Card>

      {/* PROGRESO */}
      <Card className="mt-4 p-5">
        <Eyebrow>Tu progreso</Eyebrow>
        <div className="flex items-end justify-between mt-2">
          <div>
            <div className="font-sora font-extrabold text-[30px] text-verde leading-none">{perdido > 0 ? "−" : ""}{kg(perdido)} kg</div>
            <div className="text-[12.5px] text-sub font-semibold mt-1">{kg(ini)} kg → {kg(act)} kg</div>
          </div>
          <div className="text-right">
            <div className="text-[13px] font-bold">😴 {suenoMedio(s) ? kg(suenoMedio(s)) : "—"}/5</div>
            <div className="text-[11.5px] text-sub2 font-semibold">sueño (7 días)</div>
            <div className="text-[13px] font-bold mt-1">{diasRegistrados(s)} {diasRegistrados(s) === 1 ? "día" : "días"}</div>
            <div className="text-[11.5px] text-sub2 font-semibold">registrados</div>
          </div>
        </div>
        <div className="barra mt-4"><div style={{ width: `${Math.max(3, pct)}%` }} /></div>
        <div className="text-[11.5px] text-sub2 font-semibold mt-1.5">{Math.round(pct)}% de tu objetivo (−{kg(obj, 0)} kg)</div>
      </Card>

      {/* GRUPO */}
      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <Eyebrow>Grupo de la semana</Eyebrow>
          <span className="text-[11px] font-black text-oro2 px-2 py-0.5 rounded-full bg-[#FFF7E6] border border-[#FDE68A]">🏆 {CONFIG.premioEur} €</span>
        </div>
        <div className="font-sora font-extrabold text-[19px] mt-1.5">Vas la {rk.posicion}ª de {rk.total} · {yo?.puntos || 0} pts</div>
        <div className="mt-2 space-y-1.5">
          {nov.slice(0, 2).map((n, i) => <div key={i} className="text-[12.5px] text-sub font-semibold">{n.t} {n.txt}</div>)}
        </div>
        <Link href="/grupo" className="btn-oro block text-center w-full py-3 text-[14px] mt-3">Ver ranking</Link>
      </Card>
    </>
  );
}
