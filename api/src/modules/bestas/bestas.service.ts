// Bestiário do mestre: criaturas montadas como classes (vida/mana/esforço base, cartela, perícias) e com dados por atributo.
// Só o mestre dono vê e edita; de outro mestre = 404.
import type { z } from "zod";
import { naoEncontrado } from "../../lib/errors.js";
import { validarGrupoExclusivo } from "../../lib/exclusividade.js";
import { getPrisma } from "../../lib/prisma.js";
import { previaProgressao } from "../../regras/progressao.js";
import { notacaoDoTeste } from "../../regras/teste.js";
import { apresentarAtributo, atributoUsavel, porAtributoENome } from "../atributos/atributos.service.js";
import { validarConceito } from "../conceitos/conceitos.routes.js";
import { comStatus } from "../habilidades/habilidades.include.js";
import { periciaDoMestre } from "../pericias/pericias.service.js";
import type { criarBestaSchema, editarBestaSchema } from "./bestas.schemas.js";

export async function bestaEditavel(id: string, usuarioId: string) {
  const besta = await getPrisma().besta.findUnique({ where: { id } });
  if (!besta || besta.donoId !== usuarioId) throw naoEncontrado("Besta não encontrada");
  return besta;
}

/** Include da besta completa: cartela, perícias, atributos e conceito. */
export const bestaCompleta = {
  habilidades: { orderBy: { ordem: "asc" }, include: comStatus },
  pericias: { include: { pericia: { include: { atributo: true } } } },
  atributos: { include: { atributo: true } },
  conceito: { select: { id: true, titulo: true } },
} as const;

type BestaComTudo = NonNullable<Awaited<ReturnType<typeof buscarCompleta>>>;
const buscarCompleta = (id: string) => getPrisma().besta.findUnique({ where: { id }, include: bestaCompleta });

/** Atributos com dados e perícias com o teste já montado ("2d20 + 5"), pelas regras de teste. */
export function apresentarBesta({ pericias, atributos, ...b }: BestaComTudo) {
  const dados = new Map(atributos.map((a) => [a.atributoId, a.dados]));
  return {
    ...b,
    atributos: atributos
      .map(({ dados: n, atributo }) => ({ ...apresentarAtributo(atributo), dados: n, teste: notacaoDoTeste(n) }))
      .sort((x, y) => x.ordem - y.ordem || x.nome.localeCompare(y.nome, "pt-BR")),
    pericias: pericias
      .map(({ modificador, pericia: { id, nome, descricao, categoria, atributo } }) => ({
        id, nome, descricao, categoria, atributo: apresentarAtributo(atributo), modificador,
        teste: notacaoDoTeste(dados.get(atributo.id) ?? 0, modificador),
      }))
      .sort(porAtributoENome),
  };
}

export async function listar(usuarioId: string) {
  const bestas = await getPrisma().besta.findMany({
    where: { donoId: usuarioId },
    orderBy: { titulo: "asc" },
    include: { conceito: { select: { id: true, titulo: true } }, _count: { select: { habilidades: true } } },
  });
  return bestas.map(({ _count, ...b }) => ({ ...b, cartas: _count.habilidades }));
}

export async function detalhar(id: string, usuarioId: string) {
  await bestaEditavel(id, usuarioId);
  return apresentarBesta((await buscarCompleta(id))!);
}

/** Mesma progressão das classes: o mestre escolhe o nível ao invocar a criatura no grupo. */
export async function progressao(id: string, usuarioId: string) {
  await bestaEditavel(id, usuarioId);
  const besta = await getPrisma().besta.findUniqueOrThrow({
    where: { id },
    include: { habilidades: { select: { id: true, nivelNecessario: true, aprimoramentos: { select: { nivel: true } } }, orderBy: { ordem: "asc" } } },
  });
  return previaProgressao(besta);
}

