# Fase 4 — Autenticação e Segurança

> **Para execução:** Use `superpowers:executing-plans` ou `superpowers:subagent-driven-development`.

**Goal:** Implementar fluxo completo de autenticação (login, registro, recuperação de senha), armazenamento seguro de tokens JWT via `tauri-plugin-store`, proteção de rotas e interceptor Axios com refresh automático.

**Architecture:** `authService` faz chamadas HTTP ao backend. `secureStore` persiste tokens no keychain nativo via tauri-plugin-store. `authStore` (Zustand) mantém estado em memória. `ProtectedRoute` redireciona usuários não autenticados. Axios interceptor adiciona Bearer token e faz refresh automático em 401.

**Tech Stack:** tauri-plugin-store, Zustand, Axios interceptors, React Hook Form + Zod, React Router v7.

**Referência:** `apps/mobile/src/stores/authStore.ts`, `apps/mobile/src/services/api.ts`, `apps/mobile/app/(auth)/`.

---

## Estrutura de Arquivos desta Fase

```
apps/tauri/src/
├── services/
│   ├── api.ts                    # atualizar: adicionar interceptores
│   └── auth.ts                   # login, register, refresh, logout
├── lib/
│   └── secureStore.ts            # wrapper sobre tauri-plugin-store
├── stores/
│   └── authStore.ts              # Zustand: user, tokens, isAuthenticated
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx    # guard de rotas autenticadas
├── routes/
│   └── auth/
│       ├── LoginScreen.tsx
│       ├── RegisterScreen.tsx
│       ├── ForgotPasswordScreen.tsx
│       └── ResetPasswordScreen.tsx
```

---

## Task 1: Wrapper de armazenamento seguro

**Files:**
- Create: `apps/tauri/src/lib/secureStore.ts`

- [ ] **Instalar plugin store no npm**

```bash
cd apps/tauri
npm install @tauri-apps/plugin-store
```

- [ ] **Criar secureStore**

```typescript
import { Store } from "@tauri-apps/plugin-store";

let store: Store | null = null;

async function getStore(): Promise<Store> {
  if (!store) {
    store = await Store.load("auth.bin");
  }
  return store;
}

export const secureStore = {
  async set(key: string, value: string): Promise<void> {
    const s = await getStore();
    await s.set(key, value);
    await s.save();
  },

  async get(key: string): Promise<string | null> {
    const s = await getStore();
    return (await s.get<string>(key)) ?? null;
  },

  async delete(key: string): Promise<void> {
    const s = await getStore();
    await s.delete(key);
    await s.save();
  },

  async clear(): Promise<void> {
    const s = await getStore();
    await s.clear();
    await s.save();
  },
};
```

---

## Task 2: Tipos e schemas de autenticação

**Files:**
- Create: `apps/tauri/src/types/auth.ts`

- [ ] **Criar tipos e schemas Zod**

```typescript
import { z } from "zod";

export interface User {
  id: string;
  name: string;
  email: string;
  churches: {
    id: string;
    name: string;
    role: string;
    office: string;
  }[];
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  passwordConfirm: z.string(),
}).refine((d) => d.password === d.passwordConfirm, {
  message: "Senhas não coincidem",
  path: ["passwordConfirm"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  passwordConfirm: z.string(),
}).refine((d) => d.password === d.passwordConfirm, {
  message: "Senhas não coincidem",
  path: ["passwordConfirm"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
```

---

## Task 3: Auth Service

**Files:**
- Create: `apps/tauri/src/services/auth.ts`

- [ ] **Criar serviço de autenticação**

```typescript
import { api } from "./api";
import type { User, AuthTokens, LoginInput, RegisterInput } from "@/types/auth";

export const authService = {
  login: async (data: LoginInput): Promise<{ user: User; tokens: AuthTokens }> => {
    const { data: result } = await api.post("/auth/login", data);
    return result;
  },

  register: async (data: Omit<RegisterInput, "passwordConfirm">): Promise<{ user: User; tokens: AuthTokens }> => {
    const { data: result } = await api.post("/auth/register", data);
    return result;
  },

  refreshToken: async (refresh_token: string): Promise<AuthTokens> => {
    const { data } = await api.post("/auth/refresh", { refresh_token });
    return data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post("/auth/reset-password", { token, password });
  },

  getProfile: async (): Promise<User> => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};
```

---

## Task 4: Auth Store

**Files:**
- Create: `apps/tauri/src/stores/authStore.ts`

- [ ] **Criar authStore**

