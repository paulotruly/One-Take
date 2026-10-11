import { createClient } from "@supabase/supabase-js";

function obrigatoria(nome: string, valor: string | undefined) {
  if (!valor) throw new Error(`Variável ${nome} não definida. Copie web/.env.example para web/.env.`);
  return valor;
}

export const API_URL = obrigatoria("VITE_API_URL", import.meta.env.VITE_API_URL).replace(/\/$/, "");

export const supabase = createClient(
  obrigatoria("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL),
  obrigatoria("VITE_SUPABASE_PUBLISHABLE_KEY", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
);
