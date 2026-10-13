-- Troca o kit básico por "verificado" em cada coisa, e o booleano admin por um cargo (enum).
CREATE TYPE "Cargo" AS ENUM ('USUARIO', 'ADMIN');
ALTER TABLE "Perfil" ADD COLUMN "cargo" "Cargo" NOT NULL DEFAULT 'USUARIO';
UPDATE "Perfil" SET "cargo" = 'ADMIN' WHERE "admin";
ALTER TABLE "Perfil" DROP COLUMN "admin";

ALTER TABLE "Classe" ADD COLUMN "verificado" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Classe_verificado_idx" ON "Classe"("verificado");
ALTER TABLE "Raca" ADD COLUMN "verificado" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Raca_verificado_idx" ON "Raca"("verificado");
ALTER TABLE "Atributo" ADD COLUMN "verificado" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Atributo_verificado_idx" ON "Atributo"("verificado");
ALTER TABLE "Status" ADD COLUMN "verificado" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Status_verificado_idx" ON "Status"("verificado");
ALTER TABLE "ItemModelo" ADD COLUMN "verificado" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "ItemModelo_verificado_idx" ON "ItemModelo"("verificado");
ALTER TABLE "Besta" ADD COLUMN "verificado" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Besta_verificado_idx" ON "Besta"("verificado");

-- O que estava no kit básico (se havia um) passa a ser verificado.
UPDATE "Classe" SET "verificado" = true WHERE "id" IN (SELECT l."classeId" FROM "KitClasse" l JOIN "Sistema" s ON s."kitBasicoId" = l."kitId");
UPDATE "Raca" SET "verificado" = true WHERE "id" IN (SELECT l."racaId" FROM "KitRaca" l JOIN "Sistema" s ON s."kitBasicoId" = l."kitId");
UPDATE "Atributo" SET "verificado" = true WHERE "id" IN (SELECT l."atributoId" FROM "KitAtributo" l JOIN "Sistema" s ON s."kitBasicoId" = l."kitId");
UPDATE "Status" SET "verificado" = true WHERE "id" IN (SELECT l."statusId" FROM "KitStatus" l JOIN "Sistema" s ON s."kitBasicoId" = l."kitId");
UPDATE "ItemModelo" SET "verificado" = true WHERE "id" IN (SELECT l."itemModeloId" FROM "KitItemModelo" l JOIN "Sistema" s ON s."kitBasicoId" = l."kitId");
UPDATE "Besta" SET "verificado" = true WHERE "id" IN (SELECT l."bestaId" FROM "KitBesta" l JOIN "Sistema" s ON s."kitBasicoId" = l."kitId");

DROP TABLE "Sistema";
