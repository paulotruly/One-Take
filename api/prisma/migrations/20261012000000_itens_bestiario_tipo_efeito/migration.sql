-- CreateEnum
CREATE TYPE "TipoEfeito" AS ENUM ('DANO', 'DEFESA', 'CURA', 'SUPORTE', 'FORTALECIMENTO', 'ENFRAQUECIMENTO', 'CONTROLE', 'MOBILIDADE', 'INVOCACAO', 'UTILIDADE');

-- CreateEnum
CREATE TYPE "CategoriaItem" AS ENUM ('ARMA', 'ARTEFATO', 'TAVERNA', 'SEBO');

-- AlterTable
ALTER TABLE "Grupo" ADD COLUMN     "gridColunas" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "gridLinhas" INTEGER NOT NULL DEFAULT 8;

-- AlterTable: carta pode ser de classe ou de besta; tipo de efeito volta a ser lista fixa.
ALTER TABLE "Habilidade" ADD COLUMN     "bestaId" UUID,
ALTER COLUMN "classeId" DROP NOT NULL;
ALTER TABLE "Habilidade" ALTER COLUMN "tipoEfeito" TYPE "TipoEfeito" USING (
  CASE lower(trim("tipoEfeito"))
    WHEN 'dano' THEN 'DANO'
    WHEN 'defesa' THEN 'DEFESA'
    WHEN 'cura' THEN 'CURA'
    WHEN 'suporte' THEN 'SUPORTE'
    WHEN 'buff' THEN 'FORTALECIMENTO'
    WHEN 'fortalecimento' THEN 'FORTALECIMENTO'
    WHEN 'debuff' THEN 'ENFRAQUECIMENTO'
    WHEN 'enfraquecimento' THEN 'ENFRAQUECIMENTO'
    WHEN 'controle' THEN 'CONTROLE'
    WHEN 'mobilidade' THEN 'MOBILIDADE'
    WHEN 'invocação' THEN 'INVOCACAO'
    WHEN 'invocacao' THEN 'INVOCACAO'
    ELSE 'UTILIDADE'
  END
)::"TipoEfeito";

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "categoria" "CategoriaItem" NOT NULL DEFAULT 'ARTEFATO',
ADD COLUMN     "efeito" TEXT,
ADD COLUMN     "espacos" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "imagemUrl" TEXT,
ADD COLUMN     "modeloId" UUID,
ADD COLUMN     "requisito" TEXT,
ADD COLUMN     "requisitoClasseId" UUID,
ADD COLUMN     "requisitoPericiaId" UUID,
ADD COLUMN     "usosMaximos" INTEGER,
ADD COLUMN     "usosRestantes" INTEGER;

-- AlterTable
ALTER TABLE "Raca" ADD COLUMN     "conceitoId" UUID;

-- CreateTable
CREATE TABLE "ItemModelo" (
    "id" UUID NOT NULL,
    "donoId" UUID NOT NULL,
    "categoria" "CategoriaItem" NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "imagemUrl" TEXT,
    "efeito" TEXT,
    "espacos" INTEGER NOT NULL DEFAULT 1,
    "usosMaximos" INTEGER,
    "requisito" TEXT,
    "requisitoPericiaId" UUID,
    "requisitoClasseId" UUID,
    "grupoExclusivoId" UUID,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemModelo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RacaConceito" (
    "id" UUID NOT NULL,
    "donoId" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RacaConceito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BestaConceito" (
    "id" UUID NOT NULL,
    "donoId" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BestaConceito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Besta" (
    "id" UUID NOT NULL,
    "donoId" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "imagemUrl" TEXT,
    "pontosVida" INTEGER NOT NULL,
    "pontosMana" INTEGER NOT NULL,
    "pontosEsforco" INTEGER NOT NULL,
    "deslocamento" INTEGER NOT NULL DEFAULT 6,
    "conceitoId" UUID,
    "grupoExclusivoId" UUID,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Besta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BestaPericia" (
    "bestaId" UUID NOT NULL,
    "periciaId" UUID NOT NULL,
    "modificador" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BestaPericia_pkey" PRIMARY KEY ("bestaId","periciaId")
);

-- CreateTable
CREATE TABLE "BestaAtributo" (
    "bestaId" UUID NOT NULL,
    "atributoId" UUID NOT NULL,
    "dados" INTEGER NOT NULL,

    CONSTRAINT "BestaAtributo_pkey" PRIMARY KEY ("bestaId","atributoId")
);

