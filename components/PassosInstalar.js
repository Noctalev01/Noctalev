"use client";
// ============================================================
// Passo a passo visual para instalar o NoctaLev como app (PWA)
//
// - iPhone com iOS 26+ (Safari novo, 2025+): ⋯ (Mais) → Compartilhar →
//   "Adicionar à Tela de Início" → ativar "Abrir como App da Web" → Adicionar
// - iPhone com iOS antigo (≤ 18): botão Compartilhar (quadrado com seta)
//   na barra de baixo → "Adicionar à Tela de Início" → Adicionar
// - Android/Chrome: botão de 1 toque (beforeinstallprompt) ou ⋮ → Instalar
// - Aberto dentro do Instagram/Facebook/TikTok: pede para abrir no Safari
//
// Cada passo tem um "mini mockup" da tela do celular, para a usuária
// reconhecer exatamente o que precisa tocar.
// ============================================================
import { useEffect, useState } from "react";

// ---------- detecção ----------
export function estaInstalado() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
export function ehIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPadOS 13+ se identifica como Mac; detecta pelo toque
  const ipadDesktop = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  return (/iphone|ipad|ipod/i.test(ua) && !window.MSStream) || ipadDesktop;
}
export function ehAndroid() {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}
export function ehCelular() {
  return ehIOS() || ehAndroid();
}
// Versão principal do iOS (ex.: 26). null se não for iPhone/iPad.
export function versaoIOS() {
  if (typeof navigator === "undefined") return null;
  const m = navigator.userAgent.match(/OS (\d+)[._]\d+/i);
  return m ? parseInt(m[1], 10) : null;
}
// Navegador embutido (Instagram, Facebook, TikTok, WhatsApp…) — não instala PWA
export function ehNavegadorEmbutido() {
  if (typeof navigator === "undefined") return false;
  return /Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|Line\/|Snapchat|WhatsApp/i.test(navigator.userAgent);
}
// iPhone fora do Safari (Chrome/Firefox no iOS também não instalam PWA)
export function ehIOSForaDoSafari() {
  if (typeof navigator === "undefined" || !ehIOS()) return false;
  return /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(navigator.userAgent);
}

// ---------- ícones ----------
function IconCompartilhar({ size = 18, color = "#0a84ff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}
function IconMaisQuadrado({ size = 18, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" /><path d="M12 8v8M8 12h8" />
    </svg>
  );
}
function IconPontinhos({ size = 18, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <circle cx="5" cy="12" r="2.1" /><circle cx="12" cy="12" r="2.1" /><circle cx="19" cy="12" r="2.1" />
    </svg>
  );
}
function IconPontinhosVertical({ size = 18, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <circle cx="12" cy="5" r="2.1" /><circle cx="12" cy="12" r="2.1" /><circle cx="12" cy="19" r="2.1" />
    </svg>
  );
}

// destaque pulsante em volta do elemento que ela precisa tocar
function Alvo({ children, className = "", largo = false }) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <span className={`absolute ${largo ? "inset-[1px]" : "inset-[-5px]"} rounded-[12px] anim-alvo`}
        style={{ border: "2px solid #fbd38d", boxShadow: "0 0 0 4px rgba(251,211,141,.18)" }} />
      {children}
    </span>
  );
}

// ---------- mini mockups (estilo iOS) ----------
const MOCK = { background: "#1c1c1e", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16 };

// Barra de endereço do Safari novo (iOS 26+): [ ⌕ noctalev.vercel.app ] [⋯]
function MockBarraSafariNova() {
  return (
    <div className="p-3" style={MOCK}>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 h-10 rounded-full" style={{ background: "#2c2c2e" }}>
          <span className="text-[11px] text-white/50">🔒</span>
          <span className="text-[12.5px] text-white/90 font-semibold truncate">noctalev.vercel.app</span>
        </div>
        <Alvo>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#2c2c2e" }}>
            <IconPontinhos />
          </div>
        </Alvo>
      </div>
    </div>
  );
}

