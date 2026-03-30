# Fase 8 — Governança e Admin

> **Para execução:** Use `superpowers:executing-plans` ou `superpowers:subagent-driven-development`.

**Goal:** Implementar a área administrativa: aprovação de dízimos e despesas, gestão de membros, e módulo de governança eclesiástica (assembleias e votações).

**Architecture:** Rotas `/admin/*` protegidas por um guard adicional que verifica se o usuário tem `office` de Pastor, Presbítero ou Diácono. Mutations de aprovação/rejeição com invalidação de cache e feedback via toast.

**Tech Stack:** TanStack Query v5, Zustand (authStore para verificar ofício), React Router v7.

**Referência:** `apps/mobile/app/(admin)/`, `apps/backend/src/modules/` (tithe, expense, governance).

---

## Estrutura de Arquivos desta Fase

```
apps/tauri/src/
├── components/
│   └── auth/
│       └── AdminRoute.tsx         # guard: verifica ofício
├── services/
│   ├── admin.ts                   # aprovações (tithes, expenses, members)
│   └── governance.ts
├── types/
│   └── admin.ts
├── routes/
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── TitheApprovalsScreen.tsx
│       ├── ExpenseApprovalsScreen.tsx
│       ├── MemberManagementScreen.tsx
│       └── GovernanceScreen.tsx
```

---

## Task 1: Guard de admin

**Files:**
- Create: `apps/tauri/src/components/auth/AdminRoute.tsx`

- [ ] **Criar AdminRoute**

```typescript
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const ADMIN_OFFICES = ["pastor", "presbitero", "diacono"];

export function AdminRoute() {
  const user = useAuthStore((s) => s.user);
  const churchId = useAuthStore((s) => s.currentChurchId);

  const church = user?.churches.find((c) => c.id === churchId);
  const hasAdminAccess = church && ADMIN_OFFICES.includes(church.office.toLowerCase());

  if (!hasAdminAccess) {
    return <Navigate to="/member" replace />;
  }

  return <Outlet />;
}
```

