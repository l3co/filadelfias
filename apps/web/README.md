# Filadelfias Web

Aplicação web para a plataforma Filadelfias, construída com **React**, **Vite** e **TailwindCSS**.

## 🚀 Setup Local

### Pré-requisitos

- Node.js 20+
- npm

### Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env
# Edite .env com a URL da API

# Iniciar servidor de desenvolvimento
npm run dev
# Acesse http://localhost:5173
```

---

## 📁 Estrutura do Projeto

```
web/
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ui/             # shadcn/ui components (Button, Dialog, etc)
│   │   └── layout/         # Header, Sidebar, Layout
│   ├── features/           # Módulos por feature
│   │   ├── auth/           # Login, Register
│   │   ├── members/        # Gestão de membros
│   │   ├── prayer/         # Pedidos de oração
│   │   ├── tithe/          # Dízimos
│   │   └── ...
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.ts      # Autenticação
│   │   ├── useMetadata.ts  # Enums da API
│   │   └── ...
│   ├── routes/             # Páginas (React Router)
│   │   ├── auth/           # /login, /register
│   │   ├── member/         # /member/*
│   │   ├── admin/          # /admin/*
│   │   └── public/         # /bible, /hymnal
│   ├── services/           # API clients (Axios)
│   │   ├── api.ts          # Axios instance
│   │   ├── auth.service.ts
│   │   ├── members.service.ts
│   │   └── ...
│   ├── types/              # TypeScript types
│   ├── lib/                # Utilitários
│   │   └── utils.ts        # cn(), formatDate(), etc
│   ├── constants/          # Constantes
│   ├── App.tsx             # Router e providers
│   └── main.tsx            # Entry point
├── e2e/                    # Testes E2E (Playwright + Cucumber)
│   ├── features/           # Arquivos .feature (Gherkin)
│   ├── steps/              # Step definitions
│   └── fixtures/           # Page Objects
├── public/                 # Assets estáticos
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 🎨 Stack Tecnológica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React** | 19 | Biblioteca UI |
| **TypeScript** | 5.9 | Tipagem estática |
| **Vite** | 7 | Build tool |
| **TailwindCSS** | 4 | Estilização utility-first |
| **shadcn/ui** | - | Componentes acessíveis (Radix) |
| **TanStack Query** | 5 | Server state management |
| **React Router** | 7 | Roteamento |
| **React Hook Form** | 7 | Formulários |
| **Zod** | 4 | Validação de schemas |
| **Axios** | 1.13 | HTTP client |
| **Playwright** | 1.52 | Testes E2E |
| **Vitest** | 3 | Testes unitários |

---

## 🔐 Autenticação

O app usa **JWT** armazenado no **localStorage**:

```typescript
// src/services/auth.service.ts
export const authService = {
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { username: email, password });
        localStorage.setItem('access_token', response.data.access_token);
        return response.data;
    },
    
    logout: () => {
        localStorage.removeItem('access_token');
    },
};
```

---

## 📡 Consumindo Dados da API

### Hook useMetadata

O app consome enums (ofícios, status, etc) da API via `useMetadata`:

```typescript
// src/hooks/useMetadata.ts
export function useOfficeOptions() {
    const { data } = useMetadata();
    return data?.enums.ecclesiastical_offices ?? [];
}

// Uso em componentes
const offices = useOfficeOptions();
// [{ value: 'PASTOR', label: 'Pastor' }, { value: 'PRESBITERO', label: 'Presbítero' }, ...]
```

### React Query

```typescript
// Exemplo de uso
const { data: members, isLoading } = useQuery({
    queryKey: ['members', tenantId],
    queryFn: () => membersService.getAll(tenantId),
    enabled: !!tenantId,
});
```

---

## 🧪 Testes

### Testes Unitários (Vitest)

```bash
# Rodar testes
npm test

# Modo watch
npm test -- --watch

# Com cobertura
npm test -- --coverage
```

### Testes E2E (Playwright + Cucumber)

O projeto usa **BDD** com Gherkin para testes E2E:

```gherkin
# e2e/features/login.feature
Feature: Login
  Scenario: Login com credenciais válidas
    Given estou na página de login
    When preencho o email "user@test.com"
    And preencho a senha "password123"
    And clico em "Entrar"
    Then devo ser redirecionado para a home
```

```bash
# Rodar todos os testes E2E
npm run test:e2e

# Modo interativo (UI)
npm run test:e2e:ui

# Apenas smoke público
npm run test:e2e:smoke

# Smoke público explícito
npm run test:e2e:smoke:public

# Smoke autenticado (requer backend/seeds)
npm run test:e2e:smoke:auth

# Smoke autenticado com backend seeded local
npm run test:e2e:smoke:auth:local

# Jornadas críticas
npm run test:e2e:critical

# Jornadas críticas com backend seeded local
npm run test:e2e:critical:local

Observação:
os comandos `*:local` usam o backend de teste em `http://127.0.0.1:8010` para não conflitar com backends locais já rodando em `:8000`.

# Ver relatório
npm run test:e2e:report
```

---

## 🎨 Componentes UI (shadcn/ui)

Usamos **shadcn/ui** para componentes acessíveis:

```tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogContent>
        <DialogHeader>Título</DialogHeader>
        <Input placeholder="Digite aqui..." />
        <Button onClick={handleSubmit}>Salvar</Button>
    </DialogContent>
</Dialog>
```

---

## 🧰 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint

# Testes unitários
npm test

# Testes E2E
npm run test:e2e

# E2E autenticado com backend de teste + seed automático
npm run test:e2e:smoke:auth:local
```

---

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_API_URL=http://localhost:8000
```

Para produção:

```env
VITE_API_URL=https://filadelfias-api-332378056596.southamerica-east1.run.app
```

---

## 🐳 Deploy

O frontend é deployado automaticamente via GitHub Actions para **Firebase Hosting**:

1. Push para `main` dispara o workflow
2. Build com Vite
3. Deploy para Firebase Hosting (CDN global)

### Deploy Manual

```bash
# Build
npm run build

# Deploy para Firebase
firebase deploy --only hosting
```

---

## 📱 Funcionalidades

### Área Pública
- Bíblia Online
- Hinário
- Manual IPB

### Área do Membro
- Dashboard
- Diretório de membros
- Pedidos de oração
- Dízimos e ofertas
- Eventos
- Missões
- EBD
- Devocionais

### Área Admin
- Gestão de membros
- Aprovação de dízimos
- Gestão financeira
- Configurações da igreja

---

## 📚 Documentação Relacionada

- [README Principal](../../README.md)
- [Arquitetura](../../docs/architecture.md)
- [Backend README](../backend/README.md)
- [Mobile README](../mobile/README.md)