// Menu que abre ao tocar em ⋯ (iOS 26+) — destaque em "Compartilhar"
function MockMenuMais() {
  const item = (t, icon, on) => (
    <div className={`flex items-center justify-between px-3.5 h-10 ${on ? "" : "opacity-45"}`}>
      <span className="text-[13px] text-white font-semibold">{t}</span>
      <span className="text-white/80">{icon}</span>
    </div>
  );
  return (
    <div className="overflow-hidden" style={MOCK}>
      {item("Copiar Link", <span className="text-[13px]">🔗</span>)}
      <div className="h-px bg-white/10" />
      <Alvo className="w-full" largo>
        <div className="w-full rounded-[10px]" style={{ background: "rgba(10,132,255,.14)" }}>
          {item("Compartilhar", <IconCompartilhar size={17} color="#fff" />, true)}
        </div>
      </Alvo>
      <div className="h-px bg-white/10" />
      {item("Adicionar aos Favoritos", <span className="text-[13px]">📖</span>)}
      {item("Buscar na Página", <span className="text-[13px]">🔍</span>)}
    </div>
  );
}

// Barra do Safari antigo (iOS ≤ 18): botões embaixo, Compartilhar no meio
function MockBarraSafariAntiga() {
  return (
    <div className="p-3" style={MOCK}>
      <div className="flex items-center px-3 h-9 rounded-[10px] mb-3 gap-2" style={{ background: "#2c2c2e" }}>
        <span className="text-[11px] text-white/50">🔒</span>
        <span className="text-[12.5px] text-white/90 font-semibold truncate">noctalev.vercel.app</span>
      </div>
      <div className="flex items-center justify-between px-2 text-white/40 text-[18px]">
        <span>‹</span><span>›</span>
        <Alvo><span className="inline-flex w-9 h-9 items-center justify-center"><IconCompartilhar size={22} /></span></Alvo>
        <span className="text-[16px]">📖</span><span className="text-[16px]">⧉</span>
      </div>
    </div>
  );
}

// Folha de compartilhamento — destaque em "Adicionar à Tela de Início"
function MockFolhaCompartilhar() {
  const linha = (t, icon, on) => (
    <div className={`flex items-center justify-between px-3.5 h-10 ${on ? "" : "opacity-45"}`}>
      <span className="text-[13px] text-white font-semibold">{t}</span>
      <span>{icon}</span>
    </div>
  );
  return (
    <div className="overflow-hidden" style={MOCK}>
      <div className="flex gap-2.5 px-3.5 py-3 opacity-45">
        {["💬", "✉️", "📝", "📋"].map((e, i) => (
          <div key={i} className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[16px]" style={{ background: "#2c2c2e" }}>{e}</div>
        ))}
      </div>
      <div className="h-px bg-white/10" />
      {linha("Copiar", <span className="text-[13px]">📄</span>)}
      {linha("Adicionar à Lista de Leitura", <span className="text-[13px]">👓</span>)}
      <Alvo className="w-full" largo>
        <div className="w-full rounded-[10px]" style={{ background: "rgba(251,211,141,.12)" }}>
          {linha("Adicionar à Tela de Início", <IconMaisQuadrado size={17} />, true)}
        </div>
      </Alvo>
      {linha("Imprimir", <span className="text-[13px]">🖨️</span>)}
    </div>
  );
}

// Diálogo final — toggle "Abrir como App da Web" + botão Adicionar
function MockDialogoAdicionar({ mostrarToggle = true }) {
  return (
    <div className="overflow-hidden" style={MOCK}>
      <div className="flex items-center justify-between px-3.5 h-11">
        <span className="text-[13px] font-semibold" style={{ color: "#0a84ff" }}>Cancelar</span>
        <span className="text-[13px] text-white font-bold">Tela de Início</span>
        <Alvo><span className="text-[13px] font-extrabold px-1.5 py-0.5 rounded-md" style={{ color: "#0a84ff" }}>Adicionar</span></Alvo>
      </div>
      <div className="h-px bg-white/10" />
      <div className="flex items-center gap-3 px-3.5 py-3">
        <img src="/apple-touch-icon.png" alt="" className="w-11 h-11 rounded-[11px] flex-none" style={{ border: "1px solid rgba(255,255,255,.12)" }} />
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] text-white font-bold">NoctaLev</div>
          <div className="text-[11px] text-white/45 truncate">noctalev.vercel.app</div>
        </div>
      </div>
      {mostrarToggle && (
        <>
          <div className="h-px bg-white/10" />
          <div className="flex items-center justify-between px-3.5 h-11">
            <span className="text-[13px] text-white font-semibold">Abrir como App da Web</span>
            <Alvo>
              <span className="relative inline-block w-[42px] h-[25px] rounded-full" style={{ background: "#34c759" }}>
                <span className="absolute top-[2px] right-[2px] w-[21px] h-[21px] rounded-full bg-white shadow" />
              </span>
            </Alvo>
          </div>
        </>
      )}
    </div>
  );
}

