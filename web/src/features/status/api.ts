// Hooks do catálogo de status do mestre.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Status, StatusInput } from "./types";

export function useStatus(habilitado = true) {
  return useQuery({ queryKey: ["status"], queryFn: () => api<Status[]>("/api/status"), enabled: habilitado });
}

/** Status aparecem em cartas, grupos e fichas. */
function useEscrita<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => Promise.all(["status", "classes", "grupos", "fichas"].map((k) => qc.invalidateQueries({ queryKey: [k] }))),
  });
}

export const useCriarStatus = () => useEscrita((dados: StatusInput) => api<Status>("/api/status", { method: "POST", body: dados }));

export const useEditarStatus = () =>
  useEscrita(({ id, dados }: { id: string; dados: StatusInput }) => api<Status>(`/api/status/${id}`, { method: "PATCH", body: dados }));

export const useExcluirStatus = () => useEscrita((id: string) => api<void>(`/api/status/${id}`, { method: "DELETE" }));
