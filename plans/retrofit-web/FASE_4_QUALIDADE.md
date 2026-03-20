# Fase 4: Qualidade - Cobertura de Testes Completa

> **Duração:** 4-5 semanas  
> **Prioridade:** 🔴 Crítica  
> **Dependências:** Fase 1, 2, 3

---

## 🎯 Objetivos

1. Aumentar cobertura de testes de 10% para 70%+
2. Implementar testes unitários para hooks e utils
3. Criar testes de integração para features completas
4. Implementar testes E2E críticos com Playwright
5. Configurar quality gates no CI/CD
6. Estabelecer cultura de TDD

---

## 📋 Tarefas Detalhadas

### 4.1 Testes Unitários de Hooks

**Objetivo:** Testar toda a lógica de negócio isoladamente

#### 4.1.1 Testes de Custom Hooks

```typescript
// apps/web/src/hooks/__tests__/useAuth.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { useCurrentUser, useLogin, useLogout } from '../useAuth';

const server = setupServer(
  rest.get('/api/auth/me', (req, res, ctx) => {
    const token = req.headers.get('Authorization');
    if (!token) {
      return res(ctx.status(401));
    }
    return res(ctx.json({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    }));
  }),
  
  rest.post('/api/auth/login', async (req, res, ctx) => {
    const body = await req.json();
    if (body.email === 'test@example.com' && body.password === 'password') {
      return res(ctx.json({
        access_token: 'fake-token',
      }));
    }
    return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useCurrentUser', () => {
  it('returns null when not authenticated', async () => {
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('returns user when authenticated', async () => {
    localStorage.setItem('access_token', 'fake-token');
    
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      });
    });
  });
});

describe('useLogin', () => {
  it('logs in successfully with valid credentials', async () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      email: 'test@example.com',
      password: 'password',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(localStorage.getItem('access_token')).toBe('fake-token');
    });
  });

  it('fails with invalid credentials', async () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      email: 'wrong@example.com',
      password: 'wrong',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useLogout', () => {
  it('clears token and redirects', async () => {
    localStorage.setItem('access_token', 'fake-token');
    
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });
});
```

#### 4.1.2 Testes de Hooks com Dependências

```typescript
// apps/web/src/features/members/hooks/__tests__/useMembers.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { server } from '../../../../test/mocks/server';
import { createWrapper } from '../../../../test/test-utils';
import { useMembers, useCreateMember, useUpdateMember } from '../useMembers';

const mockMembers = [
  { id: '1', full_name: 'John Doe', office: 'PASTOR' },
  { id: '2', full_name: 'Jane Smith', office: 'PRESBITERO' },
];

describe('useMembers', () => {
  beforeEach(() => {
    server.use(
      rest.get('/api/tenants/:tenantId/members', (req, res, ctx) => {
        return res(ctx.json(mockMembers));
      })
    );
  });

  it('fetches members successfully', async () => {
    const { result } = renderHook(() => useMembers('tenant-1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.data).toEqual(mockMembers);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('does not fetch when tenantId is undefined', () => {
    const { result } = renderHook(() => useMembers(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('handles error state', async () => {
    server.use(
      rest.get('/api/tenants/:tenantId/members', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    const { result } = renderHook(() => useMembers('tenant-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useCreateMember', () => {
  it('creates member and invalidates cache', async () => {
    server.use(
      rest.post('/api/tenants/:tenantId/members', async (req, res, ctx) => {
        const body = await req.json();
        return res(ctx.json({ id: '3', ...body }));
      })
    );

    const { result: createResult } = renderHook(
      () => useCreateMember('tenant-1'),
      { wrapper: createWrapper() }
    );

    createResult.current.mutate({
      full_name: 'New Member',
      office: 'MEMBRO',
    });

    await waitFor(() => {
      expect(createResult.current.isSuccess).toBe(true);
    });
  });
});
```

