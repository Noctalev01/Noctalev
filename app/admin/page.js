"use client";
// Painel Admin — conecta na API /api/admin (service_role no servidor).
// Mostra TODAS as usuárias do Supabase. Protegido por PIN (env ADMIN_PIN).
import { useEffect, useState } from "react";

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
  const [tab, setTab] = useState("dash");
  const [dados, setDados] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const [busca, setBusca] = useState("");
  const [msg, setMsg] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [nota, setNota] = useState("");
  const [emailNova, setEmailNova] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("noctalev_admin_pin");
    if (saved) { setPin(saved); entrar(saved); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function flash(m) { setMsg(m); setTimeout(() => setMsg(""), 2500); }

  async function entrar(p) {
    setCarregando(true);
    try {
      const r = await fetch(`/api/admin?pin=${encodeURIComponent(p)}&acao=lista`);
      if (r.status === 401) { alert("PIN incorreto"); setCarregando(false); return; }
      const j = await r.json();
      if (j.error) { alert("Erro: " + j.error); setCarregando(false); return; }
      sessionStorage.setItem("noctalev_admin_pin", p);
      setDados(j);
      setAutz(true);
    } catch { alert("Erro de conexão"); }
    setCarregando(false);
  }

  async function recarregar() {
    const r = await fetch(`/api/admin?pin=${encodeURIComponent(pin)}&acao=lista`);
    setDados(await r.json());
  }

  async function abrirDetalhe(id) {
    setCarregando(true);
    const r = await fetch(`/api/admin?pin=${encodeURIComponent(pin)}&acao=detalhe&id=${id}`);
    setDetalhe(await r.json());
    setTab("detalhe");
    setCarregando(false);
  }

  async function acao(nome, extra = {}) {
    const r = await fetch("/api/admin", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, acao: nome, id: detalhe?.perfil?.id, ...extra }),
    });
    const j = await r.json();
    if (j.ok) { flash("Feito ✅"); if (detalhe?.perfil?.id) abrirDetalhe(detalhe.perfil.id); recarregar(); }
    else flash("Erro: " + (j.error || "?"));
  }

  if (!autz) {
    return (
      <div className="app-bg min-h-dvh flex items-center justify-center px-6">
        <div className="card p-8 w-full max-w-sm text-center">
          <div className="text-[22px] font-black">🔐 Painel Admin</div>
          <input type="password" inputMode="numeric" placeholder="PIN de acesso" value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && entrar(pin)}
            className="w-full px-4 py-3 mt-5 text-center text-[18px] font-black" />
          <button onClick={() => entrar(pin)} disabled={carregando}
            className="cta-gold w-full py-3.5 mt-4 text-[15px] disabled:opacity-50">
            {carregando ? "Verificando..." : "Entrar"}
          </button>
        </div>
      </div>
    );
  }

  const m = dados?.metricas || {};
  const usuarias = (dados?.usuarias || []).filter((u) =>
    !busca || (u.nome || "").toLowerCase().includes(busca.toLowerCase()) || (u.email || "").toLowerCase().includes(busca.toLowerCase())
  );

  const TABS = [
    { id: "dash", t: "📊 Dashboard" },
    { id: "lista", t: "👥 Usuárias" },
    { id: "acesso", t: "🔑 Acessos" },
  ];

  return (
    <div className="app-bg min-h-dvh">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-black">🖥️ NoctaLev Admin</h1>
          <div className="flex gap-3 items-center">
            <button onClick={recarregar} className="text-[12.5px] font-bold text-lilac">↻ Atualizar</button>
            <button onClick={() => { sessionStorage.removeItem("noctalev_admin_pin"); setAutz(false); }}
              className="text-[12.5px] font-bold text-sub">Sair</button>
          </div>
        </div>
        {msg && <div className="card p-3 mt-3 text-[13.5px] font-bold text-green">{msg}</div>}

        <div className="flex gap-2 mt-5 flex-wrap">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`text-[13px] font-bold px-4 py-2 rounded-full ${tab === t.id ? "bg-gold text-[#3c2a10]" : "bg-white/8 text-sub2"}`}>
              {t.t}
            </button>
          ))}
          <a href={`/api/admin?pin=${encodeURIComponent(pin)}&acao=csv`}
            className="text-[13px] font-bold px-4 py-2 rounded-full bg-white/8 text-sub2">📥 CSV</a>
        </div>

        {tab === "dash" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { l: "Usuárias", v: m.total ?? 0 },
              { l: "Ativas hoje", v: m.ativasHoje ?? 0 },
              { l: "Check-ins hoje", v: m.checkinsHoje ?? 0 },
              { l: "Compradoras", v: m.compradoras ?? 0 },
              { l: "% preparou receita", v: (m.pctPreparou ?? 0) + "%" },
              { l: "% chegou dia 7", v: (m.pctDia7 ?? 0) + "%" },
              { l: "Fase 2 liberadas", v: m.fase2Liberadas ?? 0 },
            ].map((x, i) => (
              <div key={i} className="card p-4 text-center">
                <div className="text-[22px] font-black text-gold">{x.v}</div>
                <div className="text-[11px] text-sub font-bold mt-1">{x.l}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "lista" && (
          <>
            <input placeholder="🔍 Buscar por nome ou email..." value={busca} onChange={(e) => setBusca(e.target.value)}
              className="w-full px-4 py-3 mt-4 text-[14px] font-semibold" />
            <div className="mt-3 space-y-2">
              {usuarias.length === 0 && <div className="card p-5 text-sub text-[13.5px] font-semibold text-center">Nenhuma usuária ainda. Assim que alguém fizer o onboarding, aparece aqui. 💛</div>}
              {usuarias.map((u) => (
                <button key={u.id} onClick={() => abrirDetalhe(u.id)} className="card w-full p-4 text-left flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[14.5px] font-extrabold">
                      {u.inativa ? "🔴" : "🟢"} {u.nome} <span className="text-sub font-semibold text-[12px]">{u.email}</span>
                    </div>
                    <div className="text-[12px] text-sub2 font-semibold mt-1">
                      Dia {u.dia} · Fase {u.fase} · {u.checkins} check-ins · ⭐ {u.pontos}
                      {u.pesoInicial != null && u.pesoAtual != null && ` · ${u.pesoInicial}→${u.pesoAtual}kg (Δ ${(u.pesoInicial - u.pesoAtual).toFixed(1)})`}
                    </div>
                  </div>
                  <span className="text-sub">→</span>
                </button>
              ))}
            </div>
          </>
        )}

        {tab === "detalhe" && detalhe?.perfil && (
          <>
            <button onClick={() => setTab("lista")} className="text-[13px] font-bold text-sub mt-4">← Voltar à lista</button>
            <Section title={`👤 ${detalhe.perfil.nome}`}>
              <div className="grid grid-cols-2 gap-y-2 text-[13.5px] font-semibold text-sub2">
                <div>Email:</div><div className="text-txt break-all">{detalhe.perfil.email || "—"}</div>
                <div>Peso inicial → meta:</div><div className="text-txt">{detalhe.perfil.peso_inicial} → {detalhe.perfil.peso_meta} kg</div>
                <div>Dificuldade:</div><div className="text-txt">{detalhe.perfil.perfil_dificuldade || "—"}</div>
                <div>Refluxo / cafeína:</div><div className="text-txt">{detalhe.perfil.refluxo ? "sim" : "não"} / {detalhe.perfil.sensivel_cafeina ? "sim" : "não"}</div>
                <div>Preparou receita:</div><div className="text-txt">{detalhe.perfil.receita_preparada_em?.slice(0, 10) || "ainda não"}</div>
                <div>Fase 2:</div><div className="text-txt">{detalhe.perfil.fase2_liberada_em ? "liberada" : "bloqueada"} · {detalhe.perfil.fase2_paga ? "PAGA" : "não paga"}</div>
                <div>Pontos:</div><div className="text-txt">⭐ {detalhe.perfil.pontos || 0}</div>
                <div>Conquistas:</div><div className="text-txt">{(detalhe.conquistas || []).map((c) => c.tipo).join(", ") || "—"}</div>
              </div>
            </Section>

            <Section title="⚡ Ações">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => acao("liberar_fase2")} className="opt-btn py-2.5 text-[12.5px] font-bold">🔓 Liberar Fase 2</button>
                <button onClick={() => acao("bloquear_fase2")} className="opt-btn py-2.5 text-[12.5px] font-bold">🔒 Bloquear Fase 2</button>
                <button onClick={() => acao("marcar_fase2_paga")} className="opt-btn py-2.5 text-[12.5px] font-bold">💰 Fase 2 paga</button>
                <button onClick={() => acao("liberar_fase3")} className="opt-btn py-2.5 text-[12.5px] font-bold">🔓 Liberar Fase 3</button>
                <button onClick={() => { const d = prompt("Preparo há quantos dias?", "3"); if (d != null) acao("ajustar_dia", { dias: parseInt(d, 10) || 0 }); }}
                  className="opt-btn py-2.5 text-[12.5px] font-bold col-span-2">📅 Ajustar dia do protocolo</button>
              </div>
            </Section>

            <Section title={`📋 Check-ins (${(detalhe.checkins || []).length})`}>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {(detalhe.checkins || []).map((c) => (
                  <div key={c.data} className="flex justify-between text-[12.5px] font-semibold bg-white/[.04] rounded-xl px-3 py-2">
                    <span className="text-sub2">{c.data}</span>
                    <span>sono {c.sono_qualidade}/5 · {c.horas_sono}h · {c.acordou_madrugada ? "acordou" : "direto"} · {c.peso ? c.peso + "kg" : "s/ peso"}</span>
                  </div>
                ))}
                {!(detalhe.checkins || []).length && <div className="text-sub text-[13px] font-semibold">Nenhum ainda.</div>}
              </div>
            </Section>

            <Section title="📝 Notas internas">
              {(detalhe.notas || []).map((n) => (
                <div key={n.id} className="text-[13px] font-semibold text-sub2 bg-white/[.04] rounded-xl px-3 py-2 mb-2">
                  <span className="text-sub text-[11px]">{n.criado_em?.slice(0, 10)}</span> — {n.texto}
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nova nota..."
                  className="flex-1 px-3 py-2.5 text-[13.5px] font-semibold" />
                <button onClick={() => { if (nota.trim()) { acao("nota", { texto: nota.trim() }); setNota(""); } }}
                  className="cta-gold px-4 text-[13.5px]">+</button>
              </div>
            </Section>
          </>
        )}

        {tab === "acesso" && (
          <Section title="🔑 Liberar acesso manual (email de compradora)">
            <p className="text-sub text-[12.5px] font-semibold mb-3 leading-relaxed">
              A Cakto libera automaticamente pelo webhook. Use aqui apenas para liberar alguém manualmente
              (ex: compra por outro canal, suporte). Quando o gate de compra estiver ativado (GATE_BY_PURCHASE=true),
              só emails desta lista conseguem entrar no app.
            </p>
            <div className="flex gap-2">
              <input type="email" value={emailNova} onChange={(e) => setEmailNova(e.target.value)} placeholder="email@dacliente.com"
                className="flex-1 px-3 py-2.5 text-[13.5px] font-semibold" />
              <button onClick={() => { if (emailNova.includes("@")) { acao("add_compradora", { email: emailNova }); setEmailNova(""); } }}
                className="cta-gold px-4 text-[13.5px]">Liberar</button>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
