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

const kitFake = (donoId: string) => ({
  id: KIT, donoId, nome: "Kit", descricao: "", criadoEm: new Date(), atualizadoEm: new Date(),
  _count: { classes: 1, racas: 0, atributos: 0, pericias: 0, status: 0, itens: 0, bestas: 0, npcs: 0, grupos: 1 },
  classes: [{ classe: { id: "c1", titulo: "Espadachim" } }], racas: [], atributos: [], pericias: [], status: [], itens: [], bestas: [], npcs: [],
  grupos: [{ id: "g1", titulo: "Mesa de sexta" }],
});

describe("GET /api/kits/:id", () => {
  it("o dono vê o conteúdo e os grupos", async () => {
    prismaFalso.kit.findUnique.mockResolvedValue(kitFake(MESTRE.id));
    const res = await request(app).get(`/api/kits/${KIT}`).set("Authorization", `Bearer ${tk}`);
    expect(res.status).toBe(200);
    expect(res.body.dentro.classes).toEqual([{ id: "c1", nome: "Espadachim" }]);
    expect(res.body.dentro.grupos).toEqual([{ id: "g1", nome: "Mesa de sexta" }]);
  });

  it("kit de outra conta = 404", async () => {
    prismaFalso.kit.findUnique.mockResolvedValue(kitFake(OUTRO_MESTRE_ID));
    const res = await request(app).get(`/api/kits/${KIT}`).set("Authorization", `Bearer ${tk}`);
    expect(res.status).toBe(404);
  });
});

describe("conteúdo do kit pela tela do kit", () => {
  const C1 = "88888888-8888-4888-8888-8888888888c1";
  const A1 = "88888888-8888-4888-8888-8888888888a1";
  const P1 = "88888888-8888-4888-8888-8888888888b1";
  const GRUPO = "99999999-9999-4999-8999-9999999999aa";
  const vazio = { classeIds: [], racaIds: [], atributoIds: [], periciaIds: [], statusIds: [], itemIds: [], bestaIds: [], npcIds: [] };
  const auth = (r: request.Test) => r.set("Authorization", `Bearer ${tk}`);

  beforeEach(() => {
    prismaFalso.$transaction.mockImplementation(async (ops: unknown) => (Array.isArray(ops) ? Promise.all(ops) : ops));
    for (const m of ["classe", "raca", "atributo", "pericia", "status", "itemModelo", "besta", "npc"] as const) prismaFalso[m].count.mockResolvedValue(0);
  });

  it("troca tudo o que está no kit e refaz o que vale nas mesas que usam o kit", async () => {
    prismaFalso.kit.findUnique.mockResolvedValue(kitFake(MESTRE.id));
    prismaFalso.classe.count.mockResolvedValue(1);
    prismaFalso.atributo.count.mockResolvedValue(1);
    prismaFalso.grupo.findMany.mockResolvedValue([{ id: GRUPO, kitId: KIT }]);
    prismaFalso.kit.findUniqueOrThrow.mockResolvedValue({
      donoId: MESTRE.id, classes: [{ classeId: C1 }], racas: [], atributos: [{ atributoId: A1 }], pericias: [], status: [],
    });
    prismaFalso.pericia.findMany.mockResolvedValue([{ id: P1 }]);
    prismaFalso.status.findMany.mockResolvedValue([{ id: "morto" }]);
    const res = await auth(request(app).put(`/api/kits/${KIT}/conteudo`)).send({ ...vazio, classeIds: [C1], atributoIds: [A1] });
    expect(res.status).toBe(200);
    expect(prismaFalso.kitClasse.deleteMany).toHaveBeenCalledWith({ where: { kitId: KIT } });
    expect(prismaFalso.kitClasse.createMany).toHaveBeenCalledWith({ data: [{ kitId: KIT, classeId: C1 }] });
    // A mesa do kit: a classe, o atributo com as perícias dele e os status automáticos.
    expect(prismaFalso.classeNoGrupo.createMany).toHaveBeenCalledWith({ data: [{ grupoId: GRUPO, classeId: C1 }] });
    expect(prismaFalso.periciaNoGrupo.createMany).toHaveBeenCalledWith({ data: [{ grupoId: GRUPO, periciaId: P1 }] });
    expect(prismaFalso.statusNoGrupo.createMany).toHaveBeenCalledWith({ data: [{ grupoId: GRUPO, statusId: "morto" }] });
  });

  it("coisa de outra conta não entra no kit (400) e kit de outra conta = 404", async () => {
    prismaFalso.kit.findUnique.mockResolvedValue(kitFake(MESTRE.id));
    const alheia = await auth(request(app).put(`/api/kits/${KIT}/conteudo`)).send({ ...vazio, classeIds: [C1] });
    expect(alheia.status).toBe(400);
    expect(prismaFalso.kitClasse.createMany).not.toHaveBeenCalled();

    prismaFalso.kit.findUnique.mockResolvedValue(kitFake(OUTRO_MESTRE_ID));
    expect((await auth(request(app).put(`/api/kits/${KIT}/conteudo`)).send(vazio)).status).toBe(404);
  });

  it("mesa com kit não aceita marcar à mão (o que vale vem do kit)", async () => {
    prismaFalso.grupo.findUnique.mockResolvedValue({ id: GRUPO, mestreId: MESTRE.id, kitId: KIT });
    const res = await auth(request(app).put(`/api/grupos/${GRUPO}/disponiveis`)).send({ classeIds: [], racaIds: [], atributoIds: [], periciaIds: [] });
    expect(res.status).toBe(400);
    expect(prismaFalso.classeNoGrupo.createMany).not.toHaveBeenCalled();
  });
});
