# Tauri — Tema Visual, Navegação Auth-Gated e Correções Técnicas

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o tema azul shadcn pela paleta verde/teal do Filadélfias, implementar navegação auth-gated (Sidebar + BottomNav), e adicionar gate de banco de dados no App.tsx para evitar erros de "no such table".

**Architecture:** Mudanças de CSS puro em `index.css` e `tailwind.config.js` constituem o tema. A lógica de auth-gating lê `useAuthStore` (`isAuthenticated`, `user`, `currentChurchId`) diretamente nos componentes de layout sem nenhuma nova store. O `dbReady` gate em `App.tsx` bloqueia o render do `RouterProvider` até `getDatabase()` resolver.

**Tech Stack:** React 18, Tailwind CSS v3, shadcn/ui CSS vars (HSL), lucide-react, Zustand (`useAuthStore`), Tauri 2.0 (`tauri-plugin-sql`)

**Spec de referência:** `docs/superpowers/specs/2026-03-30-tauri-tema-nav-fixes-design.md`

---

## File Map

| Arquivo | Operação |
|---------|----------|
| `apps/tauri/src/index.css` | Modificar variáveis CSS `--primary` e `--ring` |
| `apps/tauri/tailwind.config.js` | Adicionar cores `mint`, `navy`, `teal` customizadas |
| `apps/tauri/src/components/layout/Sidebar.tsx` | Reescrever com auth-gating + logo gradiente |
| `apps/tauri/src/components/layout/BottomNav.tsx` | Reescrever com tabs condicionais por auth |
| `apps/tauri/src/App.tsx` | Adicionar `dbReady` state gate |

---

## Task 1: Tema — variáveis CSS (index.css)

**Files:**
- Modify: `apps/tauri/src/index.css`

Substituir os tokens `--primary` e `--ring` do tema azul shadcn pelo verde/teal da identidade Filadélfias. Os demais tokens permanecem inalterados (não há necessidade de mudar `--secondary`, `--muted` etc. — o escopo é mínimo).

- [ ] **Step 1: Editar `index.css` — substituir primary/ring no `:root`**

Localizar o bloco `:root` e substituir as linhas `--primary` e `--ring`:

```css
/* ANTES */
--primary: 221.2 83.2% 53.3%;
--primary-foreground: 210 40% 98%;
/* ... */
--ring: 221.2 83.2% 53.3%;

/* DEPOIS */
--primary: 142.1 76.2% 36.3%;
--primary-foreground: 0 0% 100%;
/* ... */
--ring: 142.1 76.2% 36.3%;
```

