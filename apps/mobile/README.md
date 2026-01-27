# Filadelfias Mobile

Aplicativo mobile para a plataforma Filadelfias, construído com **React Native** e **Expo**.

## 🚀 Setup Local

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go no celular (para testes) ou emulador Android/iOS

### Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env
# Edite .env com a URL da API

# Iniciar o servidor de desenvolvimento
npm start
```

### Rodando no dispositivo

1. Instale o **Expo Go** no seu celular
2. Escaneie o QR code que aparece no terminal
3. O app será carregado automaticamente

### Rodando no emulador

```bash
# Android
npm run android

# iOS (apenas macOS)
npm run ios
```

---

## 📁 Estrutura do Projeto

```
mobile/
├── app/                    # Telas (Expo Router - file-based routing)
│   ├── (auth)/             # Telas de autenticação
│   │   ├── login.tsx       # Login
│   │   └── register.tsx    # Registro
│   ├── (member)/           # Área do membro logado
│   │   ├── index.tsx       # Home do membro
│   │   ├── bible.tsx       # Bíblia
│   │   ├── hymnal.tsx      # Hinário
│   │   ├── prayer.tsx      # Pedidos de oração
│   │   ├── directory.tsx   # Diretório de membros
│   │   ├── tithes.tsx      # Dízimos
│   │   ├── events.tsx      # Eventos
│   │   ├── missions.tsx    # Missões
│   │   ├── ebd.tsx         # EBD
│   │   └── profile.tsx     # Perfil
│   ├── (public)/           # Área pública (sem login)
│   │   ├── index.tsx       # Home pública
│   │   ├── bible/          # Bíblia pública
│   │   ├── hymnal/         # Hinário público
│   │   └── manual/         # Manual IPB
│   ├── (admin)/            # Área administrativa
│   ├── _layout.tsx         # Layout raiz (providers, auth guard)
│   └── index.tsx           # Redirect inicial
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ui/             # Componentes base (Button, Card, Input...)
│   │   ├── layout/         # Header, TabBar, ProtectedRoute
│   │   └── features/       # Componentes específicos (BibleReader, etc)
│   ├── hooks/              # Custom hooks
│   │   ├── useMetadata.ts  # Enums da API (ofícios, status, etc)
│   │   ├── useBibleSettings.ts
│   │   └── useTTS.ts       # Text-to-Speech
│   ├── services/           # API clients
│   │   ├── api.ts          # Axios instance configurada
│   │   ├── bible.ts        # Serviço da Bíblia
│   │   ├── hymnal.ts       # Serviço do Hinário
│   │   ├── prayer.ts       # Serviço de Oração
│   │   ├── members.ts      # Serviço de Membros
│   │   └── offline.ts      # Serviço de download offline
│   ├── stores/             # Zustand stores
│   │   ├── authStore.ts    # Estado de autenticação
│   │   └── downloadStore.ts # Estado de downloads
│   ├── constants/          # Constantes
│   │   ├── colors.ts       # Paleta de cores
│   │   ├── config.ts       # Configurações
│   │   └── offices.ts      # Tema visual por ofício
│   ├── lib/                # Utilitários
│   │   ├── utils.ts        # Funções helper
│   │   ├── toast.ts        # Notificações
│   │   ├── logger.ts       # Logger centralizado
│   │   ├── database.ts     # SQLite para offline
│   │   └── queryClient.ts  # React Query config
│   └── types/              # TypeScript types
├── assets/                 # Imagens, fontes
├── app.json                # Configuração Expo
├── tailwind.config.js      # NativeWind config
└── package.json
```

---

## 🎨 Stack Tecnológica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React Native** | 0.81 | Framework mobile |
| **Expo** | 54 | Managed workflow |
| **Expo Router** | 6 | File-based routing |
| **NativeWind** | 4 | TailwindCSS para RN |
| **TanStack Query** | 5 | Server state management |
| **Zustand** | 5 | Client state management |
| **Axios** | 1.13 | HTTP client |
| **expo-sqlite** | 16 | Banco local (offline) |
| **expo-secure-store** | 15 | Armazenamento seguro |

---

## 🔐 Autenticação

O app usa **JWT** armazenado no **Secure Store**:

```typescript
// src/stores/authStore.ts
const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    
    login: async (email, password) => {
        const response = await api.post('/auth/login', ...);
        await SecureStore.setItemAsync('access_token', response.data.access_token);
        await get().checkAuth();
    },
    
    logout: async () => {
        await SecureStore.deleteItemAsync('access_token');
        set({ user: null, isAuthenticated: false });
    },
}));
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
const offices = useOfficeOptions(); // [{ value: 'PASTOR', label: 'Pastor' }, ...]
```

### Serviços

```typescript
// src/services/prayer.ts
export const prayerService = {
    getAll: async (tenantId: string) => {
        const response = await api.get('/prayer/requests', {
            params: { tenant_id: tenantId }
        });
        return response.data;
    },
    
    create: async (tenantId: string, data: CreatePrayerRequest) => {
        const response = await api.post('/prayer/requests', data, {
            params: { tenant_id: tenantId }
        });
        return response.data;
    },
};
```

---

## 📴 Suporte Offline

O app suporta download de conteúdo para uso offline:

- **Bíblia**: Versões completas podem ser baixadas
- **Hinário**: Todos os hinos com letras
- **Manual IPB**: Artigos completos

```typescript
// src/services/offline.ts
await offlineService.downloadBibleVersion('arc', (progress) => {
    console.log(`${progress.current}/${progress.total}`);
});

