"use client";
// Celebração: a equipe marcou a entrega no Supabase → acesso liberado
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSesion } from "../../lib/useSesion";
import { Splash, Confeti, vibrar } from "../../components/ui";
import { frascoRecibido, marcarVisto } from "../../lib/store";
import { CONFIG } from "../../lib/config";

const LIBERADO = [
  ["/img/bascula.jpg", "Registro diario", "Peso y sueño en 20 s"],
  ["/img/trofeo.jpg", `Premio de ${CONFIG.premioEur} €`, "Ya compites en el grupo"],
  ["/img/r-garbanzos.jpg", "Recetas fit", "Y tu plan semanal"],
  ["/img/playa.jpg", "Mi evolución", "Gráficas día a día"],
];

export default function Recibido() {
  const router = useRouter();
  const [s] = useSesion();
  useEffect(() => {
    if (s && !frascoRecibido(s)) router.replace("/");
    if (s) vibrar([28, 60, 28, 60, 48]);
  }, [s, router]);
  if (!s) return <Splash />;

  return (
    <div className="max-w-md mx-auto min-h-dvh relative overflow-hidden" style={{ background: "linear-gradient(170deg,#0E3B2B 0%,#145238 55%,#F6F2EA 55.1%)" }}>
      <Confeti activo />
      <div className="px-6 pt-10 pb-10 entrada">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full vidrio text-[11px] font-extrabold uppercase tracking-[1.3px] text-oro">✓ Pedido entregado</div>
          <div className="relative mx-auto mt-5 w-48 h-48">
            <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle,rgba(245,210,122,.55),rgba(245,210,122,0) 70%)" }} />
            <img src="/img/frasco.png" alt="" className="relative w-full h-full object-contain drop-shadow-2xl flotar" />
          </div>
          <h1 className="font-sora font-extrabold text-[28px] leading-tight text-white mt-2">¡Tu acompañamiento empieza hoy, {s.perfil.nombre.split(" ")[0]}!</h1>
          <p className="text-[14px] text-white/80 font-medium mt-2 leading-relaxed">Hemos activado tu acceso completo. Ya formas parte del ranking del grupo.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-8">
          {LIBERADO.map(([img, t, d]) => (
            <div key={t} className="relative h-[130px] rounded-[22px] overflow-hidden" style={{ boxShadow: "0 14px 28px -16px rgba(19,35,27,.6)" }}>
              <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(14,59,43,.1),rgba(14,59,43,.9))" }} />
              <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-verde2 text-white text-[13px] font-black flex items-center justify-center">✓</div>
              <div className="absolute bottom-0 p-3 text-white">
                <div className="font-sora font-bold text-[14px] leading-tight">{t}</div>
                <div className="text-[11px] text-white/80 font-medium">{d}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-oro p-4 mt-4 flex gap-3 items-center">
          <div className="w-11 h-11 rounded-2xl bg-white/70 flex items-center justify-center text-[22px] flex-none">🌙</div>
          <div>
            <div className="text-[13.5px] font-extrabold">Esta noche: tu primera cápsula</div>
            <div className="text-[12.5px] text-sub font-medium mt-0.5 leading-snug">Después de cenar, con agua. Mañana, nada más levantarte, pésate y apúntalo aquí.</div>
          </div>
        </div>

        <button onClick={() => { marcarVisto("recibido"); router.replace("/"); }} className="btn-verde w-full py-4 text-[16px] mt-6">Empezar mi acompañamiento</button>
      </div>
    </div>
  );
}
