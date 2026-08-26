// NoctaLev service worker — cache p/ leitura offline + notificações
const CACHE = "noctalev-v2";
const ASSETS = ["/", "/receita", "/progresso", "/bonus", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("/")))
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

// Push remoto (preparado para futuro backend de push)
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
