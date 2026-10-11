import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { classeFake, JOGADOR, logarComo, MESTRE, OUTRO_MESTRE_ID, prepararJwks, prismaFalso, token } from "./helpers.js";

vi.mock("../src/lib/prisma.js", async () => {
  const { prismaFalso } = await import("./prisma-falso.js");
  return { getPrisma: () => prismaFalso };
});

const { criarApp } = await import("../src/app.js");
const app = criarApp({ corsOrigin: ["http://localhost:5173"] });

let tokenMestre: string;
let tokenJogador: string;

beforeAll(async () => {
  await prepararJwks();
  tokenMestre = await token(MESTRE);
  tokenJogador = await token(JOGADOR);
});

beforeEach(() => {
  vi.clearAllMocks();
  logarComo(MESTRE);
});

const comoMestre = (r: request.Test) => r.set("Authorization", `Bearer ${tokenMestre}`);

describe("health", () => {
  it("responde ok sem autenticação", async () => {
    prismaFalso.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("regras públicas", () => {
  it("GET /api/regras não exige login e traz progressão, ficha e atributos fixos", async () => {
    prismaFalso.atributo.findMany.mockResolvedValue([{ nome: "Capacidade física", descricao: "x" }]);
    const res = await request(app).get("/api/regras");
    expect(res.status).toBe(200);
    expect(res.body.ficha).toEqual({ pontosAtributoIniciais: 3, inventarioInicial: 5, inventarioPorNivel: 2 });
    expect(res.body.progressao.ganhoPorNivel.pontosVida).toBe(5);
    expect(res.body.atributosFixos[0].nome).toBe("Capacidade física");
  });
});

describe("acesso por nickname (público)", () => {
  it("diz se o nickname está disponível", async () => {
    prismaFalso.perfil.findUnique.mockResolvedValueOnce({ id: "x" }).mockResolvedValueOnce(null);
    expect((await request(app).get("/api/nicknames/paulo")).body).toEqual({ disponivel: false, motivo: "Este nickname já está em uso." });
    expect((await request(app).get("/api/nicknames/@Novo")).body).toEqual({ disponivel: true });
    expect((await request(app).get("/api/nicknames/a")).body.disponivel).toBe(false);
  });

  it("entra pelo nickname usando o email da conta (sem expor o email)", async () => {
    prismaFalso.perfil.findUnique.mockResolvedValue({ email: "paulomsmsms@gmail.com" });
    const fetchFalso = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ access_token: "a", refresh_token: "r", user: { email: "x" } }), { status: 200 }),
    );
    const res = await request(app).post("/api/entrar").send({ login: "@Paulo", senha: "s" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ access_token: "a", refresh_token: "r" });
    expect(JSON.parse(fetchFalso.mock.calls[0]![1]!.body as string)).toEqual({ email: "paulomsmsms@gmail.com", password: "s" });
    fetchFalso.mockRestore();
  });

  it("senha errada = 401 com mensagem genérica", async () => {
    prismaFalso.perfil.findUnique.mockResolvedValue(null);
    const fetchFalso = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 400 }));
    const res = await request(app).post("/api/entrar").send({ login: "ninguem", senha: "x" });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Nickname ou senha incorretos.");
    expect(JSON.parse(fetchFalso.mock.calls[0]![1]!.body as string).email).toBe("ninguem@one-take.local");
    fetchFalso.mockRestore();
  });
});

