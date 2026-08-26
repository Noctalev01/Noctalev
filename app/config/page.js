"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell, Logo } from "../../components/ui";
import { load, save, resetAll } from "../../lib/store";

export default function Config() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [nome, setNome] = useState("");
  const [meta, setMeta] = useState("");
  const [lembrete, setLembrete] = useState("21:30");
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    setS(st);
    setNome(st.perfil.nome);
    setMeta(String(st.perfil.pesoMeta).replace(".", ","));
    setLembrete(st.config?.lembreteRitual || "21:30");
  }, [router]);

  if (!s) return <div className="app-bg min-h-dvh" />;

  function salvar() {
    const st = { ...s };
    st.perfil = { ...st.perfil, nome: nome.trim() || st.perfil.nome, pesoMeta: parseFloat(String(meta).replace(",", ".")) || st.perfil.pesoMeta };
    st.config = { ...st.config, lembreteRitual: lembrete };
    setS(save(st));
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  function sair() {
    if (confirm("Tem certeza que deseja sair? Seus dados locais serão apagados.")) {
      resetAll();
      router.replace("/onboarding");
    }
  }

  return (
    <PageShell>
      <Logo />
      <h1 className="text-[24px] font-extrabold tracking-tight mt-[18px]">Configurações ⚙️</h1>

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
        <button onClick={salvar} className="cta-gold w-full py-3.5 text-[15px]">
          {salvo ? "Salvo! ✅" : "Salvar alterações"}
        </button>
      </div>

      <a href={s.config?.suporte || "#"} target="_blank" rel="noreferrer" className="card block mt-4 p-4 text-center text-[14.5px] font-extrabold text-lilac">
        💬 Falar com o suporte
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
