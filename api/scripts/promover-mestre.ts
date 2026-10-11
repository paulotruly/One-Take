// Uso: npm run promover -- email@exemplo.com [MESTRE|JOGADOR]
// O usuário precisa existir no Supabase Auth (Authentication > Users).
// Se ainda não tiver Perfil (nunca acessou a API), o perfil é criado aqui.
import "dotenv/config";
import { nicknameDoEmail } from "../src/lib/nickname.js";
import { criarPrisma } from "../src/lib/prisma.js";

async function main() {
  const [emailArg, papelArg] = process.argv.slice(2);
  if (!emailArg) {
    console.error("Uso: npm run promover -- email@exemplo.com [MESTRE|JOGADOR]");
    process.exit(1);
  }
  const email = emailArg.toLowerCase();
  const papel = papelArg === "JOGADOR" ? "JOGADOR" : "MESTRE";
  const prisma = criarPrisma(process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "");

  try {
    const usuarios = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id::text FROM auth.users WHERE lower(email) = ${email} LIMIT 1`;
    const usuario = usuarios[0];
    if (!usuario) {
      console.error(`Usuário ${email} não existe no Supabase Auth. Crie em Authentication > Users.`);
      process.exitCode = 1;
      return;
    }
    await prisma.perfil.upsert({
      where: { id: usuario.id },
      create: { id: usuario.id, email, papel, nickname: nicknameDoEmail(email) },
      update: { papel },
    });
    console.log(`ok: ${email} agora é ${papel}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
