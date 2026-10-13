// Catálogo de itens do mestre (moldes): armas, artefatos, itens de taverna e do sebo.
// O mestre lança um molde no grupo a qualquer momento (vago ou direto numa ficha); o item lançado é uma cópia.
import { Router } from "express";
import { z } from "zod";
import { naoEncontrado } from "../../lib/errors.js";
import { comKitIds, comKits, definirKits, visivelNoKit } from "../../lib/kits.js";
import { getPrisma } from "../../lib/prisma.js";
import { comVisao, quemVe, visivelParaSemFixos, type Quem } from "../../lib/sistema.js";
import { idDe } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";
import { apresentarItem, comRequisitos, validarRequisitos } from "./itens.apresentar.js";
import { criarModeloSchema, editarModeloSchema, lancarSchema } from "./itens.schemas.js";
import * as itens from "./itens.service.js";

export const catalogoItensRouter = Router();

const modeloId = (v: unknown) => idDe(v, "Item não encontrado no catálogo");

async function modeloDoMestre(id: string, usuarioId: string) {
  const m = await getPrisma().itemModelo.findUnique({ where: { id } });
  if (!m || m.donoId !== usuarioId) throw naoEncontrado("Item não encontrado no catálogo");
  return m;
}

/** Com `quem`: editável só pelo dono; itens verificado de outra pessoa vêm marcados e sem os kits dela. */
const apresentar = <T extends Parameters<typeof apresentarItem>[0] & { donoId: string; kits?: { kitId: string }[] }>(m: T, quem?: Quem) => {
  const v = quem ? comVisao(m, quem) : null;
  return {
    ...apresentarItem(m),
    kitIds: !quem || m.donoId === quem.usuarioId ? comKitIds(m).kitIds : [],
    ...(v && { editavel: v.editavel, verificado: v.verificado, deOutro: v.deOutro, podeVerificar: v.podeVerificar }),
  };
};
const incluir = { ...comRequisitos, ...comKits } as const;

/** `?kitId=` mostra só o que aparece com aquele kit (do kit + gerais). */
catalogoItensRouter.get("/catalogo-itens", async (req, res) => {
  const { kitId } = z.object({ kitId: z.guid().optional() }).parse(req.query);
  const usuarioId = usuarioDe(req).id;
  const quem = await quemVe(usuarioId);
  const modelos = await getPrisma().itemModelo.findMany({
    where: { AND: [await visivelParaSemFixos(usuarioId), visivelNoKit(kitId)] },
    orderBy: [{ categoria: { ordem: "asc" } }, { nome: "asc" }],
    include: incluir,
  });
  res.json(modelos.map((m) => apresentar(m, quem)));
});

catalogoItensRouter.post("/catalogo-itens", async (req, res) => {
  const dados = criarModeloSchema.parse(req.body);
  const usuarioId = usuarioDe(req).id;
  await validarRequisitos(dados, usuarioId);
  const { kitIds, ...resto } = dados;
  const m = await getPrisma().itemModelo.create({ data: { ...resto, donoId: usuarioId }, include: comRequisitos });
  await definirKits("itemModelo", m.id, kitIds, usuarioId);
  res.status(201).json(apresentar({ ...m, kits: (kitIds ?? []).map((kitId) => ({ kitId })) }));
});

catalogoItensRouter.patch("/catalogo-itens/:id", async (req, res) => {
  const dados = editarModeloSchema.parse(req.body);
  const usuarioId = usuarioDe(req).id;
  const id = modeloId(req.params.id);
  await modeloDoMestre(id, usuarioId);
  await validarRequisitos(dados, usuarioId);
  const { kitIds, ...resto } = dados;
  await definirKits("itemModelo", id, kitIds, usuarioId);
  res.json(apresentar(await getPrisma().itemModelo.update({ where: { id }, data: resto, include: incluir })));
});

/** Itens já lançados continuam nos grupos (são cópias). */
catalogoItensRouter.delete("/catalogo-itens/:id", async (req, res) => {
  const id = modeloId(req.params.id);
  await modeloDoMestre(id, usuarioDe(req).id);
  await getPrisma().itemModelo.delete({ where: { id } });
  res.status(204).end();
});

catalogoItensRouter.post("/catalogo-itens/:id/lancar", async (req, res) => {
  const dados = lancarSchema.parse(req.body);
  res.status(201).json(await itens.lancar(modeloId(req.params.id), usuarioDe(req).id, dados));
});
