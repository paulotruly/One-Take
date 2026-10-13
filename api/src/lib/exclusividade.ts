// "Geral" ou "exclusivo de um grupo" para classes, raças e atributos (sempre opcional).
// Exclusivo: só pode ser disponibilizado naquele grupo, e já entra disponível nele.
import { z } from "zod";
import { conflito, naoEncontrado } from "./errors.js";
import { getPrisma } from "./prisma.js";

/** Campo opcional: id do grupo (exclusivo) ou null (geral). */
export const grupoExclusivoSchema = z.guid("Grupo inválido").nullish();

/** O grupo precisa ser do próprio mestre. */
export async function validarGrupoExclusivo(grupoId: string | null | undefined, usuarioId: string) {
  if (!grupoId) return;
  const grupo = await getPrisma().grupo.findUnique({ where: { id: grupoId }, select: { mestreId: true } });
  if (!grupo || grupo.mestreId !== usuarioId) throw naoEncontrado("Grupo não encontrado");
}

type Tipo = "classe" | "raca" | "atributo";

/**
 * Antes de marcar algo como exclusivo de um grupo: ninguém de fora desse grupo pode estar usando.
 * (fichas de outros grupos, NPCs gerais ou de outro grupo, criaturas invocadas em outro grupo, bichos que não são do grupo).
 */
export async function garantirExclusividadePossivel(tipo: Tipo | "besta", id: string, grupoId: string | null | undefined) {
  if (!grupoId) return;
  const prisma = getPrisma();
  const foraDoGrupo = { NOT: { grupoExclusivoId: grupoId } };
  const npcFora = { OR: [{ grupoExclusivoId: null }, foraDoGrupo] };
  let usos: string[] = [];
  if (tipo === "classe") {
    const [fichas, npcs] = await Promise.all([
      prisma.ficha.count({ where: { classeId: id, NOT: { grupoId } } }),
      prisma.npc.count({ where: { classeId: id, ...npcFora } }),
    ]);
    usos = [fichas && `${fichas} ficha(s) de outros grupos`, npcs && `${npcs} NPC(s) de fora do grupo`].filter(Boolean) as string[];
  } else if (tipo === "raca") {
    const [fichas, npcs] = await Promise.all([
      prisma.ficha.count({ where: { racaId: id, NOT: { grupoId } } }),
      prisma.npc.count({ where: { racaId: id, ...npcFora } }),
    ]);
    usos = [fichas && `${fichas} ficha(s) de outros grupos`, npcs && `${npcs} NPC(s) de fora do grupo`].filter(Boolean) as string[];
  } else if (tipo === "atributo") {
    const [fichas, npcs, bestas] = await Promise.all([
      prisma.fichaAtributo.count({ where: { atributoId: id, ficha: { NOT: { grupoId } } } }),
      prisma.npcAtributo.count({ where: { atributoId: id, npc: npcFora } }),
      prisma.bestaAtributo.count({ where: { atributoId: id, besta: npcFora } }),
    ]);
    usos = [fichas && `${fichas} ficha(s) de outros grupos`, npcs && `${npcs} NPC(s) de fora do grupo`, bestas && `${bestas} criatura(s) do bestiário de fora do grupo`].filter(Boolean) as string[];
  } else {
    const criaturas = await prisma.criatura.count({ where: { bestaId: id, NOT: { grupoId } } });
    usos = criaturas ? [`${criaturas} criatura(s) invocada(s) em outros grupos`] : [];
  }
  if (usos.length) throw conflito("EXCLUSIVO_EM_USO", `Não dá para tornar exclusivo deste grupo: está em uso por ${usos.join(" e ")}.`);
}

/** Depois de salvar: se ficou exclusivo, sai dos outros grupos e entra disponível no dele. */
export async function aplicarExclusividade(tipo: Tipo, id: string, grupoId: string | null | undefined) {
  if (!grupoId) return;
  const prisma = getPrisma();
  if (tipo === "classe") {
    await prisma.classeNoGrupo.deleteMany({ where: { classeId: id, NOT: { grupoId } } });
    await prisma.classeNoGrupo.upsert({ where: { grupoId_classeId: { grupoId, classeId: id } }, create: { grupoId, classeId: id }, update: {} });
  } else if (tipo === "raca") {
    await prisma.racaNoGrupo.deleteMany({ where: { racaId: id, NOT: { grupoId } } });
    await prisma.racaNoGrupo.upsert({ where: { grupoId_racaId: { grupoId, racaId: id } }, create: { grupoId, racaId: id }, update: {} });
  } else {
    await prisma.atributoNoGrupo.deleteMany({ where: { atributoId: id, NOT: { grupoId } } });
    await prisma.atributoNoGrupo.upsert({
      where: { grupoId_atributoId: { grupoId, atributoId: id } },
      create: { grupoId, atributoId: id },
      update: {},
    });
  }
}
