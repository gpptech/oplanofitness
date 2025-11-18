import sqlite3
import csv
import re

def clean_numeric_value(value):
    """Limpa e converte valores numéricos, tratando casos especiais"""
    if value is None or value == '' or value == '-':
        return 0.0
    
    # Remove caracteres não numéricos exceto ponto decimal
    cleaned = re.sub(r'[^\d.-]', '', str(value))
    
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def import_csv_to_database(csv_file, db_file):
    """Importa dados do CSV para a tabela alimentos"""
    
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    try:
        # Ler o arquivo CSV
        with open(csv_file, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)
            
            alimentos_data = []
            for row in csv_reader:
                # Processar cada linha, convertendo tipos de dados
                alimento = {
                    'id': int(row['id']),
                    'nome': row['nome'],
                    'categoria': row['categoria'],
                    'porcao_g': clean_numeric_value(row['porcao_g']),
                    'kcal': clean_numeric_value(row['kcal']),
                    'prot_g': clean_numeric_value(row['prot_g']),
                    'carb_g': clean_numeric_value(row['carb_g']),
                    'gord_g': clean_numeric_value(row['gord_g']),
                    'contexto_culinario': row['contexto_culinario'],
                    'incompativel_com': row['incompativel_com'],
                    'cluster_nutricional': int(clean_numeric_value(row['cluster_nutricional'])),
                    'kcal_por_g': clean_numeric_value(row['kcal_por_g']),
                    'prot_por_g': clean_numeric_value(row['prot_por_g']),
                    'preco': row['preco'],
                    'percentual_proteico': clean_numeric_value(row['percentual_proteico']),
                    'velocidade_absorcao': row['velocidade_absorcao']
                }
                alimentos_data.append(alimento)
            
            # Inserir dados na tabela
            insert_sql = """
            INSERT INTO alimentos (
                id, nome, categoria, porcao_g, kcal, prot_g, carb_g, gord_g,
                contexto_culinario, incompativel_com, cluster_nutricional,
                kcal_por_g, prot_por_g, preco, percentual_proteico, velocidade_absorcao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            
            for alimento in alimentos_data:
                cursor.execute(insert_sql, (
                    alimento['id'],
                    alimento['nome'],
                    alimento['categoria'],
                    alimento['porcao_g'],
                    alimento['kcal'],
                    alimento['prot_g'],
                    alimento['carb_g'],
                    alimento['gord_g'],
                    alimento['contexto_culinario'],
                    alimento['incompativel_com'],
                    alimento['cluster_nutricional'],
                    alimento['kcal_por_g'],
                    alimento['prot_por_g'],
                    alimento['preco'],
                    alimento['percentual_proteico'],
                    alimento['velocidade_absorcao']
                ))
            
            conn.commit()
            print(f"✅ Importados {len(alimentos_data)} registros com sucesso!")
            
            # Verificar importação
            cursor.execute("SELECT COUNT(*) FROM alimentos")
            count = cursor.fetchone()[0]
            print(f"✅ Total de registros na tabela: {count}")
            
    except Exception as e:
        print(f"❌ Erro durante a importação: {str(e)}")
        conn.rollback()
    
    finally:
        conn.close()

# Executar a importação
if __name__ == "__main__":
    import_csv_to_database(r'D:\Cursor Projects\plano_alimentar\data\csv\base_alimentos.csv', r'D:\Cursor Projects\plano_alimentar\data\db\alimentos.db')