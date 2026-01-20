# Plano 1: Fundamentos e MVP Core

**Objetivo**: Estabelecer a base técnica (Monorepo), Infraestrutura core (Auth, Multi-tenancy) e entregar valor imediato com funcionalidades de conteúdo (Bíblia, Boletins).

---

## 1. Setup do Ambiente (Semana 1)

### 1.1. Monorepo & Tooling
- [ ] Inicializar repositório com `pnpm workspaces` ou `turborepo`.
- [ ] Configurar `ESLint`, `Prettier` e `EditorConfig` na raiz.
- [ ] Criar estrutura de pastas: `apps/backend`, `apps/web`, `apps/mobile`, `packages/contracts`.

### 1.2. Backend (FastAPI)
- [ ] Inicializar projeto FastAPI com Poetry.
- [ ] Configurar Docker e Docker Compose para desenvolvimento (API + Postgres).
- [ ] Configurar **Alembic** para migrações.
- [ ] Implementar estrutura base DDD (`domain`, `infra`, `api`).
- [ ] Health Check endpoint (`/health`).
- [ ] **Nota**: Utilizar sempre `async def` e drivers assíncronos.

### 1.3. Frontend (Web & Mobile)
- [ ] **Web**: Inicializar Vite + React + TS.
    - [ ] Configurar TailwindCSS e Shadcn/ui.
    - [ ] Configurar React Router e TanStack Query.
- [ ] **Mobile**: Inicializar Expo (Managed Workflow).
    - [ ] Configurar NativeWind.
    - [ ] Configurar navegação base (Tabs).

---

## 2. Core Domain: Identidade e Acesso (Semana 2)

### 2.1. Modelagem (Zod & SQLAlchemy)
- [ ] Definir schemas em `packages/contracts`:
    - `Tenant` (Igreja): id, nome, slug, logo, endereco, config (json).
    - `User`: id, email, password_hash, nome, role (ADMIN, PASTOR, MEMBER), tenant_id.
- [ ] Criar modelos SQLAlchemy correspondentes.

### 2.2. Autenticação & Autorização
- [ ] Implementar fluxo de Login (JWT).
- [ ] Middleware de verificação de Token.
- [ ] **Middleware de Tenant**:
    - Identificar a igreja pelo subdomínio (ex: `ipbrio.filadelfias.app`) ou header `X-Tenant-ID`.
    - Injetar o contexto da igreja na request.

### 2.3. Cadastro de Igrejas (Onboarding)
- [ ] Endpoint para criar nova organização (Super Admin apenas inicialmente ou Self-service).
- [ ] Endpoint para convidar membros (envio de link/token).

### 2.4. Sistema de Permissões (RBAC) e Modelo Multi-Igreja
O sistema utiliza **Role-Based Access Control** com suporte a:
*   **Usuário Global**: O usuário existe na plataforma independente de qualquer igreja.
*   **Múltiplas Associações**: Um usuário pode estar vinculado a várias igrejas com roles diferentes em cada uma.
*   **Usuário Órfão**: Usuário cadastrado que ainda não está associado a nenhuma igreja.

#### 2.4.1. Fluxo de Onboarding do Usuário
1.  Usuário baixa o app (Google Play / App Store) ou acessa a web.
2.  Cria conta (email/senha ou OAuth).
3.  **Estado Inicial**: Usuário "órfão" (sem igreja).
4.  **Acesso Imediato**: Bíblia, Hinário, Mapa de Igrejas.
5.  **Associação**:
    *   O usuário pode solicitar vínculo a uma igreja (via código de convite ou busca).
    *   Um Admin da igreja pode buscar o usuário por email e associá-lo.

#### 2.4.2. Lista de Roles (Hierarquia)
| Role | Descrição | Escopo | Herda de |
|------|-----------|--------|----------|
| `PLATFORM_USER` | Usuário logado na plataforma (órfão ou não) | Global | - |
| `ATTENDEE` | Frequentador de uma igreja específica | Por Igreja | PLATFORM_USER |
| `MEMBER` | Membro comungante ativo | Por Igreja | ATTENDEE |
| `EBD_STUDENT` | Aluno da Escola Dominical | Por Igreja | MEMBER |
| `EBD_TEACHER` | Professor da EBD | Por Igreja | MEMBER |
| `CHOIR_MEMBER` | Membro do Coral | Por Igreja | MEMBER |
| `CHOIR_LEADER` | Líder/Regente do Coral | Por Igreja | CHOIR_MEMBER |
| `MINISTRY_LEADER` | Líder de Ministério | Por Igreja | MEMBER |
| `DEACON` | Diácono | Por Igreja | MEMBER |
| `ELDER` | Presbítero | Por Igreja | MEMBER |
| `PASTOR` | Pastor | Por Igreja | ELDER |
| `TREASURER` | Tesoureiro | Por Igreja | MEMBER |
| `CHURCH_ADMIN` | Administrador da Igreja | Por Igreja | ELDER |
| `SUPER_ADMIN` | Administrador da Plataforma | Global | - |

