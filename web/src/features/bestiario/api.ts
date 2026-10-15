// Hooks do bestiário (criaturas, conceitos, cartela) e das criaturas invocadas nos grupos.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Habilidade, HabilidadeInput, Progressao } from "../classes/types";
import type { Criatura } from "../grupos/types";
import type { BestaConceito, Besta, BestaDetalhe, BestaInput, CriaturaDetalhe, RespostaCriatura } from "./types";

export function useBestas() {
  return useQuery({ queryKey: ["bestas", "lista"], queryFn: () => api<Besta[]>("/api/bestas") });
}

export function useBesta(id: string) {
  return useQuery({ queryKey: ["bestas", "detalhe", id], queryFn: () => api<BestaDetalhe>(`/api/bestas/${id}`) });
}

export function useProgressaoBesta(id: string) {
  return useQuery({ queryKey: ["bestas", "progressao", id], queryFn: () => api<Progressao>(`/api/bestas/${id}/progressao`) });
}

export function useConceitosBesta() {
  return useQuery({ queryKey: ["bestas", "conceitos"], queryFn: () => api<BestaConceito[]>("/api/conceitos-besta") });
}

/** Bestas aparecem nos grupos (criaturas invocadas), então invalidam os dois. */
function useEscrita<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => Promise.all(["bestas", "grupos", "criaturas"].map((k) => qc.invalidateQueries({ queryKey: [k] }))),
  });
}

export const useCriarBesta = () => useEscrita((dados: BestaInput) => api<BestaDetalhe>("/api/bestas", { method: "POST", body: dados }));
export const useEditarBesta = (id: string) =>
  useEscrita((dados: Partial<BestaInput>) => api<BestaDetalhe>(`/api/bestas/${id}`, { method: "PATCH", body: dados }));
export const useExcluirBesta = () => useEscrita((id: string) => api<void>(`/api/bestas/${id}`, { method: "DELETE" }));
export const useDuplicarBesta = () => useEscrita((id: string) => api<BestaDetalhe>(`/api/bestas/${id}/duplicar`, { method: "POST" }));

export const useVincularPericiaBesta = (bestaId: string) =>
  useEscrita(({ periciaId, valor }: { periciaId: string; valor: number }) =>
    api<BestaDetalhe>(`/api/bestas/${bestaId}/pericias/${periciaId}`, { method: "PUT", body: { modificador: valor } }),
  );
export const useDesvincularPericiaBesta = (bestaId: string) =>
  useEscrita((periciaId: string) => api<BestaDetalhe>(`/api/bestas/${bestaId}/pericias/${periciaId}`, { method: "DELETE" }));

export const useDefinirAtributoBesta = (bestaId: string) =>
  useEscrita(({ atributoId, dados }: { atributoId: string; dados: number }) =>
    api<BestaDetalhe>(`/api/bestas/${bestaId}/atributos/${atributoId}`, { method: "PUT", body: { dados } }),
  );

export const useCriarHabilidadeBesta = (bestaId: string) =>
  useEscrita((dados: HabilidadeInput) => api<Habilidade>(`/api/bestas/${bestaId}/habilidades`, { method: "POST", body: dados }));
export const useOrdenarHabilidadesBesta = (bestaId: string) =>
  useEscrita((ids: string[]) => api<Habilidade[]>(`/api/bestas/${bestaId}/habilidades/ordem`, { method: "PUT", body: { ids } }));

export const useCriarConceitoBesta = () =>
  useEscrita((dados: { titulo: string; descricao: string }) => api<BestaConceito>("/api/conceitos-besta", { method: "POST", body: dados }));
export const useEditarConceitoBesta = () =>
  useEscrita(({ id, dados }: { id: string; dados: { titulo: string; descricao: string } }) =>
    api<BestaConceito>(`/api/conceitos-besta/${id}`, { method: "PATCH", body: dados }),
  );
export const useExcluirConceitoBesta = () => useEscrita((id: string) => api<void>(`/api/conceitos-besta/${id}`, { method: "DELETE" }));

// ---------- Criaturas invocadas num grupo ----------

export function useCriatura(id: string | null) {
  return useQuery({
    queryKey: ["criaturas", id],
    queryFn: () => api<CriaturaDetalhe>(`/api/criaturas/${id}`),
    enabled: !!id,
  });
}

export const useInvocar = (grupoId: string) =>
  useEscrita((dados: { bestaId: string; nivel: number; quantidade: number }) =>
    api<Criatura[]>(`/api/grupos/${grupoId}/criaturas`, { method: "POST", body: dados }),
  );

export const useEditarCriatura = () =>
  useEscrita(({ id, dados }: { id: string; dados: Partial<{ nome: string; vidaAtual: number; manaAtual: number; esforcoAtual: number }> }) =>
    api<RespostaCriatura>(`/api/criaturas/${id}`, { method: "PATCH", body: dados }),
  );

export const useAplicarStatusCriatura = (id: string) =>
  useEscrita(({ statusId, turnos }: { statusId: string; turnos: number | null }) => api<CriaturaDetalhe>(`/api/criaturas/${id}/status`, { method: "POST", body: { statusId, turnos } }));
/** Turnos que faltam de um status aplicado (0 tira o status). */
export const useTurnosStatusCriatura = (id: string) =>
  useEscrita(({ statusId, turnos }: { statusId: string; turnos: number | null }) => api<CriaturaDetalhe>(`/api/criaturas/${id}/status/${statusId}`, { method: "PATCH", body: { turnos } }));
export const useRemoverStatusCriatura = (id: string) =>
  useEscrita((statusId: string) => api<CriaturaDetalhe>(`/api/criaturas/${id}/status/${statusId}`, { method: "DELETE" }));

export const useRemoverCriatura = () => useEscrita((id: string) => api<void>(`/api/criaturas/${id}`, { method: "DELETE" }));
