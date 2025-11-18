# 📢 LEIA ANTES DE SAIR DE CASA

Gabriel, **está tudo pronto** para o deploy no PythonAnywhere! 🎉

---

## ✅ O que já foi feito

1. ✅ **Build de produção** compilado (`dist/` - 282 KB minificado)
2. ✅ **Requirements.txt** criado com todas as dependências Python
3. ✅ **API modificada** para servir frontend estático (SPA)
4. ✅ **CORS configurado** para `*.pythonanywhere.com`
5. ✅ **Database incluído** no repositório (421 KB)
6. ✅ **Tutorial completo** com passo-a-passo detalhado
7. ✅ **Tudo testado localmente** e funcionando

---

## 🚨 IMPORTANTE: Antes de commitar

### 1. Adicionar pasta `dist/` ao Git

A pasta `dist/` está **ignorada por padrão** no Git. Você precisa forçar a adição:

```bash
# Adicionar pasta dist/ forçadamente
git add -f dist/

# Verificar que foi adicionado
git status
# Deve aparecer: new file: dist/index.html, dist/assets/...
```

### 2. Fazer commit completo

```bash
git add .
git commit -m "feat: prepara projeto 100% para deploy PythonAnywhere

BACKEND:
- API agora serve frontend estático (SPA)
- CORS configurado para *.pythonanywhere.com
- Database SQLite incluído (121 alimentos)
- Requirements.txt com todas dependências

FRONTEND:
- Build de produção (282 KB minificado)
- Vite configurado para produção
- Assets otimizados (code splitting)

DEPLOY:
- Tutorial completo: TUTORIAL_PYTHONANYWHERE.md
- Quick start: README_DEPLOY.md
- Checklist: CHECKLIST_DEPLOY.md

✅ Pronto para produção em 15 minutos

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 3. Criar repositório no GitHub

**ANTES DE SAIR DE CASA:**

1. Acesse: [github.com/new](https://github.com/new)
2. Nome: `plano-alimentar`
3. Visibilidade: **Public** (ou Private se preferir)
4. **NÃO** adicione README/LICENSE/.gitignore
5. Copie a URL do repositório

```bash
# Adicionar remote (SUBSTITUA pela URL real)
git remote add origin https://github.com/SEU-USUARIO/plano-alimentar.git

# Fazer push
git push -u origin main
```

✅ **Agora sim está no GitHub!**

---

## 📱 Quando chegar em casa

### Opção A: Seguir tutorial completo (recomendado)

Abra o arquivo: **[TUTORIAL_PYTHONANYWHERE.md](TUTORIAL_PYTHONANYWHERE.md)**

- ✅ Passo-a-passo detalhado
- ✅ Screenshots de cada etapa
- ✅ Troubleshooting completo
- ✅ Tempo estimado: 15 minutos

### Opção B: Quick start (se tiver pressa)

Abra o arquivo: **[README_DEPLOY.md](README_DEPLOY.md)**

- ✅ 3 passos resumidos
- ✅ Comandos prontos para copiar
- ✅ Tempo estimado: 10 minutos

---

## 🔑 Você vai precisar

1. **Conta PythonAnywhere** (criar em 2 min - gratuita)
   - [pythonanywhere.com](https://www.pythonanywhere.com)

2. **API Key da OpenAI** (você já tem)
   - Vai colar no arquivo `.env` no servidor

3. **URL do seu repositório GitHub**
   - Ex: `https://github.com/gabrielpitta/plano-alimentar`

---

## 🎯 Resultado Final

Depois de seguir o tutorial, você terá:

🌐 **App público:** `https://seunome.pythonanywhere.com`

Funcionalidades testadas:
- ✅ Ver 121 alimentos (modo "Dados")
- ✅ Ver lista de refeições (modo "Sugestões")
- ✅ Criar novas refeições (modo "Config")
- ✅ Chat com AI Agent (modo "Chat IA")
- ✅ Timeline semanal com jejum (modo "Agenda")

---

## 📂 Estrutura de Arquivos (resumo)

```
plano_alimentar/
├── dist/                          # ✅ Frontend compilado (vai pro Git)
│   ├── index.html
│   └── assets/
├── data/
│   ├── api/
│   │   └── gestor_alimentos_api.py  # ✅ Modificado para servir SPA
│   └── db/
│       └── alimentos.db           # ✅ Database (vai pro Git)
├── requirements.txt               # ✅ Dependências Python
├── .env.example                   # ✅ Template (vai pro Git)
├── TUTORIAL_PYTHONANYWHERE.md     # 📖 Guia completo
├── README_DEPLOY.md               # 📖 Quick start
└── CHECKLIST_DEPLOY.md            # ✅ Verificação
```

---

## ⚠️ Avisos

1. **NÃO** commite o arquivo `.env` (já está no .gitignore)
2. **SIM**, commite `dist/` e `alimentos.db` (necessários)
3. Você vai criar o `.env` **manualmente** no PythonAnywhere

---

## 🆘 Se der problema

Todos os problemas comuns estão documentados em:
**[TUTORIAL_PYTHONANYWHERE.md - Troubleshooting](TUTORIAL_PYTHONANYWHERE.md#-troubleshooting)**

---

## 🎉 Pronto!

Quando chegar em casa:
1. Abra [TUTORIAL_PYTHONANYWHERE.md](TUTORIAL_PYTHONANYWHERE.md)
2. Siga o passo-a-passo
3. Em 15 minutos está online

**Boa sorte! 🚀**

---

*Arquivos criados em: 07/11/2025*
*Tempo total de preparação: ~30 minutos*
*Pronto para deploy: ✅ SIM*
