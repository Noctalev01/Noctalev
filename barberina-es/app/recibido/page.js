"use client";
// Celebração do desbloqueio (frasco recibido)
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSesion } from "../../lib/useSesion";
import { Splash, Confeti, vibrar } from "../../components/ui";
import { frascoRecibido, marcarVisto } from "../../lib/store";

const LIBERADO = [
  ["⚖️", "Registro diario", "Peso y sueño en 20 segundos"],
  ["🏆", "Ranking y premio de 150 €", "Ya sumas puntos desde mañana"],
  ["🥗", "Todas las recetas fit", "Y el plan semanal de comidas"],
  ["📈", "Mi evolución", "Gráficas de peso y sueño"],
  ["👨‍⚕️", "Consejos semanales del Dr.", "Uno nuevo cada lunes"],
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
    <div className="max-w-md mx-auto min-h-dvh bg-fondo flex flex-col">
      <Confeti activo />
      <div className="franja h-3" /><div className="oro-linea" />
      <div className="px-6 pt-8 pb-10 entrada flex-1 flex flex-col">
        <img src="/img/frasco.png" alt="" className="w-40 h-40 object-contain mx-auto drop-shadow-xl latido" />
        <h1 className="font-sora font-extrabold text-[27px] text-center leading-tight mt-3">¡Ya tienes tu Barberina Max, {s.perfil.nombre.split(" ")[0]}!</h1>
        <p className="text-[14.5px] text-sub font-medium text-center mt-2 leading-relaxed">Tu app está desbloqueada. Desde hoy compites en el grupo de la semana.</p>

        <div className="card p-5 mt-6 space-y-3">
          {LIBERADO.map(([i, t, d]) => (
            <div key={t} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F2FBF5] flex items-center justify-center text-[19px]">{i}</div>
              <div className="flex-1"><div className="text-[13.5px] font-bold">{t}</div><div className="text-[11.5px] text-sub2 font-medium">{d}</div></div>
              <span className="text-verde font-black">✓</span>
            </div>
          ))}
        </div>

        <div className="card p-4 mt-4" style={{ background: "#FFF7E6", borderColor: "#FDE68A" }}>
          <div className="text-[13.5px] font-extrabold">🌙 Esta noche: tu primera cápsula</div>
          <div className="text-[12.5px] text-sub font-medium mt-1 leading-snug">Después de cenar, con un vaso de agua. Mañana, nada más levantarte, sube a la báscula y apúntalo aquí.</div>
        </div>

        <button onClick={() => { marcarVisto("recibido"); router.replace("/"); }} className="btn-oro w-full py-4 text-[16px] mt-6">Empezar</button>
      </div>
    </div>
  );
}
