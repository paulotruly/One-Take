// Fichas arquivadas: quando uma ficha sai do grupo (o jogador sai, o mestre remove, o grupo é excluído ou o mestre exclui a conta),
// o jogador fica com uma cópia somente leitura do personagem (retrato.ts). A cópia não depende do conteúdo do mestre.
import { Router } from "express";
import { naoEncontrado } from "../../lib/errors.js";
import { getPrisma } from "../../lib/prisma.js";
import { idDe } from "../../lib/validacao.js";
import { usuarioDe } from "../../middleware/auth.js";

// ---------- Rotas do jogador ----------

export const arquivoRouter = Router();
const resumo = { id: true, nome: true, nivel: true, classe: true, raca: true, grupo: true, motivo: true, arquivadaEm: true } as const;

arquivoRouter.get("/fichas-arquivadas", async (req, res) => {
  res.json(await getPrisma().fichaArquivada.findMany({ where: { jogadorId: usuarioDe(req).id }, orderBy: { arquivadaEm: "desc" }, select: resumo }));
});

async function minha(id: string, jogadorId: string) {
  const f = await getPrisma().fichaArquivada.findUnique({ where: { id } });
  if (!f || f.jogadorId !== jogadorId) throw naoEncontrado("Ficha arquivada não encontrada");
  return f;
}

arquivoRouter.get("/fichas-arquivadas/:id", async (req, res) => {
  const { jogadorId: _j, ...f } = await minha(idDe(req.params.id, "Ficha arquivada não encontrada"), usuarioDe(req).id);
  res.json(f);
});

/** Só o dono apaga a cópia (definitivo). */
arquivoRouter.delete("/fichas-arquivadas/:id", async (req, res) => {
  const id = idDe(req.params.id, "Ficha arquivada não encontrada");
  await minha(id, usuarioDe(req).id);
  await getPrisma().fichaArquivada.delete({ where: { id } });
  res.status(204).end();
});
