import { BadgeCheck } from "lucide-react";
import { Button } from "../../../components/ui/Button";

type Props = { verificado: boolean; ocupado?: boolean; pequeno?: boolean; onAlternar: () => void };

/** Botão do administrador para pôr ou tirar o selo verificado. */
export function BotaoVerificar({ verificado, ocupado, pequeno, onAlternar }: Props) {
  return (
    <Button pequeno={pequeno} variante="fantasma" disabled={ocupado} onClick={onAlternar}
      title={verificado ? "Deixa de aparecer para os outros mestres" : "Passa a aparecer para todo mestre (só leitura)"}>
      <BadgeCheck size={pequeno ? 14 : 16} aria-hidden /> {verificado ? "Tirar selo verificado" : "Marcar como verificado"}
    </Button>
  );
}
