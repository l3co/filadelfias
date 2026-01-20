# Filadélfias — Guia para AI Assistants

> Este arquivo serve como referência rápida para assistentes de IA (Gemini, Claude, etc.) entenderem a estrutura e contexto do projeto.

---

## 🎯 Sobre o Projeto

**Filadélfias** é uma plataforma multi-tenant para igrejas presbiterianas, focada em fortalecer a comunhão e organização eclesiástica.

- **Nome**: Filadélfias (referência à igreja de Filadélfia em Apocalipse 3:7-13)
- **Público-alvo**: Igrejas Presbiterianas do Brasil (IPB)
- **Propósito**: Ferramentas para comunhão e organização da igreja

---

## 🏗️ Arquitetura Geral

```
filadelfias/
├── apps/
│   ├── backend/          # API Python/FastAPI
│   ├── web/              # Frontend React/Vite
│   └── mobile/           # App React Native/Expo (futuro)
├── packages/
│   └── contracts/        # Schemas Zod compartilhados
├── docs/                 # Documentação técnica
├── plans/                # Planejamentos de features
└── docker-compose.yml    # Ambiente de desenvolvimento
```

---

## 🔥 Infraestrutura (Firebase/GCP)

> **Migração (Jan/2026)**: O projeto foi migrado de DigitalOcean para Firebase/GCP por custo e simplicidade.

| Serviço | Tecnologia | URL/Config |
|---------|------------|------------|
| **Frontend** | Firebase Hosting | https://filadelfias-6a116.web.app |
| **Backend** | Cloud Run | https://filadelfias-api-332378056596.southamerica-east1.run.app |
| **Database** | Firestore | NoSQL document database |
| **Storage** | Cloud Storage | Arquivos e imagens |
| **Project ID** | - | `filadelfias-6a116` |
| **Region** | - | `southamerica-east1` |

### Firestore - Estrutura de Coleções

```
firestore/
├── users/                    # Usuários globais (não pertencem a tenant)
│   └── {user_id}
│       ├── email
│       ├── name
│       ├── password_hash
│       ├── is_active
│       └── created_at
│
├── tenants/                  # Igrejas (cada igreja é um tenant)
│   └── {tenant_id}
│       ├── name
│       ├── slug              # Identificador único (ex: "ipb-centro")
│       ├── street, city, state, postal_code
│       └── created_at
│
├── user_memberships/         # Vínculo usuário <-> igreja
│   └── {membership_id}
│       ├── user_id
│       ├── tenant_id
│       ├── role              # ADMIN, LEADER, MEMBER, ATTENDEE
│       ├── status            # ACTIVE, INACTIVE
│       └── joined_at
│
└── tenants/{tenant_id}/      # Subcoleções por tenant (isolamento)
    ├── members/              # Membros da igreja
    ├── transactions/         # Transações financeiras
    ├── ebd_classes/          # Classes da EBD
    ├── ebd_attendance/       # Presença na EBD
    ├── councils/             # Conselhos (presbitério, diaconia)
    ├── meetings/             # Reuniões
    └── missionaries/         # Missionários apoiados
```

### Padrão de Isolamento Multi-Tenant

- Dados **globais**: `users`, `tenants`, `user_memberships`
- Dados **por igreja**: Subcoleções dentro de `tenants/{tenant_id}/`
- Toda query deve filtrar por `tenant_id` quando aplicável

---

## 🐍 Backend (Python/FastAPI)

### Localização: `apps/backend/`

```
apps/backend/
├── src/
│   ├── api/                  # Routers FastAPI
│   │   ├── auth.py           # /auth/* (login, register, me)
│   │   ├── members.py        # /members/*
│   │   ├── tenants.py        # /tenants/*
│   │   ├── churches.py       # /churches/register (wizard)
│   │   ├── financial.py      # Tesouraria
│   │   ├── governance.py     # Governança
│   │   ├── ebd.py            # Escola Bíblica Dominical
│   │   ├── missions.py       # Missões
│   │   ├── bible.py          # API da Bíblia
│   │   ├── hymnal.py         # Hinário
│   │   └── manual.py         # Manual Presbiteriano
│   │
│   ├── domain/
│   │   ├── schemas.py        # Pydantic models
│   │   └── enums.py          # Enums do domínio
│   │
│   ├── infra/
│   │   ├── firebase.py       # Inicialização Firebase Admin
│   │   ├── firestore_repository.py  # Base class para repos
│   │   ├── security.py       # JWT, hash de senhas
│   │   └── repositories/     # Repositórios Firestore
│   │       ├── user_repository.py
│   │       ├── tenant_repository.py
│   │       ├── member_repository.py
│   │       ├── membership_repository.py
│   │       └── ...
│   │
│   ├── services/
│   │   ├── logging_service.py    # Logs estruturados JSON
│   │   └── deletion_service.py   # LGPD - exclusão de dados
│   │
│   ├── middleware/
│   │   └── logging_middleware.py # Request tracking
│   │
│   ├── config.py             # Settings (env vars)
│   └── main.py               # Entrypoint FastAPI
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── pyproject.toml            # Dependências (Poetry)
└── Dockerfile
```

### Endpoints Principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Login com email/senha |
| POST | `/auth/register` | Registro de usuário órfão |
| GET | `/auth/me` | Perfil do usuário + memberships |
| DELETE | `/auth/me` | Excluir conta (LGPD) |
| POST | `/churches/register` | Wizard de cadastro de igreja |
| GET | `/tenants` | Listar tenants do usuário |
| DELETE | `/tenants/{id}` | Excluir igreja (LGPD) |
| GET | `/members` | Listar membros |
| GET | `/bible/books` | Listar livros da Bíblia |
| GET | `/bible/{book}/{chapter}` | Texto de um capítulo |

