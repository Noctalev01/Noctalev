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

// mensagens prontas de WhatsApp (personalizadas com os dados da cliente)
function msgWhats(tipo, u) {
  const nome = (u.nome || "").split(" ")[0] || "";
  const kg = u.kgPerdidos > 0 ? String(u.kgPerdidos).replace(".", ",") : null;
  if (tipo === "resgate")
    return `Oi ${nome}! Aqui é do NoctaLev 💛 Senti sua falta no ritual noturno! ${kg ? `Você já tinha eliminado ${kg}kg — ` : ""}que tal retomar hoje à noite? Seu chá leva 5 minutinhos e sua sequência te espera. Qualquer dúvida estou aqui! 🌙`;
  if (tipo === "vendaF2")
    return `${nome}, notícia boa! 🎉 Seu corpo respondeu tão bem ao protocolo${kg ? ` (já foram ${kg}kg!)` : ""} que a sua Fase 2 — o Shot Termo-Metabólico — já está LIBERADA no app. É a etapa que acelera a queima. Abre lá e confere 👀🌙`;
  if (tipo === "incentivo")
    return `Oi ${nome}! 💛 Você está indo MUITO bem no protocolo${kg ? ` — ${kg}kg já eliminados!` : "!"} Continue com o ritual e os check-ins que uma surpresa boa está chegando no seu app... 👀✨`;
  if (tipo === "ativacao")
    return `Oi${nome ? " " + nome : ""}! Aqui é do NoctaLev 💛 Vi que você garantiu seu Protocolo Noturno mas ainda não entrou no app! É só acessar https://noctalev.vercel.app e entrar com este mesmo email da compra. Seu primeiro chá pode ser hoje à noite — me chama se precisar de ajuda! 🌙`;
  if (tipo === "vendaF3")
    return `${nome}, você é uma das nossas melhores alunas! 👑 ${kg ? `${kg}kg eliminados e contando... ` : ""}A próxima etapa da sua transformação já está disponível — dá uma olhada no app! 🌙✨`;
  return "";
}

function linkWhats(telefone, msg) {
  const base = telefone ? `https://wa.me/${telefone.replace(/\D/g, "")}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(msg)}`;
}

