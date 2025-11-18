ALTER TABLE alimentos
ADD COLUMN densidade_kcal REAL;

UPDATE alimentos 
SET densidade_kcal = round(kcal / porcao_g,1);

SELECT
    nome,
    kcal_por_g,
    densidade_kcal,
    (kcal_por_g = densidade_kcal) AS iguais
FROM alimentos
LIMIT 100;

ALTER TABLE alimentos
DROP COLUMN densidade_kcal;