# Filadelfias

> Plataforma multi-tenant para gestão de igrejas reformadas presbiterianas

## 🎯 Visão Geral

Filadelfias é uma plataforma completa para gestão de igrejas presbiterianas, desenvolvida seguindo princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**. O sistema oferece funcionalidades para gestão de membros, pedidos de oração, dízimos, EBD, missões, eventos e muito mais.

### Stack Tecnológica

| Camada | Tecnologias |
|--------|-------------|
| **Backend** | Python 3.11+, FastAPI, PostgreSQL, SQLAlchemy |
| **Web** | React 19, Vite, TypeScript, TailwindCSS, shadcn/ui, TanStack Query |
| **Mobile** | React Native 0.81, Expo 54, NativeWind, Zustand |
| **Infra** | Homelab K3s (Rancher), Cloudflare Zero Trust, GitHub Actions + Fleet |

---

## 🚀 Quick Start

### Pré-requisitos

- **Docker** e Docker Compose
- **Node.js 20+** (para web e mobile)
- **Python 3.11+** e **Poetry** (para backend)
- **Expo CLI** (para mobile)

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
# Edite .env com as configurações do banco

# Inicie PostgreSQL com Docker Compose
docker-compose up -d postgres

# Execute migrações
poetry run alembic upgrade head

# Inicie o servidor
poetry run uvicorn src.main:app --reload
```

### 3. Web

```bash
cd apps/web
npm install
cp .env.example .env
npm run dev
# Acesse http://localhost:5173
```

### 4. Mobile

```bash
cd apps/mobile
npm install
cp .env.example .env
npm start
# Escaneie o QR code com Expo Go
```

---

## 📁 Estrutura do Projeto

```
filadelfias/
├── apps/
│   ├── backend/          # API FastAPI + PostgreSQL
│   ├── web/              # React + Vite + TailwindCSS
│   └── mobile/           # React Native + Expo
├── packages/
│   └── contracts/        # Schemas Zod compartilhados
├── docs/                 # Documentação técnica
│   ├── infrastructure/   # Homelab, K8s, deploy
│   ├── architecture/     # Design de sistema
│   └── development/      # Guias de desenvolvimento
├── plans/                # Planejamento e retrospectivas
│   ├── phases/           # Fases do projeto
│   ├── features/         # Novas funcionalidades
│   └── technical-debt/   # Débitos técnicos
├── k8s/                  # Manifestos Kubernetes
└── docker-compose.yml    # Orquestração local
```

---

## ✅ Funcionalidades Implementadas

### Plataforma
- [x] Autenticação JWT (login, registro, refresh token)
- [x] Multi-tenancy (usuário pode pertencer a múltiplas igrejas)
- [x] RBAC com permissões por ofício eclesiástico
- [x] Sistema de metadados centralizado (enums via API)

### Conteúdo
- [x] Bíblia Online (múltiplas versões, offline no mobile)
- [x] Hinário Novo Cântico (busca, categorias, offline)
- [x] Manual da IPB (navegação por artigos)
- [x] Devocionais

### Comunidade
- [x] Diretório de membros com filtros por ofício
- [x] Pedidos de oração (criar, orar, categorias)
- [x] Eventos e calendário
- [x] Missões e missionários

### Financeiro
- [x] Registro de dízimos e ofertas
- [x] Aprovação de registros (admin)
- [x] Resumo mensal/anual

### Educação
- [x] EBD - Classes e turmas
- [x] Lições e frequência

---

## 🏗️ Arquitetura

### Backend (Clean Architecture)

```
src/
├── api/           # Routers FastAPI (Controllers)
├── application/   # Use Cases
├── domain/        # Entidades, Enums, Value Objects
├── infra/         # Repositories (Firestore)
├── modules/       # Módulos de domínio (prayer, tithe, ebd...)
├── services/      # Serviços externos (Bible API, etc)
└── lib/           # Utilitários (permissions, etc)
```

### Web (Feature-Based)

```
src/
├── components/    # UI components (shadcn/ui)
├── features/      # Módulos por feature
├── hooks/         # Custom hooks (useMetadata, etc)
├── routes/        # Páginas (React Router)
├── services/      # API clients (Axios)
└── types/         # TypeScript types
```

### Mobile (Expo Router)

```
app/
├── (auth)/        # Telas de autenticação
├── (member)/      # Área do membro logado
├── (public)/      # Área pública (Bíblia, Hinário)
└── (admin)/       # Área administrativa
src/
├── components/    # UI components
├── hooks/         # Custom hooks
├── services/      # API clients
├── stores/        # Zustand stores
└── constants/     # Cores, configurações
```

---

## 🔐 Sistema de Permissões

O backend é a **fonte única de verdade** para ofícios e funções eclesiásticas:

| Ofício | Permissões |
|--------|------------|
| **Pastor** | Todas as permissões |
| **Presbítero** | Gestão de membros, assembleias, votações |
| **Diácono** | Gestão financeira, assistência social |
| **Membro** | Visualização, pedidos de oração, dízimos |

Os enums são consumidos via `GET /metadata` e hooks `useMetadata()` no frontend.

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [Arquitetura](./docs/architecture.md) | Visão geral e diagramas |
| [Módulos](./docs/modules.md) | Endpoints e responsabilidades |
| [Modelo de Dados](./docs/entity-relationship.md) | ERD e coleções Firestore |
| [Stack Tecnológica](./docs/tech-stack.md) | Lista de tecnologias |
| [Glossário](./docs/glossary.md) | Termos do domínio eclesiástico |
| [Guia de Contribuição](./docs/contributing.md) | Setup e convenções |
| [Variáveis de Ambiente](./docs/ENVIRONMENT_VARIABLES.md) | Configurações |

---

## 🧪 Testes

```bash
# Backend - Testes unitários
cd apps/backend
poetry run pytest
poetry run pytest --cov=src  # Com cobertura

# Web - Testes unitários
cd apps/web
npm test

# Web - Testes E2E (Playwright + Cucumber)
npm run test:e2e
npm run test:e2e:ui  # Modo interativo
```

---

## 🌐 Ambientes

| Ambiente | Web | API | API Docs |
|----------|-----|-----|----------|
| **Produção** | [filadelfias.com](https://filadelfias.com) | [api.filadelfias.com](https://api.filadelfias.com) | [api.filadelfias.com/docs](https://api.filadelfias.com/docs) |
| **Local** | localhost:5173 | localhost:8000 | localhost:8000/docs |

---

## 📝 Convenções

### Commits (Conventional Commits)

```
feat(mobile): add prayer screen with categories
fix(backend): correct tithe approval logic
docs: update README with new features
refactor(web): extract useMetadata hook
test(e2e): add member directory tests
chore: update dependencies
```

### Branches

- `main` - Produção (protegida)
- `feature/XXX` - Novas funcionalidades
- `fix/XXX` - Correções
- `refactor/XXX` - Refatorações

---

## 👥 Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

Veja [CONTRIBUTING.md](./docs/contributing.md) para detalhes.

---

## 📄 Licença

Este projeto está sob licença MIT.

---

**Desenvolvido com ❤️ para a comunidade reformada presbiteriana**

