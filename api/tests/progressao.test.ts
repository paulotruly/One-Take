import { describe, expect, it } from "vitest";
import { aplicarAprimoramentos, atributosNoNivel, habilidadesNoNivel, pontosPericiaGanhos, previaProgressao } from "../src/regras/progressao.js";

const base = { pontosVida: 40, pontosMana: 5, pontosEsforco: 15 };
const cartas = [
  { id: "a", nivelNecessario: 1 },
  { id: "b", nivelNecessario: 2 },
  { id: "c", nivelNecessario: 7 },
];

describe("regras de progressão", () => {
  it("+5 vida, mana e esforço por nível acima do 1", () => {
    expect(atributosNoNivel(base, 1)).toEqual(base);
    expect(atributosNoNivel(base, 3)).toEqual({ pontosVida: 50, pontosMana: 15, pontosEsforco: 25 });
  });

  it("+5 pontos de perícia por nível, acumulados", () => {
    expect(pontosPericiaGanhos(1)).toBe(0);
    expect(pontosPericiaGanhos(2)).toBe(5);
    expect(pontosPericiaGanhos(4)).toBe(15);
  });

  it("nível N libera todas as cartas de nível ≤ N", () => {
    expect(habilidadesNoNivel(cartas, 1).map((c) => c.id)).toEqual(["a"]);
    expect(habilidadesNoNivel(cartas, 2).map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("prévia vai até o nível 5 ou até a carta de maior nível", () => {
    expect(previaProgressao({ ...base, habilidades: cartas.slice(0, 2) }).niveis).toHaveLength(5);
    const previa = previaProgressao({ ...base, habilidades: cartas });
    expect(previa.niveis.map((n) => n.nivel)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(previa.niveis[1]).toMatchObject({ nivel: 2, pontosVida: 45, pontosPericia: 5, habilidades: ["a", "b"], novasHabilidades: ["b"] });
    expect(previa.niveis[6]!.novasHabilidades).toEqual(["c"]);
  });
});

describe("aprimoramento de carta", () => {
  const original = { titulo: "Bola de fogo", descricao: "Uma esfera de fogo.", descricaoEfeito: "Dano leve", condicao: null, limiteUsos: 1, limitePor: "COMBATE", custoMana: 4, statusId: null };
  const ap = (nivel: number, x: Record<string, unknown>) => ({ nivel, ...original, ...x }) as never;
  const carta = {
    id: "c", nivelNecessario: 1, ...original,
    aprimoramentos: [ap(3, { descricaoEfeito: "Dano médio" }), ap(5, { descricaoEfeito: "Dano médio", custoMana: 2, titulo: "Bola de fogo maior", limiteUsos: null, limitePor: null })],
  };

  it("vale a carta original antes do primeiro aprimoramento", () => {
    expect(aplicarAprimoramentos(carta, 2)).toMatchObject({ descricaoEfeito: "Dano leve", custoMana: 4, aprimoradaNoNivel: null, proximoAprimoramento: 3 });
  });

  it("vale a versão completa do aprimoramento de maior nível (inclusive tirar o limite)", () => {
    expect(aplicarAprimoramentos(carta, 4)).toMatchObject({ descricaoEfeito: "Dano médio", custoMana: 4, limiteUsos: 1, aprimoradaNoNivel: 3, proximoAprimoramento: 5 });
    expect(aplicarAprimoramentos(carta, 5)).toMatchObject({
      titulo: "Bola de fogo maior", descricaoEfeito: "Dano médio", custoMana: 2, limiteUsos: null, limitePor: null, aprimoradaNoNivel: 5, proximoAprimoramento: null,
    });
  });

  it("prévia marca em que nível a carta é aprimorada", () => {
    const previa = previaProgressao({ pontosVida: 1, pontosMana: 1, pontosEsforco: 1, habilidades: [carta] });
    expect(previa.niveis.find((n) => n.nivel === 3)!.aprimoradas).toEqual(["c"]);
    expect(previa.niveis.find((n) => n.nivel === 4)!.aprimoradas).toEqual([]);
  });
});

describe("regras padrão de combate", () => {
  it("todas valem por padrão; as desligadas saem", async () => {
    const { REGRAS_PADRAO, regrasPadraoAtivas } = await import("../src/regras/combate.js");
    expect(regrasPadraoAtivas([])).toHaveLength(REGRAS_PADRAO.length);
    expect(regrasPadraoAtivas(["combate-alcance"]).map((r) => r.slug)).not.toContain("combate-alcance");
    // Slugs de regras que saíram (Domínio de combate, Égide) são ignorados.
    expect(regrasPadraoAtivas(["combate-dominio", "combate-egide"])).toHaveLength(REGRAS_PADRAO.length);
  });
});

describe("limite de uso (texto)", async () => {
  const { rotuloLimite } = await import("../src/regras/limite.js");
  it("singular, plural e sem limite", () => {
    expect(rotuloLimite(1, "COMBATE")).toBe("1 vez por combate");
    expect(rotuloLimite(2, "SESSAO")).toBe("2 vezes por sessão");
    expect(rotuloLimite(null, null)).toBeNull();
  });
});
