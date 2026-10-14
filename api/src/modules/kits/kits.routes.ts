// Kits de RPG do mestre: coleções para uma aventura. O conteúdo entra no kit pelo campo `kitIds` de cada coisa
// (classe, raça, atributo, perícia, status, item do catálogo, criatura, NPC). Excluir o kit não apaga nada: as coisas só saem dele.
// Kit verificado: todo mestre vê e usa (só leitura), e tudo o que está nele conta como verificado.
import { Router } from "express";
import { z } from "zod";
import { naoEncontrado } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { idDe, texto } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import { ocultaVerificados, quemVe, visao, type Quem } from "../../lib/sistema.js";

export const kitsRouter = Router();

const base = z.object({ nome: texto(80), descricao: z.string().trim().max(2000) });
const criarSchema = base.extend({ descricao: base.shape.descricao.default("") });

const contagem = {
  _count: { select: { classes: true, racas: true, atributos: true, pericias: true, status: true, itens: true, bestas: true, npcs: true, grupos: true } },
} as const;

/** Com `quem`: campos de visão (o kit verificado de outra pessoa vem só leitura). */
function apresentar<T extends { donoId: string; verificado: boolean; _count: Record<string, number> }>({ _count, ...k }: T, quem?: Quem) {
  return { ...k, conteudo: _count, ...(quem && visao(k, quem)) };
}

async function kitDoMestre(id: string, usuarioId: string) {
  const kit = await getPrisma().kit.findUnique({ where: { id } });
  if (!kit || kit.donoId !== usuarioId) throw naoEncontrado("Kit não encontrado");
  return kit;
}

kitsRouter.get("/kits", async (req, res) => {
  // Os do mestre + os kits verificados (de outras pessoas), que dá para usar como kit ativo e no grupo.
  const usuarioId = usuarioDe(req).id;
  const quem = await quemVe(usuarioId);
  const kits = await getPrisma().kit.findMany({ where: (await ocultaVerificados(usuarioId)) ? { donoId: usuarioId } : { OR: [{ donoId: usuarioId }, { verificado: true }] }, orderBy: { nome: "asc" }, include: contagem });
  res.json(kits.sort((a, b) => Number(a.donoId !== usuarioId) - Number(b.donoId !== usuarioId)).map((k) => apresentar(k, quem)));
});

/** O que está dentro do kit, por tipo (nomes e ids, para a tela do kit). Do mestre ou verificado; os grupos só para o dono. */
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

kitsRouter.get("/kits/:id", async (req, res) => {
  const usuarioId = usuarioDe(req).id;
  const id = idDe(req.params.id, "Kit não encontrado");
  const kit = await getPrisma().kit.findUnique({ where: { id }, include: { ...contagem, ...dentro } });
  if (!kit || (kit.donoId !== usuarioId && !kit.verificado)) throw naoEncontrado("Kit não encontrado");
  const { classes, racas, atributos, pericias, status, itens, bestas, npcs, grupos, ...resto } = kit;
  res.json({
    ...apresentar(resto, await quemVe(usuarioId)),
    dentro: {
      classes: porNome(classes.map(({ classe: c }) => ({ id: c.id, nome: c.titulo }))),
      racas: porNome(racas.map(({ raca: r }) => ({ id: r.id, nome: r.titulo }))),
      atributos: porNome(atributos.map(({ atributo: a }) => a)),
      pericias: porNome(pericias.map(({ pericia: p }) => ({ id: p.id, nome: p.nome, atributo: p.atributo.nome }))),
      status: porNome(status.map(({ status: s }) => s)),
      itens: porNome(itens.map(({ itemModelo: i }) => i)),
      bestas: porNome(bestas.map(({ besta: b }) => ({ id: b.id, nome: b.titulo }))),
      npcs: porNome(npcs.map(({ npc: n }) => n)),
      grupos: kit.donoId === usuarioId ? porNome(grupos.map((g) => ({ id: g.id, nome: g.titulo }))) : [],
    },
  });
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
