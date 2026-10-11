-- Nenhuma classe pode começar com vida, mana ou esforço zerados: mínimo 1 em cada.
ALTER TABLE "Classe" DROP CONSTRAINT "Classe_pontos_nao_negativos";
ALTER TABLE "Classe" ADD CONSTRAINT "Classe_pontos_minimo_1"
  CHECK ("pontosVida" >= 1 AND "pontosMana" >= 1 AND "pontosEsforco" >= 1);
