import { createBrowserRouter, Navigate } from "react-router";
import { RedirecionarPorPapel, RequirePapel } from "./auth/guards";
import { ClasseDetalhePage } from "./features/classes/pages/ClasseDetalhePage";
import { EditarClassePage, NovaClassePage } from "./features/classes/pages/ClasseFormPage";
import { GaleriaPage } from "./features/classes/pages/GaleriaPage";
import { DocsPage } from "./features/docs/DocsLayout";
import { HabilidadesPage } from "./features/classes/pages/HabilidadesPage";
import { EntrarGrupoPage } from "./features/fichas/pages/EntrarGrupoPage";
import { FichaPage } from "./features/fichas/pages/FichaPage";
import { MinhasFichasPage } from "./features/fichas/pages/MinhasFichasPage";
import { GrupoDetalhePage } from "./features/grupos/pages/GrupoDetalhePage";
import { EditarGrupoPage, NovoGrupoPage } from "./features/grupos/pages/GrupoFormPage";
import { GruposPage } from "./features/grupos/pages/GruposPage";
import { PericiasPage } from "./features/pericias/pages/PericiasPage";
import { RacaDetalhePage } from "./features/racas/pages/RacaDetalhePage";
import { RacasPage } from "./features/racas/pages/RacasPage";
import { StatusPage } from "./features/status/pages/StatusPage";
import { BestaDetalhePage } from "./features/bestiario/pages/BestaDetalhePage";
import { EditarBestaPage, NovaBestaPage } from "./features/bestiario/pages/BestaFormPage";
import { BestiarioPage } from "./features/bestiario/pages/BestiarioPage";
import { CatalogoItensPage } from "./features/itens/pages/CatalogoItensPage";
import { NpcDetalhePage } from "./features/npcs/pages/NpcDetalhePage";
import { EditarNpcPage, NovoNpcPage } from "./features/npcs/pages/NpcFormPage";
import { NpcsPage } from "./features/npcs/pages/NpcsPage";
import { AppLayout } from "./layouts/AppLayout";
import { AtivarMestrePage } from "./pages/AtivarMestrePage";
import { PublicLayout } from "./layouts/PublicLayout";
import { CadastroPage } from "./pages/CadastroPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PerfilPage } from "./pages/PerfilPage";
import { NotFoundPage } from "./pages/SimplesPages";

export const router = createBrowserRouter([
  // Público
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/docs", element: <DocsPage /> },
      { path: "/docs/:slug", element: <DocsPage /> },
      { path: "/guia-do-mestre", element: <Navigate to="/docs/mestre-visao-geral" replace /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/cadastro", element: <CadastroPage /> },
  /** Depois do login: volta à interface usada por último (mestre ou jogador). */
  { path: "/area", element: <RedirecionarPorPapel /> },

  // Qualquer usuário logado
  {
    element: <RequirePapel />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/perfil", element: <PerfilPage /> },
          { path: "/ativar-mestre", element: <AtivarMestrePage /> },
        ],
      },
    ],
  },

  // Mestre
  {
    element: <RequirePapel papel="MESTRE" />,
    children: [
      {
        path: "/mestre",
        element: <AppLayout />,
        children: [
          { index: true, element: <GaleriaPage /> },
          { path: "classes/nova", element: <NovaClassePage /> },
          { path: "classes/:id", element: <ClasseDetalhePage /> },
          { path: "classes/:id/editar", element: <EditarClassePage /> },
          { path: "classes/:id/habilidades", element: <HabilidadesPage /> },
          { path: "racas", element: <RacasPage /> },
          { path: "racas/:id", element: <RacaDetalhePage /> },
          { path: "bestiario", element: <BestiarioPage /> },
          { path: "bestiario/novo", element: <NovaBestaPage /> },
          { path: "bestiario/:id", element: <BestaDetalhePage /> },
          { path: "bestiario/:id/editar", element: <EditarBestaPage /> },
          { path: "itens", element: <CatalogoItensPage /> },
          { path: "npcs", element: <NpcsPage /> },
          { path: "npcs/novo", element: <NovoNpcPage /> },
          { path: "npcs/:id", element: <NpcDetalhePage /> },
          { path: "npcs/:id/editar", element: <EditarNpcPage /> },
          { path: "pericias", element: <PericiasPage /> },
          { path: "status", element: <StatusPage /> },
          { path: "grupos", element: <GruposPage /> },
          { path: "grupos/novo", element: <NovoGrupoPage /> },
          { path: "grupos/:id", element: <GrupoDetalhePage /> },
          { path: "grupos/:id/editar", element: <EditarGrupoPage /> },
          { path: "fichas/:id", element: <FichaPage /> },
        ],
      },
    ],
  },

  // Jogador: toda conta joga (inclusive quem também é mestre, nos grupos de outros mestres)
  {
    element: <RequirePapel />,
    children: [
      {
        path: "/jogador",
        element: <AppLayout />,
        children: [
          { index: true, element: <MinhasFichasPage /> },
          { path: "entrar/:codigo", element: <EntrarGrupoPage /> },
          { path: "fichas/:id", element: <FichaPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
