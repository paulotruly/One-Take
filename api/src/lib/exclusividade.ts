// "Geral" ou "exclusivo de um grupo" para classes, raças e atributos (sempre opcional).
// Exclusivo: só pode ser disponibilizado naquele grupo, e já entra disponível nele.
import { z } from "zod";
import { naoEncontrado } from "./errors.js";
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