// Ícone do app na tela de início do iPhone
function MockTelaInicio() {
  return (
    <div className="p-3" style={MOCK}>
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1 opacity-30">
            <div className="w-12 h-12 rounded-[13px]" style={{ background: "#3a3a3c" }} />
            <div className="w-8 h-1.5 rounded-full bg-white/40" />
          </div>
        ))}
        <div className="flex flex-col items-center gap-1">
          <Alvo><img src="/apple-touch-icon.png" alt="NoctaLev" className="w-12 h-12 rounded-[13px]" /></Alvo>
          <div className="text-[10px] text-white font-semibold mt-0.5">NoctaLev</div>
        </div>
      </div>
    </div>
  );
}

// Menu do Chrome (Android) — destaque em "Adicionar à tela inicial"
function MockMenuChrome() {
  const item = (t, on) => (
    <div className={`flex items-center px-3.5 h-10 ${on ? "" : "opacity-45"}`}>
      <span className="text-[13px] text-white font-semibold">{t}</span>
    </div>
  );
  return (
    <div className="overflow-hidden" style={MOCK}>
      <div className="flex items-center justify-between px-3 h-11">
        <span className="text-[12.5px] text-white/80 font-semibold truncate">noctalev.vercel.app</span>
        <Alvo><span className="inline-flex w-8 h-8 items-center justify-center"><IconPontinhosVertical /></span></Alvo>
      </div>
      <div className="h-px bg-white/10" />
      {item("Nova guia")}
      {item("Favoritos")}
      <Alvo className="w-full" largo>
        <div className="w-full rounded-[10px]" style={{ background: "rgba(251,211,141,.12)" }}>
          {item("Adicionar à tela inicial", true)}
        </div>
      </Alvo>
      {item("Configurações")}
    </div>
  );
}

// ---------- um passo (número + texto + mockup) ----------
function Passo({ n, titulo, texto, mock }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-none">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-black text-[#3c2a10]"
          style={{ background: "linear-gradient(135deg,#fbd38d,#f6ad55)", boxShadow: "0 4px 12px rgba(246,173,85,.25)" }}>{n}</div>
        <div className="flex-1 w-px mt-2" style={{ background: "linear-gradient(180deg, rgba(251,211,141,.4), rgba(251,211,141,0))" }} />
      </div>
      <div className="flex-1 min-w-0 pb-5">
        <div className="text-[15px] font-extrabold leading-snug pt-1">{titulo}</div>
        {texto && <div className="text-[13px] text-sub2 font-semibold leading-relaxed mt-1">{texto}</div>}
        {mock && <div className="mt-3">{mock}</div>}
      </div>
    </div>
  );
}

// ---------- listas de passos ----------
function PassosIOSNovo() {
  return (
    <>
      <Passo n="1" titulo={<>Toque nos <span className="text-gold">três pontinhos</span> ao lado da barra de endereço</>}
        texto="Fica na parte de baixo da tela, à direita de onde aparece o endereço do site." mock={<MockBarraSafariNova />} />
      <Passo n="2" titulo={<>No menu que abrir, toque em <span className="text-gold">Compartilhar</span></>}
        mock={<MockMenuMais />} />
      <Passo n="3" titulo={<>Role a lista para baixo e toque em <span className="text-gold">Adicionar à Tela de Início</span></>}
        texto="Se não encontrar, role até o fim, toque em “Editar Ações” e ative essa opção." mock={<MockFolhaCompartilhar />} />
      <Passo n="4" titulo={<>Deixe <span className="text-gold">Abrir como App da Web</span> ligado e toque em <span className="text-gold">Adicionar</span></>}
        mock={<MockDialogoAdicionar mostrarToggle />} />
      <Passo n="5" titulo={<>Pronto! Abra o <span className="text-gold">NoctaLev</span> pela sua tela de início 💛</>}
        texto="Dentro do app, digite seu email uma única vez — depois ele fica sempre conectado." mock={<MockTelaInicio />} />
    </>
  );
}

