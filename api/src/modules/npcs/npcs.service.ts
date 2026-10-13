// NPCs do mestre: personagens com ficha completa (raça, classe opcional, nível, dados, perícias, cartas e inventário).
// Só o mestre dono vê e edita; de outro mestre = 404. Gerais ou exclusivos de um grupo.
// Sem imports do serviço de itens (ele importa este arquivo).
import type { z } from "zod";
import { naoEncontrado, requisicaoInvalida } from "../../lib/errors.js";
import { validarGrupoExclusivo } from "../../lib/exclusividade.js";
import { getPrisma } from "../../lib/prisma.js";
import { capacidadeInventario, espacosUsados } from "../../regras/ficha.js";
import { aplicarAprimoramentos, atributosNoNivel, habilidadesNoNivel } from "../../regras/progressao.js";
import { estaMorto } from "../../regras/status.js";
import { notacaoDoTeste } from "../../regras/teste.js";
import { apresentarAtributo, atributoUsavel } from "../atributos/atributos.service.js";
import { copiasDoCatalogo, somarPericias, testeDaCarta } from "../pericias/soma.js";
import { classeLegivel } from "../classes/classes.service.js";
import { comStatus } from "../habilidades/habilidades.include.js";
import { statusDaFicha } from "../fichas/status-da-ficha.js";
import { apresentarItem, comRequisitos } from "../itens/itens.apresentar.js";
import { statusAplicaveis, statusDisponiveis, validarAplicacao } from "../status/status.service.js";
import { periciaDoMestre } from "../pericias/pericias.service.js";
import type { criarNpcSchema, editarNpcSchema } from "./npcs.schemas.js";

export async function npcDoMestre(id: string, usuarioId: string) {
  const npc = await getPrisma().npc.findUnique({ where: { id } });
  if (!npc || npc.donoId !== usuarioId) throw naoEncontrado("NPC não encontrado");
  return npc;
}

type Base = { pontosVida: number; pontosMana: number; pontosEsforco: number };

/** Base de vida/mana/esforço: a da classe, ou a do próprio NPC quando não tem classe. */
function baseDo(npc: { vidaBase: number | null; manaBase: number | null; esforcoBase: number | null }, classe: Base | null): Base {
  if (classe) return classe;
  return { pontosVida: npc.vidaBase ?? 1, pontosMana: npc.manaBase ?? 1, pontosEsforco: npc.esforcoBase ?? 1 };
}

/** Raça precisa ser do mestre; classe, fixa ou dele; sem classe, os três valores base são obrigatórios. */
async function validar(
  d: Partial<z.infer<typeof criarNpcSchema>>,
  usuarioId: string,
  atual?: { racaId: string; classeId: string | null; grupoExclusivoId: string | null; vidaBase: number | null; manaBase: number | null; esforcoBase: number | null },
) {
  const prisma = getPrisma();
  await validarGrupoExclusivo(d.grupoExclusivoId, usuarioId);
  // Raça ou classe exclusiva de um grupo só serve para NPC exclusivo do mesmo grupo.
  const grupoDoNpc = d.grupoExclusivoId !== undefined ? d.grupoExclusivoId ?? null : atual?.grupoExclusivoId ?? null;
  const racaId = d.racaId ?? atual?.racaId;
  if (racaId) {
    const raca = await prisma.raca.findUnique({ where: { id: racaId }, select: { donoId: true, grupoExclusivoId: true, titulo: true } });
    if (!raca || raca.donoId !== usuarioId) throw naoEncontrado("Raça não encontrada");
    if (raca.grupoExclusivoId && raca.grupoExclusivoId !== grupoDoNpc) {
      throw requisicaoInvalida(`A raça ${raca.titulo} é exclusiva de um grupo: o NPC precisa ser exclusivo desse grupo.`, [{ campo: "racaId", mensagem: "Exclusiva de outro grupo" }]);
    }
  }
  const classeIdFinal = d.classeId !== undefined ? d.classeId : atual?.classeId ?? null;
  if (classeIdFinal) {
    const classe = await classeLegivel(classeIdFinal, usuarioId);
    if (classe.grupoExclusivoId && classe.grupoExclusivoId !== grupoDoNpc) {
      throw requisicaoInvalida(`A classe ${classe.titulo} é exclusiva de um grupo: o NPC precisa ser exclusivo desse grupo.`, [{ campo: "classeId", mensagem: "Exclusiva de outro grupo" }]);
    }
  }
  const classeId = d.classeId !== undefined ? d.classeId : atual?.classeId ?? null;
  if (!classeId) {
    const faltando = (["vidaBase", "manaBase", "esforcoBase"] as const).filter((k) => (d[k] !== undefined ? d[k] : atual?.[k] ?? null) === null);
    if (faltando.length) {
      throw requisicaoInvalida("NPC sem classe precisa de vida, mana e esforço base.", faltando.map((campo) => ({ campo, mensagem: "Obrigatório sem classe" })));
    }
  }
}

