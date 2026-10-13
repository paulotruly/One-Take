import { z } from "zod";
import { TipoStatus } from "../../generated/prisma/enums.js";
import { kitIdsSchema } from "../../lib/kits.js";
import { texto } from "../../lib/validacao.js";

// Status criados pelo mestre são sempre manuais (aplicados por ele); gatilhos automáticos são só do sistema.
const base = z.object({
  nome: texto(40),
  descricao: z.string().trim().max(500),
  efeito: texto(500),
  tipo: z.enum(TipoStatus),
  /** Kits de RPG em que o status está (sem kit = geral). */
  kitIds: kitIdsSchema,
});

export const criarStatusSchema = base.extend({ descricao: base.shape.descricao.default("") });
export const editarStatusSchema = base.partial();

export const aplicarStatusSchema = z.object({ statusId: z.guid("Escolha um status") });
