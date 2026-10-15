import { z } from "zod";
import { TipoStatus } from "../../generated/prisma/enums.js";
import { kitIdsSchema } from "../../lib/kits.js";
import { inteiro, texto } from "../../lib/validacao.js";

// Status criados pelo mestre são sempre manuais (aplicados por ele); os automáticos (gatilho) vêm só do seed.
// Só há efeito (sem descrição): o que acontece com o personagem.
const base = z.object({
  nome: texto(40),
  efeito: texto(1000),
  tipo: z.enum(TipoStatus),
  /** Kits de RPG em que o status está (sem kit = geral). */
  kitIds: kitIdsSchema,
  /** Categoria do mestre (ou verificada); null = sem categoria. */
  categoriaId: z.guid("Categoria inválida").nullable().optional(),
});

export const criarStatusSchema = base;
export const editarStatusSchema = base.partial();

/** Turnos que o status dura (o mestre anota; nulo = sem prazo). */
const turnos = inteiro(1, 99).nullable();
export const aplicarStatusSchema = z.object({ statusId: z.guid("Escolha um status"), turnos: turnos.optional().transform((v) => v ?? null) });
/** Mudar os turnos que faltam: 0 tira o status; nulo = sem prazo. */
export const turnosStatusSchema = z.object({ turnos: inteiro(0, 99).nullable() });
