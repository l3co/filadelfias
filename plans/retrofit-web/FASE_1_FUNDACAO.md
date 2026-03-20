# Fase 1: Fundação - Context Global e Infraestrutura

> **Duração:** 3-4 semanas  
> **Prioridade:** 🔴 Crítica  
> **Dependências:** Nenhuma  

---

## 🎯 Objetivos

1. Implementar Context de Autenticação global
2. Eliminar chamadas duplicadas de `useCurrentUser()`
3. Criar sistema de rotas tipadas
4. Estabelecer base de testes robusta
5. Adicionar regras ESLint de performance e a11y

---

## 📋 Tarefas Detalhadas

### 1.1 Context de Autenticação Global

**Problema Atual:**
```tsx
// ❌ Problema: useCurrentUser() chamado em 15+ componentes
// apps/web/src/components/layout/DashboardLayout.tsx
const { data: user } = useCurrentUser();

// apps/web/src/routes/HomePage.tsx
const { data: user } = useCurrentUser();

// apps/web/src/routes/members/MembersPage.tsx
const { data: user } = useCurrentUser();

// ... e mais 12 componentes
```

**Impacto:** 
- Re-renders desnecessários
- Requests duplicadas ao backend
- Props drilling
- Difícil gerenciar estado de auth

**Solução:**

#### 1.1.1 Criar AuthContext

```tsx
// apps/web/src/contexts/AuthContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { useCurrentUser } from '../hooks/useAuth';
import type { User, Tenant, Membership } from '../types';

interface AuthContextValue {
  user: User | null;
  tenant: Tenant | null;
  membership: Membership | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (resource: string, action: string) => boolean;
  isTenantAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  
  const tenant = user?.memberships?.[0]?.tenant ?? null;
  const membership = user?.memberships?.[0] ?? null;
  const isAuthenticated = !!user;
  const isTenantAdmin = membership?.role === 'ADMIN';

  const hasPermission = (resource: string, action: string): boolean => {
    if (!membership) return false;
    // Implementar lógica de permissões
    return true; // Placeholder
  };

  const value: AuthContextValue = {
    user,
    tenant,
    membership,
    isLoading,
    isAuthenticated,
    hasPermission,
    isTenantAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Hooks especializados
export function useAuthUser() {
  return useAuth().user;
}

export function useAuthTenant() {
  return useAuth().tenant;
}

export function useAuthMembership() {
  return useAuth().membership;
}

export function useHasPermission() {
  return useAuth().hasPermission;
}
```

#### 1.1.2 Integrar no App

```tsx
// apps/web/src/main.tsx
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>  {/* ✅ Adicionar aqui */}
          <App />
        </AuthProvider>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
);
```

#### 1.1.3 Refatorar Componentes

```tsx
// ✅ Antes
import { useCurrentUser, useCurrentTenant } from '../hooks/useAuth';

function DashboardLayout() {
  const { data: user } = useCurrentUser();
  const tenant = useCurrentTenant();
  // ...
}

// ✅ Depois
import { useAuth } from '../contexts/AuthContext';

function DashboardLayout() {
  const { user, tenant } = useAuth();
  // ...
}
```

**Arquivos a Modificar:**
- `src/components/layout/DashboardLayout.tsx`
- `src/components/layout/MemberLayout.tsx`
- `src/routes/HomePage.tsx`
- `src/routes/members/MembersPage.tsx`
- `src/routes/profile/ProfilePage.tsx`
- E mais ~10 arquivos

**Critérios de Aceitação:**
- [ ] AuthContext implementado e testado
- [ ] AuthProvider integrado no main.tsx
- [ ] Todos os componentes migrados para useAuth()
- [ ] Testes unitários do context com 100% coverage
- [ ] Performance melhorada (menos re-renders)

---

### 1.2 Sistema de Rotas Tipadas

**Problema Atual:**
```tsx
// ❌ URLs hardcoded, sem type-safety
<Link to="/app/members">Membros</Link>
<Link to="/admin/treasury">Tesouraria</Link>
navigate('/app/events');
```

**Solução:**

#### 1.2.1 Criar Route Constants

