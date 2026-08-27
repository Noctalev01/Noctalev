"use client";
// ============================================================
// SUA TURMA — ranking da coorte que começou junto.
// A posição da usuária é real (dados dela); as demais evoluem
// por um roteiro determinístico ancorado no dia do protocolo.
// Toque em qualquer pessoa para ver a progressão diária dela
// (sono + peso, dia a dia).
// ============================================================
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell, Logo } from "../../components/ui";
import { load } from "../../lib/store";
import { rankingDoDia, novidadesDoDia, nomeTurma, historicoMembro } from "../../lib/turma";
import { Icone } from "../../components/icones";

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
        opacity: l.entrou === false ? 0.45 : 1,
      }}>
      {inicial}
    </div>
  );
}

function fmtKg(n) { return n.toFixed(1).replace(".", ","); }

// histórico diário expandido de um membro (sono + peso, dia a dia)
function Historico({ id, dia }) {
  const hist = historicoMembro(id, dia, 7);
  if (!hist.length) return null;
  return (
    <div className="mt-2 ml-10 rounded-xl p-3" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
      <div className="text-[10px] font-black text-sub uppercase tracking-wide mb-2">Progressão dia a dia</div>
      <div className="space-y-1">
        {hist.map((h) => (
          <div key={h.dia} className="flex items-center gap-2 text-[11.5px] font-semibold">
            <span className="w-11 flex-none text-sub">Dia {h.dia}</span>
            {h.estado === "fora" && <span className="text-sub opacity-60">ainda não tinha entrado no app</span>}
            {h.estado === "entrou" && <span className="text-lilac">entrou no app, preparando a mistura…</span>}
            {h.estado === "ativo" && (
              <>
                <span className="text-lilac">😴 {h.sono}%</span>
                <span className="text-sub">·</span>
                {h.perda > 0
                  ? <span className="text-green">−{fmtKg(h.perda)} kg</span>
                  : <span className="text-sub">peso estável</span>}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Turma() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [aberto, setAberto] = useState(null);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    setS(st);
  }, [router]);

  if (!s) return <div className="app-bg min-h-dvh" />;

  const { dia, linhas, posicao, total, semLogin, ativos } = rankingDoDia(s);
  const novidades = novidadesDoDia(s);
  const medalha = ["🥇", "🥈", "🥉"];

  return (
    <PageShell>
      <Logo size="text-[19px]" />
      <div className="mt-6">
        <div className="eyebrow">{nomeTurma(s)}</div>
        <h1 className="text-[25px] font-extrabold tracking-tight mt-1">Sua turma</h1>
        <p className="text-[13px] text-sub2 font-semibold mt-1.5 leading-relaxed">
          {total} pessoas na sua turma · Dia {dia} · {ativos} já iniciaram o protocolo
          {semLogin > 0 ? ` · ${semLogin} ainda não entraram` : ""}
        </p>
      </div>

      {/* posição da usuária em destaque */}
      <div className="card mt-5 p-4 flex items-center gap-3"
        style={{ borderColor: "rgba(251,211,141,.4)", background: "linear-gradient(160deg, rgba(251,211,141,.08), rgba(255,255,255,.04))" }}>
        <div className="text-[30px] flex-none">{posicao <= 3 ? medalha[posicao - 1] : "🏅"}</div>
        <div className="flex-1">
          <div className="text-[15px] font-extrabold">Você está em {posicao}º lugar</div>
          <div className="text-[12px] text-sub2 font-semibold mt-0.5">
            {posicao === 1 ? "Liderando a turma — incrível! Continue assim."
              : posicao <= 3 ? "No pódio! O ritual de hoje mantém você aí em cima."
              : posicao <= 12 ? "Na metade de cima! Chá + check-in todo dia = subir posições."
              : "Toda campeã começa de onde está. Faça o ritual de hoje e suba no rank."}
          </div>
        </div>
      </div>

      {/* PRÊMIO DO 1º LUGAR */}
      <div className="card mt-4 p-4"
        style={{ borderColor: "rgba(251,211,141,.45)", background: "linear-gradient(160deg, rgba(251,211,141,.10), rgba(255,255,255,.03))" }}>
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] flex-none rounded-[13px] flex items-center justify-center"
            style={{ background: "rgba(251,211,141,.14)", border: "1px solid rgba(251,211,141,.45)" }}>
            <Icone nome="trofeu" cor="#fbd38d" size={22} />
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-extrabold text-gold">Desafio da turma</div>
            <div className="text-[12.5px] text-sub2 font-semibold mt-0.5 leading-relaxed">
              Quem terminar em <b className="text-txt">1º lugar</b> ganha um vale de
              <b className="text-gold"> R$ 500 na Renner</b> para transformar o guarda-roupa novo que o novo corpo merece.
            </div>
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
        <p className="text-[10.5px] text-sub font-semibold mt-1.5">
          Toque em uma pessoa para ver a progressão dia a dia 👇
        </p>
        <div className="mt-4 space-y-3">
          {linhas.map((l, i) => (
            <div key={l.id}>
              <div
                className="flex items-center gap-3 rounded-xl p-2 -m-2 cursor-pointer"
                onClick={() => !l.eu && setAberto(aberto === l.id ? null : l.id)}
                style={l.eu
                  ? { background: "rgba(251,211,141,.09)", border: "1px solid rgba(251,211,141,.35)", margin: 0, padding: 10 }
                  : l.entrou === false ? { opacity: 0.55 } : {}}>
                <div className="w-7 flex-none text-center">
                  {l.entrou === false
                    ? <span className="text-[13px]">💤</span>
                    : i < 3 ? <span className="text-[18px]">{medalha[i]}</span>
                    : <span className="text-[13px] font-black text-sub">{i + 1}º</span>}
                </div>
                <Avatar l={l} />
                <div className="flex-1 min-w-0">
                  <div className={`text-[13.5px] font-extrabold leading-tight truncate ${l.eu ? "text-gold" : "text-txt"}`}>
                    {l.eu ? `${l.nome} (você)` : l.nome}{l.idade ? <span className="text-sub font-semibold">, {l.idade}</span> : null}
                  </div>
                  <div className="text-[11px] text-sub font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
                    {!l.entrou ? (
                      <span className="text-sub">ainda não fez o primeiro login</span>
                    ) : l.montou ? (
                      <>
                        <span className="text-lilac">😴 sono {l.sono}%</span>
                        {l.deltaSono > 0 && <span className="text-green text-[10px]">▲{l.deltaSono} hoje</span>}
                        {l.fase2 && (
                          <span className="rounded-full px-1.5 py-[1px] text-[9.5px] font-black text-gold"
                            style={{ background: "rgba(251,211,141,.12)", border: "1px solid rgba(251,211,141,.35)" }}>
                            FASE 2 ✓
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sub">entrou no app · ainda não montou a mistura</span>
                    )}
                  </div>
                </div>
                <div className="flex-none text-right">
                  {!l.entrou ? (
                    <div className="text-[15px] opacity-50">⏳</div>
                  ) : l.montou ? (
                    l.perda > 0 ? (
                      <div>
                        <div className="text-[14.5px] font-black text-green">−{fmtKg(l.perda)} kg</div>
                        {l.deltaPerda > 0 && (
                          <div className="text-[9.5px] font-bold text-green opacity-80">−{fmtKg(l.deltaPerda)} hoje</div>
                        )}
                      </div>
                    ) : <div className="text-[12px] font-bold text-sub">mantendo</div>
                  ) : (
                    <div className="opacity-70"><Icone nome="cha" cor="#8f97c0" size={17} /></div>
                  )}
                </div>
              </div>
              {aberto === l.id && !l.eu && <Historico id={l.id} dia={dia} />}
            </div>
          ))}
        </div>
      </div>

      {/* CTA do dia */}
      <div className="card mt-4 p-4" style={{ background: "rgba(126,232,178,.05)", borderColor: "rgba(126,232,178,.25)" }}>
        <div className="text-[13px] font-extrabold text-green">Como subir no ranking?</div>
        <p className="text-[12.5px] text-sub2 font-semibold mt-1.5 leading-relaxed">
          O rank soma sua <b className="text-txt">perda de peso</b> e a <b className="text-txt">qualidade do seu sono</b>.
          Chá toda noite + check-in toda manhã = subir posições. Simples assim.
        </p>
        <Link href="/" className="cta-gold block text-center py-3 mt-3 text-[14px]">
          Fazer minhas ações de hoje
        </Link>
      </div>

      <p className="text-[9.5px] text-sub font-semibold text-center mt-5 leading-relaxed opacity-50 px-2">
        Turma composta por perfis de motivação baseados na jornada típica do protocolo.
        Sua posição no ranking é real, calculada pelos seus resultados.
      </p>
    </PageShell>
  );
}
