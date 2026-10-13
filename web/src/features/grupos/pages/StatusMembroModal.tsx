// Container: aplicar e tirar status de um membro direto da página do grupo.
import { X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { mensagemDeErro } from "../../../lib/api";
import { useAplicarStatus, useRemoverStatus } from "../../fichas/api";
import { StatusBadge } from "../../status/components/StatusBadge";
import { ROTULO_TIPO, type Status } from "../../status/types";
import type { Membro } from "../types";

type Props = { grupoId: string; membro: Membro | null; statusAtivos: Status[]; onFechar: () => void };

export function StatusMembroModal({ grupoId, membro, statusAtivos, onFechar }: Props) {
  const fichaId = membro?.fichaId ?? "";
  const aplicar = useAplicarStatus(fichaId);
  const remover = useRemoverStatus(fichaId);
  const [escolhido, setEscolhido] = useState("");
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
          <div className="entrar-codigo__linha">
            <select value={escolhido} onChange={(e) => setEscolhido(e.target.value)} aria-label="Status para aplicar">
              <option value="">Escolha um status…</option>
              {aplicaveis.map((s) => <option key={s.id} value={s.id}>{s.nome} ({ROTULO_TIPO[s.tipo]})</option>)}
            </select>
            <Button variante="primario" disabled={!escolhido || aplicar.isPending} onClick={() => aplicar.mutate(escolhido, { onSuccess: () => setEscolhido("") })}>
              Aplicar
            </Button>
          </div>
        ) : (
          <p className="pagina__subtitulo">
            Sem status para aplicar. Ative status em <Link to={`/mestre/grupos/${grupoId}/editar`}>Editar grupo</Link>.
          </p>
        )}
        {(aplicar.isError || remover.isError) && <div className="aviso">{mensagemDeErro(aplicar.error ?? remover.error)}</div>}
        <div className="modal__acoes">
          <Button onClick={onFechar}>Fechar</Button>
        </div>
      </div>
    </Modal>
  );
}