#### 2.4.3. Matriz de Permissões (Recurso x Ação x Role)
| Recurso | Ação | ÓRFÃO | ATTENDEE | MEMBER | DEACON | ELDER | PASTOR | ADMIN |
|---------|------|-------|----------|--------|--------|-------|--------|-------|
| Bíblia | Ler | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hinário | Ler | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mapa Igrejas | Visualizar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Boletins | Ler (Públicos) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Boletins | Criar/Editar | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Diretório Membros | Visualizar | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pedidos Oração | Criar | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pedidos Oração | Ver Privados | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Escalas | Ver Próprias | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Escalas | Gerenciar | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Votações | Votar (Presencial) | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Tesouraria | Ver Relatórios | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Tesouraria | Lançamentos | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | (TREASURER) |
| Atas | Visualizar | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Disciplina | Acessar | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Usuários Órfãos | Buscar/Associar | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

#### 2.4.4. Modelagem de Banco
```sql
-- Usuário Global (existe na plataforma, independente de igreja)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Igrejas (Tenants)
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- ex: 'ipb-rio'
    logo_url TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_public BOOLEAN DEFAULT TRUE, -- Aparece no mapa público?
    created_at TIMESTAMP DEFAULT NOW()
);

-- Associação User <-> Igreja (N:N com role)
CREATE TABLE user_church_memberships (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'ATTENDEE',
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, PENDING
    joined_at TIMESTAMP DEFAULT NOW(),
    invited_by UUID REFERENCES users(id),
    UNIQUE(user_id, tenant_id)
);

-- Histórico de Frequência (Check-ins em cultos/eventos)
CREATE TABLE attendance_log (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    tenant_id UUID REFERENCES tenants(id),
    event_id UUID REFERENCES events(id), -- Opcional, pode ser NULL para "culto regular"
    checked_in_at TIMESTAMP DEFAULT NOW(),
    method VARCHAR(20) -- 'QR_CODE', 'MANUAL', 'GEO'
);

-- Roles e Permissões (tabelas de suporte)
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    parent_role_id UUID REFERENCES roles(id)
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    UNIQUE(resource, action)
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id),
    permission_id UUID REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);
```

#### 2.4.5. Funcionalidades de Admin
- [ ] **Busca de Usuários Órfãos**: Endpoint `GET /admin/users/search?email=...` (apenas CHURCH_ADMIN).
- [ ] **Associar Usuário à Igreja**: Endpoint `POST /admin/users/{user_id}/associate` com payload `{ role: 'MEMBER' }`.
- [ ] **Histórico de Frequência**: Dashboard mostrando frequentadores por culto/data.

#### 2.4.6. Implementação Backend
- [ ] **Dependency Injection**: Criar `get_current_user_permissions(tenant_id)` como dependência FastAPI.
- [ ] **Decorator/Guard**: `@require_permission("bulletins:create")` para proteger endpoints.
- [ ] **Context Multi-Igreja**: Usuário pode trocar de "igreja ativa" no app (similar a trocar de workspace no Slack).

---

## 3. Funcionalidades MVP (Semana 3)

### 3.1. Bíblia e Conteúdo
Sendo um app cristão, o acesso à Palavra é central.
- [ ] **Estratégia Híbrida de Conteúdo**:
    - [ ] **Versão Offline (ARC 1969)**:
        - Utilizar a **Almeida Revista e Corrigida (1969)** como versão padrão e offline, pois está em domínio público.
        - **Seed Database**: Criar script para popular o banco local com a ARC completa (JSON/SQL).
        - **Download**: Permitir que o usuário baixe essa versão para uso offline na igreja.
    - [ ] **Versões Online (API Externa)**:
        - Para outras traduções (NVI, NAA, etc.), integrar com a API **[A Bíblia Digital](https://www.abibliadigital.com.br/)**.
        - **Restrição**: Não permitir download dessas versões para evitar violação de copyright. Apenas leitura online (streaming de texto).

- [ ] **Backend**:
    - [ ] Script de Seed (`seeds/bible_arc.py`) para popular tabela `bible_verses` com a ARC.
    - [ ] Proxy/Wrapper para chamar `abibliadigital` quando o usuário selecionar outra versão.
- [ ] **Frontend (Web/Mobile)**:
    - [ ] Leitor da Bíblia com tipografia excelente e modo noturno.
    - [ ] **Modo Offline**: Download da Bíblia completa (SQLite ou JSON compactado) para leitura sem internet na igreja.
    - [ ] **Modo Visitante**: Acesso à Bíblia e Hinário sem necessidade de login.
    - [ ] Navegação rápida entre livros.

### 3.2. Boletins e Mural
- [ ] **Backend**:
    - [ ] CRUD `Bulletin`: titulo, conteudo (markdown/html), data_publicacao, autor_id.
    - [ ] Integração S3 (DigitalOcean Spaces) para upload de anexos/imagens.
- [ ] **Frontend**:
    - [ ] Feed de notícias/avisos na Home.
    - [ ] Visualização de detalhes.

---

## 4. Deploy Inicial (Fim da Fase 1)
- [ ] Configurar App Platform ou Droplet na DigitalOcean.
- [ ] CI/CD (GitHub Actions) básico:
    - [ ] Build e Test.
    - [ ] Deploy automático em `main` ou via tag.
- [ ] Disponibilizar URL de staging.

## 5. Estratégia de Qualidade (QA)
- [ ] Configurar **Vitest** + **React Testing Library** no Web.
- [ ] Configurar **React Native Testing Library** no Mobile.
- [ ] Configurar **Pytest** no Backend (com fixtures assíncronas).
- [ ] Configurar framework BDD (ex: Cucumber/Playwright) para testes E2E críticos.
    - [ ] Escrita do primeiro cenário: *Login com sucesso*.
    - [ ] Escrita do cenário: *Visualização da Bíblia (offline)*.
