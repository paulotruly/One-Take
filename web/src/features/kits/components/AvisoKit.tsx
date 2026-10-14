// Faixa no topo das listas do mestre quando há um kit ativo: lembra o filtro e deixa tirar.
import { Package, X } from "lucide-react";
import { VerificadoBadge } from "../../verificados/components/VerificadoBadge";
import { Button } from "../../../components/ui/Button";
import { useKitAtivo } from "../api";

export function AvisoKit() {
  const { kit, definir } = useKitAtivo();
  if (!kit) return null;
  return (
    <div className="aviso-kit" role="status">
      <Package size={16} aria-hidden />
      <span>
        Mostrando só o kit <strong>{kit.nome}</strong> {kit.verificado && <VerificadoBadge />} (o geral aparece em Todos). {kit.deOutro ? "É um kit verificado: o que você criar fica fora dele." : "O que você criar aqui entra no kit."}
      </span>
      <Button pequeno variante="fantasma" onClick={() => definir(null)}>
        <X size={14} aria-hidden /> Mostrar tudo
      </Button>
    </div>
  );
}
