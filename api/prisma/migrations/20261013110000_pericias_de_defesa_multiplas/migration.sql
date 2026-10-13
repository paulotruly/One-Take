-- Uma carta pode ter várias perícias de defesa (o alvo usa uma delas): de coluna única para tabela de ligação.
CREATE TABLE "HabilidadeDefesa" (
    "habilidadeId" UUID NOT NULL,
    "periciaId" UUID NOT NULL,
    CONSTRAINT "HabilidadeDefesa_pkey" PRIMARY KEY ("habilidadeId","periciaId")
);
CREATE INDEX "HabilidadeDefesa_periciaId_idx" ON "HabilidadeDefesa"("periciaId");
ALTER TABLE "HabilidadeDefesa" ADD CONSTRAINT "HabilidadeDefesa_habilidadeId_fkey" FOREIGN KEY ("habilidadeId") REFERENCES "Habilidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HabilidadeDefesa" ADD CONSTRAINT "HabilidadeDefesa_periciaId_fkey" FOREIGN KEY ("periciaId") REFERENCES "Pericia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Leva o que já estava na coluna única (criada na migration anterior).
INSERT INTO "HabilidadeDefesa" ("habilidadeId", "periciaId")
SELECT "id", "periciaDefesaId" FROM "Habilidade" WHERE "periciaDefesaId" IS NOT NULL;

ALTER TABLE "Habilidade" DROP CONSTRAINT "Habilidade_periciaDefesaId_fkey";
ALTER TABLE "Habilidade" DROP COLUMN "periciaDefesaId";

ALTER TABLE "HabilidadeDefesa" ENABLE ROW LEVEL SECURITY;
