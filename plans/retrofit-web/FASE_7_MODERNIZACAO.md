# Fase 7: Modernização - React 19 e PWA

> **Duração:** 3-4 semanas  
> **Prioridade:** 🟢 Baixo (Long-term)  
> **Dependências:** Todas as fases anteriores

---

## 🎯 Objetivos

1. Migrar para React 19 features
2. Preparar para Server Components (futuro)
3. Implementar PWA completo (offline-first)
4. Adicionar Service Worker
5. Otimizar para instalação mobile
6. Preparar arquitetura para futuro (Next.js consideration)

---

## 📋 Tarefas Detalhadas

### 7.1 React 19 Migration

**Objetivo:** Aproveitar novos recursos do React 19

#### 7.1.1 Atualizar Dependências

```bash
npm install react@19 react-dom@19
npm install --save-dev @types/react@19 @types/react-dom@19
```

#### 7.1.2 Usar `use` Hook para Promises

**Antes (React 18):**

```tsx
function MembersPage() {
  const { data: members, isLoading, error } = useMembers(tenantId);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;
  
  return <MembersList members={members} />;
}
```

**Depois (React 19):**

```tsx
import { use, Suspense } from 'react';

function MembersPage() {
  const membersPromise = useMembersPromise(tenantId);

  return (
    <Suspense fallback={<LoadingState />}>
      <MembersContent membersPromise={membersPromise} />
    </Suspense>
  );
}

function MembersContent({ membersPromise }: { membersPromise: Promise<Member[]> }) {
  const members = use(membersPromise); // ✅ use() hook
  
  return <MembersList members={members} />;
}
```

#### 7.1.3 Actions e useOptimistic

```tsx
// apps/web/src/features/members/components/MemberCard.tsx
import { useOptimistic, useTransition } from 'react';

interface MemberCardProps {
  member: Member;
  onUpdate: (id: string, data: Partial<Member>) => Promise<void>;
}

export function MemberCard({ member, onUpdate }: MemberCardProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticMember, setOptimisticMember] = useOptimistic(member);

  async function handleToggleFavorite() {
    startTransition(async () => {
      // Update optimisticamente
      setOptimisticMember({ 
        ...member, 
        is_favorite: !member.is_favorite 
      });
      
      // Update no servidor
      await onUpdate(member.id, {
        is_favorite: !member.is_favorite,
      });
    });
  }

  return (
    <article className={cn('card', isPending && 'opacity-50')}>
      <h3>{optimisticMember.full_name}</h3>
      <button onClick={handleToggleFavorite}>
        {optimisticMember.is_favorite ? '★' : '☆'}
      </button>
    </article>
  );
}
```

#### 7.1.4 Form Actions

```tsx
// apps/web/src/features/members/components/MemberForm.tsx
import { useActionState } from 'react';

async function createMemberAction(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  try {
    await membersService.createMember(tenantId, { name, email });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao criar membro' };
  }
}

export function MemberForm() {
  const [state, formAction, isPending] = useActionState(
    createMemberAction,
    { success: false }
  );

  return (
    <form action={formAction}>
      <input name="name" required />
      <input name="email" type="email" required />
      
      {state.error && <p className="text-red-600">{state.error}</p>}
      
      <button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
```

#### 7.1.5 Document Metadata

```tsx
// apps/web/src/routes/members/MembersPage.tsx
export function MembersPage() {
  return (
    <>
      <title>Membros - Filadélfias</title>
      <meta name="description" content="Gerencie os membros da sua igreja" />
      
      <div className="space-y-6">
        {/* ... */}
      </div>
    </>
  );
}
```

**Critérios de Aceitação:**
- [ ] React 19 instalado
- [ ] `use` hook em 3+ features
- [ ] `useOptimistic` em updates críticos
- [ ] Form actions implementadas
- [ ] Document metadata em todas as páginas

---

### 7.2 Concurrent Features

**Objetivo:** Aproveitar renderização concorrente

#### 7.2.1 Suspense Boundaries

```tsx
// apps/web/src/App.tsx
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<AppShellLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route 
            path="/" 
            element={
              <Suspense fallback={<PageLoader />}>
                <LandingPage />
              </Suspense>
            } 
          />
        </Route>
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Suspense fallback={<DashboardLoader />}>
                <DashboardLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route 
            path="members" 
            element={
              <Suspense fallback={<ListLoader />}>
                <MembersPage />
              </Suspense>
            } 
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
```

#### 7.2.2 Error Boundaries Granulares

```tsx
// apps/web/src/routes/admin/index.tsx
<ErrorBoundary fallback={<DashboardError />}>
  <Suspense fallback={<DashboardLoader />}>
    <DashboardLayout />
  </Suspense>
</ErrorBoundary>
```

#### 7.2.3 useTransition para Updates Pesados

