// Conta: cadastro, código de recuperação, exclusão, fichas arquivadas e exportação. Sem e-mail.
// O Supabase Auth é simulado com um fetch falso; o banco é o Prisma mockado.
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { JOGADOR, logarComo, MESTRE, prepararJwks, prismaFalso, token } from "./helpers.js";

vi.mock("../src/lib/prisma.js", async () => {
  const { prismaFalso } = await import("./prisma-falso.js");
  return { getPrisma: () => prismaFalso };
});
// O retrato da ficha usa o cálculo completo da ficha; aqui só interessa o que é feito com ele.
vi.mock("../src/modules/fichas/retrato.js", () => {
  const retrato = (f: { id: string; jogadorId: string }, motivo: string) => ({ jogadorId: f.jogadorId, nome: `Ficha ${f.id}`, nivel: 1, classe: "C", raca: "R", grupo: "G", motivo, conteudo: {} });
  return {
    fotoDaFicha: vi.fn(async (id: string) => ({ nome: `Ficha ${id}`, nivel: 1, classe: "C", raca: "R", grupo: "G", conteudo: {} })),
    retratoDaFicha: vi.fn(async (id: string, jogadorId: string, motivo: string) => retrato({ id, jogadorId }, motivo)),
    retratos: vi.fn(async (fichas: { id: string; jogadorId: string }[], motivo: string) => fichas.map((f) => retrato(f, motivo))),
  };
});

const { criarApp } = await import("../src/app.js");
const { zerarLimites } = await import("../src/lib/limite.js");
const { hashDoCodigo, normalizarCodigo, novoCodigo, codigoConfere } = await import("../src/lib/codigo-recuperacao.js");
const conta = await import("../src/modules/conta/conta.service.js");
const app = criarApp({ corsOrigin: ["http://localhost:5173"] });

const NOVO_ID = "55555555-5555-4555-8555-555555555555";

type Chamada = { url: string; method: string; body: Record<string, unknown> | null };
let chamadas: Chamada[] = [];
let respostas: { adminDelete?: number; senhaCerta?: string } = {};

function fetchFalso(url: string | URL, init: RequestInit = {}) {
  const u = String(url);
  const method = init.method ?? "GET";
  const body = init.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : null;
  chamadas.push({ url: u, method, body });
  const json = (dados: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(dados), { status }));
  if (u.endsWith("/auth/v1/admin/users") && method === "POST") return json({ id: NOVO_ID });
  if (u.includes("/auth/v1/admin/users/") && method === "PUT") return json({ id: "ok" });
  if (u.includes("/auth/v1/admin/users/") && method === "DELETE") return json({}, respostas.adminDelete ?? 200);
  if (u.includes("/auth/v1/token")) {
    return body?.password === (respostas.senhaCerta ?? "senha-certa") ? json({ access_token: "acc", refresh_token: "ref" }) : json({ error: "invalid" }, 400);
  }
  return json({}, 404);
}

let tokenMestre: string;
let tokenJogador: string;
const ambienteOriginal = { ...process.env };

beforeAll(async () => {
  await prepararJwks();
  tokenMestre = await token(MESTRE);
  tokenJogador = await token(JOGADOR);
  Object.assign(process.env, {
    SUPABASE_URL: "https://teste.supabase.co", SUPABASE_PUBLISHABLE_KEY: "sb_publishable_teste", SUPABASE_SECRET_KEY: "sb_secret_teste",
  });
  vi.stubGlobal("fetch", vi.fn(fetchFalso));
});
afterAll(() => {
  process.env = ambienteOriginal;
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.clearAllMocks();
  for (const m of Object.values(prismaFalso)) if (typeof m === "object") for (const f of Object.values(m)) (f as ReturnType<typeof vi.fn>).mockReset();
  prismaFalso.$transaction.mockImplementation(async (ops: unknown) => (Array.isArray(ops) ? Promise.all(ops) : ops));
  chamadas = [];
  respostas = {};
  zerarLimites();
  logarComo(MESTRE);
});

