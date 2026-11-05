-- Alcance da carta: texto curto e opcional. O aprimoramento pode mudar o valor naquele nível.
ALTER TABLE "Habilidade" ADD COLUMN "alcance" TEXT;
ALTER TABLE "HabilidadeAprimoramento" ADD COLUMN "alcance" TEXT;