const completo = {
  raca: { include: { pericias: { include: { pericia: { include: { atributo: true } } } } } },
  classe: {
    include: {
      habilidades: { orderBy: { ordem: "asc" }, include: comStatus },
      pericias: { include: { pericia: { include: { atributo: true } } } },
    },
  },
  atributos: { include: { atributo: true } },
  pericias: { include: { pericia: { include: { atributo: true } } } },
  itens: { orderBy: { criadoEm: "asc" }, include: comRequisitos },
  grupoExclusivo: { select: { id: true, titulo: true } },
  status: { include: { status: true } },
} as const;


export async function listar(usuarioId: string, grupoId?: string) {
  const npcs = await getPrisma().npc.findMany({
    where: { donoId: usuarioId, ...(grupoId && { grupoExclusivoId: grupoId }) },
    orderBy: { nome: "asc" },
    include: { raca: { select: { titulo: true } }, classe: { select: { titulo: true, pontosVida: true, pontosMana: true, pontosEsforco: true } }, grupoExclusivo: { select: { id: true, titulo: true } } },
  });
  return npcs.map((n) => {
    const max = atributosNoNivel(baseDo(n, n.classe), n.nivel);
    return {
      id: n.id, nome: n.nome, descricao: n.descricao, imagemUrl: n.imagemUrl, nivel: n.nivel,
      raca: n.raca.titulo, classe: n.classe?.titulo ?? null, grupoExclusivo: n.grupoExclusivo,
      vida: { atual: Math.min(n.vidaAtual, max.pontosVida), max: max.pontosVida },
      mana: { atual: Math.min(n.manaAtual, max.pontosMana), max: max.pontosMana },
      esforco: { atual: Math.min(n.esforcoAtual, max.pontosEsforco), max: max.pontosEsforco },
      morto: estaMorto(n),
    };
  });
}

