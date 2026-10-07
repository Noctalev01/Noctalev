// Barberina ES — service worker v3
// Páginas e JS: SEMPRE rede primeiro (nunca serve versão velha que trava o app).
// Cache só como reserva offline. Imagens: cache primeiro.
const CACHE = "barberina-es-v3";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/img/") || /\.(png|jpg|jpeg|webp|svg|ico)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const c = res.clone(); caches.open(CACHE).then((x) => x.put(req, c)); }
      return res;
    })));
    return;
  }
  e.respondWith(fetch(req).then((res) => {
    if (res.ok && (req.mode === "navigate" || url.pathname.startsWith("/_next/static/"))) {
      const c = res.clone(); caches.open(CACHE).then((x) => x.put(req, c));
    }
    return res;
  }).catch(() => caches.match(req).then((r) => r || (req.mode === "navigate" ? caches.match("/") : undefined))));
});
