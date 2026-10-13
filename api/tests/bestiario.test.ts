import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { JOGADOR, logarComo, MESTRE, OUTRO_MESTRE_ID, prepararJwks, prismaFalso, token } from "./helpers.js";

vi.mock("../src/lib/prisma.js", async () => {
  const { prismaFalso } = await import("./prisma-falso.js");
  return { getPrisma: () => prismaFalso };
});

const { criarApp } = await import("../src/app.js");
const app = criarApp({ corsOrigin: ["http://localhost:5173"] });

const GRUPO = "22222222-0000-4000-8000-000000000001";
const BESTA = "22222222-0000-4000-8000-000000000002";
const CRIATURA = "22222222-0000-4000-8000-000000000003";
const ITEM = "22222222-0000-4000-8000-000000000004";
const FICHA = "22222222-0000-4000-8000-000000000005";
const MODELO = "22222222-0000-4000-8000-000000000006";
const CLASSE = "22222222-0000-4000-8000-000000000007";
const OUTRA_CLASSE = "22222222-0000-4000-8000-000000000008";

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
  prismaFalso.statusNoGrupo.findMany.mockResolvedValue([]);
});

const comoMestre = (r: request.Test) => {
  logarComo(MESTRE);
  return r.set("Authorization", `Bearer ${tMestre}`);
};
const comoJogador = (r: request.Test) => {
  logarComo(JOGADOR);
  return r.set("Authorization", `Bearer ${tJogador}`);
};

const besta = (x: Record<string, unknown> = {}) => ({
  id: BESTA, donoId: MESTRE.id, titulo: "Lobo", descricao: "Caça em bando", imagemUrl: null,
  pontosVida: 12, pontosMana: 3, pontosEsforco: 6, deslocamento: 8, conceitoId: null, grupoExclusivoId: null, ...x,
});
const grupo = (x: Record<string, unknown> = {}) => ({ id: GRUPO, mestreId: MESTRE.id, ...x });
const criatura = (x: Record<string, unknown> = {}) => ({
  id: CRIATURA, grupoId: GRUPO, bestaId: BESTA, nome: "Lobo", nivel: 1, vidaAtual: 12, manaAtual: 3, esforcoAtual: 6,
  criadoEm: new Date(), grupo: grupo(), besta: besta(), ...x,
});

