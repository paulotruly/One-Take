import { z } from "zod";
import { inteiro, texto, textoOpcional, urlOpcional } from "../../lib/validacao.js";
import { SLUGS_REGRAS_PADRAO } from "../../regras/combate.js";

const ids = z.array(z.guid()).max(500);

/** O que vale no grupo. Perícias precisam estar dentro dos atributos escolhidos. */
export const disponiveisSchema = z.object({
  classeIds: ids,
  racaIds: ids,
  atributoIds: ids,
  periciaIds: ids,
  /** Status ativados no grupo (opcional). */
  statusIds: ids.default([]),
});

const base = z.object({
  titulo: texto(80),
  sinopse: texto(4000),
  genero: texto(60),
  imagemUrl: urlOpcional(),
  limiteMembros: inteiro(1, 50),
  permitirClassesRepetidas: z.boolean(),
  /** Regras padrão de combate desligadas neste grupo (slugs). */
  regrasPadraoDesativadas: z
    .array(z.string())
    .refine((l) => l.every((s) => SLUGS_REGRAS_PADRAO.includes(s)), "Regra padrão desconhecida")
    .default([]),
});

export const criarGrupoSchema = base.extend({ disponiveis: disponiveisSchema.optional() });
export const editarGrupoSchema = base.partial().extend({
  regrasPadraoDesativadas: base.shape.regrasPadraoDesativadas.removeDefault().optional(),
});

export const criarItemSchema = z.object({
  nome: texto(80),
  descricao: z.string().trim().max(1000).default(""),
  /** Ficha que recebe o item; ausente/nulo = fica vago no grupo. */
  fichaId: z.guid().nullish(),
});

export const editarItemSchema = z.object({
  nome: texto(80).optional(),
  descricao: textoOpcional(1000).transform((v) => (v === undefined ? undefined : v ?? "")),
});

export const moverItemSchema = z.object({
  /** Ficha de destino; nulo = descartar (fica vago no grupo). */
  fichaId: z.guid().nullable(),
});

/** Regra própria do mestre para o grupo. */
export const regraDaMesaSchema = z.object({ titulo: texto(80), texto: texto(4000) });
