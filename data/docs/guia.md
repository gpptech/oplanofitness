# Guia para Criar `novositens.csv` - Estrutura Completa

## 📋 COLUNAS OBRIGATÓRIAS (exatamente nesta ordem):

```csv
nome,categoria,porcao_g,kcal,prot_g,carb_g,gord_g,contexto_culinario,incompativel_com,velocidade_absorcao,preco
```

## 🎯 FORMATO DE CADA COLUNA:

### **nome** (Texto)
- Nome descritivo do alimento
- Ex: `"Pão integral (2 fatias)"`, `"Queijo branco fatia"`

### **categoria** (Texto - Valores Fixos)
Use uma destas categorias existentes:
- `Carne Vermelha`, `Frango`, `Peixe`, `Embutidos`, `Ovos`
- `Arroz`, `Feijão`, `Massas`, `Batatas`, `Outros Carboidratos`
- `Pães/Lanches`, `Queijos/Laticínios`, `Pratos Combinados`
- `Fast-Food Caseiro`, `Japonês`, `Bebidas Alcoólicas`
- `Suplementos`, `Doces/Sobremesas`, `Frutas`, `Legumes`, `Snacks`, `Cereais`, `Grãos`, `Vegetariano`

### **porcao_g** (Número Decimal)
- Peso em gramas da porção
- Ex: `150.0`, `50.0`, `200.0`

### **kcal** (Número Inteiro)
- Calorias totais da porção
- Ex: `150`, `300`, `85`

### **prot_g** (Número Decimal)
- Proteínas em gramas
- Ex: `6.0`, `15.0`, `4.0`

### **carb_g** (Número Decimal)
- Carboidratos em gramas
- Ex: `28.0`, `15.0`, `22.0`

### **gord_g** (Número Decimal)
- Gorduras em gramas
- Ex: `2.0`, `6.0`, `0.0`

### **contexto_culinario** (Texto - Múltiplos valores com |)
- Contextos separados por `|`
- Valores possíveis: `Café`, `Almoço`, `Lanche`, `Jantar`, `Lixo`
- Ex: `Café|Lanche`, `Almoço|Jantar`

### **incompativel_com** (Texto - Múltiplos valores com |)
- Contextos onde NÃO deve ser usado
- Ex: `Almoço|Jantar|Lixo`, `Café|Almoço|Jantar`

### **velocidade_absorcao** (Texto - Valores Fixos)
Use um destes:
- `Rápida`, `Média`, `Lenta`, `Muito Rápida`, `Mista`, `-`

### **preco** (Texto - Valores Fixos)
Use um destes símbolos:
- `$` (barato), `$$`, `$$$`, `$$$$` (muito caro)

## 📝 EXEMPLO PRÁTICO:

```csv
nome,categoria,porcao_g,kcal,prot_g,carb_g,gord_g,contexto_culinario,incompativel_com,velocidade_absorcao,preco
Pão integral (2 fatias),Pães,60,150,6,28,2,Café|Lanche,Almoço|Jantar|Lixo,Média,$
Queijo branco fatia,Queijos/Laticínios,30,50,5,1,2,Café|Lanche,Almoço|Jantar|Lixo,Lenta,$
Tapioca,Pães/Lanches,30,90,0,23,0,Café|Lanche,Almoço|Jantar|Lixo,Rápida,$
```

## ⚠️ DICAS IMPORTANTES:

1. **NÃO inclua a coluna `id`** - é gerada automaticamente
2. **Mantenha a ordem das colunas** exatamente como acima
3. **Use pontos decimais**, não vírgulas: `150.0` ✓ `150,0` ✗
4. **Verifique nomes duplicados** - o script ignora automaticamente
5. **Salve como CSV** com codificação UTF-8

## 🔍 VERIFICAÇÃO FINAL:
Antes de salvar, confirme que:
- Todas as 11 colunas estão presentes
- Valores numéricos usam ponto decimal
- Categorias e velocidades usam os valores fixos
- Preços usam $, $$, $$$ ou $$$$
- Contextos usam `|` para separar múltiplos valores

O script calculará automaticamente: `kcal_por_g`, `prot_por_g`, `percentual_proteico` e `cluster_nutricional`.