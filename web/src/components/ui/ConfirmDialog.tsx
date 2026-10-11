import type { ReactNode } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

type Props = {
  aberto: boolean;
  titulo: string;
  mensagem: ReactNode;
  rotuloConfirmar?: string;
  processando?: boolean;
  erro?: string | null;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  rotuloConfirmar = "Excluir",
  processando,
  erro,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <Modal titulo={titulo} aberto={aberto} onFechar={onCancelar}>
      <p>{mensagem}</p>
      {erro && <div className="aviso">{erro}</div>}
      <div className="modal__acoes">
        <Button onClick={onCancelar} disabled={processando}>
          Cancelar
        </Button>
        <Button variante="perigo" onClick={onConfirmar} disabled={processando}>
          {processando ? "Excluindo…" : rotuloConfirmar}
        </Button>
      </div>
    </Modal>
  );
}