function PassosIOSAntigo() {
  return (
    <>
      <Passo n="1" titulo={<>Toque no botão <span className="text-gold">Compartilhar</span> (quadrado com a seta para cima)</>}
        texto="Fica na barra de baixo do Safari, bem no meio." mock={<MockBarraSafariAntiga />} />
      <Passo n="2" titulo={<>Role a lista para baixo e toque em <span className="text-gold">Adicionar à Tela de Início</span></>}
        mock={<MockFolhaCompartilhar />} />
      <Passo n="3" titulo={<>Toque em <span className="text-gold">Adicionar</span> no canto superior direito</>}
        mock={<MockDialogoAdicionar mostrarToggle={false} />} />
      <Passo n="4" titulo={<>Pronto! Abra o <span className="text-gold">NoctaLev</span> pela sua tela de início 💛</>}
        texto="Dentro do app, digite seu email uma única vez — depois ele fica sempre conectado." mock={<MockTelaInicio />} />
    </>
  );
}

function PassosAndroid() {
  return (
    <>
      <Passo n="1" titulo={<>Toque nos <span className="text-gold">três pontinhos ⋮</span> no canto superior direito do Chrome</>}
        mock={<MockMenuChrome />} />
      <Passo n="2" titulo={<>Toque em <span className="text-gold">Adicionar à tela inicial</span> (ou “Instalar app”)</>}
        texto="Confirme tocando em Instalar / Adicionar." />
      <Passo n="3" titulo={<>Pronto! Abra o <span className="text-gold">NoctaLev</span> pela sua tela de início 💛</>}
        texto="Dentro do app, digite seu email uma única vez — depois ele fica sempre conectado." />
    </>
  );
}

// ---------- aviso: abriu pelo Instagram / outro navegador ----------
function AvisoAbrirNoSafari({ ios }) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(window.location.origin + "/onboarding");
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {}
  }
  return (
    <div className="card p-4" style={{ background: "rgba(251,211,141,.07)", borderColor: "rgba(251,211,141,.35)" }}>
      <div className="text-[14.5px] font-extrabold">⚠️ Abra este link no {ios ? "Safari" : "Chrome"} primeiro</div>
      <p className="text-[13px] text-sub2 font-semibold leading-relaxed mt-1.5">
        Você está dentro de outro aplicativo (Instagram, WhatsApp, Facebook…) e por aqui não dá para instalar.
        {ios
          ? " Toque nos ⋯ no canto da tela e escolha “Abrir no Safari” — ou copie o link e cole no Safari."
          : " Toque nos ⋮ no canto da tela e escolha “Abrir no Chrome” — ou copie o link e cole no Chrome."}
      </p>
      <button onClick={copiar} className="btn-ghost w-full py-3 mt-3 text-[13.5px]">
        {copiado ? "✅ Link copiado!" : "🔗 Copiar o link do app"}
      </button>
    </div>
  );
}

