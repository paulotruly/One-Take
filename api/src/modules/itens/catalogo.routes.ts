// Catálogo de itens do mestre (moldes): armas, artefatos, itens de taverna e do sebo.
// O mestre lança um molde no grupo a qualquer momento (vago ou direto numa ficha); o item lançado é uma cópia.
import { Router } from "express";
import { z } from "zod";
import { naoEncontrado } from "../../lib/errors.js";
import { validarGrupoExclusivo } from "../../lib/exclusividade.js";
import { getPrisma } from "../../lib/prisma.js";
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

const apresentar = <T extends Parameters<typeof apresentarItem>[0] & { grupoExclusivoId: string | null }>(m: T) => ({
  ...apresentarItem(m),
  grupoExclusivoId: m.grupoExclusivoId,
});

/** `?grupoId=` mostra só o que pode ser lançado naquele grupo (geral + exclusivo dele). */
catalogoItensRouter.get("/catalogo-itens", async (req, res) => {
  const { grupoId } = z.object({ grupoId: z.guid().optional() }).parse(req.query);
  const modelos = await getPrisma().itemModelo.findMany({
    where: { donoId: usuarioDe(req).id, ...(grupoId && { OR: [{ grupoExclusivoId: null }, { grupoExclusivoId: grupoId }] }) },
    orderBy: [{ categoria: { ordem: "asc" } }, { nome: "asc" }],
    include: comRequisitos,
  });
  res.json(modelos.map(apresentar));
});

catalogoItensRouter.post("/catalogo-itens", async (req, res) => {
  const dados = criarModeloSchema.parse(req.body);
  const usuarioId = usuarioDe(req).id;
  await validarGrupoExclusivo(dados.grupoExclusivoId, usuarioId);
  await validarRequisitos(dados, usuarioId);
  const m = await getPrisma().itemModelo.create({ data: { ...dados, donoId: usuarioId }, include: comRequisitos });
  res.status(201).json(apresentar(m));
});

catalogoItensRouter.patch("/catalogo-itens/:id", async (req, res) => {
  const dados = editarModeloSchema.parse(req.body);
  const usuarioId = usuarioDe(req).id;
  const id = modeloId(req.params.id);
  await modeloDoMestre(id, usuarioId);
  await validarGrupoExclusivo(dados.grupoExclusivoId, usuarioId);
  await validarRequisitos(dados, usuarioId);
  const m = await getPrisma().itemModelo.update({ where: { id }, data: dados, include: comRequisitos });
  res.json(apresentar(m));
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
