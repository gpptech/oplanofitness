# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **meal planner application** for Gabriel Pitta's personalized nutrition strategy. It's a single-page React/TypeScript application that helps visualize and manage weekly meal plans with intermittent fasting protocols and macro tracking.

The app implements a complex nutritional strategy featuring:
- Multiple intermittent fasting protocols (12h, 16h, 24h)
- Macro-tracking with tolerance ranges (±15%)
- Visual timeline for meal scheduling and fasting windows
- Food database with 121 cataloged Brazilian foods

## Architecture

### Full-Stack Architecture (Updated Oct 2025)

**Project Structure:**
```
plano_alimentar/
├── data/
│   ├── api/              # Backend FastAPI + AI Agent
│   ├── db/               # SQLite database + SQL scripts
│   ├── scripts/          # Python utilities
│   ├── csv/              # Data files
│   └── docs/             # Documentation
├── SMB/                  # Standalone meal planning tools
├── src/services/         # Frontend TypeScript services
└── meal_planner_app.tsx  # Main React component
```

**Backend:**
- **Database:** SQLite ([data/db/alimentos.db](data/db/alimentos.db))
  - Single consolidated database with 3 tables
  - 121 Brazilian foods with complete nutritional data
  - Pre-configured meals with composition
- **API:** FastAPI ([data/api/gestor_alimentos_api.py](data/api/gestor_alimentos_api.py))
  - Single consolidated API on port 8001
  - Endpoints: `/api/alimentos`, `/api/refeicoes`, `/api/agent`
- **AI Agent:** OpenAI GPT-4 with function calling ([data/api/alimentos_agent.py](data/api/alimentos_agent.py))
  - Natural language CRUD operations
  - Interactive approval workflow for write operations
  - 14 database functions (7 foods + 7 meals)

**Frontend:**
- **Main app:** [meal_planner_app.tsx](meal_planner_app.tsx) - React app with state management
- **Components:** Modular React components in [src/components/](src/components/)
  - [Legenda.tsx](src/components/Legenda.tsx) - Meal symbols
  - [TimelineSemanal.tsx](src/components/TimelineSemanal.tsx) - Weekly agenda with fasting
  - [SugestoesRefeicoes.tsx](src/components/SugestoesRefeicoes.tsx) - Meal cards
  - [ChatIA.tsx](src/components/ChatIA.tsx) - AI Agent interface
  - [PainelConfig.tsx](src/components/PainelConfig.tsx) - Settings (3 tabs)
  - [TabelaAlimentos.tsx](src/components/TabelaAlimentos.tsx) - Foods database table
- **Services:** TypeScript API clients in [src/services/](src/services/)
  - [alimentosService.ts](src/services/alimentosService.ts) - Foods API
  - [refeicoesService.ts](src/services/refeicoesService.ts) - Meals API
- **State management:** React hooks + localStorage persistence
- **6 visualization modes:** pagina-unica, agenda, sugestoes, chat, config, dados

### Database Schema (SQLite)

**alimentos** - 121 Brazilian foods:
```sql
id, nome, categoria, porcao_g, kcal, prot_g, carb_g, gord_g
contexto_culinario, incompativel_com, cluster_nutricional,
kcal_por_g, prot_por_g, preco, percentual_proteico, velocidade_absorcao
```

**refeicoes** - Pre-configured meals:
```sql
id, nome, tipo, contexto_culinario, descricao, criada_em, ativa
```

**refeicoes_itens** - Meal composition (many-to-many):
```sql
id, refeicao_id (FK → refeicoes), alimento_id (FK → alimentos), gramas, ordem
```

### Frontend Data Structures

**REFEICOES_INICIAIS**: Weekly meal schedule with:
```typescript
{ id, hora, tipo, nome, meta: { prot, carb, gord } }
```

**SUGESTOES_REFEICOES**: Fetched from backend API `/api/refeicoes`

### UI Components (in single file)
1. **Timeline View** (left panel) - Visual schedule showing:
   - Horizontal timeline (6h-23h)
   - Draggable meal markers (colored circles)
   - Fasting windows with duration labels

2. **Details Panel** (right panel) - Shows:
   - Meal macros and targets
   - Food suggestions
   - Custom meal builder with category-based food selection

### Core Functionality

**Fasting Calculation**: `calcularJejum(ref1Hora, ref2Hora)` - Computes hours between meals, handles midnight crossing

**Drag & Drop**: Meals can be repositioned within the same day by dragging the colored circles on the timeline

**Macro Validation**: `isWithinTarget(value, target)` - Checks if actual value is within 85-115% of target

**Food Selection**: Categories expand/collapse to show individual foods; selected foods update macro totals in real-time

## Data Files

- **[data/csv/base_alimentos.csv](data/csv/base_alimentos.csv)** - 121 foods with complete nutritional data
- **[readme_estrategia_nutricional.md](readme_estrategia_nutricional.md)** - Comprehensive nutrition strategy document including:
  - Physical data and goals
  - Detailed fasting protocols
  - Weekly schedule with meal timing
  - Food database methodology
  - Price indicators, protein percentages, absorption speeds

## Development Setup

### Quick Start
```bash
# Start both backend and frontend
.\start.bat

# Or start individually:
.\start_backend.bat  # FastAPI on port 8001
.\start_frontend.bat # Vite dev server on port 5173
```

