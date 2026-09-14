"use client";
// ============================================================
// NoctaLev Studio — realçador de fotos (upsell Cakto 35gq5du)
// • Comprou → realce ilimitado, 1 botão, sem marca d'água
// • Não comprou → tela de venda com checkout Cakto
// O realce roda 100% no celular (canvas): luz, cor, contraste,
// nitidez — NUNCA altera rosto/corpo (promessa do produto).
// ============================================================
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell, Splash } from "../../components/ui";
import { load } from "../../lib/store";
import { supabase } from "../../lib/supabase";

// Link de checkout do Studio na Cakto (oferta 35gq5du)
const CHECKOUT_STUDIO = "https://pay.cakto.com.br/35gq5du";

// ===== Motor de realce (só cor/luz/nitidez — preserva a pessoa) =====
function realcarImagem(img) {
  const MAX = 2048;
  let w = img.naturalWidth, h = img.naturalHeight;
  if (Math.max(w, h) > MAX) { const k = MAX / Math.max(w, h); w = Math.round(w * k); h = Math.round(h * k); }
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const cx = cv.getContext("2d");
  cx.drawImage(img, 0, 0, w, h);
  const id = cx.getImageData(0, 0, w, h);
  const d = id.data;

  // 1) Auto-níveis por canal com corte de 0,4% (corrige exposição + tom de cor)
  const hist = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
  for (let i = 0; i < d.length; i += 4) { hist[0][d[i]]++; hist[1][d[i + 1]]++; hist[2][d[i + 2]]++; }
  const total = (d.length / 4), corte = total * 0.004;
  const lo = [0, 0, 0], hi = [255, 255, 255];
  for (let c = 0; c < 3; c++) {
    let acc = 0; for (let v = 0; v < 256; v++) { acc += hist[c][v]; if (acc > corte) { lo[c] = v; break; } }
    acc = 0; for (let v = 255; v >= 0; v--) { acc += hist[c][v]; if (acc > corte) { hi[c] = v; break; } }
    if (hi[c] - lo[c] < 40) { lo[c] = Math.max(0, lo[c] - 20); hi[c] = Math.min(255, hi[c] + 20); }
  }

  // LUTs: níveis + curva S suave (contraste) + leve calor ("golden natural")
  const luts = [new Uint8Array(256), new Uint8Array(256), new Uint8Array(256)];
  const calor = [6, 2, -4]; // tons quentes bem sutis
  for (let c = 0; c < 3; c++) {
    const range = hi[c] - lo[c] || 1;
    for (let v = 0; v < 256; v++) {
      let x = (v - lo[c]) / range; x = Math.min(1, Math.max(0, x));
      // curva S suave (mistura 22% de contraste)
      const s = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
      let y = (x * 0.78 + s * 0.22) * 255 + calor[c];
      luts[c][v] = Math.max(0, Math.min(255, Math.round(y)));
    }
  }

  // 2) Aplica LUT + vibrance (satura só o que está desbotado — preserva pele)
  for (let i = 0; i < d.length; i += 4) {
    let r = luts[0][d[i]], g = luts[1][d[i + 1]], b = luts[2][d[i + 2]];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const sat = mx === 0 ? 0 : (mx - mn) / mx;
    const boost = 0.22 * (1 - sat); // quanto menos cor, mais realça
    const med = (r + g + b) / 3;
    r += (r - med) * boost; g += (g - med) * boost; b += (b - med) * boost;
    d[i] = Math.max(0, Math.min(255, r));
    d[i + 1] = Math.max(0, Math.min(255, g));
    d[i + 2] = Math.max(0, Math.min(255, b));
  }
  cx.putImageData(id, 0, 0);

  // 3) Nitidez leve (unsharp mask via downscale-blur)
  const blur = document.createElement("canvas");
  blur.width = Math.max(1, w >> 2); blur.height = Math.max(1, h >> 2);
  blur.getContext("2d").drawImage(cv, 0, 0, blur.width, blur.height);
  const cx2 = cv.getContext("2d");
  cx2.globalCompositeOperation = "source-over";
  const fina = cx.getImageData(0, 0, w, h).data;
  const bc = document.createElement("canvas");
  bc.width = w; bc.height = h;
  const bcx = bc.getContext("2d");
  bcx.imageSmoothingEnabled = true;
  bcx.drawImage(blur, 0, 0, w, h);
  const borrada = bcx.getImageData(0, 0, w, h).data;
  const out = cx.getImageData(0, 0, w, h);
  const od = out.data, F = 0.35; // força da nitidez
  for (let i = 0; i < od.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = fina[i + c] + (fina[i + c] - borrada[i + c]) * F;
      od[i + c] = Math.max(0, Math.min(255, v));
    }
  }
  cx.putImageData(out, 0, 0);
  return cv;
}

