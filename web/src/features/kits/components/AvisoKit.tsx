// Faixa no topo de todas as telas do mestre quando há um kit ativo: deixa claro que o que for criado entra no kit.
import { Package, X } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../../../components/ui/Button";
import { useKitAtivo } from "../api";

export function AvisoKit() {
  const { kit, definir } = useKitAtivo();
  if (!kit) return null;
  return (
    <div className="aviso-kit" role="status">
      <Package size={18} aria-hidden className="aviso-kit__icone" />
      <span>
        Kit ativo: <strong>{kit.nome}</strong>. Tudo o que você criar entra neste kit, e as listas mostram o kit e o conteúdo geral.
      </span>
      <Link to={`/mestre/kits/${kit.id}`} className="btn btn--pequeno">Abrir kit</Link>
      <Button pequeno variante="fantasma" onClick={() => definir(null)}>
        <X size={14} aria-hidden /> Sair do kit
      </Button>
    </div>
  );
}
