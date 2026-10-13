// Regras da conta (fonte única; expostas em GET /api/regras). Funções puras e testadas.

export const CONTA = {
  /** Idade mínima para criar uma conta, em anos completos. */
  idadeMinima: 12,
  /** Ano mais antigo aceito na data de nascimento (evita erros de digitação). */
  anoMinimo: 1900,
} as const;

/** Idade em anos completos na data `hoje` (datas em UTC, só ano/mês/dia). */
export function idadeEm(nascimento: Date, hoje: Date) {
  let idade = hoje.getUTCFullYear() - nascimento.getUTCFullYear();
  const mes = hoje.getUTCMonth() - nascimento.getUTCMonth();
  if (mes < 0 || (mes === 0 && hoje.getUTCDate() < nascimento.getUTCDate())) idade--;
  return idade;
}

/** null se a data serve; senão, a mensagem para o usuário. */
export function problemaNaDataDeNascimento(nascimento: Date, hoje: Date): string | null {
  if (Number.isNaN(nascimento.getTime())) return "Data inválida";
  if (nascimento.getTime() > hoje.getTime()) return "A data não pode estar no futuro";
  if (nascimento.getUTCFullYear() < CONTA.anoMinimo) return "Confira o ano de nascimento";
  if (idadeEm(nascimento, hoje) < CONTA.idadeMinima) return `É preciso ter pelo menos ${CONTA.idadeMinima} anos para criar uma conta`;
  return null;
}
