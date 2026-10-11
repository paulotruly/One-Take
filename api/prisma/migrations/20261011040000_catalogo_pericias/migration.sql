-- Perícias deixam de pertencer à classe e viram um catálogo (base do sistema + um por mestre).
-- As perícias antigas eram só das classes fixas do seed (nenhuma de mestre); o seed recria tudo.
DELETE FROM "Pericia";

-- CreateEnum
CREATE TYPE "CategoriaPericia" AS ENUM ('CORPO_A_CORPO', 'MAGIA', 'PONTARIA', 'FISICO', 'DEFESA', 'SOCIAL', 'CONHECIMENTO', 'PERCEPCAO');

-- CreateEnum
CREATE TYPE "AtributoPericia" AS ENUM ('CF', 'CC');

-- DropForeignKey
ALTER TABLE "Pericia" DROP CONSTRAINT "Pericia_classeId_fkey";

-- DropIndex
DROP INDEX "Pericia_classeId_idx";

-- AlterTable
ALTER TABLE "Perfil" ADD COLUMN     "catalogoIniciado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Pericia" DROP COLUMN "classeId",
DROP COLUMN "modificador",
ADD COLUMN     "atributo" "AtributoPericia" NOT NULL,
ADD COLUMN     "categoria" "CategoriaPericia" NOT NULL,
ADD COLUMN     "donoId" UUID,
ADD COLUMN     "origemId" UUID;

-- CreateTable
CREATE TABLE "ClassePericia" (
    "classeId" UUID NOT NULL,
    "periciaId" UUID NOT NULL,
    "modificador" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClassePericia_pkey" PRIMARY KEY ("classeId","periciaId")
);

-- CreateIndex
CREATE INDEX "ClassePericia_periciaId_idx" ON "ClassePericia"("periciaId");

-- CreateIndex
CREATE INDEX "Pericia_donoId_idx" ON "Pericia"("donoId");

-- CreateIndex
CREATE UNIQUE INDEX "Pericia_donoId_nome_key" ON "Pericia"("donoId", "nome");

-- AddForeignKey
ALTER TABLE "Pericia" ADD CONSTRAINT "Pericia_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassePericia" ADD CONSTRAINT "ClassePericia_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassePericia" ADD CONSTRAINT "ClassePericia_periciaId_fkey" FOREIGN KEY ("periciaId") REFERENCES "Pericia"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Mesma proteção das outras tabelas: nada exposto pela Data API do Supabase.
ALTER TABLE "ClassePericia" ENABLE ROW LEVEL SECURITY;
