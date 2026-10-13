// Ativar a interface de mestre numa conta de jogador. A de jogador continua: a conta faz as duas coisas.
import { Crown } from "lucide-react";
import { Navigate, useNavigate } from "react-router";
import { useAtivarMestre, useMe } from "../auth/AuthProvider";
import { Button } from "../components/ui/Button";
import { Loading } from "../components/ui/States";
import { mensagemDeErro } from "../lib/api";

export function AtivarMestrePage() {
  const me = useMe();
  const ativar = useAtivarMestre();
  const navigate = useNavigate();
  if (me.isPending) return <Loading />;
  if (me.data?.papel === "MESTRE") return <Navigate to="/mestre/grupos" replace />;

  return (
    <div className="pagina pagina--estreita">
      <div className="perfil-cabecalho">
        <Crown size={40} aria-hidden />
        <div>
          <h1>Quer mestrar?</h1>
          <p className="pagina__subtitulo">Sua conta continua jogando normalmente. A interface de mestre é carregada só se você ativar.</p>
        </div>
      </div>
      <div className="painel">
        <p>Com a interface de mestre você:</p>
        <ul className="lista-simples">
          <li>cria classes, raças, perícias, atributos, status, itens e criaturas do bestiário;</li>
          <li>cria grupos, recebe os jogadores pelo código e conduz a sessão (fichas, status, itens, criaturas);</li>
          <li>alterna entre Mestrar e Jogar no topo da tela, quando quiser.</li>
        </ul>
        <p className="pagina__subtitulo">Seu catálogo de mestre (perícias base) só é criado no primeiro acesso, para não ocupar espaço de quem nunca mestra.</p>
        {ativar.isError && <div className="aviso">{mensagemDeErro(ativar.error)}</div>}
        <div>
          <Button variante="primario" disabled={ativar.isPending} onClick={() => ativar.mutate(undefined, { onSuccess: () => navigate("/mestre/grupos") })}>
            <Crown size={16} aria-hidden /> {ativar.isPending ? "Ativando…" : "Ativar interface de mestre"}
          </Button>
        </div>
      </div>
    </div>
  );
}
