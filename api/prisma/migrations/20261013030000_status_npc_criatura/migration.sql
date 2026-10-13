-- Status aplicados pelo mestre em NPCs e criaturas invocadas.

-- CreateTable
CREATE TABLE "NpcStatus" (
    "npcId" UUID NOT NULL,
    "statusId" UUID NOT NULL,
    "aplicadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NpcStatus_pkey" PRIMARY KEY ("npcId","statusId")
);

-- CreateTable
CREATE TABLE "CriaturaStatus" (
    "criaturaId" UUID NOT NULL,
    "statusId" UUID NOT NULL,
    "aplicadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CriaturaStatus_pkey" PRIMARY KEY ("criaturaId","statusId")
);

-- AddForeignKey
ALTER TABLE "NpcStatus" ADD CONSTRAINT "NpcStatus_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "Npc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NpcStatus" ADD CONSTRAINT "NpcStatus_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriaturaStatus" ADD CONSTRAINT "CriaturaStatus_criaturaId_fkey" FOREIGN KEY ("criaturaId") REFERENCES "Criatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriaturaStatus" ADD CONSTRAINT "CriaturaStatus_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Nada exposto pela Data API do Supabase.
ALTER TABLE "NpcStatus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CriaturaStatus" ENABLE ROW LEVEL SECURITY;
