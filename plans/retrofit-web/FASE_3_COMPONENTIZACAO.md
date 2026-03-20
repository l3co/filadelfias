# Fase 3: Componentização - Arquitetura de Componentes

> **Duração:** 3-4 semanas  
> **Prioridade:** 🟢 Médio  
> **Dependências:** Fase 1 (Context), Fase 2 (Performance)

---

## 🎯 Objetivos

1. Refatorar componentes grandes (>150 linhas)
2. Implementar Compound Components Pattern
3. Extrair UI patterns compartilhados
4. Criar design system documentado (Storybook)
5. Reduzir duplicação de código em 60%

---

## 📋 Tarefas Detalhadas

### 3.1 Refatorar Componentes Grandes

**Problema Atual:**

```tsx
// ❌ HomePage.tsx - 278 linhas
// Mistura: lógica de negócio + formatação + UI + data fetching
export default function HomePage() {
  // 20+ linhas de hooks
  const { data: user } = useCurrentUser();
  const tenant = useCurrentTenant();
  const dashboardStats = useFormattedStats();
  const { data: members } = useMembers(tenant?.id);
  const { data: events } = useEvents(tenant?.id);
  
  // 30+ linhas de funções utilitárias
  const formatRelativeTime = (dateStr: string) => { /* ... */ };
  const formatEventDate = (dateStr: string) => { /* ... */ };
  const getGreeting = () => { /* ... */ };
  
  // 150+ linhas de JSX
  return (<div>...</div>);
}
```

**Solução:**

#### 3.1.1 Separar em Containers e Presentational Components

```tsx
// apps/web/src/routes/HomePage.tsx (Container)
import { HomePageView } from '../features/dashboard/components/HomePageView';
import { useHomePageData } from '../features/dashboard/hooks/useHomePageData';

export default function HomePage() {
  const data = useHomePageData();
  
  if (data.isLoading) {
    return <HomePageSkeleton />;
  }
  
  return <HomePageView {...data} />;
}
```

```tsx
// apps/web/src/features/dashboard/hooks/useHomePageData.ts
import { useAuth } from '../../../contexts/AuthContext';
import { useFormattedStats } from './useDashboardStats';
import { useMembers } from '../../members/hooks/useMembers';
import { useEvents } from '../../events/hooks/useEvents';

export function useHomePageData() {
  const { user, tenant } = useAuth();
  const dashboardStats = useFormattedStats();
  const { data: members, isLoading: membersLoading } = useMembers(tenant?.id);
  const { data: events, isLoading: eventsLoading } = useEvents(tenant?.id);
  
  const firstName = user?.name?.split(' ')[0] || 'Usuário';
  
  const recentMembers = useMemo(() => {
    return members
      ?.filter(m => m.created_at)
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
      .slice(0, 3) || [];
  }, [members]);
  
  const upcomingEvents = useMemo(() => {
    return events
      ?.filter(e => new Date(e.start_date) >= new Date())
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 3) || [];
  }, [events]);

  return {
    user,
    tenant,
    firstName,
    dashboardStats,
    recentMembers,
    upcomingEvents,
    isLoading: membersLoading || eventsLoading || dashboardStats.isLoading,
  };
}
```

```tsx
// apps/web/src/features/dashboard/components/HomePageView.tsx
import { WelcomeBanner } from './WelcomeBanner';
import { StatsGrid } from './StatsGrid';
import { QuickActionsGrid } from './QuickActionsGrid';
import { RecentMembersCard } from './RecentMembersCard';
import { UpcomingEventsCard } from './UpcomingEventsCard';

interface HomePageViewProps {
  firstName: string;
  tenant: Tenant | null;
  dashboardStats: DashboardStats;
  recentMembers: Member[];
  upcomingEvents: Event[];
}

export function HomePageView({
  firstName,
  tenant,
  dashboardStats,
  recentMembers,
  upcomingEvents,
}: HomePageViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        greeting={getGreeting()} 
        name={firstName}
        subtitle="Aqui está o resumo da sua comunidade hoje."
      />
      
      <StatsGrid stats={dashboardStats} />
      
      <WelcomeBanner tenantName={tenant?.name} />
      
      <QuickActionsGrid />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentMembersCard members={recentMembers} />
        <UpcomingEventsCard events={upcomingEvents} />
      </div>
    </div>
  );
}
```

**Componentes a Refatorar:**
- ✅ `HomePage` (278 linhas → 20 linhas)
- ✅ `MembersPage` (212 linhas → 50 linhas)
- ✅ `TreasuryPage` (estimado 200+ linhas)
- ✅ `CouncilsPage` (estimado 180+ linhas)
- ✅ `EBDClassDetailPage` (estimado 150+ linhas)