describe("bestiário", () => {
  it("só o mestre ativado acessa; besta de outro mestre = 404", async () => {
    const jogador = await comoJogador(request(app).get("/api/bestas"));
    expect(jogador.status).toBe(403);

    prismaFalso.besta.findUnique.mockResolvedValue(besta({ donoId: OUTRO_MESTRE_ID }));
    const alheia = await comoMestre(request(app).get(`/api/bestas/${BESTA}`));
    expect(alheia.status).toBe(404);
  });

  it("cria besta como classe: vida, mana e esforço base nunca zero", async () => {
    const zerada = await comoMestre(request(app).post("/api/bestas")).send({
      titulo: "Lobo", descricao: "d", pontosVida: 0, pontosMana: 1, pontosEsforco: 1, deslocamento: 8,
    });
    expect(zerada.status).toBe(400);
    expect(zerada.body.error.details).toEqual([{ campo: "pontosVida", mensagem: "Deve ser no mínimo 1" }]);
  });

  it("perícias mostram o teste com os dados do atributo da besta", async () => {
    const FIS = "22222222-0000-4000-8000-0000000000aa";
    prismaFalso.besta.findUnique.mockResolvedValue({
      ...besta(),
      habilidades: [],
      conceito: null,
      atributos: [{ atributoId: FIS, dados: 2, atributo: { id: FIS, nome: "Capacidade física", descricao: "", ordem: 1, donoId: null, grupoExclusivoId: null } }],
      pericias: [{ modificador: 5, pericia: { id: "p1", nome: "Atletismo", descricao: "", categoria: "FISICO", atributo: { id: FIS, nome: "Capacidade física", descricao: "", ordem: 1, donoId: null, grupoExclusivoId: null } } }],
    });
    const res = await comoMestre(request(app).get(`/api/bestas/${BESTA}`));
    expect(res.status).toBe(200);
    expect(res.body.pericias[0]).toMatchObject({ nome: "Atletismo", modificador: 5, teste: "2d20 + 5" });
    expect(res.body.atributos[0]).toMatchObject({ dados: 2, teste: "2d20" });
  });

  it("invoca criaturas no grupo com recursos cheios no nível escolhido e nomes numerados", async () => {
    prismaFalso.grupo.findUnique.mockResolvedValue(grupo());
    prismaFalso.besta.findUnique.mockResolvedValue(besta());
    prismaFalso.criatura.createMany.mockResolvedValue({ count: 2 });
    prismaFalso.criatura.findMany.mockResolvedValue([]);
    const res = await comoMestre(request(app).post(`/api/grupos/${GRUPO}/criaturas`)).send({ bestaId: BESTA, nivel: 3, quantidade: 2 });
    expect(res.status).toBe(201);
    const { data } = prismaFalso.criatura.createMany.mock.calls[0]![0];
    // Nível 3 = base + 2 x 5 (mesma progressão das classes).
    expect(data).toEqual([
      expect.objectContaining({ nome: "Lobo 1", nivel: 3, vidaAtual: 22, manaAtual: 13, esforcoAtual: 16 }),
      expect.objectContaining({ nome: "Lobo 2", nivel: 3 }),
    ]);
  });

  it("não invoca criatura exclusivo de outro grupo", async () => {
    prismaFalso.grupo.findUnique.mockResolvedValue(grupo());
    prismaFalso.besta.findUnique.mockResolvedValue(besta({ grupoExclusivoId: "22222222-0000-4000-8000-0000000000ff" }));
    const res = await comoMestre(request(app).post(`/api/grupos/${GRUPO}/criaturas`)).send({ bestaId: BESTA });
    expect(res.status).toBe(400);
  });

  it("vida em 0: a criatura morre e some do grupo", async () => {
    prismaFalso.criatura.findUnique.mockResolvedValue(criatura());
    prismaFalso.criatura.delete.mockResolvedValue({});
    const res = await comoMestre(request(app).patch(`/api/criaturas/${CRIATURA}`)).send({ vidaAtual: 0 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ removida: true, motivo: "morreu" });
    expect(prismaFalso.criatura.delete).toHaveBeenCalledWith({ where: { id: CRIATURA } });
  });

  it("ajusta recursos dentro do máximo do nível", async () => {
    prismaFalso.criatura.findUnique.mockResolvedValue(criatura());
    prismaFalso.criatura.update.mockImplementation(async ({ data }) => criatura(Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined))));
    const res = await comoMestre(request(app).patch(`/api/criaturas/${CRIATURA}`)).send({ vidaAtual: 99, esforcoAtual: 2 });
    expect(res.body).toMatchObject({ removida: false, criatura: { vida: { atual: 12, max: 12 }, esforco: { atual: 2, max: 6 } } });
  });
});

