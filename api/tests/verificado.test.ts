// Conteúdo verificado e cargo ADMIN.
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { classeFake, logarComo, MESTRE, OUTRO_MESTRE_ID, prepararJwks, prismaFalso, token } from "./helpers.js";

vi.mock("../src/lib/prisma.js", async () => {
  const { prismaFalso } = await import("./prisma-falso.js");
  return { getPrisma: () => prismaFalso };
});

const { criarApp } = await import("../src/app.js");
const { chaveDaPericia } = await import("../src/modules/pericias/soma.js");
const app = criarApp({ corsOrigin: ["http://localhost:5173"] });

const CLASSE_DO_PAULO = "44444444-4444-4444-8444-4444444444aa";
let tokenMestre: string;

beforeAll(async () => {
  await prepararJwks();
  tokenMestre = await token(MESTRE);
});

beforeEach(() => {
  vi.clearAllMocks();
  for (const m of Object.values(prismaFalso)) if (typeof m === "object") for (const f of Object.values(m)) (f as ReturnType<typeof vi.fn>).mockReset();
  prismaFalso.$transaction.mockImplementation(async (ops: unknown) => (Array.isArray(ops) ? Promise.all(ops) : ops));
  logarComo(MESTRE);
});

const comoMestre = (r: request.Test) => r.set("Authorization", `Bearer ${tokenMestre}`);
/** O cargo vem do banco: ehAdmin consulta `select: { cargo }`; o resto do perfil segue o MESTRE. */
const comCargo = (cargo: "ADMIN" | "USUARIO") =>
  prismaFalso.perfil.findUnique.mockImplementation(async ({ select }) => (select?.cargo && Object.keys(select).length === 1 ? { cargo } : MESTRE));

describe("verificado: todo mestre vê, só leitura", () => {
  it("a lista de classes inclui as verificadas de outra pessoa, marcadas e sem os kits dela", async () => {
    comCargo("USUARIO");
    prismaFalso.classe.findMany.mockResolvedValue([
      { ...classeFake({ id: CLASSE_DO_PAULO, donoId: OUTRO_MESTRE_ID, titulo: "Espadachim" }), verificado: true, kits: [{ kitId: "kit-pessoal" }] },
      { ...classeFake({ titulo: "Minha" }), verificado: false, kits: [] },
    ]);
    const res = await comoMestre(request(app).get("/api/classes"));
    expect(prismaFalso.classe.findMany.mock.calls[0]![0].where).toEqual({ OR: [{ donoId: MESTRE.id }, { verificado: true }, { kits: { some: { kit: { verificado: true } } } }] });
    expect(res.body.find((c: { titulo: string }) => c.titulo === "Espadachim")).toMatchObject({ verificado: true, deOutro: true, editavel: false, kitIds: [] });
    expect(res.body.find((c: { titulo: string }) => c.titulo === "Minha")).toMatchObject({ verificado: false, deOutro: false, editavel: true, podeVerificar: false });
  });

  it("classe verificada de outra pessoa: não dá para editar", async () => {
    comCargo("USUARIO");
    prismaFalso.classe.findUnique.mockResolvedValue({ ...classeFake({ id: CLASSE_DO_PAULO, donoId: OUTRO_MESTRE_ID }), verificado: true });
    expect((await comoMestre(request(app).patch(`/api/classes/${CLASSE_DO_PAULO}`)).send({ titulo: "Minha versão" })).status).toBe(403);
    expect(prismaFalso.classe.update).not.toHaveBeenCalled();
  });

  it("classe de outro mestre não verificada continua invisível (404)", async () => {
    comCargo("USUARIO");
    prismaFalso.classe.findUnique.mockResolvedValue({ ...classeFake({ id: CLASSE_DO_PAULO, donoId: OUTRO_MESTRE_ID }), verificado: false });
    expect((await comoMestre(request(app).get(`/api/classes/${CLASSE_DO_PAULO}`))).status).toBe(404);
  });

  it("quem oculta os verificados não recebe os de outras pessoas nas listas", async () => {
    prismaFalso.perfil.findUnique.mockImplementation(async ({ select }) => (select?.ocultarVerificados ? { ocultarVerificados: true } : select?.cargo ? { cargo: "USUARIO" } : MESTRE));
    prismaFalso.classe.findMany.mockResolvedValue([]);
    await comoMestre(request(app).get("/api/classes"));
    expect(prismaFalso.classe.findMany.mock.calls[0]![0].where).toEqual({ OR: [{ donoId: MESTRE.id }] });
  });

  it("perícia verificada aparece só se o mestre não tem uma igual (mesma origem ou nome)", async () => {
    comCargo("USUARIO");
    const p = (id: string, donoId: string, nome: string, origemId: string | null) => ({
      id, donoId, nome, origemId, verificado: donoId !== MESTRE.id, descricao: "", categoria: "FISICO", atributoId: "a",
      atributo: { id: "a", nome: "Capacidade física", descricao: "", ordem: 1, donoId: OUTRO_MESTRE_ID }, _count: { classes: 0, racas: 0 }, kits: [],
    });
    prismaFalso.pericia.findMany.mockResolvedValue([
      p("minha-luta", MESTRE.id, "Luta", "base-luta"),
      p("luta-do-paulo", OUTRO_MESTRE_ID, "Luta", "base-luta"),
      p("pontaria-do-paulo", OUTRO_MESTRE_ID, "Pontaria", null),
    ]);
    const res = await comoMestre(request(app).get("/api/pericias?verificados=1"));
    expect(res.body.map((x: { id: string }) => x.id).sort()).toEqual(["minha-luta", "pontaria-do-paulo"]);
    expect(res.body.find((x: { id: string }) => x.id === "pontaria-do-paulo")).toMatchObject({ deOutro: true, editavel: false });
  });

  it("kit verificado leva o conteúdo: classe de outra pessoa nele fica visível e marcada como verificada", async () => {
    comCargo("USUARIO");
    const KIT = "77777777-0000-4000-8000-0000000000b1";
    prismaFalso.kit.findMany.mockResolvedValue([{ id: KIT }]);
    prismaFalso.classe.findUnique.mockResolvedValue({ ...classeFake({ id: CLASSE_DO_PAULO, donoId: OUTRO_MESTRE_ID }), verificado: false });
    prismaFalso.kitClasse.count.mockResolvedValue(1);
    prismaFalso.classe.findUniqueOrThrow.mockResolvedValue({
      ...classeFake({ id: CLASSE_DO_PAULO, donoId: OUTRO_MESTRE_ID }), verificado: false, habilidades: [], pericias: [],
      kits: [{ kitId: KIT }, { kitId: "kit-pessoal" }],
    });
    const res = await comoMestre(request(app).get(`/api/classes/${CLASSE_DO_PAULO}`));
    expect(prismaFalso.kitClasse.count).toHaveBeenCalledWith({ where: { classeId: CLASSE_DO_PAULO, kit: { verificado: true } } });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ verificado: true, verificadoPorKit: true, seloProprio: false, kitIds: [KIT] });
  });

  it("perícia de outro catálogo com a mesma origem conta como a do mestre na soma", () => {
    const copiaDe = new Map([["base-luta", "minha-luta"]]);
    expect(chaveDaPericia({ id: "luta-do-paulo", donoId: OUTRO_MESTRE_ID, origemId: "base-luta" }, copiaDe)).toBe("minha-luta");
    expect(chaveDaPericia({ id: "base-luta", donoId: null }, copiaDe)).toBe("minha-luta");
    expect(chaveDaPericia({ id: "pericia-nova", donoId: OUTRO_MESTRE_ID, origemId: null }, copiaDe)).toBe("pericia-nova");
  });
});

