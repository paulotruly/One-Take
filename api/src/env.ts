import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  SUPABASE_URL: z.url(),
  /** Chave publishable/anon (pública): usada no login por nickname. */
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:5173")
    .transform((v) => v.split(",").map((o) => o.trim()).filter(Boolean)),
  PORT: z.coerce.number().int().positive().default(3333),
  /** "1" atrás de um proxy reverso (Render): o IP real vem no X-Forwarded-For. */
  TRUST_PROXY: z.string().default("").transform((v) => v === "1" || v === "true"),
});

// Opcional: sem a chave secreta, cadastro, "esqueceu a senha" e exclusão de conta respondem 503 com aviso claro.
if (!process.env.SUPABASE_SECRET_KEY) {
  console.warn("[env] Sem SUPABASE_SECRET_KEY: cadastro, recuperação de senha e exclusão de conta ficam indisponíveis.");
}

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Variáveis de ambiente inválidas:\n" + z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
