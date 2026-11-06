// Grupos: o RPG de um mestre. Só o mestre dono vê e altera o grupo.
import { ehDoDono } from "../../lib/posse.js";
import { randomInt } from "node:crypto";
import type { z } from "zod";
import { naoEncontrado, requisicaoInvalida } from "../../lib/errors.js";
import { validarKitDoGrupo } from "../../lib/kits.js";
import { getPrisma } from "../../lib/prisma.js";
import { atributosNoNivel } from "../../regras/progressao.js";
import { estaMorto } from "../../regras/status.js";
import { apresentarCriatura } from "../criaturas/criaturas.service.js";
import { statusDaFicha } from "../fichas/status-da-ficha.js";
import { apresentarItem, comRequisitos } from "../itens/itens.apresentar.js";
import { apresentarStatus } from "../status/status.service.js";
import type { criarGrupoSchema, disponiveisSchema, editarGrupoSchema } from "./grupos.schemas.js";
import { CAMPO_DO_LIMITE, contarPorFuncao, ROTULO_FUNCAO, type LimitesPorFuncao } from "./funcoes.js";
import type { GrupoClasse } from "../../generated/prisma/client.js";
import { retratos } from "../fichas/retrato.js";
import { disponiveisDoKit, gravarDisponiveis } from "./kit-da-mesa.js";

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
  if (!grupo || grupo.mestreId !== usuarioId) throw naoEncontrado("Mesa não encontrada");
  return grupo;
}

/**
 * Confere que tudo o que o mestre marcou pode ser usado por ele e respeita a exclusividade:
 * classes, raças, atributos e status dele, perícias do catálogo dele dentro dos atributos marcados.
 */
async function validarDisponiveis(d: Disponiveis, usuarioId: string) {
  const prisma = getPrisma();
  const unicos = (a: string[]) => [...new Set(a)];

  const todosPodem = (lista: { donoId: string | null }[]) => lista.every((x) => ehDoDono(x, usuarioId));

  const classes = await prisma.classe.findMany({ where: { id: { in: unicos(d.classeIds) } } });
  if (classes.length !== unicos(d.classeIds).length || !todosPodem(classes)) {
    throw requisicaoInvalida("Alguma classe escolhida não existe ou não é sua.");
  }
  const racas = await prisma.raca.findMany({ where: { id: { in: unicos(d.racaIds) } } });
  if (racas.length !== unicos(d.racaIds).length || !todosPodem(racas)) {
    throw requisicaoInvalida("Alguma raça escolhida não existe ou não é sua.");
  }
  const atributos = await prisma.atributo.findMany({ where: { id: { in: unicos(d.atributoIds) } } });
  if (atributos.length !== unicos(d.atributoIds).length || !todosPodem(atributos)) {
    throw requisicaoInvalida("Algum atributo escolhido não existe ou não é seu.");
  }
  const pericias = await prisma.pericia.findMany({ where: { id: { in: unicos(d.periciaIds) } } });
  const atributosMarcados = new Set(d.atributoIds);
  if (pericias.length !== unicos(d.periciaIds).length || !todosPodem(pericias) || pericias.some((p) => !atributosMarcados.has(p.atributoId))) {
    throw requisicaoInvalida("Alguma perícia escolhida não é do seu catálogo ou está fora dos atributos marcados.");
  }
  const status = await prisma.status.findMany({ where: { id: { in: unicos(d.statusIds) } } });
  if (status.length !== unicos(d.statusIds).length || !todosPodem(status)) {
    throw requisicaoInvalida("Algum status escolhido não existe ou não é seu.");
  }
  return {
    classeIds: unicos(d.classeIds), racaIds: unicos(d.racaIds), atributoIds: unicos(d.atributoIds),
    periciaIds: unicos(d.periciaIds), statusIds: unicos(d.statusIds),
  };
}

export async function listar(usuarioId: string) {
  const grupos = await getPrisma().grupo.findMany({
    where: { mestreId: usuarioId },
    orderBy: { criadoEm: "desc" },
    include: { fichas: { select: { classe: { select: { grupo: true } } } } },
  });
  return grupos.map(({ fichas, ...g }) => ({
    ...g,
    membros: fichas.length,
    /** Quantas fichas há em cada função (combatente, vanguardista, suporte). */
    composicao: fichas.reduce<Record<string, number>>((acc, f) => ({ ...acc, [f.classe.grupo]: (acc[f.classe.grupo] ?? 0) + 1 }), {}),
  }));
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
          classe: { select: { titulo: true, grupo: true, pontosVida: true, pontosMana: true, pontosEsforco: true } },
          raca: { select: { titulo: true } },
        },
      },
      itens: { where: { fichaId: null, npcId: null }, orderBy: { criadoEm: "asc" }, include: comRequisitos },
      regrasProprias: { orderBy: { criadoEm: "asc" } },
      kit: { select: { id: true, nome: true } },
      criaturas: { orderBy: { criadoEm: "asc" }, include: { besta: true, status: { include: { status: true } } } },
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
        funcao: f.classe.grupo,
        raca: f.raca.titulo,
        morto: estaMorto(f),
        vida: { atual: f.vidaAtual, max: max.pontosVida },
        mana: { atual: f.manaAtual, max: max.pontosMana },
        esforco: { atual: f.esforcoAtual, max: max.pontosEsforco },
        status: statusDaFicha(f, ativos, f.status).map(({ id, nome, tipo, automatico, turnos }) => ({ id, nome, tipo, automatico, turnos })),
      };
    }),
    /** Status ativados no grupo (o mestre aplica os manuais nas fichas). */
    statusAtivos: ativos.map(apresentarStatus).sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR")),
    itensVagos: itens.map(apresentarItem),
    /** Criaturas invocadas pelo mestre. */
    criaturas: criaturas.map((c) => apresentarCriatura(c, ativos)),
  };
}

