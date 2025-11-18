# AI Agent para Banco de Alimentos

Sistema de agente IA que permite operações CRUD no banco de dados de alimentos usando linguagem natural.

## Arquitetura

- **alimentos_agent.py** - Agente principal com OpenAI function calling
- **agent_tools.py** - Funções CRUD (CREATE, READ, UPDATE, DELETE)
- **prompts.py** - System prompts para o agente
- **gestor_alimentos_api.py** - API FastAPI com endpoint `/api/agent`

## Instalação

```bash
# Já incluído nas dependências do projeto
pip install openai python-dotenv fastapi uvicorn
```

## Uso via CLI

### Comandos de Listagem/Busca (READ)

```bash
# Listar todos os alimentos
python alimentos_agent.py "liste todos os alimentos"

# Top 5 alimentos com mais proteína
python alimentos_agent.py "liste os 5 alimentos com mais proteína"

# Listar lanches
python alimentos_agent.py "mostre todos os lanches"

# Buscar por palavra-chave
python alimentos_agent.py "busque frango grelhado"

# Estatísticas do banco
python alimentos_agent.py "estatísticas do banco"

# Modo verbose (mostra chamadas de função)
python alimentos_agent.py "liste os lanches" -v
```

### Comandos de Adição (CREATE)

```bash
# Adicionar novo alimento (usa extração IA + deduplicação)
python alimentos_agent.py "adicione omelete de 3 ovos com aveia e banana"

# Adicionar com macros explícitos
python alimentos_agent.py "adicione frango grelhado 200g com 300kcal, 50g proteína"
```

### Comandos de Atualização (UPDATE)

```bash
# Atualizar por nome
python alimentos_agent.py "atualize o kcal do Frango Grelhado para 250"

# Atualizar múltiplos campos
python alimentos_agent.py "atualize o alimento ID 42 com kcal=300 e prot_g=45"
```

### Comandos de Remoção (DELETE)

```bash
# Remover por ID (requer confirmação)
python alimentos_agent.py "remova o alimento ID 42"

# Remover por nome
python alimentos_agent.py "delete o alimento chamado 'Barra de Cereal X'"
```

## Uso via API

### Iniciar servidor

```bash
cd data/api
python -m uvicorn gestor_alimentos_api:app --host 0.0.0.0 --port 8001 --reload
```

### Endpoints disponíveis

#### POST /api/agent

Endpoint principal do agente IA.

```bash
# Exemplo com curl
curl -X POST http://localhost:8001/api/agent \
  -H "Content-Type: application/json" \
  -d '{"command": "liste os 5 alimentos com mais proteína"}'
```

**Request:**
```json
{
  "command": "liste os 5 alimentos com mais proteína"
}
```

**Response:**
```json
{
  "status": "success",
  "response": "Aqui estão os 5 alimentos com mais proteína:\n1. Churrasco completo...",
  "command": "liste os 5 alimentos com mais proteína"
}
```

#### POST /api/add-food

Endpoint legado (agora usa `agent_tools.insert_food` internamente).

```bash
curl -X POST http://localhost:8001/api/add-food \
  -H "Content-Type: application/json" \
  -d '{"prompt": "omelete de 3 ovos com aveia"}'
```

#### GET /api/alimentos

Lista alimentos com filtros opcionais.

```bash
# Listar todos
curl http://localhost:8001/api/alimentos

# Filtrar por categoria
curl "http://localhost:8001/api/alimentos?categoria=Proteína"

# Buscar por termo
curl "http://localhost:8001/api/alimentos?search=frango"
```

#### GET /api/categorias

Lista todas as categorias únicas.

```bash
curl http://localhost:8001/api/categorias
```

## Exemplos de Comandos Naturais

O agente interpreta linguagem natural e mapeia para funções SQL:

