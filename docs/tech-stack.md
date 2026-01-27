# Stack Tecnológica — Filadelfias

Referência rápida de todas as tecnologias utilizadas no projeto.

> **Última atualização:** Janeiro/2026

---

## 🐍 Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Python** | 3.11+ | Linguagem principal |
| **FastAPI** | 0.128+ | Framework web assíncrono |
| **Firestore** | - | Banco de dados NoSQL (Firebase) |
| **firebase-admin** | 7.1+ | SDK Firebase Admin |
| **Pydantic** | 2.12+ | Validação e serialização |
| **Pydantic Settings** | 2.12+ | Configurações via env |
| **Poetry** | 1.8+ | Gerenciamento de dependências |
| **Pytest** | 9.0+ | Framework de testes |
| **Uvicorn** | 0.40+ | Servidor ASGI |
| **bcrypt** | 4.0.1 | Hash de senhas |
| **python-jose** | 3.5+ | Tokens JWT |
| **httpx** | 0.28+ | Cliente HTTP assíncrono |
| **Ruff** | 0.14+ | Linter rápido |
| **Black** | 26+ | Formatador de código |

---

## ⚛️ Frontend Web

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React** | 19.2 | Biblioteca UI |
| **TypeScript** | 5.9 | Tipagem estática |
| **Vite** | 7.2 | Build tool |
| **TailwindCSS** | 4.1 | Estilização utility-first |
| **shadcn/ui** | - | Componentes acessíveis (Radix) |
| **TanStack Query** | 5.90+ | Server state management |
| **React Router** | 7.12 | Roteamento |
| **React Hook Form** | 7.71 | Formulários |
| **Zod** | 4.3 | Validação de schemas |
| **Axios** | 1.13 | Cliente HTTP |
| **Lucide React** | 0.562 | Ícones |
| **date-fns** | 4.1 | Manipulação de datas |
| **Sonner** | 2.0 | Toast notifications |
| **Vitest** | 3.2 | Testes unitários |
| **Playwright** | 1.52 | Testes E2E |
| **playwright-bdd** | 8.4 | BDD com Cucumber |

---

## 📱 Frontend Mobile

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React Native** | 0.81.5 | Framework mobile |
| **Expo** | 54 | Managed workflow |
| **Expo Router** | 6.0 | File-based routing |
| **NativeWind** | 4.2 | TailwindCSS para RN |
| **TailwindCSS** | 3.4 | Estilos (via NativeWind) |
| **TanStack Query** | 5.90+ | Server state |
| **Zustand** | 5.0 | Client state management |
| **Axios** | 1.13 | Cliente HTTP |
| **Lucide React Native** | 0.563 | Ícones |
| **expo-sqlite** | 16.0 | Banco local (offline) |
| **expo-secure-store** | 15.0 | Armazenamento seguro |
| **expo-speech** | 14.0 | Text-to-Speech |
| **expo-haptics** | 15.0 | Feedback tátil |
| **expo-linear-gradient** | 15.0 | Gradientes |
| **date-fns** | 4.1 | Manipulação de datas |
| **React Hook Form** | 7.71 | Formulários |
| **Zod** | 4.3 | Validação |

---

## 🔗 Contratos Compartilhados

| Tecnologia | Uso |
|------------|-----|
| **Zod** | Definição de schemas |
| **TypeScript** | Tipos compartilhados |

---

## 🏗️ Infraestrutura

> **Nota:** Em Janeiro/2026, migramos de DigitalOcean para Firebase/GCP por custo e simplicidade.

| Serviço | Provider | Uso |
|---------|----------|-----|
| **Cloud Run** | Google Cloud | Deploy de containers (auto-scaling) |
| **Firestore** | Firebase | Banco de dados NoSQL |
| **Cloud Storage** | Firebase | Object storage (arquivos) |
| **Firebase Hosting** | Firebase | Hospedagem do frontend (CDN global) |
| **GitHub Actions** | GitHub | CI/CD pipelines |
| **Docker** | - | Containerização |
| **Firestore Emulator** | Firebase | Desenvolvimento local |

---

## 🛡️ Segurança

| Tecnologia | Uso |
|------------|-----|
| **JWT (HS256)** | Autenticação stateless |
| **bcrypt** | Hash de senhas |
| **CORS** | Cross-Origin Resource Sharing |
| **HTTPS** | TLS obrigatório em produção |
| **slowapi** | Rate limiting |
| **Secure Store** | Armazenamento seguro (mobile) |

---

## 🔌 APIs Externas

| API | Uso |
|-----|-----|
| **A Bíblia Digital** | Versões da Bíblia (NVI, NAA, etc) |
| **Firebase Admin** | Firestore, Storage |

---

## 📊 Observabilidade (Planejado)

| Tecnologia | Uso |
|------------|-----|
| **Sentry** | Error tracking |
| **Cloud Logging** | Logs centralizados (GCP) |

---

## 📦 Gerenciadores de Pacotes

| Projeto | Gerenciador |
|---------|-------------|
| Backend | Poetry |
| Web | npm |
| Mobile | npm |
