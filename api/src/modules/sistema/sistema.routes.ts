// Sistema: cargo de quem vê e marcação de conteúdo verificado (só o administrador, só nas coisas dele).
import { Router } from "express";
import { z } from "zod";
import { naoEncontrado, proibido } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { ehAdmin, TIPOS_VERIFICAVEIS, type TipoVerificavel } from "../../lib/sistema.js";
import { usuarioDe } from "../../middleware/auth.js";

export const sistemaRouter = Router();

sistemaRouter.get("/sistema", async (req, res) => {
  res.json({ admin: await ehAdmin(usuarioDe(req).id) });
});

// Delegates do Prisma por tipo (todos têm id, donoId e verificado).
type Delegate = {
  findUnique(a: { where: { id: string }; select: { donoId: true } }): Promise<{ donoId: string | null } | null>;
  update(a: { where: { id: string }; data: { verificado: boolean } }): Promise<unknown>;
};
const delegate = (tipo: TipoVerificavel) => getPrisma()[tipo] as unknown as Delegate;

/** Marca ou desmarca como verificado: todo mestre passa a ver e usar (só leitura). Fixo não precisa (já é de todos). */
sistemaRouter.put("/verificados/:tipo/:id", async (req, res) => {
  const { tipo, id } = z.object({ tipo: z.enum(TIPOS_VERIFICAVEIS), id: z.guid() }).parse(req.params);
  const { verificado } = z.object({ verificado: z.boolean() }).parse(req.body);
  const usuarioId = usuarioDe(req).id;
  if (!(await ehAdmin(usuarioId))) throw proibido("Só o administrador do sistema marca conteúdo como verificado.");
  const obj = await delegate(tipo).findUnique({ where: { id }, select: { donoId: true } });
  if (!obj || obj.donoId !== usuarioId) throw naoEncontrado("Não encontrado entre as suas coisas");
  await delegate(tipo).update({ where: { id }, data: { verificado } });
  res.json({ tipo, id, verificado });
});
