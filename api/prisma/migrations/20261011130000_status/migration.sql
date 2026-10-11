-- CreateEnum
CREATE TYPE "TipoStatus" AS ENUM ('BUFF', 'DEBUFF', 'MISTO');

-- CreateEnum
CREATE TYPE "GatilhoStatus" AS ENUM ('VIDA_ZERO', 'MANA_ZERO', 'ESFORCO_ZERO');

-- AlterTable
ALTER TABLE "Habilidade" ADD COLUMN     "statusId" UUID;

-- CreateTable
CREATE TABLE "Status" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "efeito" TEXT NOT NULL,
    "tipo" "TipoStatus" NOT NULL,
    "gatilho" "GatilhoStatus",
    "ordem" INTEGER NOT NULL DEFAULT 100,
    "donoId" UUID,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusNoGrupo" (
    "grupoId" UUID NOT NULL,
    "statusId" UUID NOT NULL,

    CONSTRAINT "StatusNoGrupo_pkey" PRIMARY KEY ("grupoId","statusId")
);

-- CreateTable
CREATE TABLE "FichaStatus" (
    "fichaId" UUID NOT NULL,
    "statusId" UUID NOT NULL,
    "aplicadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FichaStatus_pkey" PRIMARY KEY ("fichaId","statusId")
);

-- CreateIndex
CREATE INDEX "Status_donoId_idx" ON "Status"("donoId");

-- CreateIndex
CREATE UNIQUE INDEX "Status_donoId_nome_key" ON "Status"("donoId", "nome");

-- AddForeignKey
ALTER TABLE "Habilidade" ADD CONSTRAINT "Habilidade_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Status" ADD CONSTRAINT "Status_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusNoGrupo" ADD CONSTRAINT "StatusNoGrupo_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusNoGrupo" ADD CONSTRAINT "StatusNoGrupo_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaStatus" ADD CONSTRAINT "FichaStatus_fichaId_fkey" FOREIGN KEY ("fichaId") REFERENCES "Ficha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaStatus" ADD CONSTRAINT "FichaStatus_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Nada exposto pela Data API do Supabase.
ALTER TABLE "Status" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StatusNoGrupo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FichaStatus" ENABLE ROW LEVEL SECURITY;
