-- Habilidade pode indicar a perícia testada para usá-la.

-- AlterTable
ALTER TABLE "Habilidade" ADD COLUMN     "periciaId" UUID;

-- AddForeignKey
ALTER TABLE "Habilidade" ADD CONSTRAINT "Habilidade_periciaId_fkey" FOREIGN KEY ("periciaId") REFERENCES "Pericia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

