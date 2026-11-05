// Modo mock (npm run dev:mock): entra logado como mestre e responde às chamadas da API com dados falsos, no navegador.
// Não chega à API nem ao banco: nada é salvo. Só é carregado neste modo (main.tsx), então fica fora do build de produção.
import type { Session } from "@supabase/supabase-js";
import { API_URL, supabase } from "../lib/supabase";
import { ME, responder } from "./dados";
import "./mock.css";

const sessao = { access_token: "mock", refresh_token: "mock", token_type: "bearer", expires_in: 3600, user: { id: ME.id } } as unknown as Session;

const auth = supabase.auth as unknown as Record<string, unknown>;
auth.getSession = async () => ({ data: { session: sessao }, error: null });
auth.onAuthStateChange = (aviso: (evento: string, s: Session | null) => void) => {
  queueMicrotask(() => aviso("INITIAL_SESSION", sessao));
  return { data: { subscription: { unsubscribe() {} } } };
};
auth.signOut = async () => ({ error: null });
auth.setSession = async () => ({ data: { session: sessao }, error: null });

const json = (dados: unknown, status = 200) => new Response(JSON.stringify(dados), { status, headers: { "Content-Type": "application/json" } });
const original = window.fetch.bind(window);

window.fetch = async (entrada, init) => {
  const endereco = String(entrada instanceof Request ? entrada.url : entrada);
  if (!endereco.startsWith(API_URL)) {
    // O Supabase nunca é chamado neste modo; o resto (arquivos do Vite) segue normal.
    if (endereco.includes("supabase.co")) return json({ error: "mock" }, 503);
    return original(entrada, init);
  }
  const url = new URL(endereco);
  const metodo = (init?.method ?? "GET").toUpperCase();

  if (metodo === "GET") {
    const dados = responder(url.pathname, url.searchParams);
    if (dados === undefined) {
      console.warn(`[mock] sem resposta para GET ${url.pathname}`);
      return json({ error: { code: "NAO_ENCONTRADO", message: "O modo mock não tem este dado.", details: [] } }, 404);
    }
    return json(dados);
  }

  // Escritas não salvam nada: devolvem o que já existe, para a tela seguir em frente.
  console.info(`[mock] ${metodo} ${url.pathname} ignorado: nada é salvo`);
  if (metodo === "DELETE") return new Response(null, { status: 204 });
  const corpo = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
  const semAcao = url.pathname.replace(/\/(duplicar|progressao|ordem|codigo|subir-nivel)$/, "");
  const atual = responder(semAcao, url.searchParams);
  const existente = Array.isArray(atual) ? atual[0] : atual;
  return json(existente ?? { id: "mock", ...corpo }, metodo === "POST" && !existente ? 201 : 200);
};

