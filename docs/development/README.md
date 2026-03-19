# Desenvolvimento — Documentação

Guias para desenvolvedores contribuindo com o projeto.

---

## 📂 Documentos

| Arquivo | Descrição |
|---------|-----------|
| [contributing.md](contributing.md) | Setup local, convenções, Git flow |
| [glossary.md](glossary.md) | Glossário de termos eclesiásticos |
| [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) | Variáveis de ambiente necessárias |

---

## 🚀 Setup Rápido

```bash
# Backend
cd apps/backend
poetry install
cp .env.example .env
docker-compose up -d postgres
poetry run alembic upgrade head
poetry run uvicorn src.main:app --reload

# Web
cd apps/web
npm install
cp .env.example .env
npm run dev

# Mobile
cd apps/mobile
npm install
cp .env.example .env
npm start
```