### Autenticação

- **JWT** com `HS256`
- Token no header: `Authorization: Bearer <token>`
- Payload: `{ sub: user_id, email: string }`
- Dependência: `get_current_user` em `src/api/auth.py`

---

## ⚛️ Frontend Web (React/Vite)

### Localização: `apps/web/`

```
apps/web/
├── src/
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # DashboardLayout, PublicLayout
│   │   └── ProtectedRoute.tsx
│   │
│   ├── routes/               # Páginas
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ChurchRegistrationWizard.tsx
│   │   ├── HomePage.tsx      # Dashboard
│   │   ├── LandingPage.tsx   # Página pública
│   │   ├── auth/
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   ├── members/
│   │   ├── bible/
│   │   ├── hymnal/
│   │   ├── manual/
│   │   ├── governance/
│   │   ├── financial/
│   │   ├── ebd/
│   │   ├── missions/
│   │   └── settings/
│   │
│   ├── hooks/
│   │   ├── useAuth.ts        # useCurrentUser, useLogin, useLogout
│   │   └── useViaCEP.ts      # Busca de endereço
│   │
│   ├── lib/
│   │   ├── api.ts            # Axios instance
│   │   └── utils.ts          # cn() helper
│   │
│   ├── features/             # Componentes por feature
│   │   ├── members/
│   │   ├── governance/
│   │   └── ...
│   │
│   ├── App.tsx               # Rotas principais
│   └── main.tsx              # Entrypoint
│
├── e2e/                      # Testes E2E (Playwright)
├── public/
│   └── manifest.json         # PWA config
├── index.html
├── vite.config.ts
└── package.json
```

### Rotas da Aplicação

| Rota | Componente | Acesso |
|------|------------|--------|
| `/` | LandingPage | Público |
| `/login` | LoginPage | Público |
| `/register` | ChurchRegistrationWizard | Público |
| `/forgot-password` | ForgotPasswordPage | Público |
| `/bible` | BiblePage | Público |
| `/hymnal` | HymnalPage | Público |
| `/manual` | ManualPage | Público |
| `/app` | HomePage (Dashboard) | **Protegido** |
| `/app/members` | MembersPage | **Protegido** |
| `/app/governance` | CouncilsPage | **Protegido** |
| `/app/financial` | TreasuryPage | **Protegido** |
| `/app/ebd` | EBDClassesPage | **Protegido** |
| `/app/missions` | MissionsPage | **Protegido** |
| `/app/settings` | ChurchSettingsPage | **Protegido** |

### Stack Frontend

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **TailwindCSS** + **shadcn/ui** (estilização)
- **TanStack Query** (server state)
- **React Router 7** (roteamento)
- **React Hook Form** + **Zod** (formulários)
- **Axios** (HTTP client)

---

## 🧪 Testes

### Backend
```bash
cd apps/backend
poetry run pytest
```

### Frontend
```bash
cd apps/web
npm run test          # Vitest (unit)
npm run test:e2e      # Playwright (E2E)
```

### Testes E2E
- Planejamento em `plans/e2e-testing-plan.md`
- Stack: Cucumber + Gherkin + Playwright
- Cenários escritos em português

---

## 🐳 Desenvolvimento Local

### Pré-requisitos
- Docker e Docker Compose
- Node.js 20+
- Python 3.11+

### Iniciar ambiente
```bash
docker compose up -d
```

### URLs locais
| Serviço | URL |
|---------|-----|
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Web | http://localhost:5173 |
| Firestore Emulator | localhost:8080 |

### Variáveis de ambiente importantes
- `FIRESTORE_EMULATOR_HOST` - Aponta para emulator local
- `SECRET_KEY` - Chave JWT
- `CORS_ORIGINS_STR` - Origens permitidas

---

## 📚 Documentação Adicional

| Arquivo | Conteúdo |
|---------|----------|
| `docs/architecture.md` | Arquitetura detalhada |
| `docs/tech-stack.md` | Stack tecnológica |
| `docs/modules.md` | Descrição dos módulos |
| `docs/entity-relationship.md` | Modelo de dados |
| `docs/glossary.md` | Termos do domínio eclesiástico |
| `docs/ENVIRONMENT_VARIABLES.md` | Variáveis de ambiente |
| `plans/e2e-testing-plan.md` | Plano de testes E2E |

---

## 🎨 Convenções

### Commits
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: manutenção
```

### Código Python
- Formatação: `ruff format`
- Linting: `ruff check`
- Imports ordenados automaticamente

### Código TypeScript
- ESLint + Prettier
- Componentes em PascalCase
- Hooks começam com `use`

---

## ⚠️ Pontos de Atenção

1. **Multi-tenancy**: Sempre filtrar por `tenant_id` em queries
2. **LGPD**: Endpoints de exclusão em `/auth/me` e `/tenants/{id}`
3. **Autenticação**: JWT próprio (não usa Firebase Auth)
4. **Firestore**: Banco NoSQL - evitar joins complexos
5. **Logs**: Usar `log_info`, `log_error` do `logging_service.py`

---

## 🔗 Links Úteis

- **Produção**: https://filadelfias-6a116.web.app
- **API Docs**: https://filadelfias-api-332378056596.southamerica-east1.run.app/docs
- **Firebase Console**: https://console.firebase.google.com/project/filadelfias-6a116
- **GitHub Actions**: https://github.com/l3co/filadelfias/actions
