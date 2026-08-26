"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell, Logo } from "../../components/ui";
import { load, diaProtocolo } from "../../lib/store";

const BONUS = [
  {
    id: "quarto",
    emoji: "🕯️",
    titulo: "Ritual do quarto perfeito",
    desbloqueiaDia: 1,
    itens: [
      "Luz: 1h antes de dormir, apague as luzes fortes. Use abajur ou luz amarela fraca.",
      "Temperatura: quarto levemente fresco ajuda o corpo a 'desligar'. Se puder, deixe o ar entre 20–23°C ou janela entreaberta.",
      "Celular: fora da cama (de preferência fora do alcance do braço). A luz da tela engana o cérebro e corta a melatonina.",
      "Silêncio: se tiver barulho, experimente um ventilador ligado — o som constante ajuda a dormir.",
      "Cama só para dormir: nada de trabalhar, comer ou rolar feed deitada.",
    ],
  },
  {
    id: "jantar",
    emoji: "🍽️",
    titulo: "O que comer no jantar para não travar o sono",
    desbloqueiaDia: 3,
    itens: [
      "Jante 2–3h antes de deitar (dá tempo de digerir).",
      "Prefira: proteína leve (ovo, frango, peixe) + legumes cozidos.",
      "Evite à noite: café, chá preto/verde/mate, refrigerante de cola, chocolate.",
      "Cuidado com o 'jantar leve demais': ir para a cama com fome também acorda de madrugada. Uma fruta com aveia resolve.",
      "Álcool dá sono no começo, mas quebra o sono de madrugada. Evite nos dias do protocolo.",
    ],
  },
  {
    id: "madrugada",
    emoji: "🌒",
    titulo: "Guia anti-madrugada: acordou 3h? Faça isso",
    desbloqueiaDia: 5,
    itens: [
      "NÃO pegue o celular. A luz da tela zera seu sono de novo.",
      "Não olhe as horas — contar o tempo que falta gera ansiedade.",
      "Respire 4-7-8: inspire por 4s, segure 7s, solte por 8s. Repita 4 vezes.",
      "Se depois de ~20 min não voltar a dormir: levante, vá a outro cômodo com luz baixa e volte quando bater o sono.",
      "No dia seguinte, mantenha o horário normal de acordar (dormir até tarde piora a noite seguinte).",
    ],
  },
];

export default function Bonus() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [aberto, setAberto] = useState(null);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    setS(st);
  }, [router]);

  if (!s) return <div className="app-bg min-h-dvh" />;

  const dia = s.receitaPreparadaEm ? diaProtocolo(s) : 1;

  return (
    <PageShell>
      <Logo size="text-[19px]" />
      <h1 className="text-[25px] font-extrabold tracking-tight mt-6">Seus bônus</h1>
      <div className="text-[14px] text-sub font-semibold mt-1">Conteúdos extras liberados ao longo do protocolo</div>

      <div className="mt-5 space-y-4">
        {BONUS.map((b) => {
          const liberado = dia >= b.desbloqueiaDia;
          const isOpen = aberto === b.id;
          return (
            <div key={b.id} className={`card p-5 ${liberado ? "" : "opacity-60"}`}>
              <button className="w-full flex items-center justify-between text-left" disabled={!liberado}
                onClick={() => setAberto(isOpen ? null : b.id)}>
                <div className="flex items-center gap-3">
                  <span className="text-[26px]">{b.emoji}</span>
                  <div>
                    <div className="text-[15px] font-extrabold">{b.titulo}</div>
                    {!liberado && <div className="text-[12px] text-sub font-semibold mt-0.5">Libera em breve, continue o ritual ✨</div>}
                  </div>
                </div>
                <span className="text-[16px]">{liberado ? (isOpen ? "▴" : "▾") : "🔒"}</span>
              </button>
              {isOpen && liberado && (
                <ul className="mt-4 space-y-3">
                  {b.itens.map((item, i) => (
                    <li key={i} className="flex gap-2.5 text-[13.5px] text-sub2 font-semibold leading-relaxed">
                      <span className="text-green flex-none">✓</span> {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="card mt-5 p-5 border-gold/30">
        <div className="text-[15px] font-extrabold">🎁 Em breve para você</div>
        <p className="text-[13px] text-sub2 font-semibold mt-2 leading-relaxed">
          Novos conteúdos e ofertas especiais aparecem aqui conforme você avança no protocolo. Continue firme! 💛
        </p>
      </div>
    </PageShell>
  );
}
