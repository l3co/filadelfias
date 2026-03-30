# Fase 5 — Área do Membro — Core

> **Para execução:** Use `superpowers:executing-plans` ou `superpowers:subagent-driven-development`.

**Goal:** Implementar a área autenticada do membro: perfil, diretório de membros, devocionais, eventos e missões.

**Architecture:** Cada módulo segue o mesmo padrão: serviço HTTP (`services/`), queries TanStack Query (`hooks/`), e componentes de tela (`routes/member/`). Todas as rotas são protegidas pelo `ProtectedRoute` da Fase 4.

**Tech Stack:** TanStack Query v5, Axios, React Router v7, date-fns.

**Referência:** `apps/mobile/src/services/members.ts`, `events.ts`, `missions.ts`, `devotionals.ts` e `apps/mobile/app/(member)/`.

---

## Estrutura de Arquivos desta Fase

```
apps/tauri/src/
├── services/
│   ├── members.ts
│   ├── events.ts
│   ├── missions.ts
│   └── devotionals.ts
├── hooks/
│   ├── useMembers.ts
│   ├── useEvents.ts
│   ├── useMissions.ts
│   └── useDevotionals.ts
├── routes/
│   └── member/
│       ├── MemberDashboard.tsx
│       ├── ProfileScreen.tsx
│       ├── DirectoryScreen.tsx
│       ├── MemberDetailScreen.tsx
│       ├── DevotionalsScreen.tsx
│       ├── EventsScreen.tsx
│       ├── EventDetailScreen.tsx
│       ├── MissionsScreen.tsx
│       └── MissionDetailScreen.tsx
├── types/
│   └── member.ts
```

---

## Task 1: Tipos do domínio de membros

**Files:**
- Create: `apps/tauri/src/types/member.ts`

- [ ] **Criar tipos**

```typescript
export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  office: string;
  church_id: string;
  avatar_url?: string;
  birthdate?: string;
}

export interface Devotional {
  id: string;
  title: string;
  content: string;
  scripture: string;
  author: string;
  date: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  church_id: string;
}

export interface Mission {
  id: string;
  missionary_name: string;
  field: string;
  country: string;
  description: string;
  prayer_requests: string[];
  church_id: string;
}
```

---

## Task 2: Serviços HTTP

**Files:**
- Create: `apps/tauri/src/services/members.ts`
- Create: `apps/tauri/src/services/events.ts`
- Create: `apps/tauri/src/services/missions.ts`
- Create: `apps/tauri/src/services/devotionals.ts`

- [ ] **Criar members.ts**

```typescript
import { api } from "./api";
import type { Member } from "@/types/member";

export const membersService = {
  getMembers: async (churchId: string, filters?: { office?: string; search?: string }): Promise<Member[]> => {
    const { data } = await api.get(`/churches/${churchId}/members`, { params: filters });
    return data;
  },

  getMember: async (memberId: string): Promise<Member> => {
    const { data } = await api.get(`/members/${memberId}`);
    return data;
  },

  getProfile: async (): Promise<Member> => {
    const { data } = await api.get("/members/me");
    return data;
  },

  updateProfile: async (payload: Partial<Pick<Member, "name" | "phone">>): Promise<Member> => {
    const { data } = await api.patch("/members/me", payload);
    return data;
  },
};
```

- [ ] **Criar events.ts**

```typescript
import { api } from "./api";
import type { Event } from "@/types/member";

export const eventsService = {
  getEvents: async (churchId: string): Promise<Event[]> => {
    const { data } = await api.get(`/churches/${churchId}/events`);
    return data;
  },

  getEvent: async (eventId: string): Promise<Event> => {
    const { data } = await api.get(`/events/${eventId}`);
    return data;
  },
};
```

- [ ] **Criar missions.ts**

```typescript
import { api } from "./api";
import type { Mission } from "@/types/member";

export const missionsService = {
  getMissions: async (churchId: string): Promise<Mission[]> => {
    const { data } = await api.get(`/churches/${churchId}/missions`);
    return data;
  },

  getMission: async (missionId: string): Promise<Mission> => {
    const { data } = await api.get(`/missions/${missionId}`);
    return data;
  },
};
```

- [ ] **Criar devotionals.ts**

```typescript
import { api } from "./api";
import type { Devotional } from "@/types/member";

export const devotionalsService = {
  getDevotionals: async (): Promise<Devotional[]> => {
    const { data } = await api.get("/devotionals");
    return data;
  },

  getDevotional: async (id: string): Promise<Devotional> => {
    const { data } = await api.get(`/devotionals/${id}`);
    return data;
  },

  getTodayDevotional: async (): Promise<Devotional> => {
    const { data } = await api.get("/devotionals/today");
    return data;
  },
};
```

---

## Task 3: Dashboard do membro

**Files:**
- Create: `apps/tauri/src/routes/member/MemberDashboard.tsx`

- [ ] **Criar dashboard**

