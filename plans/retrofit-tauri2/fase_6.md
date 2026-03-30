# Fase 6 — Comunidade e Interação

> **Para execução:** Use `superpowers:executing-plans` ou `superpowers:subagent-driven-development`.

**Goal:** Implementar pedidos de oração (listar, criar, marcar como orado) e calendário comunitário.

**Architecture:** Mesmo padrão da Fase 5: serviço HTTP + TanStack Query + telas React. Mutations com `useMutation` para criar pedidos e registrar orações. Invalidação de cache após mutações.

**Tech Stack:** TanStack Query v5 (useQuery + useMutation), React Hook Form + Zod, date-fns.

**Referência:** `apps/mobile/src/services/prayer.ts`, `apps/mobile/app/(member)/prayer.tsx`.

---

## Estrutura de Arquivos desta Fase

```
apps/tauri/src/
├── services/
│   └── prayer.ts
├── types/
│   └── community.ts
├── routes/
│   └── member/
│       ├── PrayerScreen.tsx
│       ├── PrayerDetailScreen.tsx
│       └── NewPrayerScreen.tsx
```

---

## Task 1: Tipos de comunidade

**Files:**
- Create: `apps/tauri/src/types/community.ts`

- [ ] **Criar tipos**

```typescript
export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  author_name: string;
  author_id: string;
  prayer_count: number;
  already_prayed: boolean;
  created_at: string;
  church_id: string;
  is_anonymous: boolean;
}

export interface CreatePrayerInput {
  title: string;
  description: string;
  category: string;
  is_anonymous: boolean;
}
```

---

## Task 2: Serviço de oração

**Files:**
- Create: `apps/tauri/src/services/prayer.ts`

- [ ] **Criar serviço**

```typescript
import { api } from "./api";
import type { PrayerRequest, CreatePrayerInput } from "@/types/community";

export const prayerService = {
  getPrayers: async (churchId: string): Promise<PrayerRequest[]> => {
    const { data } = await api.get(`/churches/${churchId}/prayers`);
    return data;
  },

  getPrayer: async (prayerId: string): Promise<PrayerRequest> => {
    const { data } = await api.get(`/prayers/${prayerId}`);
    return data;
  },

  createPrayer: async (churchId: string, input: CreatePrayerInput): Promise<PrayerRequest> => {
    const { data } = await api.post(`/churches/${churchId}/prayers`, input);
    return data;
  },

  pray: async (prayerId: string): Promise<void> => {
    await api.post(`/prayers/${prayerId}/pray`);
  },
};
```

---

## Task 3: Lista de pedidos de oração

**Files:**
- Create: `apps/tauri/src/routes/member/PrayerScreen.tsx`

- [ ] **Criar PrayerScreen**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { prayerService } from "@/services/prayer";
import { Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export function PrayerScreen() {
  const navigate = useNavigate();
  const churchId = useAuthStore((s) => s.currentChurchId);
  const queryClient = useQueryClient();

  const { data: prayers, isLoading } = useQuery({
    queryKey: ["prayers", churchId],
    queryFn: () => prayerService.getPrayers(churchId!),
    enabled: !!churchId,
  });

  const { mutate: pray } = useMutation({
    mutationFn: prayerService.pray,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayers", churchId] });
      toast.success("Oração registrada");
    },
  });

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Pedidos de Oração</h1>
        <Button size="sm" onClick={() => navigate("/member/prayer/new")}>
          <Plus size={16} className="mr-1" /> Novo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {prayers?.map((prayer) => (
            <div
              key={prayer.id}
              className="rounded-lg border p-4 cursor-pointer hover:bg-muted"
              onClick={() => navigate(`/member/prayer/${prayer.id}`)}
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="font-medium">{prayer.title}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!prayer.already_prayed) pray(prayer.id);
                  }}
                  className="shrink-0"
                >
                  <Heart
                    size={18}
                    className={prayer.already_prayed ? "fill-primary text-primary" : "text-muted-foreground"}
                  />
                </button>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{prayer.description}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{prayer.is_anonymous ? "Anônimo" : prayer.author_name}</span>
                <span className="flex items-center gap-1">
                  <Heart size={12} />
                  {prayer.prayer_count} orações ·{" "}
                  {formatDistanceToNow(new Date(prayer.created_at), { locale: ptBR, addSuffix: true })}
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

---

## Task 4: Novo pedido de oração

**Files:**
- Create: `apps/tauri/src/routes/member/NewPrayerScreen.tsx`

- [ ] **Criar formulário de novo pedido**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { prayerService } from "@/services/prayer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CATEGORIES = ["Saúde", "Família", "Trabalho", "Espiritual", "Financeiro", "Relacionamentos", "Outros"];

const schema = z.object({
  title: z.string().min(3, "Título muito curto"),
  description: z.string().min(10, "Descreva melhor o pedido"),
  category: z.string().min(1, "Selecione uma categoria"),
  is_anonymous: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function NewPrayerScreen() {
  const navigate = useNavigate();
  const churchId = useAuthStore((s) => s.currentChurchId);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_anonymous: false },
  });

  const { mutateAsync } = useMutation({
    mutationFn: (data: FormData) => prayerService.createPrayer(churchId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayers", churchId] });
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync(data);
      toast.success("Pedido enviado");
      navigate("/member/prayer");
    } catch {
      toast.error("Erro ao enviar pedido");
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-6 text-xl font-bold">Novo Pedido de Oração</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Título</label>
          <input
            {...register("title")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Ex: Saúde da minha mãe"
          />
          {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Descrição</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Compartilhe mais detalhes sobre o pedido..."
          />
          {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Categoria</label>
          <select
            {...register("category")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Selecione...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("is_anonymous")} className="rounded" />
          Enviar anonimamente
        </label>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar Pedido"}
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Atualizar rotas**

Em `routes/index.tsx`, substituir placeholders:
```typescript
import { PrayerScreen } from "@/routes/member/PrayerScreen";
import { NewPrayerScreen } from "@/routes/member/NewPrayerScreen";

{ path: "member/prayer", element: <PrayerScreen /> },
{ path: "member/prayer/new", element: <NewPrayerScreen /> },
```

- [ ] **Commit**

```bash
git add apps/tauri/src/
git commit -m "feat(tauri): implement prayer requests (list, create, pray)"
```

---

## Checklist de Conclusão da Fase 6

- [ ] Lista de pedidos exibe título, descrição, autor, contagem de orações e tempo relativo
- [ ] Botão de coração registra oração e atualiza contador sem recarregar
- [ ] Formulário de novo pedido valida campos e envia para API
- [ ] Pedido anônimo não exibe nome do autor
- [ ] Categoria é obrigatória e lista as opções corretas

**Próximo passo:** [Fase 7 — Financeiro e Educação](fase_7.md)
