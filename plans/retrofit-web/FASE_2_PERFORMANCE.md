# Fase 2: Performance - Otimização de Renderização

> **Duração:** 2-3 semanas  
> **Prioridade:** 🟡 Alto  
> **Dependências:** Fase 1 (Context de Auth)

---

## 🎯 Objetivos

1. Eliminar re-renders desnecessários
2. Implementar memoização estratégica
3. Virtualizar listas longas
4. Otimizar bundle size
5. Implementar lazy loading de imagens
6. Melhorar Core Web Vitals

---

## 📋 Tarefas Detalhadas

### 2.1 React.memo em Componentes de Lista

**Problema Atual:**
```tsx
// ❌ MemberCard re-renderiza toda vez que MembersPage atualiza
// Mesmo se os dados do membro não mudaram
function MemberCard({ member, onEdit, onInvite }) {
  return <div>...</div>;
}

// ❌ Renderiza 100+ cards desnecessariamente
function MembersCards({ members }) {
  return members.map(member => (
    <MemberCard key={member.id} member={member} />
  ));
}
```

**Solução:**

#### 2.1.1 Memoizar Componentes de Lista

```tsx
// apps/web/src/features/members/components/MemberCard.tsx
import { memo } from 'react';

interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onInvite: (member: Member) => void;
}

export const MemberCard = memo(function MemberCard({ 
  member, 
  onEdit, 
  onInvite 
}: MemberCardProps) {
  return (
    <div className="bg-white rounded-xl p-4">
      <h3>{member.full_name}</h3>
      <button onClick={() => onEdit(member)}>Editar</button>
      <button onClick={() => onInvite(member)}>Convidar</button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - só re-renderiza se member mudar
  return (
    prevProps.member.id === nextProps.member.id &&
    prevProps.member.full_name === nextProps.member.full_name &&
    prevProps.member.office === nextProps.member.office
  );
});
```

#### 2.1.2 useCallback para Callbacks Estáveis

```tsx
// apps/web/src/routes/members/MembersPage.tsx
import { useCallback } from 'react';

export function MembersPage() {
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [inviteMember, setInviteMember] = useState<Member | null>(null);

  // ✅ Callbacks memoizados - não mudam entre renders
  const handleEdit = useCallback((member: Member) => {
    setEditingMember(member);
  }, []);

  const handleInvite = useCallback((member: Member) => {
    setInviteMember(member);
  }, []);

  return (
    <MembersCards
      members={filteredMembers}
      onEditMember={handleEdit}    // ✅ Referência estável
      onInviteMember={handleInvite} // ✅ Referência estável
    />
  );
}
```

**Componentes a Otimizar:**
- `MemberCard`
- `EventCard`
- `MissionaryCard`
- `TitheRecordCard`
- `ExpenseCard`
- `DevotionalCard`
- `CouncilCard`
- `ClassCard`
- `StatCard`
- `HomeCard`

**Critérios de Aceitação:**
- [ ] Todos os cards com React.memo
- [ ] Callbacks com useCallback
- [ ] Profiler mostra 80% menos re-renders
- [ ] Testes garantem comportamento correto

---

### 2.2 useMemo para Computações Custosas

**Problema Atual:**
```tsx
// ❌ Filtragem e ordenação a cada render
function MembersPage() {
  const { data: members } = useMembers();
  
  // Re-executa toda vez, mesmo se members e searchQuery não mudaram
  const filteredMembers = members?.filter(m => 
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => a.full_name.localeCompare(b.full_name));
}
```

**Solução:**

```tsx
// ✅ Memoizar computações custosas
import { useMemo } from 'react';

function MembersPage() {
  const { data: members } = useMembers();
  const [searchQuery, setSearchQuery] = useState('');
  const [officeFilter, setOfficeFilter] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    if (!members) return [];

    return members
      .filter(member => {
        const matchesSearch = searchQuery === '' ||
          member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesOffice = !officeFilter || member.office === officeFilter;

        return matchesSearch && matchesOffice;
      })
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [members, searchQuery, officeFilter]);

  const officeCounts = useMemo(() => {
    if (!members) return {};
    return members.reduce((acc, m) => {
      const office = m.office || 'MEMBRO';
      acc[office] = (acc[office] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [members]);

  // ...
}
```

**Páginas a Otimizar:**
- `MembersPage` (filtragem + contagem)
- `EventsPage` (ordenação por data)
- `MissionsPage` (agrupamento)
- `TreasuryPage` (cálculos financeiros)
- `HomePage` (stats + recent items)

**Critérios de Aceitação:**
- [ ] useMemo em todas as computações > 10ms
- [ ] Profiler mostra melhoria mensurável
- [ ] Dependencies array corretas (sem ESLint warnings)

---

### 2.3 Virtualização de Listas

**Problema Atual:**
```tsx
// ❌ Renderiza TODOS os 500+ membros no DOM
{members.map(member => <MemberCard key={member.id} member={member} />)}
```

**Impacto:**
- DOM gigante (500+ elementos)
- Scroll lento
- Alto uso de memória

**Solução:**

