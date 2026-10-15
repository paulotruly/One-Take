import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { statusDaFicha } from "../src/modules/fichas/status-da-ficha.js";
import { estaMorto, gatilhosAtivos } from "../src/regras/status.js";
import { JOGADOR, logarComo, MESTRE, OUTRO_MESTRE_ID, prepararJwks, prismaFalso, token } from "./helpers.js";

vi.mock("../src/lib/prisma.js", async () => {
  const { prismaFalso } = await import("./prisma-falso.js");
  return { getPrisma: () => prismaFalso };
});

const { criarApp } = await import("../src/app.js");
const app = criarApp({ corsOrigin: ["http://localhost:5173"] });

const st = (x: Record<string, unknown>) => ({
  // Padrão: status do seed (do ADMIN, outra conta) verificado.
  id: "s", nome: "S", efeito: "e", tipo: "DEBUFF", gatilho: null, ordem: 100, donoId: OUTRO_MESTRE_ID, verificado: true, criadoEm: new Date(), ...x,
});
const MORTO = st({ id: "morto", nome: "Morto", gatilho: "VIDA_ZERO", ordem: 1 });
const SEM_ENERGIA = st({ id: "sem", nome: "Sem energia vital", gatilho: "MANA_ZERO", ordem: 2 });
const CANSADO = st({ id: "cansado", nome: "Cansado", gatilho: "ESFORCO_ZERO", ordem: 3 });
const ASSUSTADO = st({ id: "assustado", nome: "Assustado", ordem: 10 });

describe("regras de status automáticos", () => {
  it("vida 0 e mana 0 = morte; esforço 0 = cansaço", () => {
    expect(gatilhosAtivos({ vidaAtual: 0, manaAtual: 3, esforcoAtual: 0 })).toEqual(["VIDA_ZERO", "ESFORCO_ZERO"]);
    expect(estaMorto({ vidaAtual: 5, manaAtual: 0, esforcoAtual: 5 })).toBe(true);
    expect(estaMorto({ vidaAtual: 5, manaAtual: 1, esforcoAtual: 0 })).toBe(false);
  });

  it("status da ficha: automáticos pelos recursos + aplicados, só os ativados no grupo", () => {
    const atuais = { vidaAtual: 10, manaAtual: 5, esforcoAtual: 0 };
    const nomes = (l: { nome: string }[]) => l.map((s) => s.nome);
    expect(nomes(statusDaFicha(atuais, [CANSADO, ASSUSTADO] as never, [{ status: ASSUSTADO, turnos: 2 }] as never))).toEqual(["Cansado", "Assustado"]);
    expect(statusDaFicha(atuais, [CANSADO, ASSUSTADO] as never, [{ status: ASSUSTADO, turnos: 2 }] as never).map((s) => s.turnos)).toEqual([null, 2]);
    // Cansado desativado no grupo: não aparece mesmo com esforço 0; aplicado fora do grupo também não.
    expect(nomes(statusDaFicha(atuais, [MORTO] as never, [{ status: ASSUSTADO, turnos: null }] as never))).toEqual([]);
    expect(nomes(statusDaFicha({ vidaAtual: 0, manaAtual: 0, esforcoAtual: 3 }, [MORTO, SEM_ENERGIA, CANSADO] as never, [] as never))).toEqual([
      "Morto",
      "Sem energia vital",
    ]);
  });
});

let tMestre: string;
let tJogador: string;
beforeAll(async () => {
  await prepararJwks();
  tMestre = await token(MESTRE);
  tJogador = await token(JOGADOR);
});
beforeEach(() => vi.clearAllMocks());

const comoMestre = (r: request.Test) => {
  logarComo(MESTRE);
  return r.set("Authorization", `Bearer ${tMestre}`);
};
const comoJogador = (r: request.Test) => {
  logarComo(JOGADOR);
  return r.set("Authorization", `Bearer ${tJogador}`);
};

const ID = "22222222-0000-4000-8000-000000000001";
const FICHA = "22222222-0000-4000-8000-000000000002";

