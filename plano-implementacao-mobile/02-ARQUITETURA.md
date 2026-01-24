# 🏛️ Arquitetura e Padrões

## Princípios

1. **Reutilização Máxima**: Copiar types, interfaces e lógica de services da web
2. **Consistência**: Mesmos padrões de nomenclatura e estrutura
3. **Separação de Responsabilidades**: UI, lógica, dados bem separados
4. **Offline First**: Pensar em offline desde o início

---

## Padrões de Código

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `MemberCard.tsx` |
| Hooks | camelCase com use | `useAuth.ts` |
| Services | camelCase + Service | `authService.ts` |
| Stores | camelCase + Store | `authStore.ts` |
| Types/Interfaces | PascalCase | `Member.ts` |
| Constantes | SCREAMING_SNAKE | `API_URL` |
| Arquivos de rota | kebab-case | `forgot-password.tsx` |

### Estrutura de Componente

```tsx
// src/components/features/MemberCard.tsx

import { View, Text, Pressable } from 'react-native';
import { User } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  member: {
    id: string;
    name: string;
    email: string;
  };
  onPress?: () => void;
}

export function MemberCard({ member, onPress }: MemberCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center p-4 bg-white rounded-2xl",
        "active:scale-[0.98] active:opacity-90"
      )}
    >
      <View className="h-12 w-12 rounded-xl bg-emerald-100 items-center justify-center">
        <User className="h-6 w-6 text-emerald-600" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-semibold text-slate-900">{member.name}</Text>
        <Text className="text-sm text-slate-500">{member.email}</Text>
      </View>
    </Pressable>
  );
}
```

---

## Metadados e Permissões (Pós-Retrofit)

> **Pré-requisito**: O endpoint `GET /api/metadata` deve estar implementado no backend.
> Consulte: [`retrofit_permissionamentos.md`](../retrofit_permissionamentos.md)

### src/hooks/useMetadata.ts

Este hook é a **fonte única de verdade** para enums, labels e opções de select no mobile.
Deve ser copiado da web após o retrofit estar concluído.

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

interface EnumOption {
  value: string;
  label: string;
}

interface Metadata {
  enums: {
    ecclesiastical_offices: EnumOption[];
    ecclesiastical_functions: EnumOption[];
    member_statuses: EnumOption[];
    genders: EnumOption[];
    marital_statuses: EnumOption[];
  };
}

export function useMetadata() {
  return useQuery<Metadata>({
    queryKey: ['metadata'],
    queryFn: async () => {
      const response = await api.get('/metadata');
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hora - metadados mudam raramente
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

// Helpers para uso direto
export function useOfficeOptions() {
  const { data } = useMetadata();
  return data?.enums.ecclesiastical_offices ?? [];
}

export function useFunctionOptions() {
  const { data } = useMetadata();
  return data?.enums.ecclesiastical_functions ?? [];
}

export function useStatusOptions() {
  const { data } = useMetadata();
  return data?.enums.member_statuses ?? [];
}

export function useGenderOptions() {
  const { data } = useMetadata();
  return data?.enums.genders ?? [];
}

// Helper para obter label de um valor
export function useEnumLabel(enumType: keyof Metadata['enums'], value: string): string {
  const { data } = useMetadata();
  const options = data?.enums[enumType] ?? [];
  return options.find(opt => opt.value === value)?.label ?? value;
}
```

### src/hooks/usePermissions.ts

Sistema de permissões baseado no cargo/função do membro.

```typescript
import { useAuthStore } from '@/stores/authStore';

type Resource = 'members' | 'governance' | 'financial' | 'missions' | 'ebd' | 'events' | 'prayer' | 'devotionals';
type Action = 'view' | 'create' | 'edit' | 'delete' | 'manage';

export function usePermissions() {
  const { user } = useAuthStore();
  const currentMember = user?.memberships?.[0];
  
  const can = (resource: Resource, action: Action): boolean => {
    if (!currentMember) return false;
    
    const { role } = currentMember;
    
    // Admin e Owner têm acesso total
    if (role === 'ADMIN' || role === 'OWNER') return true;
    
    // Membros comuns só podem visualizar
    if (action !== 'view') return false;
    
    // Recursos públicos para membros
    const publicResources: Resource[] = ['events', 'prayer', 'devotionals', 'ebd'];
    return publicResources.includes(resource);
  };

  const isAdmin = currentMember?.role === 'ADMIN' || currentMember?.role === 'OWNER';
  const isLeader = isAdmin; // Expandir conforme necessário

  return { can, isAdmin, isLeader };
}
```

### Uso nos Componentes

```tsx
// Exemplo: Select de Cargo
import { useOfficeOptions } from '@/hooks/useMetadata';
import { Picker } from '@react-native-picker/picker';

function OfficeSelect({ value, onChange }) {
  const options = useOfficeOptions();
  
  return (
    <Picker selectedValue={value} onValueChange={onChange}>
      <Picker.Item label="Selecione..." value="" />
      {options.map(opt => (
        <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
      ))}
    </Picker>
  );
}

// Exemplo: Exibir label de um valor
import { useEnumLabel } from '@/hooks/useMetadata';

function MemberCard({ member }) {
  const officeLabel = useEnumLabel('ecclesiastical_offices', member.office);
  
  return (
    <View>
      <Text>{member.name}</Text>
      <Text>{officeLabel}</Text>
    </View>
  );
}
```

---

## Services (Reutilizando da Web)

### src/services/api.ts
```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '@/constants/config';

export const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adiciona token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - trata 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('access_token');
      // Navegar para login será tratado pelo authStore
    }
    return Promise.reject(error);
  }
);
```

### Copiar Services da Web
Os seguintes arquivos podem ser copiados diretamente de `apps/web/src/services/`:
- `bible.ts` (ajustar import do api)
- `hymnal.ts`
- `manual.ts`
- `devotionals.ts`
- `events.ts`
- `members.ts`
- `missions.ts`
- `prayer.ts`
- `ebd.ts`
- `financial.ts`
- `governance.ts`

**Único ajuste necessário:**
```typescript
// Antes (web)
import { api } from '../lib/api';

// Depois (mobile)
import { api } from '@/services/api';
```

---

## State Management

### Zustand Store - Auth
```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  memberships: Membership[];
}