export default function Studio() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [liberado, setLiberado] = useState(false);
  const [checando, setChecando] = useState(false);
  const [email, setEmail] = useState("");

  // fluxo de edição
  const [original, setOriginal] = useState(null);   // dataURL da foto escolhida
  const [resultado, setResultado] = useState(null); // dataURL realçada
  const [processando, setProcessando] = useState(false);
  const [verAntes, setVerAntes] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const fileRef = useRef(null);

  async function checarAcesso(em, comCache = true) {
    if (!em) return false;
    if (comCache && typeof localStorage !== "undefined" && localStorage.getItem("nl_studio") === "1") {
      setLiberado(true); // resposta instantânea; reconfirma em segundo plano
    }
    try {
      const r = await fetch("/api/studio", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em }),
      });
      const j = await r.json();
      setLiberado(!!j.liberado);
      try { localStorage.setItem("nl_studio", j.liberado ? "1" : "0"); } catch {}
      return !!j.liberado;
    } catch { return false; }
  }

  useEffect(() => {
    let ativo = true;
    async function init() {
      const st = load();
      if (!st.perfil) { router.replace("/onboarding"); return; }
      let em = st.perfil?.email || "";
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        em = data?.session?.user?.email || em;
      }
      if (!ativo) return;
      em = (em || "").trim().toLowerCase();
      setEmail(em);
      await checarAcesso(em);
      if (ativo) setPronto(true);
    }
    init();
    return () => { ativo = false; };
  }, [router]);

  function escolherFoto(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { setOriginal(rd.result); setResultado(null); setSalvo(false); setVerAntes(false); };
    rd.readAsDataURL(f);
    e.target.value = "";
  }

  function realcar() {
    if (!original || processando) return;
    setProcessando(true);
    const img = new Image();
    img.onload = () => {
      // pequeno atraso para o loading aparecer (processo é quase instantâneo)
      setTimeout(() => {
        try {
          const cv = realcarImagem(img);
          setResultado(cv.toDataURL("image/jpeg", 0.92));
        } catch {}
        setProcessando(false);
      }, 900);
    };
    img.onerror = () => setProcessando(false);
    img.src = original;
  }

  async function salvar() {
    if (!resultado) return;
    try {
      const blob = await (await fetch(resultado)).blob();
      const file = new File([blob], "noctalev-realcada.jpg", { type: "image/jpeg" });
      // iOS/Android PWA: compartilhar salva direto na galeria
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
        setSalvo(true); return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "noctalev-realcada.jpg";
      a.click();
      setSalvo(true);
    } catch {}
  }

  function abrirCheckout() {
    window.open(CHECKOUT_STUDIO + (email ? `?email=${encodeURIComponent(email)}` : ""), "_blank");
  }

  async function jaPaguei() {
    setChecando(true);
    const ok = await checarAcesso(email, false);
    setChecando(false);
    if (!ok) alert("Ainda não encontramos sua compra. O pagamento pode levar 1–2 minutos para confirmar. Tente de novo em instantes. 💛");
  }

  if (!pronto) return <Splash />;

  // ============ BLOQUEADO — tela de venda ============
  if (!liberado) {
    return (
      <PageShell>
        <div className="text-center">
          <div className="eyebrow justify-center">✨ NOVIDADE NO SEU APP</div>
          <h1 className="text-[26px] font-black tracking-tight mt-2 leading-tight">
            NoctaLev <span className="text-gold">Studio</span>
          </h1>
          <p className="text-sub2 text-[14.5px] font-semibold mt-2 leading-relaxed px-1">
            Realce suas fotos em 1 toque. Luz, cor e qualidade —{" "}
            <b className="text-txt">sem mudar nada em você</b>. Quantas fotos quiser.
          </p>
        </div>

        <div className="card overflow-hidden mt-5 p-0">
          <img src="/img/studio-antes-depois-praia.webp" alt="Antes e depois — realce NoctaLev Studio" className="w-full block" />
        </div>
        <div className="card overflow-hidden mt-3 p-0">
          <img src="/img/studio-antes-depois-jantar.webp" alt="Antes e depois — qualidade e cor" className="w-full block" />
        </div>

        <div className="card p-5 mt-4">
          {[
            ["✨", "1 botão — resultado em segundos, sem menus"],
            ["🔒", "Não muda rosto nem corpo: só luz, cor e nitidez"],
            ["♾️", "Fotos ilimitadas, sem marca d'água"],
            ["💳", "Pagamento único — sem mensalidade"],
          ].map(([e, t]) => (
            <div key={t} className="flex gap-3 items-start mb-2.5 last:mb-0">
              <span className="text-[17px] flex-none">{e}</span>
              <span className="text-[14px] text-sub2 font-semibold leading-relaxed">{t}</span>
            </div>
          ))}
        </div>

        <div className="card p-5 mt-4 text-center" style={{ borderColor: "rgba(251,211,141,.35)" }}>
          <div className="text-sub text-[13px] font-bold line-through">R$ 67,00</div>
          <div className="text-gold text-[34px] font-black leading-tight">R$ 19,90</div>
          <div className="text-sub2 text-[12.5px] font-semibold">pagamento único</div>
          <button onClick={abrirCheckout} className="cta-gold w-full py-4 mt-4 text-[16px]">
            Desbloquear o Studio ✨
          </button>
          <p className="text-sub text-[11.5px] font-semibold mt-3">
            Liberação automática após o pagamento.
          </p>
        </div>

        <button onClick={jaPaguei} disabled={checando}
          className="w-full py-3 mt-3 text-[13.5px] font-bold text-lilac text-center disabled:opacity-50">
          {checando ? "Verificando..." : "Já paguei — liberar meu acesso"}
        </button>
      </PageShell>
    );
  }

  // ============ LIBERADO — o realçador ============
  return (
    <PageShell>
      <div className="text-center">
        <div className="eyebrow justify-center">✨ NOCTALEV STUDIO</div>
        <h1 className="text-[24px] font-black tracking-tight mt-1">Realce suas fotos</h1>
        <p className="text-sub2 text-[13.5px] font-semibold mt-1">
          Luz, cor e qualidade em 1 toque — sem mudar nada em você. 🌙
        </p>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={escolherFoto} />

      {/* Sem foto ainda */}
      {!original && (
        <button onClick={() => fileRef.current?.click()}
          className="card w-full mt-6 py-14 flex flex-col items-center gap-3 active:opacity-80"
          style={{ borderStyle: "dashed", borderColor: "rgba(165,180,252,.4)" }}>
          <span className="text-[44px]">🖼️</span>
          <span className="text-[16px] font-extrabold">Escolher foto</span>
          <span className="text-sub text-[12.5px] font-semibold">Toque para abrir sua galeria</span>
        </button>
      )}

      {/* Foto escolhida */}
      {original && (
        <>
          <div className="card overflow-hidden mt-5 p-0 relative"
            onTouchStart={() => resultado && setVerAntes(true)}
            onTouchEnd={() => setVerAntes(false)}
            onMouseDown={() => resultado && setVerAntes(true)}
            onMouseUp={() => setVerAntes(false)}
            onMouseLeave={() => setVerAntes(false)}>
            <img src={resultado && !verAntes ? resultado : original} alt="Sua foto" className="w-full block" />
            {resultado && (
              <div className="absolute top-3 left-3 text-[11px] font-black rounded-full px-3 py-1.5"
                style={{ background: "rgba(8,11,26,.75)", color: verAntes ? "#a5b4fc" : "#7ee8b2", backdropFilter: "blur(4px)" }}>
                {verAntes ? "ANTES" : "✨ DEPOIS"}
              </div>
            )}
            {processando && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                style={{ background: "rgba(10,13,30,.72)", backdropFilter: "blur(3px)" }}>
                <span className="text-[36px] anim-float">🌙</span>
                <span className="text-[14.5px] font-extrabold">Realçando sua luz…</span>
              </div>
            )}
          </div>
          {resultado && (
            <p className="text-sub text-[12px] font-semibold text-center mt-2">
              Segure o dedo na foto para ver o ANTES
            </p>
          )}

          {!resultado && !processando && (
            <button onClick={realcar} className="cta-gold w-full py-4 mt-5 text-[17px]">
              ✨ Realçar
            </button>
          )}

          {resultado && (
            <>
              {salvo && (
                <div className="card p-3.5 mt-4 text-center text-[13.5px] font-bold text-green"
                  style={{ borderColor: "rgba(126,232,178,.4)" }}>
                  ✅ Foto salva! Confira na sua galeria.
                </div>
              )}
              <button onClick={salvar} className="cta-gold w-full py-4 mt-4 text-[16px]">
                💾 Salvar na galeria
              </button>
              <button onClick={() => { setOriginal(null); setResultado(null); setSalvo(false); }}
                className="card w-full py-3.5 mt-3 text-[14.5px] font-extrabold text-lilac">
                Realçar outra foto
              </button>
            </>
          )}

          {!resultado && !processando && (
            <button onClick={() => fileRef.current?.click()}
              className="w-full py-3 mt-2 text-[13.5px] font-bold text-sub text-center">
              Trocar de foto
            </button>
          )}
        </>
      )}
    </PageShell>
  );
}
