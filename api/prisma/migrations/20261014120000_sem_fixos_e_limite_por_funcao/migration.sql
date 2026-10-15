-- Não há mais conteúdo fixo do sistema: atributos, status, categorias de item e classes sempre têm dono.
-- O que era fixo (donoId nulo) passa para a conta ADMIN mais antiga. Atributos e status entram no kit verificado mais antigo
-- dela (chegam aos outros mestres pelo kit); sem kit verificado, ganham o selo verificado. Categorias de item e classes
-- (não entram em kit) ganham o selo. Perícias base continuam sem dono: são o modelo do catálogo de cada mestre (não aparecem).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Perfil" WHERE "cargo" = 'ADMIN') AND (
    EXISTS (SELECT 1 FROM "Atributo" WHERE "donoId" IS NULL) OR EXISTS (SELECT 1 FROM "Status" WHERE "donoId" IS NULL) OR
    EXISTS (SELECT 1 FROM "CategoriaItem" WHERE "donoId" IS NULL) OR EXISTS (SELECT 1 FROM "Classe" WHERE "donoId" IS NULL)
  ) THEN
    RAISE EXCEPTION 'Há conteúdo fixo e nenhuma conta ADMIN para recebê-lo. Rode "npm run cargo -- <nick> ADMIN" e aplique de novo.';
  END IF;
END $$;

-- Status: só "efeito" (a descrição, quando havia, vai para o começo do efeito).
UPDATE "Status" SET "efeito" = CASE
  WHEN btrim("descricao") = '' THEN "efeito"
  WHEN btrim("efeito") = '' THEN "descricao"
  ELSE "descricao" || ' ' || "efeito"
END;
ALTER TABLE "Status" DROP COLUMN "descricao";

-- Atributos e status fixos -> kit verificado mais antigo do ADMIN.
INSERT INTO "KitAtributo" ("kitId", "atributoId")
SELECT k."id", a."id"
FROM "Atributo" a
CROSS JOIN (
  SELECT k."id" FROM "Kit" k JOIN "Perfil" p ON p."id" = k."donoId"
  WHERE p."cargo" = 'ADMIN' AND k."verificado" ORDER BY k."criadoEm" LIMIT 1
) k
WHERE a."donoId" IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO "KitStatus" ("kitId", "statusId")
SELECT k."id", s."id"
FROM "Status" s
CROSS JOIN (
  SELECT k."id" FROM "Kit" k JOIN "Perfil" p ON p."id" = k."donoId"
  WHERE p."cargo" = 'ADMIN' AND k."verificado" ORDER BY k."criadoEm" LIMIT 1
) k
WHERE s."donoId" IS NULL
ON CONFLICT DO NOTHING;

UPDATE "Atributo" a SET "verificado" = true
WHERE a."donoId" IS NULL AND NOT EXISTS (SELECT 1 FROM "KitAtributo" ka WHERE ka."atributoId" = a."id");
UPDATE "Status" s SET "verificado" = true
WHERE s."donoId" IS NULL AND NOT EXISTS (SELECT 1 FROM "KitStatus" ks WHERE ks."statusId" = s."id");
UPDATE "CategoriaItem" SET "verificado" = true WHERE "donoId" IS NULL;
UPDATE "Classe" SET "verificado" = true WHERE "donoId" IS NULL;

-- Dono = ADMIN mais antigo.
UPDATE "Atributo" SET "donoId" = (SELECT "id" FROM "Perfil" WHERE "cargo" = 'ADMIN' ORDER BY "criadoEm" LIMIT 1) WHERE "donoId" IS NULL;
UPDATE "Status" SET "donoId" = (SELECT "id" FROM "Perfil" WHERE "cargo" = 'ADMIN' ORDER BY "criadoEm" LIMIT 1) WHERE "donoId" IS NULL;
UPDATE "CategoriaItem" SET "donoId" = (SELECT "id" FROM "Perfil" WHERE "cargo" = 'ADMIN' ORDER BY "criadoEm" LIMIT 1) WHERE "donoId" IS NULL;
UPDATE "Classe" SET "donoId" = (SELECT "id" FROM "Perfil" WHERE "cargo" = 'ADMIN' ORDER BY "criadoEm" LIMIT 1) WHERE "donoId" IS NULL;

-- AlterTable
ALTER TABLE "Atributo" ALTER COLUMN "donoId" SET NOT NULL;
ALTER TABLE "Status" ALTER COLUMN "donoId" SET NOT NULL;
ALTER TABLE "CategoriaItem" ALTER COLUMN "donoId" SET NOT NULL;
ALTER TABLE "Classe" ALTER COLUMN "donoId" SET NOT NULL;

-- Limite de fichas por função da classe no grupo (nulo = sem limite).
ALTER TABLE "Grupo" ADD COLUMN "limiteCombatentes" INTEGER,
ADD COLUMN "limiteVanguardistas" INTEGER,
ADD COLUMN "limiteSuportes" INTEGER;
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_limites_por_funcao" CHECK (
  ("limiteCombatentes" IS NULL OR "limiteCombatentes" BETWEEN 0 AND 50) AND
  ("limiteVanguardistas" IS NULL OR "limiteVanguardistas" BETWEEN 0 AND 50) AND
  ("limiteSuportes" IS NULL OR "limiteSuportes" BETWEEN 0 AND 50)
);
