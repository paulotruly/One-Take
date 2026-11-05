-- DT da carta: opcional, para cartas que ninguém pode impedir. O aprimoramento pode mudar o valor naquele nível.
ALTER TABLE "Habilidade" ADD COLUMN "dt" INTEGER;
ALTER TABLE "Habilidade" ADD CONSTRAINT "Habilidade_dt_check" CHECK ("dt" IS NULL OR "dt" >= 1);
ALTER TABLE "HabilidadeAprimoramento" ADD COLUMN "dt" INTEGER;
ALTER TABLE "HabilidadeAprimoramento" ADD CONSTRAINT "HabilidadeAprimoramento_dt_check" CHECK ("dt" IS NULL OR "dt" >= 1);