export async function criar(usuarioId: string, dados: z.infer<typeof criarBestaSchema>) {
  await validarGrupoExclusivo(dados.grupoExclusivoId, usuarioId);
  await validarConceito("besta", dados.conceitoId, usuarioId);
  const besta = await getPrisma().besta.create({ data: { ...dados, donoId: usuarioId } });
  return detalhar(besta.id, usuarioId);
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarBestaSchema>) {
  await bestaEditavel(id, usuarioId);
  await validarGrupoExclusivo(dados.grupoExclusivoId, usuarioId);
  await validarConceito("besta", dados.conceitoId, usuarioId);
  await getPrisma().besta.update({ where: { id }, data: dados });
  return detalhar(id, usuarioId);
}

/** Apaga a besta, a cartela e as criaturas dela que estiverem invocados nos grupos. */
export async function excluir(id: string, usuarioId: string) {
  await bestaEditavel(id, usuarioId);
  await getPrisma().besta.delete({ where: { id } });
}

/** Cópia "(cópia)" com cartela, aprimoramentos, perícias e atributos. */
export async function duplicar(id: string, usuarioId: string) {
  await bestaEditavel(id, usuarioId);
  const o = await getPrisma().besta.findUniqueOrThrow({
    where: { id },
    include: { habilidades: { include: { aprimoramentos: true } }, pericias: true, atributos: true },
  });
  const copia = await getPrisma().besta.create({
    data: {
      donoId: usuarioId,
      titulo: `${o.titulo} (cópia)`.slice(0, 80),
      descricao: o.descricao,
      imagemUrl: o.imagemUrl,
      pontosVida: o.pontosVida,
      pontosMana: o.pontosMana,
      pontosEsforco: o.pontosEsforco,
      deslocamento: o.deslocamento,
      conceitoId: o.conceitoId,
      grupoExclusivoId: o.grupoExclusivoId,
      habilidades: {
        create: o.habilidades.map(({ id: _id, classeId: _c, bestaId: _b, aprimoramentos, ...h }) => ({
          ...h,
          aprimoramentos: { create: aprimoramentos.map(({ id: _a, habilidadeId: _h, criadoEm: _d, ...a }) => a) },
        })),
      },
      pericias: { create: o.pericias.map(({ periciaId, modificador }) => ({ periciaId, modificador })) },
      atributos: { create: o.atributos.map(({ atributoId, dados }) => ({ atributoId, dados })) },
    },
  });
  return detalhar(copia.id, usuarioId);
}

export async function vincularPericia(bestaId: string, periciaId: string, usuarioId: string, modificador: number) {
  await bestaEditavel(bestaId, usuarioId);
  await periciaDoMestre(periciaId, usuarioId);
  await getPrisma().bestaPericia.upsert({
    where: { bestaId_periciaId: { bestaId, periciaId } },
    create: { bestaId, periciaId, modificador },
    update: { modificador },
  });
  return detalhar(bestaId, usuarioId);
}

export async function desvincularPericia(bestaId: string, periciaId: string, usuarioId: string) {
  await bestaEditavel(bestaId, usuarioId);
  await getPrisma().bestaPericia.deleteMany({ where: { bestaId, periciaId } });
  return detalhar(bestaId, usuarioId);
}

/** Dados (d20) num atributo; 0 tira o atributo da besta. */
export async function definirAtributo(bestaId: string, atributoId: string, usuarioId: string, dados: number) {
  await bestaEditavel(bestaId, usuarioId);
  await atributoUsavel(atributoId, usuarioId);
  const prisma = getPrisma();
  if (dados === 0) await prisma.bestaAtributo.deleteMany({ where: { bestaId, atributoId } });
  else {
    await prisma.bestaAtributo.upsert({
      where: { bestaId_atributoId: { bestaId, atributoId } },
      create: { bestaId, atributoId, dados },
      update: { dados },
    });
  }
  return detalhar(bestaId, usuarioId);
}
