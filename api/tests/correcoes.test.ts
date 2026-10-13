import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { JOGADOR, logarComo, MESTRE, prepararJwks, prismaFalso, token } from "./helpers.js";

vi.mock("../src/lib/prisma.js", async () => {
  const { prismaFalso } = await import("./prisma-falso.js");
  return { getPrisma: () => prismaFalso };
});

const { criarApp } = await import("../src/app.js");
const { proximosNomes } = await import("../src/modules/criaturas/criaturas.service.js");
const app = criarApp({ corsOrigin: ["http://localhost:5173"] });

const GRUPO = "33333333-0000-4000-8000-000000000001";
const OUTRO_GRUPO = "33333333-0000-4000-8000-000000000002";
const FICHA = "33333333-0000-4000-8000-000000000003";
const CLASSE = "33333333-0000-4000-8000-000000000004";
const HAB = "33333333-0000-4000-8000-000000000005";
const ITEM = "33333333-0000-4000-8000-000000000006";
const NPC = "33333333-0000-4000-8000-000000000007";

let tMestre: string;
let tJogador: string;
beforeAll(async () => {
  await prepararJwks();
  tMestre = await token(MESTRE);
  tJogador = await token(JOGADOR);
});
beforeEach(() => {
  vi.resetAllMocks();
  prismaFalso.$transaction.mockImplementation(async (ops: unknown) => (Array.isArray(ops) ? Promise.all(ops) : ops));
});
const comoMestre = (r: request.Test) => { logarComo(MESTRE); return r.set("Authorization", `Bearer ${tMestre}`); };
const comoJogador = (r: request.Test) => { logarComo(JOGADOR); return r.set("Authorization", `Bearer ${tJogador}`); };

describe("nomes de criatura", () => {
  it("continua do maior número: morte não faz repetir nome", () => {
    expect(proximosNomes("Lobo", [], 1)).toEqual(["Lobo"]);
    expect(proximosNomes("Lobo", [], 2)).toEqual(["Lobo 1", "Lobo 2"]);
    expect(proximosNomes("Lobo", ["Lobo 2"], 1)).toEqual(["Lobo 3"]);
    expect(proximosNomes("Lobo", ["Lobo"], 2)).toEqual(["Lobo 2", "Lobo 3"]);
    expect(proximosNomes("Lobo", ["Lobo alfa 9"], 1)).toEqual(["Lobo"]);
  });
});

describe("ficha: vida e nível", () => {
  const ficha = (x: Record<string, unknown> = {}) => ({ id: FICHA, grupoId: GRUPO, jogadorId: JOGADOR.id, classeId: CLASSE, nivel: 1, vidaAtual: 10, manaAtual: 5, esforcoAtual: 5, grupo: { mestreId: MESTRE.id }, ...x });

  it("jogador diminui a vida, mas não aumenta", async () => {
    prismaFalso.ficha.findUnique.mockResolvedValue(ficha());
    prismaFalso.classe.findUniqueOrThrow.mockResolvedValue({ pontosVida: 20, pontosMana: 5, pontosEsforco: 5 });
    const sobe = await comoJogador(request(app).patch(`/api/fichas/${FICHA}`)).send({ vidaAtual: 15 });
    expect(sobe.status).toBe(403);
    expect(sobe.body.error.code).toBe("SO_MESTRE_CURA");
    expect(prismaFalso.ficha.update).not.toHaveBeenCalled();
  });

  it("não sobe além do nível máximo (100)", async () => {
    prismaFalso.ficha.findUnique.mockResolvedValue(ficha({ nivel: 100 }));
    const res = await comoMestre(request(app).post(`/api/fichas/${FICHA}/subir-nivel`));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("NIVEL_MAXIMO");
  });
});

