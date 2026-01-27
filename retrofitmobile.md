# Relatório de Débitos Técnicos - Mobile App

**Data:** 27/01/2026  
**Projeto:** Filadélfias Mobile (React Native / Expo)  
**Análise por:** Engenheiro de Software Especialista

---

## Sumário Executivo

O projeto mobile apresenta uma estrutura razoável, mas possui débitos técnicos significativos que impactam manutenibilidade, escalabilidade e consistência. Os principais problemas identificados são: **componentes duplicados**, **telas monolíticas**, **inconsistência de estilos** e **falta de abstração em padrões repetitivos**.

---

## 1. Componentes Duplicados

### 1.1 Telas de Hinário Duplicadas (CRÍTICO)

**Arquivos:**
- `app/(member)/hymnal.tsx` (154 linhas)
- `app/(public)/hymnal/index.tsx` (156 linhas)

**Problema:** Código praticamente idêntico (~98% igual). A única diferença é o tratamento de `insets.top`.

**Impacto:** Qualquer correção ou melhoria precisa ser feita em dois lugares.

**Solução:**
```tsx
// Criar componente compartilhado
// src/components/features/HymnalList.tsx
export function HymnalList({ showSafeArea = true }: { showSafeArea?: boolean }) {
    // Lógica compartilhada
}

// Uso em app/(member)/hymnal.tsx
export default function HymnalScreen() {
    return <HymnalList showSafeArea={false} />;
}
```

**Esforço:** 2h | **Prioridade:** Alta

---

### 1.2 Padrão de Card Repetido em Todas as Telas

**Arquivos afetados:**
- `prayer.tsx` - Card de pedido de oração (linhas 167-285)
- `directory.tsx` - Card de membro (linhas 66-128)
- `events.tsx` - Card de evento (linhas 27-83)
- `missions.tsx` - Card de missionário (linhas 27-68)
- `devotionals.tsx` - Card de devocional (linhas 28-70)
- `tithes.tsx` - Card de registro (linhas 69-103)
- `ebd.tsx` - Card de turma (linhas 35-63)

**Problema:** Cada tela implementa seu próprio card com estilos inline repetidos:
```tsx
// Repetido em TODAS as telas
style={{
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
}}
```

**Solução:**
```tsx
// src/components/ui/ListCard.tsx
interface ListCardProps {
    children: React.ReactNode;
    onPress?: () => void;
}

export function ListCard({ children, onPress }: ListCardProps) {
    const Component = onPress ? Pressable : View;
    return (
        <Component 
            onPress={onPress}
            style={styles.card}
        >
            {children}
        </Component>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    }
});
```

**Esforço:** 4h | **Prioridade:** Alta

---

### 1.3 Header Customizado vs Componente Header

**Problema:** Algumas telas usam o componente `<Header />`, outras implementam header inline.

| Tela | Usa `<Header />` | Header Inline |
|------|------------------|---------------|
| directory.tsx | ✅ | |
| missions.tsx | ✅ | |
| ebd.tsx | ✅ | |
| tithes.tsx | ✅ | |
| prayer.tsx | | ✅ (custom) |
| events.tsx | | ✅ (custom) |
| devotionals.tsx | | ✅ (custom) |
| index.tsx | | ✅ (gradient) |

**Solução:** Estender o componente `Header` para suportar variantes:
```tsx
interface HeaderProps {
    variant?: 'default' | 'transparent' | 'gradient';
    subtitle?: string;
    // ...
}
```

**Esforço:** 3h | **Prioridade:** Média

---

## 2. Code Smells

### 2.1 Telas Monolíticas (God Components)

**Arquivo:** `app/(member)/prayer.tsx` - **516 linhas**

**Problemas:**
- Componente único com toda a lógica
- `renderRequest` definido dentro do componente (recriado a cada render)
- Lógica de teclado misturada com lógica de negócio
- Modal de criação inline

