import { BadgeCheck } from "lucide-react";
import { Button } from "../../../components/ui/Button";

type Props = { verificado: boolean; ocupado?: boolean; pequeno?: boolean; onAlternar: () => void };

/** Botão do administrador para pôr ou tirar o selo: só o ícone, cinza quando não é verificado e azul quando é. */
export function BotaoVerificar({ verificado, ocupado, pequeno, onAlternar }: Props) {
  const rotulo = verificado ? "Tirar selo verificado (deixa de aparecer para os outros mestres)" : "Marcar como verificado (passa a aparecer para todo mestre)";
  return (
    <Button pequeno={pequeno} variante="fantasma" disabled={ocupado} onClick={onAlternar} title={rotulo} aria-label={rotulo} aria-pressed={verificado}
      className={`botao-verificar${verificado ? " botao-verificar--ativo" : ""}`}>
      <BadgeCheck className="botao-verificar__icone" size={pequeno ? 18 : 20} aria-hidden />
    </Button>
  );
}
