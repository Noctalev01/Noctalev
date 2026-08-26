"use client";
// ============================================================
// SUA TURMA — ranking da coorte que começou junto.
// A posição da usuária é real (dados dela); as demais evoluem
// por um roteiro determinístico ancorado no dia do protocolo.
// ============================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell, Logo } from "../../components/ui";
import { load } from "../../lib/store";
import { rankingDoDia, novidadesDoDia, nomeTurma } from "../../lib/turma";

function Avatar({ l, size = 44 }) {
  const [erro, setErro] = useState(false);
  const inicial = (l.nome || "?")[0]?.toUpperCase();
  if (l.foto && !erro) {
    return (
      <img src={l.foto} alt={l.nome} width={size} height={size} onError={() => setErro(true)}
        className="rounded-full object-cover flex-none"
        style={{ width: size, height: size, border: l.eu ? "2px solid #fbd38d" : "2px solid rgba(255,255,255,.15)" }} />
    );
  }
  return (
    <div className="rounded-full flex-none flex items-center justify-center font-black"
      style={{
        width: size, height: size, fontSize: size * 0.4,
        background: l.eu ? "linear-gradient(135deg,#f6ad55,#ed8936)" : `${l.cor}22`,
        color: l.eu ? "#3c2a10" : l.cor,
        border: l.eu ? "2px solid #fbd38d" : `2px solid ${l.cor}55`,
      }}>
      {l.foto && !erro ? null : inicial}
    </div>
  );
}

function fmtKg(n) { return n.toFixed(1).replace(".", ","); }

export default function Turma() {
  const router = useRouter();
  const [s, setS] = useState(null);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    setS(st);
  }, [router]);

  if (!s) return <div className="app-bg min-h-dvh" />;

  const { dia, linhas, posicao, total } = rankingDoDia(s);
  const novidades = novidadesDoDia(s);
  const medalha = ["🥇", "🥈", "🥉"];

  return (
    <PageShell>
      <Logo size="text-[19px]" />
      <div className="mt-6">
        <div className="eyebrow">{nomeTurma(s)}</div>
        <h1 className="text-[25px] font-extrabold tracking-tight mt-1">Sua turma 👭</h1>
        <p className="text-[13px] text-sub2 font-semibold mt-1.5 leading-relaxed">
          {total} mulheres começaram o protocolo junto com você. Dia {dia} — vejam como estão:
        </p>
      </div>

      {/* posição da usuária em destaque */}
      <div className="card mt-5 p-4 flex items-center gap-3"
        style={{ borderColor: "rgba(251,211,141,.4)", background: "linear-gradient(160deg, rgba(251,211,141,.08), rgba(255,255,255,.04))" }}>
        <div className="text-[30px] flex-none">{posicao <= 3 ? medalha[posicao - 1] : "🏅"}</div>
        <div className="flex-1">
          <div className="text-[15px] font-extrabold">Você está em {posicao}º lugar</div>
          <div className="text-[12px] text-sub2 font-semibold mt-0.5">
            {posicao === 1 ? "Liderando a turma — incrível! Continue assim 💛"
              : posicao <= 3 ? "No pódio! O ritual de hoje mantém você aí em cima."
              : posicao <= 6 ? "Na metade de cima! Chá + check-in todo dia = subir posições."
              : "Toda campeã começa de onde está. Faça o ritual de hoje e suba no rank! 💪"}
          </div>
        </div>
      </div>

      {/* novidades do dia */}
      <div className="card mt-4 p-4" style={{ background: "rgba(165,180,252,.05)" }}>
        <div className="eyebrow" style={{ color: "#a5b4fc" }}>Novidades da turma</div>
        <div className="mt-2 space-y-1.5">
          {novidades.map((n, i) => (
            <div key={i} className="text-[12.5px] text-lilac font-semibold leading-relaxed">{n}</div>
          ))}
        </div>
      </div>

      {/* RANKING */}
      <div className="card mt-5 p-5">
        <div className="flex items-center justify-between">
          <div className="eyebrow">Ranking de resultados</div>
          <div className="text-[10.5px] text-sub font-bold">peso + sono</div>
        </div>
        <div className="mt-4 space-y-3">
          {linhas.map((l, i) => (
            <div key={l.id} className="flex items-center gap-3 rounded-xl p-2 -m-2"
              style={l.eu ? { background: "rgba(251,211,141,.09)", border: "1px solid rgba(251,211,141,.35)", margin: 0, padding: 10 } : {}}>
              <div className="w-7 flex-none text-center">
                {i < 3 ? <span className="text-[18px]">{medalha[i]}</span>
                  : <span className="text-[13px] font-black text-sub">{i + 1}º</span>}
              </div>
              <Avatar l={l} />
              <div className="flex-1 min-w-0">
                <div className={`text-[13.5px] font-extrabold leading-tight truncate ${l.eu ? "text-gold" : "text-txt"}`}>
                  {l.eu ? `${l.nome} (você)` : l.nome}{l.idade ? <span className="text-sub font-semibold">, {l.idade}</span> : null}
                </div>
                <div className="text-[11px] text-sub font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
                  {l.montou ? (
                    <>
                      <span>😴 sono {l.sono}%</span>
                      {l.fase2 && (
                        <span className="rounded-full px-1.5 py-[1px] text-[9.5px] font-black text-gold"
                          style={{ background: "rgba(251,211,141,.12)", border: "1px solid rgba(251,211,141,.35)" }}>
                          FASE 2 ✓
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sub">ainda não montou a mistura</span>
                  )}
                </div>
              </div>
              <div className="flex-none text-right">
                {l.montou ? (
                  l.perda > 0
                    ? <div className="text-[14.5px] font-black text-green">−{fmtKg(l.perda)} kg</div>
                    : <div className="text-[12px] font-bold text-sub">mantendo</div>
                ) : (
                  <div className="text-[15px]">🍵</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA do dia */}
      <div className="card mt-4 p-4" style={{ background: "rgba(126,232,178,.05)", borderColor: "rgba(126,232,178,.25)" }}>
        <div className="text-[13px] font-extrabold text-green">Como subir no ranking?</div>
        <p className="text-[12.5px] text-sub2 font-semibold mt-1.5 leading-relaxed">
          O rank soma sua <b className="text-txt">perda de peso</b> e a <b className="text-txt">qualidade do seu sono</b>.
          Chá toda noite + check-in toda manhã = subir posições. Simples assim. 💛
        </p>
        <Link href="/" className="cta-gold block text-center py-3 mt-3 text-[14px]">
          Fazer minhas ações de hoje
        </Link>
      </div>

      <p className="text-[10px] text-sub font-semibold text-center mt-5 leading-relaxed opacity-70 px-2">
        As participantes da turma são perfis ilustrativos que representam a jornada típica do protocolo.
        Sua posição no ranking é real, calculada pelos seus resultados.
      </p>
    </PageShell>
  );
}
