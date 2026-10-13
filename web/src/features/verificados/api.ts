// Hook do selo verificado (só o administrador, nas coisas dele).
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { TipoVerificavel } from "./types";

/** Pôr ou tirar o selo muda o que todo mestre vê: recarrega tudo. */
export function useVerificar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tipo, id, verificado }: { tipo: TipoVerificavel; id: string; verificado: boolean }) =>
      api<{ verificado: boolean }>(`/api/verificados/${tipo}/${id}`, { method: "PUT", body: { verificado } }),
    onSuccess: () => qc.invalidateQueries(),
  });
}
