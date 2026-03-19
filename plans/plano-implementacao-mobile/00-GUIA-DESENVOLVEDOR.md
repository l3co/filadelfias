# 📱 Guia do Desenvolvedor - Filadélfias Mobile

## Visão Geral

Este documento é um guia prático para desenvolvedores **pleno** implementarem o app mobile React Native. Inclui frameworks, metodologias, padrões de código e fluxos de trabalho.

---

## 🎯 Perfil Esperado

**Desenvolvedor Pleno** com conhecimento em:
- React/React Native (intermediário a avançado)
- TypeScript
- REST APIs
- Git/GitHub Flow

**Não é necessário conhecimento prévio em:**
- Expo (será aprendido durante o projeto)
- NativeWind (similar ao TailwindCSS)
- Zustand (mais simples que Redux)

---

## 🛠️ Stack Tecnológica Detalhada

### Framework Principal

| Tecnologia | Versão | Propósito | Documentação |
|------------|--------|-----------|--------------|
| **React Native** | 0.73+ | Framework mobile | [reactnative.dev](https://reactnative.dev) |
| **Expo** | SDK 50+ | Toolchain e APIs nativas | [docs.expo.dev](https://docs.expo.dev) |
| **Expo Router** | v3 | Navegação file-based | [docs.expo.dev/router](https://docs.expo.dev/router/introduction/) |
| **TypeScript** | 5.x | Tipagem estática | [typescriptlang.org](https://www.typescriptlang.org) |

### UI e Estilos

| Tecnologia | Propósito | Por que usar? |
|------------|-----------|---------------|
| **NativeWind** | TailwindCSS para RN | Mesmas classes da web, produtividade |
| **Lucide React Native** | Ícones | Mesmos ícones da versão web |
| **React Native Reanimated** | Animações | Performance nativa |

### Estado e Data Fetching

| Tecnologia | Propósito | Por que usar? |
|------------|-----------|---------------|
| **TanStack Query** | Server state | Cache, refetch, loading states automáticos |
| **Zustand** | Client state | Simples, sem boilerplate, TypeScript nativo |
| **Axios** | HTTP client | Interceptors, mesma API da web |

### Armazenamento

| Tecnologia | Propósito | Quando usar? |
|------------|-----------|--------------|
| **expo-secure-store** | Dados sensíveis | Tokens, credenciais |
| **MMKV** | Dados rápidos | Preferências, cache pequeno |
| **expo-sqlite** | Dados estruturados | Bíblia offline, hinário |

### Formulários e Validação

| Tecnologia | Propósito |
|------------|-----------|
| **React Hook Form** | Gerenciamento de formulários |
| **Zod** | Validação de schemas |
| **@hookform/resolvers** | Integração RHF + Zod |

---

## 📐 Metodologia de Desenvolvimento

### 1. Git Flow Simplificado

```
main (produção)
  └── develop (desenvolvimento)
       ├── feature/nome-da-feature
       ├── fix/nome-do-bug
       └── chore/nome-da-tarefa
```

**Convenção de Commits (Conventional Commits):**
```bash
feat(auth): add login screen
fix(bible): fix chapter navigation
chore(deps): update expo sdk
docs(readme): add setup instructions
refactor(api): extract axios interceptors
test(auth): add login tests
```

### 2. Fluxo de Trabalho por Feature

```
1. Criar branch: git checkout -b feature/nome-feature
2. Implementar feature seguindo os padrões
3. Testar localmente (iOS + Android)
4. Criar PR com descrição detalhada
5. Code review
6. Merge para develop
```

### 3. Ciclo de Desenvolvimento

```
┌─────────────────────────────────────────────────────────────┐
│  1. ANÁLISE                                                  │
│     - Ler documento da fase correspondente                   │
│     - Identificar componentes necessários                    │
│     - Verificar se service existe na web                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. SETUP                                                    │
│     - Criar arquivos de rota (app/)                         │
│     - Copiar/adaptar service da web                         │
│     - Criar tipos se necessário                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. IMPLEMENTAÇÃO                                            │
│     - Criar componentes UI                                   │
│     - Implementar lógica com hooks                          │
│     - Conectar com API via TanStack Query                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  4. TESTES                                                   │
│     - Testar no iOS Simulator                               │
│     - Testar no Android Emulator                            │
│     - Testar estados: loading, error, empty, success        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  5. REFINAMENTO                                              │
│     - Ajustar UI/UX                                         │
│     - Otimizar performance se necessário                    │
│     - Documentar decisões importantes                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Padrões de Código

### Estrutura de Arquivos

```
src/
├── components/
│   ├── ui/              # Componentes base (Button, Card, Input)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── index.ts     # Re-exporta tudo
│   ├── layout/          # Layouts (Header, TabBar)
│   └── features/        # Componentes de domínio (MemberCard, EventCard)
├── hooks/
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   └── queries/         # Hooks de TanStack Query por domínio
│       ├── useMembers.ts
│       ├── useEvents.ts
│       └── useTithes.ts
├── services/            # Chamadas de API
├── stores/              # Zustand stores
├── types/               # TypeScript types/interfaces
├── lib/                 # Utilitários
└── constants/           # Constantes e configurações
```

### Padrão de Componente

```tsx
// src/components/features/MemberCard.tsx

// 1. Imports externos
import { View, Text, Pressable } from 'react-native';
import { User, Mail, Phone } from 'lucide-react-native';

// 2. Imports internos
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { colors } from '@/constants/colors';

// 3. Types/Interfaces
interface MemberCardProps {
  member: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
  };
  onPress?: () => void;
  variant?: 'default' | 'compact';
}

// 4. Componente
export function MemberCard({ 
  member, 
  onPress, 
  variant = 'default' 
}: MemberCardProps) {
  const isCompact = variant === 'compact';

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'bg-white rounded-2xl border border-slate-100',
        'active:scale-[0.98] active:opacity-90',
        isCompact ? 'p-3' : 'p-4'
      )}
    >
      <View className="flex-row items-center">
        <Avatar name={member.full_name} size={isCompact ? 'sm' : 'md'} />
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-slate-900">
            {member.full_name}
          </Text>
          {!isCompact && member.email && (
            <View className="flex-row items-center mt-1">
              <Mail size={14} color={colors.slate[400]} />
              <Text className="text-sm text-slate-500 ml-1">
                {member.email}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
```

### Padrão de Hook com TanStack Query

```tsx
// src/hooks/queries/useMembers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersService } from '@/services/members';
import { useAuthStore } from '@/stores/authStore';
import type { Member, CreateMemberDTO } from '@/types/members';

// Query keys centralizadas
export const memberKeys = {
  all: ['members'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (tenantId: string) => [...memberKeys.lists(), tenantId] as const,
  details: () => [...memberKeys.all, 'detail'] as const,
  detail: (tenantId: string, id: string) => [...memberKeys.details(), tenantId, id] as const,
};

// Hook de listagem
export function useMembers() {
  const { getCurrentTenant } = useAuthStore();
  const tenant = getCurrentTenant();

  return useQuery({
    queryKey: memberKeys.list(tenant?.id || ''),
    queryFn: () => membersService.getAll(tenant!.id),
    enabled: !!tenant?.id,
  });
}

// Hook de detalhes
export function useMember(id: string) {
  const { getCurrentTenant } = useAuthStore();
  const tenant = getCurrentTenant();

  return useQuery({
    queryKey: memberKeys.detail(tenant?.id || '', id),
    queryFn: () => membersService.getById(tenant!.id, id),
    enabled: !!tenant?.id && !!id,
  });
}

// Hook de mutação
export function useCreateMember() {
  const queryClient = useQueryClient();
  const { getCurrentTenant } = useAuthStore();
  const tenant = getCurrentTenant();

  return useMutation({
    mutationFn: (data: CreateMemberDTO) => 
      membersService.create(tenant!.id, data),
    onSuccess: () => {
      // Invalida a lista para refetch
      queryClient.invalidateQueries({ 
        queryKey: memberKeys.lists() 
      });
    },
  });
}
```

### Padrão de Tela (Screen)

```tsx
// app/(member)/members.tsx

import { View, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';

// Componentes
import { Header } from '@/components/layout/Header';
import { MemberCard } from '@/components/features/MemberCard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

// Hooks
import { useMembers } from '@/hooks/queries/useMembers';

// Ícones
import { Users } from 'lucide-react-native';

export default function MembersScreen() {
  const router = useRouter();
  const { data: members, isLoading, error, refetch, isRefetching } = useMembers();

  // Estado: Loading
  if (isLoading) {
    return <LoadingScreen message="Carregando membros..." />;
  }

  // Estado: Error
  if (error) {
    return (
      <ErrorState 
        message="Erro ao carregar membros" 
        onRetry={refetch} 
      />
    );
  }

  // Estado: Empty
  if (!members?.length) {
    return (
      <View className="flex-1 bg-slate-50">
        <Header title="Membros" />
        <EmptyState
          icon={Users}
          title="Nenhum membro"
          description="Os membros da igreja aparecerão aqui."
        />
      </View>
    );
  }

  // Estado: Success
  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Membros" showSearch />
      
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MemberCard
            member={item}
            onPress={() => router.push(`/(member)/members/${item.id}`)}
          />
        )}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        }
      />
    </View>
  );
}
```

---

## 🔄 Reutilização de Código da Web

### O que copiar diretamente

| Arquivo Web | Arquivo Mobile | Ajustes |
|-------------|----------------|---------|
| `services/*.ts` | `services/*.ts` | Trocar import do `api` |
| `types/*.ts` | `types/*.ts` | Nenhum |
| `lib/utils.ts` | `lib/utils.ts` | Remover funções DOM-specific |

### O que adaptar

| Conceito Web | Equivalente Mobile |
|--------------|-------------------|
| `localStorage` | `MMKV` ou `AsyncStorage` |
| `sessionStorage` | `MMKV` |
| Cookies | `expo-secure-store` |
| `window.location` | `expo-router` navigation |
| `fetch` | `axios` (já usado na web) |
| CSS/TailwindCSS | NativeWind (mesmas classes) |

### Exemplo de Adaptação de Service

```typescript
// WEB: apps/web/src/services/members.ts
import { api } from '../lib/api';  // ← Diferente

export const membersService = {
  getAll: (tenantId: string) => 
    api.get(`/members?tenant_id=${tenantId}`).then(r => r.data),
  // ...
};

// MOBILE: apps/mobile/src/services/members.ts
import { api } from '@/services/api';  // ← Ajustar apenas isso

export const membersService = {
  getAll: (tenantId: string) => 
    api.get(`/members?tenant_id=${tenantId}`).then(r => r.data),
  // ... resto igual
};
```

---

## 📋 Checklist por Tela

Use este checklist ao implementar cada tela:

### Antes de Começar
- [ ] Li o documento da fase correspondente
- [ ] Identifiquei os endpoints necessários em `12-API-MAPPING.md`
- [ ] Verifiquei se o service existe na web para copiar
- [ ] Criei a branch `feature/nome-tela`

### Implementação
- [ ] Criei o arquivo de rota em `app/`
- [ ] Copiei/criei o service necessário
- [ ] Criei o hook de query (se necessário)
- [ ] Implementei os 4 estados: loading, error, empty, success
- [ ] Usei componentes UI existentes (Button, Card, etc)
- [ ] Segui o padrão de nomenclatura

### Testes
- [ ] Testei no iOS Simulator
- [ ] Testei no Android Emulator
- [ ] Testei com dados reais da API
- [ ] Testei offline (se aplicável)
- [ ] Testei pull-to-refresh

### Finalização
- [ ] Código sem warnings do TypeScript
- [ ] Código sem warnings do ESLint
- [ ] Commit com mensagem seguindo Conventional Commits
- [ ] PR criado com descrição

---

## 🚨 Armadilhas Comuns

### 1. Esquecer de habilitar a query

```tsx
// ❌ ERRADO - query roda mesmo sem tenant
const { data } = useQuery({
  queryKey: ['members', tenant?.id],
  queryFn: () => membersService.getAll(tenant?.id),
});

// ✅ CORRETO - query só roda quando tenant existe
const { data } = useQuery({
  queryKey: ['members', tenant?.id],
  queryFn: () => membersService.getAll(tenant!.id),
  enabled: !!tenant?.id,  // ← Importante!
});
```

### 2. Não tratar todos os estados

```tsx
// ❌ ERRADO - só trata sucesso
function MembersScreen() {
  const { data } = useMembers();
  return <FlatList data={data} ... />;
}

// ✅ CORRETO - trata loading, error, empty, success
function MembersScreen() {
  const { data, isLoading, error } = useMembers();
  
  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorState />;
  if (!data?.length) return <EmptyState />;
  
  return <FlatList data={data} ... />;
}
```

### 3. Usar View onde deveria usar Pressable

```tsx
// ❌ ERRADO - View não é clicável
<View onPress={handlePress}>
  <Text>Clique aqui</Text>
</View>

// ✅ CORRETO - Pressable para elementos clicáveis
<Pressable onPress={handlePress}>
  <Text>Clique aqui</Text>
</Pressable>
```

### 4. Esquecer de invalidar queries após mutação

```tsx
// ❌ ERRADO - lista não atualiza após criar
const createMutation = useMutation({
  mutationFn: (data) => membersService.create(tenantId, data),
});

// ✅ CORRETO - invalida lista para refetch
const createMutation = useMutation({
  mutationFn: (data) => membersService.create(tenantId, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['members'] });
  },
});
```

---

## 📚 Recursos de Aprendizado

### Documentação Oficial
- [Expo Docs](https://docs.expo.dev) - Referência principal
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [NativeWind Docs](https://www.nativewind.dev)

### Cursos Recomendados
- [Rocketseat - React Native](https://www.rocketseat.com.br) (pt-BR)
- [Expo Tutorial](https://docs.expo.dev/tutorial/introduction/)

### Comunidade
- [Expo Discord](https://chat.expo.dev)
- [React Native Community](https://github.com/react-native-community)

---

## 🗓️ Cronograma Sugerido

### Semana 1-2: Setup e Fundamentos
- Setup do projeto
- Design System (componentes base)
- Área pública (Bíblia, Hinário, Manual)

### Semana 3: Autenticação
- Login/Logout
- Proteção de rotas
- Persistência de sessão

### Semana 4-5: Portal do Membro
- Dashboard
- Devocionais
- Pedidos de Oração
- Diretório
- Eventos
- **Meus Dízimos** (novo)
- **Minhas Despesas** (novo)
- **Governança** (novo)

### Semana 6-7: Área Administrativa
- Dashboard Admin
- Gestão de Membros
- Tesouraria (com aprovações)
- Governança

### Semana 8: Offline e Notificações
- Download de conteúdo
- Push notifications

### Semana 9-10: Testes e Deploy
- Testes em dispositivos reais
- Build de produção
- Publicação nas lojas

---

## 📞 Suporte

### Dúvidas Técnicas
1. Consulte a documentação oficial primeiro
2. Busque no código da versão web (muita coisa é igual)
3. Pergunte no canal do projeto

### Bloqueios
Se estiver bloqueado por mais de 2 horas:
1. Documente o problema
2. Liste o que já tentou
3. Peça ajuda com contexto

---

## ✅ Definition of Done

Uma feature está **pronta** quando:

1. **Funciona** em iOS e Android
2. **Trata** todos os estados (loading, error, empty, success)
3. **Segue** os padrões de código do projeto
4. **Não tem** warnings de TypeScript ou ESLint
5. **Está** commitada com mensagem adequada
6. **Foi** testada com dados reais da API
