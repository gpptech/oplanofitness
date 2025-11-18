# 🚀 Tutorial: Deploy do Plano Alimentar no PythonAnywhere

Este guia completo vai te levar do zero ao deploy em produção em **~15 minutos**.

---

## 📋 Pré-requisitos

- ✅ Conta no GitHub (gratuita)
- ✅ Conta no PythonAnywhere (plano gratuito)
- ✅ Chave da OpenAI API (para o AI Agent)

---

## Parte 1: Preparar Repositório no GitHub

### 1.1 Criar repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Configure:
   - **Nome:** `plano-alimentar` (ou outro nome)
   - **Visibilidade:** Public ou Private
   - **NÃO** adicione README, .gitignore ou license (já temos)
3. Clique em **"Create repository"**

### 1.2 Fazer push do projeto

Abra o terminal **nesta pasta** (`d:\Cursor Projects\plano_alimentar`) e execute:

```bash
# Verificar status do Git
git status

# Adicionar todos os arquivos (incluindo dist/ e database)
git add .

# Criar commit
git commit -m "feat: prepara projeto para deploy no PythonAnywhere

- Adiciona requirements.txt com dependências Python
- Configura build de produção com Vite
- API agora serve frontend estático (SPA)
- CORS configurado para PythonAnywhere
- Database incluído no repositório
- Tutorial completo de deploy

✅ Pronto para produção"

# Adicionar remote (SUBSTITUA pelo SEU repositório)
git remote add origin https://github.com/SEU-USUARIO/plano-alimentar.git

# Fazer push
git branch -M main
git push -u origin main
```

✅ **Checkpoint:** Seu código agora está no GitHub!

---

## Parte 2: Configurar PythonAnywhere

### 2.1 Criar conta gratuita

