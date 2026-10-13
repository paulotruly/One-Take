import { Navigate, Outlet, useLocation } from "react-router";
import { ErrorState, Loading } from "../components/ui/States";
import { mensagemDeErro } from "../lib/api";
import { interfaceLembrada, useAuth, useMe, type Papel } from "./AuthProvider";

/**
 * Exige sessão. Toda conta joga; `papel="MESTRE"` exige a interface de mestre ativada
 * (quem não ativou vai para a tela de ativar).
 */
export function RequirePapel({ papel }: { papel?: Papel }) {
  const { session } = useAuth();
  const me = useMe();
  const location = useLocation();

  if (session === undefined) return <Loading texto="Verificando sessão…" />;
  if (!session) return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  if (me.isPending) return <Loading texto="Carregando perfil…" />;
  if (me.isError) return <ErrorState mensagem={mensagemDeErro(me.error)} onTentarNovamente={() => me.refetch()} />;
  if (papel === "MESTRE" && me.data.papel !== "MESTRE") return <Navigate to="/ativar-mestre" replace />;
  return <Outlet />;
}

/** Depois do login: volta à interface usada por último (mestre só se estiver ativada). */
export function RedirecionarPorPapel() {
  const { session } = useAuth();
  const me = useMe();
  if (session === undefined) return <Loading />;
  if (!session) return <Navigate to="/login" replace />;
  if (me.isPending) return <Loading />;
  if (me.isError) return <ErrorState mensagem={mensagemDeErro(me.error)} onTentarNovamente={() => me.refetch()} />;
  const mestre = me.data.papel === "MESTRE" && interfaceLembrada() !== "JOGADOR";
  return <Navigate to={mestre ? "/mestre/grupos" : "/jogador"} replace />;
}
