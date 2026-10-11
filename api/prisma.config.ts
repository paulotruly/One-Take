import "dotenv/config";
import { defineConfig } from "prisma/config";

// A CLI (migrate, studio, seed) usa a conexão DIRETA (sem pooler).
// A aplicação usa DATABASE_URL (pooled) via driver adapter, em src/lib/prisma.ts.
// process.env (e não env()) para `prisma generate` funcionar sem .env, como no build do Render.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? "",
  },
});
