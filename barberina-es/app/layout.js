import "./globals.css";
import { Inter, Sora } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-sora", display: "swap" });

export const metadata = {
  title: "Barberina · Mi acompañamiento",
  description: "Cada mañana, 20 segundos. El Dr. Castellanos y tu grupo te acompañan.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Barberina" },
  openGraph: {
    title: "Barberina · Mi acompañamiento",
    description: "Tu grupo de la semana con Barberina Max.",
    locale: "es_ES", type: "website", images: ["/icon-512.png"],
  },
};

export const viewport = {
  themeColor: "#FBFAF7", width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-ES" className={`${inter.variable} ${sora.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}` }} />
      </head>
      <body className="font-inter">{children}</body>
    </html>
  );
}
