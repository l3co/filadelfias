# Filadelfias

> Plataforma multi-tenant para gestão de igrejas reformadas presbiterianas

## 🎯 Visão Geral

Filadelfias é uma plataforma completa para gestão de igrejas, desenvolvida seguindo princípios de **Clean Architecture**, **Domain-Driven Design (DDD)** e **Software Craftsmanship**.

### Stack Tecnológica

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend Web**: React + Vite + TypeScript + TailwindCSS
- **Frontend Mobile**: React Native + Expo (em desenvolvimento)
- **Infraestrutura**: Docker + Docker Compose + DigitalOcean

## 🚀 Quick Start

### Pré-requisitos

- Docker e Docker Compose
- Node.js 20+ (para desenvolvimento local)
- Python 3.11+ (para desenvolvimento local)

### Rodando o Projeto

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/filadelfias.git
cd filadelfias

# Suba os containers
docker compose up -d --build

# Acesse a aplicação
# Web: http://localhost:5173
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## 📁 Estrutura do Projeto

```
filadelfias/
├── apps/
│   ├── backend/          # FastAPI + SQLAlchemy
│   ├── web/              # React + Vite
│   └── mobile/           # React Native + Expo (futuro)
├── packages/
│   └── contracts/        # Schemas compartilhados (Zod)
├── docs/                 # Documentação técnica
├── plan/                 # Planos de implementação
└── docker-compose.yml    # Orquestração de containers
```

## ✅ Status de Implementação

### Plano 1: Fundamentos e MVP Core ✅ COMPLETO

- [x] Setup do ambiente (Monorepo, Docker, CI/CD)
- [x] Backend FastAPI com Clean Architecture
- [x] Modelos de banco (Users, Tenants, Memberships)
- [x] Autenticação JWT completa
- [x] Frontend React com React Router + TanStack Query
- [x] Telas de Login e Registro
- [x] Proteção de rotas
- [x] Integração Backend ↔ Frontend

### Próximos Passos (Plano 2)

- [ ] Cadastro e perfil de membros
- [ ] Pedidos de oração
- [ ] Registros de visitação
- [ ] Escalas de ministérios
- [ ] Calendário de eventos
- [ ] Geolocalização de igrejas

## 🏗️ Arquitetura

### Backend (Clean Architecture)

```
src/
├── api/           # Controllers (FastAPI routers)
├── application/   # Use Cases (orquestração)
├── domain/        # Entidades e regras de negócio
└── infra/         # Repositories e adapters
```

### Frontend (Feature-Based)

```
src/
├── components/    # Componentes reutilizáveis
├── hooks/         # React Query hooks
├── routes/        # Páginas
├── services/      # API clients (Axios)
└── lib/           # Utilitários
```

## 🔐 Autenticação

- **JWT** para autenticação stateless
- **Bcrypt** para hash de senhas
- **OAuth2 Password Flow** para login
- Suporte a **multi-tenancy** (usuário pode pertencer a múltiplas igrejas)

## 📚 Documentação

- [Arquitetura](./docs/architecture.md)
- [Módulos](./docs/modules.md)
- [Modelo de Dados](./docs/entity-relationship.md)
- [Glossário](./docs/glossary.md)
- [Guia de Contribuição](./docs/contributing.md)

## 🧪 Testes

```bash
# Backend
cd apps/backend
poetry run pytest

# Frontend
cd apps/web
npm test
```

## 📝 Commits

Seguimos **Conventional Commits**:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de manutenção

## 👥 Contribuindo

Veja [CONTRIBUTING.md](./docs/contributing.md) para detalhes sobre como contribuir.

## 📄 Licença

Este projeto está sob licença MIT.

---

**Desenvolvido com ❤️ para a comunidade reformada presbiteriana**