**Hooks a Testar:**
- [x] useAuth (login, logout, currentUser)
- [ ] useMetadata
- [ ] usePermissions
- [ ] useBibleVersion
- [ ] useDashboardStats
- [ ] useMembers (CRUD completo)
- [ ] useEvents
- [ ] usePrayer
- [ ] useTithes
- [ ] useExpenses
- [ ] useCouncils
- [ ] useMissions

---

### 4.2 Testes de Integração de Features

**Objetivo:** Testar fluxos completos de features

#### 4.2.1 Teste de Feature: Gestão de Membros

```typescript
// apps/web/src/features/members/__tests__/members-feature.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from '../../../test/mocks/server';
import { renderWithProviders } from '../../../test/test-utils';
import { MembersPage } from '../../../routes/members/MembersPage';

const mockMembers = [
  { 
    id: '1', 
    full_name: 'John Doe', 
    email: 'john@example.com',
    office: 'PASTOR',
    phone: '11999999999',
  },
  { 
    id: '2', 
    full_name: 'Jane Smith', 
    email: 'jane@example.com',
    office: 'PRESBITERO',
    phone: '11988888888',
  },
];

describe('Members Feature Integration', () => {
  beforeEach(() => {
    server.use(
      rest.get('/api/tenants/:tenantId/members', (req, res, ctx) => {
        return res(ctx.json(mockMembers));
      })
    );
  });

  describe('List and Filter', () => {
    it('displays all members initially', async () => {
      renderWithProviders(<MembersPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('filters members by search query', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MembersPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      await user.type(searchInput, 'John');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('filters members by office', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MembersPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const pastorFilter = screen.getByRole('button', { name: /pastor/i });
      await user.click(pastorFilter);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });
  });

  describe('Create Member', () => {
    it('creates new member successfully', async () => {
      const user = userEvent.setup();
      
      server.use(
        rest.post('/api/tenants/:tenantId/members', async (req, res, ctx) => {
          const body = await req.json();
          return res(ctx.json({ id: '3', ...body }));
        })
      );

      renderWithProviders(<MembersPage />);

      // Open create dialog
      const addButton = screen.getByRole('button', { name: /novo membro/i });
      await user.click(addButton);

      // Fill form
      await user.type(screen.getByLabelText(/nome completo/i), 'New Member');
      await user.type(screen.getByLabelText(/email/i), 'new@example.com');
      
      // Submit
      const saveButton = screen.getByRole('button', { name: /salvar/i });
      await user.click(saveButton);

      // Verify success
      await waitFor(() => {
        expect(screen.getByText('Membro criado com sucesso!')).toBeInTheDocument();
      });
    });

    it('shows validation errors', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MembersPage />);

      const addButton = screen.getByRole('button', { name: /novo membro/i });
      await user.click(addButton);

      // Submit without filling required fields
      const saveButton = screen.getByRole('button', { name: /salvar/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Member', () => {
    it('updates member successfully', async () => {
      const user = userEvent.setup();
      
      server.use(
        rest.put('/api/tenants/:tenantId/members/:id', async (req, res, ctx) => {
          const body = await req.json();
          return res(ctx.json({ id: req.params.id, ...body }));
        })
      );

      renderWithProviders(<MembersPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Click edit button
      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      await user.click(editButtons[0]);

      // Update name
      const nameInput = screen.getByLabelText(/nome completo/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'John Updated');

      // Save
      const saveButton = screen.getByRole('button', { name: /salvar/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Membro atualizado com sucesso!')).toBeInTheDocument();
      });
    });
  });

  describe('Invite Member', () => {
    it('invites member to platform', async () => {
      const user = userEvent.setup();
      
      server.use(
        rest.post('/api/tenants/:tenantId/members/:id/invite', (req, res, ctx) => {
          return res(ctx.json({
            success: true,
            temporary_password: 'temp123',
            email_sent: true,
          }));
        })
      );

      renderWithProviders(<MembersPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const inviteButtons = screen.getAllByRole('button', { name: /convidar/i });
      await user.click(inviteButtons[0]);

      // Confirm role
      const adminRole = screen.getByRole('radio', { name: /admin/i });
      await user.click(adminRole);

      const confirmButton = screen.getByRole('button', { name: /enviar convite/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/convite enviado/i)).toBeInTheDocument();
      });
    });
  });
});
```

