import { describe, expect, it } from "vitest";
import { chanceDeSucesso, dadosDoTeste, mediaDoTeste, notacaoDoTeste, resolverTeste } from "../src/regras/teste.js";

describe("regras de teste (d20)", () => {
  it("rola 1 d20 por ponto no atributo e +1 por ponto de esforço gasto", () => {
    expect(dadosDoTeste(2)).toBe(2);
    expect(dadosDoTeste(2, 1)).toBe(3);
    expect(dadosDoTeste(3, 2)).toBe(5);
  });

  it("atributo 0: sempre 1 dado, e o esforço não compra dados", () => {
    expect(dadosDoTeste(0)).toBe(1);
    expect(dadosDoTeste(0, 3)).toBe(1);
  });

  it("usa o maior dado e soma o bônus da perícia (exemplo: 10 e 15 com +5 = 20)", () => {
    expect(resolverTeste({ rolagens: [10, 15], pontosAtributo: 2, bonus: 5 })).toEqual({ maior: 15, base: 15, total: 20 });
    expect(resolverTeste({ rolagens: [10, 15], pontosAtributo: 2 }).total).toBe(15);
  });

  it("atributo 0: metade do dado, arredondada para baixo, depois o bônus", () => {
    expect(resolverTeste({ rolagens: [15], pontosAtributo: 0, bonus: 5 })).toEqual({ maior: 15, base: 7, total: 12 });
    expect(resolverTeste({ rolagens: [1], pontosAtributo: 0 }).total).toBe(0);
  });

  it("chance de sucesso pelo maior de n d20", () => {
    expect(chanceDeSucesso({ pontosAtributo: 1, dt: 11 })).toBeCloseTo(0.5);
    expect(chanceDeSucesso({ pontosAtributo: 2, dt: 11 })).toBeCloseTo(0.75);
    expect(chanceDeSucesso({ pontosAtributo: 2, dt: 11, esforcoGasto: 1 })).toBeCloseTo(0.875);
    expect(chanceDeSucesso({ pontosAtributo: 1, bonus: 5, dt: 11 })).toBeCloseTo(0.75);
    expect(chanceDeSucesso({ pontosAtributo: 1, dt: 1 })).toBe(1);
    expect(chanceDeSucesso({ pontosAtributo: 3, dt: 21 })).toBe(0);
  });

  it("atributo 0: precisa tirar o dobro da DT no dado", () => {
    // base >= 5  <=>  dado >= 10: 11 de 20 faces
    expect(chanceDeSucesso({ pontosAtributo: 0, dt: 5 })).toBeCloseTo(11 / 20);
    expect(chanceDeSucesso({ pontosAtributo: 0, dt: 11 })).toBe(0);
  });

  it("médias: 1d20 = 10,5; maior de 2d20 = 13,825; atributo 0 = 5", () => {
    expect(mediaDoTeste({ pontosAtributo: 1 })).toBeCloseTo(10.5);
    expect(mediaDoTeste({ pontosAtributo: 2 })).toBeCloseTo(13.825);
    expect(mediaDoTeste({ pontosAtributo: 0 })).toBeCloseTo(5);
    expect(mediaDoTeste({ pontosAtributo: 2, bonus: 5 })).toBeCloseTo(18.825);
  });

  it("notação mostrada na ficha", () => {
    expect(notacaoDoTeste(2, 5)).toBe("2d20 + 5");
    expect(notacaoDoTeste(1)).toBe("1d20");
    expect(notacaoDoTeste(0, 3)).toBe("1d20 ÷ 2 + 3");
    expect(notacaoDoTeste(1, -2)).toBe("1d20 - 2");
  });
});