```typescript
// apps/web/src/lib/routes.ts
export const ROUTES = {
  // Public
  HOME: '/',
  BIBLE: '/bible',
  BIBLE_READER: (book: string, chapter: number) => `/bible/${book}/${chapter}`,
  HYMNAL: '/hymnal',
  HYMNAL_READER: (number: number) => `/hymnal/${number}`,
  MANUAL: '/manual',
  TERMS: '/terms',
  PRIVACY: '/privacy',

  // Auth
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  REGISTER: '/register',
  ONBOARDING: '/onboarding',

  // Admin
  ADMIN: {
    ROOT: '/admin',
    MEMBERS: '/admin/members',
    GOVERNANCE: '/admin/governance',
    TREASURY: '/admin/treasury',
    MISSIONS: '/admin/missions',
    EDUCATION: '/admin/education',
    EDUCATION_CLASS: (classId: string) => `/admin/education/${classId}`,
    EVENTS: '/admin/events',
    DEVOTIONALS: '/admin/devotionals',
    SETTINGS: '/admin/settings',
    PROFILE: '/admin/profile',
  },

  // Member
  MEMBER: {
    ROOT: '/member',
    DIRECTORY: '/member/directory',
    EVENTS: '/member/events',
    MISSIONS: '/member/missions',
    BIBLE: '/member/bible',
    HYMNAL: '/member/hymnal',
    MANUAL: '/member/manual',
    EDUCATION: '/member/education',
    PRAYER: '/member/prayer',
    DEVOTIONALS: '/member/devotionals',
    GOVERNANCE: '/member/governance',
    TITHES: '/member/tithes',
    EXPENSES: '/member/expenses',
    PROFILE: '/member/profile',
  },
} as const;

// Type-safe route builder
export type RouteBuilder = typeof ROUTES;
export type RouteKey = keyof RouteBuilder;
```

#### 1.2.2 Helper para Navegação

```typescript
// apps/web/src/lib/routes.ts (continuação)
import { useNavigate as useNavigateRRD } from 'react-router-dom';

export function useNavigate() {
  const navigate = useNavigateRRD();

  return {
    to: (path: string) => navigate(path),
    toAdmin: (page?: keyof typeof ROUTES.ADMIN) => 
      navigate(page ? ROUTES.ADMIN[page] : ROUTES.ADMIN.ROOT),
    toMember: (page?: keyof typeof ROUTES.MEMBER) => 
      navigate(page ? ROUTES.MEMBER[page] : ROUTES.MEMBER.ROOT),
    back: () => navigate(-1),
  };
}
```

#### 1.2.3 Refatorar Links

```tsx
// ✅ Antes
<Link to="/admin/members">Membros</Link>
navigate('/admin/treasury');

// ✅ Depois
import { ROUTES } from '../lib/routes';

<Link to={ROUTES.ADMIN.MEMBERS}>Membros</Link>
navigate(ROUTES.ADMIN.TREASURY);
```

**Critérios de Aceitação:**
- [ ] Todas as rotas centralizadas em constants
- [ ] Type-safety completo
- [ ] Todos os Links/navigates migrados
- [ ] Documentação de rotas

---

### 1.3 Setup de Testes

**Problema Atual:**
- Apenas 8 arquivos de teste
- Coverage ~10%
- Falta testes de integração

**Solução:**

#### 1.3.1 Test Utilities

```typescript
// apps/web/src/test/test-utils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock de user para testes
export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  memberships: [{
    id: '1',
    role: 'ADMIN',
    tenant: {
      id: '1',
      name: 'Igreja Teste',
    },
  }],
};

// Query client para testes
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialRoute = '/',
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  window.history.pushState({}, 'Test page', initialRoute);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Re-export everything
export * from '@testing-library/react';
export { renderWithProviders as render };
```

#### 1.3.2 Exemplo de Teste de Componente

```typescript
// apps/web/src/components/layout/__tests__/DashboardLayout.test.tsx
import { screen, waitFor } from '@testing-library/react';
import { render, mockUser } from '../../../test/test-utils';
import { DashboardLayout } from '../DashboardLayout';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(ctx.json(mockUser));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('DashboardLayout', () => {
  it('renders user name and tenant', async () => {
    render(<DashboardLayout />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Igreja Teste')).toBeInTheDocument();
    });
  });

  it('filters navigation based on permissions', async () => {
    render(<DashboardLayout />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Membros')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    render(<DashboardLayout />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });
});
```

#### 1.3.3 Configurar MSW (Mock Service Worker)

```typescript
// apps/web/src/test/mocks/handlers.ts
import { rest } from 'msw';
import { mockUser } from '../test-utils';

export const handlers = [
  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(ctx.json(mockUser));
  }),

  rest.get('/api/metadata', (req, res, ctx) => {
    return res(ctx.json({
      enums: {
        ecclesiastical_offices: [
          { value: 'PASTOR', label: 'Pastor' },
          { value: 'PRESBITERO', label: 'Presbítero' },
        ],
      },
    }));
  }),

  // Adicionar outros endpoints conforme necessário
];
```