1. Acesse [pythonanywhere.com](https://www.pythonanywhere.com)
2. Clique em **"Start running Python online in less than a minute!"**
3. Crie uma conta **Beginner** (gratuita)
4. Confirme seu email

### 2.2 Clonar repositório

1. No dashboard do PythonAnywhere, clique na aba **"Consoles"**
2. Clique em **"Bash"** para abrir um terminal
3. Execute os comandos:

```bash
# Ir para o diretório home
cd ~

# Clonar seu repositório (SUBSTITUA pela URL do SEU repo)
git clone https://github.com/SEU-USUARIO/plano-alimentar.git

# Entrar na pasta
cd plano-alimentar

# Verificar se tem tudo
ls -la
```

Você deve ver:
- ✅ `data/` (backend + database)
- ✅ `dist/` (frontend compilado)
- ✅ `requirements.txt`
- ✅ `.env.example`

### 2.3 Instalar dependências Python

```bash
# Criar virtual environment
python3.11 -m venv venv

# Ativar virtual environment
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

Aguarde ~2 minutos enquanto instala FastAPI, OpenAI, etc.

### 2.4 Configurar variáveis de ambiente

```bash
# Copiar template
cp .env.example .env

# Editar arquivo .env
nano .env
```

No editor `nano`:
1. Substitua `sk-proj-your-actual-api-key-here` pela sua **chave real da OpenAI**
2. **Pressione:** `Ctrl + O` (salvar)
3. **Pressione:** `Enter` (confirmar)
4. **Pressione:** `Ctrl + X` (sair)

### 2.5 Testar localmente no PythonAnywhere

```bash
# Verificar se database existe
ls -lh data/db/alimentos.db

# Testar servidor (CTRL+C para parar)
cd data/api
python gestor_alimentos_api.py
```

Se aparecer `Uvicorn running on http://0.0.0.0:8001` → **funcionou!** ✅

Aperte `Ctrl + C` para parar o servidor.

---

## Parte 3: Configurar Web App

### 3.1 Criar Web App

1. No dashboard, clique na aba **"Web"**
2. Clique em **"Add a new web app"**
3. Configure:
   - **Domínio:** `seunome.pythonanywhere.com` (aparece automaticamente)
   - **Framework:** Manual configuration
   - **Python version:** Python 3.11
4. Clique em **"Next"** até finalizar

### 3.2 Configurar WSGI

1. Na página "Web", role até **"Code"** → **"WSGI configuration file"**
2. Clique no caminho do arquivo (ex: `/var/www/seunome_pythonanywhere_com_wsgi.py`)
3. **APAGUE TODO O CONTEÚDO** do arquivo
4. **COLE ESTE CÓDIGO:**

```python
# =============================================
# WSGI Configuration - Plano Alimentar
# =============================================

import sys
import os
from pathlib import Path

# Adicionar pasta do projeto ao PYTHONPATH
project_home = '/home/SEUNOME/plano-alimentar'  # ⚠️ SUBSTITUA 'SEUNOME' pelo seu username!
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

5. **IMPORTANTE:** Substitua `SEUNOME` pelo seu username do PythonAnywhere
6. Clique em **"Save"** (botão verde)

### 3.3 Configurar Virtual Environment

1. Role até **"Virtualenv"**
2. Cole o caminho: `/home/SEUNOME/plano-alimentar/venv` (substitua SEUNOME)
3. Clique no ✅ (check verde)

### 3.4 Configurar Arquivos Estáticos

1. Role até **"Static files"**
2. Adicione estas 2 entradas:

**Entrada 1 (Assets):**
- **URL:** `/assets`
- **Directory:** `/home/SEUNOME/plano-alimentar/dist/assets`

**Entrada 2 (Root - opcional):**
- **URL:** `/`
- **Directory:** `/home/SEUNOME/plano-alimentar/dist`

3. Clique em ✅ para salvar cada uma

### 3.5 Recarregar aplicação

1. Role até o topo da página
2. Clique no **botão verde gigante:** "Reload seunome.pythonanywhere.com"
3. Aguarde ~5 segundos

---

## Parte 4: Testar Aplicação

### 4.1 Acessar aplicação

Clique no link: **`https://seunome.pythonanywhere.com`**

Você deve ver o **Plano Alimentar** funcionando! 🎉

### 4.2 Testar funcionalidades

**Teste 1: Ver lista de alimentos**
1. Modo: **"Dados"** → **"Tabela de Alimentos"**
2. Deve aparecer 121 alimentos

**Teste 2: Ver refeições**
1. Modo: **"Sugestões de Refeições"**
2. Deve aparecer lista de cards com refeições

**Teste 3: Chat com AI**
1. Modo: **"Chat IA"**
2. Digite: `liste 5 alimentos da categoria proteína`
3. O agente deve responder com lista de alimentos

**Teste 4: Criar refeição (Config)**
1. Modo: **"Config"** → aba **"Nova Refeição"**
2. Preencha os campos e selecione alimentos
3. Clique em "Criar Refeição"
4. Verifique se apareceu na lista

✅ **Se tudo funcionou, parabéns!** 🎉

---

## Parte 5: Atualizações Futuras

Sempre que fizer mudanças no projeto local:

### 5.1 Fazer push para GitHub

```bash
# Na pasta do projeto (Windows)
git add .
git commit -m "descrição das mudanças"
git push
```

### 5.2 Atualizar no PythonAnywhere

```bash
# No console Bash do PythonAnywhere
cd ~/plano-alimentar
git pull origin main

# Se mudou dependências Python:
source venv/bin/activate
pip install -r requirements.txt

# Se mudou frontend (rebuildar):
# (Não precisa, já está em dist/ no Git)
```

### 5.3 Recarregar aplicação

1. Aba **"Web"** do PythonAnywhere
2. Clique no botão verde: **"Reload seunome.pythonanywhere.com"**

✅ Atualização concluída!

---

## 🐛 Troubleshooting

### Erro: "Frontend não encontrado"

**Causa:** Pasta `dist/` não está no repositório

**Solução:**
```bash
# Local (Windows)
npm run build
git add dist/
git commit -m "add: build de produção"
git push

# PythonAnywhere
cd ~/plano-alimentar
git pull
```

### Erro: "Database not found"

**Causa:** Arquivo `alimentos.db` não foi commitado

**Solução:**
```bash
# Local (Windows)
git add -f data/db/alimentos.db
git commit -m "add: database"
git push

# PythonAnywhere
cd ~/plano-alimentar
git pull
```

### Erro: "Internal Server Error"

**Solução:**
1. No PythonAnywhere, aba **"Web"**
2. Role até **"Log files"**
3. Clique em **"Error log"**
4. Veja o erro completo e procure a causa

### AI Agent não funciona

**Causa:** `OPENAI_API_KEY` não configurado ou inválido

**Solução:**
```bash
# PythonAnywhere Bash
cd ~/plano-alimentar
nano .env
# Verificar se a chave está correta
# Salvar (Ctrl+O, Enter, Ctrl+X)
```

Depois recarregar o app na aba "Web".

---

## 📊 Limitações do Plano Gratuito

O plano gratuito do PythonAnywhere tem:

- ✅ **1 web app** (suficiente para este projeto)
- ✅ **512 MB de espaço** (database SQLite cabe tranquilo)
- ✅ **100 segundos/dia de CPU** (suficiente para uso pessoal)
- ❌ **Não permite HTTPS customizado** (só .pythonanywhere.com)
- ❌ **Requer reload manual a cada 3 meses** (plano gratuito hiberna)

Para uso profissional, considere upgrade para plano **Hacker ($5/mês)**.

---

## 🎯 Resumo

✅ **O que fizemos:**
1. Preparamos projeto para produção (build, database, requirements)
2. Criamos repositório no GitHub
3. Configuramos PythonAnywhere (WSGI, virtualenv, static files)
4. Deploy concluído em ~15 minutos

✅ **Você agora tem:**
- 🌐 App rodando em `https://seunome.pythonanywhere.com`
- 🗄️ Database SQLite com 121 alimentos
- 🤖 AI Agent com GPT-4
- 📱 Interface React responsiva
- 🔄 Workflow de updates via Git

---

## 📚 Recursos Adicionais

- **Docs PythonAnywhere:** [help.pythonanywhere.com](https://help.pythonanywhere.com)
- **Docs FastAPI:** [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **Docs Vite:** [vitejs.dev](https://vitejs.dev)

---

## 🆘 Suporte

Se tiver problemas:
1. Verifique os **logs de erro** no PythonAnywhere (aba Web → Error log)
2. Teste localmente primeiro (`python data/api/gestor_alimentos_api.py`)
3. Consulte a seção **Troubleshooting** acima

---

**Feito com ❤️ por Gabriel Pitta**

*Última atualização: Novembro 2025*
