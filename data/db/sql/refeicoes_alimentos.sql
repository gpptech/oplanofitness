SELECT
    r.*,
    alimentos.nome,
    alimentos.contexto_culinario
FROM
    (SELECT
        r.id, r.nome, r.descricao, r.tipo, ri.alimento_id
    FROM refeicoes r
    JOIN refeicoes_itens ri ON ri.refeicao_id = r.id) AS r
JOIN alimentos ON r.alimento_id = alimentos.id