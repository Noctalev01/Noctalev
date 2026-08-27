/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,

  // ===== 5.4 — headers de segurança e cache profissional =====
  async headers() {
    return [
      {
        // segurança em todas as rotas
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },                  // ninguém embute o app em iframe (anti-clickjacking)
          { key: "X-Content-Type-Options", value: "nosniff" },        // navegador não "adivinha" tipos de arquivo
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
      {
        // service worker: nunca cachear (atualizações chegam na hora)
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        // imagens e ícones: cache longo no navegador (carregamento instantâneo)
        source: "/:file(icon-192.png|icon-512.png|apple-touch-icon.png|capa.jpg)",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        source: "/img/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};
