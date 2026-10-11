-- CreateTable
CREATE TABLE "Raca" (
    "id" UUID NOT NULL,
    "donoId" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "deslocamento" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Raca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RacaPericia" (
    "racaId" UUID NOT NULL,
    "periciaId" UUID NOT NULL,
    "pontos" INTEGER NOT NULL,

    CONSTRAINT "RacaPericia_pkey" PRIMARY KEY ("racaId","periciaId")
);

-- CreateIndex
CREATE INDEX "Raca_donoId_idx" ON "Raca"("donoId");

-- CreateIndex
CREATE INDEX "RacaPericia_periciaId_idx" ON "RacaPericia"("periciaId");

-- AddForeignKey
ALTER TABLE "Raca" ADD CONSTRAINT "Raca_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "Perfil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RacaPericia" ADD CONSTRAINT "RacaPericia_racaId_fkey" FOREIGN KEY ("racaId") REFERENCES "Raca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RacaPericia" ADD CONSTRAINT "RacaPericia_periciaId_fkey" FOREIGN KEY ("periciaId") REFERENCES "Pericia"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Regras que o Prisma não expressa.
ALTER TABLE "Raca" ADD CONSTRAINT "Raca_deslocamento_minimo_1" CHECK ("deslocamento" >= 1);
ALTER TABLE "RacaPericia" ADD CONSTRAINT "RacaPericia_pontos_minimo_1" CHECK ("pontos" >= 1);

-- Nada exposto pela Data API do Supabase.
ALTER TABLE "Raca" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RacaPericia" ENABLE ROW LEVEL SECURITY;
