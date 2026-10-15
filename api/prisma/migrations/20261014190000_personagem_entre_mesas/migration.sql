-- Personagem entre mesas: a ficha arquivada guarda a classe e a raça de origem, e há um motivo novo de arquivamento.
ALTER TYPE "MotivoArquivamento" ADD VALUE 'LEVADO_PARA_OUTRA_MESA';
ALTER TABLE "FichaArquivada" ADD COLUMN "classeId" UUID;
ALTER TABLE "FichaArquivada" ADD COLUMN "racaId" UUID;
