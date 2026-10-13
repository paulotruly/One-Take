-- Perícia que o alvo usa para se defender da carta (opcional).
-- AlterTable
ALTER TABLE "Habilidade" ADD COLUMN     "periciaDefesaId" UUID;

-- AddForeignKey
ALTER TABLE "Habilidade" ADD CONSTRAINT "Habilidade_periciaDefesaId_fkey" FOREIGN KEY ("periciaDefesaId") REFERENCES "Pericia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

