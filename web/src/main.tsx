import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { AuthProvider } from "./auth/AuthProvider";
import { ApiError } from "./lib/api";
import { router } from "./router";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./components/ui/ui.css";
import "./features/classes/components/classes.css";
import "./features/pericias/components/pericias.css";
import "./features/grupos/components/grupos.css";
import "./features/fichas/components/fichas.css";
import "./features/docs/docs.css";

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
