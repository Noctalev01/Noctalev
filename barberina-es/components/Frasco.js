"use client";
// Componentes da fase de ESPERA do pedido.
// Não há código: a equipe marca a entrega no Supabase (app_entregas)
// e o app libera sozinho (ver lib/useSesion.js).
import { diaGrupo } from "../lib/store";
import { CONFIG } from "../lib/config";
import { Candado } from "./ui";

// passo do rastreio: estado informado pela equipe ou estimado pelos dias
export function pasoEnvio(s) {
  const e = s.frasco?.envio;
  if (e === "reparto") return 3;
  if (e === "enviado") return 2;
  if (e === "preparando") return 1;
  const d = diaGrupo(s);
  return d <= 1 ? 1 : d === 2 ? 2 : 3;
}

const PASOS = [
  { t: "Pedido confirmado", st: "Pago al recibir" },
  { t: "Preparando", st: "En nuestro almacén" },
  { t: "En camino", st: "Con la empresa de transporte" },
  { t: "En reparto", st: "Hoy o mañana en tu casa" },
  { t: "Entregado", st: "Se activa tu acompañamiento" },
];

// Rastreio horizontal elegante
export function Rastreo({ s, claro = false }) {
  const paso = pasoEnvio(s);
  return (
    <div>
      <div className="relative flex justify-between items-center px-1">
        <div className={`absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[3px] rounded-full ${claro ? "bg-white/20" : "bg-[#EFE9DD]"}`} />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-oro transition-all" style={{ width: `calc(${(paso / (PASOS.length - 1)) * 100}% - 32px * ${paso / (PASOS.length - 1)})` }} />
        {PASOS.map((p, i) => {
          const hecho = i < paso, actual = i === paso;
          return (
            <div key={i} className={`relative z-10 rounded-full flex items-center justify-center font-black text-[11px]
              ${actual ? "w-8 h-8 bg-oro text-white pulso" : hecho ? "w-6 h-6 bg-oro text-white" : `w-6 h-6 ${claro ? "bg-white/15 text-white/60" : "bg-[#EFE9DD] text-sub2"}`}`}>
              {hecho ? "✓" : i === PASOS.length - 1 ? "★" : i + 1}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <div className={`text-[15px] font-extrabold ${claro ? "text-white" : ""}`}>{PASOS[paso].t} {paso >= 2 && <span className="camion">🚚</span>}</div>
          <div className={`text-[12px] font-medium ${claro ? "text-white/70" : "text-sub"}`}>{PASOS[paso].st}</div>
        </div>
        <div className={`text-[11px] font-bold ${claro ? "text-white/60" : "text-sub2"}`}>Paso {paso + 1} de {PASOS.length}</div>
      </div>
    </div>
  );
}

// O aviso principal (tela HOY durante a espera)
export function AvisoPedido({ s }) {
  const nombre = s.perfil?.nombre?.split(" ")[0] || "";
  return (
    <div className="card-tinta overflow-hidden relative">
      <img src="/img/caja.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,rgba(14,59,43,.75),rgba(14,59,43,.96))" }} />
      <div className="relative p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full vidrio text-[10.5px] font-extrabold uppercase tracking-[1.2px] text-oro">
              <span className="w-1.5 h-1.5 rounded-full bg-oro punto" /> Pedido en camino
            </div>
            <h2 className="font-sora font-extrabold text-[22px] leading-[1.15] mt-3 text-white">
              Estamos esperando que recibas tu pedido{nombre ? `, ${nombre}` : ""}
            </h2>
          </div>
          <img src="/img/frasco.png" alt="Barberina Max" className="w-[84px] h-[104px] object-contain flotar flex-none drop-shadow-2xl" />
        </div>
        <p className="text-[13.5px] text-white/80 font-medium leading-relaxed mt-3">
          En cuanto tu Barberina Max sea entregado, <b className="text-white">liberamos automáticamente tu acceso completo</b> y empieza tu acompañamiento con el Dr. Castellanos y tu grupo.
        </p>
        <div className="mt-5 rounded-[20px] vidrio p-4"><Rastreo s={s} claro /></div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[["📦", CONFIG.entregaDias.replace(" laborables", "")], ["💶", "Pagas al recibir"], ["🔓", "Acceso automático"]].map(([i, t]) => (
            <div key={t} className="rounded-2xl bg-white/[.07] py-2.5 px-1">
              <div className="text-[18px]">{i}</div>
              <div className="text-[10.5px] font-bold text-white/80 mt-0.5 leading-tight">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Faixa curta no topo das abas bloqueadas
export function FranjaEspera() {
  return (
    <div className="card-tinta p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl vidrio flex items-center justify-center flex-none"><Candado size={18} color="#F5D27A" /></div>
      <div className="flex-1">
        <div className="text-[13.5px] font-extrabold text-white">Se abre al recibir tu pedido</div>
        <div className="text-[11.5px] text-white/70 font-medium leading-snug">Lo activamos automáticamente cuando el repartidor lo entregue.</div>
      </div>
    </div>
  );
}
