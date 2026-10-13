// Configurações lidas do ambiente na hora do uso (os testes podem trocar process.env).
// Nenhum valor secreto tem padrão no código.

export const config = {
  supabaseUrl: () => process.env.SUPABASE_URL ?? "",
  chavePublica: () => process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
  /** Chave secreta do Supabase (sb_secret_... ou service_role). Só no servidor. */
  chaveSecreta: () => process.env.SUPABASE_SECRET_KEY ?? "",
};