describe("autenticação e papel", () => {
  it("401 sem token", async () => {
    const res = await request(app).get("/api/classes");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("NAO_AUTENTICADO");
  });

  it("401 com token de outra audiência", async () => {
    const t = await token(MESTRE, { aud: "outra" });
    const res = await request(app).get("/api/me").set("Authorization", `Bearer ${t}`);
    expect(res.status).toBe(401);
  });

  it("/me funciona para jogador", async () => {
    logarComo(JOGADOR);
    prismaFalso.perfil.findUniqueOrThrow.mockResolvedValue({ ...JOGADOR, nome: null, fotoUrl: null });
    const res = await request(app).get("/api/me").set("Authorization", `Bearer ${tokenJogador}`);
    expect(res.status).toBe(200);
    expect(res.body.papel).toBe("JOGADOR");
  });

  it("usuário edita o próprio nome e foto (link)", async () => {
    logarComo(JOGADOR);
    prismaFalso.perfil.update.mockImplementation(async ({ data }) => ({ ...JOGADOR, ...data }));
    const ruim = await request(app).patch("/api/me").set("Authorization", `Bearer ${tokenJogador}`).send({ fotoUrl: "foto" });
    expect(ruim.status).toBe(400);

    prismaFalso.perfil.findFirst.mockResolvedValue(null);
    const ok = await request(app)
      .patch("/api/me")
      .set("Authorization", `Bearer ${tokenJogador}`)
      .send({ nome: "  Ana ", fotoUrl: "https://x.com/a.png", nickname: "@Ana_01" });
    expect(ok.status).toBe(200);
    expect(prismaFalso.perfil.update.mock.calls[0]![0]).toMatchObject({
      where: { id: JOGADOR.id },
      data: { nome: "Ana", fotoUrl: "https://x.com/a.png", nickname: "ana_01" },
    });
  });

  it("nickname em uso por outro = 409; formato inválido = 400", async () => {
    logarComo(JOGADOR);
    prismaFalso.perfil.findFirst.mockResolvedValue({ id: OUTRO_MESTRE_ID });
    const emUso = await request(app).patch("/api/me").set("Authorization", `Bearer ${tokenJogador}`).send({ nickname: "paulo" });
    expect(emUso.status).toBe(409);
    expect(emUso.body.error.code).toBe("NICKNAME_EM_USO");
    const invalido = await request(app).patch("/api/me").set("Authorization", `Bearer ${tokenJogador}`).send({ nickname: "eu" });
    expect(invalido.status).toBe(400);
  });

  it("primeiro acesso cria perfil como JOGADOR", async () => {
    prismaFalso.perfil.findUnique.mockResolvedValue(null);
    prismaFalso.perfil.create.mockImplementation(async ({ data }) => ({ papel: "JOGADOR", catalogoIniciado: false, ...data }));
    prismaFalso.perfil.findUniqueOrThrow.mockResolvedValue(MESTRE);
    const res = await request(app).get("/api/me").set("Authorization", `Bearer ${tokenMestre}`);
    expect(res.status).toBe(200);
    expect(prismaFalso.perfil.create).toHaveBeenCalledWith({ data: { id: MESTRE.id, email: MESTRE.email, papel: "JOGADOR", nome: null, nickname: "mestre" } });
  });

  it("cadastro como mestre: papel e nome vêm do user_metadata do Supabase", async () => {
    prismaFalso.perfil.findUnique.mockResolvedValue(null);
    prismaFalso.perfil.create.mockImplementation(async ({ data }) => ({ catalogoIniciado: false, ...data }));
    prismaFalso.perfil.findUniqueOrThrow.mockResolvedValue(MESTRE);
    const t = await token(MESTRE, { metadata: { papel: "MESTRE", nome: "Paulo", nickname: "@Paulo" } });
    await request(app).get("/api/me").set("Authorization", `Bearer ${t}`);
    expect(prismaFalso.perfil.create).toHaveBeenCalledWith({ data: { id: MESTRE.id, email: MESTRE.email, papel: "MESTRE", nome: "Paulo", nickname: "paulo" } });
  });

  it("papel desconhecido no cadastro vira JOGADOR", async () => {
    prismaFalso.perfil.findUnique.mockResolvedValue(null);
    prismaFalso.perfil.create.mockImplementation(async ({ data }) => ({ catalogoIniciado: false, ...data }));
    prismaFalso.perfil.findUniqueOrThrow.mockResolvedValue(JOGADOR);
    const t = await token(MESTRE, { metadata: { papel: "ADMIN" } });
    await request(app).get("/api/me").set("Authorization", `Bearer ${t}`);
    expect(prismaFalso.perfil.create.mock.calls[0]![0].data.papel).toBe("JOGADOR");
  });

  it("usuário recriado no Auth (id novo, mesmo email) herda o perfil antigo", async () => {
    const antigo = { ...MESTRE, id: OUTRO_MESTRE_ID };
    prismaFalso.perfil.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(antigo);
    prismaFalso.$queryRaw.mockResolvedValue([]); // conta antiga não existe mais em auth.users
    prismaFalso.perfil.update.mockResolvedValue(MESTRE);
    prismaFalso.perfil.findUniqueOrThrow.mockResolvedValue(MESTRE);
    const res = await request(app).get("/api/me").set("Authorization", `Bearer ${tokenMestre}`);
    expect(res.status).toBe(200);
    expect(res.body.papel).toBe("MESTRE");
    expect(prismaFalso.perfil.update).toHaveBeenCalledWith({ where: { id: OUTRO_MESTRE_ID }, data: { id: MESTRE.id } });
  });

  it("não herda perfil de email se a outra conta ainda existe (409)", async () => {
    prismaFalso.perfil.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ ...MESTRE, id: OUTRO_MESTRE_ID });
    prismaFalso.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    const res = await request(app).get("/api/me").set("Authorization", `Bearer ${tokenMestre}`);
    expect(res.status).toBe(409);
    expect(prismaFalso.perfil.update).not.toHaveBeenCalled();
  });

  it("jogador recebe 403 nas rotas de gestão", async () => {
    logarComo(JOGADOR);
    const res = await request(app).get("/api/classes").set("Authorization", `Bearer ${tokenJogador}`);
    expect(res.status).toBe(403);
    expect(prismaFalso.classe.findMany).not.toHaveBeenCalled();
  });
});

