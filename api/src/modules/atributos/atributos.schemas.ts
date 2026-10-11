import { z } from "zod";
import { grupoExclusivoSchema } from "../../lib/exclusividade.js";
import { texto } from "../../lib/validacao.js";

const base = z.object({
  nome: texto(60),
  descricao: z.string().trim().max(1000),
  /** Opcional: só vale neste grupo. Nulo/ausente = geral. */
  grupoExclusivoId: grupoExclusivoSchema,
});

export const criarAtributoSchema = base.extend({ descricao: base.shape.descricao.default("") });
export const editarAtributoSchema = base.partial();
