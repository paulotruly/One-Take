import type { z } from "zod";
import type { Atributo, Pericia, RacaPericia } from "../../generated/prisma/client.js";
import { AppError, naoEncontrado } from "../../lib/errors.js";
import { comVisao, podeUsar, quemVe, visivelParaSemFixos } from "../../lib/sistema.js";
import { comKitIds, comKits, definirKits } from "../../lib/kits.js";
import { getPrisma } from "../../lib/prisma.js";
import { apresentarAtributo, porAtributoENome } from "../atributos/atributos.service.js";
import { validarConceito } from "../conceitos/conceitos.routes.js";
import { periciaDoMestre } from "../pericias/pericias.service.js";
import type { criarRacaSchema, editarRacaSchema } from "./racas.schemas.js";

// Raças pertencem ao mestre que as criou; as verificadas todo mestre vê (só leitura). De outro mestre = 404.

async function racaLegivel(id: string, usuarioId: string) {
  const raca = await getPrisma().raca.findUnique({ where: { id } });
  if (!raca || !(await podeUsar("raca", raca, usuarioId, { semFixos: true }))) throw naoEncontrado("Raça não encontrada");
  return raca;
}

async function racaDoMestre(id: string, usuarioId: string) {
  const raca = await racaLegivel(id, usuarioId);
  if (raca.donoId !== usuarioId) throw new AppError(403, "VERIFICADO", "Esta raça é verificado (de outra pessoa): só leitura.");
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

const comPericias = {
  pericias: { include: { pericia: { include: { atributo: true } } } },
  conceito: { select: { id: true, titulo: true } },
  ...comKits,
} as const;

export async function listar(usuarioId: string) {
  const quem = await quemVe(usuarioId);
  const racas = await getPrisma().raca.findMany({
    where: await visivelParaSemFixos(usuarioId),
    orderBy: { titulo: "asc" },
    include: comPericias,
  });
  return racas.map(({ pericias, ...r }) => ({ ...comVisao(r, quem), pericias: apresentarPericias(pericias) }));
}

export async function detalhar(id: string, usuarioId: string) {
  await racaLegivel(id, usuarioId);
  const { pericias, ...r } = await getPrisma().raca.findUniqueOrThrow({ where: { id }, include: comPericias });
  return { ...comVisao(r, await quemVe(usuarioId)), pericias: apresentarPericias(pericias) };
}

export async function criar(usuarioId: string, dados: z.infer<typeof criarRacaSchema>) {
  await validarConceito("raca", dados.conceitoId, usuarioId);
  const { kitIds, ...resto } = dados;
  const raca = await getPrisma().raca.create({ data: { ...resto, donoId: usuarioId } });
  await definirKits("raca", raca.id, kitIds, usuarioId);
  return detalhar(raca.id, usuarioId);
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarRacaSchema>) {
  await racaDoMestre(id, usuarioId);
  await validarConceito("raca", dados.conceitoId, usuarioId);
  const { kitIds, ...resto } = dados;
  await getPrisma().raca.update({ where: { id }, data: resto });
  await definirKits("raca", id, kitIds, usuarioId);
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
