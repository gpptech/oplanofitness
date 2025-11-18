# 🚀 Deploy no PythonAnywhere - Quick Start

Este projeto está **100% pronto** para deploy no [PythonAnywhere](https://www.pythonanywhere.com).

## ⚡ Deploy em 3 Passos

### 1️⃣ Criar repositório no GitHub

```bash
git add .
git commit -m "deploy: prepara projeto para PythonAnywhere"
git remote add origin https://github.com/SEU-USUARIO/plano-alimentar.git
git push -u origin main
```

### 2️⃣ Clonar no PythonAnywhere

No console Bash do PythonAnywhere:

```bash
git clone https://github.com/SEU-USUARIO/plano-alimentar.git
cd plano-alimentar
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env  # Adicionar sua OPENAI_API_KEY
```

### 3️⃣ Configurar Web App

1. **Web App:** Manual configuration → Python 3.11
2. **WSGI file:** Cole o código do [TUTORIAL_PYTHONANYWHERE.md](TUTORIAL_PYTHONANYWHERE.md#32-configurar-wsgi)
3. **Virtualenv:** `/home/SEUNOME/plano-alimentar/venv`
4. **Static files:**
   - URL: `/assets` → Directory: `/home/SEUNOME/plano-alimentar/dist/assets`
5. **Reload** o app

✅ **Pronto!** Acesse `https://seunome.pythonanywhere.com`

---

## 📖 Tutorial Completo

Para instruções detalhadas passo-a-passo com screenshots e troubleshooting:

👉 **[TUTORIAL_PYTHONANYWHERE.md](TUTORIAL_PYTHONANYWHERE.md)**

---

## 🎯 O que já está configurado

✅ **Backend:** FastAPI serve frontend estático + API REST
✅ **Frontend:** Build de produção em `/dist` (282 KB minificado)
✅ **Database:** SQLite com 121 alimentos (incluído no repo)
✅ **CORS:** Configurado para `*.pythonanywhere.com`
✅ **Dependencies:** `requirements.txt` completo
✅ **Environment:** Template `.env.example` pronto

---

## 🔄 Atualizações Futuras

```bash
# Local (após mudanças)
git add .
git commit -m "descrição"
git push

# PythonAnywhere
cd ~/plano-alimentar
git pull
# Reload app na aba "Web"
```

---

## 🆘 Problemas?

Consulte a seção **[Troubleshooting](TUTORIAL_PYTHONANYWHERE.md#-troubleshooting)** no tutorial completo.

---

**Tempo estimado de deploy:** ~15 minutos
**Plano necessário:** Beginner (gratuito)
**Última atualização:** Novembro 2025
