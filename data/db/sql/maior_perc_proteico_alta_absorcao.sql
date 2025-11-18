SELECT
    nome,
    percentual_proteico,
    velocidade_absorcao
FROM alimentos
WHERE velocidade_absorcao = "Rápida"
ORDER BY CAST(percentual_proteico AS REAL)/100 DESC
LIMIT 5