**Features a Testar:**
- [x] Members (CRUD + filter + invite)
- [ ] Events (create, edit, delete, filter by date)
- [ ] Financial (transactions, balance, filters, export)
- [ ] Prayer (create, pray, filter by category)
- [ ] Governance (councils, meetings, votes)
- [ ] EBD (classes, lessons, attendance)
- [ ] Missions (missionaries, projects, donations)

---

### 4.3 Testes E2E com Playwright

**Objetivo:** Testar jornadas críticas do usuário

#### 4.3.1 Configurar Playwright

```typescript
// apps/web/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### 4.3.2 Page Object Model

```typescript
// apps/web/e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/senha/i);
    this.submitButton = page.getByRole('button', { name: /entrar/i });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string | RegExp) {
    await this.errorMessage.waitFor();
    if (typeof message === 'string') {
      await this.page.getByText(message).waitFor();
    } else {
      await this.page.getByText(message).waitFor();
    }
  }
}
```

```typescript
// apps/web/e2e/pages/DashboardPage.ts
import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userMenu = page.getByRole('button', { name: /perfil/i });
    this.logoutButton = page.getByRole('button', { name: /sair/i });
  }

  async goto() {
    await this.page.goto('/admin');
  }

  async navigateTo(section: string) {
    await this.page.getByRole('link', { name: new RegExp(section, 'i') }).click();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async expectWelcomeMessage(name: string) {
    await this.page.getByText(new RegExp(`bom dia, ${name}`, 'i')).waitFor();
  }
}
```

#### 4.3.3 Testes E2E Críticos

```typescript
// apps/web/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Authentication', () => {
  test('user can login and logout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Navigate to login
    await loginPage.goto();

    // Login with valid credentials
    await loginPage.login('admin@example.com', 'password123');

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/admin/);
    await dashboardPage.expectWelcomeMessage('Admin');

    // Logout
    await dashboardPage.logout();

    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'wrongpass');

    await loginPage.expectError(/credenciais inválidas/i);
  });

  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});
