import sqlite3
import csv
import re

def verify_import(db_file):
    """Verifica se a importação foi bem sucedida"""
    
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    try:
        # Verificar estrutura da tabela
        cursor.execute("PRAGMA table_info(alimentos)")
        columns = cursor.fetchall()
        print("📋 Estrutura da tabela alimentos:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
        # Verificar alguns registros
        print("\n🔍 Amostra de registros importados:")
        cursor.execute("""
            SELECT id, nome, categoria, kcal, prot_g 
            FROM alimentos 
            ORDER BY id 
            LIMIT 5
        """)
        sample = cursor.fetchall()
        for row in sample:
            print(f"  ID {row[0]}: {row[1]} - {row[2]} - {row[3]}kcal - {row[4]}g proteína")
        
        # Contagem por categoria
        print("\n📊 Distribuição por categoria:")
        cursor.execute("""
            SELECT categoria, COUNT(*) 
            FROM alimentos 
            GROUP BY categoria 
            ORDER BY COUNT(*) DESC
        """)
        categories = cursor.fetchall()
        for cat, count in categories:
            print(f"  {cat}: {count} registros")
            
    except Exception as e:
        print(f"❌ Erro na verificação: {str(e)}")
    
    finally:
        conn.close()

# Executar verificação
verify_import(r'D:\Cursor Projects\plano_alimentar\data\db\alimentos.db')