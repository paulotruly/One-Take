// Selo ao lado do nome, ligado à API. Para o administrador, nas coisas dele (`podeVerificar`), o próprio selo é o botão:
// cinza = não verificado, azul = verificado. Para os outros, só o selo (se for verificado).
import { mensagemDeErro } from "../../../lib/api";
import { useVerificar } from "../api";
import { BotaoVerificar } from "../components/BotaoVerificar";
import { VerificadoBadge } from "../components/VerificadoBadge";
import type { TipoVerificavel, Visao } from "../types";

type Props = { tipo: TipoVerificavel; item: Visao & { id: string } };

export function SeloVerificado({ tipo, item }: Props) {
  const verificar = useVerificar();
  // Verificado por estar num kit verificado: o selo vem do kit (tire do kit para deixar de ser verificado).
  const porKit = !!item.verificadoPorKit && !item.seloProprio;
  if (!item.podeVerificar || porKit) return item.verificado ? <VerificadoBadge porKit={porKit} /> : null;
  const selo = item.seloProprio ?? !!item.verificado;
  return (
    <>
      <BotaoVerificar
        pequeno
        verificado={selo}
        ocupado={verificar.isPending}
        onAlternar={() => verificar.mutate({ tipo, id: item.id, verificado: !selo })}
      />
      {verificar.isError && <span className="campo__erro">{mensagemDeErro(verificar.error)}</span>}
    </>
  );
}
