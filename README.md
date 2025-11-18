# 🍽️ Plano Alimentar - Meal Planning App

Sistema completo de planejamento alimentar personalizado com **IA, tracking nutricional e intermitent fasting protocols**.

## 📋 Overview

Aplicação full-stack para gestão de planos alimentares com:
- 🎯 **Frontend React/TypeScript** - Interface visual para planejar refeições semanais
- 🚀 **Backend FastAPI** - API REST com CRUD de alimentos e refeições
- 🤖 **AI Agent GPT-4** - Interface natural em português para gestão de dados
- 📊 **SMB Tools** - Sistema standalone para montagem e otimização de refeições
- 💾 **Database SQLite** - 121 alimentos brasileiros catalogados

## 🏗️ Estrutura do Projeto

```
plano_alimentar/
├── data/
│   ├── api/              # FastAPI backend + AI Agent
│   │   ├── gestor_alimentos_api.py    # REST API (porta 8001)
│   │   ├── alimentos_agent.py         # AI Agent com GPT-4
│   │   ├── agent_tools.py             # CRUD functions
│   │   ├── prompts.py                 # System prompts
│   │   └── requirements.txt
│   ├── db/               # Database e SQL
│   │   ├── alimentos.db              # SQLite database principal
│   │   └── sql/                      # Scripts SQL
│   ├── scripts/          # Utilitários Python
│   │   ├── db_stats.py
│   │   ├── db_verifica.py
│   │   ├── db_atualiza.py
│   │   └── migrate_alimentos_schema.py
│   ├── csv/              # Dados em CSV
│   │   └── base_alimentos.csv        # 121 alimentos catalogados
│   └── docs/             # Documentação
│
├── SMB/                  # Sistema standalone de montagem de refeições
│   ├── app_registrar_refeicoes_v3.py  # Streamlit app principal
│   ├── montar_refeicoes.py            # Interface visual
│   ├── SMB.py                         # Gerador de refeições com IA
│   └── ...
│
├── src/                  # Frontend TypeScript
│   ├── components/      # Componentes modulares React
│   │   ├── Legenda.tsx                # Símbolos das refeições
│   │   ├── TimelineSemanal.tsx        # Agenda visual semanal
│   │   ├── SugestoesRefeicoes.tsx     # Cards de pratos
│   │   ├── ChatIA.tsx                 # Interface AI Agent
│   │   ├── PainelConfig.tsx           # Configurações (3 abas)
│   │   └── TabelaAlimentos.tsx        # Base de dados
│   └── services/
│       ├── alimentosService.ts       # API client para alimentos
│       └── refeicoesService.ts       # API client para refeições
│
├── meal_planner_app.tsx  # Componente React principal (~1500 linhas)
├── app_config.json       # Configurações visuais e metas
├── CLAUDE.md             # Instruções para Claude Code
└── start.bat             # Launcher completo (backend + frontend)
```

## 🚀 Quick Start

### Requisitos
- **Python 3.11+** com FastAPI, OpenAI SDK
- **Node.js 18+** com Vite
- **OpenAI API Key** (para AI Agent)

### Instalação

1. **Clone o repositório**
```bash
git clone <repo-url>
cd plano_alimentar
```

2. **Configure variáveis de ambiente**
```bash
# Crie arquivo .env na raiz
OPENAI_API_KEY=sk-...
```

3. **Instale dependências**
```bash
# Backend
pip install -r data/api/requirements.txt

# Frontend
npm install
```

4. **Inicie a aplicação**
```bash
# Opção 1: Tudo junto (recomendado)
.\start.bat

# Opção 2: Separadamente
.\start_backend.bat   # Porta 8001
.\start_frontend.bat  # Porta 5173 (será criado)
# ou: npm run dev
```

5. **Acesse**
- **Frontend:** http://localhost:5173
- **API:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs

## 🏗️ Arquitetura Frontend

### Componentes Modulares (React)

O frontend foi projetado com **componentes reutilizáveis** para eliminar duplicação de código:

**Componentes:**
- **[Legenda](src/components/Legenda.tsx)** - Símbolos visuais das refeições (☕ 🥪 🍽️)
- **[TimelineSemanal](src/components/TimelineSemanal.tsx)** - Visualização de agenda com jejum calculado
- **[SugestoesRefeicoes](src/components/SugestoesRefeicoes.tsx)** - Cards de pratos pré-montados
- **[ChatIA](src/components/ChatIA.tsx)** - Interface do AI Agent (fullscreen ou inline)
- **[PainelConfig](src/components/PainelConfig.tsx)** - Configurações (3 abas: Visual, Refeições, Alimentos)
- **[TabelaAlimentos](src/components/TabelaAlimentos.tsx)** - Tabela filtrada/ordenada do banco de dados

