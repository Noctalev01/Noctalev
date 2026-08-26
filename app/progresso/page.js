"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell, Logo } from "../../components/ui";
import { load, save, salvarFotoAntes, pesosOrdenados, calcStreak, CONQUISTAS, SONO_OPTS, hojeSP, pesoPerdido } from "../../lib/store";
import { comprimirFoto } from "../../lib/foto";
import { syncNow } from "../../lib/sync";

const LBL = { 1: "Péssimo", 2: "Ruim", 3: "Regular", 4: "Bom", 5: "Excelente" };

function GraficoPeso({ pesos, meta }) {
  if (pesos.length < 2)
    return (
      <div className="text-sub text-[13px] font-semibold text-center py-8 leading-relaxed">
        Registre seu peso nos check-ins<br />para ver sua curva de evolução
      </div>
    );
  const w = 330, h = 170, padX = 34, padY = 22;
  const vals = pesos.map((p) => p.peso);
  // inclui a meta na escala (se estiver próxima) para a linha aparecer
  const metaVisivel = meta != null && meta > Math.min(...vals) - 8;
  const lo = Math.min(...vals, metaVisivel ? meta : Infinity);
  const hi = Math.max(...vals);
  const range = hi - lo || 1;
  const X = (i) => padX + (i * (w - padX - 10)) / (vals.length - 1);
  const Y = (v) => padY + ((hi - v) / range) * (h - padY * 2);
  const pts = vals.map((v, i) => [X(i), Y(v)]);
  const linha = pts.map((p) => p.join(",")).join(" ");
  const area = `${padX},${h - padY} ${linha} ${pts[pts.length - 1][0]},${h - padY}`;
  const fmt = (d) => `${d.slice(8)}/${d.slice(5, 7)}`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="gpFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ee8b2" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#7ee8b2" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* linhas-guia */}
      {[hi, (hi + lo) / 2, lo].map((v, i) => (
        <g key={i}>
          <line x1={padX} y1={Y(v)} x2={w - 10} y2={Y(v)} stroke="rgba(255,255,255,.07)" strokeWidth="1" />
          <text x={padX - 6} y={Y(v) + 4} fill="#8f97c0" fontSize="10.5" fontWeight="700" textAnchor="end">{v.toFixed(1)}</text>
        </g>
      ))}
      {/* linha da meta */}
      {metaVisivel && meta >= lo && meta <= hi && (
        <g>
          <line x1={padX} y1={Y(meta)} x2={w - 10} y2={Y(meta)} stroke="#fbd38d" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7" />
          <text x={w - 12} y={Y(meta) - 5} fill="#fbd38d" fontSize="10" fontWeight="800" textAnchor="end">meta 🎯</text>
        </g>
      )}
      <polygon points={area} fill="url(#gpFill)" />
      <polyline points={linha} fill="none" stroke="#7ee8b2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 5.5 : 3.5}
          fill={i === pts.length - 1 ? "#fbd38d" : "#7ee8b2"} stroke="#10142c" strokeWidth={i === pts.length - 1 ? 2 : 0} />
      ))}
      {/* datas do primeiro e último ponto */}
      <text x={pts[0][0]} y={h - 4} fill="#8f97c0" fontSize="10" fontWeight="700" textAnchor="start">{fmt(pesos[0].data)}</text>
      <text x={pts[pts.length - 1][0]} y={h - 4} fill="#fbd38d" fontSize="10" fontWeight="800" textAnchor="end">{fmt(pesos[pesos.length - 1].data)}</text>
    </svg>
  );
}

