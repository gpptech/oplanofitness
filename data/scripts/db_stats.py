import sqlite3
import math
import pandas as pd

# Caminho do banco SQLite
db_path = r"D:\Cursor Projects\plano_alimentar\data\db\alimentos.db"

# Conecta ao banco
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Pega todas as tabelas (exceto internas)
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
tabelas = [row[0] for row in cursor.fetchall()]

estatisticas = []

for tabela in tabelas:
    cursor.execute(f"PRAGMA table_info({tabela});")
    colunas = cursor.fetchall()
    colunas_numericas = [c[1] for c in colunas if any(t in (c[2] or '').upper() for t in ['INT', 'REAL', 'NUMERIC'])]

    for coluna in colunas_numericas:
        try:
            # Executa as estatísticas básicas
            cursor.execute(f"""
                SELECT 
                    COUNT(*) as total,
                    COUNT(DISTINCT {coluna}) as distintos,
                    SUM(CASE WHEN {coluna} IS NULL THEN 1 ELSE 0 END) as nulos,
                    AVG({coluna}) as media,
                    MIN({coluna}) as minimo,
                    MAX({coluna}) as maximo
                FROM {tabela};
            """)
            total, distintos, nulos, media, minimo, maximo = cursor.fetchone()

            # Calcula desvio padrão manualmente
            if media is not None:
                cursor.execute(f"SELECT AVG(({coluna} - {media})*({coluna} - {media})) FROM {tabela};")
                variancia = cursor.fetchone()[0]
                desvio = math.sqrt(variancia) if variancia is not None else None
            else:
                desvio = None

            estatisticas.append({
                "tabela": tabela,
                "coluna": coluna,
                "count_total": total,
                "count_distintos": distintos,
                "count_nulos": nulos,
                "media": media,
                "minimo": minimo,
                "maximo": maximo,
                "desvio_padrao": desvio
            })

        except Exception as e:
            print(f"Erro em {tabela}.{coluna}: {e}")

# Cria DataFrame e exibe
df = pd.DataFrame(estatisticas)
print(df)

# (opcional) salva em CSV
#df.to_csv("estatisticas_descritivas.csv", index=False)

conn.close()
