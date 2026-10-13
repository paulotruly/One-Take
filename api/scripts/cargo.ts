// Uso: npm run cargo -- paulo ADMIN     (cargo de administrador do sistema para @paulo)
//      npm run cargo -- paulo USUARIO   (volta a ser usuário comum)
// O cargo fica no banco (Perfil.cargo), nunca no código. O ADMIN edita as coisas fixas do sistema (atributos, status manuais,
// categorias de item, classes fixas) e marca coisas dele como verificadas (todo mestre vê e usa, só leitura).
import "dotenv/config";
import { Cargo } from "../src/generated/prisma/client.js";
import { normalizarNickname } from "../src/lib/nickname.js";
import { criarPrisma } from "../src/lib/prisma.js";

const [nick, cargoArg = "ADMIN"] = process.argv.slice(2);
const cargo = cargoArg.toUpperCase() as Cargo;
if (!nick || !Object.values(Cargo).includes(cargo)) {
  console.error(`Uso: npm run cargo -- <nome de usuário> [${Object.values(Cargo).join(" | ")}]`);
  process.exit(1);
}
const prisma = criarPrisma(process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "");
try {
  const p = await prisma.perfil.update({ where: { nickname: normalizarNickname(nick) }, data: { cargo }, select: { nickname: true } });
  console.log(`@${p.nickname}: cargo ${cargo}.`);
} catch {
  console.error(`Não achei @${normalizarNickname(nick)}.`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