function HeatmapSono({ checkins }) {
  const arr = Object.entries(checkins).sort((a, b) => a[0].localeCompare(b[0])).slice(-14);
  if (!arr.length)
    return <div className="text-sub text-[13px] font-semibold text-center py-6">Seus check-ins aparecem aqui 😴</div>;
  const cores = { 1: "#e57373", 2: "#f6ad55", 3: "#fbd38d", 4: "#a5d6a7", 5: "#7ee8b2" };
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {arr.map(([data, c]) => (
        <div key={data} className="flex flex-col items-center gap-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px]"
            style={{ background: cores[c.sono] + "33", border: `1px solid ${cores[c.sono]}66` }}>
            {SONO_OPTS.find((o) => o.v === c.sono)?.emoji}
          </div>
          <span className="text-[9.5px] text-sub font-bold">{data.slice(8)}/{data.slice(5, 7)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Progresso() {
  const router = useRouter();
  const [s, setS] = useState(null);
  const [periodo, setPeriodo] = useState(30);
  const [fotoErro, setFotoErro] = useState("");

  useEffect(() => {
    const st = load();
    if (!st.perfil) { router.replace("/onboarding"); return; }
    setS(st);
  }, [router]);

  if (!s) return <div className="app-bg min-h-dvh" />;

  async function escolherFoto(e) {
    setFotoErro("");
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataURL = await comprimirFoto(file);
      const st = salvarFotoAntes(load(), dataURL);
      setS({ ...st });
      syncNow();
    } catch {
      setFotoErro("Não foi possível carregar a foto. Tente outra imagem.");
    }
    e.target.value = "";
  }

  const todos = pesosOrdenados(s);
  const corte = new Date(); corte.setDate(corte.getDate() - periodo);
  const corteISO = corte.toISOString().slice(0, 10);
  const pesos = todos.filter((p) => p.data >= corteISO);
  const streak = calcStreak(s);
  const checkinsArr = Object.entries(s.checkins).sort((a, b) => a[0].localeCompare(b[0]));

  // recorde de streak (aprox: streak atual como mínimo; calcula histórico)
  let recorde = streak, atual = 0, prev = null;
  const dias = [...new Set([...Object.keys(s.checkins), ...Object.keys(s.rituais)])].sort();
  for (const d of dias) {
    if (prev) {
      const gap = (new Date(d) - new Date(prev)) / 86400000;
      atual = gap === 1 ? atual + 1 : 1;
    } else atual = 1;
    recorde = Math.max(recorde, atual);
    prev = d;
  }

  // frase inteligente
  let fraseStatus = null;
  if (checkinsArr.length >= 4) {
    const metade = Math.floor(checkinsArr.length / 2);
    const m1 = checkinsArr.slice(0, metade).reduce((t, [, c]) => t + c.sono, 0) / metade;
    const m2 = checkinsArr.slice(metade).reduce((t, [, c]) => t + c.sono, 0) / (checkinsArr.length - metade);
    if (m2 > m1 + 0.3) {
      fraseStatus = `Sua média de sono subiu de "${LBL[Math.round(m1)]}" para "${LBL[Math.round(m2)]}" nos últimos dias — é exatamente assim que o protocolo destrava o metabolismo. 🔓`;
    } else if (m2 >= m1) {
      fraseStatus = "Seu sono está estável — a constância do ritual é o que consolida o resultado. Continue! 🌙";
    } else {
      fraseStatus = "Algumas noites mais difíceis são normais. Reforce o ritual: luz baixa + celular longe da cama.";
    }
  }

  return (
    <PageShell>
      <Logo size="text-[19px]" />
      <h1 className="text-[25px] font-extrabold tracking-tight mt-6">Seu progresso</h1>

      {fraseStatus && (
        <div className="card mt-5 p-4 border-green/30 text-[13.5px] text-sub2 font-semibold leading-relaxed">
          {fraseStatus}
        </div>
      )}

      {/* FOTO DE ANTES */}
      <div className="card mt-5 p-5">
        <div className="eyebrow">Sua foto de "antes"</div>
        {s.fotoAntes ? (
          <div className="mt-4 flex items-center gap-4">
            <img src={s.fotoAntes} alt="Foto de antes"
              className="w-[110px] h-[110px] object-cover rounded-[18px] flex-none"
              style={{ border: "2px solid rgba(251,211,141,.45)" }} />
            <div className="flex-1">
              <div className="text-[13px] text-sub2 font-semibold leading-relaxed">
                Registrada em {s.fotoAntesEm ? new Date(s.fotoAntesEm).toLocaleDateString("pt-BR") : "—"}.
                {pesoPerdido(s) > 0 && (
                  <> Você já eliminou <b className="text-green">−{pesoPerdido(s).toFixed(1).replace(".", ",")} kg</b> desde então! 🎉</>
                )}
              </div>
              <label className="inline-block mt-2.5 text-[12.5px] font-bold text-lilac cursor-pointer">
                Trocar foto
                <input type="file" accept="image/*" className="hidden" onChange={escolherFoto} />
              </label>
            </div>
          </div>
        ) : (
          <label className="mt-4 p-5 flex flex-col items-center gap-1.5 cursor-pointer rounded-2xl active:opacity-80"
            style={{ border: "1.5px dashed rgba(251,211,141,.4)", background: "rgba(251,211,141,.04)" }}>
            <span className="text-[28px]">🤳</span>
            <span className="text-[13.5px] font-extrabold text-gold">Adicionar minha foto de antes</span>
            <span className="text-[11.5px] text-sub font-semibold text-center">Privada — só você vê. Seu eu do futuro agradece!</span>
            <input type="file" accept="image/*" className="hidden" onChange={escolherFoto} />
          </label>
        )}
        {fotoErro && <div className="text-[12.5px] font-bold text-[#e57373] mt-3">{fotoErro}</div>}
      </div>

      <div className="card mt-5 p-5">
        <div className="flex justify-between items-center">
          <div className="eyebrow">Evolução do peso</div>
          <div className="flex gap-1.5">
            {[7, 14, 30].map((p) => (
              <button key={p} onClick={() => setPeriodo(p)}
                className={`text-[12px] font-bold px-3 py-1.5 rounded-full ${periodo === p ? "bg-gold text-[#3c2a10]" : "bg-white/8 text-sub"}`}>
                {p}d
              </button>
            ))}
          </div>
        </div>

        {/* resumo: quanto já foi */}
        {todos.length >= 2 && (() => {
          const primeiro = todos[0].peso;
          const ultimo = todos[todos.length - 1].peso;
          const dif = primeiro - ultimo;
          const meta = s.perfil?.pesoMeta;
          const faltam = meta != null ? Math.max(0, ultimo - meta) : null;
          return (
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(255,255,255,.04)" }}>
                <div className="text-[16px] font-black tracking-tight">{ultimo.toFixed(1)}</div>
                <div className="text-[10px] text-sub font-bold mt-0.5">peso atual</div>
              </div>
              <div className="rounded-xl p-2.5 text-center" style={{ background: dif >= 0.1 ? "rgba(126,232,178,.08)" : "rgba(255,255,255,.04)" }}>
                <div className={`text-[16px] font-black tracking-tight ${dif >= 0.1 ? "text-green" : ""}`}>
                  {dif >= 0.1 ? `−${dif.toFixed(1)}` : dif <= -0.1 ? `+${(-dif).toFixed(1)}` : "0,0"}
                </div>
                <div className="text-[10px] text-sub font-bold mt-0.5">{dif >= 0.1 ? "já eliminados 🎉" : "desde o início"}</div>
              </div>
              <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(251,211,141,.06)" }}>
                <div className="text-[16px] font-black tracking-tight text-gold">{faltam != null ? faltam.toFixed(1) : "—"}</div>
                <div className="text-[10px] text-sub font-bold mt-0.5">até a meta 🎯</div>
              </div>
            </div>
          );
        })()}

        <div className="mt-3"><GraficoPeso pesos={pesos} meta={s.perfil?.pesoMeta} /></div>

        <div className="rounded-xl p-3 mt-2" style={{ background: "rgba(165,180,252,.06)" }}>
          <div className="text-[11.5px] text-lilac font-semibold leading-relaxed">
            💡 <b>Como pesar do jeito certo:</b> sempre de manhã, em jejum, depois de ir ao banheiro, na mesma balança e com roupa leve. Pesar em horários diferentes engana o gráfico!
          </div>
        </div>
      </div>

      <div className="card mt-4 p-5">
        <div className="eyebrow">Sono — últimos 14 dias</div>
        <div className="mt-4"><HeatmapSono checkins={s.checkins} /></div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="card p-4 text-center">
          <div className="text-[24px] font-black text-gold tracking-tight">{streak}</div>
          <div className="text-[11.5px] text-sub font-bold mt-1">streak atual</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-[24px] font-black text-lilac tracking-tight">{recorde}</div>
          <div className="text-[11.5px] text-sub font-bold mt-1">recorde de noites</div>
        </div>
      </div>

      <div className="card mt-4 p-5">
        <div className="eyebrow">Conquistas</div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {Object.entries(CONQUISTAS).map(([tipo, c]) => {
            const tem = !!s.conquistas[tipo];
            return (
              <div key={tipo} className={`rounded-2xl p-3 border ${tem ? "border-gold/50 bg-gold/10" : "border-white/10 bg-white/[.03] opacity-50"}`}>
                <div className="text-[22px]">{tem ? c.emoji : "🔒"}</div>
                <div className="text-[12.5px] font-extrabold mt-1">{c.nome}</div>
                <div className="text-[10.5px] text-sub font-semibold mt-0.5">{c.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
