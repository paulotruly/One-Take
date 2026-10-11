-- Atributos viram cadastro: 3 fixos do sistema + atributos criados por cada mestre.
-- Substitui o enum AtributoPericia (CF, CC). CC se divide em Carisma e Conhecimento.

CREATE TABLE "Atributo" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 100,
    "donoId" UUID,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Atributo_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Atributo_donoId_idx" ON "Atributo"("donoId");
CREATE UNIQUE INDEX "Atributo_donoId_nome_key" ON "Atributo"("donoId", "nome");
ALTER TABLE "Atributo" ADD CONSTRAINT "Atributo_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Atributo" ENABLE ROW LEVEL SECURITY;

-- Fixos (mesmos ids usados no seed).
INSERT INTO "Atributo" ("id", "nome", "descricao", "ordem") VALUES
  ('00000000-0000-4000-8002-000000000001', 'Capacidade física', 'Utilizada sempre que o corpo é levado ao limite.', 1),
  ('00000000-0000-4000-8002-000000000002', 'Carisma', 'A presença do personagem e sua capacidade de lidar com outras pessoas.', 2),
  ('00000000-0000-4000-8002-000000000003', 'Conhecimento', 'O intelecto e a sensibilidade do personagem diante do mundo.', 3);

ALTER TABLE "Pericia" ADD COLUMN "atributoId" UUID;

-- CF -> Capacidade física. CC -> Carisma (sociais e Vontade) ou Conhecimento (o resto).
UPDATE "Pericia" SET "atributoId" = CASE
  WHEN "atributo" = 'CF' THEN '00000000-0000-4000-8002-000000000001'::uuid
  WHEN "categoria" = 'SOCIAL' OR "nome" = 'Vontade' THEN '00000000-0000-4000-8002-000000000002'::uuid
  ELSE '00000000-0000-4000-8002-000000000003'::uuid
END;

ALTER TABLE "Pericia" ALTER COLUMN "atributoId" SET NOT NULL;
ALTER TABLE "Pericia" DROP COLUMN "atributo";
DROP TYPE "AtributoPericia";

CREATE INDEX "Pericia_atributoId_idx" ON "Pericia"("atributoId");
ALTER TABLE "Pericia" ADD CONSTRAINT "Pericia_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "Atributo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
