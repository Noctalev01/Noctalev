"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { load, frascoRecibido, comprobarEntrega, refrescarClienta, perfilCompleto } from "./store";

// Carrega o estado local (instantâneo, nunca espera a rede), redireciona se
// não há sessão e — enquanto o pedido não foi entregue — consulta a liberação
// no Supabase ao abrir, ao voltar ao app e a cada 60 s.
export function useSesion({ exigePerfil = true } = {}) {
  const router = useRouter();
  const path = usePathname();
  const [s, setS] = useState(null);
  useEffect(() => {
    let st;
    try { st = load(); } catch { st = null; }
    if (!st?.token) { router.replace("/entrar"); return; }
    if (exigePerfil && !perfilCompleto(st)) { router.replace("/bienvenida"); return; }
    setS(st);
    if (perfilCompleto(st) && frascoRecibido(st) && !st.vistos?.recibido && path !== "/recibido") { router.replace("/recibido"); return; }
    let vivo = true;
    // dados frescos do banco (nome, estado) em segundo plano
    refrescarClienta().then(({ s: n }) => {
      if (!vivo) return;
      if (perfilCompleto(n) && frascoRecibido(n) && !n.vistos?.recibido && path !== "/recibido") { router.replace("/recibido"); return; }
      setS({ ...n });
    }).catch(() => {});
    if (frascoRecibido(st) || !exigePerfil) return () => { vivo = false; };
    async function check() {
      const r = await comprobarEntrega().catch(() => null);
      if (!vivo || !r) return;
      if (r.recibido) { router.replace("/recibido"); return; }
      setS({ ...r.s });
    }
    const t = setInterval(check, 60000);
    const vis = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", vis);
    return () => { vivo = false; clearInterval(t); document.removeEventListener("visibilitychange", vis); };
  }, [router, exigePerfil, path]);
  const refrescar = useCallback(() => setS({ ...load() }), []);
  return [s, refrescar];
}