describe("itens: usar, pré-requisito e catálogo", () => {
  const item = (x: Record<string, unknown> = {}) => ({
    id: ITEM, grupoId: GRUPO, fichaId: FICHA, modeloId: null, categoriaId: null, nome: "Poção", descricao: "", imagemUrl: null,
    efeito: "Cura 2d4", espacos: 1, usosMaximos: 2, usosRestantes: 2, requisito: null, requisitoPericiaId: null, requisitoClasseId: null,
    requisitoPericia: null, requisitoClasse: null, grupo: { mestreId: MESTRE.id }, ficha: { jogadorId: JOGADOR.id, classeId: CLASSE }, ...x,
  });

  it("usar gasta 1 uso; no último uso o item é consumido", async () => {
    prismaFalso.item.findUnique.mockResolvedValue(item());
    prismaFalso.item.update.mockImplementation(async () => item({ usosRestantes: 1 }));
    const primeiro = await comoMestre(request(app).post(`/api/itens/${ITEM}/usar`));
    expect(primeiro.body).toMatchObject({ consumido: false, item: { usosRestantes: 1 } });

    prismaFalso.item.findUnique.mockResolvedValue(item({ usosRestantes: 1 }));
    const ultimo = await comoMestre(request(app).post(`/api/itens/${ITEM}/usar`));
    expect(ultimo.body).toEqual({ consumido: true, item: null });
    expect(prismaFalso.item.delete).toHaveBeenCalledWith({ where: { id: ITEM } });
  });

  it("jogador que não é da classe exigida não sabe usar (403)", async () => {
    prismaFalso.item.findUnique.mockResolvedValue(item({ requisitoClasseId: OUTRA_CLASSE, requisitoClasse: { id: OUTRA_CLASSE, titulo: "Arqueiro" } }));
    prismaFalso.ficha.findUniqueOrThrow.mockResolvedValue({
      grupo: { mestreId: MESTRE.id }, raca: { pericias: [] }, classe: { pericias: [] }, pericias: [],
    });
    prismaFalso.pericia.findMany.mockResolvedValue([]);
    const res = await comoJogador(request(app).post(`/api/itens/${ITEM}/usar`));
    expect(res.status).toBe(403);
    expect(res.body.error).toMatchObject({ code: "NAO_SABE_USAR", message: "Só a classe Arqueiro sabe usar." });
  });

  it("lançar do catálogo cria cópias no grupo (vagas por padrão)", async () => {
    prismaFalso.itemModelo.findUnique.mockResolvedValue({
      id: MODELO, donoId: MESTRE.id, categoriaId: "00000000-0000-4000-8004-000000000001", nome: "Arco curto", descricao: "", imagemUrl: null, efeito: null, espacos: 2,
      usosMaximos: null, requisito: "Arqueiros", requisitoPericiaId: null, requisitoClasseId: null, grupoExclusivoId: null,
      criadoEm: new Date(), atualizadoEm: new Date(),
    });
    prismaFalso.grupo.findUnique.mockResolvedValue(grupo());
    prismaFalso.item.createMany.mockResolvedValue({ count: 3 });
    const res = await comoMestre(request(app).post(`/api/catalogo-itens/${MODELO}/lancar`)).send({ grupoId: GRUPO, quantidade: 3 });
    expect(res.status).toBe(201);
    const { data } = prismaFalso.item.createMany.mock.calls[0]![0];
    expect(data).toHaveLength(3);
    expect(data[0]).toMatchObject({ modeloId: MODELO, grupoId: GRUPO, fichaId: null, nome: "Arco curto", espacos: 2, usosRestantes: null });
  });
});

describe("interface de mestre", () => {
  it("qualquer conta ativa a interface de mestre", async () => {
    prismaFalso.perfil.update.mockResolvedValue({ id: JOGADOR.id, nickname: "j", papel: "MESTRE", nome: null, fotoUrl: null });
    const res = await comoJogador(request(app).post("/api/me/mestre"));
    expect(res.status).toBe(200);
    expect(prismaFalso.perfil.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: JOGADOR.id }, data: { papel: "MESTRE" } }));
  });
});

describe("categorias de item", () => {
  const FIXA = "00000000-0000-4000-8004-000000000001";
  const MINHA = "22222222-0000-4000-8000-0000000000c1";

  it("categoria fixa do sistema não pode ser editada nem excluída", async () => {
    prismaFalso.categoriaItem.findUnique.mockResolvedValue({ id: FIXA, nome: "Armas", donoId: null });
    const res = await comoMestre(request(app).patch(`/api/categorias-item/${FIXA}`)).send({ nome: "Armamento" });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("CATEGORIA_FIXA");
  });

  it("mestre cria categoria própria com ícone da lista; nome repetido = 409", async () => {
    prismaFalso.categoriaItem.findFirst.mockResolvedValue(null);
    prismaFalso.categoriaItem.create.mockImplementation(async ({ data }) => ({ id: MINHA, ordem: 100, ...data, _count: { modelos: 0, itens: 0 } }));
    const ok = await comoMestre(request(app).post("/api/categorias-item")).send({ nome: "Relíquias", icone: "coroa" });
    expect(ok.status).toBe(201);
    expect(ok.body).toMatchObject({ nome: "Relíquias", icone: "coroa", fixa: false, usos: 0 });

    const iconeRuim = await comoMestre(request(app).post("/api/categorias-item")).send({ nome: "X", icone: "dragao" });
    expect(iconeRuim.status).toBe(400);

    prismaFalso.categoriaItem.findFirst.mockResolvedValue({ nome: "Armas" });
    const repetida = await comoMestre(request(app).post("/api/categorias-item")).send({ nome: "armas" });
    expect(repetida.status).toBe(409);
  });
});

