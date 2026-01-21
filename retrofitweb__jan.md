# Retrofit Web - Análise e Planejamento
**Data:** Janeiro 2026  
**Módulo:** `apps/web`  
**Stack:** React 19 + TypeScript + Vite + TailwindCSS 4 + TanStack Query

---

## 1. Visão Geral da Arquitetura Atual

### 1.1 Estrutura de Diretórios
```
src/
├── App.tsx                    # Roteamento principal
├── main.tsx                   # Entry point + providers
├── components/
│   ├── ui/                    # Componentes base (shadcn/ui style)
│   ├── layout/                # DashboardLayout, PublicLayout
│   └── ProtectedRoute.tsx     # Guard de autenticação
├── features/                  # Feature-based modules
│   ├── members/
│   ├── financial/
│   ├── ebd/
│   ├── governance/
│   ├── missions/
│   └── bible/
├── hooks/                     # Hooks globais
├── services/                  # API services
├── routes/                    # Page components
├── lib/                       # Utilities (api, utils)
└── types.ts                   # Types globais
```

### 1.2 Pontos Positivos Identificados
- ✅ **Feature-based architecture** bem estruturada
- ✅ **TanStack Query** para server state management
- ✅ **Componentes UI** baseados em Radix UI (acessibilidade)
- ✅ **TypeScript** com tipagem consistente
- ✅ **Hooks customizados** por feature (useMembers, useFinancial, etc.)
- ✅ **Tailwind CSS 4** com design system customizado

---

## 2. Gaps e Problemas Identificados

### 2.1 🔴 Críticos

#### 2.1.1 Duplicação de Código em Dialogs
**Problema:** `CreateMemberDialog.tsx` (377 linhas) e `EditMemberDialog.tsx` (448 linhas) compartilham ~80% do código.

**Arquivos afetados:**
- `src/features/members/components/CreateMemberDialog.tsx`
- `src/features/members/components/EditMemberDialog.tsx`

**Solução proposta:**
```tsx
// Criar: src/features/members/components/MemberForm.tsx
// Componente de formulário reutilizável

// Criar: src/features/members/components/MemberDialog.tsx
// Dialog wrapper que usa MemberForm para Create/Edit
```

#### 2.1.2 Componentes UI Duplicados (Modal vs Dialog)
**Problema:** Existem dois componentes para modais: `Modal.tsx` (custom) e `dialog.tsx` (Radix).

**Arquivos afetados:**
- `src/components/ui/Modal.tsx` - Implementação custom
- `src/components/ui/dialog.tsx` - Radix UI Dialog

**Solução:** Deprecar `Modal.tsx` e usar apenas `dialog.tsx` em toda a aplicação.

#### 2.1.3 Tipos Dispersos
**Problema:** Tipos definidos em múltiplos lugares sem centralização.

**Locais identificados:**
- `src/types.ts` - Tipos globais (Member, User, Tenant)
- `src/services/financial.ts` - Transaction, FinancialAccount, etc.
- `src/services/ebd.ts` - EBDClass, EBDStudent, EBDLesson
- `src/services/governance.ts` - Council, Meeting
- `src/services/missions.ts` - Missionary

**Solução proposta:**
```
src/types/
├── index.ts           # Re-exports
├── auth.types.ts      # User, Tenant, UserMembership
├── members.types.ts   # Member, MemberCreateData
├── financial.types.ts # Transaction, Account, Category
├── ebd.types.ts       # EBDClass, EBDStudent, EBDLesson
├── governance.types.ts
└── missions.types.ts
```

### 2.2 🟠 Importantes

#### 2.2.1 Falta de Error Boundaries
**Problema:** Não há Error Boundaries para capturar erros de renderização.

**Solução:**
```tsx
// Criar: src/components/ErrorBoundary.tsx
// Criar: src/components/ErrorFallback.tsx
```