```

```typescript
// apps/web/e2e/members.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Members Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/senha/i).fill('password123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL(/\/admin/);
  });

  test('creates a new member', async ({ page }) => {
    // Navigate to members
    await page.getByRole('link', { name: /membros/i }).click();
    await expect(page).toHaveURL(/\/admin\/members/);

    // Click add button
    await page.getByRole('button', { name: /novo membro/i }).click();

    // Fill form
    await page.getByLabel(/nome completo/i).fill('Test Member');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/telefone/i).fill('11999999999');
    
    // Select office
    await page.getByLabel(/cargo/i).click();
    await page.getByRole('option', { name: /membro/i }).click();

    // Submit
    await page.getByRole('button', { name: /salvar/i }).click();

    // Verify success
    await expect(page.getByText(/membro criado com sucesso/i)).toBeVisible();
    await expect(page.getByText('Test Member')).toBeVisible();
  });

  test('searches for members', async ({ page }) => {
    await page.goto('/admin/members');

    // Type in search
    await page.getByPlaceholder(/buscar/i).fill('John');

    // Verify filtered results
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).not.toBeVisible();
  });

  test('filters members by office', async ({ page }) => {
    await page.goto('/admin/members');

    // Click pastor filter
    await page.getByRole('button', { name: /^pastor$/i }).click();

    // Verify only pastors shown
    await expect(page.getByText(/cargo.*pastor/i).first()).toBeVisible();
  });
});
```

**Jornadas E2E a Cobrir:**
- [x] Login/Logout completo
- [x] CRUD de membros
- [ ] Criar evento e visualizar no calendário
- [ ] Registro de dízimo e visualização em tesouraria
- [ ] Criar pedido de oração e orar
- [ ] Navegação entre áreas (admin ↔ member)
- [ ] Visualização mobile responsiva
- [ ] Offline behavior (PWA)

---

### 4.4 Visual Regression Testing

**Objetivo:** Detectar mudanças visuais não intencionais

#### 4.4.1 Configurar Percy ou Chromatic

```bash
npm install --save-dev @percy/cli @percy/playwright
```

```typescript
// apps/web/e2e/visual.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Visual Regression', () => {
  test('homepage desktop', async ({ page }) => {
    await page.goto('/');
    await percySnapshot(page, 'Homepage - Desktop');
  });

  test('homepage mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await percySnapshot(page, 'Homepage - Mobile');
  });

  test('dashboard', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/senha/i).fill('password');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Snapshot dashboard
    await page.waitForURL(/\/admin/);
    await percySnapshot(page, 'Dashboard - Logged In');
  });

  test('members list', async ({ page }) => {
    await page.goto('/admin/members');
    await percySnapshot(page, 'Members List');
  });
});
```

---

### 4.5 CI/CD Quality Gates

**Objetivo:** Garantir qualidade em todo commit

#### 4.5.1 GitHub Actions Workflow

```yaml
# .github/workflows/quality.yml
name: Quality Gates

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
      - name: Check coverage thresholds
        run: |
          npm run test:coverage -- --coverage.thresholds.lines=70

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          
  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, unit-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Check bundle size
        run: |
          npm run build
          ls -lh dist/assets/*.js
```

#### 4.5.2 Pre-commit Hooks

```bash
npm install --save-dev husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  },
  "scripts": {
    "prepare": "husky install"
  }
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run typecheck
npm run test -- --run --bail
```

---

## 📊 Métricas de Sucesso

### Coverage Goals

| Tipo | Atual | Meta | Mínimo |
|------|-------|------|--------|
| **Statements** | 10% | 75% | 70% |
| **Branches** | 8% | 70% | 65% |
| **Functions** | 12% | 75% | 70% |
| **Lines** | 10% | 75% | 70% |

### Test Distribution

| Categoria | Quantidade | Coverage |
|-----------|------------|----------|
| Unit (Hooks) | 12 → 50+ | 90% |
| Unit (Utils) | 0 → 20+ | 100% |
| Integration (Features) | 0 → 30+ | 80% |
| E2E (Critical Paths) | 0 → 15+ | 100% critical |

### Quality Metrics

- **Flaky Tests:** 0%
- **Test Duration:** <2min (unit), <5min (E2E)
- **CI Success Rate:** >95%
- **Time to Feedback:** <5min

---

## 📦 Entregáveis

1. ✅ 50+ unit tests (hooks)
2. ✅ 20+ unit tests (utils)
3. ✅ 30+ integration tests (features)
4. ✅ 15+ E2E tests (Playwright)
5. ✅ Visual regression setup
6. ✅ CI/CD quality gates
7. ✅ Pre-commit hooks
8. ✅ Coverage reports (Codecov)

---

## 🔄 Checklist de Implementação

- [ ] Criar branch `retrofit/fase-4-qualidade`
- [ ] Testes de useAuth
- [ ] Testes de useMetadata
- [ ] Testes de usePermissions
- [ ] Testes de todos os hooks de features
- [ ] Testes de utils (formatters, validators)
- [ ] Integration test: Members feature
- [ ] Integration test: Events feature
- [ ] Integration test: Financial feature
- [ ] Setup Playwright
- [ ] Page Objects criados
- [ ] E2E: Auth flow
- [ ] E2E: Members CRUD
- [ ] E2E: Critical paths (5+)
- [ ] Setup Percy/Chromatic
- [ ] Visual regression tests
- [ ] GitHub Actions workflow
- [ ] Pre-commit hooks
- [ ] Codecov integration
- [ ] Coverage badges no README
- [ ] Code review
- [ ] Merge para main

---

## 📅 Timeline Sugerido

| Semana | Tarefas |
|--------|---------|
| **1** | Unit tests (hooks) |
| **2** | Unit tests (utils) + Integration tests |
| **3** | E2E setup + critical paths |
| **4** | Visual regression + CI/CD |
| **5** | Aumentar coverage para 70%+ |

---

## 🎓 Recursos

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Kent C. Dodds Testing](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [MSW Documentation](https://mswjs.io/docs/)
