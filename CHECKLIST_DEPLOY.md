# ✅ Checklist de Deploy - PythonAnywhere

Use esta checklist para verificar se tudo está pronto antes de fazer o deploy.

---

## 📋 Pré-Deploy (Local)

### Arquivos Essenciais

- [x] `requirements.txt` existe e tem dependências Python
- [x] `.env.example` existe (template sem secrets)
- [x] `.env` no .gitignore (para não commitar secrets)
- [x] `dist/` existe com build de produção
- [x] `dist/index.html` existe
- [x] `dist/assets/` existe com CSS e JS
- [x] `data/db/alimentos.db` existe (database)
- [x] `TUTORIAL_PYTHONANYWHERE.md` existe
- [x] `README_DEPLOY.md` existe

### Configurações

- [x] `.gitignore` **não** bloqueia `dist/` (comentado)
- [x] `.gitignore` **permite** `data/db/alimentos.db` (exceção `!data/db/alimentos.db`)
- [x] `vite.config.js` tem configuração de build
- [x] `gestor_alimentos_api.py` importa `StaticFiles` e `FileResponse`
- [x] `gestor_alimentos_api.py` tem CORS para `*.pythonanywhere.com`
- [x] `gestor_alimentos_api.py` serve arquivos de `dist/`

---

## 🔍 Verificação Rápida

Execute estes comandos para validar:

```bash
# 1. Verificar que dist/ existe e tem conteúdo
dir dist
# Deve mostrar: index.html, assets/

# 2. Verificar que database existe
dir "data\db\alimentos.db"
# Deve mostrar: alimentos.db (~400 KB)

# 3. Verificar que requirements.txt tem conteúdo
type requirements.txt
# Deve mostrar: fastapi, uvicorn, openai, etc.

# 4. Verificar que .env.example existe
type .env.example
# Deve mostrar template com OPENAI_API_KEY

# 5. Verificar tamanho do build
dir dist\assets
# Deve mostrar ~3-4 arquivos JS/CSS
```

---

## 🚀 Pronto para Deploy?

Se **TODAS** as caixas acima estiverem ✅ marcadas:

1. Faça commit e push para o GitHub
2. Siga o [TUTORIAL_PYTHONANYWHERE.md](TUTORIAL_PYTHONANYWHERE.md)
3. Deploy completo em ~15 minutos

---

## 📦 O que vai pro GitHub

**✅ INCLUÍDO:**
- Todo código-fonte (`.tsx`, `.ts`, `.py`)
- Build de produção (`dist/`)
- Database (`data/db/alimentos.db`)
- Dependências (`requirements.txt`, `package.json`)
- Templates (`.env.example`)
- Documentação (`*.md`)

**❌ EXCLUÍDO (.gitignore):**
- Secrets (`.env` com API key real)
- Dependencies (`node_modules/`, `venv/`)
- Build artifacts (`.vite/`, `__pycache__/`)
- Logs (`*.log`)
- Backups (`*backup*.db`)

---

## 🔐 Segurança

Antes de commitar, verifique:

- [ ] `.env` está no `.gitignore` ✅
- [ ] Nenhuma API key hardcoded no código ✅
- [ ] `.env.example` tem apenas placeholders ✅

---

## ⚠️ Avisos Importantes

1. **Database no Git:** O arquivo `alimentos.db` DEVE ir pro GitHub (necessário para produção)
2. **Build no Git:** A pasta `dist/` DEVE ir pro GitHub (PythonAnywhere não roda npm)
3. **Environment:** Você vai criar `.env` manualmente no PythonAnywhere (não vai do Git)

---

**Última verificação:** Novembro 2025