**Critérios de Aceitação:**
- [ ] Nenhum componente com >150 linhas
- [ ] Container/Presentational separation clara
- [ ] Custom hooks para lógica complexa
- [ ] Componentes presentational testáveis isoladamente

---

### 3.2 Compound Components Pattern

**Problema Atual:**

```tsx
// ❌ Componente monolítico com muitas props
<DataTable
  data={members}
  columns={columns}
  sortable
  filterable
  selectable
  pagination
  pageSize={20}
  onSort={handleSort}
  onFilter={handleFilter}
  onSelect={handleSelect}
  renderActions={renderActions}
  emptyState={emptyState}
/>
```

**Solução: Compound Components**

```tsx
// apps/web/src/components/ui/data-table/DataTable.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface DataTableContextValue<T> {
  data: T[];
  selectedRows: Set<string>;
  toggleRow: (id: string) => void;
  toggleAll: () => void;
}

const DataTableContext = createContext<DataTableContextValue<any> | null>(null);

function useDataTableContext<T>() {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error('DataTable compound components must be used within DataTable');
  }
  return context as DataTableContextValue<T>;
}

// Root component
interface DataTableProps<T> {
  data: T[];
  children: ReactNode;
  getRowId: (row: T) => string;
}

export function DataTable<T>({ data, children, getRowId }: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(getRowId)));
    }
  };

  return (
    <DataTableContext.Provider value={{ data, selectedRows, toggleRow, toggleAll }}>
      <div className="rounded-lg border border-gray-200 bg-white">
        {children}
      </div>
    </DataTableContext.Provider>
  );
}

// Header component
DataTable.Header = function DataTableHeader({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center justify-between">
        {children}
      </div>
    </div>
  );
};

// Body component
DataTable.Body = function DataTableBody<T>({ 
  children 
}: { 
  children: (row: T, index: number) => ReactNode 
}) {
  const { data } = useDataTableContext<T>();
  
  return (
    <div className="divide-y divide-gray-100">
      {data.map((row, index) => children(row, index))}
    </div>
  );
};

// Row component
interface DataTableRowProps {
  id: string;
  children: ReactNode;
  selectable?: boolean;
}

DataTable.Row = function DataTableRow({ 
  id, 
  children, 
  selectable 
}: DataTableRowProps) {
  const { selectedRows, toggleRow } = useDataTableContext();
  const isSelected = selectedRows.has(id);

  return (
    <div 
      className={cn(
        'flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors',
        isSelected && 'bg-green-50'
      )}
    >
      {selectable && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleRow(id)}
          className="h-4 w-4 rounded border-gray-300"
        />
      )}
      {children}
    </div>
  );
};

// Empty state
DataTable.Empty = function DataTableEmpty({ children }: { children: ReactNode }) {
  const { data } = useDataTableContext();
  
  if (data.length > 0) return null;
  
  return (
    <div className="py-12 text-center">
      {children}
    </div>
  );
};

// Actions
DataTable.Actions = function DataTableActions({ children }: { children: ReactNode }) {
  const { selectedRows } = useDataTableContext();
  
  if (selectedRows.size === 0) return null;
  
  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {selectedRows.size} item(s) selecionado(s)
        </span>
        <div className="flex gap-2">
          {children}
        </div>
      </div>
    </div>
  );
};
```

**Uso:**

```tsx
// ✅ Uso flexível e composável
<DataTable data={members} getRowId={(m) => m.id}>
  <DataTable.Header>
    <h3 className="font-semibold">Membros</h3>
    <Button onClick={handleAdd}>Adicionar</Button>
  </DataTable.Header>
  
  <DataTable.Body>
    {(member) => (
      <DataTable.Row id={member.id} selectable>
        <div className="flex-1">
          <p className="font-medium">{member.full_name}</p>
          <p className="text-sm text-gray-500">{member.email}</p>
        </div>
        <Badge>{member.office}</Badge>
      </DataTable.Row>
    )}
  </DataTable.Body>
  
  <DataTable.Empty>
    <p className="text-gray-500">Nenhum membro encontrado</p>
  </DataTable.Empty>
  
  <DataTable.Actions>
    <Button variant="outline" onClick={handleDelete}>Deletar</Button>
    <Button onClick={handleExport}>Exportar</Button>
  </DataTable.Actions>
</DataTable>
```

