// Configurações da conta (separadas do perfil público): código de recuperação, dados da conta e exclusão.
import { useMe } from "../../../auth/AuthProvider";
import { ErrorState, Loading } from "../../../components/ui/States";
import { mensagemDeErro } from "../../../lib/api";
import { SecaoDados, SecaoExcluirConta, SecaoRecuperacao } from "./SecoesDaConta";

export function ConfiguracoesContaPage() {
  const me = useMe();
  if (me.isPending) return <Loading texto="Carregando conta…" />;
  if (me.isError) return <ErrorState mensagem={mensagemDeErro(me.error)} onTentarNovamente={() => me.refetch()} />;
  return (
    <div className="pagina pagina--estreita">
      <div>
        <h1>Configurações da conta</h1>
        <p className="pagina__subtitulo">Recuperação de senha, seus dados e acesso da conta. Nada daqui aparece para outras pessoas.</p>
      </div>
      <SecaoRecuperacao me={me.data} />
      <SecaoDados me={me.data} />
      <SecaoExcluirConta me={me.data} />
    </div>
  );
}