describe("NPCs", () => {
  const NPC = "22222222-0000-4000-8000-0000000000d1";
  const RACA = "22222222-0000-4000-8000-0000000000d2";

  it("NPC sem classe precisa de vida, mana e esforço base", async () => {
    prismaFalso.raca.findUnique.mockResolvedValue({ donoId: MESTRE.id });
    const res = await comoMestre(request(app).post("/api/npcs")).send({ nome: "Taverneiro", racaId: RACA, vidaBase: 10 });
    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d: { campo: string }) => d.campo)).toEqual(["manaBase", "esforcoBase"]);
  });

  it("NPC com classe começa cheio, com a vida da classe no nível dele", async () => {
    prismaFalso.raca.findUnique.mockResolvedValue({ donoId: MESTRE.id });
    prismaFalso.classe.findUnique.mockResolvedValue({ id: CLASSE, donoId: null, pontosVida: 30, pontosMana: 10, pontosEsforco: 20 });
    prismaFalso.npc.create.mockImplementation(async ({ data }) => ({ id: NPC, ...data }));
    prismaFalso.npc.findUnique.mockResolvedValue({ id: NPC, donoId: MESTRE.id });
    prismaFalso.npc.findUniqueOrThrow.mockRejectedValue(new Error("parar aqui"));
    await comoMestre(request(app).post("/api/npcs")).send({ nome: "Capitã", racaId: RACA, classeId: CLASSE, nivel: 3 });
    expect(prismaFalso.npc.create.mock.calls[0]![0].data).toMatchObject({ nivel: 3, vidaAtual: 40, manaAtual: 20, esforcoAtual: 30 });
  });

  it("mestre passa item do NPC para a ficha de um jogador do grupo dele", async () => {
    prismaFalso.item.findUnique.mockResolvedValue({
      id: ITEM, grupoId: null, fichaId: null, npcId: NPC, espacos: 1, usosMaximos: null, usosRestantes: null,
      grupo: null, npc: { donoId: MESTRE.id }, ficha: null, categoria: null, requisitoPericia: null, requisitoClasse: null,
    });
    prismaFalso.ficha.findUnique.mockResolvedValue({ id: FICHA, grupoId: GRUPO, nivel: 1, grupo: { mestreId: MESTRE.id } });
    prismaFalso.item.findMany.mockResolvedValue([]);
    prismaFalso.item.update.mockImplementation(async ({ data }) => ({ id: ITEM, espacos: 1, ...data }));
    const res = await comoMestre(request(app).post(`/api/itens/${ITEM}/mover`)).send({ fichaId: FICHA });
    expect(res.status).toBe(200);
    expect(prismaFalso.item.update.mock.calls[0]![0].data).toEqual({ fichaId: FICHA, npcId: null, grupoId: GRUPO });
  });

  it("jogador não mexe em item de NPC", async () => {
    prismaFalso.item.findUnique.mockResolvedValue({ id: ITEM, grupoId: GRUPO, fichaId: null, npcId: NPC, grupo: { mestreId: MESTRE.id }, npc: { donoId: MESTRE.id }, ficha: null });
    const res = await comoJogador(request(app).post(`/api/itens/${ITEM}/mover`)).send({ fichaId: FICHA });
    expect(res.status).toBe(404);
  });
});
