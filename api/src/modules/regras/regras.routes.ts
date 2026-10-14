import { Router } from "express";
import { getPrisma } from "../../lib/prisma.js";
import { REGRAS_PADRAO } from "../../regras/combate.js";
import { DEFESAS } from "../../regras/defesas.js";
import { CONTA } from "../../regras/conta.js";
import { FICHA } from "../../regras/ficha.js";
import { PROGRESSAO } from "../../regras/progressao.js";
import { TESTE, tabelaDeChances } from "../../regras/teste.js";

// Regras públicas do sistema (sem login): usadas pela página inicial de regras.
export const regrasRouter = Router();

regrasRouter.get("/regras", async (_req, res) => {
  const atributosFixos = await getPrisma().atributo.findMany({
    where: { donoId: null },
    orderBy: { ordem: "asc" },
    select: { nome: true, descricao: true },
  });
  const statusFixos = await getPrisma().status.findMany({
    where: { donoId: null },
    orderBy: { ordem: "asc" },
    select: { nome: true, descricao: true, efeito: true, tipo: true, gatilho: true },
  });
  res.json({
    progressao: PROGRESSAO,
    ficha: FICHA,
    teste: { ...TESTE, chances: tabelaDeChances([5, 8, 10, 12, 15, 18, 20, 25], 4) },
    atributosFixos,
    statusFixos,
    regrasPadrao: REGRAS_PADRAO,
    defesas: DEFESAS,
    conta: { idadeMinima: CONTA.idadeMinima },
  });
});
