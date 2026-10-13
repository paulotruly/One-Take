// Mostra o código de recuperação (uma vez só) e pede para a pessoa confirmar que guardou.
import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";

export function CodigoRecuperacao({ codigo, rotulo = "Continuar", onContinuar }: { codigo: string; rotulo?: string; onContinuar: () => void }) {
  const [copiado, setCopiado] = useState(false);
  const [guardei, setGuardei] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(codigo).catch(() => undefined);
    setCopiado(true);
  }

  return (
    <div className="codigo-recuperacao">
      <p className="codigo-recuperacao__titulo"><KeyRound size={18} aria-hidden /> Seu código de recuperação</p>
      <p className="codigo-recuperacao__codigo" aria-label={`Código de recuperação: ${codigo}`}>{codigo}</p>
      <Button onClick={copiar}>
        {copiado ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />} {copiado ? "Copiado" : "Copiar código"}
      </Button>
      <p className="pagina__subtitulo">
        Guarde este código num lugar seguro (um gerenciador de senhas, uma anotação, uma foto). Se esquecer a senha, é com ele que você
        escolhe uma nova. Ele aparece só agora; depois, dá para gerar outro em Configurações da conta.
      </p>
      <label className="checklist__item">
        <input type="checkbox" checked={guardei} onChange={(e) => setGuardei(e.target.checked)} />
        <span>Guardei o código.</span>
      </label>
      <Button variante="primario" onClick={onContinuar} disabled={!guardei}>{rotulo}</Button>
    </div>
  );
}
