import { z } from "zod";
import { kitIdsSchema } from "../../lib/kits.js";
import { texto } from "../../lib/validacao.js";

const base = z.object({
  nome: texto(60),
  descricao: z.string().trim().max(1000),
  /** Kits de RPG em que está (sem kit = geral). */
  kitIds: kitIdsSchema,
});

export const criarAtributoSchema = base.extend({ descricao: base.shape.descricao.default("") });
export const editarAtributoSchema = base.partial();
