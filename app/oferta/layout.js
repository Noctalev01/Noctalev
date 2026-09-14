// Página de vendas — metadados próprios (título de anúncio, não do app)
export const metadata = {
  title: "NoctaLev — O Ritual Noturno de 10 Minutos",
  description:
    "O passo a passo completo de 28 dias, noite por noite, dentro de um aplicativo simples — feito para mulheres depois dos 40.",
  robots: { index: false, follow: false },
  // ===== Capa do link (WhatsApp, Instagram, Facebook) =====
  openGraph: {
    title: "NoctaLev — O Ritual Noturno de 10 Minutos",
    description:
      "O passo a passo completo de 28 dias, noite por noite, dentro de um aplicativo simples — feito para mulheres depois dos 40.",
    url: "https://noctalev.vercel.app/oferta",
    siteName: "NoctaLev",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-noctalev.jpg",
        width: 1200,
        height: 630,
        alt: "NoctaLev — Seu sono. Seu melhor dia.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NoctaLev — O Ritual Noturno de 10 Minutos",
    description:
      "O passo a passo de 28 dias dentro de um aplicativo simples — feito para mulheres depois dos 40.",
    images: ["/og-noctalev.jpg"],
  },
};

export default function OfertaLayout({ children }) {
  return children;
}