// ============================================================
// Componente principal
//  - compacto: mostra só o cabeçalho; expande ao tocar (usado no login)
//  - aberto: já mostra tudo (usado no modal da Home)
// ============================================================
export default function PassosInstalar({ aberto = false, titulo = "Instale o app no seu celular" }) {
  const [plataforma, setPlataforma] = useState(null); // ios-novo | ios-antigo | android | desktop
  const [embutido, setEmbutido] = useState(false);
  const [expandido, setExpandido] = useState(aberto);
  const [deferido, setDeferido] = useState(null);
  const [instalou, setInstalou] = useState(false);

  useEffect(() => {
    if (estaInstalado()) { setPlataforma("instalado"); return; }
    setEmbutido(ehNavegadorEmbutido() || ehIOSForaDoSafari());
    if (ehIOS()) {
      const v = versaoIOS();
      setPlataforma(v !== null && v < 26 ? "ios-antigo" : "ios-novo");
    } else if (ehAndroid()) {
      setPlataforma("android");
    } else {
      setPlataforma("desktop");
    }
    const handler = (e) => { e.preventDefault(); setDeferido(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function instalarAndroid() {
    if (!deferido) return;
    deferido.prompt();
    const { outcome } = await deferido.userChoice;
    setDeferido(null);
    if (outcome === "accepted") setInstalou(true);
  }

  if (!plataforma || plataforma === "instalado") return null;

  const ios = plataforma.startsWith("ios");
  const nomeAparelho = ios ? "iPhone" : plataforma === "android" ? "Android" : "celular";

  return (
    <section className="card overflow-hidden" style={{ borderColor: "rgba(165,180,252,.2)" }}>
      {/* cabeçalho */}
      <button onClick={() => setExpandido((v) => !v)} className="w-full flex items-center gap-3 p-4 text-left active:opacity-80">
        <div className="w-12 h-12 flex-none rounded-[14px] flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#1a2150,#10142c)", border: "1px solid rgba(251,211,141,.4)" }}>
          <img src="/apple-touch-icon.png" alt="" className="w-9 h-9 rounded-[10px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-extrabold leading-tight">{titulo.replace("celular", nomeAparelho)}</div>
          <div className="text-[12px] text-sub font-semibold mt-0.5 leading-snug">
            Leva 30 segundos · sem loja de apps · lembretes do ritual 💛
          </div>
        </div>
        <span className="text-sub2 text-[18px] transition-transform" style={{ transform: expandido ? "rotate(90deg)" : "none" }}>›</span>
      </button>

      {expandido && (
        <div className="px-4 pb-4">
          <div className="h-px mb-4" style={{ background: "rgba(165,180,252,.14)" }} />

          {plataforma === "desktop" ? (
            <p className="text-[13px] text-sub2 font-semibold leading-relaxed">
              💻 Você está no computador. Para instalar o app, abra este mesmo link pelo <b className="text-gold">Safari do iPhone</b> ou pelo <b className="text-gold">Chrome do Android</b> — o passo a passo aparece automaticamente lá.
            </p>
          ) : embutido ? (
            <AvisoAbrirNoSafari ios={ios} />
          ) : instalou ? (
            <div className="text-center py-3">
              <div className="text-[36px]">🎉</div>
              <div className="text-[15px] font-extrabold mt-2">App instalado!</div>
              <p className="text-sub2 text-[13px] font-semibold mt-1.5 leading-relaxed">
                Procure o ícone <b className="text-gold">NoctaLev</b> na sua tela de início e abra por lá.
              </p>
            </div>
          ) : (
            <>
              {plataforma === "android" && deferido && (
                <button onClick={instalarAndroid} className="cta-gold w-full py-4 text-[16px] mb-5">
                  📲 Instalar o app agora (1 toque)
                </button>
              )}

              {ios && (
                <div className="flex gap-1 p-1 rounded-[12px] mb-4" style={{ background: "rgba(255,255,255,.05)" }}>
                  {[{ k: "ios-novo", t: "Safari novo (iOS 26+)" }, { k: "ios-antigo", t: "Safari antigo" }].map((o) => (
                    <button key={o.k} onClick={() => setPlataforma(o.k)}
                      className="flex-1 py-2 rounded-[9px] text-[12px] font-bold transition-all"
                      style={plataforma === o.k
                        ? { background: "rgba(251,211,141,.16)", color: "#fbd38d", border: "1px solid rgba(251,211,141,.35)" }
                        : { color: "#8f97c0", border: "1px solid transparent" }}>
                      {o.t}
                    </button>
                  ))}
                </div>
              )}

              {plataforma === "ios-novo" && <PassosIOSNovo />}
              {plataforma === "ios-antigo" && <PassosIOSAntigo />}
              {plataforma === "android" && <PassosAndroid />}

              {ios && (
                <div className="rounded-[12px] p-3 text-[12px] text-sub font-semibold leading-relaxed" style={{ background: "rgba(255,255,255,.035)" }}>
                  💡 Não está vendo igual ao desenho? Toque em <b className="text-sub2">“{plataforma === "ios-novo" ? "Safari antigo" : "Safari novo (iOS 26+)"}”</b> ali em cima — o layout muda conforme a versão do seu iPhone.
                </div>
              )}
            </>
          )}

          <a href={"https://wa.me/5554920011946?text=" + encodeURIComponent("Olá! Estou tentando instalar o app NoctaLev no meu celular e preciso de ajuda. 💛")}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 mt-4 py-3 rounded-[14px] text-[13.5px] font-extrabold text-green active:opacity-80"
            style={{ border: "1px solid rgba(126,232,178,.35)" }}>
            💬 Precisa de ajuda? Fale no WhatsApp
          </a>
        </div>
      )}
    </section>
  );
}
