-- Listar todas as tabelas no banco de dados
SELECT name FROM sqlite_master WHERE type='table';

-- Ver a estrutura completa de uma tabela específica (substitua 'alimentos' se necessário)
SELECT sql FROM sqlite_master WHERE type='table' AND name='alimentos';

-- Para ver o esquema de todas as tabelas de uma vez
SELECT name, sql 
FROM sqlite_master 
WHERE type='table' 
ORDER BY name;

SELECT * FROM refeicoes LIMIT 100;
SELECT * FROM refeicoes_itens LIMIT 100;
SELECT * FROM alimentos LIMIT 100;
SELECT * FROM historico_refeicoes LIMIT 100;
SELECT * FROM historico_itens LIMIT 100;