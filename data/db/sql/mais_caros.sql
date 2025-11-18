SELECT
    categoria,
    nome,
    preco,
    length(preco) as qtd_preco
FROM alimentos
ORDER BY qtd_preco DESC
LIMIT 30