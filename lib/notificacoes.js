"use client";
// ============================================================
// Notificações locais do NoctaLev
// - pedirPermissao(): solicita permissão ao usuário (1x)
// - agendarLembretes(): agenda o lembrete do ritual noturno para
//   a hora configurada (config.lembreteRitual) usando timers no
//   app aberto + notificação via Service Worker quando possível
// - Estratégia: enquanto o app/PWA estiver aberto (mesmo em 2º
//   plano no Android), o timer dispara a notificação do sistema.
// ============================================================
import { load, hojeSP } from "./store";

const KEY_TIMER = "__noctalev_lembrete_timer";

export function suportaNotificacao() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function statusPermissao() {
  if (!suportaNotificacao()) return "unsupported";
  return Notification.permission; // "default" | "granted" | "denied"
}

export async function pedirPermissao() {
  if (!suportaNotificacao()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    const r = await Notification.requestPermission();
    return r;
  } catch { return "denied"; }
}

async function mostrarNotificacao(titulo, corpo) {
  if (statusPermissao() !== "granted") return;
  const opts = {
    body: corpo,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "noctalev-ritual",
    renotify: false,
    data: { url: "/ritual" },
  };
  try {
    // preferir o SW (funciona melhor em PWA instalado / segundo plano)
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg?.showNotification) { await reg.showNotification(titulo, opts); return; }
  } catch {}
  try { new Notification(titulo, opts); } catch {}
}

function msAte(horaHHMM) {
  // próximo instante (hoje ou amanhã) daquela hora no fuso local do aparelho
  const [h, m] = String(horaHHMM || "21:30").split(":").map(Number);
  const agora = new Date();
  const alvo = new Date(agora);
  alvo.setHours(h, m, 0, 0);
  if (alvo <= agora) alvo.setDate(alvo.getDate() + 1);
  return alvo - agora;
}

// Agenda (ou reagenda) o lembrete do ritual. Chame na abertura do app
// e sempre que a hora do lembrete mudar nas configurações.
export function agendarLembretes() {
  if (typeof window === "undefined") return;
  if (statusPermissao() !== "granted") return;

  // limpa timer anterior
  if (window[KEY_TIMER]) { clearTimeout(window[KEY_TIMER]); window[KEY_TIMER] = null; }

  const s = load();
  if (!s.perfil) return;
  const hora = s.config?.lembreteRitual || "21:30";

  function agendar() {
    const espera = msAte(hora);
    window[KEY_TIMER] = setTimeout(() => {
      const st = load();
      const hoje = hojeSP();
      // só notifica se ainda não fez o ritual hoje
      if (!st.rituais[hoje]) {
        const nome = st.perfil?.nome ? `, ${st.perfil.nome}` : "";
        mostrarNotificacao(
          "🌙 Hora do seu ritual noturno" + nome,
          "Suas gotas + luz baixa. Leva 3 minutinhos e vale +5 pontos ⭐"
        );
      }
      agendar(); // reagenda para o dia seguinte
    }, espera);
  }
  agendar();
}

// Notificação de teste imediata (usada na tela de configurações)
export async function notificarTeste() {
  await mostrarNotificacao("🌙 NoctaLev", "Prontinho! Seus lembretes estão ativados. 💛");
}
