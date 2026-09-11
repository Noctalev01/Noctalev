"use client";
// ============================================================
// PÁGINA DE VENDAS — /oferta
// Destino do clique final da VSL. Mobile-first (360–390px).
// Pixel Meta + UTM preservados + botão sticky após 1ª dobra.
// ============================================================
import { useEffect, useRef, useState } from "react";

const CHECKOUT = "https://pay.cakto.com.br/keibt5s_1054022";
const PIXEL_ID = "3045648935777848";

// ---- antes e depois (fotos hospedadas no próprio site, em WebP leve) ----
const RESULTADOS = [
  { img: "antes-depois-01.webp", nome: "Luciana, 46", cidade: "Campinas – SP", inicio: "14 de julho" },
  { img: "antes-depois-02.webp", nome: "Rosângela, 51", cidade: "Belo Horizonte – MG", inicio: "3 de agosto" },
  { img: "antes-depois-03.webp", nome: "Cláudia, 44", cidade: "Curitiba – PR", inicio: "21 de julho" },
  { img: "antes-depois-04.webp", nome: "Ivone, 58", cidade: "Goiânia – GO", inicio: "8 de agosto" },
  { img: "antes-depois-05.webp", nome: "Simone, 49", cidade: "Salvador – BA", inicio: "28 de julho" },
  { img: "antes-depois-06.webp", nome: "Vera, 55", cidade: "Porto Alegre – RS", inicio: "11 de agosto" },
  { img: "antes-depois-07.webp", nome: "Márcia, 47", cidade: "Fortaleza – CE", inicio: "17 de julho" },
  { img: "antes-depois-08.webp", nome: "Adriana, 52", cidade: "São José dos Campos – SP", inicio: "5 de agosto" },
];

// ---- utm: preserva os parâmetros da URL ao mandar pro checkout ----
function urlCheckout() {
  try {
    const qs = window.location.search;
    if (!qs || qs.length < 2) return CHECKOUT;
    return CHECKOUT + (CHECKOUT.includes("?") ? "&" : "?") + qs.slice(1);
  } catch {
    return CHECKOUT;
  }
}

// ---- pixel: dispara InitiateCheckout e redireciona ----
function irCheckout() {
  try {
    if (window.fbq) window.fbq("track", "InitiateCheckout");
  } catch {}
  // pequeno delay pro pixel sair antes do redirect
  setTimeout(() => {
    window.location.href = urlCheckout();
  }, 180);
}

// ---- botão CTA reutilizável ----
function Cta({ children, pulso = true, mini = false }) {
  return (
    <button
      onClick={irCheckout}
      className={`cta-venda ${pulso ? "cta-pulso" : ""} ${mini ? "!py-3.5 !text-[16px]" : ""}`}
    >
      {children}
    </button>
  );
}

