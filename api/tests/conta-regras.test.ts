import { describe, expect, it } from "vitest";
import { CONTA, idadeEm, problemaNaDataDeNascimento } from "../src/regras/conta.js";

const d = (s: string) => new Date(`${s}T00:00:00Z`);

describe("idade mínima da conta", () => {
  it("conta anos completos (o aniversário ainda não chegou = um a menos)", () => {
    expect(idadeEm(d("2014-10-13"), d("2026-10-13"))).toBe(12);
    expect(idadeEm(d("2014-10-14"), d("2026-10-13"))).toBe(11);
    expect(idadeEm(d("2014-11-01"), d("2026-10-13"))).toBe(11);
  });

  it(`aceita quem já tem ${CONTA.idadeMinima} anos e recusa o resto`, () => {
    const hoje = d("2026-10-13");
    expect(problemaNaDataDeNascimento(d("2014-10-13"), hoje)).toBeNull();
    expect(problemaNaDataDeNascimento(d("2014-10-14"), hoje)).toMatch(/pelo menos 12 anos/);
    expect(problemaNaDataDeNascimento(d("2027-01-01"), hoje)).toMatch(/futuro/);
    expect(problemaNaDataDeNascimento(d("1850-01-01"), hoje)).toMatch(/ano/);
  });
});
