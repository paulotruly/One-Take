// Hooks dos kits de RPG e do kit ativo (filtro da interface do mestre).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { api } from "../../lib/api";
import { gravarKitAtivo, lerKitAtivo, type Kit, type KitInput } from "./types";

export function useKits() {
  return useQuery({ queryKey: ["kits"], queryFn: () => api<Kit[]>("/api/kits") });
}

/** Mudar kits mexe no conteúdo de tudo (listas mostram kitIds). */
function useEscrita<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries() });
}

export const useCriarKit = () => useEscrita((dados: KitInput) => api<Kit>("/api/kits", { method: "POST", body: dados }));
export const useEditarKit = () => useEscrita(({ id, dados }: { id: string; dados: KitInput }) => api<Kit>(`/api/kits/${id}`, { method: "PATCH", body: dados }));
export const useExcluirKit = () => useEscrita((id: string) => api<void>(`/api/kits/${id}`, { method: "DELETE" }));

// ---------- Kit ativo (guardado no navegador) ----------
const ouvintes = new Set<() => void>();
function assinar(cb: () => void) {
  ouvintes.add(cb);
  return () => ouvintes.delete(cb);
}

/** Kit ativo: filtra as telas do mestre (o que é do kit + o geral) e é o kit padrão do que for criado. */
export function useKitAtivo() {
  const kits = useKits();
  const id = useSyncExternalStore(assinar, lerKitAtivo, () => null);
  const kit = kits.data?.find((k) => k.id === id) ?? null;
  // Kit apagado: o filtro some sozinho.
  const kitId = kits.data && !kit ? null : id;
  function definir(novo: string | null) {
    gravarKitAtivo(novo, !!kits.data?.find((k) => k.id === novo)?.deOutro);
    ouvintes.forEach((cb) => cb());
  }
  return { kitId, kit, definir };
}
