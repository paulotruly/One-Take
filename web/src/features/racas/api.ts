// Hooks das raças do mestre e das perícias que cada raça concede.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Raca, RacaConceito, RacaInput } from "./types";

export function useRacas() {
  return useQuery({ queryKey: ["racas", "lista"], queryFn: () => api<Raca[]>("/api/racas") });
}

export function useRaca(id: string) {
  return useQuery({ queryKey: ["racas", "detalhe", id], queryFn: () => api<Raca>(`/api/racas/${id}`) });
}

/** Raças alteram o "usada em" do catálogo de perícias, então invalidam os dois. */
function useEscrita<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      Promise.all([qc.invalidateQueries({ queryKey: ["racas"] }), qc.invalidateQueries({ queryKey: ["pericias"] })]),
  });
}

export function useConceitosRaca() {
  return useQuery({ queryKey: ["racas", "conceitos"], queryFn: () => api<RacaConceito[]>("/api/conceitos-raca") });
}

export const useCriarConceitoRaca = () =>
  useEscrita((dados: { titulo: string; descricao: string }) => api<RacaConceito>("/api/conceitos-raca", { method: "POST", body: dados }));
export const useEditarConceitoRaca = () =>
  useEscrita(({ id, dados }: { id: string; dados: { titulo: string; descricao: string } }) =>
    api<RacaConceito>(`/api/conceitos-raca/${id}`, { method: "PATCH", body: dados }),
  );
export const useExcluirConceitoRaca = () => useEscrita((id: string) => api<void>(`/api/conceitos-raca/${id}`, { method: "DELETE" }));

export const useCriarRaca = () => useEscrita((dados: RacaInput) => api<Raca>("/api/racas", { method: "POST", body: dados }));

export const useEditarRaca = (id: string) =>
  useEscrita((dados: RacaInput) => api<Raca>(`/api/racas/${id}`, { method: "PATCH", body: dados }));

export const useExcluirRaca = () => useEscrita((id: string) => api<void>(`/api/racas/${id}`, { method: "DELETE" }));

export const useVincularPericiaRaca = (racaId: string) =>
  useEscrita(({ periciaId, valor }: { periciaId: string; valor: number }) =>
    api(`/api/racas/${racaId}/pericias/${periciaId}`, { method: "PUT", body: { pontos: valor } }),
  );

export const useDesvincularPericiaRaca = (racaId: string) =>
  useEscrita((periciaId: string) => api<void>(`/api/racas/${racaId}/pericias/${periciaId}`, { method: "DELETE" }));