**Refatoração sugerida:**
```
prayer/
├── index.tsx              # Tela principal (orquestração)
├── PrayerRequestCard.tsx  # Card individual
├── CreatePrayerModal.tsx  # Modal de criação
├── usePrayerRequests.ts   # Hook com lógica de dados
└── useKeyboardAnimation.ts # Hook para animação de teclado
```

**Esforço:** 6h | **Prioridade:** Alta

---

### 2.2 Arquivo `tithes.tsx` - 241 linhas com Modal Inline

**Problema:** Modal de criação de registro está inline na tela principal.

**Solução:** Extrair para `CreateTitheModal.tsx`

**Esforço:** 2h | **Prioridade:** Média

---

### 2.3 Constantes de Cores Hardcoded

**Problema:** Cores definidas inline em múltiplos arquivos:

```tsx
// prayer.tsx
const CATEGORY_LABELS = {
    health: { label: 'Saúde', bg: '#fef2f2', text: '#b91c1c' },
    // ...
};

// index.tsx (member)
const FEATURE_COLORS = {
    blue: { bg: '#eff6ff', icon: '#3b82f6' },
    // ...
};

// HomeCard.tsx
const colorMap = {
    blue: { bg: 'bg-blue-50', icon: '#3b82f6', gradient: ['#3b82f6', '#2563eb'] },
    // ...
};
```

**Solução:** Centralizar em `src/constants/theme.ts`:
```tsx
export const THEME = {
    colors: {
        categories: {
            health: { bg: '#fef2f2', text: '#b91c1c' },
            // ...
        },
        features: {
            blue: { bg: '#eff6ff', icon: '#3b82f6' },
            // ...
        }
    }
};
```

**Esforço:** 3h | **Prioridade:** Média

---

### 2.4 Função `formatRelativeDate` Duplicada

**Arquivos:**
- `prayer.tsx` (linhas 23-34)

**Problema:** Função utilitária definida localmente. Deveria estar em `src/lib/utils.ts`.

**Esforço:** 30min | **Prioridade:** Baixa

---

## 3. Violações de Princípios SOLID

### 3.1 Single Responsibility Principle (SRP)

| Arquivo | Responsabilidades Misturadas |
|---------|------------------------------|
| `prayer.tsx` | UI + Lógica de teclado + Mutations + Formatação |
| `_layout.tsx` (root) | Autenticação + Navegação + Providers |
| `authStore.ts` | Estado + API calls + Storage |

**Solução para authStore:**
```tsx
// Separar em:
// src/services/auth.ts - API calls
// src/stores/authStore.ts - Estado apenas
// src/lib/secureStorage.ts - Storage (já existe)
```

---

### 3.2 Open/Closed Principle (OCP)

**Problema:** O componente `Button` usa condicionais para variantes:
```tsx
if (variant === 'primary') {
    return (/* JSX específico */);
}
// else...
```

**Solução:** Usar composição ou strategy pattern para variantes.

---

### 3.3 Dependency Inversion Principle (DIP)

**Problema:** Serviços dependem diretamente de `axios` e `SecureStore`:
```tsx
// api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
```

**Solução:** Criar abstrações para facilitar testes:
```tsx
// src/lib/httpClient.ts
export interface HttpClient {
    get<T>(url: string, config?: any): Promise<T>;
    post<T>(url: string, data?: any, config?: any): Promise<T>;
}

// src/lib/axiosClient.ts
export const axiosClient: HttpClient = { /* implementação */ };
```

**Esforço:** 4h | **Prioridade:** Baixa (para testes futuros)

---

## 4. Inconsistências de Estilo

### 4.1 Mistura de NativeWind (className) e StyleSheet/Inline

**Exemplo em `directory.tsx`:**
```tsx
<View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
    <View 
        style={{ 
            width: 56, 
            height: 56, 
            borderRadius: 14, 
            backgroundColor: theme.gradient[0],
        }}
    >
```