#### 2.2.2 Loading States Inconsistentes
**Problema:** Diferentes padrões de loading em cada componente.

**Exemplos:**
- `MembersTable.tsx` - Skeleton com animação pulse
- `CouncilList.tsx` - Texto simples "Carregando..."
- `DashboardLayout.tsx` - Spinner customizado

**Solução:** Criar componentes de loading padronizados:
```tsx
// src/components/ui/skeleton.tsx
// src/components/ui/spinner.tsx
// src/components/LoadingState.tsx (wrapper genérico)
```

#### 2.2.3 Falta de Componente Select Padronizado
**Problema:** `<select>` nativo usado diretamente com classes inline em formulários.

**Arquivos afetados:**
- `CreateMemberDialog.tsx` - 6 instâncias de `<select>`
- `EditMemberDialog.tsx` - 6 instâncias de `<select>`
- `TransactionForm.tsx`

**Solução:** Criar `src/components/ui/select.tsx` usando Radix Select (já instalado: `@radix-ui/react-select`).

#### 2.2.4 Constantes Hardcoded
**Problema:** Options de select e constantes repetidas em múltiplos arquivos.

**Exemplo - FUNCTIONS_OPTIONS:**
```tsx
// Duplicado em CreateMemberDialog.tsx e EditMemberDialog.tsx
const FUNCTIONS_OPTIONS = [
    { value: 'TESOUREIRO', label: 'Tesoureiro' },
    { value: 'SECRETARIO', label: 'Secretário' },
    ...
];
```

**Solução:**
```
src/constants/
├── index.ts
├── member.constants.ts    # Status, Office, Functions
├── financial.constants.ts # Transaction types, Categories
└── governance.constants.ts
```

### 2.3 🟡 Melhorias

#### 2.3.1 Query Keys Não Centralizadas
**Problema:** Query keys definidas em cada hook sem padronização.

**Atual:**
```tsx
// useMembers.ts
export const MEMBERS_QUERY_KEY = 'members';

// useFinancial.ts
queryKey: ['financial-accounts', tenantId]

// useGovernance.ts
export const COUNCILS_KEY = 'councils';
```

**Solução:**
```tsx
// src/lib/queryKeys.ts
export const queryKeys = {
  members: {
    all: (tenantId: string) => ['members', tenantId] as const,
    detail: (tenantId: string, id: string) => ['members', tenantId, id] as const,
  },
  financial: {
    accounts: (tenantId: string) => ['financial', 'accounts', tenantId] as const,
    transactions: (tenantId: string) => ['financial', 'transactions', tenantId] as const,
    categories: (tenantId: string) => ['financial', 'categories', tenantId] as const,
  },
  // ...
};
```

#### 2.3.2 Formulários Sem Validação Robusta
**Problema:** Validação básica com react-hook-form, sem schema validation.

**Solução:** Integrar Zod para validação de schemas:
```bash
npm install zod @hookform/resolvers
```

```tsx
// src/features/members/schemas/member.schema.ts
import { z } from 'zod';

export const memberSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  // ...
});
```

#### 2.3.3 Ausência de Testes em Componentes Críticos
**Problema:** Cobertura de testes baixa em componentes de feature.

**Estado atual:**
- `MembersTable.test.tsx` ✅
- `TransactionForm.test.tsx` ✅
- `ClassList.test.tsx` ✅
- `CouncilList.test.tsx` ✅
- `MissionaryList.test.tsx` ✅
- `CreateMemberDialog.tsx` ❌
- `EditMemberDialog.tsx` ❌
- `DashboardLayout.tsx` ❌
- `HomePage.tsx` ❌

#### 2.3.4 HomePage com Dados Mockados
**Problema:** Dashboard mostra dados estáticos, não reflete dados reais.

```tsx
// src/routes/HomePage.tsx
const stats = [
    { name: 'Membros Ativos', value: '127', ... }, // Hardcoded!
    { name: 'Saldo Atual', value: 'R$ 12.450', ... },
    ...
];
```

