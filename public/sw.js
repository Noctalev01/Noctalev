// NoctaLev service worker — v4 (5.4: cache inteligente)
// Estratégia por tipo de recurso:
// • Páginas (HTML): rede primeiro (sempre a versão nova), cache como reserva offline
// • JS/CSS com hash no nome: cache primeiro (imutáveis — carregamento instantâneo)
// • Imagens/ícones/fontes: cache primeiro com atualização em segundo plano
const CACHE = "noctalev-v4";
const PAGINAS = ["/", "/receita", "/ritual", "/checkin", "/progresso", "/turma", "/bonus", "/jornada", "/config"];
const ASSETS = ["/manifest.json", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll([...PAGINAS, ...ASSETS])).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

function ehImutavel(url) {
  // chunks do Next têm hash no nome — nunca mudam de conteúdo
  return url.pathname.startsWith("/_next/static/");
}

function ehPagina(req) {
  return req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // não intercepta Supabase/fonts
  if (url.pathname.startsWith("/api/")) return;    // APIs sempre direto na rede

  // 1) estáticos imutáveis: cache primeiro (instantâneo)
  if (ehImutavel(url)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
        return res;
      }))
    );
    return;
  }

  // 2) páginas: rede primeiro (nunca mostra tela velha), cache se offline
  if (ehPagina(req)) {
    e.respondWith(
      fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
        return res;
      }).catch(() =>
        caches.match(req).then((r) => r || caches.match("/"))
      )
    );
    return;
  }

  // 3) demais (imagens, manifest): cache primeiro + atualiza por trás
  e.respondWith(
    caches.match(req).then((hit) => {
      const rede = fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
        return res;
      }).catch(() => hit);
      return hit || rede;
    })
  );
});

// Clique na notificação → abre/foca o app na tela do ritual
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ("focus" in w) { w.focus(); if ("navigate" in w) w.navigate(url); return; }
      }
      return clients.openWindow(url);
    })
  );
});

// Push remoto (lembretes do ritual e da manhã)
self.addEventListener("push", (e) => {
  let dados = {};
  try { dados = e.data ? e.data.json() : {}; } catch {}
  const titulo = dados.title || "🌙 NoctaLev";
  const corpo = dados.body || "Hora do seu ritual noturno. Leva 3 minutinhos! ⭐";
  e.waitUntil(
    self.registration.showNotification(titulo, {
      body: corpo,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "noctalev-push",
      data: { url: dados.url || "/ritual" },
    })
  );
});
