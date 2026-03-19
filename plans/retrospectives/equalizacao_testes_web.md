# Plano de Equalização: Testes Web Filadelfias

**Data:** 2026-01-20  
**Referência:** Projeto Lettura (`/Users/leco/Documents/lettura/web`)

---

## 1. Diagnóstico do Problema Atual

### Causa Raiz Identificada

O arquivo `apps/web/src/lib/utils.ts` **não está no repositório git** porque o `.gitignore` da raiz do projeto contém `lib/` (padrão Python) que ignora qualquer pasta `lib/` em todo o projeto.

```
# .gitignore (raiz) - linha 17
lib/
```

Isso faz com que:
- ✅ Testes passam localmente (arquivo existe no disco)
- ❌ Testes falham no CI (arquivo não foi commitado)

---

## 2. Comparação Lettura vs Filadelfias

### 2.1 Estrutura de Arquivos

| Aspecto | Lettura | Filadelfias | Status |
|---------|---------|-------------|--------|
| `vitest.config.ts` | Arquivo separado | Arquivo separado | ✅ OK |
| `vite.config.ts` | Sem config de test | Sem config de test | ✅ OK |
| `tsconfig.app.json` paths | `"@/*": ["src/*"]` | `"@/*": ["src/*"]` | ✅ OK |
| `src/lib/utils.ts` | Commitado no git | **IGNORADO pelo git** | ❌ PROBLEMA |
| `src/test/setup.ts` | Completo (mocks) | Básico | ⚠️ Melhorar |

### 2.2 Configuração vitest.config.ts

**Lettura:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [...],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

**Filadelfias:** Estrutura idêntica ✅

### 2.3 Setup de Testes (src/test/setup.ts)

**Lettura (completo):**
```typescript
import '@testing-library/jest-dom/vitest';

// Mock do matchMedia
Object.defineProperty(window, 'matchMedia', {...});

// Mock do localStorage
const localStorageMock = {...};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock do scrollTo
window.scrollTo = () => {};
```

**Filadelfias (básico):**
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
    cleanup();
});
```

### 2.4 Organização de Testes

| Aspecto | Lettura | Filadelfias |
|---------|---------|-------------|
| Localização | `__tests__/` dentro de cada pasta | Junto aos componentes (`*.test.tsx`) |
| Naming | `Component.test.tsx` | `Component.test.tsx` |

---

## 3. Plano de Ação

### Fase 1: Correção Crítica (Imediata)

#### 1.1 Corrigir .gitignore da raiz

**Arquivo:** `.gitignore` (raiz do projeto)

**Ação:** Alterar `lib/` para `/lib/` para ignorar apenas a pasta `lib/` na raiz (não em subpastas)

```diff
- lib/
+ /lib/
```

#### 1.2 Adicionar src/lib ao git

```bash
cd apps/web
git add -f src/lib/utils.ts
git add -f src/lib/api.ts
git commit -m "fix: add src/lib files to git (fix gitignore pattern)"
git push
```

### Fase 2: Melhorias no Setup de Testes

#### 2.1 Atualizar src/test/setup.ts

Adicionar mocks do Lettura para melhor compatibilidade:

```typescript
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock do matchMedia para testes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock do scrollTo
window.scrollTo = () => {};
```

### Fase 3: Atualização do Workflow CI

#### 3.1 Atualizar Poetry version no workflow

**Arquivo:** `.github/workflows/web.yml`

```diff
- version: 1.8.0
+ version: 2.1.1
```

#### 3.2 Corrigir CORS_ORIGINS (formato string)

```diff
- CORS_ORIGINS: '["http://localhost:5173"]'
+ CORS_ORIGINS_STR: http://localhost:5173
```

---

## 4. Checklist de Execução

- [ ] **Fase 1.1:** Corrigir `.gitignore` da raiz (`lib/` → `/lib/`)
- [ ] **Fase 1.2:** Adicionar `src/lib/utils.ts` e `src/lib/api.ts` ao git
- [ ] **Fase 1.3:** Commit e push
- [ ] **Fase 1.4:** Verificar CI passou
- [ ] **Fase 2.1:** Atualizar `src/test/setup.ts` com mocks do Lettura
- [ ] **Fase 3.1:** Atualizar Poetry version no workflow para 2.1.1
- [ ] **Fase 3.2:** Corrigir formato de CORS_ORIGINS no workflow

---

## 5. Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `.gitignore` (raiz) | Alterar `lib/` para `/lib/` |
| `apps/web/src/lib/utils.ts` | Adicionar ao git com `-f` |
| `apps/web/src/lib/api.ts` | Adicionar ao git com `-f` |
| `apps/web/src/test/setup.ts` | Adicionar mocks do Lettura |
| `.github/workflows/web.yml` | Atualizar Poetry e CORS |

---

## 6. Comandos para Executar

```bash
# 1. Corrigir gitignore
sed -i '' 's/^lib\/$/\/lib\//' .gitignore

# 2. Adicionar arquivos ignorados
git add -f apps/web/src/lib/utils.ts
git add -f apps/web/src/lib/api.ts

# 3. Commit
git add .gitignore
git commit -m "fix: correct gitignore pattern and add src/lib files"

# 4. Push
git push
```

---

## 7. Validação

Após executar o plano, verificar:

1. `git ls-files apps/web/src/lib/` deve mostrar `utils.ts` e `api.ts`
2. CI deve passar todos os testes
3. Build deve completar com sucesso