O arquivo `apps/tauri/src/index.css` completo após a edição:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 142.1 76.2% 36.3%;
    --primary-foreground: 0 0% 100%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 142.1 76.2% 36.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 142.1 76.2% 36.3%;
    --primary-foreground: 0 0% 100%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 142.1 76.2% 36.3%;
  }

  * {
    border-color: hsl(var(--border));
  }

  html {
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  body {
    margin: 0;
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    -webkit-user-select: none;
    user-select: none;
  }

  @media (min-width: 768px) {
    body {
      font-size: 15px;
    }
  }
}
```

- [ ] **Step 2: Verificar visualmente**

Rodar o app (`cd apps/tauri && npm run dev`) e confirmar que botões e links ativos aparecem em verde, não azul. Não é necessário teste automatizado — mudança é puramente visual e auditável a olho.

- [ ] **Step 3: Commit**

```bash
git add apps/tauri/src/index.css
git commit -m "style(tauri): replace shadcn blue theme with green/teal brand colors"
```

---

## Task 2: Tailwind — cores customizadas

**Files:**
- Modify: `apps/tauri/tailwind.config.js`

Adicionar as três cores de marca usadas na identidade Filadélfias. São necessárias para as classes Tailwind utilizadas no Sidebar e BottomNav re-escritos.

- [ ] **Step 1: Editar `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        mint: {
          50: "#DEEFE7",
        },
        navy: {
          900: "#002333",
        },
        teal: {
          500: "#159A9C",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/tauri/tailwind.config.js
git commit -m "style(tauri): add brand custom colors (mint-50, navy-900, teal-500) to Tailwind"
```

---

## Task 3: Sidebar — auth-gating + novo tema

**Files:**
- Modify: `apps/tauri/src/components/layout/Sidebar.tsx`

Reescrever o Sidebar para:
1. Logo com ícone `Church` + gradiente verde→teal em vez de texto simples azul
2. Seção "Conteúdo" sempre visível (Início, Bíblia, Hinário, Manual IPB, Downloads)
3. Sem login: card "Minha Igreja" no rodapé com ícone `Church`, subtítulo "Entrar para acessar" → navega para `/auth/login`
4. Com login: seção "Minha Igreja" (label = nome da igreja) com todos os itens de membro + seção Admin condicional; rodapé mostra avatar + nome + link Configurações

Item ativo usa `bg-gradient-to-r from-green-50 to-teal-50 text-green-700 font-semibold` com ícone em gradiente. Item inativo usa `text-slate-600 hover:bg-slate-50`.

- [ ] **Step 1: Reescrever `Sidebar.tsx` completo**

```tsx
import {
  BookMarked,
  BookOpen,
  Calendar,
  Church,
  DollarSign,
  Download,
  GraduationCap,
  Heart,
  Home,
  Music,
  Settings,
  Users,
  Vote,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const publicItems = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/biblia", icon: BookOpen, label: "Bíblia" },
  { to: "/hinario", icon: Music, label: "Hinário" },
  { to: "/manual", icon: BookMarked, label: "Manual IPB" },
  { to: "/downloads", icon: Download, label: "Downloads" },
];

const memberItems = [
  { to: "/member/prayer", icon: Heart, label: "Oração" },
  { to: "/member/events", icon: Calendar, label: "Eventos" },
  { to: "/member/directory", icon: Users, label: "Diretório" },
  { to: "/member/tithes", icon: DollarSign, label: "Dízimos" },
  { to: "/member/expenses", icon: DollarSign, label: "Despesas" },
  { to: "/member/ebd", icon: GraduationCap, label: "EBD" },
];

const adminItems = [
  { to: "/admin", icon: Vote, label: "Painel Admin" },
  { to: "/admin/governance", icon: Vote, label: "Governança" },
];

function NavItem({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
          isActive
            ? "bg-gradient-to-r from-green-50 to-teal-50 font-semibold text-green-700"
            : "text-slate-600 hover:bg-slate-50",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "flex items-center justify-center rounded-md p-1",
              isActive
                ? "bg-gradient-to-br from-green-700 to-teal-600 text-white"
                : "bg-slate-100 text-slate-500",
            )}
          >
            <Icon size={13} />
          </span>
          {label}
        </>
      )}
    </NavLink>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="mb-1 mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </p>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const currentChurchId = useAuthStore((state) => state.currentChurchId);

  const currentChurch = user?.churches.find((c) => c.id === currentChurchId);
  const churchName = currentChurch?.name ?? "Minha Igreja";
  const office = currentChurch?.office?.toLowerCase() ?? "";
  const role = currentChurch?.role?.toLowerCase() ?? "";
  const hasAdminAccess =
    ["pastor", "presbitero", "diacono"].includes(office) || role === "admin";

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b px-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-700 to-teal-600 text-white">
          <Church size={14} />
        </span>
        <span className="bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-[15px] font-extrabold text-transparent">
          Filadélfias
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <SectionLabel label="Conteúdo" />
        <div className="space-y-0.5">
          {publicItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>

        {isAuthenticated && (
          <>
            <SectionLabel label={churchName} />
            <div className="space-y-0.5">
              {memberItems.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>

            {hasAdminAccess && (
              <>
                <SectionLabel label="Admin" />
                <div className="space-y-0.5">
                  {adminItems.map((item) => (
                    <NavItem key={item.to} {...item} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t p-2">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-teal-600 text-sm font-bold text-white">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">{user.name}</p>
              {currentChurch?.office && (
                <p className="truncate text-[10px] text-slate-400">{currentChurch.office}</p>
              )}
            </div>
            <NavLink
              to="/member/profile"
              className="rounded p-1 text-slate-400 hover:text-slate-600"
              title="Configurações"
            >
              <Settings size={14} />
            </NavLink>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/auth/login")}
            className="flex w-full items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-left transition-colors hover:bg-green-100"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-green-700 to-teal-600 text-white">
              <Church size={14} />
            </span>
            <div>
              <p className="text-xs font-semibold text-green-700">Minha Igreja</p>
              <p className="text-[10px] text-green-600">Entrar para acessar</p>
            </div>
            <span className="ml-auto text-green-400">→</span>
          </button>
        )}
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Verificar manualmente (sem e com autenticação simulada)**

No app em dev, confirmar:
- Logo mostra ícone Church com gradiente verde→teal e texto "Filadélfias" em gradiente
- Seção "Conteúdo" lista os 5 itens públicos
- Footer mostra card "Minha Igreja" quando não autenticado
- Item ativo tem fundo gradiente verde claro, ícone com fundo gradiente escuro
- Sem erros no console

- [ ] **Step 3: Commit**

```bash
git add apps/tauri/src/components/layout/Sidebar.tsx
git commit -m "feat(tauri): auth-gated sidebar with brand theme and Minha Igreja card"
```

---

## Task 4: BottomNav — tabs condicionais por auth

**Files:**
- Modify: `apps/tauri/src/components/layout/BottomNav.tsx`

Reescrever o BottomNav para 5 tabs fixos cuja composição muda com o estado de autenticação:

| Posição | Sem login | Com login |
|---------|-----------|-----------|
| 1 | Início (Home) | Início (Home) |
| 2 | Bíblia (BookOpen) | Bíblia (BookOpen) |
| 3 | Hinário (Music) | Oração (Heart) |
| 4 | Manual (BookMarked) | Comunidade (Users) → `/member/directory` |
| 5 | Entrar (Church) → `/auth/login` | Perfil (User) → `/member/profile` |

Tab ativo: `text-green-700`. Tab inativo: `text-slate-400`. O tab "Entrar" (posição 5 sem login) tem cor `text-green-600` mesmo inativo para se destacar como CTA.

- [ ] **Step 1: Reescrever `BottomNav.tsx` completo**

```tsx
import { BookMarked, BookOpen, Church, Heart, Home, Music, User, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

interface Tab {
  to: string;
  icon: typeof Home;
  label: string;
  cta?: boolean;
}

const publicTabs: Tab[] = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/biblia", icon: BookOpen, label: "Bíblia" },
  { to: "/hinario", icon: Music, label: "Hinário" },
  { to: "/manual", icon: BookMarked, label: "Manual" },
  { to: "/auth/login", icon: Church, label: "Entrar", cta: true },
];

const authTabs: Tab[] = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/biblia", icon: BookOpen, label: "Bíblia" },
  { to: "/member/prayer", icon: Heart, label: "Oração" },
  { to: "/member/directory", icon: Users, label: "Comunidade" },
  { to: "/member/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const tabs = isAuthenticated ? authTabs : publicTabs;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t bg-white/95 px-2 backdrop-blur">
      {tabs.map(({ to, icon: Icon, label, cta }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            cn(
              "flex min-w-12 flex-col items-center justify-center gap-0.5 rounded-md px-2 py-1 text-[10px] transition-colors",
              isActive
                ? "text-green-700"
                : cta
                  ? "text-green-600"
                  : "text-slate-400",
            )
          }
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Verificar manualmente**

No app em dev (mobile viewport, ≤ 768px), confirmar:
- 5 tabs visíveis com ícones corretos
- Tab "Entrar" aparece em verde mesmo sem estar ativo
- Nenhum erro no console sobre imports não encontrados

- [ ] **Step 3: Commit**

```bash
git add apps/tauri/src/components/layout/BottomNav.tsx
git commit -m "feat(tauri): auth-gated bottom nav with conditional tabs per auth state"
```

---

## Task 5: App.tsx — gate dbReady

**Files:**
- Modify: `apps/tauri/src/App.tsx`

**Problema:** `getDatabase()` é chamado num `useEffect` assíncrono. Se o usuário navegar para Bíblia ou Downloads antes da migration completar, os `select()`s falham com "no such table".

**Fix:** Estado `dbReady` no `ThemeProvider`. Enquanto `false`, renderiza uma tela de loading leve. Só libera o `RouterProvider` após `getDatabase()` resolver. O `catch` também seta `dbReady = true` para não bloquear em caso de falha.

- [ ] **Step 1: Editar `App.tsx`**

```tsx
import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { getDatabase } from "@/lib/database";
import { router } from "@/routes";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { listen } from "@tauri-apps/api/event";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useThemeStore();
  const initialize = useAuthStore((state) => state.initialize);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    setTheme(theme);
  }, [setTheme, theme]);

  useEffect(() => {
    getDatabase()
      .then(() => setDbReady(true))
      .catch(() => setDbReady(true)); // never block on DB error
  }, []);

  useEffect(() => {
    initialize().catch(console.error);
  }, [initialize]);

  // Handle navigation events emitted from Tauri native menus (desktop only).
  // Using router.navigate() preserves React state instead of doing a full reload.
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    listen<string>("navigate", (event) => {
      router.navigate(event.payload).catch(console.error);
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch(() => {
        // Not running inside Tauri (e.g. plain browser dev) — no-op.
      });

    return () => {
      unlisten?.();
    };
  }, []);

  if (!dbReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-700 to-teal-600 text-white">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          </span>
          <p className="text-sm text-slate-400">Carregando…</p>
        </div>
      </div>
    );
  }

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

- [ ] **Step 2: Verificar**

Rodar o app. Ao inicializar, deve aparecer brevemente uma tela com o ícone gradiente e "Carregando…" antes do app renderizar. Não deve haver erros de "no such table" ao navegar imediatamente.

- [ ] **Step 3: Commit**

```bash
git add apps/tauri/src/App.tsx
git commit -m "fix(tauri): gate RouterProvider behind dbReady to prevent no-such-table errors"
```

---

## Task 6: Verificar correções já aplicadas

**Files:** Nenhuma modificação — apenas verificação.

As correções abaixo foram aplicadas em sessão anterior. Esta task confirma que estão corretas antes de finalizar o branch.

- [ ] **Step 1: Verificar `capabilities/default.json`**

Ler o arquivo e confirmar que contém:
- `"windows": ["main"]`
- `"sql:allow-execute"` no array permissions
- `"sql:allow-select"` no array permissions

```bash
cat apps/tauri/src-tauri/capabilities/default.json
```

Resultado esperado: arquivo com todos os três campos presentes (já confirmado em sessão anterior, mas verificar novamente).

- [ ] **Step 2: Verificar `capabilities/desktop-updater.json`**

```bash
cat apps/tauri/src-tauri/capabilities/desktop-updater.json
```

Confirmar que contém `"windows": ["main"]`.

- [ ] **Step 3: Verificar `src-tauri/src/lib.rs` — TrayState**

```bash
grep -n "TrayState\|app.manage" apps/tauri/src-tauri/src/lib.rs
```

Resultado esperado: linhas com `struct TrayState` e `app.manage(TrayState(...))`.

- [ ] **Step 4: Commit (apenas se houver alguma divergência encontrada)**

Se alguma das verificações falhar, corrigir o arquivo e commitar:

```bash
git add <arquivo corrigido>
git commit -m "fix(tauri): correct capability/tray fix that was missing from previous session"
```

Se tudo estiver correto, nenhum commit é necessário nesta task.