**Recomendação:** Definir padrão único. Sugestão: usar NativeWind para layout e `style` apenas para valores dinâmicos.

---

### 4.2 Componente `Card` vs `HomeCard` vs Cards Inline

**Arquivos:**
- `src/components/ui/Card.tsx` - Componente genérico (não usado)
- `src/components/ui/HomeCard.tsx` - Card específico para home
- Cards inline em cada tela

**Problema:** `Card.tsx` existe mas não é utilizado. Cada tela cria seu próprio card.

**Esforço:** 2h | **Prioridade:** Média

---

## 5. Tipagem TypeScript

### 5.1 Tipos Incompletos nos Serviços

**Arquivo:** `src/services/events.ts`
```tsx
export interface Event {
    id: string;
    title: string;
    description?: string;
    date: string;
    time?: string;
    location?: string;
}
```

**Problema:** Faltam campos que provavelmente existem no backend (created_at, updated_at, tenant_id, etc.)

**Solução:** Sincronizar tipos com schemas do backend ou usar geração automática.

---

### 5.2 Uso de `any` Implícito

**Arquivo:** `app/(member)/index.tsx`
```tsx
router.push(feature.href as any)
```

**Solução:** Tipar corretamente as rotas com `expo-router`:
```tsx
import { Href } from 'expo-router';
href: Href;
```

---

### 5.3 Pasta `types/` Vazia

**Problema:** Existe `src/types/` mas está vazia. Tipos estão espalhados nos serviços.

**Solução:** Centralizar tipos compartilhados:
```
src/types/
├── index.ts
├── member.types.ts
├── prayer.types.ts
├── event.types.ts
└── api.types.ts
```

**Esforço:** 3h | **Prioridade:** Média

---

## 6. Gerenciamento de Estado

### 6.1 Stores Subutilizadas

**Stores existentes:**
- `authStore.ts` - Bem utilizada
- `downloadStore.ts` - Bem utilizada

**Problema:** Não há store para:
- Preferências do usuário (tema, fonte da Bíblia)
- Cache de dados frequentes
- Estado de UI global (modais, toasts)

**Solução:** Considerar criar:
```tsx
// src/stores/preferencesStore.ts
// src/stores/uiStore.ts
```

---

### 6.2 React Query sem Configuração de Cache Otimizada

**Arquivo:** `src/lib/queryClient.ts`
```tsx
export const queryClient = new QueryClient();
```

**Problema:** Usando configurações padrão. Não há:
- `staleTime` configurado por tipo de dado
- `gcTime` otimizado
- Retry strategy

**Solução:**
```tsx
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos
            gcTime: 1000 * 60 * 30, // 30 minutos
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});
```

**Esforço:** 1h | **Prioridade:** Média

---

## 7. Serviços e API

### 7.1 Inconsistência no Padrão de URL

**Problema:**
```tsx
// Alguns usam path param
api.get(`/tenants/${tenantId}/members`)

// Outros usam query param
api.get(`/prayer/requests`, { params: { tenant_id: tenantId } })
```

**Recomendação:** Padronizar com o backend. Idealmente usar um padrão consistente.

---

### 7.2 Tratamento de Erro Inconsistente

**Arquivo:** `src/services/prayer.ts` - Tem logging
**Arquivo:** `src/services/events.ts` - Não tem logging

**Solução:** Criar wrapper para chamadas de API:
```tsx
// src/lib/apiWrapper.ts
export async function apiCall<T>(
    fn: () => Promise<T>,
    context: { module: string; method: string }
): Promise<T> {
    logger.apiRequest(context.module, context.method, '...');
    try {
        const result = await fn();
        logger.apiResponse(context.module, context.method, 200, result);
        return result;
    } catch (error) {
        logger.apiError(context.module, context.method, error);
        throw error;
    }
}
```

**Esforço:** 2h | **Prioridade:** Baixa

---

## 8. Performance

