"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell, Logo } from "../../components/ui";
import { load, save, resetAll, estadoImpulsos, setImpulso, salvarFotoPerfil } from "../../lib/store";
import { comprimirFoto } from "../../lib/foto";
import { signOut, supabase } from "../../lib/supabase";
import { syncNow } from "../../lib/sync";
import { statusPermissao, pedirPermissao, agendarLembretes, notificarTeste, suportaNotificacao, ativarPush } from "../../lib/notificacoes";

export default function Config() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [nome, setNome] = useState("");
  const [meta, setMeta] = useState("");
  const [lembrete, setLembrete] = useState("21:30");
  const [lembreteManha, setLembreteManha] = useState("08:30");
  const [salvo, setSalvo] = useState(false);
  const [permNotif, setPermNotif] = useState("default");
  const [fotoErro, setFotoErro] = useState("");

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    setS(st);
    setNome(st.perfil.nome);
    setMeta(String(st.perfil.pesoMeta).replace(".", ","));
    setLembrete(st.config?.lembreteRitual || "21:30");
    setLembreteManha(st.config?.lembreteCheckin || "08:30");
    setPermNotif(statusPermissao());
  }, [router]);

  if (!s) return <div className="app-bg min-h-dvh" />;

  function salvar() {
    const st = { ...s };
    st.perfil = { ...st.perfil, nome: nome.trim() || st.perfil.nome, pesoMeta: parseFloat(String(meta).replace(",", ".")) || st.perfil.pesoMeta };
    st.config = { ...st.config, lembreteRitual: lembrete, lembreteCheckin: lembreteManha };
    setS(save(st));
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
    syncNow();
    agendarLembretes(); // reagenda com a nova hora
    atualizarPush();    // atualiza também o horário salvo na nuvem (push)
  }

  async function atualizarPush() {
    const { data } = supabase ? await supabase.auth.getSession() : { data: null };
    ativarPush(data?.session?.user?.id || null);
  }

  async function ativarNotificacoes() {
    const r = await pedirPermissao();
    setPermNotif(r);
    if (r === "granted") {
      agendarLembretes();
      await notificarTeste();
      atualizarPush(); // registra o aparelho para receber push com o app fechado
    }
  }

  async function escolherFotoPerfil(e) {
    setFotoErro("");
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataURL = await comprimirFoto(file, 300, 0.78); // avatar pequeno e leve
      const st = salvarFotoPerfil(load(), dataURL);
      setS({ ...st });
      syncNow();
    } catch {
      setFotoErro("Não foi possível carregar a foto. Tente outra imagem.");
    }
    e.target.value = "";
  }

  function removerFotoPerfil() {
    const st = salvarFotoPerfil(load(), null);
    setS({ ...st });
    syncNow();
  }

  async function sair() {
    if (confirm("Tem certeza que deseja sair?")) {
      await syncNow();      // garante que tudo está salvo na nuvem
      await signOut();      // encerra a sessão Supabase
      resetAll();           // limpa dados locais
      router.replace("/onboarding");
    }
  }

  return (
    <PageShell>
      <Logo size="text-[19px]" />
      <h1 className="text-[25px] font-extrabold tracking-tight mt-6">Ajustes</h1>

      {/* FOTO DE PERFIL */}
      <div className="card mt-5 p-5">
        <div className="eyebrow">Foto de perfil</div>
        <div className="flex items-center gap-4 mt-3">
          {s.fotoPerfil ? (
            <img src={s.fotoPerfil} alt="Sua foto" className="w-[72px] h-[72px] rounded-full object-cover flex-none"
              style={{ border: "2.5px solid #fbd38d" }} />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full flex-none flex items-center justify-center font-black text-[28px] text-[#3c2a10]"
              style={{ background: "linear-gradient(135deg,#f6ad55,#ed8936)", border: "2.5px solid #fbd38d" }}>
              {(s.perfil.nome || "?")[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <label className="cta-gold block text-center py-2.5 text-[13.5px] cursor-pointer">
              {s.fotoPerfil ? "Trocar foto" : "Adicionar foto"}
              <input type="file" accept="image/*" className="hidden" onChange={escolherFotoPerfil} />
            </label>
            {s.fotoPerfil && (
              <button onClick={removerFotoPerfil} className="block w-full text-center text-[12px] font-bold text-sub mt-2">
                Remover foto
              </button>
            )}
          </div>
        </div>
        <p className="text-[11.5px] text-sub font-semibold mt-3 leading-relaxed">
          Sua foto aparece no seu perfil e na sua posição do ranking da turma.
        </p>
        {fotoErro && <div className="text-[12.5px] font-bold text-[#e57373] mt-2">{fotoErro}</div>}
      </div>

      <div className="card mt-5 p-5 space-y-4">
        <div>
          <label className="text-[13px] font-bold text-sub">Seu nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-4 py-3 mt-1.5 text-[15px] font-bold" />
        </div>
        <div>
          <label className="text-[13px] font-bold text-sub">Meta de peso (kg)</label>
          <input inputMode="decimal" value={meta} onChange={(e) => setMeta(e.target.value)} className="w-full px-4 py-3 mt-1.5 text-[15px] font-bold" />
        </div>
        <div>
          <label className="text-[13px] font-bold text-sub">Lembrete do ritual noturno</label>
          <input type="time" value={lembrete} onChange={(e) => setLembrete(e.target.value)} className="w-full px-4 py-3 mt-1.5 text-[15px] font-bold" />
        </div>
        <div>
          <label className="text-[13px] font-bold text-sub">Lembrete do check-in da manhã</label>
          <input type="time" value={lembreteManha} onChange={(e) => setLembreteManha(e.target.value)} className="w-full px-4 py-3 mt-1.5 text-[15px] font-bold" />
        </div>
        <button onClick={salvar} className="cta-gold w-full py-3.5 text-[15px]">
          {salvo ? "Salvo! ✅" : "Salvar alterações"}
        </button>
      </div>

      {/* ACELERADORES (Impulsos Naturais) */}
      <div className="card mt-4 p-5">
        <div className="text-[15px] font-extrabold">⚡ Aceleradores diários</div>
        <div className="text-[12px] text-sub font-semibold mt-1 leading-relaxed">
          Micro-ações opcionais que turbinam seu sono e a queima de gordura. Ative, desative ou mude o horário do lembrete:
        </div>
        <div className="mt-4 space-y-4">
          {estadoImpulsos(s).map((imp) => (
            <div key={imp.id} className="flex items-center gap-3">
              <span className="text-[22px] flex-none">{imp.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-extrabold leading-tight">{imp.nome}</div>
                <div className="text-[11px] text-sub font-semibold mt-0.5">{imp.acao}</div>
              </div>
              <input type="time" value={imp.hora}
                onChange={(e) => { const st = setImpulso(load(), imp.id, { hora: e.target.value }); setS({ ...st }); syncNow(); agendarLembretes(); }}
                disabled={!imp.ativo}
                className="w-[88px] px-2 py-2 text-[13px] font-bold text-center disabled:opacity-40" />
              <button onClick={() => { const st = setImpulso(load(), imp.id, { ativo: !imp.ativo }); setS({ ...st }); syncNow(); agendarLembretes(); }}
                className="w-[46px] h-[26px] rounded-full relative transition-colors flex-none"
                style={{ background: imp.ativo ? "#7ee8b2" : "rgba(255,255,255,.15)" }}>
                <span className="absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white transition-all"
                  style={{ left: imp.ativo ? "23px" : "3px" }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* NOTIFICAÇÕES */}
      <div className="card mt-4 p-5">
        <div className="text-[15px] font-extrabold">🔔 Notificações</div>
        {!suportaNotificacao() ? (
          <div className="text-[12.5px] text-sub font-semibold mt-2 leading-relaxed">
            Seu navegador não suporta notificações. 💡 Instale o app na tela inicial (Android/Chrome) para ativá-las.
          </div>
        ) : permNotif === "granted" ? (
          <>
            <div className="text-[13px] text-green font-bold mt-2">✅ Ativadas! Você receberá o lembrete do ritual às {lembrete}.</div>
            <button onClick={() => notificarTeste()} className="opt-btn w-full py-3 mt-3 text-[13.5px] font-bold">
              Enviar notificação de teste
            </button>
          </>
        ) : permNotif === "denied" ? (
          <div className="text-[12.5px] text-sub font-semibold mt-2 leading-relaxed">
            ❌ As notificações estão bloqueadas no seu aparelho. Para reativar: configurações do navegador → Notificações → permita o NoctaLev.
          </div>
        ) : (
          <>
            <div className="text-[12.5px] text-sub2 font-semibold mt-2 leading-relaxed">
              Receba um lembrete carinhoso na hora do seu ritual noturno — quem recebe lembrete mantém o streak 🔥
            </div>
            <button onClick={ativarNotificacoes} className="cta-gold w-full py-3.5 mt-3 text-[14.5px]">
              Ativar lembretes 🔔
            </button>
          </>
        )}
      </div>

      <a href={(s.config?.suporte && !s.config.suporte.includes("5500000000000") ? s.config.suporte : "https://wa.me/5554920011946") + "?text=" + encodeURIComponent("Olá! Sou usuária do NoctaLev e preciso de ajuda. 💛")}
        target="_blank" rel="noreferrer" className="card block mt-4 p-4 text-center text-[14.5px] font-extrabold text-green">
        💬 Falar com o suporte no WhatsApp
      </a>

      <div className="card mt-4 p-4 text-[12px] text-sub font-semibold leading-relaxed">
        ⚠️ <b className="text-sub2">Aviso de segurança:</b> Este protocolo não substitui acompanhamento médico.
        Não indicado para grávidas, lactantes e crianças. Se você usa remédios de pressão, diabetes,
        ansiolíticos ou anticoagulantes, consulte seu médico. Resultados variam de pessoa para pessoa.
      </div>

      <button onClick={sair} className="w-full mt-5 py-3 text-[14px] font-bold text-[#e57373]">
        Sair da conta
      </button>
    </PageShell>
  );
}
