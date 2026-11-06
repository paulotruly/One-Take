-- Sem conteúdo verificado: tudo é da própria conta (decisão de 2026-11-06). Os índices de "verificado" caem junto com as colunas.
-- O cargo continua no banco, sem efeito nas permissões. Conta nova começa vazia: sai o controle da cópia das perícias base.
ALTER TABLE "Classe" DROP COLUMN "verificado";
ALTER TABLE "Raca" DROP COLUMN "verificado";
ALTER TABLE "Atributo" DROP COLUMN "verificado";
ALTER TABLE "Pericia" DROP COLUMN "verificado";
ALTER TABLE "Status" DROP COLUMN "verificado";
ALTER TABLE "CategoriaItem" DROP COLUMN "verificado";
ALTER TABLE "CategoriaStatus" DROP COLUMN "verificado";
ALTER TABLE "ItemModelo" DROP COLUMN "verificado";
ALTER TABLE "Besta" DROP COLUMN "verificado";
ALTER TABLE "Npc" DROP COLUMN "verificado";
ALTER TABLE "Kit" DROP COLUMN "verificado";
ALTER TABLE "ClasseConceito" DROP COLUMN "verificado";
ALTER TABLE "RacaConceito" DROP COLUMN "verificado";
ALTER TABLE "BestaConceito" DROP COLUMN "verificado";
ALTER TABLE "Perfil" DROP COLUMN "ocultarVerificados";
ALTER TABLE "Perfil" DROP COLUMN "catalogoIniciado";
