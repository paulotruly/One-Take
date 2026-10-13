import { z } from "zod";
import { kitIdsSchema } from "../../lib/kits.js";
import { inteiro, texto, urlOpcional } from "../../lib/validacao.js";

const base = z.object({
  titulo: texto(80),
  descricao: texto(2000),
  imagemUrl: urlOpcional(),
  /** Quadrados no grid por turno. */
  deslocamento: inteiro(1, 99),
  /** Kits de RPG em que está (sem kit = geral). */
  kitIds: kitIdsSchema,
  /** Opcional: sub-raça deste arquétipo de raça. */
  conceitoId: z.guid("Arquétipo de raça inválido").nullish(),
});

export const criarRacaSchema = base;
export const editarRacaSchema = base.partial();

/** Pontos base que a raça dá numa perícia. */
export const racaPericiaSchema = z.object({
  pontos: inteiro(1, 99),
});
