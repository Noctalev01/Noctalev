"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { load } from "./store";

// carrega o estado local e redireciona se não há sessão/perfil
export function useSesion({ exigePerfil = true } = {}) {
  const router = useRouter();
  const [s, setS] = useState(null);
  useEffect(() => {
    const st = load();
    if (!st.tel) { router.replace("/entrar" + (typeof window !== "undefined" ? window.location.search : "")); return; }
    if (exigePerfil && !st.perfil?.nombre) { router.replace("/bienvenida"); return; }
    setS(st);
  }, [router, exigePerfil]);
  const refrescar = useCallback(() => setS({ ...load() }), []);
  return [s, refrescar];
}