// ---- selos de confiança ----
function Selos() {
  return (
    <div className="flex justify-center gap-2 mt-4">
      {[
        ["🔒", "Compra segura"],
        ["⚡", "Acesso imediato"],
        ["✅", "Garantia 7 dias"],
      ].map(([ic, t]) => (
        <div key={t} className="flex-1 card !rounded-2xl px-1 py-3 text-center">
          <div className="text-[20px]">{ic}</div>
          <div className="text-[11.5px] font-bold text-sub2 mt-1 leading-tight">{t}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// TELAS DO APP (réplicas fiéis, leves, dentro do mockup)
// ============================================================
function Moldura({ children }) {
  return (
    <div className="fone w-full aspect-[9/18.5]">
      <div className="fone-tela h-full px-3 pt-8 pb-3 flex flex-col gap-2 text-left">{children}</div>
    </div>
  );
}

function TelaRitual() {
  return (
    <Moldura>
      <div className="text-[9px] font-bold text-sub uppercase tracking-widest">Boa noite, Maria 🌙</div>
      <div className="text-[15px] font-black text-txt leading-tight">Sua noite 1 te espera</div>
      <div className="card !rounded-xl p-2.5 mt-1">
        <div className="text-[10px] font-bold text-gold">🍵 Ritual de hoje</div>
        <div className="text-[11px] font-bold text-txt mt-0.5 leading-snug">Bebida da Noite 1 + 3 passos simples</div>
        <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
          <div className="h-full w-[8%] rounded-full bg-gradient-to-r from-gold2 to-gold" />
        </div>
        <div className="text-[9px] font-semibold text-sub mt-1">10 minutos • antes de dormir</div>
      </div>
      <div className="card !rounded-xl p-2.5 flex items-center gap-2">
        <div className="text-[16px]">⭐</div>
        <div>
          <div className="text-[10px] font-bold text-txt">Seus pontos</div>
          <div className="text-[9px] font-semibold text-sub">cada noite conta</div>
        </div>
      </div>
      <div className="mt-auto rounded-xl bg-gradient-to-r from-gold2 to-gold text-center py-2 text-[11px] font-black text-[#3c2a10]">
        Começar meu ritual →
      </div>
    </Moldura>
  );
}

function TelaBebida() {
  return (
    <Moldura>
      <div className="text-[9px] font-bold text-sub uppercase tracking-widest">Receita da noite</div>
      <div className="text-[15px] font-black text-txt leading-tight">🍵 Bebida Noturna</div>
      <div className="card !rounded-xl p-2.5 mt-1 space-y-1.5">
        {["Água morna", "Ingrediente do mercado", "Toque especial da noite"].map((i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-green/20 text-green text-[8px] font-black flex items-center justify-center">✓</div>
            <div className="text-[10.5px] font-bold text-txt">{i}</div>
          </div>
        ))}
      </div>
      <div className="card !rounded-xl p-2.5">
        <div className="text-[10px] font-bold text-lilac">💰 Custo da noite</div>
        <div className="text-[13px] font-black text-green">menos de R$ 2</div>
      </div>
      <div className="mt-auto rounded-xl bg-white/5 border border-white/10 text-center py-2 text-[11px] font-bold text-sub2">
        Modo preparo passo a passo →
      </div>
    </Moldura>
  );
}

function TelaProgresso() {
  const dias = Array.from({ length: 28 }, (_, i) => i + 1);
  return (
    <Moldura>
      <div className="text-[9px] font-bold text-sub uppercase tracking-widest">Sua jornada</div>
      <div className="text-[15px] font-black text-txt leading-tight">📅 28 noites</div>
      <div className="grid grid-cols-7 gap-1 mt-1">
        {dias.map((d) => (
          <div
            key={d}
            className={`aspect-square rounded-md flex items-center justify-center text-[8px] font-black ${
              d <= 9 ? "bg-green/25 text-green" : "bg-white/5 text-sub"
            }`}
          >
            {d <= 9 ? "✓" : d}
          </div>
        ))}
      </div>
      <div className="card !rounded-xl p-2.5 mt-1">
        <div className="text-[10px] font-bold text-gold">🔥 9 noites seguidas!</div>
        <div className="text-[9px] font-semibold text-sub mt-0.5">Você está indo muito bem</div>
      </div>
    </Moldura>
  );
}

function TelaCompras() {
  return (
    <Moldura>
      <div className="text-[9px] font-bold text-sub uppercase tracking-widest">Lista de compras</div>
      <div className="text-[15px] font-black text-txt leading-tight">🛒 Semana 1</div>
      <div className="card !rounded-xl p-2.5 mt-1 space-y-1.5">
        {["Ingrediente 1 — mercado comum", "Ingrediente 2 — hortifruti", "Ingrediente 3 — qualquer marca"].map((i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded border border-lilac/40" />
            <div className="text-[10px] font-bold text-txt leading-tight">{i}</div>
          </div>
        ))}
      </div>
      <div className="card !rounded-xl p-2.5">
        <div className="text-[10px] font-bold text-lilac">Total da semana</div>
        <div className="text-[13px] font-black text-green">menos de R$ 15</div>
      </div>
    </Moldura>
  );
}

function TelaLembrete() {
  return (
    <Moldura>
      <div className="text-[9px] font-bold text-sub uppercase tracking-widest">Lembrete</div>
      <div className="text-[15px] font-black text-txt leading-tight">🔔 Hora do ritual</div>
      <div className="card !rounded-xl p-2.5 mt-1">
        <div className="flex items-center gap-2">
          <div className="text-[18px]">🌙</div>
          <div>
            <div className="text-[10.5px] font-black text-txt">NoctaLev</div>
            <div className="text-[9.5px] font-semibold text-sub2 leading-snug">Sua noite 10 está pronta. 10 minutinhos e pronto 💛</div>
          </div>
        </div>
      </div>
      <div className="card !rounded-xl p-2.5">
        <div className="text-[10px] font-bold text-gold">⏰ Todo dia no seu horário</div>
        <div className="text-[9px] font-semibold text-sub mt-0.5">você nunca perde uma noite</div>
      </div>
    </Moldura>
  );
}

// ============================================================
// PÁGINA
// ============================================================
export default function Oferta() {
  const heroRef = useRef(null);
  const [sticky, setSticky] = useState(false);
  const [faqAberta, setFaqAberta] = useState(-1);

  // pixel meta: PageView + ViewContent no carregamento
  useEffect(() => {
    try {
      if (!window.fbq) {
        /* eslint-disable */
        !(function (f, b, e, v, n, t, s) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
          t = b.createElement(e); t.async = !0; t.src = v;
          s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
        })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
        /* eslint-enable */
        window.fbq("init", PIXEL_ID);
      }
      window.fbq("track", "PageView");
      window.fbq("track", "ViewContent", { content_name: "oferta-noctalev" });
    } catch {}
  }, []);

  // sticky: aparece depois que a 1ª dobra sai da tela
  useEffect(() => {
    const el = heroRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <main className="app-bg min-h-[100dvh] text-txt overflow-x-hidden">
      <div className="max-w-md mx-auto px-5 pb-32">

        {/* ============ 1. HERO ============ */}
        <section ref={heroRef} className="pt-8">
          <div className="text-center">
            <div className="eyebrow !text-gold">🌙 NoctaLev</div>
            <h1 className="text-[27px] leading-[1.18] font-black mt-3">
              O Ritual Noturno de 10 Minutos está pronto para a sua{" "}
              <span className="text-gold">primeira noite</span> — direto no seu celular
            </h1>
            <p className="text-[17px] font-semibold text-sub2 mt-3 leading-snug">
              O passo a passo completo de 28 dias, noite por noite, dentro de um
              aplicativo simples — feito para mulheres depois dos 40.
            </p>
          </div>

          <div className="flex justify-center mt-6">
            <div className="w-[62%]">
              <TelaRitual />
            </div>
          </div>

          <div className="mt-6">
            <Cta>QUERO COMEÇAR HOJE →</Cta>
            <p className="text-center text-[13px] font-bold text-sub2 mt-2.5">
              Acesso imediato • Garantia de 7 dias • 11x de R$ 5,43
            </p>
          </div>

          {/* ============ 2. BARRA DE CONFIANÇA ============ */}
          <Selos />
        </section>

        {/* ============ 3. O QUE É ============ */}
        <section className="mt-12">
          <div className="card p-5">
            <p className="text-[17px] font-semibold leading-relaxed">
              Depois dos 40, é <b className="text-gold">durante o sono</b> que o seu corpo
              decide se queima ou acumula gordura.
            </p>
            <p className="text-[17px] font-semibold leading-relaxed mt-3">
              O NoctaLev é um ritual de <b>10 minutos por noite</b>, com uma bebida simples
              de ingredientes de mercado (<b className="text-green">menos de R$ 2 por noite</b>)
              — tudo guiado pelo app, noite por noite.
            </p>
          </div>
        </section>

        {/* ============ 4. VEJA O APP POR DENTRO ============ */}
        <section className="mt-12">
          <h2 className="text-[22px] font-black text-center leading-tight">
            Veja o app <span className="text-gold">por dentro</span> 👀
          </h2>
          <p className="text-center text-[15px] font-semibold text-sub2 mt-2">
            Tudo pronto, noite por noite. É só abrir e seguir.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {[
              [<TelaRitual key="r" />, "Seu ritual da noite, sempre pronto te esperando"],
              [<TelaBebida key="b" />, "A bebida de cada noite, com ingredientes simples"],
              [<TelaProgresso key="p" />, "Suas 28 noites marcadas — dá orgulho de ver ✓"],
              [<TelaCompras key="c" />, "Lista de compras pronta: menos de R$ 15/semana"],
            ].map(([tela, legenda], i) => (
              <div key={i}>
                {tela}
                <p className="text-[12.5px] font-bold text-sub2 text-center mt-2 leading-snug">{legenda}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <div className="w-[47%]">
              <TelaLembrete />
              <p className="text-[12.5px] font-bold text-sub2 text-center mt-2 leading-snug">
                Lembrete na hora certa — você nunca esquece
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Cta pulso={false}>QUERO COMEÇAR HOJE →</Cta>
          </div>
        </section>

        {/* ============ 5. PARA QUEM É / NÃO É ============ */}
        <section className="mt-12">
          <h2 className="text-[22px] font-black text-center leading-tight">
            Isso é <span className="text-gold">para você</span>?
          </h2>

          <div className="card p-5 mt-5 border-green/30" style={{ borderColor: "rgba(126,232,178,.3)" }}>
            <div className="text-[15px] font-black text-green mb-3">✅ É para você que…</div>
            <ul className="space-y-2.5">
              {[
                "acorda às 3h da manhã e não volta a dormir",
                "dorme 8 horas e mesmo assim acorda exausta",
                "perde peso e recupera tudo de novo",
                "já tentou dieta e academia sem resultado que dure",
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-[16px] font-semibold leading-snug">
                  <span className="text-green shrink-0">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5 mt-4" style={{ borderColor: "rgba(248,113,113,.25)" }}>
            <div className="text-[15px] font-black text-[#fca5a5] mb-3">❌ NÃO é para você que…</div>
            <ul className="space-y-2.5">
              {[
                "busca fórmula mágica sem fazer nada",
                "tem menos de 30 anos",
                "procura remédio ou pílula — não é suplemento, é um método natural",
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-[16px] font-semibold text-sub2 leading-snug">
                  <span className="text-[#fca5a5] shrink-0">✕</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ 6. RESULTADOS — carrossel antes/depois ============ */}
        <section className="mt-12">
          <h2 className="text-[22px] font-black text-center leading-tight">
            Veja os resultados de mulheres que viveram a{" "}
            <span className="text-gold">transformação de corpo e de vida</span> com o ritual
          </h2>
          <p className="text-center text-[14px] font-semibold text-sub2 mt-2">
            28 noites depois, elas mesmas mandaram as fotos 💛
          </p>

          <div className="carrossel-ab mt-6 -mx-5 px-5">
            {RESULTADOS.map((r) => (
              <figure key={r.img} className="slide-ab">
                <div className="card !rounded-2xl overflow-hidden !p-0">
                  <img
                    src={`/resultados/${r.img}`}
                    alt={`Antes e depois de ${r.nome}`}
                    loading="lazy"
                    width="440"
                    height="440"
                    className="w-full aspect-square object-cover"
                  />
                  <figcaption className="px-4 py-3">
                    <div className="text-[15px] font-black">{r.nome}</div>
                    <div className="text-[12.5px] font-bold text-sub2 mt-0.5">
                      📍 {r.cidade} · começou em {r.inicio}
                    </div>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
          <div className="flex justify-center gap-1.5 mt-3">
            {RESULTADOS.map((r, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-lilac/30" />
            ))}
          </div>
          <p className="text-center text-[13px] font-bold text-sub2 mt-2">
            ← arraste para o lado e veja todas →
          </p>

          <div className="mt-5">
            <Cta pulso={false}>TAMBÉM QUERO TRANSFORMAR MEU CORPO! →</Cta>
          </div>
          <p className="text-center text-[12px] font-semibold text-sub mt-3">
            Resultados variam de pessoa para pessoa.
          </p>
        </section>

        {/* ============ 7. O QUE VOCÊ RECEBE ============ */}
        <section className="mt-12">
          <h2 className="text-[22px] font-black text-center leading-tight">
            O que você recebe <span className="text-gold">hoje</span>
          </h2>
          <div className="card p-5 mt-5">
            <ul className="space-y-3.5">
              {[
                ["📱", "App NoctaLev com o ritual completo de 28 dias, noite por noite"],
                ["🍵", "As bebidas do ritual com ingredientes simples de mercado"],
                ["🛒", "Lista de compras semanal pronta — economiza tempo e dinheiro"],
                ["📖", "Guia \u201cPor que seu corpo trava depois dos 40\u201d"],
                ["🔔", "Lembretes noturnos para nunca perder uma noite"],
                ["♾️", "Acesso vitalício, direto no navegador do celular — sem baixar nada da loja, sem senha complicada"],
              ].map(([ic, t]) => (
                <li key={t} className="flex gap-3 items-start">
                  <span className="text-[20px] shrink-0">{ic}</span>
                  <span className="text-[16.5px] font-semibold leading-snug">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ 8. PREÇO ============ */}
        <section className="mt-12">
          <div className="card p-6 text-center border-2" style={{ borderColor: "rgba(251,211,141,.4)" }}>
            <div className="eyebrow !text-gold">Oferta de hoje</div>
            <div className="mt-3 text-[17px] font-bold text-sub line-through">De R$ 97</div>
            <div className="text-[15px] font-bold text-sub2 mt-2">por apenas</div>
            <div className="text-[42px] leading-none font-black text-gold mt-1">
              11x <span className="text-[52px]">R$ 5,43</span>
            </div>
            <div className="text-[15px] font-bold text-sub2 mt-2">ou R$ 47,90 à vista</div>
            <p className="text-[14.5px] font-semibold text-sub2 mt-4 leading-snug">
              Menos que uma pizza 🍕 — para transformar suas noites pelos próximos 28 dias.
            </p>
            <div className="mt-5">
              <Cta>GARANTIR MEU ACESSO AGORA →</Cta>
            </div>
            <p className="text-[12.5px] font-bold text-sub mt-3">
              🔒 Pagamento seguro • Pix ou cartão • Acesso na hora
            </p>
          </div>
        </section>

        {/* ============ 9. GARANTIA ============ */}
        <section className="mt-12">
          <div className="card p-6 text-center" style={{ borderColor: "rgba(126,232,178,.3)" }}>
            <div className="text-[52px]">🛡️</div>
            <h3 className="text-[20px] font-black mt-2">Garantia incondicional de 7 dias</h3>
            <p className="text-[16px] font-semibold text-sub2 leading-relaxed mt-3">
              Entre no app, faça suas primeiras noites do ritual. Se não sentir diferença
              no seu sono na primeira semana, clique em reembolso e devolvemos{" "}
              <b className="text-green">100% do valor</b>.
            </p>
            <p className="text-[16px] font-bold mt-3">
              Sem perguntas, sem burocracia. O risco é todo nosso.
            </p>
          </div>
        </section>

        {/* ============ 10. FAQ ============ */}
        <section className="mt-12">
          <h2 className="text-[22px] font-black text-center leading-tight">Perguntas frequentes</h2>
          <div className="space-y-3 mt-5">
            {[
              ["Como recebo o acesso?", "Na hora! Assim que o pagamento é aprovado, você recebe um e-mail com o link. O app abre direto no navegador do seu celular — sem baixar nada da loja."],
              ["Preciso comprar ingredientes caros?", "Não. Tudo se encontra em qualquer mercado comum, e a lista da semana fica em torno de R$ 15."],
              ["Funciona para a minha idade?", "O NoctaLev foi feito especialmente para mulheres depois dos 40 — e funciona também depois dos 60."],
              ["Preciso fazer dieta ou academia junto?", "Não. O ritual noturno é o método. Você não precisa mudar sua rotina do dia."],
              ["É uma assinatura? Vou pagar todo mês?", "Não! É pagamento único, com acesso vitalício. Você paga uma vez e o app é seu."],
              ["E se eu não gostar?", "Você tem 7 dias de garantia incondicional. Não gostou? Reembolso de 100% em 1 clique, sem perguntas."],
            ].map(([q, a], i) => (
              <div key={q} className="card overflow-hidden">
                <button
                  onClick={() => setFaqAberta(faqAberta === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                >
                  <span className="text-[16px] font-black leading-snug">{q}</span>
                  <span className={`text-gold text-[18px] shrink-0 transition-transform ${faqAberta === i ? "rotate-45" : ""}`}>＋</span>
                </button>
                {faqAberta === i && (
                  <div className="px-4 pb-4 text-[15.5px] font-semibold text-sub2 leading-relaxed">{a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ============ 11. CTA FINAL ============ */}
        <section className="mt-14 text-center">
          <div className="text-[40px]">🌙</div>
          <h2 className="text-[26px] font-black leading-tight mt-2">
            Sua primeira noite pode ser <span className="text-gold">hoje</span>
          </h2>
          <p className="text-[16px] font-semibold text-sub2 mt-3 leading-snug">
            Daqui a 28 noites, você pode estar contando essa história — ou pode estar
            exatamente onde está agora. A escolha é sua. 💛
          </p>
          <div className="mt-6">
            <Cta>QUERO COMEÇAR HOJE →</Cta>
            <p className="text-[13px] font-bold text-sub2 mt-2.5">
              Acesso imediato • Garantia de 7 dias • 11x de R$ 5,43
            </p>
          </div>
          <Selos />
          <p className="text-[11.5px] font-semibold text-sub mt-8 leading-relaxed">
            NoctaLev © {new Date().getFullYear()} — Este produto não substitui orientação médica.
            Resultados variam de pessoa para pessoa.
          </p>
        </section>

      </div>

      {/* ============ BOTÃO STICKY ============ */}
      <div className={`sticky-oferta ${sticky ? "visivel" : ""}`}>
        <div className="max-w-md mx-auto">
          <Cta pulso={false} mini>
            Garantir meu acesso — 11x R$ 5,43
          </Cta>
        </div>
      </div>
    </main>
  );
}
