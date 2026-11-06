// Kits de RPG do mestre: coleções para uma aventura. O conteúdo entra no kit pelo campo `kitIds` de cada coisa
// (classe, raça, atributo, perícia, status, item do catálogo, criatura, NPC). Excluir o kit não apaga nada: as coisas só saem dele.
// Só o dono vê e usa o kit.
import { Router } from "express";
import { z } from "zod";
import { naoEncontrado } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { idDe, texto } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import { doDono } from "../../lib/posse.js";
import { requisicaoInvalida } from "../../lib/errors.js";
import { sincronizarMesas } from "../grupos/kit-da-mesa.js";

export const kitsRouter = Router();

const base = z.object({ nome: texto(80), descricao: z.string().trim().max(2000) });
const criarSchema = base.extend({ descricao: base.shape.descricao.default("") });

const contagem = {
  _count: { select: { classes: true, racas: true, atributos: true, pericias: true, status: true, itens: true, bestas: true, npcs: true, grupos: true } },
} as const;

function apresentar<T extends { _count: Record<string, number> }>({ _count, ...k }: T) {
  return { ...k, conteudo: _count };
}

async function kitDoMestre(id: string, usuarioId: string) {
  const kit = await getPrisma().kit.findUnique({ where: { id } });
  if (!kit || kit.donoId !== usuarioId) throw naoEncontrado("Kit não encontrado");
  return kit;
}

kitsRouter.get("/kits", async (req, res) => {
  const kits = await getPrisma().kit.findMany({ where: doDono(usuarioDe(req).id), orderBy: { nome: "asc" }, include: contagem });
  res.json(kits.map((k) => apresentar(k)));
});

/** O que está dentro do kit, por tipo (nomes e ids, para a tela do kit). */
const nome = { select: { id: true, nome: true } } as const;
const titulo = { select: { id: true, titulo: true } } as const;
const dentro = {
  classes: { select: { classe: titulo } },
  racas: { select: { raca: titulo } },
  atributos: { select: { atributo: nome } },
  pericias: { select: { pericia: { select: { id: true, nome: true, atributo: { select: { nome: true } } } } } },
  status: { select: { status: { select: { id: true, nome: true, tipo: true } } } },
  itens: { select: { itemModelo: nome } },
  bestas: { select: { besta: titulo } },
  npcs: { select: { npc: nome } },
  grupos: { select: { id: true, titulo: true } },
} as const;

const porNome = <T extends { nome: string }>(l: T[]) => l.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

async function detalharKit(id: string, usuarioId: string) {
  const kit = await getPrisma().kit.findUnique({ where: { id }, include: { ...contagem, ...dentro } });
  if (!kit || kit.donoId !== usuarioId) throw naoEncontrado("Kit não encontrado");
  const { classes, racas, atributos, pericias, status, itens, bestas, npcs, grupos, ...resto } = kit;
  return {
    ...apresentar(resto),
    dentro: {
      classes: porNome(classes.map(({ classe: c }) => ({ id: c.id, nome: c.titulo }))),
      racas: porNome(racas.map(({ raca: r }) => ({ id: r.id, nome: r.titulo }))),
      atributos: porNome(atributos.map(({ atributo: a }) => a)),
      pericias: porNome(pericias.map(({ pericia: p }) => ({ id: p.id, nome: p.nome, atributo: p.atributo.nome }))),
      status: porNome(status.map(({ status: s }) => s)),
      itens: porNome(itens.map(({ itemModelo: i }) => i)),
      bestas: porNome(bestas.map(({ besta: b }) => ({ id: b.id, nome: b.titulo }))),
      npcs: porNome(npcs.map(({ npc: n }) => n)),
      grupos: porNome(grupos.map((g) => ({ id: g.id, nome: g.titulo }))),
    },
  };
}

kitsRouter.get("/kits/:id", async (req, res) => {
  res.json(await detalharKit(idDe(req.params.id, "Kit não encontrado"), usuarioDe(req).id));
});

const ids = z.array(z.guid("Item inválido")).max(1000);
const conteudoSchema = z.object({
  classeIds: ids, racaIds: ids, atributoIds: ids, periciaIds: ids, statusIds: ids, itemIds: ids, bestaIds: ids, npcIds: ids,
});

/**
 * Troca tudo o que está no kit (a tela do kit marca por caixa de seleção). Tudo precisa ser do mestre.
 * As mesas que usam o kit passam a valer com o conteúdo novo.
 */
