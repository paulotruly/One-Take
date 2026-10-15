// Erro de domínio com status HTTP. O error-handler converte para
// { error: { code, message, details? } }.
export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const naoEncontrado = (m = "Recurso não encontrado") => new AppError(404, "NAO_ENCONTRADO", m);
export const naoAutenticado = (m = "Faça login para continuar") => new AppError(401, "NAO_AUTENTICADO", m);
export const proibido = (m = "Você não tem permissão para isso") => new AppError(403, "PROIBIDO", m);
export const classeDeOutro = () =>
  new AppError(403, "VERIFICADO", "Esta classe é verificada (de outra pessoa): só leitura. Duplique para editar.");
export const conflito = (code: string, m: string) => new AppError(409, code, m);
export const requisicaoInvalida = (m: string, details?: unknown) => new AppError(400, "REQUISICAO_INVALIDA", m, details);
