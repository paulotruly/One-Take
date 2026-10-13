import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { JOGADOR, logarComo, MESTRE, OUTRO_MESTRE_ID, prepararJwks, prismaFalso, token } from "./helpers.js";

vi.mock("../src/lib/prisma.js", async () => {
  const { prismaFalso } = await import("./prisma-falso.js");
  return { getPrisma: () => prismaFalso };
});

const { criarApp } = await import("../src/app.js");
const app = criarApp({ corsOrigin: ["http://localhost:5173"] });

const GRUPO = "11111111-0000-4000-8000-000000000001";
const CLASSE = "11111111-0000-4000-8000-000000000002";
const RACA = "11111111-0000-4000-8000-000000000003";
const FIS = "11111111-0000-4000-8000-000000000004";
const CAR = "11111111-0000-4000-8000-000000000005";
const FICHA = "11111111-0000-4000-8000-000000000006";
const ITEM = "11111111-0000-4000-8000-000000000007";
const OUTRA_FICHA = "11111111-0000-4000-8000-000000000008";

let tMestre: string;
let tJogador: string;
beforeAll(async () => {
  await prepararJwks();
  tMestre = await token(MESTRE);
  tJogador = await token(JOGADOR);
});
beforeEach(() => {
  vi.clearAllMocks();
});

const comoMestre = (r: request.Test) => {
  logarComo(MESTRE);
  return r.set("Authorization", `Bearer ${tMestre}`);
};
const comoJogador = (r: request.Test) => {
  logarComo(JOGADOR);
  return r.set("Authorization", `Bearer ${tJogador}`);
};

const grupo = (x: Record<string, unknown> = {}) => ({
  id: GRUPO, mestreId: MESTRE.id, titulo: "Mesa", sinopse: "s", genero: "Fantasia", imagemUrl: null,
  limiteMembros: 4, codigo: "ABC234", permitirClassesRepetidas: true, ...x,
});

describe("grupos (mestre)", () => {
  it("jogador não gerencia grupos (403)", async () => {
    const res = await comoJogador(request(app).get("/api/grupos"));
    expect(res.status).toBe(403);
  });

  it("grupo de outro mestre = 404", async () => {
    prismaFalso.grupo.findUnique.mockResolvedValue(grupo({ mestreId: OUTRO_MESTRE_ID }));
    const res = await comoMestre(request(app).get(`/api/grupos/${GRUPO}`));
    expect(res.status).toBe(404);
  });

  it("disponíveis: recusa raça exclusiva de outro grupo e perícia fora dos atributos marcados", async () => {
    prismaFalso.grupo.findUnique.mockResolvedValue(grupo());
    prismaFalso.classe.findMany.mockResolvedValue([]);
    prismaFalso.raca.findMany.mockResolvedValue([{ id: RACA, donoId: MESTRE.id, grupoExclusivoId: "outro-grupo" }]);
    const exclusiva = await comoMestre(request(app).put(`/api/grupos/${GRUPO}/disponiveis`)).send({
      classeIds: [], racaIds: [RACA], atributoIds: [], periciaIds: [],
    });
    expect(exclusiva.status).toBe(400);

    prismaFalso.raca.findMany.mockResolvedValue([]);
    prismaFalso.atributo.findMany.mockResolvedValue([{ id: FIS, donoId: null, grupoExclusivoId: null }]);
    prismaFalso.pericia.findMany.mockResolvedValue([{ id: "p", donoId: MESTRE.id, atributoId: CAR }]);
    const foraDoAtributo = await comoMestre(request(app).put(`/api/grupos/${GRUPO}/disponiveis`)).send({
      classeIds: [], racaIds: [], atributoIds: [FIS], periciaIds: ["11111111-0000-4000-8000-0000000000aa"],
    });
    expect(foraDoAtributo.status).toBe(400);
    expect(prismaFalso.$transaction).not.toHaveBeenCalled();
  });

  it("regras padrão: só slugs conhecidos podem ser desligados", async () => {
    prismaFalso.grupo.findUnique.mockResolvedValue(grupo());
    const res = await comoMestre(request(app).patch(`/api/grupos/${GRUPO}`)).send({ regrasPadraoDesativadas: ["regra-inventada"] });
    expect(res.status).toBe(400);
    expect(prismaFalso.grupo.update).not.toHaveBeenCalled();
  });

  it("regra própria só no grupo do próprio mestre", async () => {
    prismaFalso.grupo.findUnique.mockResolvedValue(grupo({ mestreId: OUTRO_MESTRE_ID }));
    const res = await comoMestre(request(app).post(`/api/grupos/${GRUPO}/regras`)).send({ titulo: "Críticos", texto: "20 natural dobra o dano." });
    expect(res.status).toBe(404);
    expect(prismaFalso.regraDaMesa.create).not.toHaveBeenCalled();
  });

  it("limite de membros não pode ficar abaixo dos membros atuais", async () => {
    prismaFalso.grupo.findUnique.mockResolvedValue(grupo());
    prismaFalso.ficha.count.mockResolvedValue(3);
    const res = await comoMestre(request(app).patch(`/api/grupos/${GRUPO}`)).send({ limiteMembros: 2 });
    expect(res.status).toBe(400);
  });
});

