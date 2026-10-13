-- Sem e-mail: a recuperação de senha passa a ser por código de recuperação (guardado só como hash).
-- Apaga os e-mails de contato guardados e a tabela de links por e-mail (minimização de dados).

-- DropForeignKey
ALTER TABLE "TokenConta" DROP CONSTRAINT "TokenConta_perfilId_fkey";

-- DropIndex
DROP INDEX "Perfil_emailContato_key";

-- AlterTable
ALTER TABLE "Perfil" DROP COLUMN "emailContato",
DROP COLUMN "emailVerificadoEm",
ADD COLUMN     "codigoRecuperacaoEm" TIMESTAMP(3),
ADD COLUMN     "codigoRecuperacaoHash" TEXT;

-- DropTable
DROP TABLE "TokenConta";

-- DropEnum
DROP TYPE "TipoTokenConta";

