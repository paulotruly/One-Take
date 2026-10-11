-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('MESTRE', 'JOGADOR');

-- CreateEnum
CREATE TYPE "GrupoClasse" AS ENUM ('COMBATENTE', 'VANGUARDISTA', 'SUPORTE');

-- CreateEnum
CREATE TYPE "TipoEfeito" AS ENUM ('DANO', 'SUPORTE', 'BUFF', 'DEBUFF', 'OUTRO');

-- CreateTable
CREATE TABLE "Perfil" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "papel" "Papel" NOT NULL DEFAULT 'JOGADOR',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classe" (
    "id" UUID NOT NULL,
    "grupo" "GrupoClasse" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "imagemPath" TEXT,
    "pontosVida" INTEGER NOT NULL,
    "pontosMana" INTEGER NOT NULL,
    "pontosEsforco" INTEGER NOT NULL,
    "donoId" UUID,
    "origemId" UUID,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cartela" (
    "id" UUID NOT NULL,
    "classeId" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cartela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habilidade" (
    "id" UUID NOT NULL,
    "cartelaId" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "condicao" TEXT,
    "tipoEfeito" "TipoEfeito" NOT NULL,
    "descricaoEfeito" TEXT NOT NULL,
    "limite" TEXT,
    "nivelNecessario" INTEGER NOT NULL DEFAULT 1,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "Habilidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pericia" (
    "id" UUID NOT NULL,
    "classeId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "modificador" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pericia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Perfil_email_key" ON "Perfil"("email");

-- CreateIndex
CREATE INDEX "Classe_donoId_idx" ON "Classe"("donoId");

-- CreateIndex
CREATE INDEX "Classe_grupo_idx" ON "Classe"("grupo");

-- CreateIndex
CREATE INDEX "Cartela_classeId_idx" ON "Cartela"("classeId");

-- CreateIndex
CREATE INDEX "Habilidade_cartelaId_ordem_idx" ON "Habilidade"("cartelaId", "ordem");

-- CreateIndex
CREATE INDEX "Pericia_classeId_idx" ON "Pericia"("classeId");

-- AddForeignKey
ALTER TABLE "Classe" ADD CONSTRAINT "Classe_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cartela" ADD CONSTRAINT "Cartela_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habilidade" ADD CONSTRAINT "Habilidade_cartelaId_fkey" FOREIGN KEY ("cartelaId") REFERENCES "Cartela"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pericia" ADD CONSTRAINT "Pericia_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Regras de integridade que o Prisma não expressa no schema.
ALTER TABLE "Classe" ADD CONSTRAINT "Classe_pontos_nao_negativos"
  CHECK ("pontosVida" >= 0 AND "pontosMana" >= 0 AND "pontosEsforco" >= 0);
ALTER TABLE "Habilidade" ADD CONSTRAINT "Habilidade_nivel_minimo"
  CHECK ("nivelNecessario" >= 1);

-- O Supabase expõe o schema public pela Data API (PostgREST) com a chave anon.
-- RLS ligado e sem policies = nada acessível por lá. A API usa o papel postgres,
-- que ignora RLS, então o acesso aos dados passa só pela nossa API.
ALTER TABLE "Perfil" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Classe" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cartela" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Habilidade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pericia" ENABLE ROW LEVEL SECURITY;