**Compound Components a Criar:**
- ✅ `DataTable` (acima)
- ✅ `Select` (com trigger, content, item)
- ✅ `Modal` (com header, body, footer)
- ✅ `Card` (com header, content, footer)
- ✅ `Tabs` (com list, tab, panel)

---

### 3.3 Extrair UI Patterns Compartilhados

**3.3.1 Search + Filter Pattern**

```tsx
// apps/web/src/components/patterns/SearchAndFilter.tsx
import { Search, X } from 'lucide-react';

interface SearchAndFilterProps<T extends string> {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: Array<{
    key: T | null;
    label: string;
    count?: number;
  }>;
  activeFilter: T | null;
  onFilterChange: (filter: T | null) => void;
}

export function SearchAndFilter<T extends string>({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters,
  activeFilter,
  onFilterChange,
}: SearchAndFilterProps<T>) {
  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-11 pr-10 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key ?? 'all'}
            onClick={() => onFilterChange(filter.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeFilter === filter.key
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {filter.label}
            {filter.count !== undefined && (
              <Badge variant="secondary" className="ml-2">
                {filter.count}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Uso:**

```tsx
// ✅ Reuso em múltiplas páginas
<SearchAndFilter
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
  searchPlaceholder="Buscar membros..."
  filters={[
    { key: null, label: 'Todos', count: members?.length },
    { key: 'PASTOR', label: 'Pastores', count: officeCounts.PASTOR },
    { key: 'PRESBITERO', label: 'Presbíteros', count: officeCounts.PRESBITERO },
  ]}
  activeFilter={officeFilter}
  onFilterChange={setOfficeFilter}
/>
```

**3.3.2 Empty State Pattern**

```tsx
// apps/web/src/components/patterns/EmptyState.tsx
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-2 max-w-sm mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

**3.3.3 Page Header Pattern**

```tsx
// apps/web/src/components/patterns/PageHeader.tsx
interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
  };
  stats?: string;
}

export function PageHeader({ icon: Icon, title, subtitle, action, stats }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-green-50 to-teal-50">
            <Icon className="h-6 w-6 text-green-600" />
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            {title}
          </h1>
          {(subtitle || stats) && (
            <p className="text-gray-500 mt-0.5">
              {subtitle}
              {stats && ` • ${stats}`}
            </p>
          )}
        </div>
      </div>
      
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

**Patterns a Criar:**
- ✅ SearchAndFilter
- ✅ EmptyState
- ✅ PageHeader
- ✅ LoadingState
- ✅ ErrorState
- ✅ ConfirmDialog
- ✅ StatsCard
- ✅ ActionMenu

---

### 3.4 Storybook para Design System

**3.4.1 Setup Storybook**

```bash
npx storybook@latest init
```

**3.4.2 Configurar para Vite + Tailwind**

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',  // ✅ A11y addon
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

```typescript
// .storybook/preview.tsx
import type { Preview } from '@storybook/react';
import '../src/index.css';  // Tailwind

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
```

**3.4.3 Exemplo de Story**

```tsx
// apps/web/src/components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Plus, Trash } from 'lucide-react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus className="h-4 w-4 mr-2" />
        Adicionar
      </>
    ),
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <Trash className="h-4 w-4 mr-2" />
        Deletar
      </>
    ),
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Carregando...
      </>
    ),
  },
};
```

**3.4.4 Compound Component Story**

```tsx
// apps/web/src/components/ui/data-table/DataTable.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import { Badge } from '../badge';
import { Button } from '../button';

const meta = {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs'],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockMembers = [
  { id: '1', name: 'João Silva', email: 'joao@example.com', office: 'PASTOR' },
  { id: '2', name: 'Maria Santos', email: 'maria@example.com', office: 'PRESBITERO' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@example.com', office: 'DIACONO' },
];

export const Default: Story = {
  render: () => (
    <div className="w-[600px]">
      <DataTable data={mockMembers} getRowId={(m) => m.id}>
        <DataTable.Header>
          <h3 className="font-semibold">Membros</h3>
          <Button size="sm">Adicionar</Button>
        </DataTable.Header>
        
        <DataTable.Body>
          {(member) => (
            <DataTable.Row id={member.id} selectable>
              <div className="flex-1">
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
              <Badge>{member.office}</Badge>
            </DataTable.Row>
          )}
        </DataTable.Body>
        
        <DataTable.Actions>
          <Button variant="destructive" size="sm">Deletar</Button>
          <Button size="sm">Exportar</Button>
        </DataTable.Actions>
      </DataTable>
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="w-[600px]">
      <DataTable data={[]} getRowId={(m) => m.id}>
        <DataTable.Header>
          <h3 className="font-semibold">Membros</h3>
        </DataTable.Header>
        
        <DataTable.Empty>
          <p className="text-gray-500">Nenhum membro encontrado</p>
        </DataTable.Empty>
      </DataTable>
    </div>
  ),
};
```

**Componentes a Documentar:**
- [ ] Button (variants, sizes, icons)
- [ ] Card (com compound components)
- [ ] DataTable (compound)
- [ ] Modal/Dialog
- [ ] Input, Select, Checkbox
- [ ] Badge, Tag
- [ ] Patterns (SearchAndFilter, EmptyState, etc)

**Critérios de Aceitação:**
- [ ] Storybook configurado
- [ ] 100% dos componentes UI documentados
- [ ] A11y addon validando todos os componentes
- [ ] Visual regression tests (Chromatic)

---

## 🧪 Testes de Componentização

### 3.5 Testes de Compound Components

```typescript
// apps/web/src/components/ui/data-table/__tests__/DataTable.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from '../DataTable';

const mockData = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
];

