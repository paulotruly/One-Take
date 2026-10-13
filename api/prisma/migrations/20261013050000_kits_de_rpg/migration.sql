-- Kits de RPG: substituem o "exclusivo de um grupo". Uma coisa pode estar em vários kits; sem kit = geral.

-- AlterTable
ALTER TABLE "Grupo" ADD COLUMN     "kitId" UUID;

-- CreateTable
CREATE TABLE "Kit" (
    "id" UUID NOT NULL,
    "donoId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitClasse" (
    "kitId" UUID NOT NULL,
    "classeId" UUID NOT NULL,

    CONSTRAINT "KitClasse_pkey" PRIMARY KEY ("kitId","classeId")
);

-- CreateTable
CREATE TABLE "KitRaca" (
    "kitId" UUID NOT NULL,
    "racaId" UUID NOT NULL,

    CONSTRAINT "KitRaca_pkey" PRIMARY KEY ("kitId","racaId")
);

-- CreateTable
CREATE TABLE "KitAtributo" (
    "kitId" UUID NOT NULL,
    "atributoId" UUID NOT NULL,

    CONSTRAINT "KitAtributo_pkey" PRIMARY KEY ("kitId","atributoId")
);

-- CreateTable
CREATE TABLE "KitPericia" (
    "kitId" UUID NOT NULL,
    "periciaId" UUID NOT NULL,

    CONSTRAINT "KitPericia_pkey" PRIMARY KEY ("kitId","periciaId")
);

-- CreateTable
CREATE TABLE "KitStatus" (
    "kitId" UUID NOT NULL,
    "statusId" UUID NOT NULL,

    CONSTRAINT "KitStatus_pkey" PRIMARY KEY ("kitId","statusId")
);

-- CreateTable
CREATE TABLE "KitItemModelo" (
    "kitId" UUID NOT NULL,
    "itemModeloId" UUID NOT NULL,

    CONSTRAINT "KitItemModelo_pkey" PRIMARY KEY ("kitId","itemModeloId")
);

-- CreateTable
CREATE TABLE "KitBesta" (
    "kitId" UUID NOT NULL,
    "bestaId" UUID NOT NULL,

    CONSTRAINT "KitBesta_pkey" PRIMARY KEY ("kitId","bestaId")
);

-- CreateTable
CREATE TABLE "KitNpc" (
    "kitId" UUID NOT NULL,
    "npcId" UUID NOT NULL,

    CONSTRAINT "KitNpc_pkey" PRIMARY KEY ("kitId","npcId")
);

-- CreateIndex
CREATE INDEX "Kit_donoId_idx" ON "Kit"("donoId");

-- CreateIndex
CREATE INDEX "KitClasse_classeId_idx" ON "KitClasse"("classeId");

-- CreateIndex
CREATE INDEX "KitRaca_racaId_idx" ON "KitRaca"("racaId");

-- CreateIndex
CREATE INDEX "KitAtributo_atributoId_idx" ON "KitAtributo"("atributoId");

-- CreateIndex
CREATE INDEX "KitPericia_periciaId_idx" ON "KitPericia"("periciaId");

-- CreateIndex
CREATE INDEX "KitStatus_statusId_idx" ON "KitStatus"("statusId");

-- CreateIndex
CREATE INDEX "KitItemModelo_itemModeloId_idx" ON "KitItemModelo"("itemModeloId");

-- CreateIndex
CREATE INDEX "KitBesta_bestaId_idx" ON "KitBesta"("bestaId");

-- CreateIndex
CREATE INDEX "KitNpc_npcId_idx" ON "KitNpc"("npcId");

-- AddForeignKey
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kit" ADD CONSTRAINT "Kit_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitClasse" ADD CONSTRAINT "KitClasse_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitClasse" ADD CONSTRAINT "KitClasse_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitRaca" ADD CONSTRAINT "KitRaca_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitRaca" ADD CONSTRAINT "KitRaca_racaId_fkey" FOREIGN KEY ("racaId") REFERENCES "Raca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitAtributo" ADD CONSTRAINT "KitAtributo_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitAtributo" ADD CONSTRAINT "KitAtributo_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "Atributo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitPericia" ADD CONSTRAINT "KitPericia_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitPericia" ADD CONSTRAINT "KitPericia_periciaId_fkey" FOREIGN KEY ("periciaId") REFERENCES "Pericia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitStatus" ADD CONSTRAINT "KitStatus_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitStatus" ADD CONSTRAINT "KitStatus_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitItemModelo" ADD CONSTRAINT "KitItemModelo_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitItemModelo" ADD CONSTRAINT "KitItemModelo_itemModeloId_fkey" FOREIGN KEY ("itemModeloId") REFERENCES "ItemModelo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitBesta" ADD CONSTRAINT "KitBesta_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitBesta" ADD CONSTRAINT "KitBesta_bestaId_fkey" FOREIGN KEY ("bestaId") REFERENCES "Besta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitNpc" ADD CONSTRAINT "KitNpc_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitNpc" ADD CONSTRAINT "KitNpc_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "Npc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Converte "exclusivo de um grupo" em kits: cada grupo com algo exclusivo ganha um kit com o nome dele,
-- o grupo passa a usar esse kit e as coisas exclusivas entram no kit.
CREATE TEMP TABLE "_kit_do_grupo" AS
  SELECT g."id" AS "grupoId", gen_random_uuid() AS "kitId", g."mestreId", g."titulo"
  FROM "Grupo" g
  WHERE EXISTS (SELECT 1 FROM "Classe" WHERE "grupoExclusivoId" = g."id")
     OR EXISTS (SELECT 1 FROM "Raca" WHERE "grupoExclusivoId" = g."id")
     OR EXISTS (SELECT 1 FROM "Atributo" WHERE "grupoExclusivoId" = g."id")
     OR EXISTS (SELECT 1 FROM "ItemModelo" WHERE "grupoExclusivoId" = g."id")
     OR EXISTS (SELECT 1 FROM "Besta" WHERE "grupoExclusivoId" = g."id")
     OR EXISTS (SELECT 1 FROM "Npc" WHERE "grupoExclusivoId" = g."id");
INSERT INTO "Kit" ("id", "donoId", "nome", "descricao", "atualizadoEm")
  SELECT "kitId", "mestreId", "titulo", 'Criado a partir do que era exclusivo do grupo.', CURRENT_TIMESTAMP FROM "_kit_do_grupo";
UPDATE "Grupo" g SET "kitId" = k."kitId" FROM "_kit_do_grupo" k WHERE g."id" = k."grupoId";
INSERT INTO "KitClasse" ("kitId", "classeId") SELECT k."kitId", c."id" FROM "Classe" c JOIN "_kit_do_grupo" k ON k."grupoId" = c."grupoExclusivoId";
INSERT INTO "KitRaca" ("kitId", "racaId") SELECT k."kitId", r."id" FROM "Raca" r JOIN "_kit_do_grupo" k ON k."grupoId" = r."grupoExclusivoId";
INSERT INTO "KitAtributo" ("kitId", "atributoId") SELECT k."kitId", a."id" FROM "Atributo" a JOIN "_kit_do_grupo" k ON k."grupoId" = a."grupoExclusivoId";
INSERT INTO "KitPericia" ("kitId", "periciaId") SELECT k."kitId", p."id" FROM "Pericia" p JOIN "Atributo" a ON a."id" = p."atributoId" JOIN "_kit_do_grupo" k ON k."grupoId" = a."grupoExclusivoId";
INSERT INTO "KitItemModelo" ("kitId", "itemModeloId") SELECT k."kitId", m."id" FROM "ItemModelo" m JOIN "_kit_do_grupo" k ON k."grupoId" = m."grupoExclusivoId";
INSERT INTO "KitBesta" ("kitId", "bestaId") SELECT k."kitId", b."id" FROM "Besta" b JOIN "_kit_do_grupo" k ON k."grupoId" = b."grupoExclusivoId";
INSERT INTO "KitNpc" ("kitId", "npcId") SELECT k."kitId", n."id" FROM "Npc" n JOIN "_kit_do_grupo" k ON k."grupoId" = n."grupoExclusivoId";
-- Itens que estão com NPCs não pertencem mais a grupo (o NPC não é mais "do grupo").
UPDATE "Item" SET "grupoId" = NULL WHERE "npcId" IS NOT NULL;
DROP TABLE "_kit_do_grupo";

-- Sai a exclusividade por grupo.
-- DropForeignKey
ALTER TABLE "Atributo" DROP CONSTRAINT "Atributo_grupoExclusivoId_fkey";

-- DropForeignKey
ALTER TABLE "Besta" DROP CONSTRAINT "Besta_grupoExclusivoId_fkey";

-- DropForeignKey
ALTER TABLE "Classe" DROP CONSTRAINT "Classe_grupoExclusivoId_fkey";

-- DropForeignKey
ALTER TABLE "ItemModelo" DROP CONSTRAINT "ItemModelo_grupoExclusivoId_fkey";

-- DropForeignKey
ALTER TABLE "Npc" DROP CONSTRAINT "Npc_grupoExclusivoId_fkey";

-- DropForeignKey
ALTER TABLE "Raca" DROP CONSTRAINT "Raca_grupoExclusivoId_fkey";

-- DropIndex
DROP INDEX "Npc_grupoExclusivoId_idx";

-- AlterTable
ALTER TABLE "Atributo" DROP COLUMN "grupoExclusivoId";

-- AlterTable
ALTER TABLE "Besta" DROP COLUMN "grupoExclusivoId";

-- AlterTable
ALTER TABLE "Classe" DROP COLUMN "grupoExclusivoId";

-- AlterTable
ALTER TABLE "ItemModelo" DROP COLUMN "grupoExclusivoId";

-- AlterTable
ALTER TABLE "Npc" DROP COLUMN "grupoExclusivoId";

-- AlterTable
ALTER TABLE "Raca" DROP COLUMN "grupoExclusivoId";

-- Nada exposto pela Data API do Supabase.
ALTER TABLE "Kit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KitClasse" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KitRaca" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KitAtributo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KitPericia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KitStatus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KitItemModelo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KitBesta" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KitNpc" ENABLE ROW LEVEL SECURITY;
