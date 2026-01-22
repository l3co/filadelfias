# 🧪 Fase 7: Testes e QA

## Objetivo
Garantir qualidade do app através de testes unitários, integração e E2E.

---

## Stack de Testes

| Tipo | Ferramenta | Uso |
|------|------------|-----|
| Unitários | Jest + React Native Testing Library | Componentes, hooks, utils |
| Integração | Jest + MSW | Services, API calls |
| E2E | Detox ou Maestro | Fluxos completos |
| Visual | Storybook (opcional) | Componentes UI |

---

## Setup

### Dependências

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
npm install --save-dev msw
npm install --save-dev @types/jest
```

### jest.config.js

```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
};
```

### jest.setup.js

```javascript
import '@testing-library/jest-native/extend-expect';

// Mock de módulos nativos
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    getBoolean: jest.fn(),
  })),
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => ({ data: 'mock-token' })),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock de navegação
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
}));
```

---

## Testes Unitários

### Exemplo: Componente Button

```typescript
// src/components/ui/__tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Click me</Button>);
    
    fireEvent.press(screen.getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.queryByText('Click me')).toBeNull();
    // ActivityIndicator should be present
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress} disabled>Click me</Button>);
    
    fireEvent.press(screen.getByText('Click me'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

### Exemplo: Hook useAuth

```typescript
// src/hooks/__tests__/useAuth.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';

jest.mock('@/services/api');

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });

  it('login saves token and fetches user', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@test.com' };
    
    (api.post as jest.Mock).mockResolvedValueOnce({ 
      data: { access_token: 'test-token' } 
    });
    (api.get as jest.Mock).mockResolvedValueOnce({ data: mockUser });

    const { result } = renderHook(() => useAuthStore(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('access_token', 'test-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('logout clears token and user', async () => {
    useAuthStore.setState({ 
      user: { id: '1', name: 'Test' }, 
      isAuthenticated: true 
    });

    const { result } = renderHook(() => useAuthStore(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

### Exemplo: Utilitários

```typescript
// src/lib/__tests__/utils.test.ts
import { formatDate, getInitials, cn } from '../utils';

describe('utils', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      expect(formatDate('2024-01-15')).toBe('15/01/2024');
    });
  });

  describe('getInitials', () => {
    it('returns first two initials', () => {
      expect(getInitials('João Silva')).toBe('JS');
    });

    it('handles single name', () => {
      expect(getInitials('Maria')).toBe('MA');
    });

    it('handles empty string', () => {
      expect(getInitials('')).toBe('');
    });
  });

  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });
  });
});
```

---

## Testes de Integração com MSW

### Setup do MSW

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth
  http.post('/auth/login', async ({ request }) => {
    const body = await request.text();
    if (body.includes('test@test.com')) {
      return HttpResponse.json({ access_token: 'test-token' });
    }
    return new HttpResponse(null, { status: 401 });
  }),

  http.get('/auth/me', () => {
    return HttpResponse.json({
      id: '1',
      name: 'Test User',
      email: 'test@test.com',
      memberships: [],
    });
  }),

  // Bible
  http.get('/bible/books', () => {
    return HttpResponse.json([
      { abbrev: 'gn', name: 'Gênesis', chapters_count: 50, testament: 'old' },
      { abbrev: 'ex', name: 'Êxodo', chapters_count: 40, testament: 'old' },
    ]);
  }),

  http.get('/bible/:book/:chapter', ({ params }) => {
    return HttpResponse.json({
      book_name: 'Gênesis',
      book_abbrev: params.book,
      chapter: Number(params.chapter),
      verses: ['No princípio...', 'E a terra era...'],
    });
  }),

  // Devotionals
  http.get('/devotionals', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'O Amor de Deus',
        verse_reference: 'João 3:16',
        date: '2024-01-15',
      },
    ]);
  }),
];
```

```typescript
// src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// jest.setup.js (adicionar)
import { server } from './src/test/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Testes E2E com Maestro

Maestro é mais simples de configurar que Detox para React Native/Expo.

### Instalação

```bash
# macOS
brew install maestro