-- CreateTable
CREATE TABLE "Criatura" (
    "id" UUID NOT NULL,
    "grupoId" UUID NOT NULL,
    "bestaId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "vidaAtual" INTEGER NOT NULL,
    "manaAtual" INTEGER NOT NULL,
    "esforcoAtual" INTEGER NOT NULL,
    "x" INTEGER,
    "y" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Criatura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItemModelo_donoId_idx" ON "ItemModelo"("donoId");

-- CreateIndex
CREATE INDEX "RacaConceito_donoId_idx" ON "RacaConceito"("donoId");

-- CreateIndex
CREATE INDEX "BestaConceito_donoId_idx" ON "BestaConceito"("donoId");

-- CreateIndex
CREATE INDEX "Besta_donoId_idx" ON "Besta"("donoId");

-- CreateIndex
CREATE INDEX "BestaPericia_periciaId_idx" ON "BestaPericia"("periciaId");

-- CreateIndex
CREATE INDEX "Criatura_grupoId_idx" ON "Criatura"("grupoId");

-- CreateIndex
CREATE INDEX "Habilidade_bestaId_ordem_idx" ON "Habilidade"("bestaId", "ordem");

-- AddForeignKey
ALTER TABLE "Habilidade" ADD CONSTRAINT "Habilidade_bestaId_fkey" FOREIGN KEY ("bestaId") REFERENCES "Besta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Raca" ADD CONSTRAINT "Raca_conceitoId_fkey" FOREIGN KEY ("conceitoId") REFERENCES "RacaConceito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemModelo" ADD CONSTRAINT "ItemModelo_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemModelo" ADD CONSTRAINT "ItemModelo_requisitoPericiaId_fkey" FOREIGN KEY ("requisitoPericiaId") REFERENCES "Pericia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemModelo" ADD CONSTRAINT "ItemModelo_requisitoClasseId_fkey" FOREIGN KEY ("requisitoClasseId") REFERENCES "Classe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemModelo" ADD CONSTRAINT "ItemModelo_grupoExclusivoId_fkey" FOREIGN KEY ("grupoExclusivoId") REFERENCES "Grupo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "ItemModelo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_requisitoPericiaId_fkey" FOREIGN KEY ("requisitoPericiaId") REFERENCES "Pericia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_requisitoClasseId_fkey" FOREIGN KEY ("requisitoClasseId") REFERENCES "Classe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RacaConceito" ADD CONSTRAINT "RacaConceito_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BestaConceito" ADD CONSTRAINT "BestaConceito_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Besta" ADD CONSTRAINT "Besta_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Besta" ADD CONSTRAINT "Besta_conceitoId_fkey" FOREIGN KEY ("conceitoId") REFERENCES "BestaConceito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Besta" ADD CONSTRAINT "Besta_grupoExclusivoId_fkey" FOREIGN KEY ("grupoExclusivoId") REFERENCES "Grupo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BestaPericia" ADD CONSTRAINT "BestaPericia_bestaId_fkey" FOREIGN KEY ("bestaId") REFERENCES "Besta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BestaPericia" ADD CONSTRAINT "BestaPericia_periciaId_fkey" FOREIGN KEY ("periciaId") REFERENCES "Pericia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BestaAtributo" ADD CONSTRAINT "BestaAtributo_bestaId_fkey" FOREIGN KEY ("bestaId") REFERENCES "Besta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BestaAtributo" ADD CONSTRAINT "BestaAtributo_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "Atributo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Criatura" ADD CONSTRAINT "Criatura_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Criatura" ADD CONSTRAINT "Criatura_bestaId_fkey" FOREIGN KEY ("bestaId") REFERENCES "Besta"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Regras que o Prisma não expressa.
ALTER TABLE "Habilidade" ADD CONSTRAINT "Habilidade_dono" CHECK (("classeId" IS NULL) <> ("bestaId" IS NULL));
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_grid" CHECK ("gridColunas" BETWEEN 4 AND 40 AND "gridLinhas" BETWEEN 4 AND 40);
ALTER TABLE "ItemModelo" ADD CONSTRAINT "ItemModelo_espacos" CHECK ("espacos" >= 1);
ALTER TABLE "ItemModelo" ADD CONSTRAINT "ItemModelo_usos" CHECK ("usosMaximos" IS NULL OR "usosMaximos" >= 1);
ALTER TABLE "Item" ADD CONSTRAINT "Item_espacos" CHECK ("espacos" >= 1);
ALTER TABLE "Item" ADD CONSTRAINT "Item_usos" CHECK ("usosMaximos" IS NULL OR "usosMaximos" >= 1);
ALTER TABLE "Item" ADD CONSTRAINT "Item_usos_restantes" CHECK ("usosRestantes" IS NULL OR "usosRestantes" >= 0);
ALTER TABLE "Besta" ADD CONSTRAINT "Besta_pontos" CHECK ("pontosVida" >= 1 AND "pontosMana" >= 1 AND "pontosEsforco" >= 1);
ALTER TABLE "Besta" ADD CONSTRAINT "Besta_deslocamento" CHECK ("deslocamento" >= 1);
ALTER TABLE "BestaAtributo" ADD CONSTRAINT "BestaAtributo_dados" CHECK ("dados" >= 0);
ALTER TABLE "Criatura" ADD CONSTRAINT "Criatura_nivel" CHECK ("nivel" >= 1);

-- Nada exposto pela Data API do Supabase.
ALTER TABLE "ItemModelo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RacaConceito" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BestaConceito" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Besta" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BestaPericia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BestaAtributo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Criatura" ENABLE ROW LEVEL SECURITY;
