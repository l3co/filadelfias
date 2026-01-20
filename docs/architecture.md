# Arquitetura do Sistema — Filadelfias

## 📋 Visão Geral
O **Filadelfias** é uma plataforma multi-tenant para gestão eclesiástica, composta por:
- **Backend API** (Python/FastAPI)
- **Aplicação Web** (React/Vite)
- **Aplicação Mobile** (React Native/Expo)
- **Contratos Compartilhados** (Zod/TypeScript)

---

## 🏗️ Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTES                                        │
├─────────────────┬─────────────────┬─────────────────────────────────────────┤
│   Web (React)   │  Mobile (Expo)  │         Painel Admin (Web)              │
└────────┬────────┴────────┬────────┴────────────────┬────────────────────────┘
         │                 │                         │
         │                 │ HTTPS/JSON              │
         ▼                 ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY / LOAD BALANCER                          │
│                           (Google Cloud Run)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (FastAPI)                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   API       │  │ Application │  │   Domain    │  │   Infra     │         │
│  │ Controllers │──│  Use Cases  │──│  Entities   │──│ Repositories│         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
         │                    │                              │
         ▼                    ▼                              ▼
┌─────────────────┐  ┌─────────────────┐          ┌─────────────────┐
│    Firestore    │  │  Redis (Cache)  │          │  Cloud Storage  │
│   (NoSQL DB)    │  │   (Opcional)    │          │  (Firebase)     │
└─────────────────┘  └─────────────────┘          └─────────────────┘
```

---

## 🎯 Princípios Arquiteturais

### 1. Clean Architecture
O backend segue a Clean Architecture (Ports & Adapters):
- **Domain**: Entidades, Value Objects e regras de negócio puras.
- **Application**: Use Cases que orquestram a lógica.
- **Infrastructure**: Implementações concretas (DB, S3, APIs externas).
- **API**: Controllers HTTP (FastAPI routers).

```mermaid
graph TD
    subgraph "Camada Externa"
        API[HTTP Controllers]
        DB[SQLAlchemy Repos]
        S3[Storage Adapter]
    end
    
    subgraph "Camada de Aplicação"
        UC[Use Cases]
    end
    
    subgraph "Camada de Domínio"
        E[Entities]
        VO[Value Objects]
        R[Repository Interfaces]
    end
    
    API --> UC
    UC --> E
    UC --> R
    DB -.-> R
    S3 -.-> R
```

### 2. Multi-Tenancy
- **Isolamento Lógico**: Todas as queries filtram por `tenant_id`.
- **Identificação**: Via subdomínio (`igreja.filadelfias.app`) ou header `X-Tenant-ID`.
- **Usuário Global**: O usuário existe independente de tenants.

### 3. Async First
- Todos os endpoints são `async def`.
- Drivers assíncronos: `google-cloud-firestore`, `aiohttp`.

---

## 📂 Estrutura de Diretórios

```
filadelfias/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── api/           # Routers FastAPI
│   │   │   ├── application/   # Use Cases
│   │   │   ├── domain/        # Entities, Value Objects
│   │   │   ├── infra/         # Repositories, External Services
│   │   │   └── main.py        # Entrypoint
│   │   ├── tests/
│   │   ├── alembic/           # Migrações
│   │   └── pyproject.toml
│   │
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/    # Componentes UI
│   │   │   ├── features/      # Módulos por feature
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── lib/           # Utilitários
│   │   │   └── routes/        # Páginas (React Router)
│   │   ├── public/
│   │   └── package.json
│   │
│   └── mobile/
│       ├── app/               # Expo Router (file-based)
│       ├── components/
│       └── package.json
│
├── packages/
│   └── contracts/             # Zod schemas compartilhados
│
├── docs/                      # Documentação técnica
├── plan/                      # Planejamento de fases
├── templates/                 # Referências visuais
└── docker-compose.yml
```

---

## 🔐 Segurança

### Autenticação
- **JWT** (Access Token + Refresh Token).
- Tokens assinados com RS256 (chave privada no servidor).
- Refresh token armazenado em `httpOnly cookie` (Web) ou Secure Storage (Mobile).

### Autorização (RBAC)
- Roles definidas por tenant (`user_church_memberships`).
- Permissões verificadas via decorator `@require_permission("resource:action")`.

### Dados Sensíveis
- Senhas: `bcrypt` ou `argon2`.
- Dados financeiros: Logs de auditoria imutáveis.
- Dados disciplinares: Apenas Pastor, sem detalhes no banco cloud.

---

## 🌐 Infraestrutura (Firebase / Google Cloud)

> **Nota sobre migração**: Em Janeiro/2026, migramos de DigitalOcean para Firebase/Google Cloud
> por questões de **custo** e **simplicidade de configuração**. A plataforma tem atendido bem
> às necessidades do projeto.

| Componente | Serviço | Configuração |
|------------|---------|--------------|
| Backend API | Cloud Run | Container Python (auto-scaling) |
| Web | Firebase Hosting | Static Site (CDN global) |
| Database | Firestore | NoSQL document database |
| Storage | Cloud Storage | Bucket Firebase |
| Auth | Firebase Admin SDK | JWT próprio |
| CI/CD | GitHub Actions | Build → Test → Deploy |

---

## 📡 Comunicação

### APIs Externas Consumidas
| API | Uso | Autenticação |
|-----|-----|--------------|
| A Bíblia Digital | Versões online da Bíblia | API Key |
| Firebase/GCP | Firestore, Storage | Service Account |

### Notificações
- **Push**: Expo Push Notifications (Mobile), Web Push API.
- **Email**: SMTP simples ou Resend/Mailgun.