describe("classes", () => {
  it("lista fixas primeiro, marcando fixa", async () => {
    prismaFalso.classe.findMany.mockResolvedValue([
      classeFake({ titulo: "A minha" }),
      classeFake({ id: "x", donoId: null }),
    ]);
    const res = await comoMestre(request(app).get("/api/classes?grupo=SUPORTE"));
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ id: "x", fixa: true });
    expect(res.body[1].fixa).toBe(false);
    expect(prismaFalso.classe.findMany.mock.calls[0]![0].where.grupo).toBe("SUPORTE");
  });

  it("valida o corpo e devolve erros legíveis por campo", async () => {
    const res = await comoMestre(request(app).post("/api/classes")).send({ grupo: "MAGO", titulo: "", pontosVida: -1 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDACAO");
    const campos = res.body.error.details.map((d: { campo: string }) => d.campo);
    expect(campos).toEqual(expect.arrayContaining(["grupo", "titulo", "descricao", "pontosVida", "pontosMana", "pontosEsforco"]));
  });

  it("cria só a classe (sem habilidades), com dono = mestre", async () => {
    prismaFalso.classe.create.mockImplementation(async ({ data }) => classeFake(data));
    const corpo = { grupo: "SUPORTE", titulo: "Nova", descricao: "D", pontosVida: 10, pontosMana: 20, pontosEsforco: 5 };
    const res = await comoMestre(request(app).post("/api/classes")).send(corpo);
    expect(res.status).toBe(201);
    const data = prismaFalso.classe.create.mock.calls[0]![0].data;
    expect(data.donoId).toBe(MESTRE.id);
    expect(data).not.toHaveProperty("habilidades");
  });

  it("imagem é um link http(s); vazio vira null", async () => {
    prismaFalso.classe.create.mockImplementation(async ({ data }) => classeFake(data));
    const corpo = { grupo: "SUPORTE", titulo: "Nova", descricao: "D", pontosVida: 1, pontosMana: 1, pontosEsforco: 1 };

    const invalido = await comoMestre(request(app).post("/api/classes")).send({ ...corpo, imagemUrl: "javascript:alert(1)" });
    expect(invalido.status).toBe(400);
    expect(invalido.body.error.details[0].campo).toBe("imagemUrl");

    const ok = await comoMestre(request(app).post("/api/classes")).send({ ...corpo, imagemUrl: "https://exemplo.com/heroi.png" });
    expect(ok.body.imagemUrl).toBe("https://exemplo.com/heroi.png");

    prismaFalso.classe.findUnique.mockResolvedValue(classeFake());
    prismaFalso.classe.update.mockImplementation(async ({ data }) => classeFake(data));
    const limpar = await comoMestre(request(app).patch(`/api/classes/${classeFake().id}`)).send({ imagemUrl: "" });
    expect(limpar.body.imagemUrl).toBeNull();
  });

  it("vida, mana e esforço base não podem ser zero (criar e editar)", async () => {
    const corpo = { grupo: "SUPORTE", titulo: "Nova", descricao: "D", pontosVida: 0, pontosMana: 0, pontosEsforco: 0 };
    const criar = await comoMestre(request(app).post("/api/classes")).send(corpo);
    expect(criar.status).toBe(400);
    expect(criar.body.error.details).toEqual([
      { campo: "pontosVida", mensagem: "Deve ser no mínimo 1" },
      { campo: "pontosMana", mensagem: "Deve ser no mínimo 1" },
      { campo: "pontosEsforco", mensagem: "Deve ser no mínimo 1" },
    ]);

    const editar = await comoMestre(request(app).patch(`/api/classes/${classeFake().id}`)).send({ pontosMana: 0 });
    expect(editar.status).toBe(400);
    expect(prismaFalso.classe.update).not.toHaveBeenCalled();
  });

  it("subclasse só entra em classe-conceito do próprio mestre", async () => {
    prismaFalso.classeConceito.findUnique.mockResolvedValue({ donoId: OUTRO_MESTRE_ID });
    const corpo = { grupo: "SUPORTE", titulo: "Bruxa elemental", descricao: "D", pontosVida: 10, pontosMana: 20, pontosEsforco: 5 };
    const res = await comoMestre(request(app).post("/api/classes")).send({ ...corpo, conceitoId: "77777777-7777-4777-8777-777777777777" });
    expect(res.status).toBe(404);
    expect(prismaFalso.classe.create).not.toHaveBeenCalled();
  });

  it("classe fixa é somente leitura (403 CLASSE_FIXA)", async () => {
    prismaFalso.classe.findUnique.mockResolvedValue(classeFake({ donoId: null }));
    const res = await comoMestre(request(app).patch(`/api/classes/${classeFake().id}`)).send({ titulo: "X" });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("CLASSE_FIXA");
  });

  it("prévia de progressão da classe (também para classe fixa)", async () => {
    const fixa = classeFake({ donoId: null, pontosVida: 40 });
    prismaFalso.classe.findUnique.mockResolvedValue(fixa);
    prismaFalso.classe.findUniqueOrThrow.mockResolvedValue({ ...fixa, habilidades: [{ id: "h", nivelNecessario: 2 }] });
    const res = await comoMestre(request(app).get(`/api/classes/${fixa.id}/progressao`));
    expect(res.status).toBe(200);
    expect(res.body.ganhoPorNivel).toEqual({ pontosVida: 5, pontosMana: 5, pontosEsforco: 5, pontosPericia: 5 });
    expect(res.body.niveis[1]).toMatchObject({ nivel: 2, pontosVida: 45, novasHabilidades: ["h"] });
  });

  it("classe de outro mestre = 404", async () => {
    prismaFalso.classe.findUnique.mockResolvedValue(classeFake({ donoId: OUTRO_MESTRE_ID }));
    const res = await comoMestre(request(app).get(`/api/classes/${classeFake().id}`));
    expect(res.status).toBe(404);
  });

  it("id malformado = 404", async () => {
    const res = await comoMestre(request(app).get("/api/classes/abc"));
    expect(res.status).toBe(404);
  });

  it("duplica classe fixa copiando habilidades e ligando as perícias ao catálogo do mestre", async () => {
    const fixa = classeFake({ donoId: null, imagemUrl: "https://x.com/a.png" });
    prismaFalso.classe.findUnique.mockResolvedValue(fixa);
    prismaFalso.classe.findUniqueOrThrow.mockResolvedValueOnce({
      ...fixa,
      habilidades: [{ id: "h1", classeId: fixa.id, titulo: "Carta", descricao: "d", condicao: null, tipoEfeito: "Dano", descricaoEfeito: "e", limite: null, nivelNecessario: 3, ordem: 0, aprimoramentos: [{ id: "a1", habilidadeId: "h1", criadoEm: new Date(), nivel: 5, titulo: null, descricaoEfeito: "mais forte", condicao: null, limite: null, custoMana: 2, statusId: null }] }],
      pericias: [
        { modificador: 2, pericia: { id: "base-luta", nome: "Luta", donoId: null, origemId: null } },
        { modificador: 1, pericia: { id: "base-vontade", nome: "Vontade", donoId: null, origemId: null } },
      ],
    });
    // Luta já está no catálogo do mestre; Vontade ele apagou, então é recriada.
    prismaFalso.pericia.findFirst.mockResolvedValueOnce({ id: "minha-luta" }).mockResolvedValueOnce(null);
    prismaFalso.pericia.create.mockResolvedValue({ id: "nova-vontade" });
    prismaFalso.classe.create.mockResolvedValue({});
    // detalhar() da cópia
    prismaFalso.classe.findUnique.mockResolvedValueOnce(fixa).mockResolvedValueOnce(classeFake());
    prismaFalso.classe.findUniqueOrThrow.mockResolvedValueOnce({ ...classeFake(), habilidades: [], pericias: [] });

    const res = await comoMestre(request(app).post(`/api/classes/${fixa.id}/duplicar`));
    expect(res.status).toBe(201);
    const data = prismaFalso.classe.create.mock.calls[0]![0].data;
    expect(data).toMatchObject({ donoId: MESTRE.id, origemId: fixa.id, titulo: "Teste (cópia)", imagemUrl: "https://x.com/a.png" });
    expect(data.habilidades.create[0]).toMatchObject({ titulo: "Carta", nivelNecessario: 3, ordem: 0 });
    expect(data.habilidades.create[0]).not.toHaveProperty("id");
    expect(data.habilidades.create[0]).not.toHaveProperty("classeId");
    expect(data.habilidades.create[0].aprimoramentos.create).toEqual([
      { nivel: 5, titulo: null, descricaoEfeito: "mais forte", condicao: null, limite: null, custoMana: 2, statusId: null },
    ]);
    expect(data.pericias.create).toEqual([
      { periciaId: "minha-luta", modificador: 2 },
      { periciaId: "nova-vontade", modificador: 1 },
    ]);
    expect(prismaFalso.pericia.create.mock.calls[0]![0].data).toMatchObject({ nome: "Vontade", donoId: MESTRE.id, origemId: "base-vontade" });
  });
});