**Solução:** Criar hook `useDashboardStats()` que agrega dados reais.

---

## 3. Oportunidades de Reutilização

### 3.1 Componentes Genéricos a Criar

| Componente | Descrição | Reuso |
|------------|-----------|-------|
| `PageHeader` | Header padrão de páginas com título, descrição e ações | 8+ páginas |
| `EmptyState` | Estado vazio com ícone, título e descrição | 6+ features |
| `DataTable` | Tabela genérica com sorting, filtering | Members, Transactions, etc. |
| `FormField` | Wrapper para campo de formulário com label e erro | 30+ campos |
| `ConfirmDialog` | Dialog de confirmação reutilizável | Delete actions |
| `StatCard` | Card de estatística para dashboards | HomePage, TreasuryPage |

### 3.2 Hooks Genéricos a Criar

| Hook | Descrição |
|------|-----------|
| `usePagination` | Paginação client-side |
| `useSearch` | Debounced search input |
| `useConfirmation` | State para dialogs de confirmação |
| `useFormPersist` | Persistir form state em localStorage |

---

## 4. Gaps de Performance

### 4.1 Bundle Size
**Análise necessária:** Executar `npm run build` e analisar chunks.

**Otimizações recomendadas:**
- [ ] Lazy loading de rotas com `React.lazy()`
- [ ] Code splitting por feature
- [ ] Análise de dependências não utilizadas

### 4.2 Re-renders Desnecessários
**Problema identificado:** `DashboardLayout` re-renderiza em cada navegação.

**Solução:** Memoização estratégica:
```tsx
// Memoizar navigation items
const MemoizedNavItem = React.memo(NavItem);

// Usar useMemo para listas estáticas
const navigationItems = useMemo(() => [...], []);
```

### 4.3 Imagens e Assets
**Verificar:**
- [ ] Lazy loading de imagens
- [ ] Formato WebP para imagens
- [ ] Sprites para ícones frequentes

---

## 5. Plano de Retrofit

### Fase 1: Fundação (Semana 1-2)
**Objetivo:** Estabelecer padrões e estrutura base.

| # | Tarefa | Prioridade | Esforço |
|---|--------|------------|---------|
| 1.1 | Criar estrutura `src/types/` e migrar tipos | Alta | 4h |
| 1.2 | Criar `src/constants/` com constantes centralizadas | Alta | 2h |
| 1.3 | Criar `src/lib/queryKeys.ts` | Média | 2h |
| 1.4 | Deprecar `Modal.tsx`, usar apenas `dialog.tsx` | Alta | 3h |
| 1.5 | Criar componente `Select` com Radix | Alta | 3h |
| 1.6 | Criar componentes de loading padronizados | Média | 2h |

### Fase 2: Componentes Reutilizáveis (Semana 2-3)
**Objetivo:** Criar biblioteca de componentes genéricos.

| # | Tarefa | Prioridade | Esforço |
|---|--------|------------|---------|
| 2.1 | Criar `PageHeader` component | Alta | 2h |
| 2.2 | Criar `EmptyState` component | Alta | 1h |
| 2.3 | Criar `FormField` wrapper | Alta | 2h |
| 2.4 | Criar `ConfirmDialog` component | Média | 2h |
| 2.5 | Criar `StatCard` component | Média | 1h |
| 2.6 | Criar `DataTable` genérico | Baixa | 6h |

### Fase 3: Refatoração de Features (Semana 3-4)
**Objetivo:** Aplicar padrões nas features existentes.

| # | Tarefa | Prioridade | Esforço |
|---|--------|------------|---------|
| 3.1 | Unificar `CreateMemberDialog` e `EditMemberDialog` | Alta | 4h |
| 3.2 | Migrar selects para componente padronizado | Alta | 3h |
| 3.3 | Aplicar `PageHeader` em todas as páginas | Média | 2h |
| 3.4 | Aplicar `EmptyState` em todas as features | Média | 2h |
| 3.5 | Padronizar loading states | Média | 2h |

