// Grupos: o RPG de um mestre. Só o mestre dono vê e altera o grupo.
import { randomInt } from "node:crypto";
import type { z } from "zod";
import { naoEncontrado, requisicaoInvalida } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { atributosNoNivel } from "../../regras/progressao.js";
import { apresentarCriatura } from "../criaturas/criaturas.service.js";
import { statusDaFicha } from "../fichas/status-da-ficha.js";
import { apresentarItem, comRequisitos } from "../itens/itens.apresentar.js";
import { apresentarStatus } from "../status/status.service.js";
import type { criarGrupoSchema, disponiveisSchema, editarGrupoSchema } from "./grupos.schemas.js";

type Disponiveis = z.infer<typeof disponiveisSchema>;

// Sem caracteres ambíguos (0/O, 1/I/L).
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

async function novoCodigo() {
  const prisma = getPrisma();
  for (let tentativa = 0; tentativa < 20; tentativa++) {
    const codigo = Array.from({ length: 6 }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
    if (!(await prisma.grupo.findUnique({ where: { codigo }, select: { id: true } }))) return codigo;
  }
  throw new Error("Não foi possível gerar um código único");
}

export async function grupoDoMestre(id: string, usuarioId: string) {
  const grupo = await getPrisma().grupo.findUnique({ where: { id } });
  if (!grupo || grupo.mestreId !== usuarioId) throw naoEncontrado("Grupo não encontrado");
  return grupo;
}

/**
 * Confere que tudo o que o mestre marcou pode ser usado por ele e respeita a exclusividade:
 * classes fixas ou dele, raças dele, atributos fixos ou dele, perícias do catálogo dele dentro dos atributos marcados.
 * Itens exclusivos de outro grupo são recusados.
 */
async function validarDisponiveis(d: Disponiveis, usuarioId: string, grupoId: string | null) {
  const prisma = getPrisma();
  const exclusivoOk = (g: string | null) => g === null || g === grupoId;
  const unicos = (a: string[]) => [...new Set(a)];

  const classes = await prisma.classe.findMany({ where: { id: { in: unicos(d.classeIds) } } });
  if (classes.length !== unicos(d.classeIds).length || classes.some((c) => (c.donoId !== null && c.donoId !== usuarioId) || !exclusivoOk(c.grupoExclusivoId))) {
    throw requisicaoInvalida("Alguma classe escolhida não existe, não é sua ou é exclusiva de outro grupo.");
  }
  const racas = await prisma.raca.findMany({ where: { id: { in: unicos(d.racaIds) } } });
  if (racas.length !== unicos(d.racaIds).length || racas.some((r) => r.donoId !== usuarioId || !exclusivoOk(r.grupoExclusivoId))) {
    throw requisicaoInvalida("Alguma raça escolhida não existe, não é sua ou é exclusiva de outro grupo.");
  }
  const atributos = await prisma.atributo.findMany({ where: { id: { in: unicos(d.atributoIds) } } });
  if (atributos.length !== unicos(d.atributoIds).length || atributos.some((a) => (a.donoId !== null && a.donoId !== usuarioId) || !exclusivoOk(a.grupoExclusivoId))) {
    throw requisicaoInvalida("Algum atributo escolhido não existe, não é seu ou é exclusivo de outro grupo.");
  }
  const pericias = await prisma.pericia.findMany({ where: { id: { in: unicos(d.periciaIds) } } });
  const atributosMarcados = new Set(d.atributoIds);
  if (pericias.length !== unicos(d.periciaIds).length || pericias.some((p) => p.donoId !== usuarioId || !atributosMarcados.has(p.atributoId))) {
    throw requisicaoInvalida("Alguma perícia escolhida não é do seu catálogo ou está fora dos atributos marcados.");
  }
  const status = await prisma.status.findMany({ where: { id: { in: unicos(d.statusIds) } } });
  if (status.length !== unicos(d.statusIds).length || status.some((s) => s.donoId !== null && s.donoId !== usuarioId)) {
    throw requisicaoInvalida("Algum status escolhido não existe ou não é seu.");
  }
  return {
    classeIds: unicos(d.classeIds), racaIds: unicos(d.racaIds), atributoIds: unicos(d.atributoIds),
    periciaIds: unicos(d.periciaIds), statusIds: unicos(d.statusIds),
  };
}

/** Substitui tudo o que vale no grupo. */
async function gravarDisponiveis(grupoId: string, d: Disponiveis) {
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

export async function listar(usuarioId: string) {
  const grupos = await getPrisma().grupo.findMany({
    where: { mestreId: usuarioId },
    orderBy: { criadoEm: "desc" },
    include: { _count: { select: { fichas: true } } },
  });
  return grupos.map(({ _count, ...g }) => ({ ...g, membros: _count.fichas }));
}

export async function detalhar(id: string, usuarioId: string) {
  await grupoDoMestre(id, usuarioId);
  const g = await getPrisma().grupo.findUniqueOrThrow({
    where: { id },
    include: {
      classes: { select: { classeId: true } },
      racas: { select: { racaId: true } },
      atributos: { select: { atributoId: true } },
      pericias: { select: { periciaId: true } },
      status: { include: { status: true } },
      fichas: {
        orderBy: { criadoEm: "asc" },
        include: {
          status: { include: { status: true } },
          jogador: { select: { nickname: true, nome: true, fotoUrl: true } },
          classe: { select: { titulo: true, pontosVida: true, pontosMana: true, pontosEsforco: true } },
          raca: { select: { titulo: true } },
        },
      },
      itens: { where: { fichaId: null }, orderBy: { criadoEm: "asc" }, include: comRequisitos },
      regrasProprias: { orderBy: { criadoEm: "asc" } },
      criaturas: { orderBy: { criadoEm: "asc" }, include: { besta: true } },
    },
  });
  const { classes, racas, atributos, pericias, status, fichas, itens, criaturas, ...grupo } = g;
  const ativos = status.map((s) => s.status);
  return {
    ...grupo,
    disponiveis: {
      classeIds: classes.map((c) => c.classeId),
      racaIds: racas.map((r) => r.racaId),
      atributoIds: atributos.map((a) => a.atributoId),
      periciaIds: pericias.map((p) => p.periciaId),
      statusIds: status.map((s) => s.statusId),
    },
    membros: fichas.map((f) => {
      const max = atributosNoNivel(f.classe, f.nivel);
      return {
        fichaId: f.id,
        nome: f.nome,
        imagemUrl: f.imagemUrl,
        nivel: f.nivel,
        jogador: f.jogador,
        classe: f.classe.titulo,
        raca: f.raca.titulo,
        vida: { atual: f.vidaAtual, max: max.pontosVida },
        mana: { atual: f.manaAtual, max: max.pontosMana },
        esforco: { atual: f.esforcoAtual, max: max.pontosEsforco },
        status: statusDaFicha(f, ativos, f.status.map((fs) => fs.status)).map(({ id, nome, tipo, automatico }) => ({ id, nome, tipo, automatico })),
      };
    }),
    /** Status ativados no grupo (o mestre aplica os manuais nas fichas). */
    statusAtivos: ativos.map(apresentarStatus).sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR")),
    itensVagos: itens.map(apresentarItem),
    /** Criaturas invocadas pelo mestre. */
    criaturas: criaturas.map(apresentarCriatura),
  };
}

export async function criar(usuarioId: string, dados: z.infer<typeof criarGrupoSchema>) {
  const { disponiveis, ...resto } = dados;
  const d = disponiveis ? await validarDisponiveis(disponiveis, usuarioId, null) : null;
  const grupo = await getPrisma().grupo.create({ data: { ...resto, mestreId: usuarioId, codigo: await novoCodigo() } });
  if (d) await gravarDisponiveis(grupo.id, d);
  return detalhar(grupo.id, usuarioId);
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarGrupoSchema>) {
  await grupoDoMestre(id, usuarioId);
  if (dados.limiteMembros !== undefined) {
    const membros = await getPrisma().ficha.count({ where: { grupoId: id } });
    if (dados.limiteMembros < membros) {
      throw requisicaoInvalida(`O grupo já tem ${membros} membros; o limite não pode ser menor que isso.`);
    }
  }
  await getPrisma().grupo.update({ where: { id }, data: dados });
  return detalhar(id, usuarioId);
}

export async function definirDisponiveis(id: string, usuarioId: string, disponiveis: Disponiveis) {
  await grupoDoMestre(id, usuarioId);
  await gravarDisponiveis(id, await validarDisponiveis(disponiveis, usuarioId, id));
  return detalhar(id, usuarioId);
}

export async function novoCodigoDoGrupo(id: string, usuarioId: string) {
  await grupoDoMestre(id, usuarioId);
  await getPrisma().grupo.update({ where: { id }, data: { codigo: await novoCodigo() } });
  return detalhar(id, usuarioId);
}

/** Exclui o grupo com as fichas e itens dele. */
export async function excluir(id: string, usuarioId: string) {
  await grupoDoMestre(id, usuarioId);
  await getPrisma().grupo.delete({ where: { id } });
}

// ---------- Regras próprias do mestre (regras da mesa) ----------

export async function criarRegra(grupoId: string, usuarioId: string, dados: { titulo: string; texto: string }) {
  await grupoDoMestre(grupoId, usuarioId);
  return getPrisma().regraDaMesa.create({ data: { ...dados, grupoId } });
}

async function regraDoMestre(id: string, usuarioId: string) {
  const regra = await getPrisma().regraDaMesa.findUnique({ where: { id }, include: { grupo: { select: { mestreId: true } } } });
  if (!regra || regra.grupo.mestreId !== usuarioId) throw naoEncontrado("Regra não encontrada");
  return regra;
}

export async function editarRegra(id: string, usuarioId: string, dados: { titulo?: string; texto?: string }) {
  await regraDoMestre(id, usuarioId);
  return getPrisma().regraDaMesa.update({ where: { id }, data: dados });
}

export async function excluirRegra(id: string, usuarioId: string) {
  await regraDoMestre(id, usuarioId);
  await getPrisma().regraDaMesa.delete({ where: { id } });
}