| Comando | Operação SQL |
|---------|-------------|
| "liste todos os alimentos" | `SELECT * FROM alimentos ORDER BY nome` |
| "mostre os lanches" | `SELECT * FROM alimentos WHERE contexto_culinario LIKE '%lanche%'` |
| "5 alimentos com mais proteína" | `SELECT * FROM alimentos ORDER BY prot_g DESC LIMIT 5` |
| "busque frango" | `SELECT * WHERE nome/categoria LIKE '%frango%'` |
| "adicione omelete..." | INSERT com extração IA + deduplicação |
| "atualize kcal do Frango para 250" | `UPDATE alimentos SET kcal=250 WHERE nome LIKE '%Frango%'` |
| "remova alimento ID 42" | `DELETE FROM alimentos WHERE id=42` (com confirmação) |

## Segurança

✅ **Queries parametrizadas** - Previne SQL injection
✅ **Confirmação de DELETE** - Requer flag `confirm=True`
✅ **Validação de UPDATE** - Mostra valores atuais antes de atualizar
✅ **Deduplicação automática** - INSERT verifica duplicatas via IA (confidence >= 0.85)

## Estrutura do Banco

```sql
CREATE TABLE alimentos (
  id INTEGER PRIMARY KEY,
  nome TEXT,
  categoria TEXT,
  cluster_nutricional INTEGER,
  porcao_g REAL,
  kcal_por_g REAL,
  kcal INTEGER,
  prot_g INTEGER,
  prot_por_g REAL,
  carb_g INTEGER,
  gord_g INTEGER,
  preco TEXT,
  percentual_proteico TEXT,
  velocidade_absorcao TEXT,
  contexto_culinario TEXT,  -- 'cafe', 'almoco', 'jantar', 'lanche', 'oriental', 'universal'
  incompativel_com TEXT      -- categorias incompatíveis (separadas por vírgula)
);
```

## Funções Disponíveis (agent_tools.py)

- `list_foods(categoria, contexto_culinario, limit, order_by, search)` - Listar com filtros
- `search_foods(keywords)` - Busca por keywords em todos campos texto
- `insert_food(prompt_text)` - Adicionar com extração IA + deduplicação
- `update_food(identifier, fields)` - Atualizar por ID ou nome
- `delete_food(identifier, confirm)` - Remover (requer confirmação)
- `get_food_by_id(food_id)` - Buscar por ID
- `get_statistics()` - Estatísticas do banco

## Integração com Frontend

### Exemplo React/TypeScript

```typescript
// Enviar comando para o agente
async function sendAgentCommand(command: string) {
  const response = await fetch('http://localhost:8001/api/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  });

  const data = await response.json();
  console.log(data.response);
  return data;
}

// Uso
sendAgentCommand("liste os 5 alimentos com mais proteína");
sendAgentCommand("adicione omelete de 3 ovos");
```

### Componente de Chat

```typescript
function AgentChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await sendAgentCommand(input);
    setMessages([...messages, { user: input, agent: result.response }]);
    setInput('');
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i}>
            <p><strong>Você:</strong> {msg.user}</p>
            <p><strong>Agente:</strong> {msg.agent}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite um comando (ex: liste os lanches)"
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
```

## Troubleshooting

### Erro de encoding no Windows

Se encontrar erro `UnicodeEncodeError`, o código já inclui fix:

```python
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
```

### API Key não encontrada

Certifique-se de ter `.env` na raiz do projeto com:

```
OPENAI_API_KEY=sk-...
```

### Banco não encontrado

Execute primeiro:

```bash
python db_setup.py
```

## Roadmap Futuro

- [ ] Suporte a múltiplos turnos de conversa (contexto mantido)
- [ ] Batch operations (atualizar/deletar múltiplos itens)
- [ ] Export de resultados (CSV, JSON)
- [ ] Filtros avançados (range de macros, clusters nutricionais)
- [ ] Integração com meal planner frontend
- [ ] Histórico de comandos e rollback
