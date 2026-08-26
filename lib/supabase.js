"use client";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Cliente do navegador (anon key + RLS). Sessão persiste no localStorage.
export const supabase = url && anon ? createClient(url, anon) : null;

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}