function BtnWhats({ telefone, msg, rotulo = "WhatsApp" }) {
  return (
    <a href={linkWhats(telefone, msg)} target="_blank" rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="flex-none text-[11.5px] font-extrabold px-3 py-2 rounded-full"
      style={{ background: "rgba(37,211,102,.14)", border: "1px solid rgba(37,211,102,.45)", color: "#25d366" }}>
      💬 {rotulo}
    </a>
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
  const [cfg, setCfg] = useState(null); // configurações globais (progressão/checkout/suporte)

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

  async function carregarConfig() {
    const r = await fetch(`/api/admin?pin=${encodeURIComponent(pin)}&acao=config`);
    const j = await r.json();
    const c = j.config || {};
    setCfg({
      diasInternos: c.progressao?.diasInternos ?? 7,
      minCheckins: c.progressao?.minCheckins ?? 4,
      maxDias: c.progressao?.maxDias ?? 14,
      checkoutFase2: c.checkout?.fase2 || "",
      checkoutFase3: c.checkout?.fase3 || "",
      whatsapp: c.suporte?.whatsapp || "",
      impulsos: Array.isArray(c.impulsos?.def) && c.impulsos.def.length ? c.impulsos.def : [
        { id: "kiwi", emoji: "🥝", nome: "Kiwi da Noite", acao: "Comer 2 kiwis", base: "deitar", offsetMin: -60, notif: "🥝 Hora do seu Kiwi da Noite! 2 kiwis agora = sono mais profundo e metabolismo queimando enquanto você dorme.", copy: "" },
        { id: "banana", emoji: "🍌", nome: "Banana no Jantar", acao: "1 banana na última refeição", base: "jantar", offsetMin: 0, notif: "🍌 Lembrete do jantar: inclua 1 banana. Magnésio + triptofano relaxam o corpo e cortam a vontade de doce depois do jantar.", copy: "" },
        { id: "banho", emoji: "🛁", nome: "Banho Morno", acao: "10 min relaxante", base: "deitar", offsetMin: -90, notif: "🛁 Seu banho morno de hoje: 10 minutinhos agora preparam seu corpo para a noite mais funda — e é no sono fundo que a gordura queima.", copy: "" },
      ],
    });
  }

  async function salvarConfig() {
    await acao("salvar_config", {
      config: {
        progressao: { diasInternos: Number(cfg.diasInternos) || 7, minCheckins: Number(cfg.minCheckins) || 4, maxDias: Number(cfg.maxDias) || 14 },
        checkout: { fase2: cfg.checkoutFase2.trim(), fase3: cfg.checkoutFase3.trim() },
        suporte: { whatsapp: cfg.whatsapp.trim() },
        impulsos: { def: cfg.impulsos },
      },
    });
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
    { id: "compradoras", t: `🛒 Compradoras${m.nuncaAcessou ? ` (${m.nuncaAcessou}!)` : ""}` },
    { id: "risco", t: `🚨 Risco${m.emRisco ? ` (${m.emRisco})` : ""}` },
    { id: "vendas", t: `💰 Vendas${m.oportunidadesF2 ? ` (${m.oportunidadesF2})` : ""}` },
    { id: "lista", t: "👥 Usuárias" },
    { id: "acesso", t: "🔑 Acessos" },
    { id: "config", t: "⚙️ Config" },
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
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === "config" && !cfg) carregarConfig(); }}
              className={`text-[13px] font-bold px-4 py-2 rounded-full ${tab === t.id ? "bg-gold text-[#3c2a10]" : "bg-white/8 text-sub2"}`}>
              {t.t}
            </button>
          ))}
          <a href={`/api/admin?pin=${encodeURIComponent(pin)}&acao=csv`}
            className="text-[13px] font-bold px-4 py-2 rounded-full bg-white/8 text-sub2">📥 CSV</a>
        </div>

        {tab === "dash" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { l: "Usuárias", v: m.total ?? 0 },
                { l: "Ativas hoje", v: m.ativasHoje ?? 0 },
                { l: "Compradoras", v: m.compradoras ?? 0 },
                { l: "Nunca acessou 🚨", v: m.nuncaAcessou ?? 0, alerta: (m.nuncaAcessou ?? 0) > 0 },
                { l: "Em risco (2+ dias)", v: m.emRisco ?? 0, alerta: (m.emRisco ?? 0) > 0 },
                { l: "F2 liberada s/ pagar", v: m.oportunidadesF2 ?? 0, dinheiro: (m.oportunidadesF2 ?? 0) > 0 },
                { l: "Conversão Fase 2", v: (m.conversaoF2 ?? 0) + "%" },
                { l: "Check-ins hoje", v: m.checkinsHoje ?? 0 },
              ].map((x, i) => (
                <div key={i} className="card p-4 text-center"
                  style={x.alerta ? { borderColor: "rgba(229,115,115,.5)" } : x.dinheiro ? { borderColor: "rgba(126,232,178,.5)" } : {}}>
                  <div className={`text-[22px] font-black ${x.alerta ? "text-[#e57373]" : x.dinheiro ? "text-green" : "text-gold"}`}>{x.v}</div>
                  <div className="text-[11px] text-sub font-bold mt-1">{x.l}</div>
                </div>
              ))}
            </div>

            {/* FUNIL da jornada */}
            {dados?.funil && (
              <Section title="🔻 Funil da jornada — onde estão as clientes">
                {(() => {
                  const f = dados.funil;
                  const etapas = [
                    { l: "Cadastrou no app", v: f.cadastrou, cor: "#a5b4fc" },
                    { l: "Preparou a mistura", v: f.preparou, cor: "#a5b4fc" },
                    { l: "Chegou ao dia 3", v: f.dia3, cor: "#fbd38d" },
                    { l: "Chegou ao dia 7", v: f.dia7, cor: "#fbd38d" },
                    { l: "Fase 2 liberada", v: f.fase2Liberada, cor: "#7ee8b2" },
                    { l: "Fase 2 PAGA 💰", v: f.fase2Paga, cor: "#7ee8b2" },
                  ];
                  const max = Math.max(f.cadastrou, 1);
                  return (
                    <div className="space-y-2">
                      {etapas.map((e, i) => {
                        const ant = i > 0 ? etapas[i - 1].v : null;
                        const queda = ant != null && ant > 0 ? Math.round(((ant - e.v) / ant) * 100) : null;
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-[11.5px] font-bold">
                              <span className="text-sub2">{e.l}</span>
                              <span style={{ color: e.cor }}>{e.v}{queda != null && queda > 0 && <span className="text-[#e57373]"> · −{queda}%</span>}</span>
                            </div>
                            <div className="h-[10px] rounded-full mt-1 overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
                              <div className="h-full rounded-full" style={{ width: `${Math.max(3, (e.v / max) * 100)}%`, background: e.cor, opacity: 0.85 }} />
                            </div>
                          </div>
                        );
                      })}
                      <p className="text-[11px] text-sub font-semibold pt-1 leading-relaxed">
                        A etapa com a maior queda (−%) é onde você deve agir primeiro.
                      </p>
                    </div>
                  );
                })()}
              </Section>
            )}

            {/* ATIVIDADE 14 dias */}
            {dados?.atividade14 && (
              <Section title="📈 Check-ins por dia — últimas 2 semanas">
                {(() => {
                  const max = Math.max(...dados.atividade14.map((a) => a.n), 1);
                  return (
                    <div className="flex items-end gap-1 h-[90px]">
                      {dados.atividade14.map((a) => (
                        <div key={a.dia} className="flex-1 flex flex-col items-center justify-end h-full" title={`${a.dia}: ${a.n}`}>
                          <div className="text-[9px] text-sub font-bold">{a.n || ""}</div>
                          <div className="w-full rounded-t-[4px]"
                            style={{ height: `${Math.max(4, (a.n / max) * 62)}px`, background: a.n > 0 ? "linear-gradient(180deg,#fbd38d,#f6ad55)" : "rgba(255,255,255,.07)" }} />
                          <div className="text-[8.5px] text-sub font-bold mt-1">{a.dia.slice(8)}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </Section>
            )}
          </>
        )}

        {/* 🛒 COMPRADORAS — quem comprou × quem já acessou */}
        {tab === "compradoras" && (
          <>
            <Section title="🛒 Quem comprou × quem já entrou no app">
              <p className="text-sub text-[12px] font-semibold mb-3 leading-relaxed">
                Cruzamento automático: lista de compras (Cakto + liberações manuais) contra os perfis criados no app.
                <b className="text-txt"> Quem nunca acessou aparece primeiro</b> — cada uma delas é risco de reembolso; mande a mensagem de ativação!
              </p>
              {(dados?.compradorasStatus || []).length === 0 && (
                <div className="text-sub text-[13px] font-semibold text-center py-4">Nenhuma compradora registrada ainda.</div>
              )}
              <div className="space-y-2">
                {(dados?.compradorasStatus || []).map((c) => (
                  <div key={c.email} className="rounded-xl p-3 flex items-center justify-between gap-2"
                    style={{ background: c.acessou ? "rgba(126,232,178,.05)" : "rgba(229,115,115,.07)", border: `1px solid ${c.acessou ? "rgba(126,232,178,.25)" : "rgba(229,115,115,.4)"}` }}>
                    <div className="min-w-0">
                      <div className="text-[13px] font-extrabold truncate">
                        {c.acessou ? "✅" : "🚨"} {c.nome || c.email}
                      </div>
                      <div className="text-[11px] text-sub2 font-semibold mt-0.5 truncate">
                        {c.email}{c.telefone ? ` · 📱 ${c.telefone}` : ""}
                      </div>
                      <div className="text-[11px] font-bold mt-0.5">
                        {c.acessou
                          ? <span className="text-green">1º acesso em {c.primeiroAcesso?.slice(0, 10)} · dia {c.dia ?? "—"} do protocolo</span>
                          : <span className="text-[#e57373]">NUNCA ACESSOU O APP{c.compradaEm ? ` · comprou em ${c.compradaEm.slice(0, 10)}` : ""}</span>}
                        {c.fase2Paga && <span className="text-gold"> · F2 paga 💰</span>}
                      </div>
                    </div>
                    {!c.acessou && <BtnWhats telefone={c.telefone} msg={msgWhats("ativacao", { nome: c.nome })} rotulo="Ativar" />}
                  </div>
                ))}
              </div>
            </Section>
            <p className="text-sub text-[11px] font-semibold mt-2 leading-relaxed px-1">
              💡 Sem telefone? O botão abre o WhatsApp com a mensagem pronta — é só escolher o contato. Novas compras já chegam com nome e telefone automaticamente.
            </p>
          </>
        )}

        {/* 🚨 RISCO — sumidas há 2+ dias */}
        {tab === "risco" && (
          <Section title="🚨 Clientes em risco — sumidas há 2+ dias">
            <p className="text-sub text-[12px] font-semibold mb-3 leading-relaxed">
              Já começaram o protocolo mas pararam. Agir aqui = menos reembolso.
              O botão abre o WhatsApp com uma mensagem carinhosa pronta com o nome dela.
            </p>
            {(dados?.emRisco || []).length === 0 && (
              <div className="text-green text-[13.5px] font-bold text-center py-4">🎉 Ninguém em risco — todas ativas!</div>
            )}
            <div className="space-y-2">
              {(dados?.emRisco || []).map((u) => (
                <div key={u.id} className="rounded-xl p-3 flex items-center justify-between gap-2"
                  style={{ background: "rgba(229,115,115,.06)", border: "1px solid rgba(229,115,115,.3)" }}>
                  <button onClick={() => abrirDetalhe(u.id)} className="min-w-0 text-left flex-1">
                    <div className="text-[13px] font-extrabold truncate">
                      {u.diasSemAtividade >= 5 ? "🔴" : "🟠"} {u.nome} <span className="text-sub font-semibold text-[11px]">{u.email}</span>
                    </div>
                    <div className="text-[11px] text-sub2 font-semibold mt-0.5">
                      sumida há <b className="text-[#e57373]">{u.diasSemAtividade} dias</b> · dia {u.dia} · {u.checkins} check-ins
                      {u.kgPerdidos > 0 && ` · já perdeu ${String(u.kgPerdidos).replace(".", ",")}kg`}
                    </div>
                  </button>
                  <BtnWhats msg={msgWhats("resgate", u)} rotulo="Resgatar" />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 💰 VENDAS — pipeline de oportunidades */}
        {tab === "vendas" && (
          <>
            <Section title="💰 Prontas para comprar — Fase 2 liberada, NÃO paga">
              <p className="text-sub text-[12px] font-semibold mb-3 leading-relaxed">
                Dinheiro na mesa: elas já viram a Fase 2 liberada no app. Um empurrãozinho pessoal fecha a venda.
              </p>
              {(dados?.oportunidades?.prontasF2 || []).length === 0 && (
                <div className="text-sub text-[13px] font-semibold text-center py-3">Nenhuma agora — as próximas aparecem aqui automaticamente.</div>
              )}
              <div className="space-y-2">
                {(dados?.oportunidades?.prontasF2 || []).map((u) => (
                  <div key={u.id} className="rounded-xl p-3 flex items-center justify-between gap-2"
                    style={{ background: "rgba(126,232,178,.06)", border: "1px solid rgba(126,232,178,.35)" }}>
                    <button onClick={() => abrirDetalhe(u.id)} className="min-w-0 text-left flex-1">
                      <div className="text-[13px] font-extrabold truncate">💎 {u.nome} <span className="text-sub font-semibold text-[11px]">{u.email}</span></div>
                      <div className="text-[11px] text-sub2 font-semibold mt-0.5">
                        dia {u.dia} · {u.kgPerdidos > 0 ? `−${String(u.kgPerdidos).replace(".", ",")}kg · ` : ""}
                        {u.diasSemAtividade <= 1 ? "ativa hoje 🔥" : `vista há ${u.diasSemAtividade}d`}
                      </div>
                    </button>
                    <BtnWhats msg={msgWhats("vendaF2", u)} rotulo="Oferecer" />
                  </div>
                ))}
              </div>
            </Section>

            <Section title="✨ Quase lá — dia 5+, engajadas, Fase 2 a caminho">
              {(dados?.oportunidades?.quaseLa || []).length === 0 && (
                <div className="text-sub text-[13px] font-semibold text-center py-3">Nenhuma no momento.</div>
              )}
              <div className="space-y-2">
                {(dados?.oportunidades?.quaseLa || []).map((u) => (
                  <div key={u.id} className="rounded-xl p-3 flex items-center justify-between gap-2 bg-white/[.03]"
                    style={{ border: "1px solid rgba(251,211,141,.25)" }}>
                    <button onClick={() => abrirDetalhe(u.id)} className="min-w-0 text-left flex-1">
                      <div className="text-[13px] font-extrabold truncate">🌟 {u.nome}</div>
                      <div className="text-[11px] text-sub2 font-semibold mt-0.5">dia {u.dia} · {u.checkins} check-ins{u.kgPerdidos > 0 ? ` · −${String(u.kgPerdidos).replace(".", ",")}kg` : ""}</div>
                    </button>
                    <BtnWhats msg={msgWhats("incentivo", u)} rotulo="Incentivar" />
                  </div>
                ))}
              </div>
            </Section>

            <Section title="👑 Candidatas à Fase 3 — já pagaram a Fase 2">
              {(dados?.oportunidades?.candidatasF3 || []).length === 0 && (
                <div className="text-sub text-[13px] font-semibold text-center py-3">Nenhuma ainda — quem pagar a Fase 2 aparece aqui.</div>
              )}
              <div className="space-y-2">
                {(dados?.oportunidades?.candidatasF3 || []).map((u) => (
                  <div key={u.id} className="rounded-xl p-3 flex items-center justify-between gap-2 bg-white/[.03]"
                    style={{ border: "1px solid rgba(165,180,252,.3)" }}>
                    <button onClick={() => abrirDetalhe(u.id)} className="min-w-0 text-left flex-1">
                      <div className="text-[13px] font-extrabold truncate">👑 {u.nome}</div>
                      <div className="text-[11px] text-sub2 font-semibold mt-0.5">dia {u.dia}{u.kgPerdidos > 0 ? ` · −${String(u.kgPerdidos).replace(".", ",")}kg` : ""} · {u.diasSemAtividade <= 1 ? "ativa 🔥" : `vista há ${u.diasSemAtividade}d`}</div>
                    </button>
                    <BtnWhats msg={msgWhats("vendaF3", u)} rotulo="Oferecer F3" />
                  </div>
                ))}
              </div>
            </Section>
          </>
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
                <button onClick={() => {
                  const titulo = prompt("Título da notificação:", "NoctaLev 🌙");
                  if (titulo == null) return;
                  const texto = prompt("Mensagem:", "Sentimos sua falta! Seu ritual de hoje está esperando por você 🍵");
                  if (texto == null || !texto.trim()) return;
                  acao("push", { titulo: titulo.trim() || "NoctaLev 🌙", texto: texto.trim(), url: "/" });
                }} className="opt-btn py-2.5 text-[12.5px] font-bold col-span-2" style={{ borderColor: "rgba(165,180,252,.4)" }}>🔔 Enviar notificação push</button>
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

        {tab === "config" && (
          !cfg ? (
            <div className="card p-5 mt-4 text-sub text-[13.5px] font-semibold text-center">Carregando configurações...</div>
          ) : (
            <>
              <Section title="🎯 Progressão oculta (Fase 2)">
                <p className="text-sub text-[12px] font-semibold mb-3 leading-relaxed">
                  A usuária NUNCA vê estes números — ela só vê a barra em %. Ajuste com cuidado.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11.5px] font-bold text-sub">Dias internos</label>
                    <input inputMode="numeric" value={cfg.diasInternos} onChange={(e) => setCfg({ ...cfg, diasInternos: e.target.value })}
                      className="w-full px-3 py-2.5 mt-1 text-[14px] font-bold text-center" />
                  </div>
                  <div>
                    <label className="text-[11.5px] font-bold text-sub">Mín. check-ins</label>
                    <input inputMode="numeric" value={cfg.minCheckins} onChange={(e) => setCfg({ ...cfg, minCheckins: e.target.value })}
                      className="w-full px-3 py-2.5 mt-1 text-[14px] font-bold text-center" />
                  </div>
                  <div>
                    <label className="text-[11.5px] font-bold text-sub">Máx. dias</label>
                    <input inputMode="numeric" value={cfg.maxDias} onChange={(e) => setCfg({ ...cfg, maxDias: e.target.value })}
                      className="w-full px-3 py-2.5 mt-1 text-[14px] font-bold text-center" />
                  </div>
                </div>
              </Section>

              <Section title="🛒 Links de checkout (Cakto)">
                <label className="text-[11.5px] font-bold text-sub">URL da Fase 2</label>
                <input value={cfg.checkoutFase2} onChange={(e) => setCfg({ ...cfg, checkoutFase2: e.target.value })}
                  placeholder="https://pay.cakto.com.br/..." className="w-full px-3 py-2.5 mt-1 text-[13px] font-semibold" />
                <label className="text-[11.5px] font-bold text-sub block mt-3">URL da Fase 3</label>
                <input value={cfg.checkoutFase3} onChange={(e) => setCfg({ ...cfg, checkoutFase3: e.target.value })}
                  placeholder="https://pay.cakto.com.br/..." className="w-full px-3 py-2.5 mt-1 text-[13px] font-semibold" />
              </Section>

              <Section title="💬 Suporte">
                <label className="text-[11.5px] font-bold text-sub">Link do WhatsApp</label>
                <input value={cfg.whatsapp} onChange={(e) => setCfg({ ...cfg, whatsapp: e.target.value })}
                  placeholder="https://wa.me/55..." className="w-full px-3 py-2.5 mt-1 text-[13px] font-semibold" />
              </Section>

              <Section title="⚡ Impulsos Naturais (aceleradores)">
                <p className="text-sub text-[12px] font-semibold mb-3 leading-relaxed">
                  Textos e horários padrão dos impulsos. Horário = base (jantar/deitar) + deslocamento em minutos (negativo = antes).
                </p>
                {(cfg.impulsos || []).map((imp, ix) => (
                  <div key={imp.id} className="rounded-xl p-3 mb-3" style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)" }}>
                    <div className="text-[13px] font-extrabold">{imp.emoji} {imp.nome} <span className="text-sub font-semibold">({imp.id})</span></div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="text-[10.5px] font-bold text-sub">Base do horário</label>
                        <select value={imp.base} onChange={(e) => { const n = [...cfg.impulsos]; n[ix] = { ...imp, base: e.target.value }; setCfg({ ...cfg, impulsos: n }); }}
                          className="w-full px-2 py-2 mt-1 text-[12.5px] font-bold">
                          <option value="deitar">hora de deitar</option>
                          <option value="jantar">hora do jantar</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10.5px] font-bold text-sub">Deslocamento (min)</label>
                        <input inputMode="numeric" value={imp.offsetMin} onChange={(e) => { const n = [...cfg.impulsos]; n[ix] = { ...imp, offsetMin: Number(e.target.value) || 0 }; setCfg({ ...cfg, impulsos: n }); }}
                          className="w-full px-2 py-2 mt-1 text-[12.5px] font-bold text-center" />
                      </div>
                    </div>
                    <label className="text-[10.5px] font-bold text-sub block mt-2">Texto da notificação</label>
                    <textarea value={imp.notif} rows={2} onChange={(e) => { const n = [...cfg.impulsos]; n[ix] = { ...imp, notif: e.target.value }; setCfg({ ...cfg, impulsos: n }); }}
                      className="w-full px-2 py-2 mt-1 text-[12px] font-semibold leading-relaxed" />
                  </div>
                ))}
              </Section>

              <button onClick={salvarConfig} className="cta-gold w-full py-3.5 mt-4 text-[15px]">
                Salvar configurações
              </button>
              <p className="text-sub text-[11.5px] font-semibold mt-2 text-center">
                Vale para todas as usuárias na próxima vez que abrirem o app — sem precisar de deploy.
              </p>
            </>
          )
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
