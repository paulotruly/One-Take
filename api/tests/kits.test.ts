// Tela do kit: o que está dentro, por tipo.
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { logarComo, MESTRE, OUTRO_MESTRE_ID, prepararJwks, prismaFalso, token } from "./helpers.js";

vi.mock("../src/lib/prisma.js", async () => {
  const { prismaFalso } = await import("./prisma-falso.js");
  return { getPrisma: () => prismaFalso };
});

const { criarApp } = await import("../src/app.js");
const app = criarApp({ corsOrigin: ["http://localhost:5173"] });
const KIT = "77777777-7777-4777-8777-7777777777aa";
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

const kitFake = (donoId: string, verificado: boolean) => ({
  id: KIT, donoId, nome: "Kit", descricao: "", verificado, criadoEm: new Date(), atualizadoEm: new Date(),
  _count: { classes: 1, racas: 0, atributos: 0, pericias: 0, status: 0, itens: 0, bestas: 0, npcs: 0, grupos: 1 },
  classes: [{ classe: { id: "c1", titulo: "Espadachim" } }], racas: [], atributos: [], pericias: [], status: [], itens: [], bestas: [], npcs: [],
  grupos: [{ id: "g1", titulo: "Mesa de sexta" }],
});

describe("GET /api/kits/:id", () => {
  it("o dono vê o conteúdo e os grupos", async () => {
    prismaFalso.kit.findUnique.mockResolvedValue(kitFake(MESTRE.id, false));
    const res = await request(app).get(`/api/kits/${KIT}`).set("Authorization", `Bearer ${tk}`);
    expect(res.status).toBe(200);
    expect(res.body.dentro.classes).toEqual([{ id: "c1", nome: "Espadachim" }]);
    expect(res.body.dentro.grupos).toEqual([{ id: "g1", nome: "Mesa de sexta" }]);
  });

  it("kit verificado de outra pessoa: vê o conteúdo, não os grupos dela", async () => {
    prismaFalso.kit.findUnique.mockResolvedValue(kitFake(OUTRO_MESTRE_ID, true));
    const res = await request(app).get(`/api/kits/${KIT}`).set("Authorization", `Bearer ${tk}`);
    expect(res.status).toBe(200);
    expect(res.body.deOutro).toBe(true);
    expect(res.body.dentro.grupos).toEqual([]);
  });

  it("kit de outra pessoa sem selo = 404", async () => {
    prismaFalso.kit.findUnique.mockResolvedValue(kitFake(OUTRO_MESTRE_ID, false));
    const res = await request(app).get(`/api/kits/${KIT}`).set("Authorization", `Bearer ${tk}`);
    expect(res.status).toBe(404);
  });
});
