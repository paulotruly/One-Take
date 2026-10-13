// Estrutura fixa do sistema: atributos, status, categorias de item e perícias base. Idempotente (ids fixos).
// Não cria classes: o sistema começa sem classes fixas; uma classe de mestre vira fixa com `npm run fixar-classe`.
import "dotenv/config";
import { criarPrisma } from "../src/lib/prisma.js";
import { ATRIBUTOS_FIXOS, PERICIAS_BASE } from "./pericias-base.js";
import { STATUS_BASE } from "./status-base.js";

async function main() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("Defina DIRECT_URL ou DATABASE_URL");
  const prisma = criarPrisma(url);

  for (const { id, ...dados } of Object.values(ATRIBUTOS_FIXOS)) {
    await prisma.atributo.upsert({ where: { id }, create: { id, ...dados, donoId: null }, update: dados });
  }
  console.log(`ok: ${Object.keys(ATRIBUTOS_FIXOS).length} atributos fixos`);

  for (const { id, ...dados } of STATUS_BASE) {
    await prisma.status.upsert({ where: { id }, create: { id, ...dados, donoId: null }, update: dados });
  }
  console.log(`ok: ${STATUS_BASE.length} status fixos`);

  const categorias = [
    { id: "00000000-0000-4000-8004-000000000001", nome: "Armas", descricao: "Espadas, arcos, cajados: o que se usa para lutar.", icone: "espada", ordem: 1 },
    { id: "00000000-0000-4000-8004-000000000002", nome: "Artefatos", descricao: "Objetos especiais, mágicos ou raros.", icone: "joia", ordem: 2 },
    { id: "00000000-0000-4000-8004-000000000003", nome: "Taverna", descricao: "Comidas, bebidas, poções e outros consumíveis.", icone: "caneca", ordem: 3 },
    { id: "00000000-0000-4000-8004-000000000004", nome: "Sebo", descricao: "Livros, mapas, pergaminhos e achados usados.", icone: "livro", ordem: 4 },
  ];
  for (const { id, ...dados } of categorias) {
    await prisma.categoriaItem.upsert({ where: { id }, create: { id, ...dados, donoId: null }, update: dados });
  }
  console.log(`ok: ${categorias.length} categorias de item fixas`);

  for (const { id, ...dados } of PERICIAS_BASE) {
    await prisma.pericia.upsert({ where: { id }, create: { id, ...dados, donoId: null }, update: dados });
  }
  console.log(`ok: ${PERICIAS_BASE.length} perícias base`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
