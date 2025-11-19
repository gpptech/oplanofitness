# 🚀 Guia de Deploy - Render.com

**Deploy completo do Plano Alimentar em produção usando Render.com**

---

## 📋 Índice

1. [Por que Render?](#-por-que-render)
2. [Pré-requisitos](#-pré-requisitos)
3. [Deploy Rápido (15 minutos)](#-deploy-rápido-15-minutos)
4. [Verificação e Testes](#-verificação-e-testes)
5. [Atualizações Futuras](#-atualizações-futuras)
6. [Troubleshooting](#-troubleshooting)
7. [Limitações do Plano Gratuito](#-limitações-do-plano-gratuito)

---

## 🎯 Por que Render?

### Vantagens

✅ **Suporte nativo a ASGI** - FastAPI funciona sem adaptadores
✅ **Deploy automático** - Git push → deploy instantâneo
✅ **SSL gratuito** - HTTPS automático
✅ **Zero configuração WSGI** - Uvicorn roda nativamente
✅ **Plano gratuito generoso** - 750h/mês de compute
✅ **SQLite funciona** - Database incluído no projeto
✅ **Logs em tempo real** - Debug facilitado
✅ **Preview deploys** - Testa mudanças antes de mergear

### Arquitetura no Render

```
GitHub (push)
   ↓
render.yaml (blueprint)
   ↓
Render cria automaticamente:
   ├── oplanofitness-api (FastAPI + SQLite)
   └── oplanofitness-app (React build estático)
```

---

## 📦 Pré-requisitos

### Contas Necessárias

- ✅ **GitHub** - Repositório já configurado
- ✅ **Render.com** - Criar conta gratuita

### Arquivos do Projeto (já incluídos)

- ✅ `render.yaml` - Blueprint de deploy
- ✅ `requirements.txt` - Dependências Python
- ✅ `package.json` - Dependências Node.js
- ✅ `dist/` - Build do frontend (ignorado pelo Git, será gerado)

---

## ⚡ Deploy Rápido (15 minutos)

### Passo 1: Criar Conta no Render (2 minutos)

1. Acesse: **https://render.com**
2. Clique em **"Get Started"**
3. Escolha **"Sign up with GitHub"**
4. Autorize o Render a acessar seus repositórios

### Passo 2: Conectar Repositório (3 minutos)

1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Blueprint"**
3. Clique em **"Connect a repository"**
4. Encontre e selecione: **`oplanofitness`**
5. Clique em **"Connect"**

### Passo 3: Deploy Automático (10 minutos)

O Render vai ler o arquivo `render.yaml` e criar automaticamente:

**Backend (oplanofitness-api):**
- Runtime: Python 3.11
- Build: `pip install -r requirements.txt`
- Start: `uvicorn gestor_alimentos_api:app --host 0.0.0.0 --port $PORT`
- Health check: `/api/alimentos`

**Frontend (oplanofitness-app):**
- Runtime: Node.js (static)
- Build: `npm install && npm run build`
- Publish: `./dist`

**Aguarde ~5-10 minutos** enquanto o Render faz o build inicial.

### Passo 4: Verificar URLs

Após o deploy bem-sucedido, você terá:

- **Backend API:** `https://oplanofitness-api.onrender.com`
- **Frontend App:** `https://oplanofitness-app.onrender.com`

---

## ✅ Verificação e Testes

### 1. Testar Backend

Acesse no navegador:

```
https://oplanofitness-api.onrender.com/api/alimentos
```

**Resultado esperado:** JSON com lista de 121 alimentos brasileiros

### 2. Testar Frontend

Acesse no navegador:

```
https://oplanofitness-app.onrender.com
```

**Resultado esperado:** Interface React completa carregada

### 3. Testes Funcionais

#### Teste 1: Ver Alimentos
1. No app, clique em **"Modo: Dados"** → **"Tabela de Alimentos"**
2. **Esperado:** Lista com 121 alimentos
3. **Teste filtros:** Buscar por "frango"
4. **Teste ordenação:** Clicar em colunas para ordenar

#### Teste 2: Ver Refeições
1. Clique em **"Modo: Sugestões de Refeições"**
2. **Esperado:** Cards de refeições pré-configuradas
3. **Teste filtros:** Filtrar por tipo (café, almoço, jantar)

#### Teste 3: Timeline Semanal
1. Clique em **"Modo: Agenda"**
2. **Esperado:** Timeline visual com refeições e janelas de jejum
3. **Teste drag:** Arrastar refeições (se implementado)

#### Teste 4: Criar Refeição
1. Clique em **"Modo: Config"** → aba **"Nova Refeição"**
2. Preencha:
   - Nome: "Teste Deploy Render"
   - Tipo: "Café da Manhã"
   - Contexto: "rápida"
3. Selecione alguns alimentos
4. Clique em **"Criar Refeição"**
5. **Esperado:** Mensagem de sucesso

### 4. Verificar Logs (em caso de erro)

No Render:
1. Dashboard → **oplanofitness-api** (ou oplanofitness-app)
2. Aba **"Logs"**
3. Veja logs em tempo real

---

## 🔄 Atualizações Futuras

### Workflow de Deploy

Sempre que você fizer mudanças no código:

#### 1. Desenvolver Localmente

```bash
# Fazer alterações no código

# Testar localmente
npm run dev  # Frontend em http://localhost:5173
# Em outro terminal:
cd data/api && python gestor_alimentos_api.py  # Backend em http://localhost:8001
```

#### 2. Commit e Push

```bash
# Adicionar mudanças
git add .

# Commit
git commit -m "descrição das mudanças"

# Push para GitHub
git push origin main
```

#### 3. Deploy Automático

O Render detecta o push e **automaticamente**:
- ✅ Faz rebuild do backend (se mudou Python)
- ✅ Faz rebuild do frontend (se mudou React/TS)
- ✅ Deploy em ~5 minutos

**Não precisa fazer nada manualmente!** 🎉

### Preview Deploys (opcional)

Para testar mudanças antes de mergear:

1. Crie um Pull Request no GitHub
2. Render cria **preview deploy automático**
3. Teste a preview URL
4. Se aprovado, merge o PR → deploy para produção

---

## 🐛 Troubleshooting

### Erro: Build Failed - Backend

**Sintoma:** Build do backend falha com erro de dependências.

**Solução:**

1. Verifique `requirements.txt`:
   ```
   fastapi==0.115.6
   uvicorn[standard]==0.34.0
   pydantic==2.10.5
   ```

2. No Render, vá em **Environment** → adicione:
   ```
   PYTHON_VERSION = 3.11.0
   ```

3. Trigger manual redeploy: **"Manual Deploy" → "Clear build cache & deploy"**

### Erro: Build Failed - Frontend

**Sintoma:** Build do frontend falha com erro npm.

**Solução:**

1. Verifique `package.json` tem script `build`:
   ```json
   {
     "scripts": {
       "build": "vite build"
     }
   }
   ```

2. Delete `node_modules` e `package-lock.json` localmente:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

3. Commit e push

### Erro: Frontend não conecta à API

**Sintoma:** Interface carrega mas não mostra dados.

**Diagnóstico:**

1. Abrir DevTools (F12) → aba **"Network"**
2. Recarregar página
3. Procurar requisições `/api/...`
4. Ver status code:
   - **404:** Rota não existe
   - **500:** Erro no backend
   - **CORS:** Erro de CORS
   - **Timeout:** Backend não responde

**Soluções:**

**CORS Error:**
```python
# Em data/api/gestor_alimentos_api.py, verificar:
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.onrender\.com",  # ✅ Correto
    # ...
)
```

**API URL errada:**
```typescript
// Em src/config/api.ts, verificar:
if (window.location.hostname.includes('onrender.com')) {
  return 'https://oplanofitness-api.onrender.com';  // ✅ URL correta do backend
}
```

### Erro: Database not found

**Sintoma:** API retorna erro 500 sobre database.

**Causa:** Database SQLite não foi commitado no Git.

**Solução:**

```bash
# Verificar se database existe
ls -lh data/db/alimentos.db
# Deve mostrar ~1.7 MB

# Forçar adição ao Git (se não estiver)
git add -f data/db/alimentos.db
git commit -m "add: SQLite database"
git push

# Render fará redeploy automático
```

### App Lento ou Timeout no Primeiro Acesso

**Sintoma:** Primeiro acesso após 15min demora ~30 segundos.

**Causa:** Plano gratuito do Render hiberna apps inativos.

**Explicação:**
- Após **15 minutos sem requisições**, o servidor desliga
- **Primeiro acesso** após hibernar → cold start (~20-30s)
- **Acessos subsequentes** → instantâneos

**Soluções:**

1. **Aceitar cold starts** (normal no plano gratuito)
2. **Upgrade para plano pago** ($7/mês) → sempre ativo
3. **Keep-alive service** (usar cron externo para pingar API a cada 10min)

### Erro: Health Check Failed

**Sintoma:** Backend aparece como "unhealthy" no Render.

**Solução:**

Verificar em `render.yaml`:
```yaml
services:
  - type: web
    name: oplanofitness-api
    healthCheckPath: /api/alimentos  # ✅ Endpoint que retorna 200
```

Se necessário, criar endpoint de health check:
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

E atualizar `render.yaml`:
```yaml
healthCheckPath: /health
```

---

## 📊 Limitações do Plano Gratuito

### ✅ Suficiente para este projeto:

- **750 horas/mês** de compute (~31 dias se ficar sempre ativo)
- **100 GB/mês** de bandwidth
- **SQLite** funciona perfeitamente
- **SSL/HTTPS** gratuito
- **Deploy automático** via Git
- **Logs** em tempo real
- **Custom domain** (com limitações)

### ⚠️ Limitações:

- **Hiberna após 15min** sem tráfego (cold start ~30s)
- **512 MB RAM** por serviço (suficiente para FastAPI + React)
- **0.1 CPU** compartilhada (pode ser lenta em alta carga)
- **Filesystem efêmero** (mas SQLite persiste via persistent disk - grátis apenas para PostgreSQL no plano free, **SQLite perde dados entre redeploys**)

### 🚨 IMPORTANTE: SQLite e Persistência

**No plano gratuito do Render:**
- ❌ **Filesystem é efêmero** → dados SQLite são **perdidos** a cada redeploy
- ✅ **Solução 1:** Aceitar que DB reseta em deploys (OK para protótipos)
- ✅ **Solução 2:** Upgrade para plano Starter ($7/mês) com persistent disk
- ✅ **Solução 3:** Migrar para PostgreSQL (Render oferece PostgreSQL gratuito com 1GB)

**Para produção real, recomendo:**
```bash
# Migrar SQLite → PostgreSQL (Render oferece grátis)
# Posso ajudar com a migração se necessário
```

### 💰 Upgrade para Starter ($7/mês):

- **Sem hibernação** (sempre ativo)
- **Persistent disk** (SQLite persiste)
- **Mais CPU e RAM**
- **SSO e colaboração**

Para uso pessoal/protótipo, **plano gratuito é suficiente**.

---

## 🎯 Checklist Final

Antes de considerar deploy concluído:

### Funcionalidades
- [ ] Frontend carrega sem erros
- [ ] Lista de alimentos aparece (121 itens)
- [ ] Lista de refeições aparece
- [ ] Timeline semanal renderiza
- [ ] Criar refeição funciona
- [ ] Filtros e buscas funcionam

### Performance
- [ ] Tempo de carregamento < 3 segundos (após cold start)
- [ ] Sem erros no console (F12)
- [ ] Assets carregam corretamente

### Deploy
- [ ] Backend responde em `/api/alimentos`
- [ ] Frontend conecta à API corretamente
- [ ] CORS configurado corretamente
- [ ] Logs sem erros críticos

---

## 📚 Recursos Adicionais

### Documentação

- **Render Docs:** https://render.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **Vite Docs:** https://vitejs.dev

### Arquivos do Projeto

- **[CLAUDE.md](CLAUDE.md)** - Instruções para Claude Code
- **[README.md](README.md)** - Overview do projeto
- **[readme_estrategia_nutricional.md](readme_estrategia_nutricional.md)** - Estratégia nutricional

### Scripts Úteis

- `verificar_deploy.py` - Validação pré-deploy (local)
- `data/scripts/db_stats.py` - Estatísticas do database
- `data/scripts/db_verifica.py` - Verificar integridade

---

## 🆘 Suporte

Se encontrar problemas não cobertos neste guia:

1. **Verificar logs:**
   - Render → Dashboard → Logs
   - Console do navegador (F12)

2. **Consultar seções:**
   - [Troubleshooting](#-troubleshooting)
   - [Limitações](#-limitações-do-plano-gratuito)

3. **Testar localmente:**
   ```bash
   # Windows
   .\start.bat
   # Acessar: http://localhost:5173
   ```

4. **Reverter mudanças:**
   ```bash
   git log  # Ver histórico
   git revert <commit-hash>  # Reverter commit específico
   git push
   # Render redeploya automaticamente
   ```

---

## ✨ Resumo Ultra-Rápido

**Para quem tem pressa:**

```bash
# 1. CRIAR CONTA
# https://render.com → Sign up with GitHub

# 2. CONECTAR REPO
# New + → Blueprint → Connect oplanofitness

# 3. AGUARDAR
# ~10 minutos de build automático

# 4. ACESSAR
# https://oplanofitness-app.onrender.com
# https://oplanofitness-api.onrender.com/api/alimentos

# 5. FUTURAS ATUALIZAÇÕES
# git push → deploy automático
```

---

## 🎉 Conclusão

Seguindo este guia, você terá:

✅ **App público** em produção
✅ **Frontend React** otimizado com CDN
✅ **Backend FastAPI** nativo (sem WSGI)
✅ **Database SQLite** funcionando
✅ **Deploy automático** via Git push
✅ **SSL/HTTPS** gratuito
✅ **Zero custo** (plano gratuito)

**Tempo total:** ~15 minutos
**Custo:** $0 (plano gratuito)
**Manutenção:** Mínima (Git push → deploy)

---

**🤖 Desenvolvido com Claude Code**
**📧 Gabriel Pitta**
**📅 Última atualização:** Novembro 2025
**🚀 Deploy:** Render.com

---

*Este guia substitui completamente as instruções anteriores de deploy para PythonAnywhere. FastAPI requer ASGI nativo, que o Render oferece gratuitamente.*
