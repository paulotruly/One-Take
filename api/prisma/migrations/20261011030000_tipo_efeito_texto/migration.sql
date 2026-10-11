-- Tipo de efeito passa a ser texto livre (descritivo) em vez de enum.
ALTER TABLE "Habilidade" ALTER COLUMN "tipoEfeito" TYPE TEXT USING (
  CASE "tipoEfeito"::text
    WHEN 'DANO' THEN 'Dano'
    WHEN 'SUPORTE' THEN 'Suporte'
    WHEN 'BUFF' THEN 'Buff'
    WHEN 'DEBUFF' THEN 'Debuff'
    ELSE 'Outro'
  END
);
DROP TYPE "TipoEfeito";
