-- Cada classe passa a ter uma única cartela: as habilidades pertencem direto à classe.
-- Migra os dados existentes preservando a ordem (cartelas por ordem, depois cartas por ordem).

ALTER TABLE "Habilidade" ADD COLUMN "classeId" UUID;

UPDATE "Habilidade" h
SET "classeId" = c."classeId"
FROM "Cartela" c
WHERE c."id" = h."cartelaId";

WITH nova AS (
  SELECT h."id",
         ROW_NUMBER() OVER (PARTITION BY c."classeId" ORDER BY c."ordem", c."criadoEm", h."ordem") - 1 AS ordem
  FROM "Habilidade" h
  JOIN "Cartela" c ON c."id" = h."cartelaId"
)
UPDATE "Habilidade" h SET "ordem" = nova.ordem FROM nova WHERE nova."id" = h."id";

ALTER TABLE "Habilidade" ALTER COLUMN "classeId" SET NOT NULL;

ALTER TABLE "Habilidade" DROP CONSTRAINT "Habilidade_cartelaId_fkey";
DROP INDEX "Habilidade_cartelaId_ordem_idx";
ALTER TABLE "Habilidade" DROP COLUMN "cartelaId";
DROP TABLE "Cartela";

CREATE INDEX "Habilidade_classeId_ordem_idx" ON "Habilidade"("classeId", "ordem");
ALTER TABLE "Habilidade" ADD CONSTRAINT "Habilidade_classeId_fkey"
  FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
