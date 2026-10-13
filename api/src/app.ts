import cors from "cors";
import express, { Router } from "express";
import "./lib/validacao.js"; // configura mensagens do Zod em português
import { getPrisma } from "./lib/prisma.js";
import { autenticar, exigirPapel, usuarioDe } from "./middleware/auth.js";
import { errorHandler, rotaNaoEncontrada } from "./middleware/error-handler.js";
import { classesRouter } from "./modules/classes/classes.routes.js";
import { habilidadesRouter } from "./modules/habilidades/habilidades.routes.js";
import { meRouter } from "./modules/me/me.routes.js";
import { regrasRouter } from "./modules/regras/regras.routes.js";
import { acessoRouter } from "./modules/acesso/acesso.routes.js";
import { fichasRouter } from "./modules/fichas/fichas.routes.js";
import { gruposRouter } from "./modules/grupos/grupos.routes.js";
import { periciasRouter } from "./modules/pericias/pericias.routes.js";
import { garantirCatalogo } from "./modules/pericias/pericias.service.js";
import { racasRouter } from "./modules/racas/racas.routes.js";
import { atributosRouter } from "./modules/atributos/atributos.routes.js";
import { statusRouter } from "./modules/status/status.routes.js";
import { conceitosRouter } from "./modules/conceitos/conceitos.routes.js";
import { bestasRouter } from "./modules/bestas/bestas.routes.js";
import { criaturasRouter } from "./modules/criaturas/criaturas.routes.js";
import { catalogoItensRouter } from "./modules/itens/catalogo.routes.js";
import { categoriasItemRouter } from "./modules/itens/categorias.js";

export function criarApp({ corsOrigin }: { corsOrigin: string[] }) {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", async (_req, res) => {
    try {
      await getPrisma().$queryRaw`SELECT 1`;
      res.json({ status: "ok", banco: "ok" });
    } catch {
      res.status(503).json({ status: "erro", banco: "indisponível" });
    }
  });

  // Público (sem login).
  app.use("/api", regrasRouter, acessoRouter);

  const api = Router();
  api.use(autenticar);

  // Qualquer usuário autenticado (permissões finas ficam nos services).
  api.use(meRouter, fichasRouter);

  // Interface de mestre: só quem ativou (papel MESTRE). Rotas de jogador entram antes desta linha.
  const mestre = Router();
  mestre.use(exigirPapel("MESTRE"));
  mestre.use(async (req, _res, next) => {
    await garantirCatalogo(usuarioDe(req)); // 1º acesso do mestre: copia as perícias base
    next();
  });
  mestre.use(
    classesRouter, habilidadesRouter, periciasRouter, racasRouter, atributosRouter, gruposRouter, statusRouter, conceitosRouter,
    bestasRouter, criaturasRouter, catalogoItensRouter, categoriasItemRouter,
  );
  api.use(mestre);

  app.use("/api", api);
  app.use(rotaNaoEncontrada);
  app.use(errorHandler);
  return app;
}
