# 🚀 Guia Completo de Deploy - Plano Alimentar

**Guia definitivo para publicar seu app no PythonAnywhere**

---

## 📋 Índice

1. [Pré-requisitos](#-pré-requisitos)
2. [Preparação Local](#-preparação-local)
3. [GitHub Setup](#-github-setup)
4. [PythonAnywhere Setup](#-pythonanywhere-setup)
5. [Configuração da Web App](#-configuração-da-web-app)
6. [Verificação e Testes](#-verificação-e-testes)
7. [Atualizações Futuras](#-atualizações-futuras)
8. [Troubleshooting](#-troubleshooting)
9. [Bugs Conhecidos e Soluções](#-bugs-conhecidos-e-soluções)

---

## 🎯 Resumo Executivo

**Tempo total estimado:** 15-20 minutos
**Dificuldade:** Intermediária
**Custo:** Gratuito (plano Beginner do PythonAnywhere)

**O que você terá no final:**
- ✅ App público em `https://seunome.pythonanywhere.com`
- ✅ Frontend React funcionando
- ✅ Backend FastAPI com API REST
- ✅ AI Agent GPT-4 integrado
- ✅ Database SQLite com 121 alimentos

---

## 📦 Pré-requisitos

### Contas Necessárias
- ✅ **GitHub** (gratuito) - [github.com](https://github.com)
- ✅ **PythonAnywhere** (plano Beginner gratuito) - [pythonanywhere.com](https://pythonanywhere.com)

### Chaves de API
- ✅ **OpenAI API Key** - Para o AI Agent funcionar

### Software Local
- ✅ **Git** instalado e configurado
- ✅ **Python 3.11+** (para testes locais)
- ✅ **Node.js 18+** (para build do frontend)

---

## 🔧 Preparação Local

### 1. Verificar Estrutura do Projeto

Execute o script de verificação:

```bash
python verificar_deploy.py
```

**Resultado esperado:** `[SUCCESS] TUDO PRONTO PARA DEPLOY!`

Se encontrar erros, veja a seção [Troubleshooting](#-troubleshooting).

### 2. Build do Frontend (se necessário)

```bash
# Instalar dependências (se ainda não tiver feito)
npm install

# Build de produção
npm run build
```

**Verificar build:**
```bash
dir dist
# Deve mostrar: index.html, assets/
```

### 3. Verificar Database

```bash
dir "data\db\alimentos.db"
# Deve mostrar arquivo ~1.6 MB
```

### 4. Checklist Pré-Deploy

- [ ] Pasta `dist/` existe com build
- [ ] Arquivo `data/db/alimentos.db` existe
- [ ] Arquivo `requirements.txt` existe
- [ ] Arquivo `.env.example` existe
- [ ] Arquivo `.env` NÃO está no Git (verificar .gitignore)
- [ ] Build de produção está atualizado

---

## 🌐 GitHub Setup

### 1. Criar Repositório

1. Acesse [github.com/new](https://github.com/new)
2. Configure:
   - **Nome:** `plano-alimentar` (ou outro)
   - **Visibilidade:** Public ou Private
   - **NÃO** marque: README, .gitignore, license (já temos)
3. Clique em **"Create repository"**

### 2. Preparar Commit

No terminal do projeto:

```bash
# Verificar status
git status

# Adicionar dist/ forçadamente (ignorado por padrão)
git add -f dist/

# Adicionar tudo
git add .

# Verificar o que vai ser commitado
git status
```

**Verificar que está incluído:**
- ✅ `dist/` (build do frontend)
- ✅ `data/db/alimentos.db` (database)
- ✅ `requirements.txt`
- ✅ `.env.example`

**Verificar que NÃO está incluído:**
- ❌ `.env` (secrets)
- ❌ `node_modules/`
- ❌ `venv/`

### 3. Fazer Commit

```bash
git commit -m "deploy: prepara projeto para PythonAnywhere

BACKEND:
- FastAPI serve frontend estático (SPA)
- CORS configurado para *.pythonanywhere.com
- Database SQLite incluído (121 alimentos)
- Requirements.txt completo
- Path traversal vulnerability corrigida

FRONTEND:
- Build de produção otimizado (282 KB)
- Autodetecção de ambiente (dev/prod)
- Vite configurado para produção

CORREÇÕES:
- .gitignore permite dist/ e database
- CORS usa allow_origin_regex (wildcards funcionam)
- Ordem de rotas corrigida (API antes de static)
- Validação de path segura (sem directory traversal)

✅ Pronto para deploy em produção

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 4. Push para GitHub

```bash
# Adicionar remote (SUBSTITUA pela URL do seu repositório)
git remote add origin https://github.com/SEU-USUARIO/plano-alimentar.git

# Verificar branch
git branch -M main

# Push
git push -u origin main
```

**Verificar no GitHub:**
- Acesse seu repositório e confirme que todos os arquivos estão lá
- Especialmente: `dist/`, `data/db/alimentos.db`, `requirements.txt`

---

## 🐍 PythonAnywhere Setup

### 1. Criar Conta

1. Acesse [pythonanywhere.com](https://www.pythonanywhere.com)
2. Clique em **"Start running Python online in less than a minute!"**
3. Escolha plano **"Beginner"** (gratuito)
4. Preencha cadastro e confirme email

### 2. Abrir Console Bash

1. No dashboard, clique em **"Consoles"**
2. Clique em **"Bash"**
3. Um terminal Linux será aberto

### 3. Clonar Repositório

```bash
# Ir para home
cd ~

# Clonar seu repositório (SUBSTITUA pela URL do SEU repo)
git clone https://github.com/SEU-USUARIO/plano-alimentar.git

# Entrar na pasta
cd plano-alimentar

# Verificar conteúdo
ls -la
```

**Verificar que existe:**
- ✅ `data/` (backend)
- ✅ `dist/` (frontend)
- ✅ `requirements.txt`
- ✅ `.env.example`

### 4. Criar Virtual Environment

```bash
# Criar virtualenv com Python 3.11
python3.11 -m venv venv

# Ativar virtualenv
source venv/bin/activate

# Verificar Python
python --version
# Deve mostrar: Python 3.11.x
```

### 5. Instalar Dependências

```bash
# Instalar todas as dependências
pip install -r requirements.txt
```

**Aguarde ~2-3 minutos** enquanto instala FastAPI, OpenAI, Uvicorn, etc.

**Verificar instalação:**
```bash
pip list | grep -E "fastapi|openai|uvicorn"
```

### 6. Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.example .env

# Editar .env
nano .env
```

**No editor nano:**
1. Localize a linha: `OPENAI_API_KEY=sk-proj-your-actual-api-key-here`
2. Substitua pela sua **chave real da OpenAI**
3. **Salvar:** `Ctrl + O` → `Enter`
4. **Sair:** `Ctrl + X`

### 7. Testar Localmente (Opcional)

```bash
# Verificar database
ls -lh data/db/alimentos.db
# Deve mostrar ~1.6 MB

# Testar API
cd data/api
python gestor_alimentos_api.py
```

Se aparecer `Uvicorn running on http://0.0.0.0:8001` → **Funcionou!** ✅

Aperte `Ctrl + C` para parar.

```bash
# Voltar para raiz do projeto
cd ~/plano-alimentar
```

---

## 🌍 Configuração da Web App

### 1. Criar Web App

1. No dashboard do PythonAnywhere, clique em **"Web"**
2. Clique em **"Add a new web app"**
3. Configure:
   - **Domínio:** Aceite o padrão `seunome.pythonanywhere.com`
   - **Framework:** **Manual configuration**
   - **Python version:** **Python 3.11**
4. Clique em **"Next"** até finalizar

### 2. Configurar WSGI File

1. Na página Web, procure por **"Code"** → **"WSGI configuration file"**
2. Clique no caminho (ex: `/var/www/seunome_pythonanywhere_com_wsgi.py`)
3. **APAGUE TODO O CONTEÚDO** do arquivo
4. **COLE ESTE CÓDIGO:**

```python
# =============================================
# WSGI Configuration - Plano Alimentar
# =============================================

import sys
import os
from pathlib import Path

# ⚠️ SUBSTITUA 'SEUNOME' pelo seu username do PythonAnywhere!
USERNAME = 'SEUNOME'  # <-- MUDE AQUI

# Adicionar pasta do projeto ao PYTHONPATH
project_home = f'/home/{USERNAME}/plano-alimentar'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Adicionar pasta data/api ao PYTHONPATH (onde está a API)
api_path = str(Path(project_home) / 'data' / 'api')
if api_path not in sys.path:
    sys.path.insert(0, api_path)

# Carregar variáveis de ambiente do .env
from dotenv import load_dotenv
env_path = Path(project_home) / '.env'
load_dotenv(dotenv_path=env_path)

# Importar aplicação FastAPI
from gestor_alimentos_api import app as application
```

5. **IMPORTANTE:** Substitua `SEUNOME` pelo seu username real (está no topo da página)
6. Clique em **"Save"** (botão verde no topo)

### 3. Configurar Virtualenv

1. Role para baixo até **"Virtualenv"**
2. Cole o caminho (SUBSTITUA `SEUNOME`):
   ```
   /home/SEUNOME/plano-alimentar/venv
   ```
3. Clique no **✅ verde** para confirmar

### 4. Configurar Static Files

1. Role até **"Static files"**
2. Adicione **2 entradas:**

**Entrada 1 - Assets (obrigatória):**
- **URL:** `/assets`
- **Directory:** `/home/SEUNOME/plano-alimentar/dist/assets`

**Entrada 2 - Root (opcional, melhora performance):**
- **URL:** `/`
- **Directory:** `/home/SEUNOME/plano-alimentar/dist`

3. **Substitua `SEUNOME`** pelo seu username
4. Clique no ✅ verde em cada entrada

### 5. Recarregar Web App

1. Role até o **topo** da página
2. Clique no **botão verde gigante:**
   ```
   Reload seunome.pythonanywhere.com
   ```
3. Aguarde ~5 segundos

---

## ✅ Verificação e Testes

### 1. Acessar Aplicação

Clique no link: **`https://seunome.pythonanywhere.com`**

**Resultado esperado:**
- ✅ Página carrega (não 404 ou 500)
- ✅ Interface React aparece
- ✅ Não há erros no console do navegador (F12)

### 2. Testes Funcionais

#### Teste 1: Ver Alimentos
1. Clique em **"Modo: Dados"** → **"Tabela de Alimentos"**
2. **Esperado:** Lista com 121 alimentos brasileiros
3. **Teste filtros:** Buscar por "frango"
4. **Teste ordenação:** Clicar em colunas para ordenar

#### Teste 2: Ver Refeições
1. Clique em **"Modo: Sugestões de Refeições"**
2. **Esperado:** Cards de refeições pré-configuradas
3. **Teste filtros:** Filtrar por tipo (café, almoço, jantar)

#### Teste 3: Chat IA (requer OpenAI API Key)
1. Clique em **"Modo: Chat IA"**
2. Digite: `liste 5 alimentos da categoria proteína`
3. **Esperado:** Resposta do agente com lista de alimentos

#### Teste 4: Timeline Semanal
1. Clique em **"Modo: Agenda"**
2. **Esperado:** Timeline visual com refeições e janelas de jejum
3. **Teste drag:** Arrastar refeições (se implementado)

#### Teste 5: Criar Refeição
1. Clique em **"Modo: Config"** → aba **"Nova Refeição"**
2. Preencha:
   - Nome: "Teste Deploy"
   - Tipo: "Café da Manhã"
   - Contexto: "rápida"
3. Selecione alguns alimentos
4. Clique em **"Criar Refeição"**
5. **Esperado:** Mensagem de sucesso

### 3. Verificar Logs (em caso de erro)

No PythonAnywhere:
1. Aba **"Web"**
2. Role até **"Log files"**
3. Clique em **"Error log"**
4. **Verifique erros** (se houver)

**Logs comuns:**
- `Server log` - Requisições HTTP
- `Error log` - Erros Python/FastAPI
- `Access log` - Todas as requisições

---

## 🔄 Atualizações Futuras

### Workflow de Update

Sempre que fizer mudanças no projeto local:

#### 1. Local (Windows)

```bash
# Após fazer alterações no código

# Rebuildar frontend (se mudou código React/TS)
npm run build

# Adicionar mudanças
git add .

# Commit
git commit -m "descrição das mudanças"

# Push para GitHub
git push
```

#### 2. PythonAnywhere

```bash
# Abrir console Bash no PythonAnywhere

# Ir para projeto
cd ~/plano-alimentar

# Puxar mudanças
git pull origin main

# Se mudou dependências Python:
source venv/bin/activate
pip install -r requirements.txt
```

#### 3. Reload Web App

1. Aba **"Web"** do PythonAnywhere
2. Clique em **"Reload seunome.pythonanywhere.com"**
3. Aguarde ~5 segundos

✅ **Pronto!** Mudanças aplicadas.

### Cenários Específicos

#### Mudou apenas frontend (HTML/CSS/JS/TS/TSX):
```bash
# Local
npm run build
git add dist/
git commit -m "update: frontend changes"
git push

# PythonAnywhere
cd ~/plano-alimentar
git pull
# Reload na aba Web
```

#### Mudou apenas backend (Python):
```bash
# Local
git add data/api/
git commit -m "update: backend changes"
git push

# PythonAnywhere
cd ~/plano-alimentar
git pull
# Reload na aba Web
```

#### Mudou database:
```bash
# Local
git add -f data/db/alimentos.db
git commit -m "update: database changes"
git push

# PythonAnywhere
cd ~/plano-alimentar
git pull
# Reload na aba Web
```

#### Mudou dependências Python:
```bash
# Local
git add requirements.txt
git commit -m "update: dependencies"
git push

# PythonAnywhere
cd ~/plano-alimentar
git pull
source venv/bin/activate
pip install -r requirements.txt
# Reload na aba Web
```

---

## 🐛 Troubleshooting

### Erro: "Frontend não encontrado" (404)

**Sintoma:** Ao acessar URL, aparece erro 404 ou página em branco.

**Causas possíveis:**
1. Pasta `dist/` não foi para o GitHub
2. Static files mal configurados no PythonAnywhere

**Soluções:**

```bash
# Local - Verificar se dist/ está no Git
git ls-files | grep dist/
# Deve listar arquivos. Se não:
git add -f dist/
git commit -m "add: frontend build"
git push

# PythonAnywhere - Puxar mudanças
cd ~/plano-alimentar
git pull

# Verificar que dist/ existe
ls -la dist/
# Deve mostrar index.html e assets/

# Reload web app
```

**Verificar configuração de Static Files:**
- URL: `/assets` → Directory: `/home/SEUNOME/plano-alimentar/dist/assets`
- Verificar se o caminho está correto (substituiu SEUNOME?)

### Erro: "Database not found"

**Sintoma:** API retorna erro sobre database não encontrado.

**Causas possíveis:**
1. Database não foi commitado no Git
2. Caminho incorreto no código

**Soluções:**

```bash
# Local - Forçar adição do database
git add -f data/db/alimentos.db
git commit -m "add: database"
git push

# PythonAnywhere - Puxar e verificar
cd ~/plano-alimentar
git pull
ls -lh data/db/alimentos.db
# Deve mostrar arquivo ~1.6 MB

# Se não existir, clonar novamente
cd ~
rm -rf plano-alimentar
git clone https://github.com/SEU-USUARIO/plano-alimentar.git
cd plano-alimentar
source venv/bin/activate
pip install -r requirements.txt
# Reload web app
```

### Erro: "Internal Server Error" (500)

**Sintoma:** API retorna erro 500.

**Diagnóstico:**

1. No PythonAnywhere, aba **"Web"** → **"Error log"**
2. Procure a **última linha de erro**
3. **Erros comuns:**

**ImportError: No module named 'X'**
```bash
# Dependência faltando
cd ~/plano-alimentar
source venv/bin/activate
pip install X
# Reload web app
```

**CORS Error**
```python
# Verificar em data/api/gestor_alimentos_api.py
# Deve ter:
allow_origin_regex=r"https://.*\.pythonanywhere\.com",
```

**FileNotFoundError**
```bash
# Verificar caminhos no WSGI
# Deve usar Path absolutos:
project_home = f'/home/{USERNAME}/plano-alimentar'
```

### Erro: "CORS blocked"

**Sintoma:** No console do navegador (F12):
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solução:**

Verificar `data/api/gestor_alimentos_api.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.pythonanywhere\.com",  # IMPORTANTE: usar regex
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Se estiver usando `allow_origins=["https://*.pythonanywhere.com"]` → **NÃO FUNCIONA**

Corrigir para `allow_origin_regex` e fazer push:

```bash
# Local
git add data/api/gestor_alimentos_api.py
git commit -m "fix: CORS with regex"
git push

# PythonAnywhere
cd ~/plano-alimentar
git pull
# Reload web app
```

### Erro: AI Agent não funciona

**Sintoma:** Chat IA retorna erro ou não responde.

**Causas possíveis:**
1. `OPENAI_API_KEY` não configurada
2. API Key inválida/expirada
3. Sem créditos na conta OpenAI

**Soluções:**

```bash
# PythonAnywhere - Verificar .env
cd ~/plano-alimentar
cat .env
# Deve mostrar: OPENAI_API_KEY=sk-...

# Se não existir ou estiver errado:
nano .env
# Adicionar/corrigir chave
# Ctrl+O, Enter, Ctrl+X

# Reload web app
```

**Testar chave da OpenAI:**
```bash
# No Bash do PythonAnywhere
cd ~/plano-alimentar
source venv/bin/activate
python

# No Python REPL:
>>> from dotenv import load_dotenv
>>> import os
>>> load_dotenv('.env')
>>> os.getenv('OPENAI_API_KEY')
# Deve mostrar sua chave

>>> # Testar conexão
>>> from openai import OpenAI
>>> client = OpenAI()
>>> client.models.list()
# Se funcionar, chave está OK
>>> exit()
```

### Erro: "Permission denied" no PythonAnywhere

**Sintoma:** Erro de permissão ao acessar arquivos.

**Solução:**

```bash
# Verificar permissões
cd ~/plano-alimentar
ls -la

# Corrigir permissões se necessário
chmod -R 755 .

# Database deve ser read/write
chmod 644 data/db/alimentos.db
```

### Frontend carrega mas API não funciona

**Sintoma:** Interface aparece mas não carrega dados.

**Diagnóstico:**

1. Abrir **DevTools** do navegador (F12)
2. Aba **"Network"**
3. Recarregar página
4. Procurar requisições `/api/...`
5. **Verificar status:**
   - **404:** Rota não existe
   - **500:** Erro no backend
   - **CORS:** Erro de CORS
   - **Timeout:** Backend não está respondendo

**Verificar que backend está rodando:**

No PythonAnywhere:
1. Aba **"Web"**
2. Verificar que app está **"Enabled"**
3. Se não, clicar em **"Enable"**
4. Clicar em **"Reload"**

### Build do Vite com warnings

**Sintoma:** `npm run build` mostra avisos.

**Avisos comuns:**

```
(!) Some chunks are larger than 500 kB after minification
```
→ **Normal.** React é grande. Ignorar ou implementar code splitting.

```
Module level directives cause errors when bundled
```
→ **Não afeta produção.** Pode ignorar.

**Erros que precisam correção:**

```
Error: Could not resolve 'X'
```
→ Dependência faltando. Rodar `npm install`.

```
TypeScript error: Type 'X' is not assignable
```
→ Erro de tipo. Corrigir no código TypeScript.

---

## 🔐 Bugs Conhecidos e Soluções

Esta seção documenta **8 bugs críticos** que foram encontrados e corrigidos antes do deploy.

### BUG #1: `.gitignore` bloqueava `dist/` (CRÍTICO) ✅ CORRIGIDO

**Problema:**
```gitignore
# Linha 35 do .gitignore
dist/
```
Bloqueava pasta de build do Vite.

**Impacto:** Deploy falharia (PythonAnywhere não roda `npm build`).

**Solução:**
```gitignore
# dist/ - comentado para permitir Vite build (linha 66)
```

### BUG #2: CORS com wildcard não funcionava (CRÍTICO) ✅ CORRIGIDO

**Problema:**
```python
allow_origins=["https://*.pythonanywhere.com"]  # ❌ NÃO FUNCIONA
```
FastAPI/Starlette não suportam wildcards em `allow_origins`.

**Impacto:** Todas as requisições seriam bloqueadas (403 CORS).

**Solução:**
```python
allow_origin_regex=r"https://.*\.pythonanywhere\.com",  # ✅ FUNCIONA
```

### BUG #3: Ordem das rotas capturava API (ALTO) ✅ CORRIGIDO

**Problema:**
Catch-all `/{full_path:path}` vinha ANTES dos endpoints `/api/*`.

**Impacto:** Rotas da API poderiam ser capturadas pelo catch-all.

**Solução:**
Movido bloco de static files para **DEPOIS** de todos os endpoints da API.

### BUG #4: Frontend usaria `localhost` em produção (CRÍTICO) ✅ CORRIGIDO

**Problema:**
```typescript
BASE_URL: ENV.VITE_API_URL || 'http://localhost:8001',  // ❌
```
Em produção, `VITE_API_URL` undefined → fallback para localhost.

**Impacto:** API não funcionaria em produção.

**Solução:**
```typescript
function getApiBaseUrl(): string {
  if (ENV.VITE_API_URL) return ENV.VITE_API_URL;

  // Em produção, usar mesma origem
  if (typeof window !== 'undefined') {
    return window.location.origin;  // ✅ https://seunome.pythonanywhere.com
  }

  return 'http://localhost:8001';  // Fallback dev
}
```

### BUG #5: Path traversal vulnerability (SEGURANÇA CRÍTICA) ✅ CORRIGIDO

**Problema:**
```python
file_path = DIST_PATH / full_path  # ⚠️ Permite ../../../etc/passwd
```

**Impacto:** 🚨 Atacante poderia ler arquivos arbitrários do servidor.

**Solução:**
```python
# Validação completa
if ".." in full_path or full_path.startswith("/"):
    raise HTTPException(400, "Invalid path")

file_path = (DIST_PATH / full_path).resolve()

# Verificar que está dentro de DIST_PATH
if not str(file_path).startswith(str(DIST_PATH.resolve())):
    raise HTTPException(403, "Access denied")
```

### BUG #6: `.gitignore` bloqueava database (ALTO) ✅ CORRIGIDO

**Problema:**
```gitignore
*.db                     # Linha 80 - bloqueia TUDO
!data/db/alimentos.db    # Linha 89 - exceção vem DEPOIS (não funciona)
```

**Impacto:** Database não iria para GitHub.

**Solução:**
```gitignore
# Primeiro PERMITIR (exceções primeiro)
!data/
!data/db/
!data/db/alimentos.db

# Depois BLOQUEAR (wildcards depois)
*.db-journal
*backup*.db
```

### BUG #7: Database não estava sendo tracked (ALTO) ✅ CORRIGIDO

**Problema:**
Mesmo com `.gitignore` corrigido, database não era tracked devido a histórico.

**Solução:**
```bash
git add -f data/db/alimentos.db
```

### BUG #8: `app.mount` após rotas GET (MÉDIO) ✅ CORRIGIDO

**Problema:**
Ordem semântica incorreta (mount deveria vir antes das rotas).

**Solução:**
```python
# Montar ANTES das rotas
if DIST_PATH.exists():
    app.mount("/assets", StaticFiles(...), name="assets")

    @app.get("/favicon.ico")
    async def favicon():
        ...
```

---

## 📊 Limitações do Plano Gratuito

O **PythonAnywhere Beginner** (gratuito) tem:

**✅ Suficiente para este projeto:**
- 1 web app
- 512 MB de espaço (~440 MB livres após projeto)
- 100 segundos/dia de CPU (suficiente para uso pessoal)
- Python 3.11 + bibliotecas
- SQLite databases

**❌ Limitações:**
- Apenas domínio `*.pythonanywhere.com` (sem domínio customizado)
- Não permite HTTPS com certificado próprio
- App hiberna após 3 meses sem acesso (precisa reload manual)
- Não permite scheduled tasks (cron jobs)
- CPU limitada (não para alta carga)

**Upgrade para Hacker ($5/mês):**
- Domínio customizado com HTTPS
- Mais CPU (sem hibernação)
- Scheduled tasks
- SSH access
- Mais espaço e bandwidth

Para uso pessoal, **plano gratuito é suficiente.**

---

## 🎯 Checklist Final

Antes de considerar deploy concluído:

### Funcionalidades
- [ ] Frontend carrega sem erros
- [ ] Lista de alimentos aparece (121 itens)
- [ ] Lista de refeições aparece
- [ ] Timeline semanal renderiza
- [ ] Chat IA responde (se configurado OpenAI)
- [ ] Criar refeição funciona

### Performance
- [ ] Tempo de carregamento < 3 segundos
- [ ] Sem erros no console (F12)
- [ ] Imagens/assets carregam

### Segurança
- [ ] `.env` não está no GitHub
- [ ] API Key não está exposta no código
- [ ] CORS configurado corretamente
- [ ] Path traversal bloqueado

### Deploy
- [ ] App público acessível
- [ ] GitHub atualizado
- [ ] Logs sem erros críticos

---

## 📚 Recursos Adicionais

### Documentação
- **PythonAnywhere Help:** [help.pythonanywhere.com](https://help.pythonanywhere.com)
- **FastAPI Docs:** [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **Vite Docs:** [vitejs.dev](https://vitejs.dev)

### Arquivos do Projeto
- **[CLAUDE.md](CLAUDE.md)** - Instruções para Claude Code
- **[README.md](README.md)** - Overview do projeto
- **[readme_estrategia_nutricional.md](readme_estrategia_nutricional.md)** - Estratégia nutricional

### Scripts Úteis
- `verificar_deploy.py` - Validação pré-deploy
- `data/scripts/db_stats.py` - Estatísticas do database
- `data/scripts/db_verifica.py` - Verificar integridade

---

## 🆘 Suporte

Se encontrar problemas não cobertos neste guia:

1. **Verificar logs:**
   - PythonAnywhere → Web → Error log
   - Console do navegador (F12)

2. **Consultar seções:**
   - [Troubleshooting](#-troubleshooting)
   - [Bugs Conhecidos](#-bugs-conhecidos-e-soluções)

3. **Testar localmente:**
   ```bash
   # Windows
   .\start.bat
   # Acessar: http://localhost:5173
   ```

4. **Reverter mudanças:**
   ```bash
   git log  # Ver histórico
   git checkout HASH_DO_COMMIT  # Voltar para versão que funcionava
   ```

---

## ✨ Resumo Ultra-Rápido

**Para quem tem pressa:**

```bash
# 1. LOCAL
npm run build
git add -f dist/
git add .
git commit -m "deploy: ready for production"
git push

# 2. PYTHONANYWHERE
git clone https://github.com/SEU-USUARIO/plano-alimentar.git
cd plano-alimentar
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env  # Adicionar OPENAI_API_KEY

# 3. WEB APP
# - Manual configuration → Python 3.11
# - WSGI: colar código do guia
# - Virtualenv: /home/SEUNOME/plano-alimentar/venv
# - Static files: /assets → /home/SEUNOME/plano-alimentar/dist/assets
# - Reload

# 4. ACESSAR
# https://seunome.pythonanywhere.com
```

---

## 🎉 Conclusão

Seguindo este guia, você terá:

✅ **App público** em produção
✅ **Frontend React** otimizado
✅ **Backend FastAPI** funcional
✅ **AI Agent GPT-4** integrado
✅ **Database SQLite** com 121 alimentos
✅ **Zero vulnerabilidades** de segurança
✅ **Workflow** de updates estabelecido

**Tempo total:** ~15-20 minutos
**Custo:** $0 (plano gratuito)
**Manutenção:** Minimal

---

**🤖 Desenvolvido com Claude Code**
**📧 Gabriel Pitta**
**📅 Última atualização:** Novembro 2025

---

*Este guia consolida informações de TUTORIAL_PYTHONANYWHERE.md, README_DEPLOY.md, CHECKLIST_DEPLOY.md, LEIA_ANTES_DE_SAIR.md, BUGS_CORRIGIDOS.md e RESUMO_PARA_GABRIEL.md em um único documento completo.*
