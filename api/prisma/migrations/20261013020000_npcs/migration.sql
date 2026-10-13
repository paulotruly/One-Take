-- NPCs do mestre (com ficha e inventário). Itens podem estar com um NPC; item de NPC geral pode não ter grupo.

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "npcId" UUID,
ALTER COLUMN "grupoId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Npc" (
    "id" UUID NOT NULL,
    "donoId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "imagemUrl" TEXT,
    "racaId" UUID NOT NULL,
    "classeId" UUID,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "vidaBase" INTEGER,
    "manaBase" INTEGER,
    "esforcoBase" INTEGER,
    "vidaAtual" INTEGER NOT NULL,
    "manaAtual" INTEGER NOT NULL,
    "esforcoAtual" INTEGER NOT NULL,
    "grupoExclusivoId" UUID,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Npc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NpcAtributo" (
    "npcId" UUID NOT NULL,
    "atributoId" UUID NOT NULL,
    "dados" INTEGER NOT NULL,

    CONSTRAINT "NpcAtributo_pkey" PRIMARY KEY ("npcId","atributoId")
);

-- CreateTable
CREATE TABLE "NpcPericia" (
    "npcId" UUID NOT NULL,
    "periciaId" UUID NOT NULL,
    "pontos" INTEGER NOT NULL,

    CONSTRAINT "NpcPericia_pkey" PRIMARY KEY ("npcId","periciaId")
);

-- CreateIndex
CREATE INDEX "Npc_donoId_idx" ON "Npc"("donoId");

-- CreateIndex
CREATE INDEX "Npc_grupoExclusivoId_idx" ON "Npc"("grupoExclusivoId");

-- CreateIndex
CREATE INDEX "Item_npcId_idx" ON "Item"("npcId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "Npc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_racaId_fkey" FOREIGN KEY ("racaId") REFERENCES "Raca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_grupoExclusivoId_fkey" FOREIGN KEY ("grupoExclusivoId") REFERENCES "Grupo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcAtributo" ADD CONSTRAINT "NpcAtributo_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "Npc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcAtributo" ADD CONSTRAINT "NpcAtributo_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "Atributo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcPericia" ADD CONSTRAINT "NpcPericia_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "Npc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcPericia" ADD CONSTRAINT "NpcPericia_periciaId_fkey" FOREIGN KEY ("periciaId") REFERENCES "Pericia"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Regras que o Prisma não expressa.
ALTER TABLE "Item" ADD CONSTRAINT "Item_dono" CHECK ("grupoId" IS NOT NULL OR "npcId" IS NOT NULL);
ALTER TABLE "Item" ADD CONSTRAINT "Item_um_portador" CHECK ("fichaId" IS NULL OR "npcId" IS NULL);
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_nivel" CHECK ("nivel" >= 1);
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_base" CHECK ("classeId" IS NOT NULL OR ("vidaBase" >= 1 AND "manaBase" >= 1 AND "esforcoBase" >= 1));
ALTER TABLE "NpcAtributo" ADD CONSTRAINT "NpcAtributo_dados" CHECK ("dados" >= 0);

-- Nada exposto pela Data API do Supabase.
ALTER TABLE "Npc" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NpcAtributo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NpcPericia" ENABLE ROW LEVEL SECURITY;
