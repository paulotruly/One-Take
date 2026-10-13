-- O grid de batalha é físico (na mesa), não fica no sistema: sai o tamanho do grid do grupo e a posição das criaturas.
ALTER TABLE "Grupo" DROP CONSTRAINT IF EXISTS "Grupo_grid";
ALTER TABLE "Grupo" DROP COLUMN "gridColunas",
DROP COLUMN "gridLinhas";
ALTER TABLE "Criatura" DROP COLUMN "x",
DROP COLUMN "y";
