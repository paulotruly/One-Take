import { z } from "zod";
import { kitIdsSchema } from "../../lib/kits.js";
import { inteiro, texto, textoOpcional, urlOpcional } from "../../lib/validacao.js";
import { CATEGORIAS_FIXAS } from "./categorias.js";

// Campos de um item (os mesmos no molde do catálogo e no item lançado no grupo).
// Sem defaults aqui: no Zod 4 o default seria aplicado também no PATCH (partial).
const campos = z.object({
  /** Categoria fixa ou do mestre; null = sem categoria. */
  categoriaId: z.guid("Categoria inválida").nullable(),
  nome: texto(80),
  descricao: z.string().trim().max(1000),
  imagemUrl: urlOpcional(),
  /** O que acontece quando o personagem usa (texto; a mesa aplica). */
  efeito: textoOpcional(1000),
  /** Espaços que ocupa no inventário. */
  espacos: inteiro(1, 99),
  /** Usos até acabar; null = sem limite. */
  usosMaximos: inteiro(1, 999).nullable(),
  /** Pré-requisito em texto (informativo). */
  requisito: textoOpcional(200),
  /** Precisa ter esta perícia (do catálogo do mestre) para saber usar. */
  requisitoPericiaId: z.guid("Perícia inválida").nullable(),
  /** Precisa ser desta classe para saber usar. */
  requisitoClasseId: z.guid("Classe inválida").nullable(),
});

const comDefaults = campos.extend({
  categoriaId: campos.shape.categoriaId.default(CATEGORIAS_FIXAS.artefatos),
  descricao: campos.shape.descricao.default(""),
  espacos: campos.shape.espacos.default(1),
  usosMaximos: campos.shape.usosMaximos.default(null),
  requisitoPericiaId: campos.shape.requisitoPericiaId.default(null),
  requisitoClasseId: campos.shape.requisitoClasseId.default(null),
});

// ---------- Catálogo do mestre (moldes) ----------
export const criarModeloSchema = comDefaults.extend({ kitIds: kitIdsSchema });
export const editarModeloSchema = campos.extend({ kitIds: kitIdsSchema }).partial();

export const lancarSchema = z.object({
  /** Grupo onde o item entra (obrigatório, a não ser que vá para um NPC). */
  grupoId: z.guid("Escolha o grupo").optional(),
  /** Ficha que recebe; ausente/nulo = fica vago no grupo. */
  fichaId: z.guid().nullish(),
  /** NPC que recebe (no lugar de grupo/ficha). */
  npcId: z.guid("NPC inválido").optional(),
  quantidade: inteiro(1, 20).default(1),
});

// ---------- Item no grupo ----------
export const criarItemSchema = comDefaults.extend({
  /** Ficha que recebe o item; ausente/nulo = fica vago no grupo. */
  fichaId: z.guid().nullish(),
});

export const editarItemSchema = campos.partial().extend({
  /** O mestre pode repor ou ajustar os usos que restam. */
  usosRestantes: inteiro(0, 999).nullable().optional(),
});

export const moverItemSchema = z.object({
  /** Ficha de destino; nulo = fica vago no grupo. */
  fichaId: z.guid().nullable(),
  /** NPC de destino (só o mestre). */
  npcId: z.guid("NPC inválido").optional(),
  /** Grupo onde o item fica vago (só o mestre; necessário para item de NPC sem grupo). */
  grupoId: z.guid("Grupo inválido").optional(),
});