describe("cargo ADMIN", () => {
  const STATUS = "88888888-0000-4000-8000-0000000000c1";

  it("não há conteúdo fixo: nem o ADMIN edita o status de outra pessoa; o dono edita o dele", async () => {
    prismaFalso.status.findUnique.mockResolvedValue({ id: STATUS, donoId: OUTRO_MESTRE_ID, verificado: true, gatilho: null, nome: "Assustado" });
    prismaFalso.status.findFirst.mockResolvedValue(null);
    prismaFalso.status.update.mockResolvedValue({ id: STATUS, donoId: MESTRE.id, gatilho: null, nome: "Assustado", kits: [] });

    comCargo("ADMIN");
    expect((await comoMestre(request(app).patch(`/api/status/${STATUS}`)).send({ efeito: "novo" })).status).toBe(403);

    comCargo("USUARIO");
    prismaFalso.status.findUnique.mockResolvedValue({ id: STATUS, donoId: MESTRE.id, verificado: false, gatilho: null, nome: "Assustado" });
    expect((await comoMestre(request(app).patch(`/api/status/${STATUS}`)).send({ efeito: "novo" })).status).toBe(200);
  });

  it("só o ADMIN marca como verificado, e só coisas dele", async () => {
    const url = `/api/verificados/classe/${CLASSE_DO_PAULO}`;
    comCargo("USUARIO");
    expect((await comoMestre(request(app).put(url)).send({ verificado: true })).status).toBe(403);

    comCargo("ADMIN");
    prismaFalso.classe.findUnique.mockResolvedValue({ donoId: OUTRO_MESTRE_ID });
    expect((await comoMestre(request(app).put(url)).send({ verificado: true })).status).toBe(404);

    prismaFalso.classe.findUnique.mockResolvedValue({ donoId: MESTRE.id });
    prismaFalso.classe.update.mockResolvedValue({});
    const ok = await comoMestre(request(app).put(url)).send({ verificado: true });
    expect(ok.status).toBe(200);
    expect(prismaFalso.classe.update).toHaveBeenCalledWith({ where: { id: CLASSE_DO_PAULO }, data: { verificado: true } });

    expect((await comoMestre(request(app).put("/api/verificados/ficha/" + CLASSE_DO_PAULO)).send({ verificado: true })).status).toBe(400);
  });
});
