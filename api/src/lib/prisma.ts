import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

export function criarPrisma(connectionString: string) {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

// Instância única da aplicação, criada no primeiro uso (DATABASE_URL = conexão pooled).
let instancia: PrismaClient | undefined;
export function getPrisma() {
  if (!instancia) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL não definida");
    instancia = criarPrisma(url);
  }
  return instancia;
}

export type { PrismaClient };
