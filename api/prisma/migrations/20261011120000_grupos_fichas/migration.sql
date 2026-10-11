-- AlterTable
ALTER TABLE "Atributo" ADD COLUMN     "grupoExclusivoId" UUID;

-- AlterTable
ALTER TABLE "Classe" ADD COLUMN     "grupoExclusivoId" UUID;

-- AlterTable
ALTER TABLE "Raca" ADD COLUMN     "grupoExclusivoId" UUID;

-- CreateTable
CREATE TABLE "Grupo" (
    "id" UUID NOT NULL,
    "mestreId" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "sinopse" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "imagemUrl" TEXT,
    "limiteMembros" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "permitirClassesRepetidas" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClasseNoGrupo" (
    "grupoId" UUID NOT NULL,
    "classeId" UUID NOT NULL,

    CONSTRAINT "ClasseNoGrupo_pkey" PRIMARY KEY ("grupoId","classeId")
);

-- CreateTable
CREATE TABLE "RacaNoGrupo" (
    "grupoId" UUID NOT NULL,
    "racaId" UUID NOT NULL,

    CONSTRAINT "RacaNoGrupo_pkey" PRIMARY KEY ("grupoId","racaId")
);

-- CreateTable
CREATE TABLE "AtributoNoGrupo" (
    "grupoId" UUID NOT NULL,
    "atributoId" UUID NOT NULL,

    CONSTRAINT "AtributoNoGrupo_pkey" PRIMARY KEY ("grupoId","atributoId")
);

-- CreateTable
CREATE TABLE "PericiaNoGrupo" (
    "grupoId" UUID NOT NULL,
    "periciaId" UUID NOT NULL,

    CONSTRAINT "PericiaNoGrupo_pkey" PRIMARY KEY ("grupoId","periciaId")
);

-- CreateTable
CREATE TABLE "Ficha" (
    "id" UUID NOT NULL,
    "grupoId" UUID NOT NULL,
    "jogadorId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "historia" TEXT,
    "imagemUrl" TEXT,
    "classeId" UUID NOT NULL,
    "racaId" UUID NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "vidaAtual" INTEGER NOT NULL,
    "manaAtual" INTEGER NOT NULL,
    "esforcoAtual" INTEGER NOT NULL,
    "pontosPericiaDisponiveis" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ficha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FichaAtributo" (
    "fichaId" UUID NOT NULL,
    "atributoId" UUID NOT NULL,
    "dados" INTEGER NOT NULL,

    CONSTRAINT "FichaAtributo_pkey" PRIMARY KEY ("fichaId","atributoId")
);

-- CreateTable
CREATE TABLE "FichaPericia" (
    "fichaId" UUID NOT NULL,
    "periciaId" UUID NOT NULL,
    "pontos" INTEGER NOT NULL,

    CONSTRAINT "FichaPericia_pkey" PRIMARY KEY ("fichaId","periciaId")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" UUID NOT NULL,
    "grupoId" UUID NOT NULL,
    "fichaId" UUID,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Grupo_codigo_key" ON "Grupo"("codigo");

-- CreateIndex
CREATE INDEX "Grupo_mestreId_idx" ON "Grupo"("mestreId");

-- CreateIndex
CREATE INDEX "Ficha_jogadorId_idx" ON "Ficha"("jogadorId");

-- CreateIndex
CREATE UNIQUE INDEX "Ficha_grupoId_jogadorId_key" ON "Ficha"("grupoId", "jogadorId");

-- CreateIndex
CREATE INDEX "Item_grupoId_idx" ON "Item"("grupoId");

-- CreateIndex
CREATE INDEX "Item_fichaId_idx" ON "Item"("fichaId");

-- AddForeignKey
ALTER TABLE "Classe" ADD CONSTRAINT "Classe_grupoExclusivoId_fkey" FOREIGN KEY ("grupoExclusivoId") REFERENCES "Grupo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atributo" ADD CONSTRAINT "Atributo_grupoExclusivoId_fkey" FOREIGN KEY ("grupoExclusivoId") REFERENCES "Grupo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Raca" ADD CONSTRAINT "Raca_grupoExclusivoId_fkey" FOREIGN KEY ("grupoExclusivoId") REFERENCES "Grupo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_mestreId_fkey" FOREIGN KEY ("mestreId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClasseNoGrupo" ADD CONSTRAINT "ClasseNoGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClasseNoGrupo" ADD CONSTRAINT "ClasseNoGrupo_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RacaNoGrupo" ADD CONSTRAINT "RacaNoGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RacaNoGrupo" ADD CONSTRAINT "RacaNoGrupo_racaId_fkey" FOREIGN KEY ("racaId") REFERENCES "Raca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtributoNoGrupo" ADD CONSTRAINT "AtributoNoGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtributoNoGrupo" ADD CONSTRAINT "AtributoNoGrupo_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "Atributo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PericiaNoGrupo" ADD CONSTRAINT "PericiaNoGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PericiaNoGrupo" ADD CONSTRAINT "PericiaNoGrupo_periciaId_fkey" FOREIGN KEY ("periciaId") REFERENCES "Pericia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ficha" ADD CONSTRAINT "Ficha_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ficha" ADD CONSTRAINT "Ficha_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ficha" ADD CONSTRAINT "Ficha_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ficha" ADD CONSTRAINT "Ficha_racaId_fkey" FOREIGN KEY ("racaId") REFERENCES "Raca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaAtributo" ADD CONSTRAINT "FichaAtributo_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "Ficha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaAtributo" ADD CONSTRAINT "FichaAtributo_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "Atributo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaPericia" ADD CONSTRAINT "FichaPericia_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "Ficha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaPericia" ADD CONSTRAINT "FichaPericia_periciaId_fkey" FOREIGN KEY ("periciaId") REFERENCES "Pericia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "Ficha"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Regras que o Prisma não expressa.
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_limite_membros" CHECK ("limiteMembros" BETWEEN 1 AND 50);
ALTER TABLE "Ficha" ADD CONSTRAINT "Ficha_valores" CHECK ("nivel" >= 1 AND "vidaAtual" >= 0 AND "manaAtual" >= 0 AND "esforcoAtual" >= 0 AND "pontosPericiaDisponiveis" >= 0);
ALTER TABLE "FichaAtributo" ADD CONSTRAINT "FichaAtributo_dados" CHECK ("dados" >= 0);
ALTER TABLE "FichaPericia" ADD CONSTRAINT "FichaPericia_pontos" CHECK ("pontos" >= 1);

-- Nada exposto pela Data API do Supabase.
ALTER TABLE "Grupo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClasseNoGrupo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RacaNoGrupo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AtributoNoGrupo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PericiaNoGrupo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ficha" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FichaAtributo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FichaPericia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Item" ENABLE ROW LEVEL SECURITY;
