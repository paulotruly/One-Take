// O que vale numa mesa: com kit, vem do kit (e acompanha quando o kit muda); sem kit, fica o que já estava gravado.
// Do kit valem as classes, raças, atributos, perícias e status dele. Atributo no kit leva todas as perícias do mestre nele;
// perícia no kit leva o atributo dela. Os status automáticos do mestre valem sempre (a ficha depende deles).
import { getPrisma } from "../../lib/prisma.js";

export type Disponiveis = { classeIds: string[]; racaIds: string[]; atributoIds: string[]; periciaIds: string[]; statusIds: string[] };

/** Substitui tudo o que vale no grupo. */
export async function gravarDisponiveis(grupoId: string, d: Disponiveis) {
  const prisma = getPrisma();
  await prisma.$transaction([
    prisma.classeNoGrupo.deleteMany({ where: { grupoId } }),
    prisma.racaNoGrupo.deleteMany({ where: { grupoId } }),
    prisma.atributoNoGrupo.deleteMany({ where: { grupoId } }),
    prisma.periciaNoGrupo.deleteMany({ where: { grupoId } }),
    prisma.statusNoGrupo.deleteMany({ where: { grupoId } }),
    prisma.classeNoGrupo.createMany({ data: d.classeIds.map((classeId) => ({ grupoId, classeId })) }),
    prisma.racaNoGrupo.createMany({ data: d.racaIds.map((racaId) => ({ grupoId, racaId })) }),
    prisma.atributoNoGrupo.createMany({ data: d.atributoIds.map((atributoId) => ({ grupoId, atributoId })) }),
    prisma.periciaNoGrupo.createMany({ data: d.periciaIds.map((periciaId) => ({ grupoId, periciaId })) }),
    prisma.statusNoGrupo.createMany({ data: d.statusIds.map((statusId) => ({ grupoId, statusId })) }),
  ]);
}

/** O que vale numa mesa que usa o kit. */
export async function disponiveisDoKit(kitId: string): Promise<Disponiveis> {
  const prisma = getPrisma();
  const kit = await prisma.kit.findUniqueOrThrow({
    where: { id: kitId },
    select: {
      donoId: true,
      classes: { select: { classeId: true } },
      racas: { select: { racaId: true } },
      atributos: { select: { atributoId: true } },
      pericias: { select: { periciaId: true, pericia: { select: { atributoId: true } } } },
      status: { select: { statusId: true } },
    },
  });
  const atributoIds = new Set([...kit.atributos.map((a) => a.atributoId), ...kit.pericias.map((p) => p.pericia.atributoId)]);
  const doAtributo = await prisma.pericia.findMany({
    where: { donoId: kit.donoId, atributoId: { in: kit.atributos.map((a) => a.atributoId) } },
    select: { id: true },
  });
  const automaticos = await prisma.status.findMany({ where: { donoId: kit.donoId, gatilho: { not: null } }, select: { id: true } });
  return {
    classeIds: kit.classes.map((c) => c.classeId),
    racaIds: kit.racas.map((r) => r.racaId),
    atributoIds: [...atributoIds],
    periciaIds: [...new Set([...kit.pericias.map((p) => p.periciaId), ...doAtributo.map((p) => p.id)])],
    statusIds: [...new Set([...kit.status.map((s) => s.statusId), ...automaticos.map((s) => s.id)])],
  };
}

/** Regrava o que vale nas mesas que usam algum destes kits (depois que o conteúdo de um kit mudou). */
export async function sincronizarMesas(kitIds: Iterable<string>) {
  const ids = [...new Set(kitIds)];
  if (ids.length === 0) return;
  const grupos = (await getPrisma().grupo.findMany({ where: { kitId: { in: ids } }, select: { id: true, kitId: true } })) ?? [];
  for (const g of grupos) await gravarDisponiveis(g.id, await disponiveisDoKit(g.kitId!));
}
