// Hooks dos grupos do mestre.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Disponiveis, Grupo, GrupoDetalhe, GrupoInput, RegraDaMesa, RegraDaMesaInput } from "./types";

export function useGrupos(habilitado = true) {
  return useQuery({ queryKey: ["grupos", "lista"], queryFn: () => api<Grupo[]>("/api/grupos"), enabled: habilitado });
}

export function useGrupo(id: string) {
  return useQuery({ queryKey: ["grupos", "detalhe", id], queryFn: () => api<GrupoDetalhe>(`/api/grupos/${id}`) });
}

/** Grupos afetam fichas e a disponibilidade (exclusividade) de classes, raças e atributos. */
function useEscrita<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => Promise.all(["grupos", "fichas", "classes", "racas", "atributos"].map((k) => qc.invalidateQueries({ queryKey: [k] }))),
  });
}

export const useCriarGrupo = () =>
  useEscrita((dados: GrupoInput & { disponiveis: Disponiveis }) => api<GrupoDetalhe>("/api/grupos", { method: "POST", body: dados }));

export const useEditarGrupo = (id: string) =>
  useEscrita((dados: Partial<GrupoInput>) => api<GrupoDetalhe>(`/api/grupos/${id}`, { method: "PATCH", body: dados }));

export const useDefinirDisponiveis = (id: string) =>
  useEscrita((dados: Disponiveis) => api<GrupoDetalhe>(`/api/grupos/${id}/disponiveis`, { method: "PUT", body: dados }));

export const useNovoCodigo = (id: string) => useEscrita(() => api<GrupoDetalhe>(`/api/grupos/${id}/codigo`, { method: "POST" }));

export const useExcluirGrupo = () => useEscrita((id: string) => api<void>(`/api/grupos/${id}`, { method: "DELETE" }));

// ---------- Regras próprias da mesa ----------
export const useCriarRegra = (grupoId: string) =>
  useEscrita((dados: RegraDaMesaInput) => api<RegraDaMesa>(`/api/grupos/${grupoId}/regras`, { method: "POST", body: dados }));

export const useEditarRegra = () =>
  useEscrita(({ id, dados }: { id: string; dados: RegraDaMesaInput }) => api<RegraDaMesa>(`/api/regras-da-mesa/${id}`, { method: "PATCH", body: dados }));

export const useExcluirRegra = () => useEscrita((id: string) => api<void>(`/api/regras-da-mesa/${id}`, { method: "DELETE" }));