describe("catálogo de status (mestre)", () => {
  it("cria status próprio (sempre manual) e recusa nome repetido", async () => {
    prismaFalso.status.findFirst.mockResolvedValueOnce(st({ nome: "Cansado" }));
    const repetido = await comoMestre(request(app).post("/api/status")).send({ nome: "cansado", efeito: "x", tipo: "DEBUFF" });
    expect(repetido.status).toBe(409);

    prismaFalso.status.findFirst.mockResolvedValue(null);
    prismaFalso.status.create.mockImplementation(async ({ data }) => st({ id: ID, ...data }));
    const ok = await comoMestre(request(app).post("/api/status")).send({ nome: "Corajoso", efeito: "+5 em Carisma", tipo: "BUFF", gatilho: "VIDA_ZERO" });
    expect(ok.status).toBe(201);
    expect(ok.body).toMatchObject({ nome: "Corajoso", automatico: false });
    expect(ok.body).not.toHaveProperty("descricao");
    expect(prismaFalso.status.create.mock.calls[0]![0].data).not.toHaveProperty("gatilho");
  });

  it("status verificado de outra pessoa não é editável (403)", async () => {
    prismaFalso.status.findUnique.mockResolvedValue(st({ id: ID }));
    const res = await comoMestre(request(app).patch(`/api/status/${ID}`)).send({ efeito: "outro" });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("VERIFICADO");
  });

  it("o dono edita até o status automático, mas não o exclui", async () => {
    prismaFalso.status.findUnique.mockResolvedValue(st({ id: ID, nome: "Morto", gatilho: "VIDA_ZERO", donoId: MESTRE.id }));
    prismaFalso.status.findFirst.mockResolvedValue(null);
    prismaFalso.status.update.mockImplementation(async ({ data }) => st({ id: ID, gatilho: "VIDA_ZERO", donoId: MESTRE.id, kits: [], ...data }));
    const editar = await comoMestre(request(app).patch(`/api/status/${ID}`)).send({ nome: "Caído", efeito: "Fora da aventura." });
    expect(editar.status).toBe(200);
    expect(editar.body).toMatchObject({ nome: "Caído", automatico: true });

    const excluir = await comoMestre(request(app).delete(`/api/status/${ID}`));
    expect(excluir.status).toBe(403);
    expect(excluir.body.error.code).toBe("STATUS_AUTOMATICO");
    expect(prismaFalso.status.delete).not.toHaveBeenCalled();
  });

  it("jogador não acessa o catálogo (403)", async () => {
    const res = await comoJogador(request(app).get("/api/status"));
    expect(res.status).toBe(403);
  });
});

describe("aplicar status na ficha", () => {
  const ficha = { id: FICHA, grupoId: "g", jogadorId: JOGADOR.id, classeId: "c", nivel: 1, grupo: { mestreId: MESTRE.id } };

  it("só o mestre aplica", async () => {
    prismaFalso.ficha.findUnique.mockResolvedValue(ficha);
    const res = await comoJogador(request(app).post(`/api/fichas/${FICHA}/status`)).send({ statusId: ID });
    expect(res.status).toBe(403);
  });

  it("não aplica status automático nem desativado no grupo; status de outro mestre = 404", async () => {
    prismaFalso.ficha.findUnique.mockResolvedValue(ficha);
    prismaFalso.status.findUnique.mockResolvedValueOnce(st({ id: ID, gatilho: "ESFORCO_ZERO" }));
    const auto = await comoMestre(request(app).post(`/api/fichas/${FICHA}/status`)).send({ statusId: ID });
    expect(auto.status).toBe(400);

    prismaFalso.status.findUnique.mockResolvedValueOnce(st({ id: ID }));
    prismaFalso.statusNoGrupo.findUnique.mockResolvedValue(null);
    const desativado = await comoMestre(request(app).post(`/api/fichas/${FICHA}/status`)).send({ statusId: ID });
    expect(desativado.status).toBe(400);

    prismaFalso.status.findUnique.mockResolvedValueOnce(st({ id: ID, donoId: OUTRO_MESTRE_ID, verificado: false }));
    const alheio = await comoMestre(request(app).post(`/api/fichas/${FICHA}/status`)).send({ statusId: ID });
    expect(alheio.status).toBe(404);
    expect(prismaFalso.fichaStatus.upsert).not.toHaveBeenCalled();
  });
  it("turnos do status: só o mestre muda; 1 a 99 ao aplicar; status não aplicado = 404", async () => {
    prismaFalso.ficha.findUnique.mockResolvedValue(ficha);
    const jogador = await comoJogador(request(app).patch(`/api/fichas/${FICHA}/status/${ID}`)).send({ turnos: 2 });
    expect(jogador.status).toBe(403);

    const invalido = await comoMestre(request(app).post(`/api/fichas/${FICHA}/status`)).send({ statusId: ID, turnos: 0 });
    expect(invalido.status).toBe(400);
    expect(invalido.body.error.details[0].campo).toBe("turnos");

    prismaFalso.fichaStatus.updateMany.mockResolvedValue({ count: 0 });
    const naoAplicado = await comoMestre(request(app).patch(`/api/fichas/${FICHA}/status/${ID}`)).send({ turnos: 1 });
    expect(naoAplicado.status).toBe(404);
    expect(prismaFalso.fichaStatus.updateMany).toHaveBeenCalledWith({ where: { fichaId: FICHA, statusId: ID }, data: { turnos: 1 } });
  });
});