/** Ficha completa do NPC, calculada pelas mesmas regras das fichas. */
export async function detalhar(id: string, usuarioId: string) {
  await npcDoMestre(id, usuarioId);
  const prisma = getPrisma();
  const n = await prisma.npc.findUniqueOrThrow({ where: { id }, include: completo });

  const copiaDe = await copiasDoCatalogo(usuarioId);
  const linhas = somarPericias(["raca", "classe", "extra"] as const, [
    ...n.raca.pericias.map((rp) => ({ pericia: rp.pericia, fonte: "raca" as const, valor: rp.pontos })),
    ...(n.classe?.pericias ?? []).map((cp) => ({ pericia: cp.pericia, fonte: "classe" as const, valor: cp.modificador })),
    ...n.pericias.map((np) => ({ pericia: np.pericia, fonte: "extra" as const, valor: np.pontos })),
  ], copiaDe);
  const dados = new Map(n.atributos.map((a) => [a.atributoId, a.dados]));

  const max = atributosNoNivel(baseDo(n, n.classe), n.nivel);
  const atuais = {
    vidaAtual: Math.min(n.vidaAtual, max.pontosVida),
    manaAtual: Math.min(n.manaAtual, max.pontosMana),
    esforcoAtual: Math.min(n.esforcoAtual, max.pontosEsforco),
  };
  const habilidades = n.classe?.habilidades ?? [];
  const disponiveis = await statusDisponiveis(usuarioId, n.grupoExclusivoId);
  const aplicados = n.status.map((s) => s.status);

  // Para onde os itens do NPC podem ir: fichas e grupos do mestre (só do grupo dele, se for exclusivo).
  const grupos = await prisma.grupo.findMany({
    where: { mestreId: usuarioId, ...(n.grupoExclusivoId && { id: n.grupoExclusivoId }) },
    orderBy: { titulo: "asc" },
    select: { id: true, titulo: true, fichas: { orderBy: { nome: "asc" }, select: { id: true, nome: true, jogador: { select: { nickname: true } } } } },
  });

  return {
    id: n.id,
    nome: n.nome,
    descricao: n.descricao,
    imagemUrl: n.imagemUrl,
    nivel: n.nivel,
    racaId: n.racaId,
    classeId: n.classeId,
    vidaBase: n.vidaBase,
    manaBase: n.manaBase,
    esforcoBase: n.esforcoBase,
    grupoExclusivoId: n.grupoExclusivoId,
    grupoExclusivo: n.grupoExclusivo,
    raca: { id: n.raca.id, titulo: n.raca.titulo, deslocamento: n.raca.deslocamento },
    classe: n.classe ? { id: n.classe.id, titulo: n.classe.titulo, grupo: n.classe.grupo } : null,
    vida: { atual: atuais.vidaAtual, max: max.pontosVida },
    mana: { atual: atuais.manaAtual, max: max.pontosMana },
    esforco: { atual: atuais.esforcoAtual, max: max.pontosEsforco },
    morto: estaMorto(atuais),
    /** Status atuais (automáticos pelos recursos + aplicados). Efeitos são informativos. */
    status: statusDaFicha(atuais, disponiveis, aplicados),
    statusAplicaveis: statusAplicaveis(disponiveis, aplicados.map((s) => s.id)),
    atributos: n.atributos
      .map(({ dados: d, atributo }) => ({ ...apresentarAtributo(atributo), dados: d, teste: notacaoDoTeste(d) }))
      .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR")),
    pericias: linhas.map((p) => ({ ...p, teste: notacaoDoTeste(dados.get(p.atributo.id) ?? 0, p.total) })),
    habilidades: habilidadesNoNivel(habilidades, n.nivel).map((h) => ({
      ...aplicarAprimoramentos(h, n.nivel),
      teste: testeDaCarta(h, new Map(linhas.map((l) => [l.id, l.total])), dados, copiaDe),
    })),
    proximasHabilidades: habilidades.filter((h) => h.nivelNecessario > n.nivel).length,
    inventario: { capacidade: capacidadeInventario(n.nivel), usados: espacosUsados(n.itens), itens: n.itens.map(apresentarItem) },
    destinos: {
      grupos: grupos.map((g) => ({ id: g.id, titulo: g.titulo })),
      fichas: grupos.flatMap((g) => g.fichas.map((f) => ({ id: f.id, nome: f.nome, jogador: f.jogador.nickname, grupo: g.titulo }))),
    },
  };
}

async function maximoAtual(npc: { classeId: string | null; nivel: number; vidaBase: number | null; manaBase: number | null; esforcoBase: number | null }) {
  const classe = npc.classeId ? await getPrisma().classe.findUnique({ where: { id: npc.classeId } }) : null;
  return atributosNoNivel(baseDo(npc, classe), npc.nivel);
}

export async function criar(usuarioId: string, dados: z.infer<typeof criarNpcSchema>) {
  await validar(dados, usuarioId);
  const max = await maximoAtual(dados);
  const npc = await getPrisma().npc.create({
    data: { ...dados, donoId: usuarioId, vidaAtual: max.pontosVida, manaAtual: max.pontosMana, esforcoAtual: max.pontosEsforco },
  });
  return detalhar(npc.id, usuarioId);
}

