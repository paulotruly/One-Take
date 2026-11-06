// Kits de RPG: coleções do mestre. Cada coisa (classe, raça, atributo, perícia, status, item do catálogo, criatura, NPC)
// pode estar em vários kits; sem kit = geral. Substituem o antigo "exclusivo de um grupo".
import { z } from "zod";
import { naoEncontrado } from "./errors.js";
import { getPrisma } from "./prisma.js";
import { sincronizarMesas } from "../modules/grupos/kit-da-mesa.js";

/** Campo opcional nos corpos de criar/editar: a lista completa de kits (substitui a anterior). Ausente = não mexe. */
export const kitIdsSchema = z.array(z.guid("Kit inválido")).max(50).optional();

export type TipoKit = "classe" | "raca" | "atributo" | "pericia" | "status" | "itemModelo" | "besta" | "npc";

/** Include padrão para devolver os kits de algo. */
export const comKits = { kits: { select: { kitId: true } } } as const;

/** `{ kits: [{ kitId }] }` -> `{ kitIds: [...] }` (sem o campo `kits`). */
export function comKitIds<T extends { kits?: { kitId: string }[] }>(obj: T): Omit<T, "kits"> & { kitIds: string[] } {
  const { kits, ...resto } = obj;
  return { ...resto, kitIds: (kits ?? []).map((k) => k.kitId) };
}

/** Os kits precisam ser do próprio mestre. */
export async function validarKits(kitIds: string[] | undefined, mestreId: string) {
  if (!kitIds?.length) return;
  const unicos = [...new Set(kitIds)];
  const n = await getPrisma().kit.count({ where: { id: { in: unicos }, donoId: mestreId } });
  if (n !== unicos.length) throw naoEncontrado("Kit não encontrado");
}

/** Kit de um grupo: do próprio mestre. */
export async function validarKitDoGrupo(kitId: string | null | undefined, mestreId: string) {
  if (!kitId) return;
  const n = await getPrisma().kit.count({ where: { id: kitId, donoId: mestreId } });
  if (n === 0) throw naoEncontrado("Kit não encontrado");
}

/** Kits em que o registro está hoje. */
async function kitsAtuais(tipo: TipoKit, id: string): Promise<string[]> {
  const prisma = getPrisma();
  const onde = { select: { kitId: true } } as const;
  const atuais = {
    classe: () => prisma.kitClasse.findMany({ where: { classeId: id }, ...onde }),
    raca: () => prisma.kitRaca.findMany({ where: { racaId: id }, ...onde }),
    atributo: () => prisma.kitAtributo.findMany({ where: { atributoId: id }, ...onde }),
    pericia: () => prisma.kitPericia.findMany({ where: { periciaId: id }, ...onde }),
    status: () => prisma.kitStatus.findMany({ where: { statusId: id }, ...onde }),
    itemModelo: () => prisma.kitItemModelo.findMany({ where: { itemModeloId: id }, ...onde }),
    besta: () => prisma.kitBesta.findMany({ where: { bestaId: id }, ...onde }),
    npc: () => prisma.kitNpc.findMany({ where: { npcId: id }, ...onde }),
  } as const;
  return ((await atuais[tipo]()) ?? []).map((l) => l.kitId);
}

/** Liga o registro aos kits informados (troca a lista inteira) e atualiza as mesas desses kits. `undefined` = não mexe. */
export async function definirKits(tipo: TipoKit, id: string, kitIds: string[] | undefined, mestreId: string) {
  if (kitIds === undefined) return;
  await validarKits(kitIds, mestreId);
  const prisma = getPrisma();
  const unicos = [...new Set(kitIds)];
  const antes = await kitsAtuais(tipo, id);
  const ops = {
    classe: () => [prisma.kitClasse.deleteMany({ where: { classeId: id } }), prisma.kitClasse.createMany({ data: unicos.map((kitId) => ({ kitId, classeId: id })) })],
    raca: () => [prisma.kitRaca.deleteMany({ where: { racaId: id } }), prisma.kitRaca.createMany({ data: unicos.map((kitId) => ({ kitId, racaId: id })) })],
    atributo: () => [prisma.kitAtributo.deleteMany({ where: { atributoId: id } }), prisma.kitAtributo.createMany({ data: unicos.map((kitId) => ({ kitId, atributoId: id })) })],
    pericia: () => [prisma.kitPericia.deleteMany({ where: { periciaId: id } }), prisma.kitPericia.createMany({ data: unicos.map((kitId) => ({ kitId, periciaId: id })) })],
    status: () => [prisma.kitStatus.deleteMany({ where: { statusId: id } }), prisma.kitStatus.createMany({ data: unicos.map((kitId) => ({ kitId, statusId: id })) })],
    itemModelo: () => [prisma.kitItemModelo.deleteMany({ where: { itemModeloId: id } }), prisma.kitItemModelo.createMany({ data: unicos.map((kitId) => ({ kitId, itemModeloId: id })) })],
    besta: () => [prisma.kitBesta.deleteMany({ where: { bestaId: id } }), prisma.kitBesta.createMany({ data: unicos.map((kitId) => ({ kitId, bestaId: id })) })],
    npc: () => [prisma.kitNpc.deleteMany({ where: { npcId: id } }), prisma.kitNpc.createMany({ data: unicos.map((kitId) => ({ kitId, npcId: id })) })],
  } as const;
  await prisma.$transaction(ops[tipo]());
  await sincronizarMesas([...antes, ...unicos]);
}

/** Filtro de listagem "o que aparece com este kit": o que é do kit + o que é geral (sem kit). */
export function visivelNoKit(kitId: string | null | undefined) {
  if (!kitId) return {};
  return { OR: [{ kits: { none: {} } }, { kits: { some: { kitId } } }] };
}