const comoMestre = (r: request.Test) => r.set("Authorization", `Bearer ${tokenMestre}`);
const CODIGO = "7KQ2M-9XH4T-AB3CD-EF5GH";
const perfilDoMestre = (extra: Record<string, unknown> = {}) => ({
  ...MESTRE, nickname: "mestre", email: "mestre@one-take.local", codigoRecuperacaoHash: hashDoCodigo(CODIGO), codigoRecuperacaoEm: new Date(),
  exclusaoIniciadaEm: null, sessoesValidasDesde: null, ...extra,
});

// ---------- Código de recuperação (regra pura) ----------

describe("código de recuperação", () => {
  it("tem 20 caracteres em 4 blocos, é aleatório e só o hash confere", () => {
    const a = novoCodigo();
    const b = novoCodigo();
    expect(a.codigo).toMatch(/^[0-9A-HJKMNP-TV-Z]{5}(-[0-9A-HJKMNP-TV-Z]{5}){3}$/);
    expect(a.codigo).not.toBe(b.codigo);
    expect(a.hash).not.toContain(a.codigo.replace(/-/g, ""));
    expect(codigoConfere(a.codigo, a.hash)).toBe(true);
    expect(codigoConfere(b.codigo, a.hash)).toBe(false);
    expect(codigoConfere(a.codigo, null)).toBe(false);
  });

  it("aceita o código digitado com minúsculas, espaços e letras que se confundem", () => {
    const { codigo, hash } = novoCodigo();
    const digitado = ` ${codigo.toLowerCase().replace(/-/g, " ").replace(/0/g, "o").replace(/1/g, "l")} `;
    expect(normalizarCodigo(digitado)).toBe(codigo.replace(/-/g, ""));
    expect(codigoConfere(digitado, hash)).toBe(true);
  });
});

// ---------- Cadastro ----------

describe("cadastro", () => {
  const corpo = { nickname: "@Ana", senha: "senha-certa", papel: "JOGADOR", dataNascimento: "2000-05-20" };

  it("cria a conta sem e-mail, já entra e mostra o código de recuperação uma vez (o banco guarda só o hash)", async () => {
    prismaFalso.perfil.findUnique.mockResolvedValue(null);
    prismaFalso.perfil.create.mockImplementation(async ({ data }) => data);
    const res = await request(app).post("/api/cadastro").send(corpo);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ access_token: "acc", refresh_token: "ref" });
    const codigo = res.body.codigoRecuperacao as string;
    const dados = prismaFalso.perfil.create.mock.calls[0]![0].data;
    expect(dados).toMatchObject({ id: NOVO_ID, nickname: "ana", email: "ana@one-take.local", dataNascimento: new Date("2000-05-20T00:00:00Z") });
    expect(dados.codigoRecuperacaoHash).toBe(hashDoCodigo(codigo));
    expect(JSON.stringify(dados)).not.toContain(codigo);
    expect(chamadas.find((c) => c.url.endsWith("/admin/users"))!.body).toMatchObject({ email: "ana@one-take.local", email_confirm: true });
  });

  it("pede a data de nascimento e exige 12 anos completos (conferido no servidor)", async () => {
    const semData = await request(app).post("/api/cadastro").send({ ...corpo, dataNascimento: undefined });
    expect(semData.status).toBe(400);
    expect(semData.body.error.details.some((d: { campo: string }) => d.campo === "dataNascimento")).toBe(true);
    const onzeAnos = `${new Date().getUTCFullYear() - 11}-01-01`;
    const crianca = await request(app).post("/api/cadastro").send({ ...corpo, dataNascimento: onzeAnos });
    expect(crianca.status).toBe(400);
    expect(JSON.stringify(crianca.body)).toContain("pelo menos 12 anos");
    expect(chamadas).toHaveLength(0);
  });

  it("recusa nome de usuário em uso sem criar nada no Auth", async () => {
    prismaFalso.perfil.findUnique.mockResolvedValue({ id: "outro" });
    const res = await request(app).post("/api/cadastro").send(corpo);
    expect(res.status).toBe(409);
    expect(chamadas).toHaveLength(0);
  });

  it("se o perfil não puder ser criado, desfaz o usuário do Auth", async () => {
    prismaFalso.perfil.findUnique.mockResolvedValue(null);
    prismaFalso.perfil.create.mockRejectedValue(Object.assign(new Error("único"), { code: "P2002" }));
    const res = await request(app).post("/api/cadastro").send(corpo);
    expect(res.status).toBe(409);
    expect(chamadas.some((c) => c.method === "DELETE" && c.url.endsWith(`/admin/users/${NOVO_ID}`))).toBe(true);
  });

  it("o perfil diz se a conta tem código, sem nunca devolver o hash", async () => {
    prismaFalso.perfil.findUniqueOrThrow.mockResolvedValue({ id: MESTRE.id, nickname: "mestre", dataNascimento: null, codigoRecuperacaoEm: null });
    const res = await comoMestre(request(app).get("/api/me"));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ codigoRecuperacaoEm: null, dataNascimento: null });
    expect(prismaFalso.perfil.findUniqueOrThrow.mock.calls[0]![0].select).not.toHaveProperty("codigoRecuperacaoHash");
  });
});