### Prerequisites
- Python 3.11+ with dependencies: `fastapi`, `uvicorn`, `openai`, `python-dotenv`, `pydantic`
- Node.js 18+ with Vite
- OpenAI API key in `.env` file: `OPENAI_API_KEY=sk-...`

### Technology Stack
**Backend:**
- FastAPI (REST API)
- SQLite (database)
- OpenAI GPT-4 (AI agent)
- Python 3.11+

**Frontend:**
- React 18+ with TypeScript
- Vite (build tool)
- Tailwind CSS
- lucide-react (icons)

### API Endpoints
- `GET /api/alimentos` - List foods with filters
- `GET /api/alimentos/{id}` - Get food by ID
- `GET /api/refeicoes` - List meals with filters
- `GET /api/refeicoes/{id}` - Get meal with items
- `POST /api/agent` - Chat with AI agent (natural language commands)

## Key Design Patterns

**Macro Tolerance**: All macro targets have 15% tolerance (85-115%) to provide realistic meal planning flexibility

**Visual Color Coding**:
- Green (#10b981) = Breakfast (cafe)
- Yellow (#eab308) = Lunch (almoco)
- Red (#ef4444) = Dinner (jantar)
- Gray (#f0f0f0) = Whey
- Purple (#8b5cf6) = Refeed (lixo)

**Fasting Windows**: Calculated dynamically between consecutive meals, displayed as tan/beige overlays (#d4a574) on timeline

## AI Agent System

### Natural Language Interface
The AI agent interprets Portuguese commands and executes database operations using OpenAI function calling.

**Interactive Approval Workflow:**
1. User sends natural language command (e.g., "crie uma refeição com frango e arroz")
2. Agent analyzes and creates execution plan
3. Agent presents plan and asks: "Posso executar este plano? (sim/não)"
4. User approves ("sim", "ok") or rejects ("não", "cancelar")
5. Agent executes only if approved

**Available Functions (14 total):**
- **Foods (7):** list_foods, search_foods, insert_food, update_food, delete_food, get_food_by_id, get_statistics
- **Meals (7):** list_refeicoes, get_refeicao_completa, search_refeicoes, insert_refeicao, update_refeicao, delete_refeicao, get_refeicoes_statistics

**Safety Features:**
- READ operations execute immediately (no approval needed)
- WRITE operations require explicit user confirmation
- Transactions with rollback on error
- Parameterized queries prevent SQL injection
- FK validation before insertions

### Key Files
- [data/api/alimentos_agent.py](data/api/alimentos_agent.py) - CLI agent with OpenAI function calling
- [data/api/agent_tools.py](data/api/agent_tools.py) - CRUD functions (708 lines)
- [data/api/prompts.py](data/api/prompts.py) - System prompts with approval workflow
- [data/api/gestor_alimentos_api.py](data/api/gestor_alimentos_api.py) - FastAPI endpoints
- [data/scripts/migrate_alimentos_schema.py](data/scripts/migrate_alimentos_schema.py) - Database migration script

## Important Notes

- All food data is Brazilian cuisine with specific preparation methods
- Nutritional values sourced from TACO (Brazilian Food Composition Table)
- User profile: 30M, 181cm, 103kg, 21% BF, high activity level
- Target: 2200 kcal/day average with body recomposition goal
- Excluded foods: raw vegetables, fish (except sushi), liquid dairy, fruits

## Recent Changes (Oct 2025)

### Project Restructuring (Latest)
- Reorganized folder structure for better maintainability
- Created semantic directories: `data/api/`, `data/db/`, `data/scripts/`, `data/csv/`, `data/docs/`
- Moved SMB tools to project root (standalone system)
- Updated all path references across 18+ files
- Zero breaking changes - all functionality preserved

### Database Migration
- Migrated from Portuguese column names (Alimento, Proteina_g) to code-friendly names (nome, prot_g)
- Added strategic columns: `contexto_culinario`, `incompativel_com`
- Consolidated from 2 databases (alimentos.db + refeicoes.db) → 1 database (alimentos.db)
- Created migration script with backup and rollback capability

### AI Agent Implementation
- Implemented GPT-4 powered agent with 14 CRUD functions
- Added interactive approval system for write operations
- Integrated chat interface in frontend (localStorage persistence)
- All operations use natural language (Portuguese)

### Frontend Refactoring (Component Modularization) - Oct 2025
- **Created 6 reusable components** to eliminate code duplication
- **Zero breaking changes** - all 6 visualization modes work identically
- **Benefits:**
  - Modular architecture (1 component = N uses)
  - Eliminated ~1300 lines of duplicated code
  - Props-based customization (fullscreen vs inline)
  - Improved maintainability and scalability

## SMB Tools (Standalone)

The **SMB/** directory contains a completely independent meal planning system built with Streamlit:

### Main Applications
- **app_registrar_refeicoes_v3.py** - Full-featured meal tracking app with timeline, metas, and tags
- **montar_refeicoes.py** - Visual meal builder with drag & drop interface
- **SMB.py** - AI-powered meal generator with nutritional optimization

### Features
- Visual composition of meals with real-time macro calculation
- Automatic meal generation with constraint satisfaction
- Export to SQL for database insertion
- Meal validation and analysis tools
- Independent from main React app (shares only database)

### Usage
```bash
streamlit run SMB/app_registrar_refeicoes_v3.py
streamlit run SMB/montar_refeicoes.py
python SMB/SMB.py --variants 20
```
