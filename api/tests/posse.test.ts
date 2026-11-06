// Posse: tudo é da própria conta. Nada é compartilhado entre contas de mestre.
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { classeFake, logarComo, MESTRE, OUTRO_MESTRE_ID, prepararJwks, prismaFalso, token } from "./helpers.js";

vi.mock("../src/lib/prisma.js", async () => {
  const { prismaFalso } = await import("./prisma-falso.js");
  return { getPrisma: () => prismaFalso };
});

const { criarApp } = await import("../src/app.js");
const app = criarApp({ corsOrigin: ["http://localhost:5173"] });

let tk: string;
beforeAll(async () => {
  await prepararJwks();
  tk = await token(MESTRE);
});

beforeEach(() => {
  vi.clearAllMocks();
  for (const m of Object.values(prismaFalso)) if (typeof m === "object") for (const f of Object.values(m)) (f as ReturnType<typeof vi.fn>).mockReset();
  prismaFalso.$transaction.mockImplementation(async (ops: unknown) => (Array.isArray(ops) ? Promise.all(ops) : ops));
  logarComo(MESTRE);
});

const comoMestre = (r: request.Test) => r.set("Authorization", `Bearer ${tk}`);

describe("posse: tudo é da própria conta", () => {
  it("as listas filtram só pelo dono", async () => {
    for (const m of ["classe", "raca", "besta", "kit", "categoriaItem", "categoriaStatus", "classeConceito"] as const) prismaFalso[m].findMany.mockResolvedValue([]);
    for (const rota of ["/api/classes", "/api/racas", "/api/bestas", "/api/kits", "/api/categorias-item", "/api/status-categorias", "/api/conceitos"]) {
      expect((await comoMestre(request(app).get(rota))).status).toBe(200);
    }
    for (const m of ["classe", "raca", "besta", "kit", "categoriaItem", "categoriaStatus", "classeConceito"] as const) {
      expect(prismaFalso[m].findMany.mock.calls[0]![0].where).toEqual({ donoId: MESTRE.id });
    }
  });

  it("classe de outra conta: não aparece nem para ler (404, não revela que existe)", async () => {
    prismaFalso.classe.findUnique.mockResolvedValue(classeFake({ donoId: OUTRO_MESTRE_ID }));
    expect((await comoMestre(request(app).get(`/api/classes/${classeFake().id}`))).status).toBe(404);
    expect((await comoMestre(request(app).post(`/api/classes/${classeFake().id}/duplicar`))).status).toBe(404);
    expect(prismaFalso.classe.create).not.toHaveBeenCalled();
  });

  it("mesa só libera o que é do mestre", async () => {
    prismaFalso.classe.findMany.mockResolvedValue([classeFake({ donoId: OUTRO_MESTRE_ID })]);
    const res = await comoMestre(request(app).post("/api/grupos")).send({
      titulo: "Mesa", sinopse: "s", genero: "Fantasia", limiteMembros: 4, permitirClassesRepetidas: true,
      disponiveis: { classeIds: [classeFake().id], racaIds: [], atributoIds: [], periciaIds: [] },
    });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Alguma classe escolhida não existe ou não é sua.");
    expect(prismaFalso.grupo.create).not.toHaveBeenCalled();
  });

  it("não há mais rotas de verificado", async () => {
    expect((await comoMestre(request(app).put(`/api/verificados/classe/${classeFake().id}`)).send({ verificado: true })).status).toBe(404);
    expect((await comoMestre(request(app).get("/api/sistema"))).status).toBe(404);
  });
});
