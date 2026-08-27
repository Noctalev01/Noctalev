"use client";
// ============================================================
// 4.5 — Relatório para levar ao médico/nutricionista.
// Gera uma página limpa (fundo branco, letra preta) com o
// histórico de peso e sono, pronta para imprimir ou salvar
// como PDF pelo próprio celular (menu Compartilhar/Imprimir).
// Nunca menciona fases internas — só os dados de saúde.
// ============================================================
import { vibrar } from "./ui";

const LBL_SONO = { 1: "Péssimo", 2: "Ruim", 3: "Regular", 4: "Bom", 5: "Excelente" };

function fmtData(iso) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function gerarHTML(s) {
  const nome = s.perfil?.nome || "";
  const checkins = Object.entries(s.checkins || {}).sort((a, b) => a[0].localeCompare(b[0]));
  const pesos = checkins.filter(([, c]) => c.peso != null).map(([data, c]) => ({ data, peso: c.peso }));
  const rituais = Object.keys(s.rituais || {}).length;
  const hoje = new Date().toLocaleDateString("pt-BR");

  const pesoIni = s.perfil?.pesoInicial;
  const pesoAtual = pesos.length ? pesos[pesos.length - 1].peso : pesoIni;
  const perdido = pesoIni != null && pesoAtual != null ? Math.max(0, pesoIni - pesoAtual) : 0;
  const mediaSono = checkins.length
    ? (checkins.reduce((t, [, c]) => t + c.sono, 0) / checkins.length).toFixed(1)
    : null;
  const mediaHoras = (() => {
    const hs = checkins.map(([, c]) => c.horas).filter((h) => h != null);
    return hs.length ? (hs.reduce((t, h) => t + h, 0) / hs.length).toFixed(1) : null;
  })();

  const linhas = checkins.slice(-45).map(([data, c]) => `
    <tr>
      <td>${fmtData(data)}</td>
      <td>${LBL_SONO[c.sono] || "—"}</td>
      <td>${c.horas != null ? c.horas + "h" : "—"}</td>
      <td>${c.acordou === false ? "Não" : c.acordou === true ? "Sim" : "—"}</td>
      <td>${c.peso != null ? String(c.peso.toFixed(1)).replace(".", ",") + " kg" : "—"}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>Relatório de Saúde — ${nome}</title>
  <style>
    body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1a1a2e; margin: 32px; }
    h1 { font-size: 21px; margin: 0; } h2 { font-size: 15px; margin: 26px 0 8px; color: #333; }
    .sub { color: #666; font-size: 12.5px; margin-top: 4px; }
    .grid { display: flex; gap: 12px; margin-top: 18px; flex-wrap: wrap; }
    .box { border: 1px solid #ddd; border-radius: 10px; padding: 12px 16px; min-width: 120px; }
    .box b { font-size: 19px; display: block; } .box span { font-size: 11px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    th { text-align: left; padding: 7px 8px; background: #f2f3f7; border-bottom: 2px solid #ddd; font-size: 11px; }
    td { padding: 6px 8px; border-bottom: 1px solid #eee; }
    .nota { font-size: 11px; color: #888; margin-top: 22px; line-height: 1.5; }
    .print-btn { position: fixed; top: 14px; right: 14px; background: #1a2044; color: #fff; border: 0;
      border-radius: 10px; padding: 12px 18px; font-size: 14px; font-weight: 700; cursor: pointer; }
    @media print { .print-btn { display: none; } body { margin: 12px; } }
  </style></head><body>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  <h1>Relatório de acompanhamento — Sono e Peso</h1>
  <div class="sub">${nome ? `Paciente: <b>${nome}</b> · ` : ""}Gerado em ${hoje} · App NoctaLev</div>
  <div class="grid">
    <div class="box"><b>${pesoIni != null ? String(pesoIni.toFixed(1)).replace(".", ",") + " kg" : "—"}</b><span>peso inicial</span></div>
    <div class="box"><b>${pesoAtual != null ? String(pesoAtual.toFixed(1)).replace(".", ",") + " kg" : "—"}</b><span>peso atual</span></div>
    <div class="box"><b>${perdido > 0 ? "−" + String(perdido.toFixed(1)).replace(".", ",") + " kg" : "0 kg"}</b><span>variação</span></div>
    <div class="box"><b>${mediaSono != null ? mediaSono.replace(".", ",") + " / 5" : "—"}</b><span>qualidade média do sono</span></div>
    <div class="box"><b>${mediaHoras != null ? mediaHoras.replace(".", ",") + "h" : "—"}</b><span>média de horas dormidas</span></div>
    <div class="box"><b>${rituais}</b><span>noites com rotina do sono</span></div>
  </div>
  <h2>Registros diários (últimos ${Math.min(checkins.length, 45)} dias)</h2>
  <table>
    <thead><tr><th>Data</th><th>Qualidade do sono</th><th>Horas</th><th>Acordou de madrugada</th><th>Peso</th></tr></thead>
    <tbody>${linhas || `<tr><td colspan="5">Sem registros ainda.</td></tr>`}</tbody>
  </table>
  <div class="nota">
    Dados registrados pela própria usuária no aplicativo NoctaLev (rotina de higiene do sono com chá de ervas —
    camomila, erva-cidreira e maracujá — e acompanhamento diário de sono e peso).
    Este relatório é informativo e não substitui avaliação profissional.
  </div>
  </body></html>`;
}

export default function RelatorioMedico({ s }) {
  function abrir() {
    vibrar(10);
    try {
      const w = window.open("", "_blank");
      if (!w) return;
      w.document.write(gerarHTML(s));
      w.document.close();
    } catch {}
  }

  return (
    <div className="card mt-4 p-5">
      <div className="eyebrow">Para sua consulta</div>
      <div className="text-[13px] text-sub2 font-semibold leading-relaxed mt-2">
        Vai ao médico ou nutricionista? Gere um <b className="text-txt">relatório limpo com seu histórico de sono e peso</b> —
        dá pra imprimir ou salvar em PDF direto do celular. 🩺
      </div>
      <button onClick={abrir} className="btn-ghost w-full py-3.5 mt-4 text-[14px] font-extrabold">
        📄 Gerar relatório para o médico
      </button>
    </div>
  );
}