```tsx
// apps/web/src/features/members/hooks/useMembers.ts
import { useTransition } from 'react';

export function useMemberFilter() {
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState('');

  const updateFilter = (newFilter: string) => {
    startTransition(() => {
      setFilter(newFilter);
      // Filtrar 1000+ membros sem bloquear UI
    });
  };

  return { filter, updateFilter, isPending };
}
```

---

### 7.3 PWA Completo

**Objetivo:** App instalável e offline-first

#### 7.3.1 Service Worker com Workbox

```bash
npm install workbox-build workbox-window
npm install --save-dev vite-plugin-pwa
```

```typescript
// apps/web/vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg', 'logo.png'],
      
      manifest: {
        name: 'Filadélfias',
        short_name: 'Filadélfias',
        description: 'Sistema de gestão eclesiástica',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          // API calls - Network First
          {
            urlPattern: /^https:\/\/api\.filadelfias\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              networkTimeoutSeconds: 10,
            },
          },
          // Static assets - Cache First
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Fonts - Cache First
          {
            urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
      
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
});
```

#### 7.3.2 Registrar Service Worker

```typescript
// apps/web/src/lib/pwa.ts
import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker() {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Mostrar toast pedindo para atualizar
      const shouldUpdate = confirm(
        'Nova versão disponível! Atualizar agora?'
      );
      
      if (shouldUpdate) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('App pronto para uso offline');
      // Pode mostrar toast informando
    },
  });
}
```

```typescript
// apps/web/src/main.tsx
import { registerServiceWorker } from './lib/pwa';

// Registrar SW após render
createRoot(document.getElementById('root')!).render(/* ... */);

registerServiceWorker();
```

#### 7.3.3 Offline Fallback

```typescript
// apps/web/src/components/OfflineBanner.tsx
import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div 
      role="alert"
      className="fixed top-0 left-0 right-0 bg-amber-600 text-white px-4 py-2 text-center z-50"
    >
      <div className="flex items-center justify-center gap-2">
        <WifiOff size={20} />
        <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
      </div>
    </div>
  );
}
```

#### 7.3.4 Install Prompt

```typescript
// apps/web/src/components/InstallPrompt.tsx
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostrar prompt após 5s ou após primeira interação
      setTimeout(() => setShowPrompt(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome} the install prompt`);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl p-4 border border-gray-200 z-50">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-green-50 rounded-lg">
          <Download className="h-5 w-5 text-green-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Instalar Filadélfias</h3>
          <p className="text-sm text-gray-600 mt-1">
            Adicione à tela inicial para acesso rápido e uso offline
          </p>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              Instalar
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              Agora não
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setShowPrompt(false)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}
```

#### 7.3.5 Background Sync

```typescript
// apps/web/public/sw.js (custom service worker)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-members') {
    event.waitUntil(syncMembers());
  }
});

