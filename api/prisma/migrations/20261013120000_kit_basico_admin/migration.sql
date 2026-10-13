-- Administrador do sistema e kit básico do One-Take (kit de RPG do admin que todo mestre vê, só leitura).
-- AlterTable
ALTER TABLE "Perfil" ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Sistema" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "kitBasicoId" UUID,

    CONSTRAINT "Sistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sistema_kitBasicoId_key" ON "Sistema"("kitBasicoId");

-- AddForeignKey
ALTER TABLE "Sistema" ADD CONSTRAINT "Sistema_kitBasicoId_fkey" FOREIGN KEY ("kitBasicoId") REFERENCES "Kit"("id") ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE "Sistema" ADD CONSTRAINT "Sistema_linha_unica" CHECK ("id" = 1);
INSERT INTO "Sistema" ("id") VALUES (1) ON CONFLICT DO NOTHING;
ALTER TABLE "Sistema" ENABLE ROW LEVEL SECURITY;
