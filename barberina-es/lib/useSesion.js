"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { load, frascoRecibido, comprobarEntrega } from "./store";

// Carrega o estado local, redireciona se não há sessão e — enquanto o pedido
// não foi entregue — consulta a liberação no Supabase ao abrir e a cada 60 s.
// Quando a equipe marca "entregado", a cliente vai direto para /recibido.
export function useSesion({ exigePerfil = true } = {}) {
  const router = useRouter();
  const path = usePathname();
  const [s, setS] = useState(null);
  useEffect(() => {
    const st = load();
    if (!st.tel) { router.replace("/entrar" + (typeof window !== "undefined" ? window.location.search : "")); return; }
    if (exigePerfil && !st.perfil?.nombre) { router.replace("/bienvenida"); return; }
    setS(st);
    if (frascoRecibido(st) && !st.vistos?.recibido && path !== "/recibido") { router.replace("/recibido"); return; }
    if (frascoRecibido(st) || !exigePerfil) return;
    let vivo = true;
    async function check() {
      const r = await comprobarEntrega();
      if (!vivo) return;
      if (r.recibido) { router.replace("/recibido"); return; }
      setS({ ...r.s });
    }
    check();
    const t = setInterval(check, 60000);
    const vis = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", vis);
    return () => { vivo = false; clearInterval(t); document.removeEventListener("visibilitychange", vis); };
  }, [router, exigePerfil, path]);
  const refrescar = useCallback(() => setS({ ...load() }), []);
  return [s, refrescar];
}
