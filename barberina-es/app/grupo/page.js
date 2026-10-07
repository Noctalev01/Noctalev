"use client";
// GRUPO — premio, ranking da semana, "Todas", feed, semanas anteriores, compartir.
// Durante a espera: tudo visível (prova social + motivo para receber o pacote),
// mas a usuária aparece como "esperando el frasco" e não pontua.
import { useEffect, useState } from "react";
import { useSesion } from "../../lib/useSesion";
import { PageShell, Logo, Splash, Card, Eyebrow, Avatar, Bloqueo } from "../../components/ui";
import { ModalActivar } from "../../components/Frasco";
import { frascoRecibido } from "../../lib/store";
import { rankingGrupo, novedades, historialMiembro, semanasAnteriores } from "../../lib/grupo";
import { kg, msHastaCierre, fechaDM } from "../../lib/fechas";
import { CONFIG, BLOQ_ESPERA } from "../../lib/config";
import { compartirProgreso } from "../../lib/compartir";

const MEDALLA = ["🥇", "🥈", "🥉"];
const ESTADO_TXT = {
  preparando: "📦 Esperando su frasco",
  camino: "🚚 Su frasco está en camino",
  reparto: "🚚 En reparto · llega mañana",
  esperando: "📦 Esperando tu frasco",
};

function Cuenta() {
  const [ms, setMs] = useState(msHastaCierre());
  useEffect(() => { const t = setInterval(() => setMs(msHastaCierre()), 1000); return () => clearInterval(t); }, []);
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  return (
    <div className="flex gap-1.5 mt-3">
      {[[d, "días"], [h, "h"], [m, "min"], [s, "s"]].map(([v, l]) => (
        <div key={l} className="flex-1 rounded-xl bg-white/80 border border-[#FDE68A] py-1.5 text-center">
          <div className="font-sora font-extrabold text-[17px] leading-none">{String(v).padStart(2, "0")}</div>
          <div className="text-[9.5px] font-bold text-sub2 mt-0.5">{l}</div>
        </div>
      ))}
    </div>
  );
}

