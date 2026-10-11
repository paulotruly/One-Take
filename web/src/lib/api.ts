// Cliente HTTP da API: injeta o JWT do Supabase e converte erros no formato
// { error: { code, message, details } } em ApiError.
import { API_URL, supabase } from "./supabase";

export type DetalheErro = { campo: string; mensagem: string };

export class ApiError extends Error {
  status: number;
  code: string;
  details: DetalheErro[];

  constructor(status: number, code: string, message: string, details: DetalheErro[] = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Erros de validação indexados por campo, para exibir nos formulários. */
  get porCampo(): Record<string, string> {
    return Object.fromEntries(this.details.map((d) => [d.campo, d.mensagem]));
  }
}

export async function api<T>(caminho: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${caminho}`, {
      method: init.method ?? "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(init.body !== undefined && { "Content-Type": "application/json" }),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "SEM_CONEXAO", "Não foi possível falar com o servidor. Verifique se a API está no ar.");
  }

  if (res.status === 204) return undefined as T;
  const corpo = await res.json().catch(() => null);

  if (!res.ok) {
    const e = corpo?.error;
    if (res.status === 401) await supabase.auth.signOut(); // sessão inválida: volta ao login
    throw new ApiError(res.status, e?.code ?? "ERRO", e?.message ?? `Erro ${res.status}`, e?.details ?? []);
  }
  return corpo as T;
}

export function mensagemDeErro(erro: unknown) {
  return erro instanceof Error ? erro.message : "Algo deu errado.";
}

/** Erros de validação por campo (vazio se não for erro da API). */
export function errosDeCampo(erro: unknown): Record<string, string> {
  return erro instanceof ApiError ? erro.porCampo : {};
}

/** Mensagem geral para o rodapé de um formulário. */
export function erroDeFormulario(erro: unknown) {
  if (!erro) return null;
  return erro instanceof ApiError && erro.code === "VALIDACAO" ? "Corrija os campos destacados." : mensagemDeErro(erro);
}
