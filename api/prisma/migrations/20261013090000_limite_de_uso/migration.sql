-- Limite de uso das cartas: de texto livre para "N vezes por combate/sessão" (lista fixa).
CREATE TYPE "LimiteUso" AS ENUM ('COMBATE', 'SESSAO');

ALTER TABLE "Habilidade" ADD COLUMN "limiteUsos" INTEGER, ADD COLUMN "limitePor" "LimiteUso";
ALTER TABLE "HabilidadeAprimoramento" ADD COLUMN "limiteUsos" INTEGER, ADD COLUMN "limitePor" "LimiteUso";

-- Converte os textos no padrão "N uso(s)/vez(es) por combate|sessão".
UPDATE "Habilidade" SET
  "limiteUsos" = LEAST(99, GREATEST(1, (substring("limite" from '^\s*(\d+)'))::int)),
  "limitePor" = CASE WHEN "limite" ~* 'sess' THEN 'SESSAO'::"LimiteUso" ELSE 'COMBATE'::"LimiteUso" END
WHERE "limite" ~* '^\s*\d+\s+(usos?|vez|vezes)\s+(por|a cada)\s+(combate|sess)';
UPDATE "HabilidadeAprimoramento" SET
  "limiteUsos" = LEAST(99, GREATEST(1, (substring("limite" from '^\s*(\d+)'))::int)),
  "limitePor" = CASE WHEN "limite" ~* 'sess' THEN 'SESSAO'::"LimiteUso" ELSE 'COMBATE'::"LimiteUso" END
WHERE "limite" ~* '^\s*\d+\s+(usos?|vez|vezes)\s+(por|a cada)\s+(combate|sess)';

-- O que não segue o padrão não se perde: vai para o fim da condição da carta.
UPDATE "Habilidade" SET "condicao" = trim(both ' ' from coalesce("condicao" || ' ', '') || 'Limite: ' || "limite")
WHERE "limite" IS NOT NULL AND trim("limite") <> '' AND "limiteUsos" IS NULL;
UPDATE "HabilidadeAprimoramento" SET "condicao" = trim(both ' ' from coalesce("condicao" || ' ', '') || 'Limite: ' || "limite")
WHERE "limite" IS NOT NULL AND trim("limite") <> '' AND "limiteUsos" IS NULL;

ALTER TABLE "Habilidade" DROP COLUMN "limite";
ALTER TABLE "HabilidadeAprimoramento" DROP COLUMN "limite";

-- Vezes e período andam juntos; vezes entre 1 e 99.
ALTER TABLE "Habilidade" ADD CONSTRAINT "Habilidade_limite" CHECK (("limiteUsos" IS NULL) = ("limitePor" IS NULL) AND ("limiteUsos" IS NULL OR "limiteUsos" BETWEEN 1 AND 99));
ALTER TABLE "HabilidadeAprimoramento" ADD CONSTRAINT "HabilidadeAprimoramento_limite" CHECK (("limiteUsos" IS NULL) = ("limitePor" IS NULL) AND ("limiteUsos" IS NULL OR "limiteUsos" BETWEEN 1 AND 99));
