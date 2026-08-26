"use client";
// "Sua jornada" — o que esperar em cada momento do protocolo.
// Tira a ansiedade dos primeiros dias e mostra que cada sensação é normal.
// IMPORTANTE: nunca revela a regra interna de liberação da Fase 2 (só a curva de %).
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell, Logo } from "../../components/ui";
import { load, diaProtocolo, progressao } from "../../lib/store";

const ETAPAS = [
  {
    id: "inicio",
    faixa: [0, 0],
    emoji: "🛒",
    titulo: "Antes de começar",
    tag: "Preparação",
    resumo: "Compre os ingredientes e monte sua mistura (5 min, sem fogão).",
    oQueEsperar: [
      "Você monta a Mistura do Sono Profundo uma única vez — ela rende ~14 noites.",
      "Hoje mesmo à noite você já toma seu primeiro chá. Não precisa esperar nada.",
    ],
    normal: "Sentir um friozinho na barriga de começar algo novo? Normal e ótimo sinal. 💛",
  },
  {
    id: "noites13",
    faixa: [1, 3],
    emoji: "🌱",
    titulo: "Noites 1 a 3 — Adaptação",
    tag: "Seu corpo está conhecendo o ritual",
    resumo: "As primeiras noites são de ajuste. Não espere milagre ainda — espere consistência.",
    oQueEsperar: [
      "Você pode dormir igual ou só um pouco melhor. Tudo bem: o efeito é cumulativo.",
      "O mais importante agora é criar o hábito: chá + luz baixa + celular fora da cama.",
      "Algumas mulheres já sentem relaxamento na primeira noite; outras, só na quarta. As duas coisas são normais.",
    ],
    normal: "“Não senti nada ainda” nos 3 primeiros dias é completamente normal. Continue — a virada costuma vir em seguida.",
  },
  {
    id: "noites47",
    faixa: [4, 7],
    emoji: "😴",
    titulo: "Noites 4 a 7 — O sono aprofunda",
    tag: "A primeira virada",
    resumo: "É aqui que a maioria começa a notar: pega no sono mais rápido e acorda menos.",
    oQueEsperar: [
      "Pegar no sono mais rápido e acordar menos vezes durante a noite.",
      "Acordar um pouco mais descansada — mesmo que a balança ainda não tenha mudado.",
      "Menos vontade de beliscar à noite (o cortisol começa a baixar).",
    ],
    normal: "A balança ainda parada? Normal. Primeiro o sono melhora, DEPOIS a queima acelera. É a ordem certa do processo.",
  },
  {
    id: "semana2",
    faixa: [8, 14],
    emoji: "⚖️",
    titulo: "Semana 2 — O corpo responde",
    tag: "Os primeiros resultados visíveis",
    resumo: "Com o sono profundo instalado, a queima de gordura começa a aparecer.",
    oQueEsperar: [
      "Menos fome fora de hora e menos desejo por doce (a grelina se regula).",
      "Roupas um pouco mais folgadas e/ou os primeiros gramas a menos na balança.",
      "Mais energia de manhã. Os Aceleradores (kiwi, banana, banho morno) turbinam essa fase.",
    ],
    normal: "O peso não desce em linha reta: ele oscila e desce em degraus. Compare semanas, não dias.",
  },
  {
    id: "semana3",
    faixa: [15, 999],
    emoji: "🚀",
    titulo: "Semana 3 em diante — Rumo à Fase 2",
    tag: "Consolidação",
    resumo: "Seu corpo está sendo analisado. Quando estiver pronto, a Fase 2 é liberada.",
    oQueEsperar: [
      "Sono profundo virou rotina — e é ele que mantém o motor da queima ligado.",
      "O app está acompanhando a resposta do seu corpo à Fase 1 (você vê a % na tela da receita).",
      "Quando seu corpo mostrar que está pronto, a Fase 2 (Shot Termo-Metabólico) será liberada para atacar o apetite diurno.",
    ],
    normal: "Cada corpo tem seu ritmo — não compare sua % com a de ninguém. Consistência > pressa.",
  },
];

function etapaAtual(dia, preparou) {
  if (!preparou) return "inicio";
  const e = ETAPAS.find((et) => dia >= et.faixa[0] && dia <= et.faixa[1] && et.id !== "inicio");
  return e ? e.id : "semana3";
}

