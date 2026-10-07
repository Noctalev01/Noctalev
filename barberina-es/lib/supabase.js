import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Só a chave ANON. Sem env → app roda 100% local (modo protótipo).
export const supabase = url && anon ? createClient(url, anon, { auth: { persistSession: false } }) : null;
