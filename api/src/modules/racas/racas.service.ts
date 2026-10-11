import type { z } from "zod";
import type { Atributo, Pericia, RacaPericia } from "../../generated/prisma/client.js";
import { naoEncontrado } from "../../lib/errors.js";
import { aplicarExclusividade, validarGrupoExclusivo } from "../../lib/exclusividade.js";
import { getPrisma } from "../../lib/prisma.js";
import { apresentarAtributo, porAtributoENome } from "../atributos/atributos.service.js";
import { periciaDoMestre } from "../pericias/pericias.service.js";
import type { criarRacaSchema, editarRacaSchema } from "./racas.schemas.js";

// Raças pertencem ao mestre que as criou; de outro mestre = 404.

async function racaDoMestre(id: string, usuarioId: string) {
  const raca = await getPrisma().raca.findUnique({ where: { id } });
  if (!raca || raca.donoId !== usuarioId) throw naoEncontrado("Raça não encontrada");
  return raca;
}

/** Perícias da raça achatadas: dados do catálogo + pontos, por atributo e nome. */
function apresentarPericias(vinculos: (RacaPericia & { pericia: Pericia & { atributo: Atributo } })[]) {
  return vinculos
    .map(({ pontos, pericia: { id, nome, descricao, categoria, atributo } }) => ({
      id, nome, descricao, categoria, atributo: apresentarAtributo(atributo), pontos,
    }))
    .sort(porAtributoENome);
}

const comPericias = { pericias: { include: { pericia: { include: { atributo: true } } } } } as const;

export async function listar(usuarioId: string) {
  const racas = await getPrisma().raca.findMany({
    where: { donoId: usuarioId },
    orderBy: { titulo: "asc" },
    include: comPericias,
  });
  return racas.map(({ pericias, ...r }) => ({ ...r, pericias: apresentarPericias(pericias) }));
}

export async function detalhar(id: string, usuarioId: string) {
  await racaDoMestre(id, usuarioId);
  const { pericias, ...r } = await getPrisma().raca.findUniqueOrThrow({ where: { id }, include: comPericias });
  return { ...r, pericias: apresentarPericias(pericias) };
}

export async function criar(usuarioId: string, dados: z.infer<typeof criarRacaSchema>) {
  await validarGrupoExclusivo(dados.grupoExclusivoId, usuarioId);
  const raca = await getPrisma().raca.create({ data: { ...dados, donoId: usuarioId } });
  await aplicarExclusividade("raca", raca.id, dados.grupoExclusivoId);
  return { ...raca, pericias: [] };
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarRacaSchema>) {
  await racaDoMestre(id, usuarioId);
  await validarGrupoExclusivo(dados.grupoExclusivoId, usuarioId);
  await getPrisma().raca.update({ where: { id }, data: dados });
  await aplicarExclusividade("raca", id, dados.grupoExclusivoId);
  return detalhar(id, usuarioId);
}

export async function excluir(id: string, usuarioId: string) {
  await racaDoMestre(id, usuarioId);
  await getPrisma().raca.delete({ where: { id } });
}

/** Adiciona (ou atualiza os pontos de) uma perícia do catálogo do mestre na raça. */
export async function vincularPericia(racaId: string, periciaId: string, usuarioId: string, pontos: number) {
  await racaDoMestre(racaId, usuarioId);
  await periciaDoMestre(periciaId, usuarioId);
  return getPrisma().racaPericia.upsert({
    where: { racaId_periciaId: { racaId, periciaId } },
    create: { racaId, periciaId, pontos },
    update: { pontos },
  });
}

export async function desvincularPericia(racaId: string, periciaId: string, usuarioId: string) {
  await racaDoMestre(racaId, usuarioId);
  const r = await getPrisma().racaPericia.deleteMany({ where: { racaId, periciaId } });
  if (r.count === 0) throw naoEncontrado("Esta raça não tem essa perícia");
}
