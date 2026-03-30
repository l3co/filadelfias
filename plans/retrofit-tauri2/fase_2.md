# Fase 2 — Shell e Navegação

> **Para execução:** Use `superpowers:executing-plans` ou `superpowers:subagent-driven-development`.

**Goal:** Implementar o `AppShell` com layout adaptativo (Bottom Navigation no mobile, Sidebar no desktop), React Router v7 com todas as rotas, e tema claro/escuro.

**Architecture:** Hook `usePlatform()` detecta o target Tauri e o `AppShell` renderiza o layout correto. Mesmas rotas, apresentação diferente. Zero duplicação de páginas.

**Tech Stack:** React Router v7, TailwindCSS, Zustand (tema), Tauri `@tauri-apps/api/core`.

---

## Estrutura de Arquivos desta Fase

```
apps/tauri/src/
├── hooks/
│   ├── usePlatform.ts         # detecta mobile vs desktop
│   └── useTheme.ts            # lê/escreve tema no store
├── stores/
│   └── themeStore.ts          # Zustand: light | dark | system
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx       # root layout switcher
│   │   ├── BottomNav.tsx      # navegação mobile (5 tabs)
│   │   ├── Sidebar.tsx        # navegação desktop
│   │   └── TopBar.tsx         # header comum
│   └── ui/
│       └── (componentes shadcn instalados aqui)
├── routes/
│   ├── index.tsx              # React Router config
│   ├── public/
│   │   └── PublicLayout.tsx   # layout área pública
│   ├── auth/
│   │   └── AuthLayout.tsx     # layout autenticação
│   ├── member/
│   │   └── MemberLayout.tsx   # layout área membro
│   └── admin/
│       └── AdminLayout.tsx    # layout área admin
├── App.tsx                    # QueryClientProvider + RouterProvider
└── main.tsx                   # entry point
```

---

## Task 1: Instalar shadcn/ui

**Files:**
- Modify: `apps/tauri/package.json`

- [ ] **Inicializar shadcn/ui**

```bash
cd apps/tauri
npx shadcn@latest init
```

Quando solicitado:
- Style: `Default`
- Base color: `Slate`
- CSS variables: `Yes`

- [ ] **Instalar componentes base**

```bash
npx shadcn@latest add button badge separator scroll-area sheet avatar dropdown-menu
```

- [ ] **Commit**

```bash
git add apps/tauri/src/components/ui/ apps/tauri/components.json
git commit -m "feat(tauri): add shadcn/ui component library"
```

---

## Task 2: Hook usePlatform

**Files:**
- Create: `apps/tauri/src/hooks/usePlatform.ts`

- [ ] **Criar hook**

```typescript
import { useState, useEffect } from "react";

type Platform = "mobile" | "desktop";

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>(() => {
    // @tauri-apps/api/core detecta plataforma em runtime
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("android") || ua.includes("iphone") || ua.includes("ipad")) {
      return "mobile";
    }
    // Verifica window size como fallback para dev
    if (window.innerWidth < 768) return "mobile";
    return "desktop";
  });

  useEffect(() => {
    async function detect() {
      try {
        const { platform: tauriPlatform } = await import("@tauri-apps/plugin-os");
        const mobilePlatforms = ["android", "ios"];
        setPlatform(mobilePlatforms.includes(tauriPlatform()) ? "mobile" : "desktop");
      } catch {
        // fallback já definido no useState
      }
    }
    detect();
  }, []);

  return platform;
}
```

- [ ] **Instalar tauri-plugin-os**

```bash
npm install @tauri-apps/plugin-os
```

Em `src-tauri/Cargo.toml`, adicionar:
```toml
tauri-plugin-os = "2"
```

Em `src-tauri/src/lib.rs`, adicionar ao Builder:
```rust
.plugin(tauri_plugin_os::init())
```

Em `src-tauri/capabilities/default.json`, adicionar à lista de permissions:
```json
"os:default"
```

