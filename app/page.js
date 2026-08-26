"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell, Logo, Ring, Sparkline } from "../components/ui";
import {
  load, saudacao, diaProtocolo, scoreSono, pesoPerdido, pesosOrdenados,
  progressao, calcStreak, hojeSP, verificarDesbloqueio,
} from "../lib/store";

function fmtKg(n) {
  return n.toFixed(1).replace(".", ",");
}

export default function Home() {
  const router = useRouter();
  const [s, setS] = useState(null);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    if (verificarDesbloqueio(st) || (st.fase2LiberadaEm && !st.celebracaoVista)) {
      router.replace("/celebracao"); return;
    }
    setS(st);
  }, [router]);

  if (!s) return <div className="app-bg min-h-dvh" />;

  const nome = s.perfil.nome;
  const dia = diaProtocolo(s);
  const sono = scoreSono(s);
  const perdido = pesoPerdido(s);
  const pesos = pesosOrdenados(s);
  const prog = progressao(s);
  const streak = calcStreak(s);
  const nConq = Object.keys(s.conquistas).length;
  const hoje = hojeSP();
  const ritualHoje = s.rituais[hoje];
  const checkinHoje = s.checkins[hoje];
  const preparou = !!s.receitaPreparadaEm;

  return (
    <PageShell>
      <Logo />
      <div className="flex items-center justify-between mt-[18px]">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight">
            {saudacao()}, <b className="text-gold">{nome}!</b>
          </h1>
          <div className="text-[14px] text-sub font-semibold mt-1">
            {preparou ? `Dia ${dia} do seu protocolo · Fase 1` : "Comece preparando suas gotas 🌿"}
          </div>
        </div>
        <Link href="/config" className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-[17px] text-[#3c2a10]"
          style={{ background: "linear-gradient(135deg,#f6ad55,#ed8936)" }}>
          {nome?.[0]?.toUpperCase() || "?"}
        </Link>
      </div>

      {!preparou && (
        <Link href="/preparo" className="card block mt-[22px] p-5 border-gold/40">
          <div className="text-[15.5px] font-extrabold">🧪 Seu primeiro passo</div>
          <div className="text-[13px] text-sub2 font-semibold mt-1">
            Prepare suas Gotas do Sono Profundo. Leva só 10 minutinhos.
          </div>
          <div className="cta-gold text-center py-3.5 mt-4 text-[15px]">Ver minha receita →</div>
        </Link>
      )}

      {/* SONO */}
      <div className="card mt-[22px] p-[22px_18px]">
        <div className="flex items-center gap-[18px]">
          <Ring pct={sono ? sono.pct : 0} />
          <div>
            <div className="text-[13px] font-bold text-sub uppercase tracking-[.6px]">Qualidade do sono</div>
            {sono ? (
              <>
                <div className="text-[21px] font-extrabold mt-[5px] leading-[1.3]">
                  {sono.melhora > 0 ? (<>Melhorou <em className="not-italic text-green">+{sono.melhora}%</em><br />em {sono.dias} {sono.dias === 1 ? "dia" : "dias"} 😴</>)
                    : (<>Média dos últimos<br />{sono.dias} {sono.dias === 1 ? "dia" : "dias"} 🌙</>)}
                </div>
                <div className="text-[13.5px] text-sub2 mt-[5px] font-semibold">
                  {sono.ultimo.acordou === false ? "Você dormiu sem acordar 🌙" : "Continue o ritual esta noite ✨"}
                </div>
              </>
            ) : (
              <>
                <div className="text-[19px] font-extrabold mt-[5px] leading-[1.3]">Registre sua<br />primeira noite 🌙</div>
                <div className="text-[13.5px] text-sub2 mt-[5px] font-semibold">Seu anel de sono aparece aqui</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* PESO */}
      <div className="card mt-[22px] p-[22px_18px]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[13px] font-bold text-sub uppercase tracking-[.6px]">Sua evolução</div>
            {perdido > 0 ? (
              <>
                <div className="text-[38px] font-black text-green tracking-tight mt-[2px]">−{fmtKg(perdido)} kg</div>
                <div className="text-[14px] text-gold font-bold">em apenas {dia} {dia === 1 ? "dia" : "dias"}</div>
              </>
            ) : (
              <>
                <div className="text-[24px] font-black text-green tracking-tight mt-[6px]">{s.perfil.pesoInicial ? fmtKg(s.perfil.pesoInicial) + " kg" : "—"}</div>
                <div className="text-[13px] text-sub2 font-semibold mt-1">Meta: {fmtKg(s.perfil.pesoMeta)} kg 💪</div>
              </>
            )}
          </div>
          <Sparkline pesos={pesos} />
        </div>
      </div>

      {/* RITUAL DE HOJE */}
      {preparou && (
        ritualHoje ? (
          <div className="card mt-[22px] p-[22px_18px]">
            <div className="flex items-center gap-[14px]">
              <div className="w-[46px] h-[46px] flex-none rounded-[14px] flex items-center justify-center text-[22px]"
                style={{ background: "rgba(126,232,178,.14)", border: "1px solid rgba(126,232,178,.4)" }}>✅</div>
              <div>
                <div className="text-[15px] font-extrabold">Ritual de hoje: <em className="not-italic text-green">concluído</em></div>
                <div className="text-[12.5px] text-sub font-semibold mt-[3px]">Gotas tomadas às {ritualHoje} · leva só 3 minutos</div>
              </div>
            </div>
          </div>
        ) : (
          <Link href="/ritual" className="card block mt-[22px] p-[18px]">
            <div className="flex items-center gap-[14px]">
              <div className="w-[46px] h-[46px] flex-none rounded-[14px] flex items-center justify-center text-[22px]"
                style={{ background: "rgba(251,211,141,.12)", border: "1px solid rgba(251,211,141,.4)" }}>🌙</div>
              <div className="flex-1">
                <div className="text-[15px] font-extrabold">Ritual noturno de hoje</div>
                <div className="text-[12.5px] text-sub font-semibold mt-[3px]">15 gotas + luz baixa, 30 min antes de dormir</div>
              </div>
            </div>
            <div className="cta-gold text-center py-3 mt-3.5 text-[14.5px]">✓ Fiz meu ritual de hoje</div>
          </Link>
        )
      )}

      {/* CHECK-IN */}
      {preparou && !checkinHoje && (
        <Link href="/checkin" className="card block mt-[22px] p-[18px] border-lilac/30">
          <div className="flex items-center gap-[14px]">
            <div className="w-[46px] h-[46px] flex-none rounded-[14px] flex items-center justify-center text-[22px]"
              style={{ background: "rgba(165,180,252,.12)", border: "1px solid rgba(165,180,252,.4)" }}>☀️</div>
            <div className="flex-1">
              <div className="text-[15px] font-extrabold">Como foi sua noite?</div>
              <div className="text-[12.5px] text-sub font-semibold mt-[3px]">Faça seu check-in do dia · +10 pontos ⭐</div>
            </div>
            <div className="text-gold text-[20px]">→</div>
          </div>
        </Link>
      )}

      {/* FASE 2 */}
      {preparou && (
        <div className="card mt-[22px] p-[22px_18px]">
          <div className="flex justify-between items-center">
            <div className="text-[15.5px] font-extrabold">🌿 Receita da Fase 2</div>
            <div className="text-[18px]">🔒</div>
          </div>
          <div className="bar-track mt-3">
            <div className="bar-fill" style={{ width: `${prog.pct}%` }} />
          </div>
          <div className="mt-[9px] text-[13.5px] font-bold text-gold">
            {prog.pct}% concluído — {prog.pct >= 90 ? (<>falta só <b className="text-white">{100 - prog.pct}%</b> para liberar</>) : "seu corpo está se adaptando à Fase 1"}
          </div>
        </div>
      )}

      {/* GAMIFICAÇÃO */}
      <div className="grid grid-cols-3 gap-3 mt-[22px]">
        {[
          { e: "🔥", v: streak, l: streak === 1 ? "noite seguida" : "noites seguidas" },
          { e: "⭐", v: s.pontos, l: "pontos" },
          { e: "🏆", v: nConq, l: nConq === 1 ? "conquista" : "conquistas" },
        ].map((m, i) => (
          <div key={i} className="card p-[14px_8px] text-center">
            <div className="text-[17px] font-black">{m.e} {m.v}</div>
            <div className="text-[11px] text-sub font-bold mt-1">{m.l}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
