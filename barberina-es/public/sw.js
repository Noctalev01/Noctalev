// Barberina ES — service worker v1: páginas rede-primeiro, estáticos cache-primeiro
const CACHE = "barberina-es-v1";
const PAGINAS = ["/", "/grupo", "/plan", "/evolucion", "/perfil", "/entrar"];
const ASSETS = ["/manifest.json", "/icon-192.png", "/icon-512.png", "/img/frasco.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([...PAGINAS, ...ASSETS])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/img/")) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const c = res.clone(); caches.open(CACHE).then((x) => x.put(req, c)); return res;
    })));
    return;
  }
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((res) => {
      const c = res.clone(); caches.open(CACHE).then((x) => x.put(req, c)); return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match("/"))));
  }
});