```typescript
import { create } from "zustand";
import { secureStore } from "@/lib/secureStore";
import { authService } from "@/services/auth";
import type { User, AuthTokens } from "@/types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentChurchId: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (tokens: AuthTokens) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  currentChurchId: null,

  initialize: async () => {
    try {
      const token = await secureStore.get("access_token");
      if (!token) return set({ isLoading: false });
      const user = await authService.getProfile();
      set({
        user,
        isAuthenticated: true,
        currentChurchId: user.churches[0]?.id ?? null,
        isLoading: false,
      });
    } catch {
      await secureStore.clear();
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const { user, tokens } = await authService.login({ email, password });
    await get().setTokens(tokens);
    set({
      user,
      isAuthenticated: true,
      currentChurchId: user.churches[0]?.id ?? null,
    });
  },

  logout: async () => {
    await secureStore.clear();
    set({ user: null, isAuthenticated: false, currentChurchId: null });
  },

  setTokens: async (tokens) => {
    await secureStore.set("access_token", tokens.access_token);
    await secureStore.set("refresh_token", tokens.refresh_token);
  },

  getAccessToken: () => secureStore.get("access_token"),
  getRefreshToken: () => secureStore.get("refresh_token"),
}));
```

---

## Task 5: Atualizar api.ts com interceptores

**Files:**
- Modify: `apps/tauri/src/services/api.ts`

- [ ] **Adicionar interceptores de auth + refresh**

```typescript
import axios, { AxiosError } from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.filadelfias.com";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Injeta Bearer token
api.interceptors.request.use(async (config) => {
  // Import dinâmico para evitar circular dependency
  const { useAuthStore } = await import("@/stores/authStore");
  const token = await useAuthStore.getState().getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh automático em 401
let isRefreshing = false;
let failedQueue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers!.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { useAuthStore } = await import("@/stores/authStore");
        const refreshToken = await useAuthStore.getState().getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        const { authService } = await import("./auth");
        const tokens = await authService.refreshToken(refreshToken);
        await useAuthStore.getState().setTokens(tokens);

        failedQueue.forEach((p) => p.resolve(tokens.access_token));
        failedQueue = [];

        originalRequest.headers!.Authorization = `Bearer ${tokens.access_token}`;
        return api(originalRequest);
      } catch (err) {
        failedQueue.forEach((p) => p.reject(err));
        failedQueue = [];
        const { useAuthStore } = await import("@/stores/authStore");
        await useAuthStore.getState().logout();
        window.location.href = "/auth/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

---

## Task 6: Tela de Login

**Files:**
- Create: `apps/tauri/src/routes/auth/LoginScreen.tsx`

- [ ] **Criar LoginScreen**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { loginSchema, type LoginInput } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LoginScreen() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data.email, data.password);
      navigate("/member");
    } catch (err: unknown) {
      toast.error("E-mail ou senha incorretos");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold">Filadelfias</h1>
        <p className="mb-8 text-sm text-muted-foreground">Entre na sua conta</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="seu@email.com"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Senha</label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link to="/auth/forgot-password" className="text-primary hover:underline">
            Esqueceu a senha?
          </Link>
          <Link to="/auth/register" className="text-primary hover:underline">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 7: ProtectedRoute + inicialização de auth

**Files:**
- Create: `apps/tauri/src/components/auth/ProtectedRoute.tsx`
- Modify: `apps/tauri/src/App.tsx`

- [ ] **Criar ProtectedRoute**

```typescript
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
}
```

- [ ] **Atualizar App.tsx para inicializar auth no startup**

Dentro do `ThemeProvider`, adicionar:
```typescript
const initialize = useAuthStore((s) => s.initialize);
useEffect(() => {
  initialize();
}, []);
```

- [ ] **Atualizar rotas para usar ProtectedRoute**

Em `routes/index.tsx`, envolver rotas de membro e admin:
```typescript
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Adicionar wrapper nas rotas /member/* e /admin/*
{
  element: <ProtectedRoute />,
  children: [
    { path: "member", element: <Placeholder name="Dashboard" /> },
    { path: "member/profile", element: <Placeholder name="Perfil" /> },
    // ... demais rotas member
    { path: "admin", element: <Placeholder name="Admin" /> },
    // ... demais rotas admin
  ],
},
```

- [ ] **Commit**

```bash
git add apps/tauri/src/
git commit -m "feat(tauri): implement authentication with JWT, secure store and route guards"
```

---

## Checklist de Conclusão da Fase 4

- [ ] Login funciona com credenciais reais da API
- [ ] Token JWT armazenado no keychain nativo (tauri-plugin-store)
- [ ] Refresh automático acontece transparentemente em 401
- [ ] Rotas `/member/*` e `/admin/*` redirecionam para login se não autenticado
- [ ] Logout apaga tokens do store seguro
- [ ] App restaura sessão ao reiniciar (token persiste)

**Próximo passo:** [Fase 5 — Área do Membro Core](fase_5.md)
