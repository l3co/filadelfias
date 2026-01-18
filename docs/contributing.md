# Guia de Contribuição — Filadelfias

Este documento orienta desenvolvedores que desejam contribuir com o projeto.

---

## 🚀 Pré-requisitos

### Backend (Python)
- Python 3.11+
- Poetry (gerenciador de dependências)
- Docker e Docker Compose
- PostgreSQL 15+ (via Docker ou local)

### Frontend (Web/Mobile)
- Node.js 20+
- pnpm (gerenciador de pacotes)
- Expo CLI (para mobile)

---

## 🛠️ Setup Local

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/filadelfias.git
cd filadelfias
```

### 2. Backend
```bash
cd apps/backend
poetry install
cp .env.example .env
# Edite .env com suas configurações
docker-compose up -d db  # Sobe apenas o Postgres
poetry run alembic upgrade head  # Aplica migrações
poetry run uvicorn src.main:app --reload
```

### 3. Web
```bash
cd apps/web
pnpm install
cp .env.example .env.local
pnpm dev
```

### 4. Mobile
```bash
cd apps/mobile
pnpm install
pnpm start  # ou: expo start
```

---

## 📁 Convenções de Código

### Python (Backend)
- **Formatador**: Black (linha máxima 88)
- **Linter**: Ruff
- **Tipos**: Tipagem obrigatória em funções públicas
- **Docstrings**: Estilo Google, em inglês
- **Async**: Todo endpoint deve ser `async def`

### TypeScript (Web/Mobile)
- **Formatador**: Prettier
- **Linter**: ESLint (config compartilhada em `packages/config`)
- **Componentes**: Functional components com hooks
- **Estilos**: TailwindCSS (Web) / NativeWind (Mobile)

---

## 🌿 Git Flow

### Branches
- `main`: Produção (protegida, requer PR aprovado)
- `develop`: Desenvolvimento contínuo
- `feature/XXX`: Novas funcionalidades
- `fix/XXX`: Correções de bugs
- `refactor/XXX`: Refatorações

### Commits (Conventional Commits)
```
feat: adiciona leitor da Bíblia offline
fix: corrige crash ao salvar nota
refactor: extrai hook useAuth
docs: atualiza README com instruções de deploy
test: adiciona testes para votação
chore: atualiza dependências
```

### Pull Requests
1. Sempre baseie sua branch em `develop`.
2. Escreva descrição clara do que foi feito.
3. Vincule issues relacionadas.
4. Aguarde review de pelo menos 1 maintainer.
5. Squash and merge ao integrar.

---

## 🧪 Testes

### Backend
```bash
cd apps/backend
poetry run pytest
poetry run pytest --cov=src  # Com cobertura
```

### Web
```bash
cd apps/web
pnpm test
pnpm test:e2e  # Playwright
```

---

## 📝 Documentação

- **Arquitetura**: `docs/architecture.md`
- **Módulos**: `docs/modules.md`
- **ERD**: `docs/entity-relationship.md`
- **Glossário**: `docs/glossary.md`
- **API**: Gerada automaticamente via Swagger (`/docs`)

---

## ⚖️ Código de Conduta

Este é um projeto a serviço da Igreja. Esperamos:
- Respeito mútuo
- Comunicação clara e construtiva
- Foco no propósito: servir, não competir
- Humildade para aprender e ensinar

---

## 📧 Contato

Dúvidas ou sugestões? Abra uma issue ou entre em contato via [email do projeto].
