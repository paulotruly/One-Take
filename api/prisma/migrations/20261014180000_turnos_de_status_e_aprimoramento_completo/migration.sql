-- Status aplicados: turnos que faltam (nulo = sem prazo).
ALTER TABLE "FichaStatus" ADD COLUMN "turnos" INTEGER;
ALTER TABLE "NpcStatus" ADD COLUMN "turnos" INTEGER;
ALTER TABLE "CriaturaStatus" ADD COLUMN "turnos" INTEGER;
ALTER TABLE "FichaStatus" ADD CONSTRAINT "FichaStatus_turnos" CHECK ("turnos" IS NULL OR "turnos" BETWEEN 1 AND 99);
ALTER TABLE "NpcStatus" ADD CONSTRAINT "NpcStatus_turnos" CHECK ("turnos" IS NULL OR "turnos" BETWEEN 1 AND 99);
ALTER TABLE "CriaturaStatus" ADD CONSTRAINT "CriaturaStatus_turnos" CHECK ("turnos" IS NULL OR "turnos" BETWEEN 1 AND 99);

-- Aprimoramento vira a versão completa da carta no nível (antes: só o que mudava, nulo = igual).
ALTER TABLE "HabilidadeAprimoramento" ADD COLUMN "descricao" TEXT;

-- Preenche o que era "igual" com a versão anterior (aprimoramento de nível menor que mudou o campo, ou a carta).
UPDATE "HabilidadeAprimoramento" a SET
  "titulo" = COALESCE(a."titulo", (SELECT p."titulo" FROM "HabilidadeAprimoramento" p WHERE p."habilidadeId" = a."habilidadeId" AND p."nivel" < a."nivel" AND p."titulo" IS NOT NULL ORDER BY p."nivel" DESC LIMIT 1), h."titulo"),
  "descricao" = h."descricao",
  "descricaoEfeito" = COALESCE(a."descricaoEfeito", (SELECT p."descricaoEfeito" FROM "HabilidadeAprimoramento" p WHERE p."habilidadeId" = a."habilidadeId" AND p."nivel" < a."nivel" AND p."descricaoEfeito" IS NOT NULL ORDER BY p."nivel" DESC LIMIT 1), h."descricaoEfeito"),
  "condicao" = COALESCE(a."condicao", (SELECT p."condicao" FROM "HabilidadeAprimoramento" p WHERE p."habilidadeId" = a."habilidadeId" AND p."nivel" < a."nivel" AND p."condicao" IS NOT NULL ORDER BY p."nivel" DESC LIMIT 1), h."condicao"),
  "custoMana" = COALESCE(a."custoMana", (SELECT p."custoMana" FROM "HabilidadeAprimoramento" p WHERE p."habilidadeId" = a."habilidadeId" AND p."nivel" < a."nivel" AND p."custoMana" IS NOT NULL ORDER BY p."nivel" DESC LIMIT 1), h."custoMana"),
  "statusId" = COALESCE(a."statusId", (SELECT p."statusId" FROM "HabilidadeAprimoramento" p WHERE p."habilidadeId" = a."habilidadeId" AND p."nivel" < a."nivel" AND p."statusId" IS NOT NULL ORDER BY p."nivel" DESC LIMIT 1), h."statusId")
FROM "Habilidade" h WHERE h."id" = a."habilidadeId";

UPDATE "HabilidadeAprimoramento" a SET "limiteUsos" = v."limiteUsos", "limitePor" = v."limitePor"
FROM (
  SELECT a2."id",
    COALESCE((SELECT p."limiteUsos" FROM "HabilidadeAprimoramento" p WHERE p."habilidadeId" = a2."habilidadeId" AND p."nivel" < a2."nivel" AND p."limiteUsos" IS NOT NULL ORDER BY p."nivel" DESC LIMIT 1), h."limiteUsos") AS "limiteUsos",
    COALESCE((SELECT p."limitePor" FROM "HabilidadeAprimoramento" p WHERE p."habilidadeId" = a2."habilidadeId" AND p."nivel" < a2."nivel" AND p."limitePor" IS NOT NULL ORDER BY p."nivel" DESC LIMIT 1), h."limitePor") AS "limitePor"
  FROM "HabilidadeAprimoramento" a2 JOIN "Habilidade" h ON h."id" = a2."habilidadeId"
  WHERE a2."limiteUsos" IS NULL
) v WHERE v."id" = a."id";

ALTER TABLE "HabilidadeAprimoramento" ALTER COLUMN "titulo" SET NOT NULL;
ALTER TABLE "HabilidadeAprimoramento" ALTER COLUMN "descricao" SET NOT NULL;
ALTER TABLE "HabilidadeAprimoramento" ALTER COLUMN "descricaoEfeito" SET NOT NULL;
ALTER TABLE "HabilidadeAprimoramento" ALTER COLUMN "custoMana" SET DEFAULT 0;
ALTER TABLE "HabilidadeAprimoramento" ALTER COLUMN "custoMana" SET NOT NULL;