// ---------- Esqueceu a senha ----------

describe("esqueceu a senha (código de recuperação)", () => {
  it("com o código certo troca a senha, gera um código novo e encerra as sessões antigas", async () => {
    prismaFalso.perfil.findUnique.mockResolvedValue(perfilDoMestre());
    prismaFalso.perfil.updateMany.mockResolvedValue({ count: 1 });
    const res = await request(app).post("/api/senha/recuperar").send({ nickname: "@Mestre", codigo: CODIGO.toLowerCase(), senha: "nova-senha" });
    expect(res.status).toBe(200);
    expect(res.body.codigoRecuperacao).toMatch(/^\w{5}-/);
    expect(res.body.codigoRecuperacao).not.toBe(CODIGO);
    expect(chamadas.find((c) => c.method === "PUT")!.body).toEqual({ password: "nova-senha" });
    const { where, data } = prismaFalso.perfil.updateMany.mock.calls[0]![0];
    expect(where).toEqual({ id: MESTRE.id, codigoRecuperacaoHash: hashDoCodigo(CODIGO) });
    expect(data.codigoRecuperacaoHash).toBe(hashDoCodigo(res.body.codigoRecuperacao));
    expect(data.sessoesValidasDesde).toBeInstanceOf(Date);
  });

  it("código errado, conta sem código ou nome de usuário inexistente: mesma resposta, nada muda", async () => {
    const respostasErro: unknown[] = [];
    for (const perfil of [perfilDoMestre(), perfilDoMestre({ codigoRecuperacaoHash: null }), null]) {
      prismaFalso.perfil.findUnique.mockResolvedValue(perfil);
      const res = await request(app).post("/api/senha/recuperar").send({ nickname: "mestre", codigo: "ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ", senha: "nova-senha" });
      expect(res.status).toBe(400);
      respostasErro.push(res.body);
    }
    expect(new Set(respostasErro.map((r) => JSON.stringify(r))).size).toBe(1);
    expect(chamadas.some((c) => c.method === "PUT")).toBe(false);
  });

  it("dois pedidos ao mesmo tempo com o mesmo código: só um vence", async () => {
    prismaFalso.perfil.findUnique.mockResolvedValue(perfilDoMestre());
    prismaFalso.perfil.updateMany.mockResolvedValue({ count: 0 });
    const res = await request(app).post("/api/senha/recuperar").send({ nickname: "mestre", codigo: CODIGO, senha: "nova-senha" });
    expect(res.status).toBe(400);
  });

  it("limita tentativas por origem (429) e recusa senha curta", async () => {
    prismaFalso.perfil.findUnique.mockResolvedValue(null);
    expect((await request(app).post("/api/senha/recuperar").send({ nickname: "x", codigo: CODIGO, senha: "123" })).status).toBe(400);
    const status: number[] = [];
    for (let i = 0; i < 10; i++) status.push((await request(app).post("/api/senha/recuperar").send({ nickname: "x", codigo: CODIGO, senha: "nova-senha" })).status);
    expect(status.at(-1)).toBe(429);
  });

  it("depois da troca, tokens de sessões anteriores deixam de valer; um login novo vale", async () => {
    const agora = Date.now();
    logarComo(perfilDoMestre({ sessoesValidasDesde: new Date(agora) }));
    prismaFalso.perfil.findUniqueOrThrow.mockResolvedValue(perfilDoMestre());
    const antigo = await token(MESTRE, { claims: { amr: [{ method: "password", timestamp: Math.floor(agora / 1000) - 3600 }] } });
    const novo = await token(MESTRE, { claims: { amr: [{ method: "password", timestamp: Math.floor(agora / 1000) + 1 }] } });
    expect((await request(app).get("/api/me").set("Authorization", `Bearer ${antigo}`)).status).toBe(401);
    expect((await request(app).get("/api/me").set("Authorization", `Bearer ${novo}`)).status).toBe(200);
  });

  it("gerar um código novo pede a senha e troca o anterior", async () => {
    prismaFalso.perfil.findUniqueOrThrow.mockResolvedValue(perfilDoMestre());
    prismaFalso.perfil.update.mockResolvedValue({});
    expect((await comoMestre(request(app).post("/api/me/codigo-recuperacao")).send({ senha: "errada" })).status).toBe(401);
    expect(prismaFalso.perfil.update).not.toHaveBeenCalled();
    const ok = await comoMestre(request(app).post("/api/me/codigo-recuperacao")).send({ senha: "senha-certa" });
    expect(ok.status).toBe(200);
    expect(prismaFalso.perfil.update.mock.calls[0]![0].data.codigoRecuperacaoHash).toBe(hashDoCodigo(ok.body.codigoRecuperacao));
  });
});