async function syncMembers() {
  // Pegar dados pendentes do IndexedDB
  const pendingChanges = await getPendingChanges();
  
  for (const change of pendingChanges) {
    try {
      await fetch('/api/members', {
        method: 'POST',
        body: JSON.stringify(change),
      });
      
      // Remover da fila de sync
      await removePendingChange(change.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

---

### 7.4 Preparação para Server Components

**Objetivo:** Arquitetura pronta para migração futura

#### 7.4.1 Separar Client vs Server Logic

```typescript
// apps/web/src/features/members/data/members.data.ts
// ✅ Lógica pura de data fetching (Server Component ready)
export async function getMembers(tenantId: string): Promise<Member[]> {
  const response = await fetch(`/api/tenants/${tenantId}/members`);
  return response.json();
}

export async function getMember(tenantId: string, memberId: string): Promise<Member> {
  const response = await fetch(`/api/tenants/${tenantId}/members/${memberId}`);
  return response.json();
}
```

```tsx
// apps/web/src/features/members/components/MembersList.tsx
// ✅ Pure presentation component (Server Component ready)
interface MembersListProps {
  members: Member[];
  onEdit?: (member: Member) => void;  // Client-only
}

export function MembersList({ members, onEdit }: MembersListProps) {
  return (
    <div className="space-y-3">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} onEdit={onEdit} />
      ))}
    </div>
  );
}
```

```tsx
// apps/web/src/features/members/components/MembersListClient.tsx
// ✅ Client wrapper (usa 'use client' no futuro)
'use client'; // Futuro

import { useState } from 'react';
import { MembersList } from './MembersList';

export function MembersListClient({ initialMembers }: { initialMembers: Member[] }) {
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  return (
    <>
      <MembersList members={initialMembers} onEdit={setEditingMember} />
      {editingMember && <MemberDialog member={editingMember} />}
    </>
  );
}
```

#### 7.4.2 File-based Convention

```
src/
├── features/
│   └── members/
│       ├── data/              # ✅ Server-side fetching
│       │   ├── members.data.ts
│       │   └── members.queries.ts
│       ├── components/         # ✅ Presentation
│       │   ├── MembersList.tsx
│       │   └── MemberCard.tsx
│       └── client/             # ✅ Client-only
│           ├── MembersListClient.tsx
│           └── useMemberActions.ts
```

---

### 7.5 Migração para Next.js (Consideração Futura)

**Quando considerar:**
- Precisa de SEO melhor
- Quer SSR/SSG
- Crescimento do time (melhor DX)
- Múltiplos apps/microsites

**Preparação:**

```typescript
// apps/web-next/ (novo projeto)
// Estrutura Next.js App Router
app/
├── (public)/
│   ├── page.tsx
│   ├── bible/
│   │   └── page.tsx
│   └── layout.tsx
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── layout.tsx
├── admin/
│   ├── page.tsx
│   ├── members/
│   │   └── page.tsx
│   └── layout.tsx
└── layout.tsx
```

**Migração gradual:**
1. Manter SPA atual rodando
2. Criar Next.js app paralelo
3. Migrar rota por rota
4. Compartilhar `packages/shared`
5. Deprecar SPA quando 100% migrado

**Critérios de Aceitação:**
- [ ] Documentação de arquitetura preparada para SC
- [ ] Client/Server separation clara
- [ ] Decisão de migração ou não documentada

---

## 🧪 Testes de PWA

### 7.6 Lighthouse PWA Audit

```bash
# Gerar audit
lighthouse https://app.filadelfias.com \
  --only-categories=pwa \
  --view
```

**Checklist PWA:**
- [ ] Installable (manifest + SW)
- [ ] Works offline
- [ ] Fast load (<3s)
- [ ] Configured for app-like experience
- [ ] HTTPS
- [ ] Responsive
- [ ] Custom splash screen

### 7.7 Testes Offline

```typescript
// apps/web/e2e/pwa.spec.ts
import { test, expect } from '@playwright/test';

test.describe('PWA Offline', () => {
  test('app works offline', async ({ page, context }) => {
    // Visitar app online
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Registrar SW
    await page.evaluate(() => {
      return navigator.serviceWorker.ready;
    });

    // Simular offline
    await context.setOffline(true);

    // Navegar deve funcionar
    await page.goto('/admin/members');
    
    // Verificar que mostra banner offline
    await expect(page.getByText(/você está offline/i)).toBeVisible();

    // Dados em cache devem estar disponíveis
    await expect(page.getByText(/membros/i)).toBeVisible();
  });

  test('shows install prompt', async ({ page }) => {
    // Implementar teste do install prompt
  });
});
```

---

## 📊 Métricas de Sucesso

### React 19 Features

- **`use` hook:** 5+ componentes
- **`useOptimistic`:** 3+ updates críticos
- **Form actions:** 5+ forms
- **Suspense boundaries:** 100% de lazy routes

### PWA

| Critério | Meta |
|----------|------|
| **Lighthouse PWA Score** | 90+ |
| **Install rate** | 10% dos usuários |
| **Offline usage** | 5% das sessions |
| **Cache hit rate** | 80% |
| **Time to interactive (offline)** | <1s |

### Performance

- **First Load:** <2s
- **Route changes:** <500ms
- **Offline load:** <1s

---

## 📦 Entregáveis

1. ✅ React 19 features implementadas
2. ✅ PWA manifest configurado
3. ✅ Service Worker com Workbox
4. ✅ Offline fallback
5. ✅ Install prompt
6. ✅ Background sync (opcional)
7. ✅ Arquitetura preparada para SC
8. ✅ Documentação de migração Next.js

---

## 🔄 Checklist de Implementação

- [ ] Criar branch `retrofit/fase-7-modernizacao`
- [ ] Atualizar React para 19
- [ ] Implementar `use` hook em 5 features
- [ ] Adicionar `useOptimistic` em updates
- [ ] Converter 5 forms para actions
- [ ] Adicionar Suspense boundaries
- [ ] Instalar vite-plugin-pwa
- [ ] Configurar manifest.json
- [ ] Criar ícones PWA (192, 512)
- [ ] Configurar Workbox caching
- [ ] Implementar OfflineBanner
- [ ] Implementar InstallPrompt
- [ ] Testar offline mode
- [ ] Lighthouse PWA audit (90+)
- [ ] Separar client/server logic
- [ ] Documentar arquitetura
- [ ] Avaliar Next.js migration
- [ ] Code review
- [ ] Merge para main

---

## 📅 Timeline Sugerido

| Semana | Tarefas |
|--------|---------|
| **1** | React 19 migration + features |
| **2** | PWA setup + SW + offline |
| **3** | Install prompt + testing |
| **4** | Server Components prep + docs |

---

## ⚠️ Considerações

### React 19
- Breaking changes mínimos
- Compatível com React Query
- Tailwind CSS compatível
- Radix UI compatível

### PWA
- Requer HTTPS em produção
- Service Worker pode cachear versões antigas
- Testar em dispositivos reais

### Next.js Migration
- Decisão estratégica de longo prazo
- Avaliar custo vs benefício
- Pode manter SPA se faz sentido

---

## 🎓 Recursos

- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Next.js App Router](https://nextjs.org/docs/app)
