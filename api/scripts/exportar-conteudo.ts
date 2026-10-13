// Exporta classes e bestas (com cartas, aprimoramentos, perícias e atributos) em JSON, para o balanceamento
// (skill .claude/skills/balancear). Só leitura.
// Uso:
//   npm run exportar -- > conteudo.json                 (tudo)
//   npm run exportar -- --titulo Espadachim             (filtra classes/bestas pelo título)
import "dotenv/config";
import { criarPrisma } from "../src/lib/prisma.js";

async function main() {
  const args = process.argv.slice(2);
  const i = args.indexOf("--titulo");
  const titulo = i >= 0 ? args.slice(i + 1).join(" ") : undefined;
  const filtro = titulo ? { titulo: { contains: titulo, mode: "insensitive" as const } } : {};
  const prisma = criarPrisma(process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "");
  try {
    const cartas = { orderBy: { ordem: "asc" as const }, include: { aprimoramentos: { orderBy: { nivel: "asc" as const } } } };
    const classes = await prisma.classe.findMany({
      where: filtro,
      orderBy: { titulo: "asc" },
      include: { habilidades: cartas, pericias: { include: { pericia: { include: { atributo: true } } } }, dono: { select: { nickname: true } } },
    });
    const bestas = await prisma.besta.findMany({
      where: filtro,
      orderBy: { titulo: "asc" },
      include: {
        habilidades: cartas,
        pericias: { include: { pericia: { include: { atributo: true } } } },
        atributos: { include: { atributo: true } },
        dono: { select: { nickname: true } },
      },
    });
    const carta = (h: (typeof classes)[number]["habilidades"][number]) => ({
      titulo: h.titulo, tipoEfeito: h.tipoEfeito, efeito: h.descricaoEfeito, condicao: h.condicao, limite: h.limite,
      nivelNecessario: h.nivelNecessario, custoMana: h.custoMana,
      aprimoramentos: h.aprimoramentos.map((a) => ({ nivel: a.nivel, efeito: a.descricaoEfeito, custoMana: a.custoMana, limite: a.limite, condicao: a.condicao })),
    });
    const saida = {
      classes: classes.map((c) => ({
        titulo: c.titulo, grupo: c.grupo, fixa: c.donoId === null, dono: c.dono?.nickname ?? null,
        vida: c.pontosVida, mana: c.pontosMana, esforco: c.pontosEsforco,
        pericias: c.pericias.map((p) => ({ nome: p.pericia.nome, atributo: p.pericia.atributo.nome, modificador: p.modificador })),
        cartas: c.habilidades.map(carta),
      })),
      bestas: bestas.map((b) => ({
        titulo: b.titulo, dono: b.dono.nickname, vida: b.pontosVida, mana: b.pontosMana, esforco: b.pontosEsforco, deslocamento: b.deslocamento,
        atributos: b.atributos.map((a) => ({ nome: a.atributo.nome, dados: a.dados })),
        pericias: b.pericias.map((p) => ({ nome: p.pericia.nome, atributo: p.pericia.atributo.nome, modificador: p.modificador })),
        cartas: b.habilidades.map(carta),
      })),
    };
    console.log(JSON.stringify(saida, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