### Fase 4: Qualidade (Semana 4-5)
**Objetivo:** Melhorar qualidade e resiliência.

| # | Tarefa | Prioridade | Esforço |
|---|--------|------------|---------|
| 4.1 | Implementar Error Boundaries | Alta | 3h |
| 4.2 | Integrar Zod para validação de forms | Alta | 4h |
| 4.3 | Adicionar testes para dialogs de criação | Média | 4h |
| 4.4 | Adicionar testes para DashboardLayout | Média | 3h |
| 4.5 | Dashboard com dados reais (useDashboardStats) | Média | 4h |

### Fase 5: Performance (Semana 5-6)
**Objetivo:** Otimizar performance e bundle size.

| # | Tarefa | Prioridade | Esforço |
|---|--------|------------|---------|
| 5.1 | Implementar lazy loading de rotas | Alta | 3h |
| 5.2 | Analisar e otimizar bundle size | Média | 4h |
| 5.3 | Memoização estratégica em componentes críticos | Média | 3h |
| 5.4 | Otimizar imagens e assets | Baixa | 2h |

---

## 6. Métricas de Sucesso

### 6.1 Antes do Retrofit
- [ ] Documentar LOC (Lines of Code) por feature
- [ ] Medir bundle size atual
- [ ] Listar componentes duplicados
- [ ] Cobertura de testes atual

### 6.2 Após o Retrofit
| Métrica | Meta |
|---------|------|
| Redução de código duplicado | -30% LOC em features |
| Componentes reutilizáveis | +10 componentes genéricos |
| Cobertura de testes | >70% em componentes críticos |
| Bundle size | Manter ou reduzir |
| Tempo de build | Manter ou reduzir |

---

## 7. Arquivos a Criar (Resumo)

```
src/
├── types/
│   ├── index.ts
│   ├── auth.types.ts
│   ├── members.types.ts
│   ├── financial.types.ts
│   ├── ebd.types.ts
│   ├── governance.types.ts
│   └── missions.types.ts
├── constants/
│   ├── index.ts
│   ├── member.constants.ts
│   ├── financial.constants.ts
│   └── governance.constants.ts
├── lib/
│   └── queryKeys.ts
├── components/
│   ├── ui/
│   │   ├── select.tsx (novo)
│   │   ├── skeleton.tsx (novo)
│   │   └── spinner.tsx (novo)
│   ├── PageHeader.tsx (novo)
│   ├── EmptyState.tsx (novo)
│   ├── FormField.tsx (novo)
│   ├── ConfirmDialog.tsx (novo)
│   ├── StatCard.tsx (novo)
│   ├── ErrorBoundary.tsx (novo)
│   └── ErrorFallback.tsx (novo)
├── features/
│   └── members/
│       └── components/
│           ├── MemberForm.tsx (novo - unificado)
│           └── MemberDialog.tsx (novo - wrapper)
└── hooks/
    ├── usePagination.ts (novo)
    ├── useSearch.ts (novo)
    ├── useConfirmation.ts (novo)
    └── useDashboardStats.ts (novo)
```

---

## 8. Conclusão

O módulo web possui uma base sólida com arquitetura feature-based e boas práticas de React moderno. Os principais pontos de atenção são:

1. **Duplicação de código** - Especialmente em dialogs de CRUD
2. **Falta de padronização** - Loading states, selects, empty states
3. **Tipos dispersos** - Necessidade de centralização
4. **Cobertura de testes** - Componentes críticos sem testes

O retrofit proposto é incremental e pode ser executado em paralelo com desenvolvimento de novas features, priorizando as fases 1 e 2 que estabelecem a fundação para melhorias futuras.

**Esforço total estimado:** ~70 horas (4-6 semanas com 1 dev dedicado parcialmente)
