// Chamadas ao Supabase Auth feitas pela API. Sessão: com a chave pública (como o login por nickname já fazia).
// Administração (criar usuário, trocar senha, excluir): com a chave secreta, que só existe no servidor.
import { config } from "./config.js";
import { AppError } from "./errors.js";

const indisponivel = () =>
  new AppError(503, "AUTH_NAO_CONFIGURADO", "Esta função ainda não está configurada no servidor (falta a chave secreta do Supabase).");

export const adminConfigurado = () => !!config.chaveSecreta() && !!config.supabaseUrl();

async function admin(caminho: string, init: { method: string; body?: unknown }) {
  if (!adminConfigurado()) throw indisponivel();
  const chave = config.chaveSecreta();
  return fetch(`${config.supabaseUrl()}/auth/v1/admin${caminho}`, {
    method: init.method,
    headers: { apikey: chave, Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

async function mensagemDe(resposta: Response) {
  try {
    const j = (await resposta.json()) as { msg?: string; message?: string; error_code?: string; code?: string };
    return { codigo: j.error_code ?? j.code ?? "", texto: j.msg ?? j.message ?? "" };
  } catch {
    return { codigo: "", texto: "" };
  }
}

/** Erro do Supabase em mensagem para o usuário (sem detalhes internos). */
async function erroDoSupabase(resposta: Response, acao: string): Promise<never> {
  const { codigo, texto } = await mensagemDe(resposta);
  if (codigo === "weak_password" || /password/i.test(texto)) {
    throw new AppError(400, "SENHA_FRACA", "A senha precisa ter pelo menos 6 caracteres.", [{ campo: "senha", mensagem: "Senha fraca" }]);
  }
  if (codigo === "email_exists" || /already (been )?registered/i.test(texto)) {
    throw new AppError(409, "NICKNAME_EM_USO", "Este nickname já está em uso.", [{ campo: "nickname", mensagem: "Já está em uso" }]);
  }
  console.error(`[supabase-auth] ${acao}: ${resposta.status}`);
  throw new AppError(502, "AUTH_FALHOU", "O serviço de contas não respondeu como esperado. Tente de novo.");
}

/** Pede a sessão (login por senha). null = senha errada. */
export async function pedirSessao(email: string, senha: string) {
  const resposta = await fetch(`${config.supabaseUrl()}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: config.chavePublica(), "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: senha }),
  });
  if (!resposta.ok) return null;
  const sessao = (await resposta.json()) as { access_token: string; refresh_token: string };
  return { access_token: sessao.access_token, refresh_token: sessao.refresh_token };
}

/** Confere a senha da conta (reautenticação). Lança 401 se estiver errada. */
export async function conferirSenha(emailDeLogin: string, senha: string) {
  if (!(await pedirSessao(emailDeLogin, senha))) {
    throw new AppError(401, "SENHA_INCORRETA", "Senha incorreta.", [{ campo: "senha", mensagem: "Senha incorreta" }]);
  }
}

/** Cria o usuário já confirmado (o e-mail do Auth é o interno; a verificação do e-mail de contato é nossa). */
export async function criarUsuario(dados: { email: string; senha: string; metadata: Record<string, unknown> }) {
  const resposta = await admin("/users", {
    method: "POST",
    body: { email: dados.email, password: dados.senha, email_confirm: true, user_metadata: dados.metadata },
  });
  if (!resposta.ok) await erroDoSupabase(resposta, "criar usuário");
  return ((await resposta.json()) as { id: string }).id;
}

export async function definirSenha(id: string, senha: string) {
  const resposta = await admin(`/users/${id}`, { method: "PUT", body: { password: senha } });
  if (!resposta.ok) await erroDoSupabase(resposta, "definir senha");
}

/** Idempotente: usuário que já não existe conta como excluído. */
export async function excluirUsuario(id: string) {
  const resposta = await admin(`/users/${id}`, { method: "DELETE" });
  if (!resposta.ok && resposta.status !== 404) await erroDoSupabase(resposta, "excluir usuário");
}
