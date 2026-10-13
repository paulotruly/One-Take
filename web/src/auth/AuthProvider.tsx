import type { Session } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";

export type Papel = "MESTRE" | "JOGADOR";
export type Me = {
  id: string;
  nickname: string;
  papel: Papel;
  nome: string | null;
  fotoUrl: string | null;
  /** Quando o código de recuperação atual foi gerado (null = a conta ainda não tem). */
  codigoRecuperacaoEm: string | null;
  /** "AAAA-MM-DD"; nula em contas criadas antes da idade mínima. */
  dataNascimento: string | null;
};

/** Nome de usuário (nickname no código) guardado sem "@" e minúsculo. */
export const normalizarNickname = (v: string) => v.trim().replace(/^@/, "").toLowerCase();

type AuthCtx = {
  /** undefined = ainda carregando a sessão salva. */
  session: Session | null | undefined;
  /** Entra com o nome de usuário (ou e-mail, em contas muito antigas) e a senha. */
  entrar: (login: string, senha: string) => Promise<void>;
  /**
   * Cria a conta pela API. Devolve o código de recuperação (para mostrar uma vez) e `entrar`, que abre a sessão:
   * a tela só entra depois que a pessoa confirma que guardou o código.
   */
  cadastrar: (dados: DadosCadastro) => Promise<{ codigoRecuperacao: string; entrar: () => Promise<void> }>;
  sair: () => Promise<void>;
};

export type DadosCadastro = { nickname: string; senha: string; papel: Papel; dataNascimento: string };

const Ctx = createContext<AuthCtx | null>(null);

const MENSAGENS: Record<string, string> = {
  "Invalid login credentials": "Nome de usuário ou senha incorretos.",
  "User already registered": "Este nome de usuário já está em uso.",
  "Signups not allowed for this instance": "O cadastro está desativado no Supabase.",
};
const traduzir = (m: string) => MENSAGENS[m] ?? (m.includes("Password should be") ? "A senha precisa ter pelo menos 6 caracteres." : m);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_evento, nova) => {
      setSession(nova);
      if (!nova) queryClient.clear();
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  async function entrar(login: string, senha: string) {
    // A API acha a conta pelo nome de usuário e devolve a sessão do Supabase.
    const tokens = await api<{ access_token: string; refresh_token: string }>("/api/entrar", {
      method: "POST",
      body: { login, senha },
    });
    const { error } = await supabase.auth.setSession(tokens);
    if (error) throw new Error(traduzir(error.message));
  }

  async function cadastrar({ nickname, senha, papel, dataNascimento }: DadosCadastro) {
    // A API valida, cria a conta no Supabase Auth e o perfil, e devolve a sessão e o código de recuperação.
    const { codigoRecuperacao, ...tokens } = await api<{ access_token: string; refresh_token: string; codigoRecuperacao: string }>("/api/cadastro", {
      method: "POST",
      body: { nickname: normalizarNickname(nickname), senha, papel, dataNascimento },
    });
    return {
      codigoRecuperacao,
      entrar: async () => {
        const { error } = await supabase.auth.setSession(tokens);
        if (error) throw new Error(traduzir(error.message));
      },
    };
  }

  async function sair() {
    await supabase.auth.signOut();
  }

  return <Ctx.Provider value={{ session, entrar, cadastrar, sair }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}

/** Perfil (com papel, nome e foto) do usuário logado, vindo da API. */
export function useMe() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["me", session?.user.id],
    queryFn: () => api<Me>("/api/me"),
    enabled: !!session,
    staleTime: 5 * 60_000,
  });
}

/** Interface usada por último neste navegador (só conveniência; a fonte é o papel da conta). */
const CHAVE_INTERFACE = "one-take:interface";
export function lembrarInterface(i: Papel) {
  try {
    localStorage.setItem(CHAVE_INTERFACE, i);
  } catch {
    /* sem armazenamento: tudo bem */
  }
}
export function interfaceLembrada(): Papel | null {
  try {
    const v = localStorage.getItem(CHAVE_INTERFACE);
    return v === "MESTRE" || v === "JOGADOR" ? v : null;
  } catch {
    return null;
  }
}

/** Ativa a interface de mestre nesta conta (a de jogador continua). */
export function useAtivarMestre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<Me>("/api/me/mestre", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useEditarPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: { nickname: string; nome: string | null; fotoUrl: string | null }) => api<Me>("/api/me", { method: "PATCH", body: dados }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}
