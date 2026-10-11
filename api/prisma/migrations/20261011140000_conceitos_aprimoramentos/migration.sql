-- AlterTable
ALTER TABLE "Classe" ADD COLUMN     "conceitoId" UUID;

-- CreateTable
CREATE TABLE "ClasseConceito" (
    "id" UUID NOT NULL,
    "donoId" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClasseConceito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabilidadeAprimoramento" (
    "id" UUID NOT NULL,
    "habilidadeId" UUID NOT NULL,
    "nivel" INTEGER NOT NULL,
    "titulo" TEXT,
    "descricaoEfeito" TEXT,
    "condicao" TEXT,
    "limite" TEXT,
    "custoMana" INTEGER,
    "statusId" UUID,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HabilidadeAprimoramento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClasseConceito_donoId_idx" ON "ClasseConceito"("donoId");

-- CreateIndex
CREATE UNIQUE INDEX "HabilidadeAprimoramento_habilidadeId_nivel_key" ON "HabilidadeAprimoramento"("habilidadeId", "nivel");

-- AddForeignKey
ALTER TABLE "Classe" ADD CONSTRAINT "Classe_conceitoId_fkey" FOREIGN KEY ("conceitoId") REFERENCES "ClasseConceito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClasseConceito" ADD CONSTRAINT "ClasseConceito_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabilidadeAprimoramento" ADD CONSTRAINT "HabilidadeAprimoramento_habilidadeId_fkey" FOREIGN KEY ("habilidadeId") REFERENCES "Habilidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabilidadeAprimoramento" ADD CONSTRAINT "HabilidadeAprimoramento_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Regras que o Prisma não expressa.
ALTER TABLE "HabilidadeAprimoramento" ADD CONSTRAINT "HabilidadeAprimoramento_nivel" CHECK ("nivel" >= 2);
ALTER TABLE "HabilidadeAprimoramento" ADD CONSTRAINT "HabilidadeAprimoramento_custo" CHECK ("custoMana" IS NULL OR "custoMana" >= 0);

-- Nada exposto pela Data API do Supabase.
ALTER TABLE "ClasseConceito" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HabilidadeAprimoramento" ENABLE ROW LEVEL SECURITY;
