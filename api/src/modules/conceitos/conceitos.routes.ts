// Conceitos do mestre: um item generalista (título e descrição) que agrupa variações jogáveis.
// - Arquétipo > subclasses (Bruxa > Bruxa elemental)
// - Arquétipo de raça > sub-raças (Elfo > Elfo da floresta)
// - Arquétipo de criatura > formas (Lobo > Lobo das neves)
// Excluir o conceito nunca apaga as variações: elas só ficam sem conceito. Arquétipo verificado: todo mestre vê (só leitura).
import { Router } from "express";
import { z } from "zod";
import { naoEncontrado } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { idDe, texto } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import { ehVerificado, ocultaVerificados, quemVe, visao } from "../../lib/sistema.js";

export const conceitosRouter = Router();

const schema = z.object({ titulo: texto(80), descricao: texto(2000) });
type Dados = z.infer<typeof schema>;

/** O mínimo que as rotas usam de um delegate do Prisma (classeConceito, racaConceito, bestaConceito). */
type Conceito = { id: string; donoId: string; verificado: boolean };
type Delegate = {
  findUnique(a: { where: { id: string } }): Promise<Conceito | null>;
  findMany(a: object): Promise<Conceito[]>;
  create(a: { data: Dados & { donoId: string }; include: object }): Promise<unknown>;
  update(a: { where: { id: string }; data: Partial<Dados>; include: object }): Promise<unknown>;
  delete(a: { where: { id: string } }): Promise<unknown>;
};

type Variacoes = "subclasses" | "subracas" | "formas";

/**
 * `variacoes` = relação (subclasses, subracas, formas); `campos` = o que mostrar de cada variação.
 * Listagem: os do mestre + os verificados + os que têm alguma variação verificada (de um kit verificado, por exemplo).
 * Das variações de outra pessoa só vêm as verificadas; as do mestre vêm todas.
 */
function rotas(caminho: string, nome: string, delegate: () => Delegate, variacoes: Variacoes, campos: object) {
  const include = { [variacoes]: { orderBy: { titulo: "asc" }, select: campos } };

  async function doMestre(id: string, usuarioId: string) {
    const c = await delegate().findUnique({ where: { id } });
    if (!c || c.donoId !== usuarioId) throw naoEncontrado(`${nome} não encontrada`);
  }

  conceitosRouter.get(caminho, async (req, res) => {
    const usuarioId = usuarioDe(req).id;
    const quem = await quemVe(usuarioId);
    const oculta = await ocultaVerificados(usuarioId);
    const visivel = { OR: [{ donoId: usuarioId }, ...(oculta ? [] : ehVerificado().OR)] };
    const lista = await delegate().findMany({
      where: { OR: [{ donoId: usuarioId }, ...(oculta ? [] : [{ verificado: true }, { [variacoes]: { some: ehVerificado() } }])] },
      orderBy: { titulo: "asc" },
      include: { [variacoes]: { where: visivel, orderBy: { titulo: "asc" }, select: campos } },
    });
    res.json(lista.map((c) => ({ ...c, ...visao(c, quem) })));
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

rotas("/conceitos", "Arquétipo", () => getPrisma().classeConceito as unknown as Delegate, "subclasses",
  { ...resumo, grupo: true, pontosVida: true, pontosMana: true, pontosEsforco: true });
rotas("/conceitos-raca", "Arquétipo de raça", () => getPrisma().racaConceito as unknown as Delegate, "subracas", { ...resumo, deslocamento: true });
rotas("/conceitos-besta", "Arquétipo de criatura", () => getPrisma().bestaConceito as unknown as Delegate, "formas",
  { ...resumo, pontosVida: true, pontosMana: true, pontosEsforco: true });

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
