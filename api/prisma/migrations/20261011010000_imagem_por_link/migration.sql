-- Imagem da classe passa a ser um link externo em vez de arquivo no Storage.
ALTER TABLE "Classe" RENAME COLUMN "imagemPath" TO "imagemUrl";
