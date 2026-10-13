import { z } from "zod";
import { GrupoClasse } from "../../generated/prisma/enums.js";
import { grupoExclusivoSchema } from "../../lib/exclusividade.js";
import { inteiro, texto, urlOpcional } from "../../lib/validacao.js";

// Vida, mana e esforço base: nenhuma classe começa zerada.
const pontos = inteiro(1, 9999);

export const criarClasseSchema = z.object({
  grupo: z.enum(GrupoClasse),
  titulo: texto(80),
  descricao: texto(2000),
  imagemUrl: urlOpcional(),
  pontosVida: pontos,
  pontosMana: pontos,
  pontosEsforco: pontos,
  /** Opcional: só vale neste grupo. Nulo/ausente = geral. */
  grupoExclusivoId: grupoExclusivoSchema,
  /** Opcional: subclasse deste arquétipo. */
  conceitoId: z.guid("Arquétipo inválido").nullish(),
});

export const editarClasseSchema = criarClasseSchema.partial();

export const filtroClassesSchema = z.object({
  grupo: z.enum(GrupoClasse).optional(),
});