describe("carta e aprimoramentos", () => {
  it("nível necessário não pode chegar no nível de um aprimoramento", async () => {
    prismaFalso.habilidade.findUnique.mockResolvedValue({ id: HAB, classeId: CLASSE, bestaId: null, nivelNecessario: 1 });
    prismaFalso.classe.findUnique.mockResolvedValue({ id: CLASSE, donoId: MESTRE.id });
    prismaFalso.habilidadeAprimoramento.findFirst.mockResolvedValue({ nivel: 3 });
    const res = await comoMestre(request(app).patch(`/api/habilidades/${HAB}`)).send({ nivelNecessario: 3 });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].campo).toBe("nivelNecessario");
  });
});

describe("exclusividade em uso", () => {
  it("não torna exclusiva uma classe usada por ficha de outro grupo", async () => {
    prismaFalso.classe.findUnique.mockResolvedValue({ id: CLASSE, donoId: MESTRE.id });
    prismaFalso.grupo.findUnique.mockResolvedValue({ mestreId: MESTRE.id });
    prismaFalso.ficha.count.mockResolvedValue(2);
    prismaFalso.npc.count.mockResolvedValue(0);
    const res = await comoMestre(request(app).patch(`/api/classes/${CLASSE}`)).send({ grupoExclusivoId: GRUPO });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EXCLUSIVO_EM_USO");
  });
});

describe("itens de NPC", () => {
  const item = (x: Record<string, unknown> = {}) => ({
    id: ITEM, grupoId: GRUPO, fichaId: null, npcId: NPC, espacos: 1, usosMaximos: null, usosRestantes: null,
    grupo: { mestreId: MESTRE.id }, npc: { donoId: MESTRE.id }, ficha: null, categoria: null, requisitoPericia: null, requisitoClasse: null, ...x,
  });

  it("NPC exclusivo não entrega item para ficha de outro grupo", async () => {
    prismaFalso.item.findUnique.mockResolvedValue(item());
    prismaFalso.ficha.findUnique.mockResolvedValue({ id: FICHA, grupoId: OUTRO_GRUPO, nivel: 1, grupo: { mestreId: MESTRE.id } });
    prismaFalso.item.findMany.mockResolvedValue([]);
    prismaFalso.npc.findUnique.mockResolvedValue({ grupoExclusivoId: GRUPO, nome: "Capitã" });
    const res = await comoMestre(request(app).post(`/api/itens/${ITEM}/mover`)).send({ fichaId: FICHA });
    expect(res.status).toBe(400);
    expect(prismaFalso.item.update).not.toHaveBeenCalled();
  });

  it("item dado a NPC geral deixa de pertencer a um grupo", async () => {
    prismaFalso.item.findUnique.mockResolvedValue(item({ npcId: null, npc: null }));
    prismaFalso.npc.findUnique.mockResolvedValue({ id: NPC, donoId: MESTRE.id, nivel: 1, grupoExclusivoId: null });
    prismaFalso.item.findMany.mockResolvedValue([]);
    prismaFalso.item.update.mockImplementation(async ({ data }) => ({ ...item(), ...data }));
    await comoMestre(request(app).post(`/api/itens/${ITEM}/mover`)).send({ fichaId: null, npcId: NPC });
    expect(prismaFalso.item.update.mock.calls[0]![0].data).toEqual({ npcId: NPC, fichaId: null, grupoId: null });
  });

  it("excluir grupo solta (não apaga) os itens que estão com NPCs", async () => {
    prismaFalso.grupo.findUnique.mockResolvedValue({ id: GRUPO, mestreId: MESTRE.id });
    prismaFalso.item.updateMany.mockResolvedValue({ count: 1 });
    prismaFalso.grupo.delete.mockResolvedValue({});
    const res = await comoMestre(request(app).delete(`/api/grupos/${GRUPO}`));
    expect(res.status).toBe(204);
    expect(prismaFalso.item.updateMany).toHaveBeenCalledWith({ where: { grupoId: GRUPO, npcId: { not: null } }, data: { grupoId: null } });
  });
});
