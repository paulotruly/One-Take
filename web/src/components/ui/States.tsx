import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

export function Loading({ texto = "Carregando…", compacto }: { texto?: string; compacto?: boolean }) {
  return (
    <div className={`estado ${compacto ? "estado--compacto" : ""}`} role="status">
      <LoaderCircle className="spinner" size={28} aria-hidden />
      <span>{texto}</span>
    </div>
  );
}

export function EmptyState({
  titulo,
  descricao,
  acao,
  compacto,
}: {
  titulo: string;
  descricao?: ReactNode;
  acao?: ReactNode;
  compacto?: boolean;
}) {
  return (
    <div className={`estado ${compacto ? "estado--compacto" : ""}`}>
      <span className="estado__titulo">{titulo}</span>
      {descricao && <span>{descricao}</span>}
      {acao}
    </div>
  );
}

export function ErrorState({ mensagem, onTentarNovamente }: { mensagem: string; onTentarNovamente?: () => void }) {
  return (
    <div className="estado estado--erro" role="alert">
      <span className="estado__titulo">Não foi possível carregar</span>
      <span>{mensagem}</span>
      {onTentarNovamente && <Button onClick={onTentarNovamente}>Tentar novamente</Button>}
    </div>
  );
}
