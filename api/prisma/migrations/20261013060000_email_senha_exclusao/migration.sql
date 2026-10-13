-- CreateEnum
CREATE TYPE "TipoTokenConta" AS ENUM ('VERIFICAR_EMAIL', 'REDEFINIR_SENHA', 'EXCLUIR_CONTA');

-- CreateEnum
CREATE TYPE "MotivoArquivamento" AS ENUM ('SAIU_DO_GRUPO', 'REMOVIDO_PELO_MESTRE', 'GRUPO_EXCLUIDO');

-- AlterTable
ALTER TABLE "Perfil" ADD COLUMN     "emailContato" TEXT,
ADD COLUMN     "emailVerificadoEm" TIMESTAMP(3),
ADD COLUMN     "exclusaoIniciadaEm" TIMESTAMP(3),
ADD COLUMN     "sessoesValidasDesde" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "TokenConta" (
    "id" UUID NOT NULL,
    "perfilId" UUID NOT NULL,
    "tipo" "TipoTokenConta" NOT NULL,
    "hash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "usadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenConta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FichaArquivada" (
    "id" UUID NOT NULL,
    "jogadorId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "classe" TEXT NOT NULL,
    "raca" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,
    "motivo" "MotivoArquivamento" NOT NULL,
    "conteudo" JSONB NOT NULL,
    "arquivadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FichaArquivada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenConta_hash_key" ON "TokenConta"("hash");

-- CreateIndex
CREATE INDEX "TokenConta_perfilId_tipo_idx" ON "TokenConta"("perfilId", "tipo");

-- CreateIndex
CREATE INDEX "FichaArquivada_jogadorId_idx" ON "FichaArquivada"("jogadorId");

-- CreateIndex
CREATE UNIQUE INDEX "Perfil_emailContato_key" ON "Perfil"("emailContato");

-- AddForeignKey
ALTER TABLE "TokenConta" ADD CONSTRAINT "TokenConta_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaArquivada" ADD CONSTRAINT "FichaArquivada_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- E-mail de contato sempre minúsculo: a unicidade fica insensível a maiúsculas.
ALTER TABLE "Perfil" ADD CONSTRAINT "Perfil_emailContato_minusculo" CHECK ("emailContato" = lower("emailContato"));

-- Contas antigas criadas com e-mail real no Supabase Auth passam a ter esse e-mail como contato (pendente de verificação).
-- Contas do app (e-mail interno @one-take.local) ficam sem e-mail até a pessoa cadastrar um. Nenhum e-mail é inventado.
UPDATE "Perfil" p SET "emailContato" = lower(p."email")
WHERE p."email" NOT LIKE '%@one-take.local'
  AND NOT EXISTS (SELECT 1 FROM "Perfil" o WHERE o."id" <> p."id" AND lower(o."email") = lower(p."email"));

-- Mesmo padrão das outras tabelas: RLS ligado sem policies (só a API acessa).
ALTER TABLE "TokenConta" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FichaArquivada" ENABLE ROW LEVEL SECURITY;
