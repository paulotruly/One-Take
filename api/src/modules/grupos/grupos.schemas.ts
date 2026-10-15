import { z } from "zod";
import { inteiro, texto, urlOpcional } from "../../lib/validacao.js";
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
  /** Máximo de fichas por função da classe; null = sem limite, 0 = função fechada. */
  limiteCombatentes: inteiro(0, 50).nullable(),
  limiteVanguardistas: inteiro(0, 50).nullable(),
  limiteSuportes: inteiro(0, 50).nullable(),
  /** Regras padrão de combate desligadas neste grupo (slugs). */
  regrasPadraoDesativadas: z
    .array(z.string())
    .refine((l) => l.every((s) => SLUGS_REGRAS_PADRAO.includes(s)), "Regra padrão desconhecida")
    .default([]),
  /** Kit de RPG do grupo (opcional): o que aparece nele é o do kit + o geral. */
  kitId: z.guid("Kit inválido").nullable(),
});

export const criarGrupoSchema = base.extend({
  kitId: base.shape.kitId.default(null),
  limiteCombatentes: base.shape.limiteCombatentes.default(null),
  limiteVanguardistas: base.shape.limiteVanguardistas.default(null),
  limiteSuportes: base.shape.limiteSuportes.default(null),
  disponiveis: disponiveisSchema.optional(),
});
export const editarGrupoSchema = base.partial().extend({
  regrasPadraoDesativadas: base.shape.regrasPadraoDesativadas.removeDefault().optional(),
});

/** Regra própria do mestre para o grupo. */
export const regraDaMesaSchema = z.object({ titulo: texto(80), texto: texto(4000) });