#### 2.3.1 Instalar react-window

```bash
npm install react-window
npm install --save-dev @types/react-window
```

#### 2.3.2 Virtualizar Lista de Membros

```tsx
// apps/web/src/features/members/components/VirtualizedMembersList.tsx
import { FixedSizeList as List } from 'react-window';
import { MemberCard } from './MemberCard';
import type { Member } from '../../../types';

interface VirtualizedMembersListProps {
  members: Member[];
  onEditMember: (member: Member) => void;
  onInviteMember: (member: Member) => void;
}

export function VirtualizedMembersList({
  members,
  onEditMember,
  onInviteMember,
}: VirtualizedMembersListProps) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const member = members[index];
    return (
      <div style={style} className="px-4">
        <MemberCard
          member={member}
          onEdit={onEditMember}
          onInvite={onInviteMember}
        />
      </div>
    );
  };

  return (
    <List
      height={600}
      itemCount={members.length}
      itemSize={120}  // Altura de cada card
      width="100%"
      className="scrollbar-thin"
    >
      {Row}
    </List>
  );
}
```

#### 2.3.3 Usar Variável Height (VariableSizeList)

```tsx
// Para cards com altura dinâmica
import { VariableSizeList } from 'react-window';

export function VirtualizedEventsList({ events }: { events: Event[] }) {
  const listRef = useRef<VariableSizeList>(null);

  const getItemSize = (index: number) => {
    const event = events[index];
    // Calcular altura baseada no conteúdo
    return event.description ? 180 : 120;
  };

  return (
    <VariableSizeList
      ref={listRef}
      height={600}
      itemCount={events.length}
      itemSize={getItemSize}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <EventCard event={events[index]} />
        </div>
      )}
    </VariableSizeList>
  );
}
```

**Listas a Virtualizar:**
- `MembersList` (500+ items potencial)
- `EventsList` (100+ items)
- `TransactionsList` (1000+ items)
- `PrayerRequestsList` (50+ items)

**Critérios de Aceitação:**
- [ ] Listas >50 items virtualizadas
- [ ] Scroll smooth mesmo com 1000+ items
- [ ] Memória estável independente do tamanho da lista
- [ ] Mobile performático

---

### 2.4 Lazy Loading de Imagens

**Problema Atual:**
```tsx
// ❌ Todas as imagens carregadas imediatamente
<img src={member.avatar_url} alt={member.name} />
<img src={event.image_url} alt={event.title} />
```

**Solução:**

#### 2.4.1 Componente LazyImage

```tsx
// apps/web/src/components/ui/LazyImage.tsx
import { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  placeholder?: string;
}

export function LazyImage({
  src,
  alt,
  fallback = '/placeholder-image.svg',
  placeholder,
  className,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder || fallback);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }  // Carregar 50px antes de aparecer
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src]);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => {
    setHasError(true);
    setImageSrc(fallback);
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      {...props}
    />
  );
}
```

#### 2.4.2 Usar em Componentes

```tsx
// ✅ Uso
import { LazyImage } from '@/components/ui/LazyImage';

<LazyImage
  src={member.avatar_url}
  alt={member.full_name}
  className="w-10 h-10 rounded-full"
  fallback="/default-avatar.svg"
/>
```

**Critérios de Aceitação:**
- [ ] Todas as imagens com lazy loading
- [ ] Placeholder durante carregamento
- [ ] Fallback em caso de erro
- [ ] LCP (Largest Contentful Paint) melhorado

---

### 2.5 Code Splitting Avançado

**Problema Atual:**
```typescript
// vite.config.ts - chunks muito grandes
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-query': ['@tanstack/react-query'],
  'vendor-ui': ['@radix-ui/...'], // 20+ packages
}
```

**Solução:**

```typescript
// apps/web/vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendors core
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          
          // UI library chunks
          if (id.includes('@radix-ui')) {
            return 'vendor-radix';
          }
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          
          // Features
          if (id.includes('src/features/members')) {
            return 'feature-members';
          }
          if (id.includes('src/features/financial')) {
            return 'feature-financial';
          }
          if (id.includes('src/features/governance')) {
            return 'feature-governance';
          }
          if (id.includes('src/features/ebd')) {
            return 'feature-ebd';
          }
          
          // Shared utilities
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
      },
    },
    chunkSizeWarningLimit: 300,  // Reduzir de 500
  },
});
```

**Critérios de Aceitação:**
- [ ] Nenhum chunk > 300KB
- [ ] Chunks de features separados
- [ ] Bundle analysis mostra melhoria
- [ ] Lighthouse score melhorado

---

### 2.6 Preload de Recursos Críticos

**Solução:**

```html
<!-- apps/web/index.html -->
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/logo.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- ✅ Preload critical resources -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="dns-prefetch" href="https://api.filadelfias.com" />
    
    <!-- ✅ Preload logo -->
    <link rel="preload" as="image" href="/logo.svg" />
    
    <!-- ✅ Preload critical CSS -->
    <link rel="preload" as="style" href="/index.css" />
    
    <title>Filadélfias</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### 2.7 Web Workers para Computações Pesadas

**Caso de Uso:** Filtrar/ordenar 1000+ transações financeiras

```typescript
// apps/web/src/workers/financial.worker.ts
interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
}

