-- AlterTable
ALTER TABLE "Status" ADD COLUMN     "categoriaId" UUID;

-- CreateTable
CREATE TABLE "CategoriaStatus" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "donoId" UUID NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CategoriaStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CategoriaStatus_donoId_idx" ON "CategoriaStatus"("donoId");

-- CreateIndex
CREATE INDEX "CategoriaStatus_verificado_idx" ON "CategoriaStatus"("verificado");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaStatus_donoId_nome_key" ON "CategoriaStatus"("donoId", "nome");

-- CreateIndex
CREATE INDEX "Status_categoriaId_idx" ON "Status"("categoriaId");

-- AddForeignKey
ALTER TABLE "CategoriaStatus" ADD CONSTRAINT "CategoriaStatus_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Status" ADD CONSTRAINT "Status_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

