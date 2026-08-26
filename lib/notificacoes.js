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
const KEY_TIMER_CHECKIN = "__noctalev_lembrete_checkin_timer";

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

async function mostrarNotificacao(titulo, corpo, url = "/ritual", tag = "noctalev-ritual") {
  if (statusPermissao() !== "granted") return;
  const opts = {
    body: corpo,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag,
    renotify: false,
    data: { url },
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

// Agenda (ou reagenda) os lembretes diários. Chame na abertura do app
// e sempre que a hora do lembrete mudar nas configurações.
export function agendarLembretes() {
  if (typeof window === "undefined") return;
  if (statusPermissao() !== "granted") return;

  // limpa timers anteriores
  if (window[KEY_TIMER]) { clearTimeout(window[KEY_TIMER]); window[KEY_TIMER] = null; }
  if (window[KEY_TIMER_CHECKIN]) { clearTimeout(window[KEY_TIMER_CHECKIN]); window[KEY_TIMER_CHECKIN] = null; }

  const s = load();
  if (!s.perfil) return;
  const horaRitual = s.config?.lembreteRitual || "21:30";
  const horaCheckin = s.config?.lembreteCheckin || "08:30";
  const preparou = !!s.receitaPreparadaEm;

  // Lembrete da noite: ritual (gotas)
  function agendarRitual() {
    const espera = msAte(horaRitual);
    window[KEY_TIMER] = setTimeout(() => {
      const st = load();
      const hoje = hojeSP();
      // só notifica se ainda não fez o ritual hoje
      if (st.receitaPreparadaEm && !st.rituais[hoje]) {
        const nome = st.perfil?.nome ? `, ${st.perfil.nome}` : "";
        mostrarNotificacao(
          "🌙 Hora do seu ritual noturno" + nome,
          "Suas gotas + luz baixa. Leva 3 minutinhos e vale +5 pontos ⭐"
        );
      }
      agendarRitual(); // reagenda para o dia seguinte
    }, espera);
  }
  agendarRitual();

  // Lembrete da manhã: check-in ("Como foi sua noite?") — só após preparar a receita
  if (preparou) {
    function agendarCheckin() {
      const espera = msAte(horaCheckin);
      window[KEY_TIMER_CHECKIN] = setTimeout(() => {
        const st = load();
        const hoje = hojeSP();
        if (st.receitaPreparadaEm && !st.checkins[hoje]) {
          const nome = st.perfil?.nome ? `, ${st.perfil.nome}` : "";
          mostrarNotificacao(
            "☀️ Como foi sua noite" + nome + "?",
            "Registre seu sono em poucos toques e ganhe +10 pontos ⭐",
            "/checkin",
            "noctalev-checkin"
          );
        }
        agendarCheckin();
      }, espera);
    }
    agendarCheckin();
  }
}

// Notificação de teste imediata (usada na tela de configurações)
export async function notificarTeste() {
  await mostrarNotificacao("🌙 NoctaLev", "Prontinho! Seus lembretes estão ativados. 💛");
}
