"use client";
import { useEffect, useState } from "react";
import { load, save, resetAll, progressao, calcStreak, diaProtocolo, pesosOrdenados, DEFAULT_CONFIG, hojeSP } from "../../lib/store";

const ADMIN_PIN = "2026";

function Section({ title, children }) {
  return (
    <div className="card p-5 mt-4">
      <div className="text-[15px] font-extrabold mb-3">{title}</div>
      {children}
    </div>
  );
}

export default function Admin() {
  const [autz, setAutz] = useState(false);
  const [pin, setPin] = useState("");
  const [s, setS] = useState(null);
  const [tab, setTab] = useState("dash");
  const [cfg, setCfg] = useState(null);
  const [nota, setNota] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("noctalev_admin") === "1") setAutz(true);
    const st = load();
    setS(st);
    setCfg(JSON.stringify({ ...DEFAULT_CONFIG, ...st.config }, null, 2));
  }, []);

  function flash(m) { setMsg(m); setTimeout(() => setMsg(""), 2500); }

  if (!autz) {
    return (
      <div className="app-bg min-h-dvh flex items-center justify-center px-6">
        <div className="card p-8 w-full max-w-sm text-center">
          <div className="text-[22px] font-black">🔐 Painel Admin</div>
          <input type="password" inputMode="numeric" placeholder="PIN de acesso" value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full px-4 py-3 mt-5 text-center text-[18px] font-black" />
          <button onClick={() => { if (pin === ADMIN_PIN) { sessionStorage.setItem("noctalev_admin", "1"); setAutz(true); } else alert("PIN incorreto"); }}
            className="cta-gold w-full py-3.5 mt-4 text-[15px]">Entrar</button>
          <p className="text-sub text-[11.5px] font-semibold mt-4">Protótipo: PIN padrão 2026. Em produção, role admin via Supabase Auth + RLS.</p>
        </div>
      </div>
    );
  }

  if (!s) return <div className="app-bg min-h-dvh" />;

  const temUser = !!s.perfil;
  const prog = temUser ? progressao(s) : null;
  const pesos = temUser ? pesosOrdenados(s) : [];
  const delta = pesos.length >= 2 ? (pesos[0].peso - pesos[pesos.length - 1].peso).toFixed(1) : "0";
  const checkinsArr = Object.entries(s.checkins || {}).sort((a, b) => b[0].localeCompare(a[0]));
  const ultimoCheckin = checkinsArr[0]?.[0] || null;
  const inativa = ultimoCheckin ? (new Date(hojeSP()) - new Date(ultimoCheckin)) / 86400000 >= 3 : true;

  function mutate(fn) {
    const st = load();
    fn(st);
    save(st);
    setS(load());
  }

  function exportCSV() {
    const linhas = [["data", "sono_1a5", "horas", "acordou_madrugada", "peso_kg"]];
    Object.entries(s.checkins || {}).sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([d, c]) => linhas.push([d, c.sono, c.horas, c.acordou ? "sim" : "nao", c.peso ?? ""]));
    const csv = linhas.map((l) => l.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `noctalev_checkins_${hojeSP()}.csv`;
    a.click();
  }

  const TABS = [
    { id: "dash", t: "📊 Dashboard" },
    { id: "user", t: "👤 Usuária" },
    { id: "acoes", t: "⚡ Ações" },
    { id: "cfg", t: "⚙️ Config" },
  ];

  return (
    <div className="app-bg min-h-dvh">
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-black">🖥️ NoctaLev Admin</h1>
          <button onClick={() => { sessionStorage.removeItem("noctalev_admin"); setAutz(false); }}
            className="text-[12.5px] font-bold text-sub">Sair</button>
        </div>
        {msg && <div className="card p-3 mt-3 text-[13.5px] font-bold text-green">{msg}</div>}

        <div className="flex gap-2 mt-5 flex-wrap">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`text-[13px] font-bold px-4 py-2 rounded-full ${tab === t.id ? "bg-gold text-[#3c2a10]" : "bg-white/8 text-sub2"}`}>
              {t.t}
            </button>
          ))}
        </div>

        {tab === "dash" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {[
                { l: "Usuárias", v: temUser ? 1 : 0 },
                { l: "Ativas hoje", v: s.checkins?.[hojeSP()] || s.rituais?.[hojeSP()] ? 1 : 0 },
                { l: "Check-ins total", v: Object.keys(s.checkins || {}).length },
                { l: "Preparou receita", v: s.receitaPreparadaEm ? "100%" : "0%" },
                { l: "Chegou ao dia 7", v: temUser && diaProtocolo(s) >= 7 ? "100%" : "0%" },
                { l: "Fase 2 liberada", v: s.fase2LiberadaEm ? 1 : 0 },
              ].map((m, i) => (
                <div key={i} className="card p-4 text-center">
                  <div className="text-[22px] font-black text-gold">{m.v}</div>
                  <div className="text-[11px] text-sub font-bold mt-1">{m.l}</div>
                </div>
              ))}
            </div>
            <p className="text-sub text-[12px] font-semibold mt-4 leading-relaxed">
              💡 Protótipo local (1 usuária = este navegador). Em produção com Supabase, este painel lista todas as usuárias via queries com role admin.
            </p>
          </>
        )}

        {tab === "user" && (
          !temUser ? <Section title="Sem usuária cadastrada neste dispositivo">—</Section> : (
            <>
              <Section title={`👤 ${s.perfil.nome} ${inativa ? "· 🔴 inativa 3+ dias" : "· 🟢 ativa"}`}>
                <div className="grid grid-cols-2 gap-y-2 text-[13.5px] font-semibold text-sub2">
                  <div>Email:</div><div className="text-txt">{s.perfil.email || "—"}</div>
                  <div>Dia do protocolo:</div><div className="text-txt">{diaProtocolo(s)}</div>
                  <div>Fase atual:</div><div className="text-txt">{s.fase2Paga ? "2" : "1"} {s.fase2LiberadaEm ? "(F2 liberada)" : ""}</div>
                  <div>Streak:</div><div className="text-txt">🔥 {calcStreak(s)}</div>
                  <div>Pontos:</div><div className="text-txt">⭐ {s.pontos}</div>
                  <div>Peso inicial → atual:</div>
                  <div className="text-txt">{s.perfil.pesoInicial} → {pesos[pesos.length - 1]?.peso ?? "—"} kg (Δ −{delta})</div>
                  <div>Dificuldade:</div><div className="text-txt">{s.perfil.dificuldade}</div>
                  <div>Refluxo / cafeína:</div><div className="text-txt">{s.perfil.refluxo ? "sim" : "não"} / {s.perfil.cafeina ? "sim" : "não"}</div>
                  <div>Progressão interna:</div><div className="text-txt">{prog.pct}% · dia {prog.dia} · {prog.liberada ? "LIBERADA" : "em curso"}</div>
                  <div>Último check-in:</div><div className="text-txt">{ultimoCheckin || "—"}</div>
                </div>
              </Section>

              <Section title="📋 Histórico de check-ins">
                {checkinsArr.length === 0 ? <div className="text-sub text-[13px] font-semibold">Nenhum check-in ainda.</div> : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {checkinsArr.map(([d, c]) => (
                      <div key={d} className="flex justify-between text-[13px] font-semibold bg-white/[.04] rounded-xl px-3 py-2">
                        <span className="text-sub2">{d}</span>
                        <span>sono {c.sono}/5 · {c.horas}h · {c.acordou ? "acordou" : "direto"} · {c.peso ? c.peso + "kg" : "s/ peso"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="📝 Notas internas">
                {(s.notasAdmin || []).map((n, i) => (
                  <div key={i} className="text-[13px] font-semibold text-sub2 bg-white/[.04] rounded-xl px-3 py-2 mb-2">
                    <span className="text-sub text-[11px]">{n.em?.slice(0, 10)}</span> — {n.texto}
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nova nota..."
                    className="flex-1 px-3 py-2.5 text-[13.5px] font-semibold" />
                  <button onClick={() => { if (!nota.trim()) return; mutate((st) => { st.notasAdmin = [...(st.notasAdmin || []), { texto: nota.trim(), em: new Date().toISOString() }]; }); setNota(""); flash("Nota adicionada"); }}
                    className="cta-gold px-4 text-[13.5px]">+</button>
                </div>
              </Section>
            </>
          )
        )}

        {tab === "acoes" && (
          <>
            <Section title="⚡ Ações manuais">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => { mutate((st) => { st.fase2LiberadaEm = new Date().toISOString(); st.celebracaoVista = false; }); flash("Fase 2 liberada ✅"); }}
                  className="opt-btn py-3 text-[13.5px] font-bold">🔓 Liberar Fase 2</button>
                <button onClick={() => { mutate((st) => { st.fase2LiberadaEm = null; st.celebracaoVista = false; }); flash("Fase 2 bloqueada"); }}
                  className="opt-btn py-3 text-[13.5px] font-bold">🔒 Bloquear Fase 2</button>
                <button onClick={() => { mutate((st) => { st.fase2Paga = true; }); flash("Fase 2 marcada como paga ✅"); }}
                  className="opt-btn py-3 text-[13.5px] font-bold">💰 Marcar Fase 2 paga</button>
                <button onClick={() => { mutate((st) => { st.fase3LiberadaEm = new Date().toISOString(); }); flash("Fase 3 liberada ✅"); }}
                  className="opt-btn py-3 text-[13.5px] font-bold">🔓 Liberar Fase 3</button>
                <button onClick={() => {
                  const d = prompt("Ajustar dia do protocolo — quantos dias atrás começou o preparo?", "3");
                  const n = parseInt(d, 10);
                  if (!isNaN(n)) { mutate((st) => { const dt = new Date(); dt.setDate(dt.getDate() - n); st.receitaPreparadaEm = dt.toISOString(); }); flash(`Preparo ajustado p/ ${n} dias atrás`); }
                }} className="opt-btn py-3 text-[13.5px] font-bold">📅 Ajustar dia do protocolo</button>
                <button onClick={exportCSV} className="opt-btn py-3 text-[13.5px] font-bold">📥 Exportar CSV</button>
              </div>
            </Section>
            <Section title="🧨 Zona de perigo">
              <button onClick={() => { if (confirm("Apagar TODOS os dados desta usuária/dispositivo?")) { resetAll(); location.href = "/onboarding"; } }}
                className="w-full py-3 rounded-2xl border border-[#e57373]/50 text-[#e57373] text-[13.5px] font-bold">
                Resetar todos os dados
              </button>
            </Section>
          </>
        )}

        {tab === "cfg" && (
          <Section title="⚙️ Parâmetros da progressão e URLs (JSON)">
            <p className="text-sub text-[12px] font-semibold mb-3 leading-relaxed">
              diasInternos / minCheckins / maxDias / curva (% por dia) / checkoutFase2-3 / suporte — editável sem deploy.
            </p>
            <textarea value={cfg || ""} onChange={(e) => setCfg(e.target.value)} rows={14}
              className="w-full px-3 py-3 text-[12.5px] font-mono rounded-xl bg-white/[.06] border border-white/15" />
            <button onClick={() => {
              try { const j = JSON.parse(cfg); mutate((st) => { st.config = { ...DEFAULT_CONFIG, ...j }; }); flash("Configuração salva ✅"); }
              catch { alert("JSON inválido"); }
            }} className="cta-gold w-full py-3 mt-3 text-[14px]">Salvar configuração</button>
          </Section>
        )}
      </div>
    </div>
  );
}
