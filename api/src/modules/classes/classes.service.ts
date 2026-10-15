import { randomUUID } from "node:crypto";
import type { z } from "zod";
import type { Atributo, Classe, ClassePericia, GrupoClasse, Pericia } from "../../generated/prisma/client.js";
import { classeDeOutro, naoEncontrado } from "../../lib/errors.js";
import { comKits, definirKits } from "../../lib/kits.js";
import { getPrisma } from "../../lib/prisma.js";
import { comVisao, podeUsar, quemVe, visivelPara, type Quem } from "../../lib/sistema.js";
import { previaProgressao } from "../../regras/progressao.js";
import { apresentarAtributo, porAtributoENome } from "../atributos/atributos.service.js";
import { comStatus } from "../habilidades/habilidades.include.js";
import type { criarClasseSchema, editarClasseSchema } from "./classes.schemas.js";

/**
 * Formato público de uma classe: se vierem os kits, acrescenta `kitIds`.
 * Com `quem`, também `editavel`, `verificado`, `deOutro` e `podeVerificar` (e os kits só aparecem para o dono).
 */
export function apresentarClasse<T extends Classe & { kits?: { kitId: string }[] }>(c: T, quem?: Quem) {
  if (quem) return comVisao(c, quem);
  const { kits, ...resto } = c;
  return { ...resto, ...(kits && { kitIds: kits.map((k) => k.kitId) }) };
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
// Leitura: classe verificada (selo ou kit) ou do próprio mestre. Classe de outro mestre = 404 (não revela que existe).
// Escrita: só classe do próprio mestre; verificada de outra pessoa = 403 VERIFICADO (duplique para editar).

export async function classeLegivel(id: string, usuarioId: string) {
  const classe = await getPrisma().classe.findUnique({ where: { id } });
  if (!classe || !(await podeUsar("classe", classe, usuarioId))) throw naoEncontrado("Classe não encontrada");
  return classe;
}

export async function classeEditavel(id: string, usuarioId: string) {
  const classe = await classeLegivel(id, usuarioId);
  if (classe.donoId === usuarioId) return classe;
  throw classeDeOutro();
}

// ---------- Casos de uso ----------

export async function listar(usuarioId: string, grupo?: GrupoClasse) {
  const quem = await quemVe(usuarioId);
  const classes = await getPrisma().classe.findMany({
    where: { ...(await visivelPara(usuarioId)), ...(grupo && { grupo }) },
    orderBy: [{ titulo: "asc" }],
    include: { conceito: { select: { id: true, titulo: true } }, ...comKits },
  });
  // Verificadas primeiro, depois as próprias.
  const ordem = (c: { donoId: string }) => (c.donoId === usuarioId ? 1 : 0);
  return classes.sort((a, b) => ordem(a) - ordem(b)).map((c) => apresentarClasse(c, quem));
}

export async function detalhar(id: string, usuarioId: string) {
  await classeLegivel(id, usuarioId);
  const classe = await getPrisma().classe.findUniqueOrThrow({
    where: { id },
    include: {
      habilidades: { orderBy: { ordem: "asc" }, include: comStatus },
      pericias: { include: { pericia: { include: { atributo: true } } } },
      conceito: { select: { id: true, titulo: true, descricao: true } },
      ...comKits,
    },
  });
  const { pericias, ...resto } = classe;
  return { ...apresentarClasse(resto, await quemVe(usuarioId)), pericias: apresentarPericias(pericias) };
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
  await validarConceito(dados.conceitoId, usuarioId);
  const { kitIds, ...resto } = dados;
  const classe = await getPrisma().classe.create({ data: { ...resto, donoId: usuarioId } });
  await definirKits("classe", classe.id, kitIds, usuarioId);
  return apresentarClasse({ ...classe, kits: (kitIds ?? []).map((kitId) => ({ kitId })) });
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarClasseSchema>) {
  await classeEditavel(id, usuarioId);
  await validarConceito(dados.conceitoId, usuarioId);
  const { kitIds, ...resto } = dados;
  await definirKits("classe", id, kitIds, usuarioId);
  return apresentarClasse(await getPrisma().classe.update({ where: { id }, data: resto, include: comKits }));
}

export async function excluir(id: string, usuarioId: string) {
  await classeEditavel(id, usuarioId);
  await getPrisma().classe.delete({ where: { id } }); // cascata: habilidades e perícias
}

/**
 * Copia classe + habilidades + perícias para o mestre.
 * Perícias da origem que não são do catálogo do mestre (ex.: classe verificada de outra pessoa) são trocadas
 * pela cópia correspondente no catálogo dele (mesma origem ou mesmo nome); se não houver, é criada.
 */
export async function duplicar(id: string, usuarioId: string) {
  await classeLegivel(id, usuarioId);
  const prisma = getPrisma();
  const origem = await prisma.classe.findUniqueOrThrow({
    where: { id },
    include: { habilidades: { include: { aprimoramentos: true, pericia: true, periciasDefesa: { include: { pericia: true } } } }, pericias: { include: { pericia: true } } },
  });
  // Perícias testadas pelas cartas também passam a apontar para o catálogo do mestre.
  const periciaDaCarta = new Map<string, string>();
  for (const h of origem.habilidades) {
    for (const p of [h.pericia, ...h.periciasDefesa.map((d) => d.pericia)]) {
      if (p && !periciaDaCarta.has(p.id)) periciaDaCarta.set(p.id, await periciaNoCatalogo(p, usuarioId));
    }
  }

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
        create: origem.habilidades.map(({ id: _id, classeId: _c, aprimoramentos, pericia: _p, periciasDefesa, ...h }) => ({
          ...h,
          periciaId: h.periciaId ? (periciaDaCarta.get(h.periciaId) ?? null) : null,
          periciasDefesa: { create: periciasDefesa.map((d) => ({ periciaId: periciaDaCarta.get(d.periciaId)! })) },
          aprimoramentos: { create: aprimoramentos.map(({ id: _a, habilidadeId: _h, criadoEm: _d, ...a }) => a) },
        })),
      },
      pericias: { create: vinculos },
    },
  });

  return detalhar(novoId, usuarioId);
}

/** Id da perícia equivalente no catálogo do mestre (criando uma cópia se ele não tiver). */
export async function periciaNoCatalogo(pericia: Pericia, usuarioId: string) {
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
