import { z } from "zod";
import { kitIdsSchema } from "../../lib/kits.js";
import { inteiro, texto, urlOpcional } from "../../lib/validacao.js";

// Vida, mana e esforço base (nível 1): como nas classes, nenhum pode ser zero.
const pontos = inteiro(1, 9999);

const base = z.object({
  titulo: texto(80),
  descricao: texto(2000),
  imagemUrl: urlOpcional(),
  pontosVida: pontos,
  pontosMana: pontos,
  pontosEsforco: pontos,
  /** Quadrados no grid por turno. */
  deslocamento: inteiro(1, 99),
  /** Kits de RPG em que está (sem kit = geral). */
  kitIds: kitIdsSchema,
  /** Opcional: forma deste arquétipo de criatura. */
  conceitoId: z.guid("Arquétipo de criatura inválido").nullish(),
});

export const criarBestaSchema = base;
export const editarBestaSchema = base.partial();

export const bestaPericiaSchema = z.object({ modificador: inteiro(-99, 99) });

/** Dados (d20) da besta num atributo. 0 = tira o atributo. */
export const bestaAtributoSchema = z.object({ dados: inteiro(0, 20) });

// ---------- Criaturas (criaturas invocadas num grupo) ----------

export const invocarSchema = z.object({
  bestaId: z.guid("Escolha uma criatura"),
  nivel: inteiro(1, 100).default(1),
  /** Quantas criaturas iguais invocar de uma vez. */
  quantidade: inteiro(1, 20).default(1),
});

export const editarCriaturaSchema = z.object({
  nome: texto(60).optional(),
  vidaAtual: inteiro(0, 99999).optional(),
  manaAtual: inteiro(0, 99999).optional(),
  esforcoAtual: inteiro(0, 99999).optional(),
});
