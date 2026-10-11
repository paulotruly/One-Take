-- Login por nickname: cada perfil ganha um nickname único (minúsculo, sem "@").
ALTER TABLE "Perfil" ADD COLUMN "nickname" TEXT;

-- Conta do dono do projeto: @paulo (pedido explícito).
UPDATE "Perfil" SET "nickname" = 'paulo' WHERE "email" = 'paulomsmsms@gmail.com';

-- Demais perfis: parte do email antes do "@", só [a-z0-9_.-]; repetidos ganham sufixo numérico.
WITH base AS (
  SELECT "id",
         COALESCE(NULLIF(regexp_replace(lower(split_part("email", '@', 1)), '[^a-z0-9_.-]', '', 'g'), ''), 'usuario') AS nick
  FROM "Perfil" WHERE "nickname" IS NULL
), numerado AS (
  SELECT "id", nick, ROW_NUMBER() OVER (PARTITION BY nick ORDER BY "id") AS n FROM base
)
UPDATE "Perfil" p
SET "nickname" = CASE WHEN numerado.n = 1 AND NOT EXISTS (SELECT 1 FROM "Perfil" x WHERE x."nickname" = numerado.nick)
                      THEN numerado.nick ELSE numerado.nick || numerado.n END
FROM numerado WHERE numerado."id" = p."id";

ALTER TABLE "Perfil" ALTER COLUMN "nickname" SET NOT NULL;
CREATE UNIQUE INDEX "Perfil_nickname_key" ON "Perfil"("nickname");
