// Hooks da conta logada: código de recuperação, exclusão e exportação dos dados.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

/** Gera um código de recuperação novo (com a senha atual); o anterior deixa de valer. */
export function useGerarCodigo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (senha: string) => api<{ codigoRecuperacao: string }>("/api/me/codigo-recuperacao", { method: "POST", body: { senha } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

/** Baixa o JSON com todos os dados da conta (portabilidade). */
export function useExportarDados() {
  return useMutation({
    mutationFn: async () => {
      const dados = await api<unknown>("/api/me/exportacao");
      const url = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `one-take-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

/** Exclui a conta na hora (senha + o próprio nome de usuário digitado). */
export function useExcluirConta() {
  return useMutation({
    mutationFn: (dados: { senha: string; confirmacao: string }) => api<{ excluida: boolean }>("/api/me/exclusao", { method: "POST", body: dados }),
  });
}
