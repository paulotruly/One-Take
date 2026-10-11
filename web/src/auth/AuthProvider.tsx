import type { Session } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";

export type Papel = "MESTRE" | "JOGADOR";
export type Me = { id: string; nickname: string; papel: Papel; nome: string | null; fotoUrl: string | null };

/** Email interno usado no Supabase Auth para contas criadas por nickname (ninguém vê). */
const emailInterno = (nickname: string) => `${nickname}@one-take.local`;

/** Nickname guardado sem "@" e minúsculo. */
export const normalizarNickname = (v: string) => v.trim().replace(/^@/, "").toLowerCase();

type AuthCtx = {
  /** undefined = ainda carregando a sessão salva. */
  session: Session | null | undefined;
  /** Entra com nickname (ou email, para contas antigas) e senha. */
  entrar: (login: string, senha: string) => Promise<void>;
  cadastrar: (dados: { nickname: string; senha: string; papel: Papel }) => Promise<void>;
  sair: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

const MENSAGENS: Record<string, string> = {
  "Invalid login credentials": "Nickname ou senha incorretos.",
  "User already registered": "Este nickname já está em uso.",
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
    // A API acha a conta pelo nickname e devolve a sessão do Supabase.
    const tokens = await api<{ access_token: string; refresh_token: string }>("/api/entrar", {
      method: "POST",
      body: { login, senha },
    });
    const { error } = await supabase.auth.setSession(tokens);
    if (error) throw new Error(traduzir(error.message));
  }

  async function cadastrar({ nickname, senha, papel }: { nickname: string; senha: string; papel: Papel }) {
    const nick = normalizarNickname(nickname);
    const { disponivel, motivo } = await api<{ disponivel: boolean; motivo?: string }>(`/api/nicknames/${encodeURIComponent(nick)}`);
    if (!disponivel) throw new Error(motivo ?? "Nickname indisponível.");
    // papel e nickname vão no user_metadata; a API cria o perfil com eles no primeiro acesso.
    const { data, error } = await supabase.auth.signUp({
      email: emailInterno(nick),
      password: senha,
      options: { data: { papel, nickname: nick } },
    });
    if (error) {
      if (error.code === "over_email_send_rate_limit" || error.message.toLowerCase().includes("email")) {
        throw new Error('Cadastro indisponível: no Supabase, desligue "Confirm email" (Authentication > Sign In / Providers > Email).');
      }
      throw new Error(traduzir(error.message));
    }
    if (!data.session) {
      throw new Error('Conta criada, mas o Supabase pede confirmação por email. Desligue "Confirm email" no painel do Supabase.');
    }
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

export function useEditarPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: { nickname: string; nome: string | null; fotoUrl: string | null }) => api<Me>("/api/me", { method: "PATCH", body: dados }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}
