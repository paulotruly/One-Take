import { z } from "zod";
import { grupoExclusivoSchema } from "../../lib/exclusividade.js";
import { inteiro, texto, urlOpcional } from "../../lib/validacao.js";

const base = z.object({
  titulo: texto(80),
  descricao: texto(2000),
  imagemUrl: urlOpcional(),
  /** Quadrados no grid por turno. */
  deslocamento: inteiro(1, 99),
  /** Opcional: só vale neste grupo. Nulo/ausente = geral. */
  grupoExclusivoId: grupoExclusivoSchema,
});

export const criarRacaSchema = base;
export const editarRacaSchema = base.partial();

/** Pontos base que a raça dá numa perícia. */
export const racaPericiaSchema = z.object({
  pontos: inteiro(1, 99),
});
