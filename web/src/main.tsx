import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { AuthProvider } from "./auth/AuthProvider";
import { ApiError } from "./lib/api";
import { aplicarPreferencias } from "./lib/preferencias";
import { atualizarTitulo } from "./lib/titulo";
import { router } from "./router";
import "@fontsource-variable/cinzel";
import "@fontsource-variable/inter";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/home.css";
import "./components/ui/ui.css";
import "./features/classes/components/classes.css";
import "./features/pericias/components/pericias.css";
import "./features/status/components/status.css";
import "./features/grupos/components/grupos.css";
import "./features/fichas/components/fichas.css";
import "./features/itens/components/itens.css";
import "./features/bestiario/components/bestiario.css";
import "./features/docs/docs.css";
import "./styles/mobile.css"; // por último: ajustes de celular

// Dados falsos para ver as telas logadas (npm run dev:mock); fora do build de produção.
if (import.meta.env.MODE === "mock") await import("./mock/instalar");

aplicarPreferencias();
atualizarTitulo(window.location.pathname);
router.subscribe((estado) => atualizarTitulo(estado.location.pathname));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Não insiste em erros do cliente (401/403/404/400); tenta de novo só falhas de rede/servidor.
      retry: (tentativas, erro) => !(erro instanceof ApiError && erro.status >= 400 && erro.status < 500) && tentativas < 2,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
