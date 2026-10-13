import { randomUUID } from "node:crypto";
import type { z } from "zod";
import type { Atributo, Classe, ClassePericia, GrupoClasse, Pericia } from "../../generated/prisma/client.js";
import { classeFixa, naoEncontrado } from "../../lib/errors.js";
import { aplicarExclusividade, validarGrupoExclusivo } from "../../lib/exclusividade.js";
import { getPrisma } from "../../lib/prisma.js";
import { previaProgressao } from "../../regras/progressao.js";
import { apresentarAtributo, porAtributoENome } from "../atributos/atributos.service.js";
import { comStatus } from "../habilidades/habilidades.include.js";
import type { criarClasseSchema, editarClasseSchema } from "./classes.schemas.js";

/** Formato público de uma classe: acrescenta `fixa`. */
export function apresentarClasse<T extends Classe>(c: T) {
  return { ...c, fixa: c.donoId === null };
}

/** Perícias da classe achatadas: dados do catálogo + modificador da classe, por atributo e nome. */
export function apresentarPericias(vinculos: (ClassePericia & { pericia: Pericia & { atributo: Atributo } })[]) {
  return vinculos
    .map(({ modificador, pericia: { id, nome, descricao, categoria, atributo } }) => ({
      id, nome, descricao, categoria, atributo: apresentarAtributo(atributo), modificador,
    }))
    .sort(porAtributoENome);
}

// ---------- Regras de acesso ----------
// Leitura: classe fixa ou do próprio mestre. Classe de outro mestre = 404 (não revela que existe).
// Escrita: só classe do próprio mestre; fixa = 403 CLASSE_FIXA.

export async function classeLegivel(id: string, usuarioId: string) {
  const classe = await getPrisma().classe.findUnique({ where: { id } });
  if (!classe || (classe.donoId !== null && classe.donoId !== usuarioId)) throw naoEncontrado("Classe não encontrada");
  return classe;
}

export async function classeEditavel(id: string, usuarioId: string) {
  const classe = await classeLegivel(id, usuarioId);
  if (classe.donoId === null) throw classeFixa();
  return classe;
}

// ---------- Casos de uso ----------

export async function listar(usuarioId: string, grupo?: GrupoClasse) {
  const classes = await getPrisma().classe.findMany({
    where: { OR: [{ donoId: null }, { donoId: usuarioId }], ...(grupo && { grupo }) },
    orderBy: [{ titulo: "asc" }],
    include: { conceito: { select: { id: true, titulo: true } } },
  });
  // Fixas primeiro, depois as próprias.
  return classes
    .sort((a, b) => Number(a.donoId !== null) - Number(b.donoId !== null))
    .map(apresentarClasse);
}

export async function detalhar(id: string, usuarioId: string) {
  await classeLegivel(id, usuarioId);
  const classe = await getPrisma().classe.findUniqueOrThrow({
    where: { id },
    include: {
      habilidades: { orderBy: { ordem: "asc" }, include: comStatus },
      pericias: { include: { pericia: { include: { atributo: true } } } },
      conceito: { select: { id: true, titulo: true, descricao: true } },
    },
  });
  const { pericias, ...resto } = classe;
  return { ...apresentarClasse(resto), pericias: apresentarPericias(pericias) };
}

/** Prévia de progressão: atributos, pontos de perícia e cartas disponíveis em cada nível. */
export async function progressao(id: string, usuarioId: string) {
  await classeLegivel(id, usuarioId);
  const classe = await getPrisma().classe.findUniqueOrThrow({
    where: { id },
    include: { habilidades: { select: { id: true, nivelNecessario: true, aprimoramentos: { select: { nivel: true } } }, orderBy: { ordem: "asc" } } },
  });
  return previaProgressao(classe);
}

