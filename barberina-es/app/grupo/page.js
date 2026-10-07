"use client";
// GRUPO — premio, ranking da semana, "Todas", feed, semanas anteriores, compartir.
// Durante a espera: tudo visível (prova social + motivo para receber o pacote),
// mas a usuária aparece como "esperando el frasco" e não pontua.
import { useEffect, useState } from "react";
import { useSesion } from "../../lib/useSesion";
import { PageShell, Logo, Splash, Card, Eyebrow, Avatar, Bloqueo, HeroFoto, Titulo } from "../../components/ui";
import { frascoRecibido } from "../../lib/store";
import { rankingGrupo, novedades, historialMiembro, semanasAnteriores } from "../../lib/grupo";
import { kg, msHastaCierre, fechaDM } from "../../lib/fechas";
import { CONFIG, BLOQ_ESPERA } from "../../lib/config";
import { compartirProgreso } from "../../lib/compartir";

const MEDALLA = ["🥇", "🥈", "🥉"];
const ESTADO_TXT = {
  preparando: "📦 Esperando su pedido",
  camino: "🚚 Su pedido está en camino",
  reparto: "🚚 En reparto · llega mañana",
  esperando: "📦 Esperando tu pedido",
};

function Cuenta() {
  const [ms, setMs] = useState(msHastaCierre());
  useEffect(() => { const t = setInterval(() => setMs(msHastaCierre()), 1000); return () => clearInterval(t); }, []);
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  return (
    <div className="flex gap-1.5 mt-3">
      {[[d, "días"], [h, "h"], [m, "min"], [s, "s"]].map(([v, l]) => (
        <div key={l} className="flex-1 rounded-xl bg-white/90 py-2 shadow-sm text-center">
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
    <div className="mt-2 ml-12 rounded-2xl bg-crema p-3 space-y-1">
      <div className="eyebrow !text-[9.5px] mb-1">Últimos días</div>
      {h.map((x) => (
        <div key={x.dia} className="flex items-center gap-2 text-[12px] font-semibold">
          <span className="w-12 text-sub2 flex-none">Día {x.dia}</span>
          {x.estado === "preparando" && <span className="text-sub2">esperando su pedido…</span>}
          {x.estado === "camino" && <span className="text-sub2">🚚 pedido en camino</span>}
          {x.estado === "reparto" && <span className="text-oro2">🚚 en reparto</span>}
          {x.estado === "llego" && <span className="text-oro2 font-bold">📦 ¡recibió su pedido! 1ª cápsula</span>}
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
  if (!s) return <Splash />;

  const recibido = frascoRecibido(s);
  const rk = rankingGrupo(s, { demo: CONFIG.grupoModo !== "off" });
  const nov = novedades(s);
  const yo = rk.lineas[rk.posicion - 1];
  const activas = rk.lineas.filter((l) => l.recibido);
  const esperan = rk.lineas.filter((l) => !l.recibido);
  const podio = activas.slice(0, 3);

  return (
    <PageShell bloqueadas={recibido ? [] : BLOQ_ESPERA} sinPadding>
      <HeroFoto src="/img/grupo.jpg" alto={260} posicion="center 55%">
        <Logo claro peq />
        <div>
          <div className="eyebrow !text-oro">Esta semana</div>
          <h1 className="font-sora font-extrabold text-[28px] leading-tight text-white mt-1">Grupo de la semana</h1>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="vidrio rounded-full px-3 py-1.5 text-[11.5px] font-bold text-white">👭 {rk.total} mujeres</span>
            <span className="vidrio rounded-full px-3 py-1.5 text-[11.5px] font-bold text-white">📦 {rk.esperando} esperando</span>
            <span className="vidrio rounded-full px-3 py-1.5 text-[11.5px] font-bold text-white">−{kg(rk.kgGrupo)} kg juntas</span>
          </div>
        </div>
      </HeroFoto>

      <div className="px-5">
        {/* PREMIO */}
        <div className="relative rounded-[26px] overflow-hidden mt-4" style={{ boxShadow: "0 18px 36px -18px rgba(201,134,42,.8)" }}>
          <img src="/img/trofeo.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(110deg,rgba(255,246,226,.97) 45%,rgba(255,246,226,.55))" }} />
          <div className="relative p-5">
            <div className="eyebrow !text-oro2">Premio de la semana</div>
            <div className="font-sora font-extrabold text-[44px] leading-none mt-1 brillo-texto">{CONFIG.premioEur} €</div>
            <p className="text-[12.5px] text-tinta/80 font-medium mt-2 leading-relaxed max-w-[250px]">
              Para la que más se destaque esta semana. Cuenta la constancia, los kilos y el sueño. Se anuncia el lunes.
            </p>
            <div className="text-[11px] font-bold text-oro2 mt-3">Cierra el domingo a las 23:59</div>
            <Cuenta />
          </div>
        </div>

        {/* MI POSICIÓN */}
        {recibido ? (
          <div className="card-tinta mt-4 p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl vidrio flex items-center justify-center text-[24px]">{rk.posicion <= 3 ? MEDALLA[rk.posicion - 1] : "🏅"}</div>
            <div className="flex-1">
              <div className="text-[15px] font-extrabold">Vas la {rk.posicion}ª de {rk.total} · {yo.puntos} pts</div>
              <div className="text-[12px] text-white/70 font-medium mt-0.5">
                {rk.posicion === 1 ? "¡Lideras el grupo! Mantén el registro cada mañana."
                  : rk.posicion <= 3 ? "En el podio. Un registro al día te mantiene arriba."
                  : "Cada mañana que registras son +10 pts. La constancia gana."}
              </div>
            </div>
          </div>
        ) : (
          <div className="card-tinta mt-4 p-4 flex items-center gap-3">
            <img src="/img/frasco.png" alt="" className="w-12 h-14 object-contain flotar" />
            <div className="flex-1">
              <div className="text-[14.5px] font-extrabold">Participas al recibir tu pedido</div>
              <div className="text-[12px] text-white/70 font-medium mt-0.5 leading-snug">Lo activamos automáticamente con la entrega. Desde esa mañana sumas puntos.</div>
            </div>
          </div>
        )}

        {/* PODIO */}
        {podio.length >= 3 && (
          <div className="card mt-4 pt-5 pb-4 px-3">
            <div className="flex items-end justify-center gap-2">
              {[1, 0, 2].map((idx) => {
                const l = podio[idx];
                const alto = idx === 0 ? 92 : idx === 1 ? 70 : 56;
                return (
                  <div key={l.id} className="flex-1 flex flex-col items-center">
                    <Avatar l={l} size={idx === 0 ? 58 : 48} />
                    <div className="text-[12px] font-bold mt-1.5 text-center leading-tight truncate w-full">{l.nombre}{l.eu ? " (tú)" : ""}</div>
                    <div className="text-[11px] font-black text-verde">−{kg(l.kgSemana)} kg</div>
                    <div className="w-full mt-2 rounded-t-2xl flex items-start justify-center pt-2 text-[20px]"
                      style={{ height: alto, background: idx === 0 ? "linear-gradient(180deg,#F5D27A,#E0A63A)" : idx === 1 ? "linear-gradient(180deg,#E8E6E1,#C9C5BC)" : "linear-gradient(180deg,#E9C3A0,#C98E5E)" }}>
                      {MEDALLA[idx]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NOVEDADES */}
        <Titulo>Novedades de hoy</Titulo>
        <div className="flex gap-3 overflow-x-auto sin-scroll -mx-5 px-5 pb-2">
          {nov.map((n, i) => (
            <div key={i} className={`flex-none w-[230px] rounded-[20px] p-4 ${n.destacado ? "card-tinta" : "card"}`}>
              <div className="text-[22px]">{n.t}</div>
              <div className={`text-[13px] font-semibold leading-snug mt-1.5 ${n.destacado ? "text-white" : ""}`}>{n.txt}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="mt-5 grid grid-cols-3 gap-1 p-1 rounded-[18px] bg-[#ECE6DA]">
          {[["ranking", "Ranking"], ["todas", "Todas"], ["semanas", "Ganadoras"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`py-2.5 rounded-[14px] text-[13px] font-bold ${tab === k ? "bg-white shadow-sm text-tinta" : "text-sub"}`}>{l}</button>
          ))}
        </div>

        {tab === "ranking" && (
          <Card className="mt-3 p-4">
            <div className="flex justify-between text-[10.5px] font-black text-sub2 uppercase tracking-wide px-1">
              <span>Con su pedido ({activas.length})</span><span>kg semana · pts</span>
            </div>
            <div className="mt-2 space-y-1">
              {activas.map((l, i) => <Fila key={l.id} l={l} i={i} s={s} abierto={abierto} setAbierto={setAbierto} />)}
              {!activas.length && <div className="text-[13px] text-sub py-3 text-center">Nadie ha recibido aún su pedido esta semana.</div>}
            </div>
            {esperan.length > 0 && (
              <>
                <div className="text-[10.5px] font-black text-sub2 uppercase tracking-wide px-1 mt-5">Esperando su pedido ({esperan.length})</div>
                <div className="mt-2 space-y-1">{esperan.map((l) => <Fila key={l.id} l={l} s={s} abierto={abierto} setAbierto={setAbierto} />)}</div>
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
                <div key={l.id} className={`flex items-center gap-3 ${l.eu ? "rounded-2xl p-2 -mx-2 bg-[#FFF6E2]" : ""}`}>
                  <Avatar l={l} size={38} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-bold truncate">{l.nombre}{l.eu ? " (tú)" : ""} <span className="text-sub2 font-medium">· {l.ciudad}</span></div>
                    <div className="text-[11.5px] text-sub font-semibold">
                      {l.recibido
                        ? <>{kg(l.pesoInicial)} → <b className="text-tinta">{kg(l.pesoActual)} kg</b> · {l.diasConFrasco === 0 ? "recibió hoy" : `${l.diasConFrasco} ${l.diasConFrasco === 1 ? "día" : "días"} con Barberina`}</>
                        : <>{l.pesoInicial ? `${kg(l.pesoInicial)} kg · ` : ""}esperando su pedido</>}
                    </div>
                  </div>
                  <div className={`text-[14px] font-black ${l.perdido > 0 ? "text-verde" : "text-sub2"}`}>{l.perdido > 0 ? `−${kg(l.perdido)}` : "—"}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "semanas" && (
          <div className="mt-3 space-y-3">
            {semanasAnteriores().map((g) => (
              <div key={g.semana} className="relative rounded-[22px] overflow-hidden">
                <img src="/img/trofeo.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(100deg,rgba(14,59,43,.95) 40%,rgba(14,59,43,.5))" }} />
                <div className="relative p-4 text-white">
                  <div className="eyebrow !text-oro">Semana del {fechaDM(g.semana)}</div>
                  <div className="font-sora font-extrabold text-[17px] mt-1">🏆 {g.nombre}, {g.ciudad}</div>
                  <div className="text-[12px] text-white/75 font-semibold">{g.pts} pts · −{kg(g.kg)} kg en la semana · {CONFIG.premioEur} € pagados</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COMPARTIR */}
        <div className="mt-5">
          {recibido ? (
            <button onClick={() => compartirProgreso(s, rk)} className="btn-verde w-full py-4 text-[15px]">📤 Compartir mi progreso</button>
          ) : (
            <Bloqueo titulo="Compartir mi progreso" texto="Al recibir tu pedido" compacto>
              <div className="btn-verde w-full py-4 text-center text-[15px]">📤 Compartir mi progreso</div>
            </Bloqueo>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function Fila({ l, i, s, abierto, setAbierto }) {
  const pos = i != null ? i + 1 : null;
  const open = abierto === l.id;
  return (
    <div>
      <div onClick={() => !l.eu && setAbierto(open ? null : l.id)}
        className={`flex items-center gap-3 rounded-xl p-2 cursor-pointer ${l.eu ? "bg-[#FFF6E2] ring-1 ring-[#F1D79A]" : "active:bg-crema"}`}>
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