describe("criar ficha pelo código", () => {
  const corpo = { codigo: "abc234", nome: "Arwen", classeId: CLASSE, racaId: RACA, dados: { [FIS]: 2, [CAR]: 1 } };
  const classe = { id: CLASSE, pontosVida: 30, pontosMana: 10, pontosEsforco: 20 };

  function grupoPronto(x: Record<string, unknown> = {}) {
    prismaFalso.grupo.findUnique.mockResolvedValue(grupo(x));
    prismaFalso.ficha.findUnique.mockResolvedValue(null);
    prismaFalso.ficha.count.mockResolvedValue(1);
    prismaFalso.classeNoGrupo.findUnique.mockResolvedValue({ classe });
    prismaFalso.racaNoGrupo.findUnique.mockResolvedValue({ racaId: RACA });
    prismaFalso.atributoNoGrupo.findMany.mockResolvedValue([{ atributoId: FIS }, { atributoId: CAR }]);
    prismaFalso.ficha.findFirst.mockResolvedValue(null);
  }

  it("código inválido = 404", async () => {
    prismaFalso.grupo.findUnique.mockResolvedValue(null);
    const res = await comoJogador(request(app).post("/api/fichas")).send(corpo);
    expect(res.status).toBe(404);
  });

  it("mestre não cria ficha no próprio grupo", async () => {
    grupoPronto();
    const res = await comoMestre(request(app).post("/api/fichas")).send(corpo);
    expect(res.status).toBe(403);
  });

  it("grupo cheio = 409", async () => {
    grupoPronto({ limiteMembros: 1 });
    const res = await comoJogador(request(app).post("/api/fichas")).send(corpo);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("GRUPO_CHEIO");
  });

  it("classe repetida recusada quando o grupo não permite", async () => {
    grupoPronto({ permitirClassesRepetidas: false });
    prismaFalso.ficha.findFirst.mockResolvedValue({ id: "outra" });
    const res = await comoJogador(request(app).post("/api/fichas")).send(corpo);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CLASSE_REPETIDA");
  });

  it("dados precisam somar 3 e estar nos atributos do grupo", async () => {
    grupoPronto();
    const soma = await comoJogador(request(app).post("/api/fichas")).send({ ...corpo, dados: { [FIS]: 2 } });
    expect(soma.status).toBe(400);
    expect(soma.body.error.message).toContain("exatamente 3");

    const fora = await comoJogador(request(app).post("/api/fichas")).send({ ...corpo, dados: { [FIS]: 2, "11111111-0000-4000-8000-0000000000ff": 1 } });
    expect(fora.status).toBe(400);
    expect(prismaFalso.ficha.create).not.toHaveBeenCalled();
  });

  it("cria com vida/mana/esforço cheios e os dados por atributo", async () => {
    grupoPronto();
    prismaFalso.ficha.create.mockResolvedValue({ id: FICHA });
    // detalhar() depois de criar: deixa falhar no acesso só para checar o create
    await comoJogador(request(app).post("/api/fichas")).send(corpo);
    const data = prismaFalso.ficha.create.mock.calls[0]![0].data;
    expect(data).toMatchObject({ grupoId: GRUPO, jogadorId: JOGADOR.id, nivel: 1, vidaAtual: 30, manaAtual: 10, esforcoAtual: 20 });
    expect(data.atributos.create).toEqual([{ atributoId: FIS, dados: 2 }, { atributoId: CAR, dados: 1 }]);
    expect(prismaFalso.grupo.findUnique.mock.calls[0]![0]).toEqual({ where: { codigo: "ABC234" } });
  });
});

