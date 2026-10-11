import { Navigate, Outlet, useLocation } from "react-router";
import { ErrorState, Loading } from "../components/ui/States";
import { mensagemDeErro } from "../lib/api";
import { useAuth, useMe, type Papel } from "./AuthProvider";

/** Exige sessão; com `papel`, exige também esse papel (jogador vai para /jogador, mestre para /mestre). */
export function RequirePapel({ papel }: { papel?: Papel }) {
  const { session } = useAuth();
  const me = useMe();
  const location = useLocation();

  if (session === undefined) return <Loading texto="Verificando sessão…" />;
  if (!session) return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  if (me.isPending) return <Loading texto="Carregando perfil…" />;
  if (me.isError) return <ErrorState mensagem={mensagemDeErro(me.error)} onTentarNovamente={() => me.refetch()} />;
  if (papel && me.data.papel !== papel) {
    return <Navigate to={me.data.papel === "MESTRE" ? "/mestre" : "/jogador"} replace />;
  }
  return <Outlet />;
}

/** Página inicial: manda cada um para sua área. */
export function RedirecionarPorPapel() {
  const { session } = useAuth();
  const me = useMe();
  if (session === undefined) return <Loading />;
  if (!session) return <Navigate to="/login" replace />;
  if (me.isPending) return <Loading />;
  if (me.isError) return <ErrorState mensagem={mensagemDeErro(me.error)} onTentarNovamente={() => me.refetch()} />;
  return <Navigate to={me.data.papel === "MESTRE" ? "/mestre" : "/jogador"} replace />;
}
