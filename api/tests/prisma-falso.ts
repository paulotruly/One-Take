// Prisma falso: um vi.fn por método. Arquivo separado (sem imports de src/)
// para o vi.mock não criar import circular.
import { vi } from "vitest";

const metodos = ["findUnique", "findFirst", "createMany", "deleteMany", "findUniqueOrThrow", "findMany", "create", "update", "delete", "upsert", "count", "aggregate", "updateMany"];
const modelo = () => Object.fromEntries(metodos.map((m) => [m, vi.fn()]));

export const prismaFalso = {
  perfil: modelo(),
  classe: modelo(),
  habilidade: modelo(),
  pericia: modelo(),
  classePericia: modelo(),
  raca: modelo(),
  racaPericia: modelo(),
  atributo: modelo(),
  grupo: modelo(),
  classeNoGrupo: modelo(),
  racaNoGrupo: modelo(),
  atributoNoGrupo: modelo(),
  periciaNoGrupo: modelo(),
  ficha: modelo(),
  fichaAtributo: modelo(),
  fichaPericia: modelo(),
  item: modelo(),
  status: modelo(),
  statusNoGrupo: modelo(),
  fichaStatus: modelo(),
  classeConceito: modelo(),
  habilidadeAprimoramento: modelo(),
  regraDaMesa: modelo(),
  racaConceito: modelo(),
  bestaConceito: modelo(),
  besta: modelo(),
  bestaPericia: modelo(),
  bestaAtributo: modelo(),
  criatura: modelo(),
  itemModelo: modelo(),
  categoriaItem: modelo(),
  $transaction: vi.fn(async (ops: unknown) => (Array.isArray(ops) ? Promise.all(ops) : ops)),
  $queryRaw: vi.fn(),
};