```typescript
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { devotionalsService } from "@/services/devotionals";
import { Heart, BookOpen, Calendar, Users, DollarSign, GraduationCap } from "lucide-react";

const quickLinks = [
  { to: "/member/prayer", icon: Heart, label: "Oração" },
  { to: "/biblia", icon: BookOpen, label: "Bíblia" },
  { to: "/member/events", icon: Calendar, label: "Eventos" },
  { to: "/member/directory", icon: Users, label: "Diretório" },
  { to: "/member/tithes", icon: DollarSign, label: "Dízimos" },
  { to: "/member/ebd", icon: GraduationCap, label: "EBD" },
];

export function MemberDashboard() {
  const user = useAuthStore((s) => s.user);

  const { data: devotional } = useQuery({
    queryKey: ["devotional-today"],
    queryFn: devotionalsService.getTodayDevotional,
  });

  return (
    <div className="p-4">
      <h1 className="mb-1 text-xl font-bold">Olá, {user?.name?.split(" ")[0]}</h1>
      <p className="mb-6 text-sm text-muted-foreground">Bem-vindo ao Filadelfias</p>

      {devotional && (
        <Link to={`/member/devotionals`} className="mb-6 block rounded-lg border p-4 hover:bg-muted">
          <p className="mb-1 text-xs font-semibold uppercase text-primary">Devocional de hoje</p>
          <p className="font-medium">{devotional.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{devotional.scripture}</p>
        </Link>
      )}

      <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase">Acesso rápido</h2>
      <div className="grid grid-cols-3 gap-3">
        {quickLinks.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border p-4 hover:bg-muted"
          >
            <Icon size={22} className="text-primary" />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## Task 4: Diretório de membros

**Files:**
- Create: `apps/tauri/src/routes/member/DirectoryScreen.tsx`
- Create: `apps/tauri/src/routes/member/MemberDetailScreen.tsx`

- [ ] **Criar DirectoryScreen**

```typescript
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { membersService } from "@/services/members";
import { useState } from "react";
import { Search } from "lucide-react";

export function DirectoryScreen() {
  const navigate = useNavigate();
  const churchId = useAuthStore((s) => s.currentChurchId);
  const [search, setSearch] = useState("");

  const { data: members, isLoading } = useQuery({
    queryKey: ["members", churchId],
    queryFn: () => membersService.getMembers(churchId!),
    enabled: !!churchId,
  });

  const filtered = members?.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar membro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm"
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {filtered?.map((member) => (
            <button
              key={member.id}
              onClick={() => navigate(`/member/directory/${member.id}`)}
              className="flex w-full items-center gap-3 rounded-lg border p-3 hover:bg-muted text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{member.office}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Criar MemberDetailScreen**

```typescript
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { membersService } from "@/services/members";
import { Mail, Phone } from "lucide-react";

export function MemberDetailScreen() {
  const { memberId } = useParams<{ memberId: string }>();

  const { data: member, isLoading } = useQuery({
    queryKey: ["member", memberId],
    queryFn: () => membersService.getMember(memberId!),
    enabled: !!memberId,
  });

  if (isLoading) return <div className="p-4 text-muted-foreground">Carregando...</div>;
  if (!member) return null;

  return (
    <div className="p-4">
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-xl font-bold">{member.name}</h1>
        <p className="text-sm text-muted-foreground capitalize">{member.office}</p>
      </div>

      <div className="space-y-3">
        {member.email && (
          <a href={`mailto:${member.email}`} className="flex items-center gap-3 rounded-lg border p-3">
            <Mail size={18} className="text-primary" />
            <span className="text-sm">{member.email}</span>
          </a>
        )}
        {member.phone && (
          <a href={`tel:${member.phone}`} className="flex items-center gap-3 rounded-lg border p-3">
            <Phone size={18} className="text-primary" />
            <span className="text-sm">{member.phone}</span>
          </a>
        )}
      </div>
    </div>
  );
}
```

---

## Task 5: Eventos e Missões

**Files:**
- Create: `apps/tauri/src/routes/member/EventsScreen.tsx`
- Create: `apps/tauri/src/routes/member/MissionsScreen.tsx`

- [ ] **Criar EventsScreen**

```typescript
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { eventsService } from "@/services/events";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";

export function EventsScreen() {
  const navigate = useNavigate();
  const churchId = useAuthStore((s) => s.currentChurchId);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", churchId],
    queryFn: () => eventsService.getEvents(churchId!),
    enabled: !!churchId,
  });

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Eventos</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {events?.map((event) => (
            <button
              key={event.id}
              onClick={() => navigate(`/member/events/${event.id}`)}
              className="flex w-full items-start gap-3 rounded-lg border p-4 hover:bg-muted text-left"
            >
              <Calendar size={20} className="mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.starts_at), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                </p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Criar MissionsScreen**

```typescript
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { missionsService } from "@/services/missions";
import { Globe } from "lucide-react";

export function MissionsScreen() {
  const churchId = useAuthStore((s) => s.currentChurchId);

  const { data: missions, isLoading } = useQuery({
    queryKey: ["missions", churchId],
    queryFn: () => missionsService.getMissions(churchId!),
    enabled: !!churchId,
  });

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Missões</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {missions?.map((mission) => (
            <div key={mission.id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Globe size={16} className="text-primary" />
                <span className="text-xs text-muted-foreground">{mission.country} — {mission.field}</span>
              </div>
              <p className="font-medium">{mission.missionary_name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{mission.description}</p>
              {mission.prayer_requests.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-semibold uppercase text-primary">Pedidos de oração</p>
                  <ul className="space-y-1">
                    {mission.prayer_requests.map((req, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Atualizar rotas em routes/index.tsx** para substituir os placeholders pelos componentes reais desta fase

- [ ] **Commit**

```bash
git add apps/tauri/src/
git commit -m "feat(tauri): implement member area (dashboard, directory, events, missions)"
```

---

## Checklist de Conclusão da Fase 5

- [ ] Dashboard exibe devocional do dia e links rápidos
- [ ] Diretório lista membros com busca por nome
- [ ] Perfil do membro mostra dados de contato
- [ ] Eventos listados com data formatada em pt-BR
- [ ] Missões listadas com campos missionários e pedidos de oração
- [ ] Todas as rotas protegidas (redireciona para login se não autenticado)

**Próximo passo:** [Fase 6 — Comunidade](fase_6.md) ou [Fase 7 — Financeiro e EBD](fase_7.md) (paralelas)
