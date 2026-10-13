-- Categorias de item personalizáveis: o enum vira tabela (fixas do sistema + criadas por cada mestre).
-- Ordem importa: a tabela "CategoriaItem" só pode ser criada depois de remover o enum de mesmo nome.

-- 1. Itens e moldes guardam o id da categoria, convertido do valor antigo do enum (ids fixos abaixo).
ALTER TABLE "Item" ADD COLUMN "categoriaId" UUID;
ALTER TABLE "ItemModelo" ADD COLUMN "categoriaId" UUID;
UPDATE "Item" SET "categoriaId" = CASE "categoria"::text
  WHEN 'ARMA' THEN '00000000-0000-4000-8004-000000000001'::uuid
  WHEN 'TAVERNA' THEN '00000000-0000-4000-8004-000000000003'::uuid
  WHEN 'SEBO' THEN '00000000-0000-4000-8004-000000000004'::uuid
  ELSE '00000000-0000-4000-8004-000000000002'::uuid END;
UPDATE "ItemModelo" SET "categoriaId" = CASE "categoria"::text
  WHEN 'ARMA' THEN '00000000-0000-4000-8004-000000000001'::uuid
  WHEN 'TAVERNA' THEN '00000000-0000-4000-8004-000000000003'::uuid
  WHEN 'SEBO' THEN '00000000-0000-4000-8004-000000000004'::uuid
  ELSE '00000000-0000-4000-8004-000000000002'::uuid END;
ALTER TABLE "Item" DROP COLUMN "categoria";
ALTER TABLE "ItemModelo" DROP COLUMN "categoria";
DROP TYPE "CategoriaItem";

-- 2. Tabela de categorias.
CREATE TABLE "CategoriaItem" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "icone" TEXT NOT NULL DEFAULT 'pacote',
    "ordem" INTEGER NOT NULL DEFAULT 100,
    "donoId" UUID,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoriaItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CategoriaItem_donoId_idx" ON "CategoriaItem"("donoId");
CREATE UNIQUE INDEX "CategoriaItem_donoId_nome_key" ON "CategoriaItem"("donoId", "nome");
ALTER TABLE "CategoriaItem" ADD CONSTRAINT "CategoriaItem_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. As 4 categorias fixas do sistema (o seed também garante).
INSERT INTO "CategoriaItem" ("id", "nome", "descricao", "icone", "ordem", "donoId") VALUES
  ('00000000-0000-4000-8004-000000000001', 'Armas', 'Espadas, arcos, cajados: o que se usa para lutar.', 'espada', 1, NULL),
  ('00000000-0000-4000-8004-000000000002', 'Artefatos', 'Objetos especiais, mágicos ou raros.', 'joia', 2, NULL),
  ('00000000-0000-4000-8004-000000000003', 'Taverna', 'Comidas, bebidas, poções e outros consumíveis.', 'caneca', 3, NULL),
  ('00000000-0000-4000-8004-000000000004', 'Sebo', 'Livros, mapas, pergaminhos e achados usados.', 'livro', 4, NULL);

-- 4. Chaves estrangeiras (excluir a categoria deixa o item sem categoria).
ALTER TABLE "ItemModelo" ADD CONSTRAINT "ItemModelo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Nada exposto pela Data API do Supabase.
ALTER TABLE "CategoriaItem" ENABLE ROW LEVEL SECURITY;
