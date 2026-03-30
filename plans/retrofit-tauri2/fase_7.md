# Fase 7 — Financeiro e Educação

> **Para execução:** Use `superpowers:executing-plans` ou `superpowers:subagent-driven-development`.

**Goal:** Implementar módulos de dízimos/ofertas (envio de comprovante + histórico), despesas/reembolsos, e EBD (classes, lições e frequência).

**Architecture:** Mesmo padrão das fases anteriores. Upload de comprovantes via `tauri-plugin-fs` + form multipart. EBD tem hierarquia: classes → lições → frequência.

**Tech Stack:** TanStack Query v5, React Hook Form + Zod, tauri-plugin-fs, date-fns.

**Referência:** `apps/mobile/src/services/tithe.ts`, `apps/mobile/src/services/ebd.ts`, `apps/mobile/app/(member)/tithes.tsx`, `apps/mobile/app/(member)/ebd.tsx`.

---

## Estrutura de Arquivos desta Fase

```
apps/tauri/src/
├── services/
│   ├── tithe.ts
│   ├── expense.ts
│   └── ebd.ts
├── types/
│   └── financial.ts
├── routes/
│   └── member/
│       ├── TithesScreen.tsx
│       ├── NewTitheScreen.tsx
│       ├── ExpensesScreen.tsx
│       ├── NewExpenseScreen.tsx
│       ├── EBDScreen.tsx
│       └── EBDClassScreen.tsx
```

---

## Task 1: Tipos financeiros

**Files:**
- Create: `apps/tauri/src/types/financial.ts`

- [ ] **Criar tipos**

```typescript
export type TitheStatus = "pending" | "approved" | "rejected";
export type ExpenseStatus = "pending" | "approved" | "rejected";
export type ExpenseCategory = "material" | "cleaning" | "transport" | "food" | "maintenance" | "bills" | "other";

export interface Tithe {
  id: string;
  amount: number;
  type: "tithe" | "offering";
  description?: string;
  receipt_url?: string;
  status: TitheStatus;
  month: number;
  year: number;
  created_at: string;
  member_id: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  receipt_url?: string;
  status: ExpenseStatus;
  created_at: string;
  member_id: string;
}

export interface EBDClass {
  id: string;
  name: string;
  teacher_name: string;
  age_range?: string;
  church_id: string;
}

export interface EBDLesson {
  id: string;
  title: string;
  date: string;
  class_id: string;
  quarter: number;
  year: number;
}

export interface EBDAttendance {
  lesson_id: string;
  member_id: string;
  present: boolean;
}
```

---

## Task 2: Serviços financeiros

**Files:**
- Create: `apps/tauri/src/services/tithe.ts`
- Create: `apps/tauri/src/services/expense.ts`
- Create: `apps/tauri/src/services/ebd.ts`

- [ ] **Criar tithe.ts**

```typescript
import { api } from "./api";
import type { Tithe } from "@/types/financial";

export const titheService = {
  getTithes: async (): Promise<Tithe[]> => {
    const { data } = await api.get("/tithes/me");
    return data;
  },

  createTithe: async (payload: FormData): Promise<Tithe> => {
    const { data } = await api.post("/tithes", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
```

- [ ] **Criar expense.ts**

```typescript
import { api } from "./api";
import type { Expense } from "@/types/financial";

export const expenseService = {
  getExpenses: async (): Promise<Expense[]> => {
    const { data } = await api.get("/expenses/me");
    return data;
  },

  createExpense: async (payload: FormData): Promise<Expense> => {
    const { data } = await api.post("/expenses", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
```

- [ ] **Criar ebd.ts**

```typescript
import { api } from "./api";
import type { EBDClass, EBDLesson, EBDAttendance } from "@/types/financial";

export const ebdService = {
  getClasses: async (churchId: string): Promise<EBDClass[]> => {
    const { data } = await api.get(`/churches/${churchId}/ebd/classes`);
    return data;
  },

  getLessons: async (classId: string): Promise<EBDLesson[]> => {
    const { data } = await api.get(`/ebd/classes/${classId}/lessons`);
    return data;
  },

  getAttendance: async (lessonId: string): Promise<EBDAttendance[]> => {
    const { data } = await api.get(`/ebd/lessons/${lessonId}/attendance`);
    return data;
  },

  markAttendance: async (lessonId: string, memberId: string, present: boolean): Promise<void> => {
    await api.post(`/ebd/lessons/${lessonId}/attendance`, { member_id: memberId, present });
  },
};
```

---

## Task 3: Tela de Dízimos

**Files:**
- Create: `apps/tauri/src/routes/member/TithesScreen.tsx`
- Create: `apps/tauri/src/routes/member/NewTitheScreen.tsx`

- [ ] **Criar TithesScreen**

