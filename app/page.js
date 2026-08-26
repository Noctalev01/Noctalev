"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell, Logo, Ring, Sparkline } from "../components/ui";
import {
  load, saudacao, diaProtocolo, scoreSono, pesoPerdido, pesosOrdenados,
  progressao, calcStreak, hojeSP, verificarDesbloqueio, fraseDoDia,
} from "../lib/store";
import { supabase } from "../lib/supabase";
import { pullFromCloud, syncNow } from "../lib/sync";
import { agendarLembretes, statusPermissao, pedirPermissao, notificarTeste } from "../lib/notificacoes";
import InstalarApp from "../components/InstalarApp";

function fmtKg(n) {
  return n.toFixed(1).replace(".", ",");
}

export default function Home() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [notif, setNotif] = useState("granted"); // esconde o card por padrão até saber

  useEffect(() => {
    async function init() {
      // exige sessão quando Supabase está configurado
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const sess = data?.session;
        if (!sess) { router.replace("/onboarding"); return; }
        await pullFromCloud(sess.user.id); // dados mais recentes da nuvem
      }
      const st = load();
      if (!st.perfil) { router.replace("/onboarding"); return; }
      if (verificarDesbloqueio(st) || (st.fase2LiberadaEm && !st.celebracaoVista)) {
        syncNow();
        router.replace("/celebracao"); return;
      }
      setS(st);
      setNotif(statusPermissao());
      agendarLembretes(); // lembrete do ritual (se permissão concedida)
    }
    init();
  }, [router]);

  async function ativarNotif() {
    const r = await pedirPermissao();
    setNotif(r);
    if (r === "granted") { agendarLembretes(); notificarTeste(); }
  }

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
      <div className="flex items-center justify-between">
        <Logo size="text-[19px]" />
        <Link href="/config" className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-[15px] text-[#3c2a10]"
          style={{ background: "linear-gradient(135deg,#f6ad55,#ed8936)" }}>
          {nome?.[0]?.toUpperCase() || "?"}
        </Link>
      </div>
      <div className="mt-6">
        <h1 className="text-[25px] font-extrabold tracking-tight leading-tight">
          {saudacao()}, {nome}
        </h1>
        <div className="text-[13.5px] text-sub font-semibold mt-1">
          {preparou ? `Dia ${dia} do protocolo · Fase 1` : "Comece preparando suas gotas"}
        </div>
      </div>

      {!preparou && (
        <div className="card mt-6 p-5" style={{ borderColor: "rgba(251,211,141,.35)", background: "linear-gradient(160deg, rgba(251,211,141,.07), rgba(255,255,255,.04))" }}>
          <div className="eyebrow">Primeiro passo</div>
          <div className="text-[17px] font-extrabold leading-tight mt-1.5">Gotas do Sono Profundo</div>
          <div className="text-[12.5px] text-sub2 font-semibold mt-0.5">Sua receita da Fase 1</div>

          <div className="mt-4 space-y-2.5">
            {[
              { n: "1", t: "Compre os ingredientes — lista pronta, cerca de R$ 25" },
              { n: "2", t: "Prepare com o passo a passo guiado, em 10 minutos" },
              { n: "3", t: "Aguarde 24h de descanso e comece o ritual noturno" },
            ].map((p) => (
              <div key={p.n} className="flex items-center gap-2.5">
                <div className="w-6 h-6 flex-none rounded-full flex items-center justify-center text-[11.5px] font-black text-[#3c2a10]"
                  style={{ background: "linear-gradient(135deg,#fbd38d,#f6ad55)" }}>{p.n}</div>
                <div className="text-[13px] text-sub2 font-semibold leading-snug">{p.t}</div>
              </div>
            ))}
          </div>

          <Link href="/receita" className="cta-gold block text-center py-4 mt-4 text-[15px]">
            Iniciar minha primeira receita
          </Link>
          <div className="text-[11.5px] text-sub font-semibold text-center mt-2.5">
            +50 pontos e a conquista Alquimista ao concluir
          </div>
        </div>
      )}

      {/* Frase do dia */}
      <div className="card mt-4 p-4" style={{ background: "rgba(165,180,252,.05)" }}>
        <div className="text-[13px] text-lilac font-semibold leading-relaxed">{fraseDoDia()}</div>
      </div>

      {/* SONO */}
      <div className="card mt-4 p-[20px_18px]">
        <div className="eyebrow">Qualidade do sono</div>
        <div className="flex items-center gap-[18px] mt-3">
          <Ring pct={sono ? sono.pct : 0} />
          <div>
            {sono ? (
              <>
                <div className="text-[20px] font-extrabold leading-[1.3]">
                  {sono.melhora > 0 ? (<>Melhorou <em className="not-italic text-green">+{sono.melhora}%</em><br />em {sono.dias} {sono.dias === 1 ? "dia" : "dias"}</>)
                    : (<>Média dos últimos<br />{sono.dias} {sono.dias === 1 ? "dia" : "dias"}</>)}
                </div>
                <div className="text-[13px] text-sub2 mt-[6px] font-semibold">
                  {sono.ultimo.acordou === false ? "Você dormiu a noite inteira" : "Continue o ritual esta noite"}
                </div>
              </>
            ) : (
              <>
                <div className="text-[18px] font-extrabold leading-[1.3]">Registre sua<br />primeira noite</div>
                <div className="text-[13px] text-sub2 mt-[6px] font-semibold">Seu anel de sono aparece aqui</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* PESO */}
      <div className="card mt-4 p-[20px_18px]">
        <div className="eyebrow">Sua evolução</div>
        <div className="flex items-center justify-between gap-3 mt-2">
          <div>
            {perdido > 0 ? (
              <>
                <div className="text-[36px] font-black text-green tracking-tight">−{fmtKg(perdido)} kg</div>
                <div className="text-[13.5px] text-gold font-bold">em {dia} {dia === 1 ? "dia" : "dias"}</div>
              </>
            ) : (
              <>
                <div className="text-[24px] font-black text-green tracking-tight mt-1">{s.perfil.pesoInicial ? fmtKg(s.perfil.pesoInicial) + " kg" : "—"}</div>
                <div className="text-[13px] text-sub2 font-semibold mt-1">Meta: {fmtKg(s.perfil.pesoMeta)} kg</div>
              </>
            )}
          </div>
          <Sparkline pesos={pesos} />
        </div>
      </div>

      {/* RITUAL DE HOJE */}
      {preparou && (
        ritualHoje ? (
          <div className="card mt-4 p-[18px]">
            <div className="flex items-center gap-[14px]">
              <div className="w-[42px] h-[42px] flex-none rounded-[13px] flex items-center justify-center text-[17px] font-black text-green"
                style={{ background: "rgba(126,232,178,.12)", border: "1px solid rgba(126,232,178,.35)" }}>✓</div>
              <div>
                <div className="text-[15px] font-extrabold">Ritual de hoje <em className="not-italic text-green">concluído</em></div>
                <div className="text-[12.5px] text-sub font-semibold mt-[3px]">Gotas tomadas às {ritualHoje}</div>
              </div>
            </div>
          </div>
        ) : (
          <Link href="/ritual" className="card block mt-4 p-[18px]">
            <div className="flex items-center gap-[14px]">
              <div className="w-[42px] h-[42px] flex-none rounded-[13px] flex items-center justify-center text-[19px]"
                style={{ background: "rgba(251,211,141,.10)", border: "1px solid rgba(251,211,141,.35)" }}>🌙</div>
              <div className="flex-1">
                <div className="text-[15px] font-extrabold">Ritual noturno de hoje</div>
                <div className="text-[12.5px] text-sub font-semibold mt-[3px]">15 gotas + luz baixa, 30 min antes de dormir</div>
              </div>
            </div>
            <div className="cta-gold text-center py-3 mt-3.5 text-[14.5px]">Fiz meu ritual de hoje</div>
          </Link>
        )
      )}

      {/* CHECK-IN */}
      {preparou && !checkinHoje && (
        <Link href="/checkin" className="card block mt-4 p-[18px]">
          <div className="flex items-center gap-[14px]">
            <div className="w-[42px] h-[42px] flex-none rounded-[13px] flex items-center justify-center text-[19px]"
              style={{ background: "rgba(165,180,252,.10)", border: "1px solid rgba(165,180,252,.35)" }}>☀️</div>
            <div className="flex-1">
              <div className="text-[15px] font-extrabold">Como foi sua noite?</div>
              <div className="text-[12.5px] text-sub font-semibold mt-[3px]">Check-in do dia · +10 pontos</div>
            </div>
            <div className="text-gold text-[18px]">›</div>
          </div>
        </Link>
      )}

      {/* FASE 2 */}
      {preparou && (
        <div className="card mt-4 p-[20px_18px]">
          <div className="flex justify-between items-center">
            <div>
              <div className="eyebrow">Próxima etapa</div>
              <div className="text-[15.5px] font-extrabold mt-1">Receita da Fase 2</div>
            </div>
            <div className="text-[15px] opacity-70">🔒</div>
          </div>
          <div className="bar-track mt-3.5">
            <div className="bar-fill" style={{ width: `${prog.pct}%` }} />
          </div>
          <div className="mt-[9px] text-[13px] font-bold text-gold">
            {prog.pct}% concluído — {prog.pct >= 90 ? (<>falta só <b className="text-white">{100 - prog.pct}%</b> para liberar</>) : "seu corpo está se adaptando à Fase 1"}
          </div>
        </div>
      )}

      {/* NOTIFICAÇÕES (convite, se ainda não decidiu) */}
      {preparou && notif === "default" && (
        <button onClick={ativarNotif} className="card block w-full text-left mt-4 p-[16px]">
          <div className="flex items-center gap-[14px]">
            <div className="w-[42px] h-[42px] flex-none rounded-[13px] flex items-center justify-center text-[19px]"
              style={{ background: "rgba(251,211,141,.10)", border: "1px solid rgba(251,211,141,.35)" }}>🔔</div>
            <div className="flex-1">
              <div className="text-[14.5px] font-extrabold">Ativar lembrete do ritual</div>
              <div className="text-[12px] text-sub font-semibold mt-[3px]">Um aviso discreto na hora certa, todos os dias</div>
            </div>
            <div className="text-gold text-[18px]">›</div>
          </div>
        </button>
      )}

      {/* FOTO DE ANTES (se ainda não colocou) */}
      {!s.fotoAntes && (
        <Link href="/progresso" className="card block mt-4 p-[16px]">
          <div className="flex items-center gap-[14px]">
            <div className="w-[42px] h-[42px] flex-none rounded-[13px] flex items-center justify-center text-[19px]"
              style={{ background: "rgba(165,180,252,.10)", border: "1px solid rgba(165,180,252,.35)" }}>📷</div>
            <div className="flex-1">
              <div className="text-[14.5px] font-extrabold">Adicione sua foto de "antes"</div>
              <div className="text-[12px] text-sub font-semibold mt-[3px]">Para comparar sua evolução mais adiante</div>
            </div>
            <div className="text-gold text-[18px]">›</div>
          </div>
        </Link>
      )}

      {/* GAMIFICAÇÃO */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { v: streak, l: streak === 1 ? "noite seguida" : "noites seguidas", c: "#fbd38d" },
          { v: s.pontos, l: "pontos", c: "#a5b4fc" },
          { v: nConq, l: nConq === 1 ? "conquista" : "conquistas", c: "#7ee8b2" },
        ].map((m, i) => (
          <div key={i} className="card p-[16px_8px] text-center">
            <div className="text-[22px] font-black tracking-tight" style={{ color: m.c }}>{m.v}</div>
            <div className="text-[10.5px] text-sub font-bold mt-1">{m.l}</div>
          </div>
        ))}
      </div>

      {/* Banner de instalação do PWA */}
      <InstalarApp />
    </PageShell>
  );
}
