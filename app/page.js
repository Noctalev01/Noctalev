"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell, Logo, Ring, Sparkline, Splash, ContadorNumero, vibrar } from "../components/ui";
import {
  load, saudacao, diaProtocolo, scoreSono, pesoPerdido, pesosOrdenados,
  progressao, calcStreak, hojeSP, verificarDesbloqueio, fraseDoDia,
  estadoImpulsos, concluirImpulso, verConquista, estadoPerdao, estadoMistura,
  nivelAtual, resumoSemanal, marcarSemanaVista, marcoPendente, marcarMarcoVisto,
} from "../lib/store";
import ModalConquista from "../components/ModalConquista";
import ModalMarco from "../components/ModalMarco";
import { supabase } from "../lib/supabase";
import { pullFromCloud, syncNow } from "../lib/sync";
import { agendarLembretes, statusPermissao, pedirPermissao, notificarTeste, ativarPush } from "../lib/notificacoes";
import { rankingDoDia } from "../lib/turma";
import { Icone, IconBox } from "../components/icones";
import InstalarApp from "../components/InstalarApp";

function fmtKg(n) {
  return n.toFixed(1).replace(".", ",");
}

export default function Home() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [notif, setNotif] = useState("granted"); // esconde o card por padrão até saber
  const [impAberto, setImpAberto] = useState(null); // id do impulso com explicação aberta
  const [conquistaNova, setConquistaNova] = useState(null); // 3.1 — modal de celebração
  const [marco, setMarco] = useState(null); // 3.8 — marco da jornada (7/14/21/30 dias)

  useEffect(() => {
    async function init() {
      // exige sessão quando Supabase está configurado
      let uid = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const sess = data?.session;
        if (!sess) { router.replace("/onboarding"); return; }
        uid = sess.user.id;
        await pullFromCloud(uid); // dados mais recentes da nuvem
      }
      const st = load();
      if (!st.perfil) { router.replace("/onboarding"); return; }
      if (verificarDesbloqueio(st) || (st.fase2LiberadaEm && !st.celebracaoVista)) {
        syncNow();
        router.replace("/celebracao"); return;
      }
      setS(st);
      setNotif(statusPermissao());
      // 3.1 — se há conquista nova não celebrada, abre a festa
      if (st.conquistasNaoVistas?.length) setConquistaNova(st.conquistasNaoVistas[0]);
      else setMarco(marcoPendente(st)); // 3.8 — só se não há conquista na fila
      agendarLembretes(); // lembrete local (app aberto)
      ativarPush(uid);    // push remoto — chega mesmo com o app fechado
    }
    init();
  }, [router]);

  async function ativarNotif() {
    const r = await pedirPermissao();
    setNotif(r);
    if (r === "granted") {
      agendarLembretes();
      notificarTeste();
      const { data } = supabase ? await supabase.auth.getSession() : { data: null };
      ativarPush(data?.session?.user?.id || null);
    }
  }

  function fecharConquista() {
    const st = verConquista(load());
    setS({ ...st });
    const prox = st.conquistasNaoVistas?.[0] || null;
    setConquistaNova(prox);
    if (!prox) setMarco(marcoPendente(st)); // 3.8 — marco espera as conquistas
    syncNow();
  }

  function fecharMarco() {
    const st = marcarMarcoVisto(load(), marco.dia);
    setS({ ...st });
    setMarco(null);
    syncNow();
  }

  function fecharResumo(chave) {
    vibrar(10);
    const st = marcarSemanaVista(load(), chave);
    setS({ ...st });
    syncNow();
  }

  if (!s) return <Splash />;

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
  const mistura = estadoMistura(s);       // 4.1
  const perdao = estadoPerdao(s);         // 3.2
  const nivel = nivelAtual(s);            // 3.4
  const resumo = resumoSemanal(s);        // 3.3

  return (
    <PageShell>
      {conquistaNova && <ModalConquista tipo={conquistaNova} onFechar={fecharConquista} />}
      {!conquistaNova && marco && <ModalMarco marco={marco} onFechar={fecharMarco} />}
      <div className="flex items-center justify-between">
        <Logo size="text-[19px]" />
        <Link href="/config" className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-[15px] text-[#3c2a10] overflow-hidden"
          style={{ background: "linear-gradient(135deg,#f6ad55,#ed8936)", border: s.fotoPerfil ? "2px solid #fbd38d" : "none" }}>
          {s.fotoPerfil
            ? <img src={s.fotoPerfil} alt="" className="w-full h-full object-cover" />
            : (nome?.[0]?.toUpperCase() || "?")}
        </Link>
      </div>
      <div className="mt-6">
        <h1 className="text-[25px] font-extrabold tracking-tight leading-tight">
          {saudacao()}, {nome}
        </h1>
        <div className="text-[13.5px] text-sub font-semibold mt-1 flex items-center gap-2 flex-wrap">
          <span>{preparou ? `Dia ${dia} do protocolo · Fase 1` : "Comece montando sua mistura"}</span>
          {preparou && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold text-gold"
              style={{ background: "rgba(251,211,141,.1)", border: "1px solid rgba(251,211,141,.35)" }}>
              {nivel.emoji} {nivel.nome}
            </span>
          )}
        </div>
      </div>

      {!preparou && (
        <div className="card mt-6 p-5" style={{ borderColor: "rgba(251,211,141,.35)", background: "linear-gradient(160deg, rgba(251,211,141,.07), rgba(255,255,255,.04))" }}>
          <div className="eyebrow">Primeiro passo</div>
          <div className="text-[17px] font-extrabold leading-tight mt-1.5">Mistura do Sono Profundo</div>
          <div className="text-[12.5px] text-sub2 font-semibold mt-0.5">Seu chá ritual da Fase 1</div>

          <div className="mt-4 space-y-2.5">
            {[
              { n: "1", t: "Compre os ingredientes — lista pronta, ~R$ 12 a 20" },
              { n: "2", t: "Monte a mistura com o passo a passo, em 5 min (sem fogão)" },
              { n: "3", t: "Hoje mesmo à noite: seu primeiro chá + ritual do sono" },
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

      {/* 4.1 — aviso: mistura acabando (dia 12+ de uso) */}
      {preparou && mistura?.acabando && (
        <Link href="/receita" className="card block mt-4 p-4"
          style={{ borderColor: "rgba(246,173,85,.5)", background: "linear-gradient(160deg, rgba(246,173,85,.10), rgba(255,255,255,.03))" }}>
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] flex-none rounded-[13px] flex items-center justify-center"
              style={{ background: "rgba(246,173,85,.14)", border: "1px solid rgba(246,173,85,.45)" }}>
              <Icone nome="cha" cor="#f6ad55" size={22} />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-extrabold text-gold">
                {mistura.restantes <= 0 ? "Sua mistura acabou!" : `Sua mistura acaba em ${mistura.restantes} ${mistura.restantes === 1 ? "noite" : "noites"}`}
              </div>
              <div className="text-[12px] text-sub2 font-semibold mt-0.5 leading-snug">
                Veja a lista de compras e remonte em 5 min — sem quebrar sua sequência 🔥
              </div>
            </div>
            <span className="text-gold text-[18px]">›</span>
          </div>
        </Link>
      )}

      {/* 3.3 — Resumo semanal "Sua semana" (aparece no domingo) */}
      {preparou && resumo && (
        <div className="card mt-4 p-5" style={{ borderColor: "rgba(165,180,252,.4)", background: "linear-gradient(160deg, rgba(165,180,252,.09), rgba(255,255,255,.03))" }}>
          <div className="eyebrow" style={{ color: "#a5b4fc" }}>Sua semana 💜</div>
          <div className="text-[16px] font-extrabold leading-tight mt-1.5">Olha o que você construiu:</div>
          <div className="grid grid-cols-2 gap-2.5 mt-3.5">
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(251,211,141,.07)" }}>
              <div className="text-[22px] font-black text-gold tracking-tight">{resumo.rituais}</div>
              <div className="text-[10.5px] text-sub font-bold mt-0.5">{resumo.rituais === 1 ? "ritual feito" : "rituais feitos"}</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(165,180,252,.07)" }}>
              <div className="text-[22px] font-black text-lilac tracking-tight">{resumo.checkins}</div>
              <div className="text-[10.5px] text-sub font-bold mt-0.5">check-ins</div>
            </div>
          </div>
          <div className="text-[12.5px] text-sub2 font-semibold leading-relaxed mt-3">
            {resumo.sonoDelta != null && resumo.sonoDelta > 0 && <>Seu sono melhorou <b className="text-green">+{resumo.sonoDelta}%</b> em relação à semana anterior. </>}
            {resumo.pesoDelta != null && resumo.pesoDelta >= 0.1 && <>Você eliminou <b className="text-green">−{resumo.pesoDelta.toFixed(1).replace(".", ",")} kg</b> esta semana. </>}
            {(resumo.sonoDelta == null || resumo.sonoDelta <= 0) && (resumo.pesoDelta == null || resumo.pesoDelta < 0.1) && <>Cada ritual conta — a constância é o que traz o resultado. </>}
            Semana nova começando: bora brilhar de novo! ✨
          </div>
          <button onClick={() => fecharResumo(resumo.chave)}
            className="w-full py-3 mt-3.5 rounded-2xl text-[13.5px] font-extrabold text-lilac"
            style={{ background: "rgba(165,180,252,.12)", border: "1px solid rgba(165,180,252,.3)" }}>
            Começar a nova semana 🌙
          </button>
        </div>
      )}

      {/* Frase do dia */}
      <div className="card mt-4 p-4" style={{ background: "rgba(165,180,252,.05)" }}>
        <div className="eyebrow" style={{ color: "#a5b4fc" }}>Sua frase de hoje</div>
        <div className="text-[13px] text-lilac font-semibold leading-relaxed mt-1.5">{fraseDoDia()}</div>
      </div>

      {/* Sua turma — posição no ranking */}
      {preparou && (() => {
        const rk = rankingDoDia(s);
        const med = ["🥇", "🥈", "🥉"];
        return (
          <Link href="/turma" className="card block mt-4 p-[16px]">
            <div className="flex items-center gap-[14px]">
              <div className="w-[42px] h-[42px] flex-none rounded-[13px] flex items-center justify-center text-[20px]"
                style={{ background: "rgba(251,211,141,.1)", border: "1px solid rgba(251,211,141,.35)" }}>
                {rk.posicao <= 3 ? med[rk.posicao - 1] : <Icone nome="trofeu" cor="#fbd38d" size={21} />}
              </div>
              <div className="flex-1">
                <div className="text-[14.5px] font-extrabold">Sua turma · você está em {rk.posicao}º</div>
                <div className="text-[12px] text-sub font-semibold mt-[2px]">
                  {rk.posicao === 1 ? "Liderando! Veja como a turma está" : `Entre ${rk.total} pessoas — veja o ranking do dia ${rk.dia}`}
                </div>
              </div>
              <span className="text-sub text-[16px]">›</span>
            </div>
          </Link>
        );
      })()}

      {/* Sua jornada — o que esperar */}
      <Link href="/jornada" className="card block mt-4 p-[16px]">
        <div className="flex items-center gap-[14px]">
          <IconBox nome="mapa" cor="#a5b4fc" />
          <div className="flex-1">
            <div className="text-[14.5px] font-extrabold">Sua jornada — o que esperar</div>
            <div className="text-[12px] text-sub font-semibold mt-[2px]">
              {!preparou
                ? "Veja o caminho completo antes de começar"
                : dia <= 3 ? "Você está na fase de adaptação — saiba o que é normal sentir"
                : dia <= 7 ? "Noites 4 a 7: a primeira virada do sono — veja o que esperar"
                : dia <= 14 ? "Semana 2: seu corpo começa a responder — entenda os sinais"
                : "Rumo à Fase 2 — veja onde você está no caminho"}
            </div>
          </div>
          <span className="text-sub text-[16px]">›</span>
        </div>
      </Link>

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
                <div className="text-[36px] font-black text-green tracking-tight">
                  <ContadorNumero valor={perdido} decimais={1} duracao={1100} prefixo="−" sufixo=" kg" />
                </div>
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
                <div className="text-[12.5px] text-sub font-semibold mt-[3px]">Chá tomado às {ritualHoje}</div>
              </div>
            </div>
          </div>
        ) : (
          <Link href="/ritual" className="card block mt-4 p-[18px]">
            <div className="flex items-center gap-[14px]">
              <IconBox nome="cha" cor="#fbd38d" />
              <div className="flex-1">
                <div className="text-[15px] font-extrabold">Ritual noturno de hoje</div>
                <div className="text-[12.5px] text-sub font-semibold mt-[3px]">Seu chá + luz baixa, 30–60 min antes de dormir</div>
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
            <IconBox nome="sol" cor="#a5b4fc" />
            <div className="flex-1">
              <div className="text-[15px] font-extrabold">Como foi sua noite?</div>
              <div className="text-[12.5px] text-sub font-semibold mt-[3px]">Check-in do dia · +10 pontos</div>
            </div>
            <div className="text-gold text-[18px]">›</div>
          </div>
        </Link>
      )}

      {/* ACELERADORES DE HOJE (Impulsos Naturais) */}
      {preparou && (() => {
        const imps = estadoImpulsos(s).filter((i) => i.ativo);
        if (!imps.length) return null;
        return (
          <div className="card mt-4 p-[18px]">
            <div className="flex justify-between items-center">
              <div className="eyebrow">Aceleradores de hoje</div>
              <div className="text-[10.5px] text-sub font-bold">+5 pts cada · opcionais</div>
            </div>
            <div className="mt-3 space-y-2.5">
              {imps.map((imp) => (
                <div key={imp.id}>
                  <div className="flex items-center gap-3 w-full">
                    <button
                      onClick={() => { if (!imp.feitoHoje) { vibrar(); const st = concluirImpulso(load(), imp.id); setS({ ...st }); syncNow(); } }}
                      className="flex items-center gap-3 flex-1 text-left">
                      <span className={`w-7 h-7 flex-none rounded-lg border flex items-center justify-center text-[14px] ${
                        imp.feitoHoje ? "bg-green/20 border-green text-green" : "border-white/25 text-transparent"
                      }`}>✓</span>
                      <span className="text-[18px] flex-none">{imp.emoji}</span>
                      <span className="flex-1">
                        <span className={`block text-[13.5px] font-extrabold leading-tight ${imp.feitoHoje ? "text-sub line-through" : "text-txt"}`}>
                          {imp.nome}
                        </span>
                        <span className="block text-[11.5px] text-sub font-semibold mt-0.5">{imp.acao} · {imp.hora}</span>
                      </span>
                    </button>
                    <button onClick={() => setImpAberto(impAberto === imp.id ? null : imp.id)}
                      className="w-7 h-7 flex-none rounded-full flex items-center justify-center text-[12px] font-black text-lilac"
                      style={{ background: "rgba(165,180,252,.12)", border: "1px solid rgba(165,180,252,.3)" }}>?</button>
                  </div>
                  {impAberto === imp.id && imp.copy && (
                    <div className="rounded-xl p-3 mt-2 ml-10 text-[12px] text-lilac font-semibold leading-relaxed anim-pop"
                      style={{ background: "rgba(165,180,252,.07)" }}>
                      {imp.copy}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-[11px] text-sub font-semibold mt-3 leading-relaxed">
              Sono profundo é o motor da queima de gordura — os aceleradores turbinam esse motor. Toque para marcar.
            </div>
          </div>
        );
      })()}

      {/* FASE 2 — evolução do corpo (nunca menciona datas) */}
      {preparou && (
        <div className="card mt-4 overflow-hidden" style={{ padding: 0 }}>
          <div className="relative h-[120px]">
            <img src="/img/fase2-shot.jpg" alt="" className="w-full h-full object-cover"
              style={{ filter: prog.pct >= 100 ? "none" : "saturate(.75) brightness(.8)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(16,20,44,.15), rgba(16,20,44,.92))" }} />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <div className="eyebrow">Próxima etapa</div>
                <div className="text-[16px] font-extrabold mt-0.5">Fase 2 · Shot Termo-Metabólico</div>
              </div>
              <Icone nome="cadeado" cor="#fbd38d" size={18} />
            </div>
          </div>
          <div className="p-[16px_18px_18px]">
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-sub">Evolução do seu corpo</span>
              <span className="text-gold"><ContadorNumero valor={prog.pct} duracao={1100} sufixo="%" /></span>
            </div>
            <div className="bar-track mt-2">
              <div className="bar-fill" style={{ width: `${prog.pct}%` }} />
            </div>
            <div className="mt-[9px] text-[12.5px] font-semibold text-sub2 leading-relaxed">
              {prog.pct >= 90
                ? <>Seu corpo está quase pronto — <b className="text-gold">continue o ritual e os check-ins</b> para liberar.</>
                : prog.pct >= 60
                ? <>Boa evolução! Cada ritual e check-in <b className="text-txt">acelera sua liberação</b>.</>
                : <>A Fase 2 é liberada quando <b className="text-txt">seu corpo mostra que está pronto</b>. Ritual + check-in todos os dias fazem essa barra subir.</>}
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICAÇÕES (convite, se ainda não decidiu) */}
      {preparou && notif === "default" && (
        <button onClick={ativarNotif} className="card block w-full text-left mt-4 p-[16px]">
          <div className="flex items-center gap-[14px]">
            <IconBox nome="sino" cor="#fbd38d" />
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
            <IconBox nome="camera" cor="#a5b4fc" />
            <div className="flex-1">
              <div className="text-[14.5px] font-extrabold">Adicione sua foto de "antes"</div>
              <div className="text-[12px] text-sub font-semibold mt-[3px]">Para comparar sua evolução mais adiante</div>
            </div>
            <div className="text-gold text-[18px]">›</div>
          </div>
        </Link>
      )}

      {/* 3.2 — Noite de Perdão (proteção de streak visível) */}
      {preparou && streak >= 2 && (
        <div className="card mt-4 p-4" style={{ background: "rgba(126,232,178,.05)", borderColor: "rgba(126,232,178,.25)" }}>
          <div className="flex items-center gap-3">
            <div className="text-[24px] flex-none">{perdao.disponivel ? "🛡️" : "💛"}</div>
            <div className="flex-1">
              <div className="text-[13px] font-extrabold text-green">
                {perdao.disponivel ? "Sua sequência está protegida" : "Noite de Perdão usada"}
              </div>
              <div className="text-[11.5px] text-sub2 font-semibold mt-0.5 leading-snug">
                {perdao.disponivel
                  ? "Se você perder 1 noite, a Noite de Perdão segura sua sequência (1 a cada 7 dias). Sem culpa — é só voltar no dia seguinte. 💛"
                  : "Uma noite perdida foi perdoada e sua sequência continuou. Uma nova proteção chega ao completar 7 noites."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3.4 — Nível: progresso rumo ao próximo título */}
      {preparou && (
        <div className="card mt-4 p-[16px_18px]">
          <div className="flex justify-between items-center">
            <div className="text-[13.5px] font-extrabold">
              <span className="mr-1">{nivel.emoji}</span> Nível: <span className="text-gold">{nivel.nome}</span>
            </div>
            {nivel.proximo && (
              <div className="text-[11px] text-sub font-bold">{nivel.faltam} pts p/ {nivel.proximo.emoji}</div>
            )}
          </div>
          <div className="bar-track mt-2.5">
            <div className="bar-fill" style={{ width: `${nivel.pct}%` }} />
          </div>
          <div className="text-[11.5px] text-sub2 font-semibold mt-2 leading-snug">
            {nivel.proximo
              ? <>Próximo título: <b className="text-txt">{nivel.proximo.emoji} {nivel.proximo.nome}</b> — rituais e check-ins te levam lá.</>
              : <>Você chegou ao topo: <b className="text-gold">Rainha do Sono</b> 👑 Continue reinando!</>}
          </div>
        </div>
      )}

      {/* GAMIFICAÇÃO */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { v: streak, l: streak === 1 ? "noite seguida" : "noites seguidas", c: "#fbd38d" },
          { v: s.pontos, l: "pontos", c: "#a5b4fc" },
          { v: nConq, l: nConq === 1 ? "conquista" : "conquistas", c: "#7ee8b2" },
        ].map((m, i) => (
          <div key={i} className="card p-[16px_8px] text-center">
            <div className="text-[22px] font-black tracking-tight" style={{ color: m.c }}>
              <ContadorNumero valor={m.v} duracao={950} />
            </div>
            <div className="text-[10.5px] text-sub font-bold mt-1">{m.l}</div>
          </div>
        ))}
      </div>

      {/* Banner de instalação do PWA */}
      <InstalarApp />
    </PageShell>
  );
}
