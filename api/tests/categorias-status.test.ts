// Categorias de status: do próprio mestre, organizam a página e o que vale no grupo.
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { logarComo, MESTRE, OUTRO_MESTRE_ID, prepararJwks, prismaFalso, token } from "./helpers.js";

vi.mock("../src/lib/prisma.js", async () => {
  const { prismaFalso } = await import("./prisma-falso.js");
  return { getPrisma: () => prismaFalso };
});

const { criarApp } = await import("../src/app.js");
const app = criarApp({ corsOrigin: ["http://localhost:5173"] });

const CAT = "55555555-5555-4555-8555-5555555555aa";
const STATUS = "66666666-6666-4666-8666-6666666666aa";
let tk: string;

beforeAll(async () => {
  await prepararJwks();
  tk = await token(MESTRE);
});

beforeEach(() => {
  vi.clearAllMocks();
  for (const m of Object.values(prismaFalso)) if (typeof m === "object") for (const f of Object.values(m)) (f as ReturnType<typeof vi.fn>).mockReset();
  logarComo(MESTRE);
  prismaFalso.kit.findMany.mockResolvedValue([]);
});

const auth = (r: request.Test) => r.set("Authorization", `Bearer ${tk}`);

describe("categorias de status", () => {
  it("lista só as do mestre", async () => {
    prismaFalso.categoriaStatus.findMany.mockResolvedValue([
      { id: CAT, nome: "Elementais", descricao: "", donoId: MESTRE.id, _count: { status: 2 } },
    ]);
    const res = await auth(request(app).get("/api/status-categorias"));
    expect(res.status).toBe(200);
    expect(prismaFalso.categoriaStatus.findMany.mock.calls[0]![0].where).toEqual({ donoId: MESTRE.id });
    expect(res.body).toEqual([{ id: CAT, nome: "Elementais", descricao: "", usos: 2 }]);
  });

  it("não deixa editar a categoria de outra conta (404)", async () => {
    prismaFalso.categoriaStatus.findUnique.mockResolvedValue({ id: CAT, nome: "X", descricao: "", donoId: OUTRO_MESTRE_ID });
    const res = await auth(request(app).patch(`/api/status-categorias/${CAT}`).send({ nome: "Y" }));
    expect(res.status).toBe(404);
    expect(prismaFalso.categoriaStatus.update).not.toHaveBeenCalled();
  });

  it("status com categoria de outra conta = 404", async () => {
    prismaFalso.status.findFirst.mockResolvedValue(null);
    prismaFalso.categoriaStatus.findUnique.mockResolvedValue({ id: CAT, donoId: OUTRO_MESTRE_ID });
    const res = await auth(request(app).post("/api/status").send({ nome: "Molhado", efeito: "-2", tipo: "DEBUFF", categoriaId: CAT }));
    expect(res.status).toBe(404);
    expect(prismaFalso.status.create).not.toHaveBeenCalled();
  });

  it("a lista de status traz só os do mestre, com a categoria", async () => {
    prismaFalso.status.findMany.mockResolvedValue([
      { id: STATUS, nome: "Em chamas", descricao: "", efeito: "1d4", tipo: "DEBUFF", gatilho: null, ordem: 100, donoId: MESTRE.id, kits: [{ kitId: "k1" }], categoriaId: CAT,
        categoria: { id: CAT, nome: "Elementais" } },
      { id: "s2", nome: "Medo", descricao: "", efeito: "-", tipo: "DEBUFF", gatilho: null, ordem: 100, donoId: MESTRE.id, kits: [], categoriaId: null, categoria: null },
    ]);
    const res = await auth(request(app).get("/api/status"));
    expect(res.status).toBe(200);
    expect(prismaFalso.status.findMany.mock.calls[0]![0].where).toEqual({ donoId: MESTRE.id });
    expect(res.body[0]).toMatchObject({ categoria: { id: CAT, nome: "Elementais" }, kitIds: ["k1"] });
    expect(res.body[1].categoria).toBeNull();
  });
});
