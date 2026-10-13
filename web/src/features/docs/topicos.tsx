// Índice da documentação: seções da navegação lateral e seus tópicos (cada tópico = uma página /docs/:slug).
import { BookText, Crown, Dices, Rocket, User, type LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import * as jogo from "./conteudo/jogo";
import * as mestre from "./conteudo/mestre";

type Topico = { slug: string; titulo: string; resumo?: string; Conteudo: ComponentType };
type Secao = { titulo: string; Icone: LucideIcon; topicos: Topico[] };

export const SECOES: Secao[] = [
  {
    titulo: "Começando",
    Icone: Rocket,
    topicos: [
      { slug: "introducao", titulo: "O que é o One-Take", resumo: "Um RPG de mesa para uma sessão só, com personagens prontos.", Conteudo: jogo.Introducao },
      { slug: "como-funciona", titulo: "Como funciona uma aventura", resumo: "Do código de entrada ao nível novo, em cinco passos.", Conteudo: jogo.ComoFunciona },
      { slug: "contas", titulo: "Contas: jogar e mestrar", resumo: "Uma conta, duas interfaces, e o perfil.", Conteudo: jogo.Contas },
    ],
  },
  {
    titulo: "Regras do jogo",
    Icone: Dices,
    topicos: [
      { slug: "ficha", titulo: "A ficha do personagem", resumo: "As partes que formam um personagem.", Conteudo: jogo.Ficha },
      { slug: "classes", titulo: "Classes", resumo: "O herói pronto que o jogador escolhe.", Conteudo: jogo.Classes },
      { slug: "racas", titulo: "Raças", resumo: "Deslocamento e perícias de base.", Conteudo: jogo.Racas },
      { slug: "recursos", titulo: "Vida, mana e esforço", resumo: "Os três recursos do personagem e o que acontece quando zeram.", Conteudo: jogo.Recursos },
      { slug: "status", titulo: "Status", resumo: "Condições e emoções que ajudam ou atrapalham o personagem.", Conteudo: jogo.StatusTopico },
      { slug: "atributos", titulo: "Atributos", resumo: "As capacidades gerais e os pontos (d20) da ficha.", Conteudo: jogo.Atributos },
      { slug: "testes", titulo: "Testes, DT e esforço", resumo: "Como o mestre guia uma ação e os dados decidem o resultado.", Conteudo: jogo.Testes },
      { slug: "pericias", titulo: "Perícias", resumo: "No que o personagem é bom e de onde vêm os pontos.", Conteudo: jogo.Pericias },
      { slug: "habilidades", titulo: "Habilidades (cartas)", resumo: "A cartela de cada classe.", Conteudo: jogo.Habilidades },
      { slug: "progressao", titulo: "Progressão de nível", resumo: "O que o personagem ganha a cada nível.", Conteudo: jogo.Progressao },
      { slug: "inventario", titulo: "Inventário e itens", resumo: "Espaços, categorias, usos e pré-requisitos.", Conteudo: jogo.Inventario },
      { slug: "criaturas", titulo: "Criaturas", resumo: "Inimigos e criaturas do bestiário.", Conteudo: jogo.Criaturas },
      { slug: "grupos", titulo: "Grupos", resumo: "O RPG do mestre e o código de entrada.", Conteudo: jogo.Grupos },
    ],
  },
  {
    titulo: "Guia do mestre",
    Icone: Crown,
    topicos: [
      { slug: "mestre-visao-geral", titulo: "Visão geral", resumo: "O que o mestre faz no app.", Conteudo: mestre.MestreVisaoGeral },
      { slug: "mestre-primeira-sessao", titulo: "Primeira sessão, passo a passo", resumo: "Da conta até subir o nível no fim.", Conteudo: mestre.MestrePrimeiraSessao },
      { slug: "mestre-catalogo", titulo: "Perícias e atributos", resumo: "Seu catálogo próprio.", Conteudo: mestre.MestreCatalogo },
      { slug: "mestre-racas", titulo: "Criando raças", Conteudo: mestre.MestreRacas },
      { slug: "mestre-classes", titulo: "Criando classes e cartas", Conteudo: mestre.MestreClasses },
      { slug: "mestre-npcs", titulo: "NPCs", resumo: "Personagens do mestre com ficha e inventário.", Conteudo: mestre.MestreNpcs },
      { slug: "mestre-bestiario", titulo: "Bestiário", resumo: "Criando criaturas para invocar nos grupos.", Conteudo: mestre.MestreBestiario },
      { slug: "mestre-itens", titulo: "Itens", resumo: "O catálogo de itens e como lançar.", Conteudo: mestre.MestreItens },
      { slug: "mestre-kits", titulo: "Kits de RPG", resumo: "Organizar classes, raças, perícias, status, itens, criaturas e NPCs por aventura.", Conteudo: mestre.MestreKits },
      { slug: "mestre-grupos", titulo: "Montando um grupo", Conteudo: mestre.MestreGrupos },
      { slug: "mestre-sessao", titulo: "Durante a sessão", resumo: "Testes, fichas, itens e criaturas.", Conteudo: mestre.MestreSessao },
      { slug: "mestre-status", titulo: "Status na sessão", resumo: "Catálogo, status do grupo e aplicar nas fichas.", Conteudo: mestre.MestreStatus },
      { slug: "mestre-subir-nivel", titulo: "Subir de nível", resumo: "O que acontece no fim da sessão.", Conteudo: mestre.MestreSubirNivel },
      { slug: "mestre-protecoes", titulo: "O que não dá para excluir", resumo: "Proteções para não quebrar fichas.", Conteudo: mestre.MestreProtecoes },
      { slug: "mestre-temas", titulo: "Adaptando para outros temas", Conteudo: mestre.MestreTemas },
    ],
  },
  {
    titulo: "Guia do jogador",
    Icone: User,
    topicos: [
      { slug: "jogador-entrar", titulo: "Entrando num grupo", resumo: "Do cadastro até a ficha pronta.", Conteudo: mestre.JogadorEntrar },
      { slug: "jogador-ficha", titulo: "Usando a ficha", resumo: "O que dá para fazer durante a sessão.", Conteudo: mestre.JogadorFicha },
    ],
  },
  {
    titulo: "Referência",
    Icone: BookText,
    topicos: [
      { slug: "glossario", titulo: "Glossário", Conteudo: mestre.Glossario },
      { slug: "limitacoes", titulo: "O que ainda não existe", resumo: "Para não procurar o que ainda não está lá.", Conteudo: mestre.Limitacoes },
    ],
  },
];

export const TODOS = SECOES.flatMap((s) => s.topicos.map((t) => ({ ...t, secao: s.titulo })));
