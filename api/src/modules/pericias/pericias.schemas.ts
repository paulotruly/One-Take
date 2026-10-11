import { z } from "zod";
import { CategoriaPericia } from "../../generated/prisma/enums.js";
import { inteiro, texto } from "../../lib/validacao.js";

// Perícia do catálogo. Sem defaults na base: no Zod 4 o default valeria também no PATCH.
const base = z.object({
  nome: texto(60),
  descricao: z.string().trim().max(1000),
  categoria: z.enum(CategoriaPericia),
  atributoId: z.guid("Escolha um atributo"),
});

export const criarPericiaSchema = base.extend({ descricao: base.shape.descricao.default("") });
export const editarPericiaSchema = base.partial();

/** Vínculo entre classe e perícia: o modificador daquela classe. */
export const vinculoSchema = z.object({
  modificador: inteiro(-99, 99),
});
