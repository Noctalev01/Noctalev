"use client";
// HOY — duas realidades:
//  • ESPERANDO o pedido: aviso bonito + rastreio + prévia BORRADA de tudo que vem
//  • RECIBIDO: registro de 20 segundos, consejo, progresso, resumo do grupo
import Link from "next/link";
import { useSesion } from "../lib/useSesion";
import { PageShell, Logo, Splash, Card, Eyebrow, Bloqueo, HeroFoto, Titulo, Avatar } from "../components/ui";
import { AvisoPedido } from "../components/Frasco";
import Registro, { RegistroInicio } from "../components/Registro";
import { frascoRecibido, pesoActual, pesoPerdido, suenoMedio, diasRegistrados, racha } from "../lib/store";
import { rankingGrupo, novedades } from "../lib/grupo";
import { CONSEJOS_DR, CONSEJO_ESPERA, BLOQUEADAS } from "../lib/contenido";
import { saludo, fechaLarga, hoyMadrid, kg, diffDias } from "../lib/fechas";
import { CONFIG, linkCamila, BLOQ_ESPERA } from "../lib/config";

export default function Hoy() {
  const [s, refrescar] = useSesion();
  if (!s) return <Splash />;
  const recibido = frascoRecibido(s);
  const rk = rankingGrupo(s, { demo: CONFIG.grupoModo !== "off" });
  const nov = novedades(s);
  const nombre = s.perfil.nombre.split(" ")[0];

  return (
    <PageShell bloqueadas={recibido ? [] : BLOQ_ESPERA} sinPadding>
      <HeroFoto src={recibido ? "/img/playa.jpg" : "/img/grupo.jpg"} alto={recibido ? 250 : 230} posicion="center 60%">
        <div className="flex items-center justify-between">
          <Logo claro peq />
          <Link href="/perfil" className="w-11 h-11 rounded-full vidrio flex items-center justify-center text-[21px]">{s.perfil.avatar}</Link>
        </div>
        <div>
          <div className="text-[12.5px] text-white/75 font-semibold first-letter:uppercase">{fechaLarga(hoyMadrid())}</div>
          <h1 className="font-sora font-extrabold text-[27px] leading-tight text-white mt-0.5">{saludo()}, {nombre}</h1>
          {recibido && (
            <div className="flex gap-2 mt-3">
              <span className="vidrio rounded-full px-3 py-1.5 text-[12px] font-bold text-white">🔥 {racha(s)} {racha(s) === 1 ? "día" : "días"} seguidos</span>
              <span className="vidrio rounded-full px-3 py-1.5 text-[12px] font-bold text-white">🏅 {rk.posicion}ª del grupo</span>
            </div>
          )}
        </div>
      </HeroFoto>
      <div className="px-5 -mt-1">
        {recibido ? <ModoActivo s={s} rk={rk} nov={nov} refrescar={refrescar} /> : <ModoEspera s={s} rk={rk} nov={nov} />}
      </div>
    </PageShell>
  );
}

