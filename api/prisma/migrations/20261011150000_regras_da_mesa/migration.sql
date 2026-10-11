-- AlterTable
ALTER TABLE "Grupo" ADD COLUMN     "regrasPadraoDesativadas" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "RegraDaMesa" (
    "id" UUID NOT NULL,
    "grupoId" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegraDaMesa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegraDaMesa_grupoId_idx" ON "RegraDaMesa"("grupoId");

-- AddForeignKey
ALTER TABLE "RegraDaMesa" ADD CONSTRAINT "RegraDaMesa_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Nada exposto pela Data API do Supabase.
ALTER TABLE "RegraDaMesa" ENABLE ROW LEVEL SECURITY;
