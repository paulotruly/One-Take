-- Habilidades podem (ou não) custar mana. 0 = sem custo.
ALTER TABLE "Habilidade" ADD COLUMN "custoMana" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Habilidade" ADD CONSTRAINT "Habilidade_custo_mana_nao_negativo" CHECK ("custoMana" >= 0);
