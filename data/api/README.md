# Gestor Alimentos Package
Conteúdo criado para integrar com seu projeto. Coloque esta pasta dentro de `data/` na raiz do seu repositório conforme solicitado.

Estrutura:
- db_setup.py: importa o CSV e cria `alimentos.db`.
- gestor_alimentos_cli.py: script CLI que aceita uma descrição e usa OpenAI Responses API para extrair, buscar candidatos e inserir.
- gestor_alimentos_api.py: FastAPI app com endpoint `/api/add-food` para integração com seu frontend (React + Vite).
- prompts.py: prompts do sistema bem elaborados para cada etapa (extração, comparação e ranking).
- sql/schema.sql: sugestão de schema.
- requirements.txt: dependências.

Instruções rápidas:
1. ✅ Pasta já está organizada em `data/api/`
2. Instale dependências: `pip install -r data/api/requirements.txt`
3. Database localizado em: `data/db/alimentos.db`
4. Teste Agent CLI: `python data/api/alimentos_agent.py "liste os lanches"`
5. Ou rode API: `uvicorn data.api.gestor_alimentos_api:app --reload --port 8001`
   OU simplesmente: `cd data/api && uvicorn gestor_alimentos_api:app --reload --port 8001`
   - No React, faça POST para `http://localhost:8001/api/add-food` com JSON `{ "prompt": "..." }`

Notas sobre integração com seu frontend:
- Seu projeto contém `meal_planner_app.tsx` (React + Vite). Recomendo criar um small wrapper fetch:
  ```ts
  async function addFood(prompt: string) {
    const res = await fetch('/api/add-food', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({prompt})
    });
    return res.json();
  }
  ```
- If using Vite dev server, add proxy to vite.config.js:
  ```js
  // vite.config.js
  export default {
    server: {
      proxy: {
        '/api': 'http://localhost:8001'
      }
    }
  }
  ```

Observações finais:
- The examples use `gpt-5-mini` as a placeholder; adjust to the model available in your account.
- The code avoids comparing only by text-similarity and follows your approach: search by keywords, gather results, and ask the AI to decide.
- You can adapt `prompts.py` with few-shot examples from your DB to improve accuracy.
