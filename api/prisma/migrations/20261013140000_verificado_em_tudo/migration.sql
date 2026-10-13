-- Verificado também em perícias, categorias de item e NPCs; preferência de ocultar verificados.
-- AlterTable
ALTER TABLE "CategoriaItem" ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Npc" ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Perfil" ADD COLUMN     "ocultarVerificados" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Pericia" ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "CategoriaItem_verificado_idx" ON "CategoriaItem"("verificado");

-- CreateIndex
CREATE INDEX "Npc_verificado_idx" ON "Npc"("verificado");

-- CreateIndex
CREATE INDEX "Pericia_verificado_idx" ON "Pericia"("verificado");