self.onmessage = (e: MessageEvent<{ transactions: Transaction[]; filters: any }>) => {
  const { transactions, filters } = e.data;
  
  // Computação pesada fora da UI thread
  const filtered = transactions.filter(t => {
    // Filtros complexos
    return true;
  });
  
  const sorted = filtered.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  self.postMessage(sorted);
};
```

```typescript
// apps/web/src/features/financial/hooks/useFilteredTransactions.ts
import { useEffect, useState } from 'react';

export function useFilteredTransactions(transactions: Transaction[], filters: any) {
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  
  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/financial.worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    worker.postMessage({ transactions, filters });
    
    worker.onmessage = (e) => {
      setFiltered(e.data);
    };
    
    return () => worker.terminate();
  }, [transactions, filters]);
  
  return filtered;
}
```

**Critérios de Aceitação:**
- [ ] UI não trava com 1000+ items
- [ ] Computações > 50ms movidas para worker

---

## 🧪 Testes de Performance

### 2.8.1 React Profiler

```tsx
// apps/web/src/test/profiler.tsx
import { Profiler, ProfilerOnRenderCallback } from 'react';

const onRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.log({
    id,
    phase,
    actualDuration,
    baseDuration,
  });
};

// Usar em testes
<Profiler id="MembersPage" onRender={onRender}>
  <MembersPage />
</Profiler>
```

### 2.8.2 Performance Benchmarks

```typescript
// apps/web/src/test/benchmarks/member-list.bench.ts
import { bench, describe } from 'vitest';
import { render } from '@testing-library/react';
import { MembersList } from '../features/members/components/MembersList';

const mockMembers = Array.from({ length: 500 }, (_, i) => ({
  id: String(i),
  full_name: `Member ${i}`,
  office: 'MEMBRO',
}));

describe('MembersList Performance', () => {
  bench('render 500 members', () => {
    render(<MembersList members={mockMembers} />);
  });
});
```

---

## 📊 Métricas de Sucesso

### Core Web Vitals

| Métrica | Antes | Meta | Medição |
|---------|-------|------|---------|
| **LCP** (Largest Contentful Paint) | 3.5s | <2.5s | Lighthouse |
| **FID** (First Input Delay) | 150ms | <100ms | Web Vitals |
| **CLS** (Cumulative Layout Shift) | 0.15 | <0.1 | Web Vitals |
| **FCP** (First Contentful Paint) | 2s | <1.8s | Lighthouse |
| **TTI** (Time to Interactive) | 4s | <3s | Lighthouse |

### Bundle Size

| Chunk | Antes | Meta |
|-------|-------|------|
| vendor-react | 150KB | 150KB (mantido) |
| vendor-ui | 280KB | <200KB |
| feature-members | N/A | <100KB |
| Total inicial | 800KB | <600KB |

### Runtime Performance

| Operação | Antes | Meta |
|----------|-------|------|
| Filtrar 500 membros | 150ms | <50ms |
| Renderizar lista 500 items | 800ms | <100ms |
| Scroll em lista longa | Lag | Smooth 60fps |
| Re-render em mudança de filtro | Todo DOM | Apenas filtrados |

---

## 📦 Entregáveis

1. ✅ Componentes memoizados (10+)
2. ✅ Hooks otimizados com useCallback/useMemo
3. ✅ Listas virtualizadas (4+)
4. ✅ LazyImage component
5. ✅ Code splitting otimizado
6. ✅ Web Worker para financial
7. ✅ Bundle analysis report
8. ✅ Performance benchmarks

---

## 🔄 Checklist de Implementação

- [ ] Criar branch `retrofit/fase-2-performance`
- [ ] Memoizar MemberCard
- [ ] Memoizar EventCard, StatCard, etc
- [ ] Adicionar useCallback em handlers
- [ ] Adicionar useMemo em filtros
- [ ] Instalar react-window
- [ ] Virtualizar MembersList
- [ ] Virtualizar EventsList
- [ ] Virtualizar TransactionsList
- [ ] Criar LazyImage component
- [ ] Migrar todas as imagens
- [ ] Otimizar vite.config code splitting
- [ ] Bundle analysis
- [ ] Criar financial.worker
- [ ] Profiler em componentes críticos
- [ ] Benchmarks de performance
- [ ] Lighthouse antes/depois
- [ ] Code review
- [ ] Merge para main

---

## 📅 Timeline Sugerido

| Semana | Tarefas |
|--------|---------|
| **1** | React.memo + useCallback + useMemo |
| **2** | Virtualização de listas + LazyImage |
| **3** | Code splitting + Web Workers + benchmarks |

---

## ⚠️ Armadilhas Comuns

1. **Over-memoization:** Nem tudo precisa de memo
2. **Dependencies incorretas:** Causa bugs sutis
3. **Virtualização complexa:** Testar em mobile
4. **Premature optimization:** Profiler primeiro, otimizar depois
