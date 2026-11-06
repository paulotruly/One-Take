// Perfil e conta: perfil público, senha, recuperação, preferências, dados e exclusão.
import { useMe } from "../../../auth/AuthProvider";
import { ErrorState, Loading } from "../../../components/ui/States";
import { mensagemDeErro } from "../../../lib/api";
import { SecaoPerfil } from "./SecaoPerfil";
import { SecaoPreferencias, SecaoSenha } from "./SecaoPreferencias";
import { SecaoAtivarMestre, SecaoDados, SecaoExcluirConta, SecaoRecuperacao, SecaoVerificados } from "./SecoesDaConta";

export function ConfiguracoesContaPage() {
  const me = useMe();
  if (me.isPending) return <Loading texto="Carregando conta…" />;
  if (me.isError) return <ErrorState mensagem={mensagemDeErro(me.error)} onTentarNovamente={() => me.refetch()} />;
  return (
    <div className="pagina pagina--estreita">
      <div>
        <h1>Perfil e conta</h1>
        <p className="pagina__subtitulo">Só o nome de usuário, o nome e a foto aparecem para outras pessoas.</p>
      </div>
      <SecaoPerfil me={me.data} />
      <SecaoSenha />
      <SecaoRecuperacao me={me.data} />
      <SecaoPreferencias ehMestre={me.data.papel === "MESTRE"} />
      {me.data.papel === "MESTRE" ? <SecaoVerificados me={me.data} /> : <SecaoAtivarMestre />}
      <SecaoDados me={me.data} />
      <SecaoExcluirConta me={me.data} />
    </div>
  );
}