```typescript
// apps/web/src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// apps/web/src/test/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### 1.3.4 Atualizar vitest.config

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/main.tsx',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Critérios de Aceitação:**
- [ ] Test utils configurados
- [ ] MSW configurado
- [ ] Testes de exemplo criados
- [ ] Coverage mínimo de 30% nesta fase
- [ ] CI rodando testes automaticamente

---

### 1.4 ESLint Rules Avançadas

**Solução:**

```javascript
// apps/web/eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';  // ✅ Adicionar

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.strict,  // ✅ Strict mode
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.configs.recommended,  // ✅ A11y rules
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Performance
      'react-hooks/exhaustive-deps': 'error',
      'react/jsx-no-bind': 'warn',
      'react/jsx-no-constructed-context-values': 'error',
      
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      '@typescript-eslint/consistent-type-imports': 'error',
      
      // Code Quality
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Accessibility
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/interactive-supports-focus': 'warn',
    },
  },
]);
```

**Critérios de Aceitação:**
- [ ] ESLint atualizado com novas regras
- [ ] Todos os warnings corrigidos
- [ ] CI bloqueia merge com lint errors

---

## 🧪 Testes da Fase 1

### Testes Obrigatórios

1. **AuthContext**
   - [ ] Provê valores corretos
   - [ ] Lida com loading state
   - [ ] Throws error fora do Provider
   - [ ] hasPermission funciona corretamente

2. **Routes**
   - [ ] Todas as rotas tipadas funcionam
   - [ ] Funções de build de rotas com parâmetros

3. **Hooks**
   - [ ] useAuth retorna dados corretos
   - [ ] useAuthUser, useAuthTenant funcionam

---

## 📊 Métricas de Sucesso

### Antes
- ❌ 15+ chamadas de useCurrentUser()
- ❌ Props drilling em 5+ componentes
- ❌ 0 testes de context
- ❌ URLs hardcoded em 50+ lugares
- ❌ Coverage ~10%

### Depois
- ✅ 1 chamada única (no AuthProvider)
- ✅ Zero props drilling
- ✅ 100% coverage do AuthContext
- ✅ Todas as rotas tipadas
- ✅ Coverage ~30%

---

## 📦 Entregáveis

1. ✅ `src/contexts/AuthContext.tsx` (novo)
2. ✅ `src/lib/routes.ts` (novo)
3. ✅ `src/test/test-utils.tsx` (novo)
4. ✅ `src/test/mocks/` (novo)
5. ✅ `vitest.config.ts` (atualizado)
6. ✅ `eslint.config.js` (atualizado)
7. ✅ 15+ componentes refatorados
8. ✅ 10+ testes novos

---

## ⚠️ Riscos e Mitigações

### Risco 1: Breaking Changes em Componentes
**Mitigação:** Migrar incrementalmente, testar após cada componente

### Risco 2: Performance Regression
**Mitigação:** Profiler do React antes/depois, benchmarks

### Risco 3: Testes Flaky
**Mitigação:** MSW para mocking determinístico, waitFor adequado

---

## 🔄 Checklist de Implementação

- [ ] Criar branch `retrofit/fase-1-fundacao`
- [ ] Implementar AuthContext
- [ ] Testar AuthContext (100% coverage)
- [ ] Integrar no main.tsx
- [ ] Refatorar DashboardLayout
- [ ] Refatorar MemberLayout
- [ ] Refatorar HomePage
- [ ] Refatorar MembersPage
- [ ] Refatorar demais componentes
- [ ] Criar routes.ts
- [ ] Migrar todos os Links
- [ ] Setup test utils
- [ ] Configurar MSW
- [ ] Criar testes de exemplo
- [ ] Atualizar ESLint
- [ ] Corrigir warnings
- [ ] Code review
- [ ] Merge para main

---

## 📅 Timeline Sugerido

| Semana | Tarefas |
|--------|---------|
| **1** | AuthContext + integração + refactor inicial |
| **2** | Refactor componentes restantes + routes |
| **3** | Setup de testes + MSW + testes de context |
| **4** | ESLint + correções + code review + merge |

---

## 🎓 Recursos de Aprendizado

- [React Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
- [Testing Library Guides](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/docs/)
- [TypeScript Const Assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
