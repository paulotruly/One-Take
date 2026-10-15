// Cargo ADMIN e conteúdo verificado.
// Não há conteúdo fixo: tudo tem dono e só o dono edita. O administrador (Perfil.cargo = ADMIN, trocado por `npm run cargo`)
// marca coisas dele como verificadas (principalmente kits): o que é verificado aparece para todo mestre, só leitura e sempre atualizado (quem quiser mudar duplica).
// Um KIT verificado leva tudo o que está nele: cada coisa ligada ao kit conta como verificada (sem precisar marcar uma a uma).
// Arquétipos verificados aparecem para todos; o de uma classe/raça/criatura verificada também (com só as variações visíveis).
import type { TipoKit } from "./kits.js";
import { getPrisma } from "./prisma.js";

/** Tudo o que o mestre cria pode ser verificado. */
export const TIPOS_VERIFICAVEIS = [
  "classe", "raca", "atributo", "pericia", "status", "categoriaItem", "itemModelo", "besta", "npc",
  "kit", "classeConceito", "racaConceito", "bestaConceito", "categoriaStatus",
] as const;
export type TipoVerificavel = (typeof TIPOS_VERIFICAVEIS)[number];

const TIPOS_COM_KIT: readonly string[] = ["classe", "raca", "atributo", "pericia", "status", "itemModelo", "besta", "npc"] satisfies TipoKit[];

export async function ehAdmin(usuarioId: string) {
  const p = await getPrisma().perfil.findUnique({ where: { id: usuarioId }, select: { cargo: true } });
  return p?.cargo === "ADMIN";
}

/** true se a pessoa escolheu esconder da interface o conteúdo verificado de outras pessoas. */
export async function ocultaVerificados(usuarioId: string) {
  const p = await getPrisma().perfil.findUnique({ where: { id: usuarioId }, select: { ocultarVerificados: true } });
  return !!p?.ocultarVerificados;
}

type Verif = { verificado: true } | { kits: { some: { kit: { verificado: true } } } };
const verifs = (comKits: boolean): Verif[] =>
  comKits ? [{ verificado: true }, { kits: { some: { kit: { verificado: true } } } }] : [{ verificado: true }];

/** Filtro Prisma "é verificado": selo próprio ou (com `comKits`) está num kit verificado. */
export const ehVerificado = (comKits = true) => ({ OR: verifs(comKits) });

/**
 * Filtro Prisma das listas: dele + verificado (a menos que a pessoa oculte os verificados).
 * `comKits: false` para o que não entra em kit (categorias de item).
 */
export async function visivelPara(usuarioId: string, { comKits = true } = {}): Promise<{ OR: ({ donoId: string } | Verif)[] }> {
  const v = (await ocultaVerificados(usuarioId)) ? [] : verifs(comKits);
  return { OR: [{ donoId: usuarioId }, ...v] };
}

const LIGACOES: Record<TipoKit, (id: string) => Promise<number>> = {
  classe: (id) => getPrisma().kitClasse.count({ where: { classeId: id, kit: { verificado: true } } }),
  raca: (id) => getPrisma().kitRaca.count({ where: { racaId: id, kit: { verificado: true } } }),
  atributo: (id) => getPrisma().kitAtributo.count({ where: { atributoId: id, kit: { verificado: true } } }),
  pericia: (id) => getPrisma().kitPericia.count({ where: { periciaId: id, kit: { verificado: true } } }),
  status: (id) => getPrisma().kitStatus.count({ where: { statusId: id, kit: { verificado: true } } }),
  itemModelo: (id) => getPrisma().kitItemModelo.count({ where: { itemModeloId: id, kit: { verificado: true } } }),
  besta: (id) => getPrisma().kitBesta.count({ where: { bestaId: id, kit: { verificado: true } } }),
  npc: (id) => getPrisma().kitNpc.count({ where: { npcId: id, kit: { verificado: true } } }),
};

type Registro = { id: string; donoId: string | null; verificado?: boolean };

/**
 * O mestre pode ver/usar: é dele, é verificado ou está num kit verificado.
 * Ocultar os verificados só tira das listas: o que já está em uso (num grupo, numa ficha) continua funcionando.
 */
export async function podeUsar(tipo: TipoVerificavel, obj: Registro, usuarioId: string) {
  if (obj.donoId === usuarioId) return true;
  if (obj.verificado) return true;
  return TIPOS_COM_KIT.includes(tipo) && (await LIGACOES[tipo as TipoKit](obj.id)) > 0;
}

export type Quem = { usuarioId: string; admin: boolean; kitsVerificados: Set<string> };

export async function quemVe(usuarioId: string): Promise<Quem> {
  const [admin, kits] = await Promise.all([ehAdmin(usuarioId), getPrisma().kit.findMany({ where: { verificado: true }, select: { id: true } })]);
  return { usuarioId, admin, kitsVerificados: new Set((kits ?? []).map((k) => k.id)) };
}

/**
 * Como o registro aparece para quem vê: `editavel` (é dele), `verificado` (selo próprio ou por kit),
 * `seloProprio`, `verificadoPorKit`, `deOutro` (de outra pessoa: só leitura) e `podeVerificar` (admin e dono).
 */
export function visao(obj: { donoId: string | null; verificado?: boolean; kits?: { kitId: string }[] }, q: Quem) {
  const meu = obj.donoId === q.usuarioId;
  const porKit = !!obj.kits?.some((k) => q.kitsVerificados.has(k.kitId));
  return {
    editavel: meu,
    verificado: !!obj.verificado || porKit,
    seloProprio: !!obj.verificado,
    verificadoPorKit: porKit,
    deOutro: !meu,
    podeVerificar: meu && q.admin,
  };
}

/** Kits que quem vê enxerga: todos, se é o dono; senão, só os verificados (para o kit ativo funcionar com o kit de outra pessoa). */
export function kitIdsPara(obj: { donoId: string | null; kits?: { kitId: string }[] }, q: Quem) {
  const ids = (obj.kits ?? []).map((k) => k.kitId);
  return obj.donoId === q.usuarioId ? ids : ids.filter((id) => q.kitsVerificados.has(id));
}

/** Campos de visão + kits visíveis para quem vê. */
export function comVisao<T extends { donoId: string | null; verificado?: boolean; kits?: { kitId: string }[] }>(obj: T, q: Quem) {
  const v = visao(obj, q);
  const { kits, ...resto } = obj;
  return { ...resto, ...v, ...(kits && { kitIds: kitIdsPara(obj, q) }) };
}
