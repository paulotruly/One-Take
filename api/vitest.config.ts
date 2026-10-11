import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    env: {
      SUPABASE_URL: "https://teste.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "chave-publica-teste",
      DATABASE_URL: "postgresql://nao-usado",
    },
  },
});
