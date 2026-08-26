"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stars, Logo } from "../../components/ui";
import { load, salvarPerfil } from "../../lib/store";
import { supabase } from "../../lib/supabase";
import { pullFromCloud, pushProfile } from "../../lib/sync";

const SLIDES = [
  { emoji: "🌙", titulo: "Seu protocolo começa hoje", texto: "O NoctaLev usa o poder do seu sono para destravar o emagrecimento. Simples, natural e no seu ritmo." },
  { emoji: "🧪", titulo: "Prepare suas gotas uma única vez", texto: "Uma receita caseira de 10 minutos, com ingredientes de mercado. O app te guia passo a passo." },
  { emoji: "📈", titulo: "Registre seu sono e peso todo dia", texto: "Em poucos toques por dia, você acompanha sua evolução e desbloqueia as próximas fases." },
];

export default function Onboarding() {
  const router = useRouter();
  const [etapa, setEtapa] = useState("login"); // login | codigo | slides | quiz | compromisso
  const [slide, setSlide] = useState(0);
  const [q, setQ] = useState(0);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [userId, setUserId] = useState(null);
  const [f, setF] = useState({ nome: "", pesoInicial: "", pesoMeta: "", dificuldade: null, refluxo: null, cafeina: null });

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  // Se já existe sessão + perfil, vai direto para a Home
  useEffect(() => {
    async function check() {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      const sess = data?.session;
      if (sess) {
        setUserId(sess.user.id);
        const puxado = await pullFromCloud(sess.user.id);
        if (puxado?.perfil) { router.replace("/"); return; }
        if (load().perfil) { router.replace("/"); return; }
        setEmail(sess.user.email || "");
        setEtapa("slides"); // logada mas sem perfil → segue onboarding
      }
    }
    check();
  }, [router]);

  async function enviarCodigo() {
    setErro("");
    const em = email.trim().toLowerCase();
    if (!em.includes("@")) { setErro("Digite um email válido."); return; }
    setEnviando(true);
    try {
      // 1) verifica se o email tem acesso (compra na Cakto)
      const r = await fetch("/api/acesso", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: em }) });
      const j = await r.json();
      if (!j.permitido) { setErro(j.motivo || "Acesso não encontrado para este email."); setEnviando(false); return; }
      // 2) envia código de 6 dígitos por email (sem senha!)
      if (supabase) {
        const { error } = await supabase.auth.signInWithOtp({ email: em, options: { shouldCreateUser: true } });
        if (error) { setErro("Não foi possível enviar o código: " + error.message); setEnviando(false); return; }
        setEtapa("codigo");
      } else {
        setEtapa("slides"); // modo protótipo sem Supabase
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    }
    setEnviando(false);
  }

  async function verificarCodigo() {
    setErro("");
    setEnviando(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: codigo.trim(), type: "email" });
      if (error || !data?.session) { setErro("Código incorreto ou expirado. Confira o email e tente de novo."); setEnviando(false); return; }
      setUserId(data.session.user.id);
      // se já tem perfil na nuvem (voltou em outro aparelho), pula onboarding
      const puxado = await pullFromCloud(data.session.user.id);
      if (puxado?.perfil) { router.replace("/"); return; }
      setEtapa("slides");
    } catch {
      setErro("Erro ao verificar. Tente novamente.");
    }
    setEnviando(false);
  }

  async function concluir() {
    const s = load();
    salvarPerfil(s, {
      nome: f.nome.trim(),
      email: email.trim().toLowerCase(),
      pesoInicial: parseFloat(String(f.pesoInicial).replace(",", ".")),
      pesoMeta: parseFloat(String(f.pesoMeta).replace(",", ".")),
      dificuldade: f.dificuldade,
      refluxo: f.refluxo === true,
      cafeina: f.cafeina === true,
    });
    if (userId) await pushProfile(userId); // salva na nuvem
    router.replace("/preparo");
  }

  return (
    <div className="app-bg relative max-w-md mx-auto min-h-dvh overflow-x-hidden">
      <Stars />
      <div className="relative z-10 px-6 pt-12 pb-10 flex flex-col min-h-dvh">
        <Logo size="text-[26px]" />

        {etapa === "login" && (
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-[26px] font-black tracking-tight text-center">Bem-vinda! 💛</h1>
            <p className="text-sub2 text-[14.5px] font-semibold text-center mt-2 leading-relaxed">
              Digite o email usado na sua compra.<br />Você recebe um <b className="text-gold">código de 6 dígitos</b> — sem senha!
            </p>
            <div className="mt-8">
              <input type="email" inputMode="email" autoComplete="email" placeholder="Seu email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 text-[16px] font-semibold" />
            </div>
            {erro && <div className="card p-3 mt-4 text-[13px] font-bold text-[#e57373] leading-relaxed">{erro}</div>}
            <button disabled={!email.includes("@") || enviando}
              onClick={enviarCodigo}
              className="cta-gold w-full py-4 mt-6 text-[16px] disabled:opacity-40">
              {enviando ? "Enviando código..." : "Receber meu código 📩"}
            </button>
            <p className="text-sub text-[12px] font-semibold text-center mt-4">
              O código chega em segundos. Confira também a caixa de spam.
            </p>
          </div>
        )}

        {etapa === "codigo" && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-[56px] text-center anim-float">📩</div>
            <h1 className="text-[24px] font-black tracking-tight text-center mt-4">Digite o código</h1>
            <p className="text-sub2 text-[14px] font-semibold text-center mt-2 leading-relaxed">
              Enviamos 6 dígitos para<br /><b className="text-gold">{email}</b>
            </p>
            <input inputMode="numeric" maxLength={6} placeholder="• • • • • •" value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-5 mt-7 text-[30px] font-black text-center tracking-[10px]" autoFocus />
            {erro && <div className="card p-3 mt-4 text-[13px] font-bold text-[#e57373] leading-relaxed">{erro}</div>}
            <button disabled={codigo.length !== 6 || enviando} onClick={verificarCodigo}
              className="cta-gold w-full py-4 mt-6 text-[16px] disabled:opacity-40">
              {enviando ? "Verificando..." : "Entrar ✨"}
            </button>
            <button onClick={() => { setCodigo(""); setEtapa("login"); }} className="mt-4 text-[13px] font-bold text-sub text-center">
              Trocar email ou reenviar código
            </button>
          </div>
        )}

        {etapa === "slides" && (
          <div className="flex-1 flex flex-col justify-center text-center">
            <div className="text-[72px] anim-float">{SLIDES[slide].emoji}</div>
            <h1 className="text-[26px] font-black tracking-tight mt-6">{SLIDES[slide].titulo}</h1>
            <p className="text-sub2 text-[15px] font-semibold mt-3 leading-relaxed px-2">{SLIDES[slide].texto}</p>
            <div className="flex justify-center gap-2 mt-8">
              {SLIDES.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all ${i === slide ? "w-6 bg-gold" : "w-2 bg-white/20"}`} />
              ))}
            </div>
            <button onClick={() => (slide < 2 ? setSlide(slide + 1) : setEtapa("quiz"))}
              className="cta-gold w-full py-4 mt-10 text-[16px]">
              {slide < 2 ? "Continuar" : "Vamos começar!"}
            </button>
          </div>
        )}

        {etapa === "quiz" && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex gap-1.5 mb-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= q ? "bg-gold" : "bg-white/15"}`} />
              ))}
            </div>

            {q === 0 && (
              <>
                <h2 className="text-[24px] font-black tracking-tight">Como você quer ser chamada?</h2>
                <input autoFocus placeholder="Seu primeiro nome" value={f.nome} onChange={(e) => set("nome", e.target.value)}
                  className="w-full px-4 py-4 mt-6 text-[18px] font-bold" />
                <button disabled={f.nome.trim().length < 2} onClick={() => setQ(1)}
                  className="cta-gold w-full py-4 mt-6 text-[16px] disabled:opacity-40">Continuar</button>
              </>
            )}

            {q === 1 && (
              <>
                <h2 className="text-[24px] font-black tracking-tight">Qual seu peso atual?</h2>
                <p className="text-sub text-[13.5px] font-semibold mt-2">Será o ponto de partida do seu gráfico 📉</p>
                <div className="flex items-center gap-3 mt-6">
                  <input inputMode="decimal" placeholder="Ex: 78,5" value={f.pesoInicial} onChange={(e) => set("pesoInicial", e.target.value)}
                    className="flex-1 px-4 py-4 text-[22px] font-black text-center" />
                  <span className="text-[20px] font-extrabold text-sub2">kg</span>
                </div>
                <button disabled={!parseFloat(String(f.pesoInicial).replace(",", "."))} onClick={() => setQ(2)}
                  className="cta-gold w-full py-4 mt-6 text-[16px] disabled:opacity-40">Continuar</button>
              </>
            )}

            {q === 2 && (
              <>
                <h2 className="text-[24px] font-black tracking-tight">Qual sua meta de peso?</h2>
                <p className="text-sub text-[13.5px] font-semibold mt-2">Vamos caminhar juntas até lá 💪</p>
                <div className="flex items-center gap-3 mt-6">
                  <input inputMode="decimal" placeholder="Ex: 68" value={f.pesoMeta} onChange={(e) => set("pesoMeta", e.target.value)}
                    className="flex-1 px-4 py-4 text-[22px] font-black text-center" />
                  <span className="text-[20px] font-extrabold text-sub2">kg</span>
                </div>
                <button disabled={!parseFloat(String(f.pesoMeta).replace(",", "."))} onClick={() => setQ(3)}
                  className="cta-gold w-full py-4 mt-6 text-[16px] disabled:opacity-40">Continuar</button>
              </>
            )}

            {q === 3 && (
              <>
                <h2 className="text-[24px] font-black tracking-tight">Qual sua principal dificuldade hoje?</h2>
                <p className="text-sub text-[13.5px] font-semibold mt-2">Sua receita será ajustada para isso ✨</p>
                <div className="space-y-3 mt-6">
                  {[
                    { v: "ansiedade", e: "🧠", t: "Não desligo à noite (ansiedade)" },
                    { v: "madrugada", e: "🌒", t: "Acordo de madrugada" },
                    { v: "fome_tarde", e: "🍩", t: "Fome descontrolada à tarde" },
                    { v: "inchaco", e: "💧", t: "Inchaço / retenção" },
                  ].map((o) => (
                    <button key={o.v} onClick={() => { set("dificuldade", o.v); setQ(4); }}
                      className={`opt-btn w-full p-4 text-left text-[15px] font-bold flex items-center gap-3 ${f.dificuldade === o.v ? "on" : ""}`}>
                      <span className="text-[22px]">{o.e}</span> {o.t}
                    </button>
                  ))}
                </div>
              </>
            )}

            {q === 4 && (
              <>
                <h2 className="text-[24px] font-black tracking-tight">Duas últimas perguntinhas 💛</h2>
                <div className="mt-6">
                  <div className="text-[15px] font-bold">Você tem refluxo ou gastrite?</div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[{ v: true, t: "Sim" }, { v: false, t: "Não" }].map((o) => (
                      <button key={String(o.v)} onClick={() => set("refluxo", o.v)}
                        className={`opt-btn py-3.5 text-[15px] font-bold ${f.refluxo === o.v ? "on" : ""}`}>{o.t}</button>
                    ))}
                  </div>
                </div>
                <div className="mt-6">
                  <div className="text-[15px] font-bold">É sensível a cafeína?</div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[{ v: true, t: "Sim" }, { v: false, t: "Não" }].map((o) => (
                      <button key={String(o.v)} onClick={() => set("cafeina", o.v)}
                        className={`opt-btn py-3.5 text-[15px] font-bold ${f.cafeina === o.v ? "on" : ""}`}>{o.t}</button>
                    ))}
                  </div>
                </div>
                <button disabled={f.refluxo === null || f.cafeina === null} onClick={() => setEtapa("compromisso")}
                  className="cta-gold w-full py-4 mt-8 text-[16px] disabled:opacity-40">Finalizar</button>
              </>
            )}
          </div>
        )}

        {etapa === "compromisso" && (
          <div className="flex-1 flex flex-col justify-center text-center">
            <div className="text-[72px] anim-pop">🧪</div>
            <h1 className="text-[26px] font-black tracking-tight mt-6">
              {f.nome}, seu primeiro passo:
            </h1>
            <p className="text-[18px] font-extrabold text-gold mt-2">preparar suas gotas.</p>
            <p className="text-sub2 text-[15px] font-semibold mt-4 leading-relaxed px-2">
              Leva só 10 minutos, com ingredientes simples de mercado. O app te acompanha em cada passo.
            </p>
            <div className="card p-4 mt-6 text-[12.5px] text-sub font-semibold leading-relaxed text-left">
              ⚠️ Este protocolo não substitui acompanhamento médico. Não indicado para grávidas, lactantes e crianças.
              Se você usa remédios de pressão, diabetes, ansiolíticos ou anticoagulantes, consulte seu médico.
              Resultados variam de pessoa para pessoa.
            </div>
            <button onClick={concluir} className="cta-gold w-full py-4 mt-6 text-[16px]">
              Ver minha receita 🌿
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
