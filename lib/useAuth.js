"use client";
// Hook central de autenticação + sync.
// Retorna { pronto, sessao, userId } e faz pull da nuvem 1x por abertura.
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { pullFromCloud } from "./sync";
import { load } from "./store";

let pulledOnce = false;

export function useAuth() {
  const [pronto, setPronto] = useState(false);
  const [sessao, setSessao] = useState(null);

  useEffect(() => {
    let ativo = true;
    async function init() {
      if (!supabase) { setPronto(true); return; } // modo offline/protótipo
      const { data } = await supabase.auth.getSession();
      const sess = data?.session || null;
      if (!ativo) return;
      setSessao(sess);
      if (sess && !pulledOnce) {
        pulledOnce = true;
        await pullFromCloud(sess.user.id);
      }
      setPronto(true);
    }
    init();
    const { data: sub } = supabase
      ? supabase.auth.onAuthStateChange((_e, sess) => { if (ativo) setSessao(sess); })
      : { data: null };
    return () => { ativo = false; sub?.subscription?.unsubscribe?.(); };
  }, []);

  return { pronto, sessao, userId: sessao?.user?.id || null };
}

// Guard simples: exige sessão (se Supabase configurado) e perfil local.
// Retorna { pronto, userId, temSessao, temPerfil }
export function useGuard() {
  const { pronto, sessao, userId } = useAuth();
  const [temPerfil, setTemPerfil] = useState(false);
  useEffect(() => {
    if (pronto) setTemPerfil(!!load().perfil);
  }, [pronto, sessao]);
  return {
    pronto,
    userId,
    temSessao: supabase ? !!sessao : true,
    temPerfil,
  };
}