describe('DataTable', () => {
  it('renders header and rows', () => {
    render(
      <DataTable data={mockData} getRowId={(item) => item.id}>
        <DataTable.Header>
          <h3>Title</h3>
        </DataTable.Header>
        <DataTable.Body>
          {(item) => (
            <DataTable.Row id={item.id}>
              {item.name}
            </DataTable.Row>
          )}
        </DataTable.Body>
      </DataTable>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(
      <DataTable data={[]} getRowId={(item) => item.id}>
        <DataTable.Empty>No items</DataTable.Empty>
      </DataTable>
    );

    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('handles row selection', async () => {
    const user = userEvent.setup();
    
    render(
      <DataTable data={mockData} getRowId={(item) => item.id}>
        <DataTable.Body>
          {(item) => (
            <DataTable.Row id={item.id} selectable>
              {item.name}
            </DataTable.Row>
          )}
        </DataTable.Body>
        <DataTable.Actions>
          <button>Delete</button>
        </DataTable.Actions>
      </DataTable>
    );

    // Actions hidden initially
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();

    // Select row
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Actions visible
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('1 item(s) selecionado(s)')).toBeInTheDocument();
  });
});
```

---

## 📊 Métricas de Sucesso

### Antes
- ❌ 5 componentes >200 linhas
- ❌ Lógica duplicada em 10+ páginas
- ❌ Search/Filter copiado 8x
- ❌ 0 componentes documentados
- ❌ Props drilling em 15+ componentes

### Depois
- ✅ 0 componentes >150 linhas
- ✅ Lógica centralizada em hooks
- ✅ Patterns reutilizados em todas as páginas
- ✅ 100% componentes UI documentados (Storybook)
- ✅ Compound components eliminam props drilling

---

## 📦 Entregáveis

1. ✅ 5 páginas refatoradas (Container/Presentational)
2. ✅ 5 Compound Components criados
3. ✅ 8 UI Patterns extraídos
4. ✅ Storybook completo (20+ stories)
5. ✅ Design system documentado
6. ✅ Testes de todos os compound components

---

## 🔄 Checklist de Implementação

- [ ] Criar branch `retrofit/fase-3-componentizacao`
- [ ] Refatorar HomePage (Container + View)
- [ ] Refatorar MembersPage
- [ ] Refatorar TreasuryPage
- [ ] Criar DataTable compound
- [ ] Criar Select compound
- [ ] Criar Modal compound
- [ ] Criar Card compound
- [ ] Extrair SearchAndFilter pattern
- [ ] Extrair EmptyState pattern
- [ ] Extrair PageHeader pattern
- [ ] Setup Storybook
- [ ] Criar stories para todos os componentes UI
- [ ] Adicionar a11y addon
- [ ] Documentar design system
- [ ] Testes de compound components
- [ ] Code review
- [ ] Merge para main

---

## 📅 Timeline Sugerido

| Semana | Tarefas |
|--------|---------|
| **1** | Refatorar páginas grandes (Container/Presentational) |
| **2** | Criar compound components + patterns |
| **3** | Storybook setup + stories |
| **4** | Documentação + testes + review |

---

## 🎓 Recursos

- [Compound Components Pattern](https://www.patterns.dev/posts/compound-pattern)
- [Container/Presentational Pattern](https://www.patterns.dev/posts/presentational-container-pattern)
- [Storybook React Guide](https://storybook.js.org/docs/react/get-started/introduction)
- [Radix UI Composition](https://www.radix-ui.com/docs/primitives/overview/composition)