```typescript
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { titheService } from "@/services/tithe";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusIcon = {
  approved: <CheckCircle size={14} className="text-green-500" />,
  pending: <Clock size={14} className="text-yellow-500" />,
  rejected: <XCircle size={14} className="text-destructive" />,
};

const statusLabel = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Rejeitado",
};

export function TithesScreen() {
  const navigate = useNavigate();

  const { data: tithes, isLoading } = useQuery({
    queryKey: ["tithes"],
    queryFn: titheService.getTithes,
  });

  const total = tithes
    ?.filter((t) => t.status === "approved")
    .reduce((sum, t) => sum + t.amount, 0) ?? 0;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Dízimos e Ofertas</h1>
        <Button size="sm" onClick={() => navigate("/member/tithes/new")}>
          <Plus size={16} className="mr-1" /> Registrar
        </Button>
      </div>

      <div className="mb-6 rounded-lg border bg-primary/5 p-4 text-center">
        <p className="text-xs text-muted-foreground uppercase">Total aprovado este ano</p>
        <p className="text-2xl font-bold text-primary">
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {tithes?.map((tithe) => (
            <div key={tithe.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium capitalize">{tithe.type === "tithe" ? "Dízimo" : "Oferta"}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(tithe.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(tithe.amount)}
                </p>
                <span className="flex items-center gap-1 justify-end text-xs text-muted-foreground">
                  {statusIcon[tithe.status]}
                  {statusLabel[tithe.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Criar NewTitheScreen**

```typescript
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { titheService } from "@/services/tithe";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Paperclip } from "lucide-react";

const schema = z.object({
  amount: z.string().min(1, "Informe o valor").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Valor inválido"),
  type: z.enum(["tithe", "offering"]),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function NewTitheScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "tithe" },
  });

  const { mutateAsync } = useMutation({
    mutationFn: titheService.createTithe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tithes"] }),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const form = new FormData();
      form.append("amount", data.amount);
      form.append("type", data.type);
      if (data.description) form.append("description", data.description);
      if (fileRef.current?.files?.[0]) form.append("receipt", fileRef.current.files[0]);
      await mutateAsync(form);
      toast.success("Registro enviado para aprovação");
      navigate("/member/tithes");
    } catch {
      toast.error("Erro ao enviar registro");
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-6 text-xl font-bold">Registrar Dízimo / Oferta</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Tipo</label>
          <select {...register("type")} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="tithe">Dízimo</option>
            <option value="offering">Oferta</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Valor (R$)</label>
          <input {...register("amount")} type="number" step="0.01" min="0"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="0,00" />
          {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Observação (opcional)</label>
          <input {...register("description")} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} className="w-full">
            <Paperclip size={16} className="mr-2" />
            {fileName ?? "Anexar comprovante"}
          </Button>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar para aprovação"}
        </Button>
      </form>
    </div>
  );
}
```

---

## Task 4: EBD

**Files:**
- Create: `apps/tauri/src/routes/member/EBDScreen.tsx`
- Create: `apps/tauri/src/routes/member/EBDClassScreen.tsx`

- [ ] **Criar EBDScreen (lista de classes)**

```typescript
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { ebdService } from "@/services/ebd";
import { GraduationCap } from "lucide-react";

export function EBDScreen() {
  const navigate = useNavigate();
  const churchId = useAuthStore((s) => s.currentChurchId);

  const { data: classes, isLoading } = useQuery({
    queryKey: ["ebd-classes", churchId],
    queryFn: () => ebdService.getClasses(churchId!),
    enabled: !!churchId,
  });

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">EBD</h1>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="space-y-3">
          {classes?.map((cls) => (
            <button
              key={cls.id}
              onClick={() => navigate(`/member/ebd/${cls.id}`)}
              className="flex w-full items-center gap-3 rounded-lg border p-4 hover:bg-muted text-left"
            >
              <GraduationCap size={20} className="text-primary shrink-0" />
              <div>
                <p className="font-medium">{cls.name}</p>
                <p className="text-sm text-muted-foreground">Prof. {cls.teacher_name}</p>
                {cls.age_range && <p className="text-xs text-muted-foreground">{cls.age_range}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Criar EBDClassScreen (lições da classe)**

```typescript
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { ebdService } from "@/services/ebd";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookOpen } from "lucide-react";

export function EBDClassScreen() {
  const { classId } = useParams<{ classId: string }>();

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["ebd-lessons", classId],
    queryFn: () => ebdService.getLessons(classId!),
    enabled: !!classId,
  });

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Lições</h1>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="space-y-2">
          {lessons?.map((lesson) => (
            <div key={lesson.id} className="flex items-center gap-3 rounded-lg border p-3">
              <BookOpen size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">{lesson.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(lesson.date), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Atualizar rotas em routes/index.tsx**

Substituir placeholders de `/member/tithes`, `/member/ebd`:
```typescript
import { TithesScreen } from "@/routes/member/TithesScreen";
import { NewTitheScreen } from "@/routes/member/NewTitheScreen";
import { EBDScreen } from "@/routes/member/EBDScreen";
import { EBDClassScreen } from "@/routes/member/EBDClassScreen";

{ path: "member/tithes", element: <TithesScreen /> },
{ path: "member/tithes/new", element: <NewTitheScreen /> },
{ path: "member/ebd", element: <EBDScreen /> },
{ path: "member/ebd/:classId", element: <EBDClassScreen /> },
```

- [ ] **Commit**

```bash
git add apps/tauri/src/
git commit -m "feat(tauri): implement tithes, expenses and EBD modules"
```

---

## Checklist de Conclusão da Fase 7

- [ ] Lista de dízimos exibe histórico com status (aprovado/pendente/rejeitado)
- [ ] Total aprovado do ano calculado e exibido
- [ ] Formulário de novo dízimo aceita valor, tipo e comprovante
- [ ] EBD lista classes com nome do professor
- [ ] Lições da classe listadas com data

**Próximo passo:** [Fase 8 — Governança e Admin](fase_8.md)