---

## Task 3: Store de tema

**Files:**
- Create: `apps/tauri/src/stores/themeStore.ts`

- [ ] **Criar store**

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolvedTheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
      setTheme: (theme) => {
        const resolved =
          theme === "system"
            ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
            : theme;
        document.documentElement.classList.toggle("dark", resolved === "dark");
        set({ theme, resolvedTheme: resolved });
      },
    }),
    { name: "filadelfias-theme" }
  )
);
```

---

## Task 4: Componente TopBar

**Files:**
- Create: `apps/tauri/src/components/layout/TopBar.tsx`

- [ ] **Criar TopBar**

```typescript
import { Moon, Sun, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/stores/themeStore";

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function TopBar({ title, showBack, onBack }: TopBarProps) {
  const { resolvedTheme, setTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            ←
          </Button>
        )}
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <Button variant="ghost" size="icon">
          <Bell size={18} />
        </Button>
      </div>
    </header>
  );
}
```

---

## Task 5: Bottom Navigation (mobile)

**Files:**
- Create: `apps/tauri/src/components/layout/BottomNav.tsx`

- [ ] **Criar BottomNav**

```typescript
import { NavLink } from "react-router-dom";
import { Home, BookOpen, Plus, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/biblia", icon: BookOpen, label: "Bíblia" },
  { to: "/member/prayer/new", icon: Plus, label: "" },
  { to: "/member", icon: Users, label: "Membros" },
  { to: "/member/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background safe-area-pb">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-xs transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )
          }
        >
          {to === "/member/prayer/new" ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Icon size={20} />
            </div>
          ) : (
            <>
              <Icon size={22} />
              {label && <span>{label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
```

---

## Task 6: Sidebar (desktop)

**Files:**
- Create: `apps/tauri/src/components/layout/Sidebar.tsx`

- [ ] **Criar Sidebar**

```typescript
import { NavLink } from "react-router-dom";
import {
  Home, BookOpen, Music, BookMarked, Heart, Calendar,
  Users, DollarSign, GraduationCap, Settings, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  {
    label: "Conteúdo",
    items: [
      { to: "/", icon: Home, label: "Início" },
      { to: "/biblia", icon: BookOpen, label: "Bíblia" },
      { to: "/hinario", icon: Music, label: "Hinário" },
      { to: "/manual", icon: BookMarked, label: "Manual IPB" },
    ],
  },
  {
    label: "Comunidade",
    items: [
      { to: "/member/prayer", icon: Heart, label: "Oração" },
      { to: "/member/events", icon: Calendar, label: "Eventos" },
      { to: "/member/directory", icon: Users, label: "Diretório" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { to: "/member/tithes", icon: DollarSign, label: "Dízimos" },
    ],
  },
  {
    label: "Educação",
    items: [
      { to: "/member/ebd", icon: GraduationCap, label: "EBD" },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r bg-background">
      <div className="flex h-14 items-center px-4 font-bold text-primary">
        Filadelfias
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {sections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="mb-1 px-2 text-xs font-medium uppercase text-muted-foreground">
              {section.label}
            </p>
            {section.items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  )
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="border-t p-2">
        <NavLink
          to="/member/profile"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted"
        >
          <Settings size={16} />
          Configurações
        </NavLink>
      </div>
    </aside>
  );
}
```

---

## Task 7: AppShell

**Files:**
- Create: `apps/tauri/src/components/layout/AppShell.tsx`

- [ ] **Criar AppShell**

```typescript
import { Outlet } from "react-router-dom";
import { usePlatform } from "@/hooks/usePlatform";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  const platform = usePlatform();

  if (platform === "desktop") {
    return (
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <TopBar title="Filadelfias" />
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
```

---

## Task 8: Configurar React Router com todas as rotas

**Files:**
- Modify: `apps/tauri/src/App.tsx`
- Create: `apps/tauri/src/routes/index.tsx`

- [ ] **Criar arquivo de rotas**

`apps/tauri/src/routes/index.tsx`:
```typescript
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";

// Placeholders — serão substituídos nas fases seguintes
const Placeholder = ({ name }: { name: string }) => (
  <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
    {name} — em construção
  </div>
);

export const router = createBrowserRouter([
  // Área pública
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Placeholder name="Início" /> },
      { path: "biblia", element: <Placeholder name="Bíblia" /> },
      { path: "biblia/:version/:book/:chapter", element: <Placeholder name="Capítulo" /> },
      { path: "hinario", element: <Placeholder name="Hinário" /> },
      { path: "hinario/:number", element: <Placeholder name="Hino" /> },
      { path: "manual", element: <Placeholder name="Manual IPB" /> },
      { path: "manual/:articleId", element: <Placeholder name="Artigo" /> },

      // Auth
      { path: "auth/login", element: <Placeholder name="Login" /> },
      { path: "auth/register", element: <Placeholder name="Registro" /> },
      { path: "auth/forgot-password", element: <Placeholder name="Esqueceu Senha" /> },
      { path: "auth/reset-password", element: <Placeholder name="Redefinir Senha" /> },

      // Membro (protegido — guard adicionado na Fase 4)
      { path: "member", element: <Placeholder name="Dashboard Membro" /> },
      { path: "member/profile", element: <Placeholder name="Perfil" /> },
      { path: "member/directory", element: <Placeholder name="Diretório" /> },
      { path: "member/devotionals", element: <Placeholder name="Devocionais" /> },
      { path: "member/events", element: <Placeholder name="Eventos" /> },
      { path: "member/missions", element: <Placeholder name="Missões" /> },
      { path: "member/prayer", element: <Placeholder name="Pedidos de Oração" /> },
      { path: "member/prayer/new", element: <Placeholder name="Novo Pedido" /> },
      { path: "member/tithes", element: <Placeholder name="Dízimos" /> },
      { path: "member/expenses", element: <Placeholder name="Despesas" /> },
      { path: "member/ebd", element: <Placeholder name="EBD" /> },

      // Admin (protegido)
      { path: "admin", element: <Placeholder name="Admin Dashboard" /> },
      { path: "admin/members", element: <Placeholder name="Gestão de Membros" /> },
      { path: "admin/tithes", element: <Placeholder name="Aprovar Dízimos" /> },
      { path: "admin/expenses", element: <Placeholder name="Aprovar Despesas" /> },
      { path: "admin/governance", element: <Placeholder name="Governança" /> },

      // Fallback
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
```

- [ ] **Atualizar App.tsx**

```typescript
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "@/routes";
import { useThemeStore } from "@/stores/themeStore";
import { useEffect } from "react";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    setTheme(theme); // aplica tema salvo no DOM
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-center" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Verificar navegação**

```bash
cargo tauri dev
```

Esperado: app abre com Sidebar (desktop) ou BottomNav (mobile), cada rota mostra o placeholder correto.

- [ ] **Commit**

```bash
git add apps/tauri/src/
git commit -m "feat(tauri): implement AppShell with adaptive mobile/desktop navigation"
```

---

## Task 9: Criar utilitário cn()

**Files:**
- Create: `apps/tauri/src/lib/utils.ts`

- [ ] **Criar utils**

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Checklist de Conclusão da Fase 2

- [ ] AppShell renderiza Sidebar em tela >= 768px e BottomNav em tela < 768px
- [ ] Tema claro/escuro funciona e persiste entre sessões
- [ ] Todas as rotas listadas na Task 8 existem e mostram placeholder
- [ ] Navegação entre tabs/links funciona sem erro 404
- [ ] App funciona corretamente em Android, iOS e desktop

**Próximo passo:** [Fase 3 — Conteúdo Público Offline](fase_3.md) ou [Fase 4 — Autenticação](fase_4.md) (paralelas)
