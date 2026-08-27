import "./globals.css";
// ===== 5.4 — fonte embutida no app (next/font) =====
// Antes a Inter vinha do servidor do Google a cada visita (mais lento e
// falha sem internet). Agora ela faz parte do próprio app: carrega
// instantânea, funciona offline e sem depender de terceiros.
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "NoctaLev — Protocolo Noturno",
  description: "Seu protocolo noturno de emagrecimento baseado no sono",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NoctaLev",
  },
};

export const viewport = {
  themeColor: "#10142c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
