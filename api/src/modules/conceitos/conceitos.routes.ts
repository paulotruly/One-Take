// Conceitos do mestre: um item generalista (título e descrição) que agrupa variações jogáveis.
// - Arquétipo > subclasses (Bruxa > Bruxa elemental)
// - Arquétipo de raça > sub-raças (Elfo > Elfo da floresta)
// - Arquétipo de criatura > formas (Lobo > Lobo das neves)
// Excluir o conceito nunca apaga as variações: elas só ficam sem conceito.
import { Router } from "express";
import { z } from "zod";
import { naoEncontrado } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { idDe, texto } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";

export const conceitosRouter = Router();

const schema = z.object({ titulo: texto(80), descricao: texto(2000) });
type Dados = z.infer<typeof schema>;

/** O mínimo que as rotas usam de um delegate do Prisma (classeConceito, racaConceito, bestaConceito). */
type Delegate = {
  findUnique(a: { where: { id: string } }): Promise<{ donoId: string } | null>;
  findMany(a: object): Promise<unknown[]>;
  create(a: { data: Dados & { donoId: string }; include: object }): Promise<unknown>;
  update(a: { where: { id: string }; data: Partial<Dados>; include: object }): Promise<unknown>;
  delete(a: { where: { id: string } }): Promise<unknown>;
};

function rotas(caminho: string, nome: string, delegate: () => Delegate, include: object) {
  async function doMestre(id: string, usuarioId: string) {
    const c = await delegate().findUnique({ where: { id } });
    if (!c || c.donoId !== usuarioId) throw naoEncontrado(`${nome} não encontrada`);
  }

  conceitosRouter.get(caminho, async (req, res) => {
    res.json(await delegate().findMany({ where: { donoId: usuarioDe(req).id }, orderBy: { titulo: "asc" }, include }));
  });

  conceitosRouter.post(caminho, async (req, res) => {
    const dados = schema.parse(req.body);
    res.status(201).json(await delegate().create({ data: { ...dados, donoId: usuarioDe(req).id }, include }));
  });

  conceitosRouter.patch(`${caminho}/:id`, async (req, res) => {
    const dados = schema.partial().parse(req.body);
    const id = idDe(req.params.id, `${nome} não encontrada`);
    await doMestre(id, usuarioDe(req).id);
    res.json(await delegate().update({ where: { id }, data: dados, include }));
  });

  conceitosRouter.delete(`${caminho}/:id`, async (req, res) => {
    const id = idDe(req.params.id, `${nome} não encontrada`);
    await doMestre(id, usuarioDe(req).id);
    await delegate().delete({ where: { id } });
    res.status(204).end();
  });
}

const resumo = { id: true, titulo: true, imagemUrl: true } as const;

rotas("/conceitos", "Arquétipo", () => getPrisma().classeConceito as unknown as Delegate, {
  subclasses: { orderBy: { titulo: "asc" }, select: { ...resumo, grupo: true, pontosVida: true, pontosMana: true, pontosEsforco: true } },
});
rotas("/conceitos-raca", "Arquétipo de raça", () => getPrisma().racaConceito as unknown as Delegate, {
  subracas: { orderBy: { titulo: "asc" }, select: { ...resumo, deslocamento: true } },
});
rotas("/conceitos-besta", "Arquétipo de criatura", () => getPrisma().bestaConceito as unknown as Delegate, {
  formas: { orderBy: { titulo: "asc" }, select: { ...resumo, pontosVida: true, pontosMana: true, pontosEsforco: true } },
});

/** O conceito precisa ser do próprio mestre (usado por classes, raças e bestas). */
export async function validarConceito(tipo: "classe" | "raca" | "besta", conceitoId: string | null | undefined, usuarioId: string) {
  if (!conceitoId) return;
  const prisma = getPrisma();
  const c =
    tipo === "classe"
      ? await prisma.classeConceito.findUnique({ where: { id: conceitoId }, select: { donoId: true } })
      : tipo === "raca"
        ? await prisma.racaConceito.findUnique({ where: { id: conceitoId }, select: { donoId: true } })
        : await prisma.bestaConceito.findUnique({ where: { id: conceitoId }, select: { donoId: true } });
  if (!c || c.donoId !== usuarioId) throw naoEncontrado("Conceito não encontrado");
}