function ModoEspera({ s, rk, nov }) {
  const destacada = nov.find((n) => n.destacado) || nov[0];
  const top = rk.lineas.filter((l) => l.recibido).slice(0, 3);
  return (
    <>
      <div className="mt-4"><AvisoPedido s={s} /></div>

      {/* PRÉVIA BORRADA: o que ela terá */}
      <Titulo>Lo que se activa al recibirlo</Titulo>
      <div className="grid grid-cols-2 gap-3">
        {BLOQUEADAS.map((b) => (
          <div key={b.titulo} className="relative h-[150px] rounded-[22px] overflow-hidden" style={{ boxShadow: "0 10px 24px -14px rgba(19,35,27,.5)" }}>
            <img src={b.img} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "blur(3px) saturate(.9)", transform: "scale(1.1)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(14,59,43,.25),rgba(14,59,43,.9))" }} />
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full vidrio flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#fff" d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z" /></svg>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3.5">
              <div className="font-sora font-bold text-[14.5px] text-white leading-tight">{b.titulo}</div>
              <div className="text-[11px] text-white/75 font-medium mt-0.5">{b.texto}</div>
            </div>
          </div>
        ))}
      </div>

      {/* REGISTRO BORRADO */}
      <div className="mt-4">
        <Bloqueo titulo="Tu registro diario" texto="Empieza la mañana después de tu primera cápsula">
          <RegistroFalso />
        </Bloqueo>
      </div>

      {/* GRUPO (visível, prova social) */}
      <Titulo accion={<Link href="/grupo" className="text-[12.5px] font-bold text-oro2">Ver todo →</Link>}>Tu grupo de la semana</Titulo>
      <Card className="overflow-hidden">
        <div className="relative h-[120px]">
          <img src="/img/grupo.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0),rgba(14,59,43,.85))" }} />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="font-sora font-extrabold text-[17px] leading-tight">{rk.esperando > 1 ? `Tú y ${rk.esperando - 1} compañeras esperáis vuestro pedido` : "Eres la última en recibirlo"}</div>
            <div className="text-[12px] font-semibold text-white/80 mt-0.5">{rk.recibidas} ya lo tienen · llevan −{kg(rk.kgGrupo)} kg entre todas</div>
          </div>
        </div>
        <div className="p-4">
          {destacada && (
            <div className="rounded-2xl p-3 text-[13px] font-semibold flex gap-2.5 items-start bg-[#EEF7F0]">
              <span className="text-[16px]">{destacada.t}</span><span className="leading-snug">{destacada.txt}</span>
            </div>
          )}
          <div className="mt-3 space-y-2.5">
            {top.map((l, i) => (
              <div key={l.id} className="flex items-center gap-3">
                <span className="w-5 text-center text-[15px]">{["🥇", "🥈", "🥉"][i]}</span>
                <Avatar l={l} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold truncate">{l.nombre}</div>
                  <div className="text-[11px] text-sub2 font-semibold">{l.ciudad}</div>
                </div>
                <div className="text-[14px] font-black text-verde">−{kg(l.perdido)} kg</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* CONSEJO DE ESPERA (liberado) */}
      <Titulo>Consejo del Dr. Castellanos</Titulo>
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF6E2] flex items-center justify-center text-[24px] flex-none">👨‍⚕️</div>
          <div>
            <div className="font-sora font-bold text-[15.5px] leading-tight">{CONSEJO_ESPERA.titulo}</div>
            <div className="text-[11.5px] text-sub2 font-semibold">Dr. Castellanos · para la espera</div>
          </div>
        </div>
        <p className="text-[13.5px] text-sub font-medium leading-relaxed mt-3">{CONSEJO_ESPERA.texto}</p>
      </Card>

      {/* PROGRESSO BORRADO */}
      <div className="mt-4">
        <Bloqueo titulo="Tu progreso" texto="Kilos, sueño y objetivo, día a día">
          <Card className="p-5">
            <Eyebrow>Tu progreso</Eyebrow>
            <div className="font-sora font-extrabold text-[34px] text-verde mt-2">−2,4 kg</div>
            <div className="barra mt-3"><div style={{ width: "38%" }} /></div>
            <div className="grid grid-cols-3 gap-2 mt-4">{["4,2", "6", "38%"].map((x) => <div key={x} className="rounded-xl bg-crema py-3 text-center font-black">{x}</div>)}</div>
          </Card>
        </Bloqueo>
      </div>

      <a href={linkCamila(s.perfil.nombre, "Tengo una duda sobre mi pedido.")} target="_blank" rel="noreferrer"
        className="btn-wa flex items-center justify-center gap-2 w-full py-4 text-[15px] mt-6">💬 ¿Dudas con tu pedido? Habla con Camila</a>
    </>
  );
}

