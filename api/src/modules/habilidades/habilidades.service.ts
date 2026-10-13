import type { z } from "zod";
import { conflito, naoEncontrado, requisicaoInvalida } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { bestaEditavel } from "../bestas/bestas.service.js";
import { classeEditavel } from "../classes/classes.service.js";
import { comStatus, resumoStatus } from "./habilidades.include.js";
import { periciaDoMestre } from "../pericias/pericias.service.js";
import { statusUsavel } from "../status/status.service.js";
import type { aprimoramentoSchema, criarHabilidadeSchema, editarHabilidadeSchema } from "./habilidades.schemas.js";

/** Dono da cartela: uma classe ou uma besta do bestiário. */
export type DonoCartela = { classeId: string } | { bestaId: string };

async function donoEditavel(dono: DonoCartela, usuarioId: string) {
  if ("classeId" in dono) await classeEditavel(dono.classeId, usuarioId);
  else await bestaEditavel(dono.bestaId, usuarioId);
}

async function habilidadeEditavel(id: string, usuarioId: string) {
  const habilidade = await getPrisma().habilidade.findUnique({ where: { id } });
  if (!habilidade) throw naoEncontrado("Habilidade não encontrada");
  await donoEditavel(habilidade.classeId ? { classeId: habilidade.classeId } : { bestaId: habilidade.bestaId! }, usuarioId);
  return habilidade;
}

/** A classe (ou besta) precisa existir e ser do mestre. Nova habilidade entra no fim da cartela. */
export async function criar(dono: DonoCartela, usuarioId: string, dados: z.infer<typeof criarHabilidadeSchema>) {
  await donoEditavel(dono, usuarioId);
  if (dados.statusId) await statusUsavel(dados.statusId, usuarioId);
  if (dados.periciaId) await periciaDoMestre(dados.periciaId, usuarioId);
  const prisma = getPrisma();
  const { _max } = await prisma.habilidade.aggregate({ where: dono, _max: { ordem: true } });
  return prisma.habilidade.create({ data: { ...dados, ...dono, ordem: (_max.ordem ?? -1) + 1 }, include: comStatus });
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarHabilidadeSchema>) {
  await habilidadeEditavel(id, usuarioId);
  if (dados.nivelNecessario !== undefined) {
    const primeiro = await getPrisma().habilidadeAprimoramento.findFirst({ where: { habilidadeId: id }, orderBy: { nivel: "asc" }, select: { nivel: true } });
    if (primeiro && dados.nivelNecessario >= primeiro.nivel) {
      throw requisicaoInvalida(`Esta carta tem aprimoramento no nível ${primeiro.nivel}: o nível necessário precisa ser menor que isso.`, [
        { campo: "nivelNecessario", mensagem: `Use um nível menor que ${primeiro.nivel} (ou mude o aprimoramento)` },
      ]);
    }
  }
  if (dados.statusId) await statusUsavel(dados.statusId, usuarioId);
  if (dados.periciaId) await periciaDoMestre(dados.periciaId, usuarioId);
  return getPrisma().habilidade.update({ where: { id }, data: dados, include: comStatus });
}

export async function excluir(id: string, usuarioId: string) {
  await habilidadeEditavel(id, usuarioId);
  await getPrisma().habilidade.delete({ where: { id } });
}

/** Recebe a ordem completa: `ids` precisa conter exatamente as habilidades da cartela. */
export async function ordenar(dono: DonoCartela, usuarioId: string, ids: string[]) {
  await donoEditavel(dono, usuarioId);
  const prisma = getPrisma();
  const atuais = await prisma.habilidade.findMany({ where: dono, select: { id: true } });
  const conjunto = new Set(atuais.map((h) => h.id));
  if (ids.length !== conjunto.size || new Set(ids).size !== ids.length || !ids.every((id) => conjunto.has(id))) {
    throw requisicaoInvalida("A lista deve conter exatamente as habilidades da cartela, sem repetição.");
  }
  await prisma.$transaction(ids.map((id, ordem) => prisma.habilidade.update({ where: { id }, data: { ordem } })));
  return prisma.habilidade.findMany({ where: dono, orderBy: { ordem: "asc" }, include: comStatus });
}

// ---------- Aprimoramentos: a mesma carta muda a partir de um nível ----------

type DadosAprimoramento = z.infer<typeof aprimoramentoSchema>;

async function validarAprimoramento(h: { id: string; nivelNecessario: number }, dados: Partial<DadosAprimoramento>, usuarioId: string, exceto?: string) {
  if (dados.nivel !== undefined) {
    if (dados.nivel <= h.nivelNecessario) {
      throw requisicaoInvalida(`O aprimoramento precisa ser num nível maior que ${h.nivelNecessario} (nível da carta).`, [
        { campo: "nivel", mensagem: `Use um nível maior que ${h.nivelNecessario}` },
      ]);
    }
    const repetido = await getPrisma().habilidadeAprimoramento.findFirst({
      where: { habilidadeId: h.id, nivel: dados.nivel, NOT: exceto ? { id: exceto } : undefined },
    });
    if (repetido) throw conflito("NIVEL_EM_USO", `Esta carta já tem um aprimoramento no nível ${dados.nivel}.`);
  }
  if (dados.statusId) await statusUsavel(dados.statusId, usuarioId);
}

export async function criarAprimoramento(habilidadeId: string, usuarioId: string, dados: DadosAprimoramento) {
  const h = await habilidadeEditavel(habilidadeId, usuarioId);
  await validarAprimoramento(h, dados, usuarioId);
  return getPrisma().habilidadeAprimoramento.create({ data: { ...dados, habilidadeId }, include: { status: resumoStatus } });
}

async function aprimoramentoEditavel(id: string, usuarioId: string) {
  const a = await getPrisma().habilidadeAprimoramento.findUnique({ where: { id } });
  if (!a) throw naoEncontrado("Aprimoramento não encontrado");
  const h = await habilidadeEditavel(a.habilidadeId, usuarioId);
  return { a, h };
}

export async function editarAprimoramento(id: string, usuarioId: string, dados: Partial<DadosAprimoramento>) {
  const { h } = await aprimoramentoEditavel(id, usuarioId);
  await validarAprimoramento(h, dados, usuarioId, id);
  return getPrisma().habilidadeAprimoramento.update({ where: { id }, data: dados, include: { status: resumoStatus } });
}

export async function excluirAprimoramento(id: string, usuarioId: string) {
  await aprimoramentoEditavel(id, usuarioId);
  await getPrisma().habilidadeAprimoramento.delete({ where: { id } });
}
