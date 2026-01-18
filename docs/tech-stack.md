# Stack Tecnológica — Filadelfias

Referência rápida de todas as tecnologias utilizadas no projeto.

---

## 🐍 Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Python** | 3.11+ | Linguagem principal |
| **FastAPI** | 0.110+ | Framework web assíncrono |
| **SQLAlchemy** | 2.0+ | ORM (modo async) |
| **Alembic** | 1.13+ | Migrações de banco |
| **PostgreSQL** | 15+ | Banco de dados relacional |
| **Pydantic** | 2.0+ | Validação e serialização |
| **Poetry** | 1.8+ | Gerenciamento de dependências |
| **Pytest** | 8.0+ | Framework de testes |
| **Uvicorn** | 0.27+ | Servidor ASGI |
| **asyncpg** | 0.29+ | Driver async para Postgres |
| **bcrypt** / **argon2** | - | Hash de senhas |
| **PyJWT** | 2.8+ | Tokens JWT |
| **aioboto3** | - | SDK AWS/S3 async |

---

## ⚛️ Frontend Web

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React** | 19+ | Biblioteca UI |
| **TypeScript** | 5.3+ | Tipagem estática |
| **Vite** | 5.0+ | Build tool |
| **TailwindCSS** | 3.4+ | Estilização utility-first |
| **shadcn/ui** | - | Componentes acessíveis (Radix) |
| **TanStack Query** | 5.0+ | Server state management |
| **React Router** | 7.0+ | Roteamento |
| **React Hook Form** | 7.0+ | Formulários |
| **Zod** | 3.22+ | Validação de schemas |
| **Axios** | 1.6+ | Cliente HTTP |
| **Vitest** | 1.0+ | Testes unitários |
| **Playwright** | 1.40+ | Testes E2E |

---

## 📱 Frontend Mobile

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React Native** | 0.73+ | Framework mobile |
| **Expo** | 50+ | Managed workflow |
| **Expo Router** | 3.0+ | File-based routing |
| **NativeWind** | 4.0+ | TailwindCSS para RN |
| **TanStack Query** | 5.0+ | Server state |
| **MMKV** | 2.11+ | Storage chave-valor |
| **expo-sqlite** | - | Banco local (Bíblia offline) |
| **expo-notifications** | - | Push notifications |
| **expo-secure-store** | - | Armazenamento seguro |

---

## 🔗 Contratos Compartilhados

| Tecnologia | Uso |
|------------|-----|
| **Zod** | Definição de schemas (source of truth) |
| **TypeScript** | Tipos gerados a partir do Zod |

---

## 🏗️ Infraestrutura

| Serviço | Provider | Uso |
|---------|----------|-----|
| **App Platform** | DigitalOcean | Deploy de containers |
| **Managed PostgreSQL** | DigitalOcean | Banco de dados |
| **Spaces (S3)** | DigitalOcean | Object storage |
| **GitHub Actions** | GitHub | CI/CD |
| **Docker** | - | Containerização local |

---

## 🛡️ Segurança

| Tecnologia | Uso |
|------------|-----|
| **JWT (RS256)** | Autenticação stateless |
| **bcrypt** | Hash de senhas |
| **CORS** | Cross-Origin Resource Sharing |
| **HTTPS** | TLS obrigatório em produção |
| **Rate Limiting** | Proteção contra abuse |

---

## 📊 Observabilidade (Futuro)

| Tecnologia | Uso |
|------------|-----|
| **Sentry** | Error tracking |
| **Prometheus + Grafana** | Métricas |
| **Loki** | Logs centralizados |
