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
  id: "s", nome: "S", descricao: "", efeito: "e", tipo: "DEBUFF", gatilho: null, ordem: 100, donoId: null, criadoEm: new Date(), ...x,
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
    expect(nomes(statusDaFicha(atuais, [CANSADO, ASSUSTADO] as never, [ASSUSTADO] as never))).toEqual(["Cansado", "Assustado"]);
    // Cansado desativado no grupo: não aparece mesmo com esforço 0; aplicado fora do grupo também não.
    expect(nomes(statusDaFicha(atuais, [MORTO] as never, [ASSUSTADO] as never))).toEqual([]);
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
    expect(ok.body).toMatchObject({ nome: "Corajoso", fixo: false, automatico: false });
    expect(prismaFalso.status.create.mock.calls[0]![0].data).not.toHaveProperty("gatilho");
  });

  it("status fixo não é editável (403)", async () => {
    prismaFalso.status.findUnique.mockResolvedValue(st({ id: ID, donoId: null }));
    const res = await comoMestre(request(app).patch(`/api/status/${ID}`)).send({ efeito: "outro" });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("STATUS_FIXO");
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

    prismaFalso.status.findUnique.mockResolvedValueOnce(st({ id: ID, donoId: OUTRO_MESTRE_ID }));
    const alheio = await comoMestre(request(app).post(`/api/fichas/${FICHA}/status`)).send({ statusId: ID });
    expect(alheio.status).toBe(404);
    expect(prismaFalso.fichaStatus.upsert).not.toHaveBeenCalled();
  });
});