// Verificar se está baixado
const isDownloaded = await offlineService.isContentDownloaded('bible', 'arc');
```

---

## 🎨 Estilização

Usamos **NativeWind** (TailwindCSS para React Native):

```tsx
// Componente com NativeWind
<View className="flex-1 bg-slate-50">
    <Text className="text-lg font-semibold text-slate-900">
        Título
    </Text>
</View>

// Estilos dinâmicos com style prop
<View 
    className="rounded-xl p-4"
    style={{ backgroundColor: theme.bg }}
>
```

### Paleta de Cores

```typescript
// src/constants/colors.ts
export const colors = {
    primary: {
        500: '#10b981', // Emerald - cor principal
        600: '#059669',
    },
    slate: {
        50: '#f8fafc',
        900: '#0f172a',
    },
};
```

---

## 🧪 Comandos Úteis

```bash
# Iniciar servidor de desenvolvimento
npm start

# Limpar cache
npx expo start --clear

# Gerar build de desenvolvimento
npx expo prebuild

# Build para Android (APK)
eas build --platform android --profile preview

# Build para iOS
eas build --platform ios --profile preview
```

---

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

Para produção:

```env
EXPO_PUBLIC_API_URL=https://filadelfias-api-332378056596.southamerica-east1.run.app
```

---

## 📱 Funcionalidades

### Área Pública (sem login)
- Bíblia Online (múltiplas versões)
- Hinário Novo Cântico
- Manual da IPB
- Download para offline

### Área do Membro (com login)
- Home com acesso rápido
- Diretório de membros (filtros por ofício)
- Pedidos de oração (criar, orar)
- Dízimos e ofertas
- Eventos da igreja
- Missões e missionários
- EBD - Escola Bíblica
- Devocionais
- Perfil

### Área Admin
- Gestão de membros
- Aprovação de dízimos
- Configurações da igreja

---

## 🐛 Debugging

### Logs

O app possui um logger centralizado:

```typescript
import { logger } from '@/lib/logger';

logger.debug({ module: 'Prayer' }, 'Carregando pedidos', { count: 10 });
logger.error({ module: 'API' }, 'Erro na requisição', error);
```

### React Query DevTools

Em desenvolvimento, os dados do React Query podem ser inspecionados via Flipper ou React Native Debugger.

---

## 🏗️ Padrões de Desenvolvimento

### Componentes UI

Use os componentes padronizados em `src/components/ui/`:

```tsx
// ListCard - Para cards de listagem
import { ListCard } from '@/components/ui/ListCard';

<ListCard onPress={() => {}}>
    <Text>Conteúdo do card</Text>
</ListCard>

// Header - Com variantes (default, transparent, gradient)
import { Header } from '@/components/layout/Header';

<Header 
    title="Título" 
    subtitle="Subtítulo opcional"
    showBack 
    showProfile 
    variant="gradient"  // 'default' | 'transparent' | 'gradient'
    large              // Título grande (28px)
/>
```

### Constantes de Tema

Cores e estilos centralizados em `src/constants/theme.ts`:

```tsx
import { FEATURE_COLORS, CATEGORY_COLORS, COMMON_STYLES } from '@/constants/theme';

// Cores de features (blue, purple, red, emerald, orange, indigo, yellow, pink)
const color = FEATURE_COLORS.blue; // { bg, icon, gradient }

// Cores de categorias (health, family, work, spiritual, other)
const category = CATEGORY_COLORS.health; // { bg, text, label }
```

### React Query

Use as query keys padronizadas:

```tsx
import { queryKeys } from '@/lib/queryClient';

// Em vez de strings soltas
useQuery({
    queryKey: queryKeys.prayer(tenantId),
    queryFn: () => prayerService.getAll(tenantId),
});
```

### Tipos

Tipos centralizados em `src/types/`:

```tsx
import { Member, PrayerRequest, Event } from '@/types';
```

### Acessibilidade

Sempre adicione labels de acessibilidade em elementos interativos:

```tsx
<Pressable
    onPress={handlePress}
    accessibilityLabel="Descrição da ação"
    accessibilityRole="button"
    accessibilityState={{ disabled: isDisabled }}
>
    <Icon />
</Pressable>
```

### Estrutura de Features

Para features complexas, organize em pasta própria:

```
src/components/features/prayer/
├── index.ts                 # Exports
├── PrayerRequestCard.tsx    # Componente principal
├── CreatePrayerInput.tsx    # Componente de criação
└── useKeyboardAnimation.ts  # Hook específico
```

---

## 📚 Documentação Relacionada

- [README Principal](../../README.md)
- [Arquitetura](../../docs/architecture.md)
- [Backend README](../backend/README.md)
- [Débitos Técnicos Mobile](../../retrofitmobile.md)
