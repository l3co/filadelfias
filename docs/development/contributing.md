# Guia de Contribuição — Filadelfias

Este documento orienta desenvolvedores que desejam contribuir com o projeto.

---

## 🚀 Pré-requisitos

### Backend (Python)
- Python 3.11+
- Poetry 1.8+ (gerenciador de dependências)
- Docker (para Firestore Emulator)

### Frontend Web
- Node.js 20+
- npm

### Mobile
- Node.js 20+
- npm
- Expo CLI (`npm install -g expo-cli`)
- Expo Go no celular (para testes)

---

## 🛠️ Setup Local

### 1. Clone o repositório

```bash
git clone https://github.com/l3co/filadelfias.git
cd filadelfias
```

### 2. Backend

```bash
cd apps/backend
poetry install
cp .env.example .env
# Edite .env com suas configurações

# Opção A: Com Firestore Emulator (recomendado para dev)
docker run -d -p 8080:8080 mtlynch/firestore-emulator
FIRESTORE_EMULATOR_HOST=localhost:8080 PROJECT_ID=filadelfias-dev poetry run uvicorn src.main:app --reload

# Opção B: Com Firebase real
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
poetry run uvicorn src.main:app --reload
```

**API disponível em:** http://localhost:8000/docs

### 3. Web

```bash
cd apps/web
npm install
cp .env.example .env
npm run dev
```

**App disponível em:** http://localhost:5173

### 4. Mobile

```bash
cd apps/mobile
npm install
cp .env.example .env
npm start
# Escaneie o QR code com Expo Go
```

---

## 📁 Convenções de Código

### Python (Backend)

| Ferramenta | Configuração |
|------------|--------------|
| **Formatador** | Black (linha máxima 120) |
| **Linter** | Ruff |
| **Tipos** | Tipagem obrigatória em funções públicas |
| **Async** | Todo endpoint deve ser `async def` |

```bash
# Formatar código
poetry run black src/

# Verificar lint
poetry run ruff check src/
```

### TypeScript (Web/Mobile)

| Ferramenta | Configuração |
|------------|--------------|
| **Linter** | ESLint |
| **Componentes** | Functional components com hooks |
| **Estilos Web** | TailwindCSS + shadcn/ui |
| **Estilos Mobile** | NativeWind (TailwindCSS para RN) |

```bash
# Verificar lint
npm run lint
```

---

## 🌿 Git Flow

### Branches

| Branch | Descrição |
|--------|-----------|
| `main` | Produção (protegida, requer PR) |
| `feature/XXX` | Novas funcionalidades |
| `fix/XXX` | Correções de bugs |
| `refactor/XXX` | Refatorações |
| `docs/XXX` | Documentação |

### Commits (Conventional Commits)

```bash
# Formato
<tipo>(<escopo>): <descrição>

# Exemplos
feat(mobile): add prayer screen with categories
fix(backend): correct tithe approval logic
refactor(web): extract useMetadata hook
docs: update README with new features
test(e2e): add member directory tests
chore: update dependencies
```

**Tipos válidos:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`

### Pull Requests

1. Crie uma branch a partir de `main`
2. Faça commits atômicos com mensagens claras
3. Abra PR com descrição do que foi feito
4. Vincule issues relacionadas (se houver)
5. Aguarde review
6. Squash and merge ao integrar

---

## 🧪 Testes

### Backend

```bash
cd apps/backend

# Testes unitários
poetry run pytest

# Com cobertura
poetry run pytest --cov=src

# Testes específicos
poetry run pytest tests/test_auth.py -v
```

### Web

```bash
cd apps/web

# Testes unitários (Vitest)
npm test

# Testes E2E (Playwright + Cucumber)
npm run test:e2e

# Modo interativo
npm run test:e2e:ui

# Apenas smoke tests
npm run test:e2e:smoke
```

---

## 📡 Dados de Desenvolvimento

### Popular banco com dados de teste

```bash
cd apps/backend

# Dados para desenvolvimento
poetry run python -m src.scripts.seed_dev_data

# Dados para E2E
poetry run seed-e2e
```

**Credenciais de teste:**
- Email: `l3co@outlook.com`
- Senha: `mudar@123`

---

## � Sistema de Metadados

O backend é a **fonte única de verdade** para enums do sistema:

```bash
# Endpoint
GET /metadata

# Retorna
{
  "enums": {
    "ecclesiastical_offices": [
      { "value": "PASTOR", "label": "Pastor" },
      { "value": "PRESBITERO", "label": "Presbítero" },
      ...
    ]
  }
}
```

**No frontend, use os hooks:**
- Web: `src/hooks/useMetadata.ts`
- Mobile: `src/hooks/useMetadata.ts`

**NÃO duplique enums no frontend!**

---

## 📝 Documentação

| Documento | Descrição |
|-----------|-----------|
| `docs/architecture.md` | Arquitetura do sistema |
| `docs/modules.md` | Módulos e endpoints |
| `docs/entity-relationship.md` | Modelo de dados |
| `docs/glossary.md` | Termos do domínio |
| `docs/tech-stack.md` | Stack tecnológica |
| `/docs` (API) | Swagger gerado automaticamente |

---

## ⚖️ Código de Conduta

Este é um projeto a serviço da Igreja. Esperamos:

- **Respeito mútuo** - Trate todos com dignidade
- **Comunicação clara** - Seja direto e construtivo
- **Foco no propósito** - Servir, não competir
- **Humildade** - Esteja aberto a aprender e ensinar

---

## 📧 Contato

Dúvidas ou sugestões? Abra uma issue no GitHub.