export default function Jornada() {
  const router = useRouter();
  const [s, setS] = useState(null);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    setS(st);
  }, [router]);

  if (!s) return <div className="app-bg min-h-dvh" />;

  const preparou = !!s.receitaPreparadaEm;
  const dia = preparou ? diaProtocolo(s) : 0;
  const atual = etapaAtual(dia, preparou);
  const prog = progressao(s);

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <Logo size="text-[19px]" />
        <button onClick={() => router.push("/")} className="text-[13px] text-sub font-bold">← Voltar</button>
      </div>

      <div className="card mt-6 overflow-hidden" style={{ padding: 0 }}>
        <div className="relative h-[130px]">
          <img src="/img/lua-jornada.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(16,20,44,.1), rgba(16,20,44,.9))" }} />
          <div className="absolute bottom-3.5 left-4 right-4">
            <div className="eyebrow">Sua jornada</div>
            <h1 className="text-[22px] font-extrabold tracking-tight mt-0.5">O que esperar em cada fase</h1>
          </div>
        </div>
        <p className="text-[13px] text-sub2 font-semibold leading-relaxed p-[14px_16px]">
          Cada corpo tem seu ritmo — mas o caminho é sempre este. Saber o que vem tira a ansiedade e evita desistência.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {ETAPAS.map((et) => {
          const ehAtual = et.id === atual;
          const jaPassou = preparou && !ehAtual && (et.id === "inicio" || dia > et.faixa[1]);
          return (
            <div
              key={et.id}
              className="card p-5"
              style={ehAtual
                ? { borderColor: "rgba(251,211,141,.5)", background: "linear-gradient(160deg, rgba(251,211,141,.08), rgba(255,255,255,.04))" }
                : jaPassou ? { opacity: 0.72 } : { opacity: 0.9 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-[28px] flex-none">{et.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-[15.5px] font-extrabold leading-tight">{et.titulo}</div>
                    {ehAtual && (
                      <span className="text-[10.5px] font-black rounded-full px-2 py-0.5 text-[#3c2a10]"
                        style={{ background: "linear-gradient(135deg,#fbd38d,#f6ad55)" }}>
                        VOCÊ ESTÁ AQUI
                      </span>
                    )}
                    {jaPassou && (
                      <span className="text-[10.5px] font-black rounded-full px-2 py-0.5 text-green"
                        style={{ background: "rgba(126,232,178,.15)", border: "1px solid rgba(126,232,178,.35)" }}>
                        ✓ CONCLUÍDA
                      </span>
                    )}
                  </div>
                  <div className="text-[11.5px] text-lilac font-bold mt-0.5">{et.tag}</div>
                </div>
              </div>

              <p className="text-[13px] text-sub2 font-semibold mt-3 leading-relaxed">{et.resumo}</p>

              <div className="mt-3 space-y-2">
                {et.oQueEsperar.map((t, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-[12px] mt-[2px] flex-none" style={{ color: "#7ee8b2" }}>●</span>
                    <span className="text-[12.5px] text-sub2 font-semibold leading-relaxed">{t}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(165,180,252,.07)", border: "1px solid rgba(165,180,252,.2)" }}>
                <span className="text-[12px] text-lilac font-semibold leading-relaxed">💜 É normal: {et.normal}</span>
              </div>
            </div>
          );
        })}
      </div>

      {preparou && (
        <div className="card mt-5 p-5" style={{ borderColor: "rgba(251,211,141,.3)" }}>
          <div className="eyebrow" style={{ color: "#fbd38d" }}>Análise do seu corpo · Fase 1</div>
          <div className="bar-track mt-3"><div className="bar-fill" style={{ width: `${prog.pct}%` }} /></div>
          <div className="mt-2 text-[12.5px] font-bold text-gold">Resposta do seu corpo à Fase 1 · {prog.pct}%</div>
          <p className="text-[12px] text-sub font-semibold mt-2 leading-relaxed">
            Continue com o chá da noite e os check-ins da manhã — é isso que faz sua análise avançar.
          </p>
        </div>
      )}

      {!preparou && (
        <Link href="/receita" className="cta-gold block text-center py-4 mt-5 text-[15px]">
          Começar agora: montar minha mistura 🍵
        </Link>
      )}

      <Link href="/" className="block text-center text-[13.5px] text-sub font-bold mt-6 pb-4">← Voltar ao painel</Link>
    </PageShell>
  );
}