function Historial({ id, s }) {
  const h = historialMiembro(id, s, 7);
  return (
    <div className="mt-2 ml-12 rounded-2xl bg-[#F7F5EF] p-3 space-y-1">
      <div className="eyebrow !text-[9.5px] mb-1">Últimos días</div>
      {h.map((x) => (
        <div key={x.dia} className="flex items-center gap-2 text-[12px] font-semibold">
          <span className="w-12 text-sub2 flex-none">Día {x.dia}</span>
          {x.estado === "preparando" && <span className="text-sub2">esperando el frasco…</span>}
          {x.estado === "camino" && <span className="text-sub2">🚚 frasco en camino</span>}
          {x.estado === "reparto" && <span className="text-oro2">🚚 en reparto</span>}
          {x.estado === "llego" && <span className="text-oro2 font-bold">📦 ¡recibió el frasco! 1ª cápsula</span>}
          {x.estado === "activo" && (
            <>
              <span>😴 {x.sueno}/5</span><span className="text-sub2">·</span>
              <span className="text-verde font-bold">−{kg(x.perdido)} kg</span>
              {x.delta > 0 && <span className="text-[10.5px] text-verde2">(−{kg(x.delta)} ese día)</span>}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Grupo() {
  const [s] = useSesion();
  const [tab, setTab] = useState("ranking");
  const [abierto, setAbierto] = useState(null);
  const [activar, setActivar] = useState(false);
  if (!s) return <Splash />;

  const recibido = frascoRecibido(s);
  const rk = rankingGrupo(s, { demo: CONFIG.grupoModo !== "off" });
  const nov = novedades(s);
  const yo = rk.lineas[rk.posicion - 1];
  const activas = rk.lineas.filter((l) => l.recibido);
  const esperan = rk.lineas.filter((l) => !l.recibido);

  return (
    <PageShell bloqueadas={recibido ? [] : BLOQ_ESPERA}>
      <Logo peq />
      <h1 className="font-sora font-extrabold text-[24px] mt-5 leading-tight">Grupo de la semana</h1>
      <p className="text-[13px] text-sub font-semibold mt-1">
        {rk.total} mujeres · {rk.recibidas} con su frasco · {rk.esperando} esperando · <span className="text-verde">−{kg(rk.kgGrupo)} kg entre todas</span>
      </p>

      {/* PREMIO */}
      <Card className="mt-4 p-5 brillo" style={{ borderColor: "#FDE68A" }}>
        <div className="flex items-center gap-3">
          <div className="text-[34px]">🏆</div>
          <div>
            <Eyebrow className="!text-oro2">Premio de la semana</Eyebrow>
            <div className="font-sora font-extrabold text-[28px] leading-none mt-0.5">{CONFIG.premioEur} €</div>
          </div>
        </div>
        <p className="text-[12.5px] text-tinta/80 font-medium mt-2.5 leading-relaxed">
          Para la que más se destaque esta semana. Cuenta la constancia, los kilos y el sueño. Se anuncia el lunes.
        </p>
        <div className="text-[11.5px] font-bold text-oro2 mt-2">Cierra el domingo a las 23:59</div>
        <Cuenta />
        {!recibido && (
          <div className="mt-3 rounded-xl bg-white/90 border border-[#FDE68A] p-3 text-[12.5px] font-semibold leading-snug">
            🔒 Para participar necesitas tu frasco. <b>Recíbelo y empieza a sumar puntos</b> desde la primera mañana.
          </div>
        )}
      </Card>

      {/* MI POSICIÓN */}
      <Card className="mt-4 p-4 flex items-center gap-3" style={{ borderColor: "#FDE68A" }}>
        <div className="text-[30px] flex-none">{recibido ? (rk.posicion <= 3 ? MEDALLA[rk.posicion - 1] : "🏅") : "📦"}</div>
        <div className="flex-1">
          {recibido ? (
            <>
              <div className="text-[15px] font-extrabold">Vas la {rk.posicion}ª de {rk.total} · {yo.puntos} pts</div>
              <div className="text-[12px] text-sub font-medium mt-0.5">
                {rk.posicion === 1 ? "¡Lideras el grupo! Mantén el registro cada mañana."
                  : rk.posicion <= 3 ? "En el podio. Un registro al día te mantiene arriba."
                  : "Cada mañana que registras son +10 pts. La constancia gana."}
              </div>
            </>
          ) : (
            <>
              <div className="text-[15px] font-extrabold">Estás esperando tu frasco</div>
              <div className="text-[12px] text-sub font-medium mt-0.5">Mira a las que ya lo tienen: así empezarás tú.</div>
            </>
          )}
        </div>
        {!recibido && <button onClick={() => setActivar(true)} className="btn-verde px-3 py-2 text-[12px] flex-none">Ya lo tengo</button>}
      </Card>

      {/* NOVEDADES */}
      <Card className="mt-4 p-5">
        <Eyebrow>Novedades de hoy</Eyebrow>
        <div className="mt-2.5 space-y-2">
          {nov.map((n, i) => (
            <div key={i} className={`text-[13px] font-semibold leading-snug flex gap-2 ${n.destacado ? "rounded-xl p-2.5 bg-[#F2FBF5] border border-[#BFE3CB]" : ""}`}>
              <span>{n.t}</span><span>{n.txt}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* TABS */}
      <div className="mt-5 grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#F1EDE4]">
        {[["ranking", "Ranking"], ["todas", "Todas"], ["semanas", "Ganadoras"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`py-2.5 rounded-xl text-[13px] font-bold ${tab === k ? "bg-white shadow-sm text-tinta" : "text-sub"}`}>{l}</button>
        ))}
      </div>

      {tab === "ranking" && (
        <Card className="mt-3 p-4">
          <div className="flex justify-between text-[10.5px] font-black text-sub2 uppercase tracking-wide px-1">
            <span>Con su frasco ({activas.length})</span><span>días · kg · pts</span>
          </div>
          <div className="mt-2 space-y-1">
            {activas.map((l, i) => (
              <Fila key={l.id} l={l} i={i} s={s} abierto={abierto} setAbierto={setAbierto} />
            ))}
            {!activas.length && <div className="text-[13px] text-sub py-3 text-center">Nadie ha recibido aún su frasco esta semana.</div>}
          </div>
          {esperan.length > 0 && (
            <>
              <div className="text-[10.5px] font-black text-sub2 uppercase tracking-wide px-1 mt-5">Esperando su frasco ({esperan.length})</div>
              <div className="mt-2 space-y-1">
                {esperan.map((l) => <Fila key={l.id} l={l} s={s} abierto={abierto} setAbierto={setAbierto} />)}
              </div>
            </>
          )}
          <p className="text-[11px] text-sub2 font-medium mt-4 px-1 leading-relaxed">
            Puntos: +10 por día registrado · +25 por kg perdido en la semana · +4 por cada punto de sueño medio por encima de 3 · +5 por día con cápsula.
          </p>
        </Card>
      )}

      {tab === "todas" && (
        <Card className="mt-3 p-4">
          <Eyebrow>Las evoluciones de todas</Eyebrow>
          <div className="mt-3 space-y-3">
            {[...rk.lineas].sort((a, b) => b.perdido - a.perdido).map((l) => (
              <div key={l.id} className={`flex items-center gap-3 ${l.eu ? "rounded-xl p-2 -mx-2 bg-[#FFF7E6]" : ""}`}>
                <Avatar l={l} size={38} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold truncate">{l.nombre}{l.eu ? " (tú)" : ""} <span className="text-sub2 font-medium">· {l.ciudad}</span></div>
                  <div className="text-[11.5px] text-sub font-semibold">
                    {l.recibido
                      ? <>{kg(l.pesoInicial)} → <b className="text-tinta">{kg(l.pesoActual)} kg</b> · {l.diasConFrasco === 0 ? "recibió hoy" : `${l.diasConFrasco} ${l.diasConFrasco === 1 ? "día" : "días"} con el frasco`}</>
                      : <>{l.pesoInicial ? `${kg(l.pesoInicial)} kg · ` : ""}esperando el frasco</>}
                  </div>
                </div>
                <div className={`text-[14px] font-black ${l.perdido > 0 ? "text-verde" : "text-sub2"}`}>{l.perdido > 0 ? `−${kg(l.perdido)}` : "—"}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "semanas" && (
        <Card className="mt-3 p-4">
          <Eyebrow>Semanas anteriores</Eyebrow>
          <div className="mt-3 space-y-2.5">
            {semanasAnteriores().map((g) => (
              <div key={g.semana} className="flex items-center gap-3 rounded-xl bg-[#F7F5EF] p-3">
                <span className="text-[22px]">🏆</span>
                <div className="flex-1">
                  <div className="text-[13.5px] font-bold">Semana {fechaDM(g.semana)}: {g.nombre}, {g.ciudad}</div>
                  <div className="text-[11.5px] text-sub font-semibold">{g.pts} pts · −{kg(g.kg)} kg en la semana · {CONFIG.premioEur} € pagados</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* COMPARTIR */}
      <div className="mt-4">
        {recibido ? (
          <button onClick={() => compartirProgreso(s, rk)} className="btn-linea w-full py-3.5 text-[14.5px]">📤 Compartir mi progreso</button>
        ) : (
          <Bloqueo onClick={() => setActivar(true)} titulo="Compartir mi progreso" texto="Disponible al recibir tu frasco">
            <div className="btn-linea w-full py-3.5 text-center text-[14.5px]">📤 Compartir mi progreso</div>
          </Bloqueo>
        )}
      </div>

      <ModalActivar abierto={activar} onCerrar={() => setActivar(false)} nombre={s.perfil.nombre} />
    </PageShell>
  );
}

function Fila({ l, i, s, abierto, setAbierto }) {
  const pos = i != null ? i + 1 : null;
  const open = abierto === l.id;
  return (
    <div>
      <div onClick={() => !l.eu && setAbierto(open ? null : l.id)}
        className={`flex items-center gap-3 rounded-xl p-2 cursor-pointer ${l.eu ? "bg-[#FFF7E6] border border-[#FDE68A]" : "active:bg-[#F7F5EF]"}`}>
        <div className="w-7 flex-none text-center">
          {pos ? (pos <= 3 ? <span className="text-[19px]">{MEDALLA[pos - 1]}</span> : <span className="text-[13px] font-black text-sub2">{pos}º</span>) : <span className="text-[14px]">⏳</span>}
        </div>
        <Avatar l={l} size={40} />
        <div className="flex-1 min-w-0">
          <div className={`text-[13.5px] font-bold leading-tight truncate ${l.eu ? "text-oro2" : ""}`}>
            {l.nombre}{l.eu ? " (tú)" : ""} <span className="text-sub2 font-medium">· {l.ciudad}</span>
          </div>
          <div className="text-[11.5px] font-semibold mt-0.5 text-sub">
            {l.recibido ? (
              l.diasConFrasco === 0
                ? <span className="text-oro2">📦 Recibió hoy · 1ª cápsula esta noche</span>
                : <>{l.dias}/7 días · ⭐ {l.suenoMedio ? kg(l.suenoMedio) : "—"}{l.deltaHoy > 0 && <span className="text-verde2"> · −{kg(l.deltaHoy)} hoy</span>}</>
            ) : (
              <span>{ESTADO_TXT[l.estado] || ESTADO_TXT.esperando}</span>
            )}
          </div>
        </div>
        <div className="flex-none text-right">
          {l.recibido ? (
            <>
              <div className={`text-[14px] font-black ${l.kgSemana > 0 ? "text-verde" : "text-sub2"}`}>{l.kgSemana > 0 ? `−${kg(l.kgSemana)} kg` : "—"}</div>
              <div className="text-[11px] font-bold text-oro2">{l.puntos} pts</div>
            </>
          ) : <div className="text-[18px] opacity-60">📦</div>}
        </div>
      </div>
      {open && <Historial id={l.id} s={s} />}
    </div>
  );
}