**Modos de Visualização:**
1. `pagina-unica` - Todas as seções empilhadas (visão completa)
2. `agenda` - Timeline semanal isolado
3. `sugestoes` - Cards de refeições por tipo
4. `chat` - AI Agent em tela cheia
5. `config` - Painel de configurações em tela cheia
6. `dados` - Base de alimentos em tela cheia

**Benefícios:**
- ✅ Código modular e manutenível
- ✅ Componentes reutilizáveis (1 código = N usos)
- ✅ Props customizáveis (fullscreen, inline, etc.)
- ✅ Zero duplicação de código

## 🎯 Funcionalidades Principais

### Frontend (React/TypeScript)
- ✅ Timeline visual de refeições (6h-23h)
- ✅ Drag & drop de refeições
- ✅ Tracking de macros com tolerância ±15%
- ✅ Cálculo de janelas de jejum (12h, 16h, 24h)
- ✅ Sugestões de refeições do database
- ✅ Builder customizado com categorias de alimentos
- ✅ Chat integrado com AI Agent

### Backend (FastAPI)
- ✅ `GET /api/alimentos` - Lista alimentos com filtros
- ✅ `GET /api/refeicoes` - Lista refeições pré-configuradas
- ✅ `POST /api/agent` - Chat com AI Agent em português

### AI Agent (GPT-4)
- ✅ Linguagem natural em português
- ✅ 14 funções CRUD (7 alimentos + 7 refeições)
- ✅ Sistema de aprovação interativo para operações de escrita
- ✅ Detecção automática de duplicatas
- ✅ Extração estruturada de dados nutricionais

### SMB Tools (Streamlit)
Sistema independente para:
- 📊 Montagem visual de refeições
- 🎲 Geração automática com otimização nutricional
- 📈 Análise e validação de refeições
- 💾 Export SQL para database

## 📚 Database Schema

### alimentos (121 registros)
```sql
id, nome, categoria, porcao_g, kcal, prot_g, carb_g, gord_g,
contexto_culinario, incompativel_com, cluster_nutricional,
kcal_por_g, prot_por_g, preco, percentual_proteico, velocidade_absorcao
```

### refeicoes
```sql
id, nome, tipo, contexto_culinario, descricao, criada_em, ativa
```

### refeicoes_itens (composição)
```sql
id, refeicao_id (FK), alimento_id (FK), gramas, ordem
```

## 🤖 Exemplos de Uso do AI Agent

```python
# Buscar alimentos
"liste os 5 alimentos com mais proteína"
"mostre todos os lanches"

# Criar refeição
"crie uma refeição de café com ovos e aveia"
# Agent apresenta plano → pede confirmação → executa

# Buscar refeições
"quais refeições de almoço temos?"
"mostre detalhes da refeição 1"
```

## 📖 Documentação Adicional

- **[CLAUDE.md](CLAUDE.md)** - Guia completo para Claude Code
- **[data/api/README_AGENT.md](data/api/README_AGENT.md)** - Documentação do AI Agent
- **[readme_estrategia_nutricional.md](readme_estrategia_nutricional.md)** - Estratégia nutricional completa

## 🛠️ Desenvolvimento

### Scripts Úteis
```bash
# Estatísticas do database
python data/scripts/db_stats.py

# Verificar integridade
python data/scripts/db_verifica.py

# Atualizar database a partir de CSV
python data/scripts/db_atualiza.py

# Migração de schema
python data/scripts/migrate_alimentos_schema.py
```

### SMB Tools (Standalone)
```bash
# Interface visual de montagem
streamlit run SMB/montar_refeicoes.py

# App completo com tracking
streamlit run SMB/app_registrar_refeicoes_v3.py

# Gerador automático
python SMB/SMB.py --variants 20
```

## 📊 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- lucide-react

**Backend:**
- FastAPI
- SQLite
- OpenAI GPT-4
- Python 3.11+

**SMB Tools:**
- Streamlit
- Pandas
- Plotly

## 📝 Notas Importantes

- **Dados:** Todos os alimentos são de culinária brasileira (fonte: TBCA)
- **Perfil:** 30M, 181cm, 103kg, 21% BF, atividade alta
- **Meta:** 2200 kcal/dia média com recomposição corporal
- **Exclusões:** Vegetais crus, peixes (exceto sushi), lácteos líquidos, frutas

## 🤝 Contribuindo

Este é um projeto personalizado, mas sugestões e melhorias são bem-vindas via issues ou PRs.

## 📄 Licença

MIT License - uso livre para fins pessoais e educacionais.

---

🤖 **Desenvolvido com Claude Code** | 📧 Gabriel Pitta