// ---------- Exclusão ----------

describe("excluir a conta", () => {
  function prepararExclusao() {
    prismaFalso.perfil.findUniqueOrThrow.mockResolvedValue(perfilDoMestre());
    prismaFalso.perfil.updateMany.mockResolvedValue({ count: 1 });
    prismaFalso.ficha.findMany.mockResolvedValue([{ id: "f-ana", jogadorId: JOGADOR.id }]);
    prismaFalso.fichaArquivada.createMany.mockResolvedValue({ count: 1 });
    prismaFalso.grupo.deleteMany.mockResolvedValue({ count: 1 });
    prismaFalso.ficha.deleteMany.mockResolvedValue({ count: 0 });
    prismaFalso.npc.deleteMany.mockResolvedValue({ count: 0 });
    prismaFalso.perfil.delete.mockResolvedValue({});
  }

  it("exige login, a senha certa e o próprio nome de usuário digitado", async () => {
    prepararExclusao();
    expect((await request(app).post("/api/me/exclusao").send({ senha: "senha-certa", confirmacao: "mestre" })).status).toBe(401);
    expect((await comoMestre(request(app).post("/api/me/exclusao")).send({ senha: "senha-certa", confirmacao: "outro" })).status).toBe(400);
    expect((await comoMestre(request(app).post("/api/me/exclusao")).send({ senha: "errada", confirmacao: "mestre" })).status).toBe(401);
    expect(prismaFalso.perfil.delete).not.toHaveBeenCalled();
  });

  it("apaga o Auth e depois os dados; jogadores dos grupos ficam com a ficha arquivada", async () => {
    prepararExclusao();
    const ordem: string[] = [];
    prismaFalso.perfil.delete.mockImplementation(async () => (ordem.push("perfil"), {}));
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: string, init: RequestInit) => {
      if (init?.method === "DELETE") ordem.push("auth");
      return fetchFalso(url, init);
    });
    const res = await comoMestre(request(app).post("/api/me/exclusao")).send({ senha: "senha-certa", confirmacao: "@Mestre" });
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(fetchFalso);
    expect(res.status).toBe(200);
    expect(ordem).toEqual(["auth", "perfil"]);
    expect(prismaFalso.fichaArquivada.createMany.mock.calls[0]![0].data).toEqual([expect.objectContaining({ jogadorId: JOGADOR.id, motivo: "GRUPO_EXCLUIDO" })]);
    expect(prismaFalso.grupo.deleteMany).toHaveBeenCalledWith({ where: { mestreId: MESTRE.id } });
    expect(prismaFalso.ficha.deleteMany).toHaveBeenCalledWith({ where: { jogadorId: MESTRE.id } });
    expect(prismaFalso.npc.deleteMany).toHaveBeenCalledWith({ where: { donoId: MESTRE.id } });
  });

  it("falha no meio: nada do banco é apagado, a conta fica bloqueada e a retomada termina", async () => {
    prepararExclusao();
    respostas.adminDelete = 500;
    const falhou = await comoMestre(request(app).post("/api/me/exclusao")).send({ senha: "senha-certa", confirmacao: "mestre" });
    expect(falhou.status).toBe(502);
    expect(prismaFalso.perfil.delete).not.toHaveBeenCalled();

    // Logo em seguida, outra execução não começa por cima (marca recente).
    prismaFalso.perfil.updateMany.mockResolvedValue({ count: 0 });
    prismaFalso.perfil.findUnique.mockResolvedValue({ id: MESTRE.id });
    await expect(conta.excluirConta(MESTRE.id)).rejects.toMatchObject({ code: "EXCLUSAO_EM_ANDAMENTO" });

    // Passados 5 minutos, a rotina de retomada conclui.
    respostas.adminDelete = 404; // o usuário já pode ter sido apagado do Auth: conta como feito
    prismaFalso.perfil.updateMany.mockResolvedValue({ count: 1 });
    prismaFalso.perfil.findMany.mockResolvedValue([{ id: MESTRE.id }]);
    expect(await conta.concluirExclusoesPendentes()).toEqual({ concluidas: 1, falhas: 0 });
    expect(prismaFalso.perfil.delete).toHaveBeenCalledWith({ where: { id: MESTRE.id } });
  });

  it("é idempotente: conta que já foi apagada não dá erro", async () => {
    prismaFalso.perfil.updateMany.mockResolvedValue({ count: 0 });
    prismaFalso.perfil.findUnique.mockResolvedValue(null);
    respostas.adminDelete = 404;
    await expect(conta.excluirConta(MESTRE.id)).resolves.toBeUndefined();
    expect(prismaFalso.perfil.delete).not.toHaveBeenCalled();
  });

  it("conta em exclusão não usa a API, nem com uma sessão antiga", async () => {
    logarComo(perfilDoMestre({ exclusaoIniciadaEm: new Date() }));
    const res = await comoMestre(request(app).get("/api/classes"));
    expect(res.status).toBe(401);
    expect(prismaFalso.classe.findMany).not.toHaveBeenCalled();
  });

  it("token de usuário que não existe mais no Auth não recria o perfil", async () => {
    prismaFalso.perfil.findUnique.mockResolvedValue(null);
    prismaFalso.$queryRaw.mockResolvedValue([]);
    const res = await comoMestre(request(app).get("/api/me"));
    expect(res.status).toBe(401);
    expect(prismaFalso.perfil.create).not.toHaveBeenCalled();
  });
});