/**
 * Edita dados, recursos atuais e/ou nível/classe/base. Se o máximo mudar (nível, classe ou base), o atual acompanha
 * a diferença (como ao subir de nível). Atuais sempre entre 0 e o máximo.
 */
export async function editar(id: string, usuarioId: string, dados: z.infer<typeof editarNpcSchema>) {
  const atual = await npcDoMestre(id, usuarioId);
  await validar(dados, usuarioId, atual);
  const antes = await maximoAtual(atual);
  const { vidaAtual, manaAtual, esforcoAtual, ...resto } = dados;
  const novo = { ...atual, ...resto };
  const depois = await maximoAtual(novo);
  // Mudou a exclusividade: os itens do NPC passam a pertencer ao grupo novo (ou a nenhum, se ficou geral).
  if (resto.grupoExclusivoId !== undefined && (resto.grupoExclusivoId ?? null) !== atual.grupoExclusivoId) {
    await getPrisma().item.updateMany({ where: { npcId: id }, data: { grupoId: resto.grupoExclusivoId ?? null } });
  }
  const ajustar = (valor: number | undefined, guardado: number, a: number, d: number) =>
    Math.min(Math.max(valor ?? guardado + (d - a), 0), d);
  await getPrisma().npc.update({
    where: { id },
    data: {
      ...resto,
      vidaAtual: ajustar(vidaAtual, Math.min(atual.vidaAtual, antes.pontosVida), antes.pontosVida, depois.pontosVida),
      manaAtual: ajustar(manaAtual, Math.min(atual.manaAtual, antes.pontosMana), antes.pontosMana, depois.pontosMana),
      esforcoAtual: ajustar(esforcoAtual, Math.min(atual.esforcoAtual, antes.pontosEsforco), antes.pontosEsforco, depois.pontosEsforco),
    },
  });
  return detalhar(id, usuarioId);
}

/** Apaga o NPC e os itens que estão com ele. */
export async function excluir(id: string, usuarioId: string) {
  await npcDoMestre(id, usuarioId);
  await getPrisma().npc.delete({ where: { id } });
}

/** Dados (d20) num atributo; 0 tira. */
export async function definirAtributo(npcId: string, atributoId: string, usuarioId: string, dados: number) {
  await npcDoMestre(npcId, usuarioId);
  await atributoUsavel(atributoId, usuarioId);
  const prisma = getPrisma();
  if (dados === 0) await prisma.npcAtributo.deleteMany({ where: { npcId, atributoId } });
  else await prisma.npcAtributo.upsert({ where: { npcId_atributoId: { npcId, atributoId } }, create: { npcId, atributoId, dados }, update: { dados } });
  return detalhar(npcId, usuarioId);
}

/** Pontos extras numa perícia do catálogo do mestre; 0 tira. */
export async function definirPericia(npcId: string, periciaId: string, usuarioId: string, pontos: number) {
  await npcDoMestre(npcId, usuarioId);
  await periciaDoMestre(periciaId, usuarioId);
  const prisma = getPrisma();
  if (pontos === 0) await prisma.npcPericia.deleteMany({ where: { npcId, periciaId } });
  else await prisma.npcPericia.upsert({ where: { npcId_periciaId: { npcId, periciaId } }, create: { npcId, periciaId, pontos }, update: { pontos } });
  return detalhar(npcId, usuarioId);
}

// ---------- Status (o mestre aplica e tira) ----------

export async function aplicarStatus(npcId: string, usuarioId: string, statusId: string) {
  const npc = await npcDoMestre(npcId, usuarioId);
  await validarAplicacao(statusId, usuarioId, await statusDisponiveis(usuarioId, npc.grupoExclusivoId));
  await getPrisma().npcStatus.upsert({ where: { npcId_statusId: { npcId, statusId } }, create: { npcId, statusId }, update: {} });
  return detalhar(npcId, usuarioId);
}

export async function removerStatus(npcId: string, usuarioId: string, statusId: string) {
  await npcDoMestre(npcId, usuarioId);
  await getPrisma().npcStatus.deleteMany({ where: { npcId, statusId } });
  return detalhar(npcId, usuarioId);
}
