SELECT
    nome,
    preco,
    prot_g,
    qtd_preco,
    ROUND(prot_g / qtd_preco,2) AS prot_g_por_dolar
FROM (
    SELECT
        nome,
        preco,
        prot_g,
        length(preco) AS qtd_preco
    FROM alimentos
)
ORDER BY prot_g_por_dolar DESC
LIMIT 10