/** Cria só a classe; habilidades e perícias são adicionadas depois, com a classe já existente. */
/** O arquétipo precisa ser do próprio mestre. */
async function validarConceito(conceitoId: string | null | undefined, usuarioId: string) {
  if (!conceitoId) return;
  const c = await getPrisma().classeConceito.findUnique({ where: { id: conceitoId }, select: { donoId: true } });
  if (!c || c.donoId !== usuarioId) throw naoEncontrado("Arquétipo não encontrado");
}

export async function criar(usuarioId: string, dados: z.infer<typeof criarClasseSchema>) {
  await validarGrupoExclusivo(dados.grupoExclusivoId, usuarioId);
  await validarConceito(dados.conceitoId, usuarioId);
  const classe = await getPrisma().classe.create({ data: { ...dados, donoId: usuarioId } });
  await aplicarExclusividade("classe", classe.id, dados.grupoExclusivoId);
  return apresentarClasse(classe);
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarClasseSchema>) {
  await classeEditavel(id, usuarioId);
  await validarGrupoExclusivo(dados.grupoExclusivoId, usuarioId);
  await validarConceito(dados.conceitoId, usuarioId);
  const classe = await getPrisma().classe.update({ where: { id }, data: dados });
  await aplicarExclusividade("classe", id, dados.grupoExclusivoId);
  return apresentarClasse(classe);
}

export async function excluir(id: string, usuarioId: string) {
  await classeEditavel(id, usuarioId);
  await getPrisma().classe.delete({ where: { id } }); // cascata: habilidades e perícias
}

/**
 * Copia classe + habilidades + perícias para o mestre.
 * Perícias da origem que não são do catálogo do mestre (ex.: base, em classe fixa) são trocadas
 * pela cópia correspondente no catálogo dele (mesma origem ou mesmo nome); se não houver, é criada.
 */
export async function duplicar(id: string, usuarioId: string) {
  await classeLegivel(id, usuarioId);
  const prisma = getPrisma();
  const origem = await prisma.classe.findUniqueOrThrow({
    where: { id },
    include: { habilidades: { include: { aprimoramentos: true } }, pericias: { include: { pericia: true } } },
  });

  const vinculos: { periciaId: string; modificador: number }[] = [];
  for (const { modificador, pericia } of origem.pericias) {
    vinculos.push({ periciaId: await periciaNoCatalogo(pericia, usuarioId), modificador });
  }

  const novoId = randomUUID();
  await prisma.classe.create({
    data: {
      id: novoId,
      grupo: origem.grupo,
      titulo: `${origem.titulo} (cópia)`.slice(0, 80),
      descricao: origem.descricao,
      imagemUrl: origem.imagemUrl,
      pontosVida: origem.pontosVida,
      pontosMana: origem.pontosMana,
      pontosEsforco: origem.pontosEsforco,
      donoId: usuarioId,
      origemId: origem.id,
      conceitoId: origem.donoId === usuarioId ? origem.conceitoId : null,
      habilidades: {
        create: origem.habilidades.map(({ id: _id, classeId: _c, aprimoramentos, ...h }) => ({
          ...h,
          aprimoramentos: { create: aprimoramentos.map(({ id: _a, habilidadeId: _h, criadoEm: _d, ...a }) => a) },
        })),
      },
      pericias: { create: vinculos },
    },
  });

  return detalhar(novoId, usuarioId);
}

/** Id da perícia equivalente no catálogo do mestre (criando uma cópia se ele não tiver). */
async function periciaNoCatalogo(pericia: Pericia, usuarioId: string) {
  if (pericia.donoId === usuarioId) return pericia.id;
  const prisma = getPrisma();
  const equivalente = await prisma.pericia.findFirst({
    where: { donoId: usuarioId, OR: [{ origemId: pericia.origemId ?? pericia.id }, { nome: pericia.nome }] },
  });
  if (equivalente) return equivalente.id;
  const { nome, descricao, categoria, atributoId } = pericia;
  const copia = await prisma.pericia.create({
    data: { nome, descricao, categoria, atributoId, donoId: usuarioId, origemId: pericia.origemId ?? pericia.id },
  });
  return copia.id;
}