interface Membership {
  id: string;
  tenant: Tenant;
  role: string;
  status: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getCurrentTenant: () => Tenant | null;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    await SecureStore.setItemAsync('access_token', response.data.access_token);
    await get().checkAuth();
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await SecureStore.getItemAsync('access_token');
      
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const response = await api.get('/auth/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync('access_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  getCurrentTenant: () => {
    const user = get().user;
    return user?.memberships?.[0]?.tenant ?? null;
  },

  isAdmin: () => {
    const user = get().user;
    const role = user?.memberships?.[0]?.role;
    return role === 'ADMIN' || role === 'OWNER';
  },
}));
```

### Zustand Store - Offline
```typescript
// src/stores/offlineStore.ts
import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

interface DownloadedContent {
  bibleVersions: string[];  // ['nvi', 'acf', 'aa']
  hymnal: boolean;
  manual: boolean;
  lastSync: Date | null;
}

interface OfflineState {
  downloaded: DownloadedContent;
  isDownloading: boolean;
  downloadProgress: number;
  
  loadDownloadedState: () => void;
  downloadBible: (version: string) => Promise<void>;
  downloadHymnal: () => Promise<void>;
  downloadManual: () => Promise<void>;
  deleteContent: (type: 'bible' | 'hymnal' | 'manual', version?: string) => Promise<void>;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  downloaded: {
    bibleVersions: [],
    hymnal: false,
    manual: false,
    lastSync: null,
  },
  isDownloading: false,
  downloadProgress: 0,

  loadDownloadedState: () => {
    const saved = storage.getString('offline_content');
    if (saved) {
      set({ downloaded: JSON.parse(saved) });
    }
  },

  downloadBible: async (version) => {
    // Implementação em 08-FASE5-OFFLINE.md
  },

  downloadHymnal: async () => {
    // Implementação em 08-FASE5-OFFLINE.md
  },

  downloadManual: async () => {
    // Implementação em 08-FASE5-OFFLINE.md
  },

  deleteContent: async (type, version) => {
    // Implementação em 08-FASE5-OFFLINE.md
  },
}));
```

---

## TanStack Query Setup

### src/lib/queryClient.ts
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30,   // 30 minutos (antigo cacheTime)
      retry: 2,
      refetchOnWindowFocus: false, // Mobile não tem "window focus"
    },
  },
});
```

### Provider no _layout.tsx
```tsx
// app/_layout.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
```

---

## Utilitários

### src/lib/utils.ts
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
```

### src/lib/storage.ts (MMKV)
```typescript
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const mmkvStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};
```

### src/lib/secureStorage.ts
```typescript
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};
```

---

## Navegação com Expo Router

### Proteção de Rotas
```tsx
// src/components/layout/ProtectedRoute.tsx
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Redirect href="/(member)" />;
  }

  return <>{children}</>;
}
```

### Layout com Proteção
```tsx
// app/(member)/_layout.tsx
import { Stack } from 'expo-router';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

export default function MemberLayout() {
  return (
    <ProtectedRoute>
      <Stack screenOptions={{ headerShown: false }} />
    </ProtectedRoute>
  );
}
```

---

## Próximos Passos

1. → [03-DESIGN-SYSTEM.md](./03-DESIGN-SYSTEM.md) - Componentes UI base
