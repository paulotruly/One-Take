// Botão de verificar ligado à API. Só aparece para o administrador, nas coisas dele (`podeVerificar`).
import { mensagemDeErro } from "../../../lib/api";
import { useVerificar } from "../api";
import { BotaoVerificar } from "../components/BotaoVerificar";
import type { TipoVerificavel, Visao } from "../types";

type Props = { tipo: TipoVerificavel; item: Visao & { id: string }; pequeno?: boolean };

export function AlternarVerificado({ tipo, item, pequeno }: Props) {
  const verificar = useVerificar();
  if (!item.podeVerificar) return null;
  // Verificado por estar num kit verificado: o selo vem do kit (tire do kit para deixar de ser verificado).
  if (item.verificadoPorKit && !item.seloProprio) return <span className="pagina__subtitulo">Verificado pelo kit</span>;
  const selo = item.seloProprio ?? !!item.verificado;
  return (
    <>
      <BotaoVerificar
        pequeno={pequeno}
        verificado={selo}
        ocupado={verificar.isPending}
        onAlternar={() => verificar.mutate({ tipo, id: item.id, verificado: !selo })}
      />
      {verificar.isError && <span className="campo__erro">{mensagemDeErro(verificar.error)}</span>}
    </>
  );
}
