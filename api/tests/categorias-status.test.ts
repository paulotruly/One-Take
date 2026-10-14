// Categorias de status: do mestre (ou verificadas), organizam a página e o que vale no grupo.
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
  it("lista as do mestre e as verificadas", async () => {
    prismaFalso.categoriaStatus.findMany.mockResolvedValue([
      { id: CAT, nome: "Elementais", descricao: "", donoId: MESTRE.id, verificado: false, _count: { status: 2 } },
    ]);
    const res = await auth(request(app).get("/api/status-categorias"));
    expect(res.status).toBe(200);
    expect(prismaFalso.categoriaStatus.findMany.mock.calls[0]![0].where).toEqual({ OR: [{ donoId: MESTRE.id }, { verificado: true }] });
    expect(res.body[0]).toMatchObject({ nome: "Elementais", usos: 2, editavel: true });
  });

  it("não deixa editar a categoria verificada de outra pessoa", async () => {
    prismaFalso.categoriaStatus.findUnique.mockResolvedValue({ id: CAT, nome: "X", descricao: "", donoId: OUTRO_MESTRE_ID, verificado: true });
    const res = await auth(request(app).patch(`/api/status-categorias/${CAT}`).send({ nome: "Y" }));
    expect(res.status).toBe(403);
  });

  it("status com categoria de outra pessoa (não verificada) = 404", async () => {
    prismaFalso.status.findFirst.mockResolvedValue(null);
    prismaFalso.categoriaStatus.findUnique.mockResolvedValue({ id: CAT, donoId: OUTRO_MESTRE_ID, verificado: false });
    const res = await auth(request(app).post("/api/status").send({ nome: "Molhado", efeito: "-2", tipo: "DEBUFF", categoriaId: CAT }));
    expect(res.status).toBe(404);
    expect(prismaFalso.status.create).not.toHaveBeenCalled();
  });

  it("a lista de status traz a categoria (só se for visível)", async () => {
    prismaFalso.status.findMany.mockResolvedValue([
      { id: STATUS, nome: "Em chamas", descricao: "", efeito: "1d4", tipo: "DEBUFF", gatilho: null, ordem: 100, donoId: MESTRE.id, verificado: false, kits: [], categoriaId: CAT,
        categoria: { id: CAT, nome: "Elementais", donoId: MESTRE.id, verificado: false } },
      { id: "s2", nome: "Medo", descricao: "", efeito: "-", tipo: "DEBUFF", gatilho: null, ordem: 100, donoId: OUTRO_MESTRE_ID, verificado: true, kits: [], categoriaId: "c2",
        categoria: { id: "c2", nome: "Privada", donoId: OUTRO_MESTRE_ID, verificado: false } },
    ]);
    const res = await auth(request(app).get("/api/status"));
    expect(res.status).toBe(200);
    expect(res.body[0].categoria).toEqual({ id: CAT, nome: "Elementais" });
    expect(res.body[1].categoria).toBeNull();
  });
});
