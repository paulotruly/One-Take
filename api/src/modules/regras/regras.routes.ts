import { Router } from "express";
import { getPrisma } from "../../lib/prisma.js";
import { ehVerificado } from "../../lib/sistema.js";
import { REGRAS_PADRAO } from "../../regras/combate.js";
import { DEFESAS } from "../../regras/defesas.js";
import { CONTA } from "../../regras/conta.js";
import { FICHA } from "../../regras/ficha.js";
import { PROGRESSAO } from "../../regras/progressao.js";
import { TESTE, tabelaDeChances } from "../../regras/teste.js";

// Regras públicas do sistema (sem login): usadas pela página inicial de regras.
export const regrasRouter = Router();

// Atributos e status "base": os do administrador que estão verificados (selo ou kit verificado). Não há conteúdo fixo.
const doAdminVerificado = { dono: { cargo: "ADMIN" as const }, ...ehVerificado() };

regrasRouter.get("/regras", async (_req, res) => {
  const atributosBase = await getPrisma().atributo.findMany({
    where: doAdminVerificado,
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    select: { nome: true, descricao: true },
  });
  const statusBase = await getPrisma().status.findMany({
    where: doAdminVerificado,
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    select: { nome: true, efeito: true, tipo: true, gatilho: true },
  });
  res.json({
    progressao: PROGRESSAO,
    ficha: FICHA,
    teste: { ...TESTE, chances: tabelaDeChances([5, 8, 10, 12, 15, 18, 20, 25], 4) },
    atributosBase,
    statusBase,
    regrasPadrao: REGRAS_PADRAO,
    defesas: DEFESAS,
    conta: { idadeMinima: CONTA.idadeMinima },
  });
});