// ---------- Fichas arquivadas ----------

describe("fichas arquivadas", () => {
  const comoJogador = (r: request.Test) => r.set("Authorization", `Bearer ${tokenJogador}`);

  it("sair do grupo arquiva a ficha para o jogador antes de apagar", async () => {
    logarComo(JOGADOR);
    prismaFalso.ficha.findUnique.mockResolvedValue({ id: "f1", jogadorId: JOGADOR.id, grupoId: "g", grupo: { mestreId: MESTRE.id } });
    prismaFalso.fichaArquivada.create.mockResolvedValue({});
    prismaFalso.ficha.delete.mockResolvedValue({});
    const res = await comoJogador(request(app).delete("/api/fichas/66666666-6666-4666-8666-666666666666"));
    expect(res.status).toBe(204);
    expect(prismaFalso.fichaArquivada.create.mock.calls[0]![0].data).toMatchObject({ jogadorId: JOGADOR.id, motivo: "SAIU_DO_GRUPO" });
  });

  it("o mestre remover o membro arquiva com o motivo certo", async () => {
    prismaFalso.ficha.findUnique.mockResolvedValue({ id: "f1", jogadorId: JOGADOR.id, grupoId: "g", grupo: { mestreId: MESTRE.id } });
    prismaFalso.fichaArquivada.create.mockResolvedValue({});
    prismaFalso.ficha.delete.mockResolvedValue({});
    await comoMestre(request(app).delete("/api/fichas/66666666-6666-4666-8666-666666666666"));
    expect(prismaFalso.fichaArquivada.create.mock.calls[0]![0].data).toMatchObject({ jogadorId: JOGADOR.id, motivo: "REMOVIDO_PELO_MESTRE" });
  });

  it("só o dono vê e apaga a ficha arquivada", async () => {
    logarComo(JOGADOR);
    prismaFalso.fichaArquivada.findMany.mockResolvedValue([]);
    await comoJogador(request(app).get("/api/fichas-arquivadas"));
    expect(prismaFalso.fichaArquivada.findMany.mock.calls[0]![0].where).toEqual({ jogadorId: JOGADOR.id });

    prismaFalso.fichaArquivada.findUnique.mockResolvedValue({ id: "a1", jogadorId: MESTRE.id });
    const deOutro = await comoJogador(request(app).get("/api/fichas-arquivadas/77777777-7777-4777-8777-777777777777"));
    expect(deOutro.status).toBe(404);

    prismaFalso.fichaArquivada.findUnique.mockResolvedValue({ id: "a1", jogadorId: JOGADOR.id });
    prismaFalso.fichaArquivada.delete.mockResolvedValue({});
    expect((await comoJogador(request(app).delete("/api/fichas-arquivadas/77777777-7777-4777-8777-777777777777"))).status).toBe(204);
  });
});