describe("ficha: permissões e progressão", () => {
  const ficha = (x: Record<string, unknown> = {}) => ({
    id: FICHA, grupoId: GRUPO, jogadorId: JOGADOR.id, classeId: CLASSE, nivel: 1, grupo: { mestreId: MESTRE.id }, ...x,
  });

  it("ficha de outro jogador = 404", async () => {
    prismaFalso.ficha.findUnique.mockResolvedValue(ficha({ jogadorId: OUTRO_MESTRE_ID }));
    const res = await comoJogador(request(app).get(`/api/fichas/${FICHA}`));
    expect(res.status).toBe(404);
  });

  it("só o mestre sobe o nível", async () => {
    prismaFalso.ficha.findUnique.mockResolvedValue(ficha());
    const res = await comoJogador(request(app).post(`/api/fichas/${FICHA}/subir-nivel`));
    expect(res.status).toBe(403);
    expect(prismaFalso.ficha.update).not.toHaveBeenCalled();
  });

  it("subir nível: +1 nível, +5 nos atuais e +5 pontos de perícia", async () => {
    prismaFalso.ficha.findUnique.mockResolvedValue(ficha({ nivel: 2 }));
    prismaFalso.ficha.update.mockResolvedValue({});
    await comoMestre(request(app).post(`/api/fichas/${FICHA}/subir-nivel`));
    expect(prismaFalso.ficha.update.mock.calls[0]![0].data).toEqual({
      nivel: 3,
      vidaAtual: { increment: 5 },
      manaAtual: { increment: 5 },
      esforcoAtual: { increment: 5 },
      pontosPericiaDisponiveis: { increment: 5 },
    });
  });

  it("vida/mana/esforço atuais ficam entre 0 e o máximo do nível", async () => {
    prismaFalso.ficha.findUnique.mockResolvedValue(ficha({ nivel: 2 }));
    prismaFalso.classe.findUniqueOrThrow.mockResolvedValue({ pontosVida: 30, pontosMana: 10, pontosEsforco: 20 });
    prismaFalso.ficha.update.mockResolvedValue({});
    await comoJogador(request(app).patch(`/api/fichas/${FICHA}`)).send({ vidaAtual: 999, manaAtual: 0, esforcoAtual: 7 });
    expect(prismaFalso.ficha.update.mock.calls[0]![0].data).toMatchObject({ vidaAtual: 35, manaAtual: 0, esforcoAtual: 7 });
  });
});

describe("itens", () => {
  const item = (x: Record<string, unknown> = {}) => ({
    id: ITEM, grupoId: GRUPO, fichaId: FICHA, nome: "Espada", descricao: "", espacos: 1, usosMaximos: null, usosRestantes: null, grupo: { mestreId: MESTRE.id }, ficha: { jogadorId: JOGADOR.id }, ...x,
  });

  it("jogador passa o próprio item para outra ficha do grupo, se houver espaço", async () => {
    prismaFalso.item.findUnique.mockResolvedValue(item());
    prismaFalso.ficha.findUnique
      .mockResolvedValueOnce({ id: FICHA }) // minha ficha no grupo (após auth, que usa perfil)
      .mockResolvedValueOnce({ grupoId: GRUPO, nivel: 1 }); // destino
    prismaFalso.item.findMany.mockResolvedValue(Array.from({ length: 4 }, () => ({ espacos: 1 })));
    prismaFalso.item.update.mockImplementation(async ({ data }) => ({ ...item(), ...data }));
    const res = await comoJogador(request(app).post(`/api/itens/${ITEM}/mover`)).send({ fichaId: OUTRA_FICHA });
    expect(res.status).toBe(200);
    expect(prismaFalso.item.update.mock.calls[0]![0]).toMatchObject({ where: { id: ITEM }, data: { fichaId: OUTRA_FICHA } });
  });

  it("inventário cheio = 409 (5 espaços no nível 1)", async () => {
    prismaFalso.item.findUnique.mockResolvedValue(item());
    prismaFalso.ficha.findUnique.mockResolvedValueOnce({ id: FICHA }).mockResolvedValueOnce({ grupoId: GRUPO, nivel: 1 });
    prismaFalso.item.findMany.mockResolvedValue([{ espacos: 3 }, { espacos: 2 }]);
    const res = await comoJogador(request(app).post(`/api/itens/${ITEM}/mover`)).send({ fichaId: OUTRA_FICHA });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("INVENTARIO_CHEIO");
  });

  it("descartar deixa o item vago no grupo; jogador não move item de outro", async () => {
    prismaFalso.item.findUnique.mockResolvedValue(item());
    prismaFalso.ficha.findUnique.mockResolvedValueOnce({ id: FICHA });
    prismaFalso.item.update.mockImplementation(async ({ data }) => ({ ...item(), ...data }));
    const ok = await comoJogador(request(app).post(`/api/itens/${ITEM}/mover`)).send({ fichaId: null });
    expect(ok.body.fichaId).toBeNull();

    prismaFalso.item.findUnique.mockResolvedValue(item({ fichaId: OUTRA_FICHA }));
    prismaFalso.ficha.findUnique.mockResolvedValueOnce({ id: FICHA });
    const alheio = await comoJogador(request(app).post(`/api/itens/${ITEM}/mover`)).send({ fichaId: FICHA });
    expect(alheio.status).toBe(403);
  });
});
