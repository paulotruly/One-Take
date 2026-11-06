import { Router } from "express";
import { z } from "zod";
import { getPrisma } from "../../lib/prisma.js";
import { REGRAS_PADRAO } from "../../regras/combate.js";
import { DEFESAS } from "../../regras/defesas.js";
import { CONTA } from "../../regras/conta.js";
import { FICHA } from "../../regras/ficha.js";
import { PROGRESSAO } from "../../regras/progressao.js";
import { TESTE, chanceDeSucesso, mediaDoTeste, notacaoDoTeste, tabelaDeChances } from "../../regras/teste.js";

// Regras públicas do sistema (sem login): usadas pela página inicial de regras.
export const regrasRouter = Router();

// Atributos e status de exemplo na documentação pública: os da conta ADMIN (a do criador do jogo). Não há conteúdo fixo
// nem compartilhado: cada mestre cria os dele.
const doAdmin = { dono: { cargo: "ADMIN" as const } };

const chanceSchema = z.object({
  pontos: z.coerce.number().int().min(0).max(20),
  bonus: z.coerce.number().int().min(-50).max(100).default(0),
  dt: z.coerce.number().int().min(1).max(200),
  esforco: z.coerce.number().int().min(0).max(TESTE.esforcoMaximoPorRodada).default(0),
});

/** Calculadora da documentação: chance de alcançar a DT, com a regra da API. */
regrasRouter.get("/regras/chance", (req, res) => {
  const { pontos: pontosAtributo, bonus, dt, esforco: esforcoGasto } = chanceSchema.parse(req.query);
  res.json({
    chance: chanceDeSucesso({ pontosAtributo, bonus, dt, esforcoGasto }),
    media: mediaDoTeste({ pontosAtributo, bonus, esforcoGasto }),
    notacao: notacaoDoTeste(pontosAtributo + (pontosAtributo > 0 ? esforcoGasto : 0), bonus),
  });
});

regrasRouter.get("/regras", async (_req, res) => {
  const atributosBase = await getPrisma().atributo.findMany({
    where: doAdmin,
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    select: { nome: true, descricao: true },
  });
  const statusBase = await getPrisma().status.findMany({
    where: doAdmin,
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