### 8.1 Funções Definidas Dentro de Componentes

**Problema:** `renderItem` definido dentro do componente é recriado a cada render:
```tsx
export default function PrayerScreen() {
    // ...
    const renderRequest = ({ item }) => ( /* ... */ ); // Recriado sempre!
    
    return <FlatList renderItem={renderRequest} />;
}
```

**Solução:** Extrair para componente separado ou usar `useCallback`:
```tsx
const renderRequest = useCallback(({ item }) => (
    <PrayerRequestCard item={item} />
), [/* deps */]);
```

---

### 8.2 Falta de Memoização

**Problema:** Componentes de lista não usam `React.memo`:
```tsx
// Deveria ser:
export const PrayerRequestCard = React.memo(function PrayerRequestCard({ item }) {
    // ...
});
```

---

## 9. Acessibilidade

### 9.1 Falta de Labels de Acessibilidade

**Problema:** Botões e elementos interativos sem `accessibilityLabel`:
```tsx
<Pressable onPress={handleOpenInput}>
    <Plus size={22} color="#10b981" />
</Pressable>
```

**Solução:**
```tsx
<Pressable 
    onPress={handleOpenInput}
    accessibilityLabel="Criar novo pedido de oração"
    accessibilityRole="button"
>
```

---

## 10. Testes

### 10.1 Ausência de Testes

**Problema:** Não há arquivos de teste no projeto mobile.

**Recomendação:** Adicionar pelo menos:
- Testes unitários para hooks customizados
- Testes de snapshot para componentes UI
- Testes de integração para fluxos críticos (login, criar pedido)

---

## Matriz de Priorização

| Item | Impacto | Esforço | Prioridade |
|------|---------|---------|------------|
| Extrair componente HymnalList | Alto | 2h | 🔴 Alta |
| Criar ListCard genérico | Alto | 4h | 🔴 Alta |
| Refatorar prayer.tsx | Alto | 6h | 🔴 Alta |
| Centralizar constantes de cores | Médio | 3h | 🟡 Média |
| Padronizar uso de Header | Médio | 3h | 🟡 Média |
| Organizar pasta types/ | Médio | 3h | 🟡 Média |
| Configurar React Query | Médio | 1h | 🟡 Média |
| Extrair CreateTitheModal | Baixo | 2h | 🟢 Baixa |
| Abstrair HttpClient | Baixo | 4h | 🟢 Baixa |
| Adicionar acessibilidade | Médio | 4h | 🟡 Média |

---

## Plano de Ação Sugerido

### Sprint 1 (Semana 1-2)
1. ✅ Criar `ListCard` genérico e aplicar em todas as telas
2. ✅ Extrair `HymnalList` compartilhado
3. ✅ Mover `formatRelativeDate` para utils

### Sprint 2 (Semana 3-4)
1. ✅ Refatorar `prayer.tsx` em componentes menores
2. ✅ Extrair `CreateTitheModal`
3. ✅ Centralizar constantes de cores/tema

### Sprint 3 (Semana 5-6)
1. ✅ Padronizar Header com variantes
2. ✅ Organizar pasta `types/`
3. ✅ Configurar React Query otimizado

### Sprint 4 (Semana 7-8)
1. ✅ Adicionar labels de acessibilidade
2. ✅ Implementar testes básicos
3. ✅ Documentar padrões no README

---

## Conclusão

O projeto tem uma base sólida com boas escolhas tecnológicas (Expo, React Query, Zustand, NativeWind). Os principais débitos são relacionados a **duplicação de código** e **componentes monolíticos**. 

A refatoração sugerida pode ser feita incrementalmente sem impactar funcionalidades existentes. O esforço total estimado é de **~40 horas** para resolver os itens de alta e média prioridade.

**Recomendação principal:** Começar pela criação do `ListCard` genérico, pois impacta positivamente todas as telas de listagem e estabelece um padrão para o futuro.