- [ ] **Envolver rotas /admin/* com AdminRoute em routes/index.tsx**

```typescript
import { AdminRoute } from "@/components/auth/AdminRoute";

{
  element: <AdminRoute />,
  children: [
    { path: "admin", element: <AdminDashboard /> },
    { path: "admin/tithes", element: <TitheApprovalsScreen /> },
    { path: "admin/expenses", element: <ExpenseApprovalsScreen /> },
    { path: "admin/members", element: <MemberManagementScreen /> },
    { path: "admin/governance", element: <GovernanceScreen /> },
  ],
},
```

---

## Task 2: Tipos e serviços de admin

**Files:**
- Create: `apps/tauri/src/types/admin.ts`
- Create: `apps/tauri/src/services/admin.ts`
- Create: `apps/tauri/src/services/governance.ts`

- [ ] **Criar tipos admin**

```typescript
export interface PendingTithe {
  id: string;
  member_name: string;
  amount: number;
  type: "tithe" | "offering";
  description?: string;
  receipt_url?: string;
  created_at: string;
}

export interface PendingExpense {
  id: string;
  member_name: string;
  amount: number;
  category: string;
  description: string;
  receipt_url?: string;
  created_at: string;
}

export interface Assembly {
  id: string;
  title: string;
  scheduled_at: string;
  status: "scheduled" | "in_progress" | "concluded";
  agenda: string[];
  church_id: string;
}

export interface VotingItem {
  id: string;
  title: string;
  description: string;
  assembly_id: string;
  yes_count: number;
  no_count: number;
  abstain_count: number;
  status: "open" | "closed";
}
```

- [ ] **Criar services/admin.ts**

```typescript
import { api } from "./api";
import type { PendingTithe, PendingExpense } from "@/types/admin";

export const adminService = {
  getPendingTithes: async (churchId: string): Promise<PendingTithe[]> => {
    const { data } = await api.get(`/churches/${churchId}/tithes/pending`);
    return data;
  },

  approveTithe: async (titheId: string): Promise<void> => {
    await api.post(`/tithes/${titheId}/approve`);
  },

  rejectTithe: async (titheId: string, reason: string): Promise<void> => {
    await api.post(`/tithes/${titheId}/reject`, { reason });
  },

  getPendingExpenses: async (churchId: string): Promise<PendingExpense[]> => {
    const { data } = await api.get(`/churches/${churchId}/expenses/pending`);
    return data;
  },

  approveExpense: async (expenseId: string): Promise<void> => {
    await api.post(`/expenses/${expenseId}/approve`);
  },

  rejectExpense: async (expenseId: string, reason: string): Promise<void> => {
    await api.post(`/expenses/${expenseId}/reject`, { reason });
  },
};
```

- [ ] **Criar services/governance.ts**

```typescript
import { api } from "./api";
import type { Assembly, VotingItem } from "@/types/admin";

export const governanceService = {
  getAssemblies: async (churchId: string): Promise<Assembly[]> => {
    const { data } = await api.get(`/churches/${churchId}/assemblies`);
    return data;
  },

  getVotingItems: async (assemblyId: string): Promise<VotingItem[]> => {
    const { data } = await api.get(`/assemblies/${assemblyId}/votes`);
    return data;
  },

  vote: async (itemId: string, choice: "yes" | "no" | "abstain"): Promise<void> => {
    await api.post(`/votes/${itemId}/cast`, { choice });
  },
};
```

---

## Task 3: Dashboard administrativo

**Files:**
- Create: `apps/tauri/src/routes/admin/AdminDashboard.tsx`

- [ ] **Criar AdminDashboard**

```typescript
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { adminService } from "@/services/admin";
import { DollarSign, Receipt, Users, Vote } from "lucide-react";

export function AdminDashboard() {
  const churchId = useAuthStore((s) => s.currentChurchId);

  const { data: pendingTithes } = useQuery({
    queryKey: ["pending-tithes", churchId],
    queryFn: () => adminService.getPendingTithes(churchId!),
    enabled: !!churchId,
    select: (d) => d.length,
  });

  const { data: pendingExpenses } = useQuery({
    queryKey: ["pending-expenses", churchId],
    queryFn: () => adminService.getPendingExpenses(churchId!),
    enabled: !!churchId,
    select: (d) => d.length,
  });

  const cards = [
    { to: "/admin/tithes", icon: DollarSign, label: "Dízimos Pendentes", count: pendingTithes ?? 0 },
    { to: "/admin/expenses", icon: Receipt, label: "Despesas Pendentes", count: pendingExpenses ?? 0 },
    { to: "/admin/members", icon: Users, label: "Membros", count: null },
    { to: "/admin/governance", icon: Vote, label: "Governança", count: null },
  ];

  return (
    <div className="p-4">
      <h1 className="mb-6 text-xl font-bold">Área Administrativa</h1>
      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ to, icon: Icon, label, count }) => (
          <Link
            key={to}
            to={to}
            className="relative flex flex-col items-center justify-center gap-2 rounded-xl border p-6 hover:bg-muted"
          >
            {count !== null && count > 0 && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                {count}
              </span>
            )}
            <Icon size={24} className="text-primary" />
            <span className="text-center text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## Task 4: Aprovação de dízimos

**Files:**
- Create: `apps/tauri/src/routes/admin/TitheApprovalsScreen.tsx`

- [ ] **Criar TitheApprovalsScreen**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { adminService } from "@/services/admin";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function TitheApprovalsScreen() {
  const churchId = useAuthStore((s) => s.currentChurchId);
  const queryClient = useQueryClient();

  const { data: tithes, isLoading } = useQuery({
    queryKey: ["pending-tithes", churchId],
    queryFn: () => adminService.getPendingTithes(churchId!),
    enabled: !!churchId,
  });

  const { mutate: approve } = useMutation({
    mutationFn: adminService.approveTithe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-tithes", churchId] });
      toast.success("Aprovado com sucesso");
    },
  });

  const { mutate: reject } = useMutation({
    mutationFn: (id: string) => adminService.rejectTithe(id, "Rejeitado pelo administrador"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-tithes", churchId] });
      toast.success("Rejeitado");
    },
  });

  if (isLoading) return <div className="p-4 text-muted-foreground">Carregando...</div>;

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Dízimos Pendentes ({tithes?.length ?? 0})</h1>
      {tithes?.length === 0 && (
        <p className="text-muted-foreground">Nenhum dízimo pendente de aprovação.</p>
      )}
      <div className="space-y-3">
        {tithes?.map((tithe) => (
          <div key={tithe.id} className="rounded-lg border p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <p className="font-medium">{tithe.member_name}</p>
                <p className="text-xs text-muted-foreground">
                  {tithe.type === "tithe" ? "Dízimo" : "Oferta"} ·{" "}
                  {format(new Date(tithe.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <p className="text-lg font-bold text-primary">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(tithe.amount)}
              </p>
            </div>
            {tithe.description && (
              <p className="mb-3 text-sm text-muted-foreground">{tithe.description}</p>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => approve(tithe.id)} className="flex-1">
                <Check size={14} className="mr-1" /> Aprovar
              </Button>
              <Button size="sm" variant="outline" onClick={() => reject(tithe.id)} className="flex-1">
                <X size={14} className="mr-1" /> Rejeitar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Task 5: Governança

**Files:**
- Create: `apps/tauri/src/routes/admin/GovernanceScreen.tsx`

- [ ] **Criar GovernanceScreen**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { governanceService } from "@/services/governance";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import type { Assembly } from "@/types/admin";

export function GovernanceScreen() {
  const churchId = useAuthStore((s) => s.currentChurchId);
  const [selectedAssembly, setSelectedAssembly] = useState<Assembly | null>(null);
  const queryClient = useQueryClient();

  const { data: assemblies, isLoading } = useQuery({
    queryKey: ["assemblies", churchId],
    queryFn: () => governanceService.getAssemblies(churchId!),
    enabled: !!churchId,
  });

  const { data: votingItems } = useQuery({
    queryKey: ["voting-items", selectedAssembly?.id],
    queryFn: () => governanceService.getVotingItems(selectedAssembly!.id),
    enabled: !!selectedAssembly,
  });

  const { mutate: castVote } = useMutation({
    mutationFn: ({ itemId, choice }: { itemId: string; choice: "yes" | "no" | "abstain" }) =>
      governanceService.vote(itemId, choice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voting-items", selectedAssembly?.id] });
      toast.success("Voto registrado");
    },
  });

  if (isLoading) return <div className="p-4 text-muted-foreground">Carregando...</div>;

  if (selectedAssembly) {
    return (
      <div className="p-4">
        <button onClick={() => setSelectedAssembly(null)} className="mb-4 text-sm text-primary">
          ← Voltar às assembleias
        </button>
        <h1 className="mb-4 text-xl font-bold">{selectedAssembly.title}</h1>
        <div className="space-y-4">
          {votingItems?.map((item) => (
            <div key={item.id} className="rounded-lg border p-4">
              <p className="mb-1 font-medium">{item.title}</p>
              <p className="mb-3 text-sm text-muted-foreground">{item.description}</p>
              {item.status === "open" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => castVote({ itemId: item.id, choice: "yes" })} className="flex-1">
                    Sim ({item.yes_count})
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => castVote({ itemId: item.id, choice: "no" })} className="flex-1">
                    Não ({item.no_count})
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => castVote({ itemId: item.id, choice: "abstain" })} className="flex-1">
                    Abster ({item.abstain_count})
                  </Button>
                </div>
              )}
              {item.status === "closed" && (
                <p className="text-xs text-muted-foreground">
                  Encerrado · Sim: {item.yes_count} · Não: {item.no_count} · Abstens: {item.abstain_count}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Governança</h1>
      <div className="space-y-3">
        {assemblies?.map((assembly) => (
          <button
            key={assembly.id}
            onClick={() => setSelectedAssembly(assembly)}
            className="flex w-full items-start justify-between rounded-lg border p-4 hover:bg-muted text-left"
          >
            <div>
              <p className="font-medium">{assembly.title}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(assembly.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              assembly.status === "in_progress"
                ? "bg-green-100 text-green-700"
                : assembly.status === "concluded"
                ? "bg-muted text-muted-foreground"
                : "bg-blue-100 text-blue-700"
            }`}>
              {assembly.status === "in_progress" ? "Em andamento"
                : assembly.status === "concluded" ? "Encerrada" : "Agendada"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add apps/tauri/src/
git commit -m "feat(tauri): implement admin area (approvals, member management, governance)"
```

---

## Checklist de Conclusão da Fase 8

- [ ] Rotas `/admin/*` acessíveis apenas por Pastor, Presbítero e Diácono
- [ ] Dashboard exibe contadores de pendências em badges vermelhos
- [ ] Aprovação/rejeição de dízimos atualiza lista imediatamente (cache invalidado)
- [ ] Assembleias listadas com status correto (agendada/em andamento/encerrada)
- [ ] Votação registra voto e atualiza contadores em tempo real

**Próximo passo:** [Fase 9 — UX Desktop](fase_9.md)
