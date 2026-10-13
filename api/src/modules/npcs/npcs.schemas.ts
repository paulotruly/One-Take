import { z } from "zod";
import { kitIdsSchema } from "../../lib/kits.js";
import { inteiro, texto, urlOpcional } from "../../lib/validacao.js";

// Sem defaults aqui: no Zod 4 o default seria aplicado também no PATCH (partial).
const base = z.object({
  nome: texto(60),
  descricao: z.string().trim().max(2000),
  imagemUrl: urlOpcional(),
  /** Raça é obrigatória; classe é opcional (NPC simples = só raça). */
  racaId: z.guid("Escolha uma raça"),
  classeId: z.guid("Classe inválida").nullable(),
  nivel: inteiro(1, 100),
  /** Vida, mana e esforço base (nível 1): obrigatórios quando o NPC não tem classe. */
  vidaBase: inteiro(1, 9999).nullable(),
  manaBase: inteiro(1, 9999).nullable(),
  esforcoBase: inteiro(1, 9999).nullable(),
  /** Kits de RPG em que está (sem kit = geral). */
  kitIds: kitIdsSchema,
});

export const criarNpcSchema = base.extend({
  descricao: base.shape.descricao.default(""),
  classeId: base.shape.classeId.default(null),
  nivel: base.shape.nivel.default(1),
  vidaBase: base.shape.vidaBase.default(null),
  manaBase: base.shape.manaBase.default(null),
  esforcoBase: base.shape.esforcoBase.default(null),
});

export const editarNpcSchema = base.partial().extend({
  /** Recursos atuais (limitados entre 0 e o máximo). */
  vidaAtual: inteiro(0, 99999).optional(),
  manaAtual: inteiro(0, 99999).optional(),
  esforcoAtual: inteiro(0, 99999).optional(),
});

export const npcAtributoSchema = z.object({ dados: inteiro(0, 20) });
export const npcPericiaSchema = z.object({ pontos: inteiro(-99, 99) });
export const filtroNpcsSchema = z.object({ kitId: z.guid().optional() });
