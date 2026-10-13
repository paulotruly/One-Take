// Torna uma classe de um mestre em classe FIXA do sistema (todo mestre vê, ninguém edita), ou devolve a um mestre.
// Uso:
//   npm run fixar-classe -- "Espadachim"              (por título ou id)
//   npm run fixar-classe -- "Espadachim" --devolver paulo   (volta a ser do @paulo, editável)
// Classes fixas usam as perícias BASE do sistema: cada perícia da classe é trocada pela base de origem.
// Perícia criada pelo mestre (sem base equivalente) impede a troca. Status próprios do mestre saem das cartas.
import "dotenv/config";
import { criarPrisma } from "../src/lib/prisma.js";

async function main() {
  const args = process.argv.slice(2);
  const i = args.indexOf("--devolver");
  const devolverPara = i >= 0 ? args[i + 1]?.replace(/^@/, "").toLowerCase() : undefined;
  const alvo = args.filter((_, j) => j !== i && j !== i + 1).join(" ").trim();
  if (!alvo || (i >= 0 && !devolverPara)) {
    console.error('Uso: npm run fixar-classe -- "Título ou id" [--devolver nickname]');
    process.exit(1);
  }
  const prisma = criarPrisma(process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "");
  try {
    const porId = /^[0-9a-f-]{36}$/i.test(alvo);
    const classes = await prisma.classe.findMany({
      where: porId ? { id: alvo } : { titulo: { equals: alvo, mode: "insensitive" } },
      include: { pericias: { include: { pericia: true } }, habilidades: { include: { status: true, aprimoramentos: { include: { status: true } } } } },
    });
    if (classes.length !== 1) {
      console.error(classes.length === 0 ? `Nenhuma classe "${alvo}".` : `Há ${classes.length} classes "${alvo}"; use o id.`);
      process.exitCode = 1;
      return;
    }
    const c = classes[0]!;

    if (devolverPara) {
      const dono = await prisma.perfil.findUnique({ where: { nickname: devolverPara } });
      if (!dono) throw new Error(`@${devolverPara} não existe.`);
      if (c.donoId !== null) throw new Error(`${c.titulo} não é fixa.`);
      // Perícias base voltam a apontar para as cópias do catálogo do mestre (mesma origem).
      for (const cp of c.pericias) {
        const copia = await prisma.pericia.findFirst({ where: { donoId: dono.id, OR: [{ origemId: cp.periciaId }, { nome: cp.pericia.nome }] } });
        if (!copia) throw new Error(`@${devolverPara} não tem a perícia ${cp.pericia.nome} no catálogo.`);
        await prisma.classePericia.delete({ where: { classeId_periciaId: { classeId: c.id, periciaId: cp.periciaId } } });
        await prisma.classePericia.create({ data: { classeId: c.id, periciaId: copia.id, modificador: cp.modificador } });
      }
      await prisma.classe.update({ where: { id: c.id }, data: { donoId: dono.id } });
      console.log(`ok: ${c.titulo} voltou a ser de @${devolverPara} (editável).`);
      return;
    }

    if (c.donoId === null) {
      console.log(`${c.titulo} já é fixa.`);
      return;
    }
    const semBase = c.pericias.filter((cp) => cp.pericia.donoId !== null && !cp.pericia.origemId);
    if (semBase.length > 0) {
      throw new Error(`Perícias sem equivalente no sistema: ${semBase.map((cp) => cp.pericia.nome).join(", ")}. Tire-as da classe antes.`);
    }
    await prisma.$transaction(async (tx) => {
      for (const cp of c.pericias) {
        if (cp.pericia.donoId === null) continue;
        await tx.classePericia.delete({ where: { classeId_periciaId: { classeId: c.id, periciaId: cp.periciaId } } });
        await tx.classePericia.create({ data: { classeId: c.id, periciaId: cp.pericia.origemId!, modificador: cp.modificador } });
      }
      // Status do mestre não existem para os outros: as cartas da classe fixa só ativam status do sistema.
      const statusDoMestre = c.habilidades.filter((h) => h.status && h.status.donoId !== null).map((h) => h.id);
      if (statusDoMestre.length) await tx.habilidade.updateMany({ where: { id: { in: statusDoMestre } }, data: { statusId: null } });
      const aprimDoMestre = c.habilidades.flatMap((h) => h.aprimoramentos).filter((a) => a.status && a.status.donoId !== null).map((a) => a.id);
      if (aprimDoMestre.length) await tx.habilidadeAprimoramento.updateMany({ where: { id: { in: aprimDoMestre } }, data: { statusId: null } });
      // Fixa não tem dono, conceito do mestre nem exclusividade de grupo.
      await tx.classe.update({ where: { id: c.id }, data: { donoId: null, conceitoId: null, grupoExclusivoId: null } });
    });
    console.log(`ok: ${c.titulo} agora é classe fixa do sistema (${c.habilidades.length} cartas, ${c.pericias.length} perícias).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