kitsRouter.put("/kits/:id/conteudo", async (req, res) => {
  const d = conteudoSchema.parse(req.body);
  const usuarioId = usuarioDe(req).id;
  const kitId = idDe(req.params.id, "Kit não encontrado");
  await kitDoMestre(kitId, usuarioId);
  const prisma = getPrisma();
  const u = (l: string[]) => [...new Set(l)];
  const meus = { donoId: usuarioId } as const;
  const contagens = await Promise.all([
    prisma.classe.count({ where: { id: { in: u(d.classeIds) }, ...meus } }),
    prisma.raca.count({ where: { id: { in: u(d.racaIds) }, ...meus } }),
    prisma.atributo.count({ where: { id: { in: u(d.atributoIds) }, ...meus } }),
    prisma.pericia.count({ where: { id: { in: u(d.periciaIds) }, ...meus } }),
    prisma.status.count({ where: { id: { in: u(d.statusIds) }, ...meus } }),
    prisma.itemModelo.count({ where: { id: { in: u(d.itemIds) }, ...meus } }),
    prisma.besta.count({ where: { id: { in: u(d.bestaIds) }, ...meus } }),
    prisma.npc.count({ where: { id: { in: u(d.npcIds) }, ...meus } }),
  ]);
  const esperado = [d.classeIds, d.racaIds, d.atributoIds, d.periciaIds, d.statusIds, d.itemIds, d.bestaIds, d.npcIds].map((l) => u(l).length);
  if (contagens.some((n, i) => n !== esperado[i])) throw requisicaoInvalida("Alguma coisa marcada não existe ou não é sua.");
  await prisma.$transaction([
    prisma.kitClasse.deleteMany({ where: { kitId } }),
    prisma.kitRaca.deleteMany({ where: { kitId } }),
    prisma.kitAtributo.deleteMany({ where: { kitId } }),
    prisma.kitPericia.deleteMany({ where: { kitId } }),
    prisma.kitStatus.deleteMany({ where: { kitId } }),
    prisma.kitItemModelo.deleteMany({ where: { kitId } }),
    prisma.kitBesta.deleteMany({ where: { kitId } }),
    prisma.kitNpc.deleteMany({ where: { kitId } }),
    prisma.kitClasse.createMany({ data: u(d.classeIds).map((classeId) => ({ kitId, classeId })) }),
    prisma.kitRaca.createMany({ data: u(d.racaIds).map((racaId) => ({ kitId, racaId })) }),
    prisma.kitAtributo.createMany({ data: u(d.atributoIds).map((atributoId) => ({ kitId, atributoId })) }),
    prisma.kitPericia.createMany({ data: u(d.periciaIds).map((periciaId) => ({ kitId, periciaId })) }),
    prisma.kitStatus.createMany({ data: u(d.statusIds).map((statusId) => ({ kitId, statusId })) }),
    prisma.kitItemModelo.createMany({ data: u(d.itemIds).map((itemModeloId) => ({ kitId, itemModeloId })) }),
    prisma.kitBesta.createMany({ data: u(d.bestaIds).map((bestaId) => ({ kitId, bestaId })) }),
    prisma.kitNpc.createMany({ data: u(d.npcIds).map((npcId) => ({ kitId, npcId })) }),
  ]);
  await sincronizarMesas([kitId]);
  res.json(await detalharKit(kitId, usuarioId));
});

kitsRouter.post("/kits", async (req, res) => {
  const dados = criarSchema.parse(req.body);
  res.status(201).json(apresentar(await getPrisma().kit.create({ data: { ...dados, donoId: usuarioDe(req).id }, include: contagem })));
});

kitsRouter.patch("/kits/:id", async (req, res) => {
  const dados = base.partial().parse(req.body);
  const id = idDe(req.params.id, "Kit não encontrado");
  await kitDoMestre(id, usuarioDe(req).id);
  res.json(apresentar(await getPrisma().kit.update({ where: { id }, data: dados, include: contagem })));
});

/** As coisas do kit continuam existindo (sem esse kit; se não estiverem em outro, viram gerais). Grupos ficam sem kit. */
kitsRouter.delete("/kits/:id", async (req, res) => {
  const id = idDe(req.params.id, "Kit não encontrado");
  await kitDoMestre(id, usuarioDe(req).id);
  await getPrisma().kit.delete({ where: { id } });
  res.status(204).end();
});