# Verificar instalação
maestro --version
```

### Fluxos de Teste

```yaml
# e2e/flows/login.yaml
appId: com.filadelfias.app
---
- launchApp
- assertVisible: "Filadélfias"
- assertVisible: "Entrar na minha conta"
- tapOn: "Entrar na minha conta"
- assertVisible: "Bem-vindo de volta"
- tapOn:
    id: "email-input"
- inputText: "test@igreja.com"
- tapOn:
    id: "password-input"
- inputText: "Senha123!"
- tapOn: "Entrar"
- assertVisible: "Dashboard"
```

```yaml
# e2e/flows/bible-navigation.yaml
appId: com.filadelfias.app
---
- launchApp
- tapOn: "Bíblia Sagrada"
- assertVisible: "Bíblia Sagrada"
- assertVisible: "Antigo Testamento"
- tapOn: "Gênesis"
- assertVisible: "Gênesis 1"
- scrollUntilVisible:
    element: "No princípio"
- tapOn: "Próximo"
- assertVisible: "Gênesis 2"
```

```yaml
# e2e/flows/offline-download.yaml
appId: com.filadelfias.app
---
- launchApp
- tapOn: "Leitura Offline"
- assertVisible: "Conteúdo Offline"
- tapOn:
    id: "download-nvi"
- waitForAnimationToEnd
- assertVisible: "✓" # Check mark indicating download complete
```

### Executar Testes

```bash
# Executar um fluxo
maestro test e2e/flows/login.yaml

# Executar todos os fluxos
maestro test e2e/flows/

# Gravar novo fluxo
maestro record
```

---

## Matriz de Testes

### Funcionalidades Críticas

| Funcionalidade | Unitário | Integração | E2E |
|----------------|----------|------------|-----|
| Login/Logout | ✅ | ✅ | ✅ |
| Navegação Bíblia | ✅ | ✅ | ✅ |
| Navegação Hinário | ✅ | ✅ | ✅ |
| Navegação Manual | ✅ | ✅ | ✅ |
| Download Offline | ✅ | ✅ | ✅ |
| Devocionais | ✅ | ✅ | ✅ |
| Pedidos de Oração | ✅ | ✅ | ✅ |
| Gestão Membros | ✅ | ✅ | ⚠️ |
| Tesouraria | ✅ | ✅ | ⚠️ |

### Dispositivos para Teste Manual

| Plataforma | Dispositivo | Versão OS |
|------------|-------------|-----------|
| iOS | iPhone 12 | iOS 15+ |
| iOS | iPhone SE | iOS 15+ |
| iOS | iPad | iPadOS 15+ |
| Android | Pixel 4 | Android 11+ |
| Android | Samsung Galaxy | Android 10+ |
| Android | Tablet | Android 10+ |

---

## Checklist de QA

### Funcional
- [ ] Todas as telas carregam corretamente
- [ ] Navegação funciona em todas as direções
- [ ] Login/logout funciona
- [ ] Dados são persistidos corretamente
- [ ] Offline mode funciona após download
- [ ] Pull-to-refresh atualiza dados
- [ ] Formulários validam entrada

### UI/UX
- [ ] Fontes carregam corretamente
- [ ] Ícones aparecem
- [ ] Cores estão consistentes
- [ ] Animações são suaves
- [ ] Teclado não cobre inputs
- [ ] Safe areas são respeitadas
- [ ] Dark mode (se implementado)

### Performance
- [ ] App abre em < 3 segundos
- [ ] Scrolling é suave (60fps)
- [ ] Imagens carregam rapidamente
- [ ] Sem memory leaks visíveis
- [ ] Battery drain aceitável

### Segurança
- [ ] Token armazenado em SecureStore
- [ ] Sessão expira corretamente
- [ ] Dados sensíveis não aparecem em logs

---

## Scripts no package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "maestro test e2e/flows/",
    "test:e2e:record": "maestro record"
  }
}
```

---

## Próximos Passos

1. → [11-FASE8-DEPLOY.md](./11-FASE8-DEPLOY.md) - Build e Deploy
