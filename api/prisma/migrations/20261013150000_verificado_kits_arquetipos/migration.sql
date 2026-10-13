-- Verificado em kits (o conteúdo do kit verificado conta como verificado) e em arquétipos.
-- AlterTable
ALTER TABLE "BestaConceito" ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ClasseConceito" ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Kit" ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RacaConceito" ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "BestaConceito_verificado_idx" ON "BestaConceito"("verificado");

-- CreateIndex
CREATE INDEX "ClasseConceito_verificado_idx" ON "ClasseConceito"("verificado");

-- CreateIndex
CREATE INDEX "Kit_verificado_idx" ON "Kit"("verificado");

-- CreateIndex
CREATE INDEX "RacaConceito_verificado_idx" ON "RacaConceito"("verificado");