describe("habilidades", () => {
  const classeId = classeFake().id;

  beforeEach(() => {
    prismaFalso.classe.findUnique.mockResolvedValue(classeFake());
  });

  it("só cria habilidade em classe existente (404)", async () => {
    prismaFalso.classe.findUnique.mockResolvedValue(null);
    const res = await comoMestre(request(app).post(`/api/classes/${classeId}/habilidades`)).send({
      titulo: "Golpe", descricao: "d", tipoEfeito: "Dano", descricaoEfeito: "e",
    });
    expect(res.status).toBe(404);
    expect(prismaFalso.habilidade.create).not.toHaveBeenCalled();
  });

  it("não cria habilidade em classe fixa (403)", async () => {
    prismaFalso.classe.findUnique.mockResolvedValue(classeFake({ donoId: null }));
    const res = await comoMestre(request(app).post(`/api/classes/${classeId}/habilidades`)).send({
      titulo: "Golpe", descricao: "d", tipoEfeito: "Dano", descricaoEfeito: "e",
    });
    expect(res.status).toBe(403);
  });

  it("cria habilidade no fim da cartela com nível padrão 1", async () => {
    prismaFalso.habilidade.aggregate.mockResolvedValue({ _max: { ordem: 2 } });
    prismaFalso.habilidade.create.mockImplementation(async ({ data }) => data);
    const res = await comoMestre(request(app).post(`/api/classes/${classeId}/habilidades`)).send({
      titulo: "Golpe", descricao: "d", tipoEfeito: "  Cura em área ", descricaoEfeito: "e", condicao: "",
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ classeId, ordem: 3, nivelNecessario: 1, custoMana: 0, condicao: null, tipoEfeito: "Cura em área" });
  });

  it("custo de mana é opcional, inteiro e não negativo", async () => {
    prismaFalso.habilidade.aggregate.mockResolvedValue({ _max: { ordem: null } });
    prismaFalso.habilidade.create.mockImplementation(async ({ data }) => data);
    const corpo = { titulo: "Bola de Fogo", descricao: "d", tipoEfeito: "Dano", descricaoEfeito: "e" };

    const ok = await comoMestre(request(app).post(`/api/classes/${classeId}/habilidades`)).send({ ...corpo, custoMana: 4 });
    expect(ok.status).toBe(201);
    expect(ok.body.custoMana).toBe(4);

    const negativo = await comoMestre(request(app).post(`/api/classes/${classeId}/habilidades`)).send({ ...corpo, custoMana: -1 });
    expect(negativo.status).toBe(400);
    expect(negativo.body.error.details).toEqual([{ campo: "custoMana", mensagem: "Deve ser no mínimo 0" }]);
  });

  it("tipo de efeito é texto livre obrigatório", async () => {
    const res = await comoMestre(request(app).post(`/api/classes/${classeId}/habilidades`)).send({
      titulo: "Golpe", descricao: "d", tipoEfeito: "", descricaoEfeito: "e",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([{ campo: "tipoEfeito", mensagem: "Obrigatório" }]);
  });

  it("aprimoramento precisa de nível maior que o da carta e de pelo menos uma mudança", async () => {
    const id = "66666666-6666-4666-8666-666666666666";
    prismaFalso.habilidade.findUnique.mockResolvedValue({ id, classeId, nivelNecessario: 3 });
    const semMudanca = await comoMestre(request(app).post(`/api/habilidades/${id}/aprimoramentos`)).send({ nivel: 5 });
    expect(semMudanca.status).toBe(400);

    const nivelBaixo = await comoMestre(request(app).post(`/api/habilidades/${id}/aprimoramentos`)).send({ nivel: 3, custoMana: 1 });
    expect(nivelBaixo.status).toBe(400);
    expect(nivelBaixo.body.error.details[0].campo).toBe("nivel");

    prismaFalso.habilidadeAprimoramento.findFirst.mockResolvedValue(null);
    prismaFalso.habilidadeAprimoramento.create.mockImplementation(async ({ data }) => ({ id: "a", ...data, status: null }));
    const ok = await comoMestre(request(app).post(`/api/habilidades/${id}/aprimoramentos`)).send({ nivel: 5, descricaoEfeito: "Dano pesado" });
    expect(ok.status).toBe(201);
    expect(ok.body).toMatchObject({ habilidadeId: id, nivel: 5, descricaoEfeito: "Dano pesado", custoMana: null, titulo: null });
  });

  it("PATCH parcial não reseta nível necessário", async () => {
    prismaFalso.habilidade.findUnique.mockResolvedValue({ id: "h", classeId });
    prismaFalso.habilidade.update.mockResolvedValue({});
    const id = "66666666-6666-4666-8666-666666666666";
    await comoMestre(request(app).patch(`/api/habilidades/${id}`)).send({ titulo: "Novo" });
    expect(prismaFalso.habilidade.update.mock.calls[0]![0].data).toEqual({ titulo: "Novo" }); // nem nível nem custo resetam
  });

  it("reordena exigindo exatamente as habilidades da classe", async () => {
    const a = "77777777-7777-4777-8777-777777777777";
    const b = "88888888-8888-4888-8888-888888888888";
    prismaFalso.habilidade.findMany.mockResolvedValue([{ id: a }, { id: b }]);
    prismaFalso.habilidade.update.mockResolvedValue({});

    const incompleta = await comoMestre(request(app).put(`/api/classes/${classeId}/habilidades/ordem`)).send({ ids: [a] });
    expect(incompleta.status).toBe(400);

    const ok = await comoMestre(request(app).put(`/api/classes/${classeId}/habilidades/ordem`)).send({ ids: [b, a] });
    expect(ok.status).toBe(200);
    expect(prismaFalso.habilidade.update.mock.calls.map((c) => c[0])).toEqual([
      { where: { id: b }, data: { ordem: 0 } },
      { where: { id: a }, data: { ordem: 1 } },
    ]);
  });
});

describe("perícias", () => {
  const FISICA = { id: "00000000-0000-4000-8002-000000000001", nome: "Capacidade física", descricao: "", ordem: 1, donoId: null };
  const CARISMA = { id: "00000000-0000-4000-8002-000000000002", nome: "Carisma", descricao: "", ordem: 2, donoId: null };
  const P = (x: Record<string, unknown> = {}) => ({
    id: "99999999-9999-4999-8999-999999999999", nome: "Luta", descricao: "d",
    categoria: "CORPO_A_CORPO", atributoId: FISICA.id, atributo: FISICA, donoId: MESTRE.id, origemId: null, ...x,
  });

  it("primeiro acesso do mestre copia as perícias base para o catálogo dele", async () => {
    logarComo({ ...MESTRE, catalogoIniciado: false });
    const { atributo: _a, ...semAtributo } = P({ id: "base-1", donoId: null });
    prismaFalso.pericia.findMany.mockResolvedValueOnce([semAtributo]).mockResolvedValueOnce([]);
    prismaFalso.pericia.createMany.mockResolvedValue({ count: 1 });
    prismaFalso.perfil.update.mockResolvedValue({});
    const res = await comoMestre(request(app).get("/api/pericias"));
    expect(res.status).toBe(200);
    expect(prismaFalso.pericia.createMany.mock.calls[0]![0].data).toEqual([
      { nome: "Luta", descricao: "d", categoria: "CORPO_A_CORPO", atributoId: FISICA.id, donoId: MESTRE.id, origemId: "base-1" },
    ]);
    expect(prismaFalso.perfil.update).toHaveBeenCalledWith({ where: { id: MESTRE.id }, data: { catalogoIniciado: true } });
  });

  it("catálogo já iniciado não é copiado de novo", async () => {
    prismaFalso.pericia.findMany.mockResolvedValue([]);
    await comoMestre(request(app).get("/api/pericias"));
    expect(prismaFalso.pericia.createMany).not.toHaveBeenCalled();
  });

  it("lista só o catálogo do mestre, com número de usos", async () => {
    prismaFalso.pericia.findMany.mockResolvedValue([{ ...P(), _count: { classes: 2, racas: 1 } }]);
    const res = await comoMestre(request(app).get("/api/pericias"));
    expect(prismaFalso.pericia.findMany.mock.calls[0]![0].where).toEqual({ donoId: MESTRE.id });
    expect(res.body[0]).toMatchObject({ nome: "Luta", usosClasses: 2, usosRacas: 1 });
    expect(res.body[0]).not.toHaveProperty("_count");
  });

  it("cria perícia validando categoria e atributo", async () => {
    const invalida = await comoMestre(request(app).post("/api/pericias")).send({ nome: "X", categoria: "VOO", atributoId: "CF" });
    expect(invalida.status).toBe(400);
    expect(invalida.body.error.details.map((d: { campo: string }) => d.campo)).toEqual(["categoria", "atributoId"]);

    prismaFalso.pericia.findUnique.mockResolvedValue(null);
    prismaFalso.atributo.findUnique.mockResolvedValue(CARISMA);
    prismaFalso.pericia.create.mockImplementation(async ({ data }) => ({ id: "n", ...data, atributo: CARISMA, _count: { classes: 0, racas: 0 } }));
    const ok = await comoMestre(request(app).post("/api/pericias")).send({ nome: "Navegação", categoria: "CONHECIMENTO", atributoId: CARISMA.id });
    expect(ok.status).toBe(201);
    expect(ok.body).toMatchObject({
      nome: "Navegação", descricao: "", donoId: MESTRE.id, usosClasses: 0, usosRacas: 0,
      atributo: { id: CARISMA.id, nome: "Carisma", fixo: true },
    });
  });

  it("nome repetido no catálogo do mestre = 409", async () => {
    prismaFalso.pericia.findUnique.mockResolvedValue(P({ id: "outra" }));
    const res = await comoMestre(request(app).post("/api/pericias")).send({ nome: "Luta", categoria: "CORPO_A_CORPO", atributoId: FISICA.id });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("NOME_EM_USO");
  });

  it("perícia base ou de outro mestre não é editável (404)", async () => {
    prismaFalso.pericia.findUnique.mockResolvedValue(P({ donoId: null }));
    const res = await comoMestre(request(app).patch(`/api/pericias/${P().id}`)).send({ descricao: "x" });
    expect(res.status).toBe(404);
    expect(prismaFalso.pericia.update).not.toHaveBeenCalled();
  });

  it("adiciona perícia do catálogo à classe com modificador", async () => {
    prismaFalso.classe.findUnique.mockResolvedValue(classeFake());
    prismaFalso.pericia.findUnique.mockResolvedValue(P());
    prismaFalso.classePericia.upsert.mockImplementation(async ({ create }) => create);
    const res = await comoMestre(request(app).put(`/api/classes/${classeFake().id}/pericias/${P().id}`)).send({ modificador: 3 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ classeId: classeFake().id, periciaId: P().id, modificador: 3 });
  });

  it("não usa perícia fora do catálogo do mestre (404) nem altera classe fixa (403)", async () => {
    prismaFalso.classe.findUnique.mockResolvedValue(classeFake());
    prismaFalso.pericia.findUnique.mockResolvedValue(P({ donoId: OUTRO_MESTRE_ID }));
    const alheia = await comoMestre(request(app).put(`/api/classes/${classeFake().id}/pericias/${P().id}`)).send({ modificador: 1 });
    expect(alheia.status).toBe(404);

    prismaFalso.classe.findUnique.mockResolvedValue(classeFake({ donoId: null }));
    const fixa = await comoMestre(request(app).put(`/api/classes/${classeFake().id}/pericias/${P().id}`)).send({ modificador: 1 });
    expect(fixa.status).toBe(403);
    expect(prismaFalso.classePericia.upsert).not.toHaveBeenCalled();
  });

  it("detalhe da classe traz perícias achatadas com modificador, por atributo e nome", async () => {
    prismaFalso.classe.findUnique.mockResolvedValue(classeFake());
    prismaFalso.classe.findUniqueOrThrow.mockResolvedValue({
      ...classeFake(),
      habilidades: [],
      pericias: [
        { modificador: 1, pericia: P({ id: "b", nome: "Vontade", atributo: CARISMA }) },
        { modificador: 2, pericia: P({ id: "a", nome: "Luta", atributo: FISICA }) },
      ],
    });
    const res = await comoMestre(request(app).get(`/api/classes/${classeFake().id}`));
    // Capacidade física (ordem 1) antes de Carisma (ordem 2)
    expect(res.body.pericias.map((p: { nome: string; modificador: number }) => [p.nome, p.modificador])).toEqual([
      ["Luta", 2],
      ["Vontade", 1],
    ]);
    expect(res.body.pericias[0].atributo).toEqual({ id: FISICA.id, nome: "Capacidade física", descricao: "", ordem: 1, fixo: true });
  });
});

describe("raças", () => {
  const RACA_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const PERICIA_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const raca = (x: Record<string, unknown> = {}) => ({
    id: RACA_ID, donoId: MESTRE.id, titulo: "Humano", descricao: "Versátil", deslocamento: 8, ...x,
  });

  it("cria raça com deslocamento em quadrados (mínimo 1)", async () => {
    const invalida = await comoMestre(request(app).post("/api/racas")).send({ titulo: "Humano", descricao: "d", deslocamento: 0 });
    expect(invalida.status).toBe(400);
    expect(invalida.body.error.details).toEqual([{ campo: "deslocamento", mensagem: "Deve ser no mínimo 1" }]);

    prismaFalso.raca.create.mockImplementation(async ({ data }) => ({ id: RACA_ID, ...data }));
    const ok = await comoMestre(request(app).post("/api/racas")).send({
      titulo: "Humano", descricao: "Versátil", deslocamento: 8, imagemUrl: "https://x.com/humano.png",
    });
    expect(ok.status).toBe(201);
    expect(ok.body).toMatchObject({ titulo: "Humano", deslocamento: 8, imagemUrl: "https://x.com/humano.png", donoId: MESTRE.id, pericias: [] });

    const linkRuim = await comoMestre(request(app).post("/api/racas")).send({ titulo: "Elfo", descricao: "d", deslocamento: 9, imagemUrl: "elfo.png" });
    expect(linkRuim.status).toBe(400);
    expect(linkRuim.body.error.details[0].campo).toBe("imagemUrl");
  });

  it("raça de outro mestre = 404", async () => {
    prismaFalso.raca.findUnique.mockResolvedValue(raca({ donoId: OUTRO_MESTRE_ID }));
    const res = await comoMestre(request(app).get(`/api/racas/${RACA_ID}`));
    expect(res.status).toBe(404);
  });

  it("dá pontos base numa perícia do catálogo do mestre", async () => {
    prismaFalso.raca.findUnique.mockResolvedValue(raca());
    prismaFalso.pericia.findUnique.mockResolvedValue({ id: PERICIA_ID, donoId: MESTRE.id });
    prismaFalso.racaPericia.upsert.mockImplementation(async ({ create }) => create);
    const res = await comoMestre(request(app).put(`/api/racas/${RACA_ID}/pericias/${PERICIA_ID}`)).send({ pontos: 2 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ racaId: RACA_ID, periciaId: PERICIA_ID, pontos: 2 });
  });

  it("não usa perícia fora do catálogo e exige pontos >= 1", async () => {
    prismaFalso.raca.findUnique.mockResolvedValue(raca());
    prismaFalso.pericia.findUnique.mockResolvedValue({ id: PERICIA_ID, donoId: null });
    const base = await comoMestre(request(app).put(`/api/racas/${RACA_ID}/pericias/${PERICIA_ID}`)).send({ pontos: 2 });
    expect(base.status).toBe(404);

    const zero = await comoMestre(request(app).put(`/api/racas/${RACA_ID}/pericias/${PERICIA_ID}`)).send({ pontos: 0 });
    expect(zero.status).toBe(400);
    expect(prismaFalso.racaPericia.upsert).not.toHaveBeenCalled();
  });

  it("jogador não acessa raças (403)", async () => {
    logarComo(JOGADOR);
    const res = await request(app).get("/api/racas").set("Authorization", `Bearer ${tokenJogador}`);
    expect(res.status).toBe(403);
  });
});

describe("atributos", () => {
  const ATR = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

  it("lista fixos e os do mestre, com fixo marcado", async () => {
    prismaFalso.atributo.findMany.mockResolvedValue([
      { id: "f", nome: "Carisma", descricao: "", ordem: 2, donoId: null, _count: { pericias: 4 } },
      { id: ATR, nome: "Sorte", descricao: "", ordem: 100, donoId: MESTRE.id, _count: { pericias: 0 } },
    ]);
    const res = await comoMestre(request(app).get("/api/atributos"));
    expect(prismaFalso.atributo.findMany.mock.calls[0]![0].where).toEqual({ OR: [{ donoId: null }, { donoId: MESTRE.id }] });
    expect(res.body.map((a: { nome: string; fixo: boolean }) => [a.nome, a.fixo])).toEqual([["Carisma", true], ["Sorte", false]]);
  });

  it("cria atributo do mestre; nome igual a um fixo = 409", async () => {
    prismaFalso.atributo.findFirst.mockResolvedValueOnce({ id: "f", nome: "Carisma" });
    const repetido = await comoMestre(request(app).post("/api/atributos")).send({ nome: "carisma" });
    expect(repetido.status).toBe(409);

    prismaFalso.atributo.findFirst.mockResolvedValue(null);
    prismaFalso.atributo.create.mockImplementation(async ({ data }) => ({ id: ATR, ordem: 100, ...data }));
    const ok = await comoMestre(request(app).post("/api/atributos")).send({ nome: "Sorte" });
    expect(ok.status).toBe(201);
    expect(ok.body).toMatchObject({ nome: "Sorte", fixo: false, pericias: 0 });
  });

  it("atributo fixo não é editável nem excluível (403)", async () => {
    prismaFalso.atributo.findUnique.mockResolvedValue({ id: ATR, nome: "Carisma", donoId: null });
    const editar = await comoMestre(request(app).patch(`/api/atributos/${ATR}`)).send({ nome: "X" });
    expect(editar.status).toBe(403);
    expect(editar.body.error.code).toBe("ATRIBUTO_FIXO");
    const excluir = await comoMestre(request(app).delete(`/api/atributos/${ATR}`));
    expect(excluir.status).toBe(403);
  });

  it("não exclui atributo com perícias (409)", async () => {
    prismaFalso.atributo.findUnique.mockResolvedValue({ id: ATR, nome: "Sorte", donoId: MESTRE.id });
    prismaFalso.pericia.count.mockResolvedValue(2);
    const res = await comoMestre(request(app).delete(`/api/atributos/${ATR}`));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("ATRIBUTO_EM_USO");
    expect(prismaFalso.atributo.delete).not.toHaveBeenCalled();
  });

  it("perícia não pode usar atributo de outro mestre (404)", async () => {
    prismaFalso.pericia.findUnique.mockResolvedValue(null);
    prismaFalso.atributo.findUnique.mockResolvedValue({ id: ATR, nome: "Sorte", donoId: OUTRO_MESTRE_ID });
    const res = await comoMestre(request(app).post("/api/pericias")).send({ nome: "Azar", categoria: "MAGIA", atributoId: ATR });
    expect(res.status).toBe(404);
    expect(prismaFalso.pericia.create).not.toHaveBeenCalled();
  });
});

describe("erros", () => {
  it("JSON malformado = 400 JSON_INVALIDO", async () => {
    const res = await comoMestre(request(app).post("/api/classes"))
      .set("Content-Type", "application/json")
      .send("{oops");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("JSON_INVALIDO");
  });
});