function RegistroFalso() {
  return (
    <Card className="p-5">
      <Eyebrow>Registro de hoy</Eyebrow>
      <div className="text-[15px] font-bold mt-3">¿Cómo has dormido?</div>
      <div className="grid grid-cols-5 gap-1.5 mt-2">{["😫", "😕", "😐", "🙂", "😴"].map((e) => <div key={e} className="opcion py-3 text-center text-[24px]">{e}</div>)}</div>
      <div className="grid grid-cols-2 gap-3 mt-4"><div className="h-12 rounded-2xl bg-crema" /><div className="h-12 rounded-2xl bg-crema" /></div>
      <div className="h-14 rounded-2xl btn-oro mt-4" />
    </Card>
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
        <div className="card-oro mt-4 p-4 flex gap-3 items-center">
          <div className="w-11 h-11 rounded-2xl bg-white/70 flex items-center justify-center text-[22px] flex-none">🌙</div>
          <div className="text-[13px] font-semibold leading-snug">
            <b>Esta noche, tu primera cápsula</b> después de cenar. Mañana apunta tu peso: muchas del grupo ven el primer kilo ya el primer día.
          </div>
        </div>
      )}

      <div className="mt-4">{diasFrasco === 0 ? <RegistroInicio s={s} onGuardado={refrescar} /> : <Registro s={s} onGuardado={refrescar} />}</div>

      {/* PROGRESO */}
      <div className="card-tinta mt-4 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="eyebrow !text-white/60">Tu progreso</div>
            <div className="font-sora font-extrabold text-[40px] leading-none mt-2">{perdido > 0 ? "−" : ""}{kg(perdido)}<span className="text-[18px] text-white/70"> kg</span></div>
            <div className="text-[12.5px] text-white/70 font-semibold mt-1.5">{kg(ini)} kg → <b className="text-white">{kg(act)} kg</b></div>
          </div>
          <img src="/img/frasco.png" alt="" className="w-16 h-20 object-contain flotar" />
        </div>
        <div className="barra barra-clara mt-4"><div style={{ width: `${Math.max(3, pct)}%` }} /></div>
        <div className="text-[11.5px] text-white/70 font-semibold mt-1.5">{Math.round(pct)}% de tu objetivo (−{kg(obj, 0)} kg)</div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[[suenoMedio(s) ? kg(suenoMedio(s)) : "—", "sueño /5"], [String(diasRegistrados(s)), diasRegistrados(s) === 1 ? "día" : "días"], [`${yo?.puntos || 0}`, "puntos"]].map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-white/[.08] py-2.5 text-center">
              <div className="font-sora font-extrabold text-[18px]">{v}</div>
              <div className="text-[10.5px] text-white/60 font-bold">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CONSEJO */}
      <Titulo>Consejo de la semana</Titulo>
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF6E2] flex items-center justify-center text-[24px] flex-none">👨‍⚕️</div>
          <div>
            <div className="font-sora font-bold text-[15.5px] leading-tight">{consejo.titulo}</div>
            <div className="text-[11.5px] text-sub2 font-semibold">Dr. Castellanos · semana {semanaN}</div>
          </div>
        </div>
        <p className="text-[13.5px] text-sub font-medium leading-relaxed mt-3">{consejo.texto}</p>
      </Card>

      {/* GRUPO */}
      <Titulo accion={<Link href="/grupo" className="text-[12.5px] font-bold text-oro2">Ranking →</Link>}>Grupo de la semana</Titulo>
      <Link href="/grupo" className="block relative rounded-[24px] overflow-hidden" style={{ boxShadow: "0 14px 30px -16px rgba(19,35,27,.5)" }}>
        <img src="/img/trofeo.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(100deg,rgba(14,59,43,.95) 30%,rgba(14,59,43,.35))" }} />
        <div className="relative p-5 text-white">
          <div className="eyebrow !text-oro">Premio de la semana · {CONFIG.premioEur} €</div>
          <div className="font-sora font-extrabold text-[22px] mt-1">Vas la {rk.posicion}ª de {rk.total}</div>
          <div className="text-[12.5px] text-white/80 font-semibold">{yo?.puntos || 0} puntos esta semana</div>
          <div className="mt-3 space-y-1">{nov.slice(0, 2).map((n, i) => <div key={i} className="text-[12px] text-white/85 font-semibold">{n.t} {n.txt}</div>)}</div>
        </div>
      </Link>
    </>
  );
}
