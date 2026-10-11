// Perícias base do sistema. O seed grava estas linhas com donoId nulo; cada mestre
// recebe uma cópia editável delas no primeiro acesso (ver garantirCatalogo).
import type { CategoriaPericia } from "../src/generated/prisma/enums.js";

/** Atributos fixos do sistema (mesmos ids da migration `atributos`). */
export const ATRIBUTOS_FIXOS = {
  fisica: { id: "00000000-0000-4000-8002-000000000001", nome: "Capacidade física", descricao: "Utilizada sempre que o corpo é levado ao limite.", ordem: 1 },
  carisma: { id: "00000000-0000-4000-8002-000000000002", nome: "Carisma", descricao: "A presença do personagem e sua capacidade de lidar com outras pessoas.", ordem: 2 },
  conhecimento: { id: "00000000-0000-4000-8002-000000000003", nome: "Conhecimento", descricao: "O intelecto e a sensibilidade do personagem diante do mundo.", ordem: 3 },
} as const;

const FIS = ATRIBUTOS_FIXOS.fisica.id;
const CAR = ATRIBUTOS_FIXOS.carisma.id;
const CON = ATRIBUTOS_FIXOS.conhecimento.id;

type PericiaBase = { id: string; nome: string; descricao: string; categoria: CategoriaPericia; atributoId: string };

const id = (n: number) => `00000000-0000-4000-8001-${String(n).padStart(12, "0")}`;

export const PERICIAS_BASE: PericiaBase[] = [
  // Capacidade física
  { id: id(1), atributoId: FIS, categoria: "FISICO", nome: "Atletismo", descricao: "Força e fôlego em ações físicas intensas." },
  { id: id(2), atributoId: FIS, categoria: "FISICO", nome: "Acrobacia", descricao: "Agilidade, equilíbrio e movimentos precisos." },
  { id: id(3), atributoId: FIS, categoria: "FISICO", nome: "Iniciativa", descricao: "Capacidade de agir primeiro em uma situação ou confronto." },
  { id: id(4), atributoId: FIS, categoria: "FISICO", nome: "Furtividade", descricao: "Capacidade de se mover e agir sem ser percebido, evitando ruídos e rastros." },
  { id: id(5), atributoId: FIS, categoria: "CORPO_A_CORPO", nome: "Luta", descricao: "Habilidade em combate corpo a corpo." },
  { id: id(6), atributoId: FIS, categoria: "PONTARIA", nome: "Pontaria", descricao: "Precisão com armas e ataques à distância." },
  { id: id(7), atributoId: FIS, categoria: "DEFESA", nome: "Reflexos", descricao: "Capacidade de reagir e desviar rapidamente." },
  { id: id(8), atributoId: FIS, categoria: "DEFESA", nome: "Resistência", descricao: "Suportar dor, cansaço e dano físico." },
  // Carisma e Conhecimento
  { id: id(9), atributoId: CAR, categoria: "SOCIAL", nome: "Diplomacia", descricao: "Capacidade de negociar, convencer e manter acordos." },
  { id: id(10), atributoId: CAR, categoria: "SOCIAL", nome: "Enganação", descricao: "Aptidão para mentir, disfarçar e manipular informações." },
  { id: id(11), atributoId: CAR, categoria: "SOCIAL", nome: "Intimidação", descricao: "Uso de ameaça, presença ou medo para impor autoridade." },
  { id: id(12), atributoId: CON, categoria: "PERCEPCAO", nome: "Intuição", descricao: "Compreensão instintiva de flancos, emboscadas e ataques fora do campo de visão." },
  { id: id(13), atributoId: CON, categoria: "PERCEPCAO", nome: "Percepção", descricao: "Atenção aos detalhes e ao ambiente ao redor." },
  { id: id(14), atributoId: CAR, categoria: "DEFESA", nome: "Vontade", descricao: "Força mental para resistir a medo, controle e corrupção." },
  { id: id(15), atributoId: CON, categoria: "CONHECIMENTO", nome: "Religião", descricao: "Conhecimento sobre crenças, rituais e entidades espirituais." },
  { id: id(16), atributoId: CON, categoria: "CONHECIMENTO", nome: "Adestramento", descricao: "Habilidade para treinar, comandar e lidar com criaturas ou animais." },
  { id: id(17), atributoId: CON, categoria: "CONHECIMENTO", nome: "Sobrevivência", descricao: "Habilidade de resistir e se adaptar a ambientes hostis." },
  { id: id(18), atributoId: CON, categoria: "MAGIA", nome: "Domínio", descricao: "Capacidade de usar e sustentar magia." },
];

/** Id da perícia base pelo nome (usado no seed das classes fixas). */
export function periciaBase(nome: string) {
  const p = PERICIAS_BASE.find((x) => x.nome === nome);
  if (!p) throw new Error(`Perícia base inexistente: ${nome}`);
  return p.id;
}
