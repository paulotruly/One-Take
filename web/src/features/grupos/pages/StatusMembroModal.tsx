// Container: aplicar e tirar status de um membro direto da página do grupo.
import { X } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { mensagemDeErro } from "../../../lib/api";
import { useAplicarStatus, useRemoverStatus, useTurnosStatus } from "../../fichas/api";
import { StatusBadge } from "../../status/components/StatusBadge";
import { AplicarStatusLinha, StatusTurnos } from "../../status/components/StatusTurnos";
import type { Status } from "../../status/types";
import type { Membro } from "../types";

type Props = { grupoId: string; membro: Membro | null; statusAtivos: Status[]; onFechar: () => void };

export function StatusMembroModal({ grupoId, membro, statusAtivos, onFechar }: Props) {
  const fichaId = membro?.fichaId ?? "";
  const aplicar = useAplicarStatus(fichaId);
  const remover = useRemoverStatus(fichaId);
  const turnos = useTurnosStatus(fichaId);
  const aplicados = membro?.status ?? [];
  const aplicaveis = statusAtivos.filter((s) => !s.automatico && !aplicados.some((a) => a.id === s.id));

  return (
    <Modal aberto={!!membro} onFechar={onFechar} titulo={`Status de ${membro?.nome ?? ""}`}>
      <div className="form">
        {aplicados.length === 0 ? (
          <p className="pagina__subtitulo">Nenhum status agora.</p>
        ) : (
          <ul className="lista-simples">
            {aplicados.map((s) => (
              <li key={s.id} className="status-linha">
                <StatusBadge nome={s.nome} tipo={s.tipo} /> {s.automatico && <span className="pagina__subtitulo">automático</span>}
                <StatusTurnos status={s as Status} ocupado={turnos.isPending} onMudarTurnos={(t) => turnos.mutate({ statusId: s.id, turnos: t })} />
                {!s.automatico && (
                  <Button pequeno variante="fantasma" aria-label={`Tirar ${s.nome}`} title="Tirar status" disabled={remover.isPending} onClick={() => remover.mutate(s.id)}>
                    <X size={14} aria-hidden />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        {aplicaveis.length > 0 ? (
          <AplicarStatusLinha aplicaveis={aplicaveis} ocupado={aplicar.isPending} rotulo="Aplicar"
            onAplicar={(statusId, t, pronto) => aplicar.mutate({ statusId, turnos: t }, { onSuccess: pronto })} />
        ) : (
          <p className="pagina__subtitulo">
            Sem status para aplicar. Ative status em <Link to={`/mestre/grupos/${grupoId}/editar`}>Editar grupo</Link>.
          </p>
        )}
        {(aplicar.isError || remover.isError || turnos.isError) && <div className="aviso">{mensagemDeErro(aplicar.error ?? remover.error ?? turnos.error)}</div>}
        <div className="modal__acoes">
          <Button onClick={onFechar}>Fechar</Button>
        </div>
      </div>
    </Modal>
  );
}