export async function criar(usuarioId: string, dados: z.infer<typeof criarGrupoSchema>) {
  const { disponiveis, ...resto } = dados;
  await validarKitDoGrupo(resto.kitId, usuarioId);
  const d = disponiveis ? await validarDisponiveis(disponiveis, usuarioId) : null;
  const grupo = await getPrisma().grupo.create({ data: { ...resto, mestreId: usuarioId, codigo: await novoCodigo() } });
  // Com kit, o que vale vem do kit; sem kit, o que vier no corpo.
  if (resto.kitId) await gravarDisponiveis(grupo.id, await disponiveisDoKit(resto.kitId));
  else if (d) await gravarDisponiveis(grupo.id, d);
  return detalhar(grupo.id, usuarioId);
}

export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarGrupoSchema>) {
  await grupoDoMestre(id, usuarioId);
  await validarKitDoGrupo(dados.kitId, usuarioId);
  if (dados.limiteMembros !== undefined) {
    const membros = await getPrisma().ficha.count({ where: { grupoId: id } });
    if (dados.limiteMembros < membros) {
      throw requisicaoInvalida(`A mesa já tem ${membros} membros; o limite não pode ser menor que isso.`);
    }
  }
  await validarLimitesPorFuncao(id, dados);
  await getPrisma().grupo.update({ where: { id }, data: dados });
  // Trocar o kit refaz o que vale; tirar o kit mantém o que já estava.
  if (dados.kitId) await gravarDisponiveis(id, await disponiveisDoKit(dados.kitId));
  return detalhar(id, usuarioId);
}

/** O limite de uma função não pode ficar abaixo de quantas fichas dela o grupo já tem. */
async function validarLimitesPorFuncao(id: string, dados: Partial<LimitesPorFuncao>) {
  const funcoes = (Object.keys(CAMPO_DO_LIMITE) as GrupoClasse[]).filter((f) => dados[CAMPO_DO_LIMITE[f]] != null);
  if (funcoes.length === 0) return;
  const contagem = contarPorFuncao(await getPrisma().ficha.findMany({ where: { grupoId: id }, select: { classe: { select: { grupo: true } } } }));
  for (const f of funcoes) {
    const limite = dados[CAMPO_DO_LIMITE[f]]!;
    if (limite < contagem[f]) {
      throw requisicaoInvalida(`A mesa já tem ${contagem[f]} ${ROTULO_FUNCAO[f].plural}; o limite não pode ser menor que isso.`, [
        { campo: CAMPO_DO_LIMITE[f], mensagem: `Mínimo ${contagem[f]}` },
      ]);
    }
  }
}

/** Só para mesa sem kit: com kit, o que vale vem do kit. */
export async function definirDisponiveis(id: string, usuarioId: string, disponiveis: Disponiveis) {
  const grupo = await grupoDoMestre(id, usuarioId);
  if (grupo.kitId) throw requisicaoInvalida("Esta mesa usa um kit: o que vale nela vem do kit. Mude o conteúdo do kit.");
  await gravarDisponiveis(id, await validarDisponiveis(disponiveis, usuarioId));
  return detalhar(id, usuarioId);
}

export async function novoCodigoDoGrupo(id: string, usuarioId: string) {
  await grupoDoMestre(id, usuarioId);
  await getPrisma().grupo.update({ where: { id }, data: { codigo: await novoCodigo() } });
  return detalhar(id, usuarioId);
}

/** Exclui o grupo com as fichas e itens dele. Cada jogador fica com uma cópia arquivada da própria ficha. */
export async function excluir(id: string, usuarioId: string) {
  await grupoDoMestre(id, usuarioId);
  const prisma = getPrisma();
  const fichas = await prisma.ficha.findMany({ where: { grupoId: id }, select: { id: true, jogadorId: true } });
  const copias = await retratos(fichas, "GRUPO_EXCLUIDO");
  // Itens que estão com NPCs continuam com eles.
  await prisma.$transaction([
    ...(copias.length ? [prisma.fichaArquivada.createMany({ data: copias })] : []),
    prisma.item.updateMany({ where: { grupoId: id, npcId: { not: null } }, data: { grupoId: null } }),
    prisma.grupo.delete({ where: { id } }),
  ]);
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