// ---------- Exportação ----------

describe("baixar meus dados", () => {
  it("exige login e devolve só os dados da própria conta, sem o e-mail técnico nem hashes", async () => {
    expect((await request(app).get("/api/me/exportacao")).status).toBe(401);

    prismaFalso.perfil.findUniqueOrThrow.mockResolvedValue(perfilDoMestre({ nome: "Paulo", dataNascimento: new Date("1990-01-02T00:00:00Z"), criadoEm: new Date() }));
    for (const m of ["ficha", "fichaArquivada", "grupo", "classe", "classeConceito", "raca", "racaConceito", "atributo", "pericia", "status", "itemModelo", "categoriaItem", "besta", "bestaConceito", "npc", "kit"] as const) {
      prismaFalso[m].findMany.mockResolvedValue([]);
    }
    prismaFalso.grupo.findMany.mockResolvedValue([{ id: "g1", titulo: "Mesa", mestreId: MESTRE.id, _count: { fichas: 3 }, regrasProprias: [], criaturas: [] }]);
    const res = await comoMestre(request(app).get("/api/me/exportacao"));
    expect(res.status).toBe(200);
    expect(res.headers["content-disposition"]).toContain("one-take-meus-dados.json");
    expect(res.body.conta).toMatchObject({ nickname: "mestre", dataNascimento: "1990-01-02" });
    expect(JSON.stringify(res.body)).not.toContain("codigoRecuperacaoHash");
    expect(res.body.mestre.grupos[0]).toMatchObject({ titulo: "Mesa", membros: 3 });
    expect(JSON.stringify(res.body)).not.toContain("one-take.local");
    expect(prismaFalso.classe.findMany.mock.calls[0]![0].where).toEqual({ donoId: MESTRE.id });
    expect(prismaFalso.ficha.findMany.mock.calls[0]![0].where).toEqual({ jogadorId: MESTRE.id });
  });
});
