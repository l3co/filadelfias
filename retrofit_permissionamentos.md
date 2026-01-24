# Retrofit do Sistema de Permissionamento

**Data:** Janeiro 2025  
**Objetivo:** Centralizar e padronizar o sistema de permissões para garantir escalabilidade, segurança e facilidade de manutenção para web e mobile.

---

## 1. Diagnóstico do Estado Atual

### 1.1 Pontos Positivos (O que já existe de bom)

O sistema já possui uma base sólida de RBAC (Role-Based Access Control):

- **Backend centralizado** (`src/lib/permissions.py`):
  - Matriz de permissões por ofício eclesiástico (`OFFICE_PERMISSIONS`)
  - Permissões extras por função (`FUNCTION_PERMISSIONS`)
  - Permissões por role do sistema (`SYSTEM_ROLE_PERMISSIONS`)
  - Funções utilitárias: `get_member_permissions()`, `has_permission()`, `check_permission()`

- **Middleware de permissões** (`src/middleware/permissions.py`):
  - `PermissionChecker` - Dependency para verificar permissões em rotas
  - `RequireLeadership` - Exige Pastor ou Presbítero
  - `RequireOfficer` - Exige oficial ordenado
  - Instâncias pré-configuradas (`require_view_members`, `require_manage_governance`, etc.)

- **Frontend com sistema espelhado** (`src/lib/permissions.ts`):
  - Mesma estrutura de permissões do backend
  - Hook `usePermissions()` para acesso às permissões do usuário atual
  - Componentes de controle de acesso (`PermissionGate`, `RequireLeadership`, etc.)

### 1.2 Problemas Identificados

#### 🔴 **CRÍTICO: Duplicação de Definições**

| Local | Arquivo | Problema |
|-------|---------|----------|
| Backend | `src/domain/enums.py` | Enums de ofícios, funções, status |
| Backend | `src/lib/permissions.py` | Matriz de permissões |
| Frontend | `src/types.ts` | Types duplicados (diferentes valores!) |
| Frontend | `src/types/members.types.ts` | Types duplicados novamente |
| Frontend | `src/lib/permissions.ts` | Matriz de permissões duplicada |
| Frontend | `src/constants/member.constants.ts` | Labels e options duplicados |
| Componentes | `CreateMemberDialog.tsx` | `FUNCTIONS_OPTIONS` hardcoded |
| Componentes | `EditMemberDialog.tsx` | `FUNCTIONS_OPTIONS` hardcoded |
| Componentes | `MembersCards.tsx` | `officeLabels`, `functionLabels` hardcoded |

#### 🔴 **CRÍTICO: Inconsistências de Valores**

```typescript
// types.ts (antigo)
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'DECEASED' | 'EXCLUDED';
export type Gender = 'MALE' | 'FEMALE';

// types/members.types.ts (novo)
export type MemberStatus = 'PROCESSO' | 'COMUNGANTE' | 'NAO_COMUNGANTE' | 'DISCIPLINA' | 'AFASTADO' | 'TRANSFERIDO' | 'FALECIDO';

// enums.py (backend)
class Gender(str, Enum):
    Masculino = "M"
    Feminino = "F"
```

**Impacto:** Formulários usam valores diferentes do que o backend espera.

#### 🟡 **MÉDIO: Comboboxes Hardcoded nos Componentes**

Os componentes `CreateMemberDialog.tsx` e `EditMemberDialog.tsx` têm options inline:

```tsx
// CreateMemberDialog.tsx - linha 149-156
<option value="M">Masculino</option>
<option value="F">Feminino</option>

// Mas types.ts define:
export type Gender = 'MALE' | 'FEMALE';
```

**Problema:** Se adicionar um novo ofício ou função, precisa alterar múltiplos arquivos.

#### 🟡 **MÉDIO: Falta de Endpoint para Metadados**

O frontend não busca enums/permissões do backend. Tudo é definido estaticamente. Isso significa:
- Mudanças no backend não refletem automaticamente no frontend
- Mobile terá que duplicar tudo novamente
- Risco de dessincronização

#### 🟡 **MÉDIO: Campo `role` Deprecated mas Ainda em Uso**

```python
# schemas.py
role: EcclesiasticalRole = EcclesiasticalRole.Membro  # Deprecated
office: EcclesiasticalOffice = EcclesiasticalOffice.Membro
```

O campo `role` ainda existe em schemas e types, causando confusão.

#### 🟢 **MENOR: Labels Duplicados**

```typescript
// permissions.ts
export const OFFICE_LABELS: Record<EcclesiasticalOffice, string> = {...}

// member.constants.ts
export const OFFICE_LABELS: Record<EcclesiasticalOffice, string> = {...}

// MembersCards.tsx
const officeLabels: Record<string, string> = {...}
```

---

## 2. Arquitetura Proposta

### 2.1 Princípio: Backend como Fonte Única de Verdade

```
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  src/domain/enums.py (FONTE ÚNICA)                      │    │
│  │  - EcclesiasticalOffice                                 │    │
│  │  - EcclesiasticalFunction                               │    │
│  │  - MemberStatus                                         │    │
│  │  - Gender, MaritalStatus, AdmissionType                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  src/lib/permissions.py (MATRIZ DE PERMISSÕES)          │    │
│  │  - OFFICE_PERMISSIONS                                   │    │
│  │  - FUNCTION_PERMISSIONS                                 │    │
│  │  - SYSTEM_ROLE_PERMISSIONS                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  GET /api/metadata                                      │    │
│  │  - enums (offices, functions, statuses, etc.)           │    │
│  │  - labels (pt-BR)                                       │    │
│  │  - permissions matrix (opcional)                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
           ┌───────────────────┴───────────────────┐
           │                                       │
           ▼                                       ▼
┌─────────────────────┐               ┌─────────────────────┐
│     WEB (React)     │               │   MOBILE (Future)   │
│  ┌───────────────┐  │               │  ┌───────────────┐  │
│  │ useMetadata() │  │               │  │ useMetadata() │  │
│  │ - enums       │  │               │  │ - enums       │  │
│  │ - labels      │  │               │  │ - labels      │  │
│  └───────────────┘  │               │  └───────────────┘  │
│         │           │               │         │           │
│         ▼           │               │         ▼           │
│  ┌───────────────┐  │               │  ┌───────────────┐  │
│  │ Componentes   │  │               │  │ Componentes   │  │
│  │ (sem hardcode)│  │               │  │ (sem hardcode)│  │
│  └───────────────┘  │               │  └───────────────┘  │
└─────────────────────┘               └─────────────────────┘
```

### 2.2 Novo Endpoint: GET /api/metadata

```python
# Resposta proposta
{
  "enums": {
    "ecclesiastical_offices": [
      {"value": "MEMBRO", "label": "Membro", "order": 1},
      {"value": "DIACONO", "label": "Diácono", "order": 2},
      {"value": "PRESBITERO", "label": "Presbítero", "order": 3},
      {"value": "PASTOR", "label": "Pastor", "order": 4}
    ],
    "ecclesiastical_functions": [
      {"value": "TESOUREIRO", "label": "Tesoureiro"},
      {"value": "SECRETARIO", "label": "Secretário"},
      {"value": "EVANGELISTA", "label": "Evangelista"},
      {"value": "MISSIONARIO", "label": "Missionário"},
      {"value": "PROFESSOR_EBD", "label": "Professor de EBD"}
    ],
    "member_statuses": [...],
    "genders": [...],
    "marital_statuses": [...],
    "admission_types": [...]
  },
  "permissions": {
    "offices": {
      "PASTOR": ["members:*", "governance:*", "financial:*", ...],
      "PRESBITERO": [...],
      ...
    },
    "functions": {
      "TESOUREIRO": ["financial:*", "reports:view"],
      ...
    }
  }
}
```

### 2.3 Estrutura de Arquivos Proposta

```
apps/backend/src/
├── domain/
│   ├── enums.py              # FONTE ÚNICA de enums
│   └── labels.py             # Labels em pt-BR (NOVO)
├── lib/
│   └── permissions.py        # Matriz de permissões (já existe)
└── api/
    └── metadata.py           # Endpoint /api/metadata (NOVO)

apps/web/src/
├── hooks/
│   ├── useMetadata.ts        # Hook para buscar metadados (NOVO)
│   └── usePermissions.ts     # Usa permissões do contexto
├── contexts/
│   └── MetadataContext.tsx   # Provider de metadados (NOVO)
├── lib/
│   └── permissions.ts        # REMOVER duplicação, usar do contexto
├── constants/
│   └── member.constants.ts   # DEPRECAR, usar useMetadata()
└── types/
    └── metadata.types.ts     # Types gerados/sincronizados (NOVO)
```

---

## 3. Plano de Implementação

### Fase 1: Consolidação do Backend (Prioridade Alta)

**Objetivo:** Criar fonte única de verdade no backend

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 1.1 | Criar `labels.py` com todos os labels em pt-BR | `src/domain/labels.py` | 1h |
| 1.2 | Remover `EcclesiasticalRole` deprecated | `enums.py`, `schemas.py` | 1h |
| 1.3 | Padronizar valores de Gender (`M`/`F` vs `MALE`/`FEMALE`) | `enums.py`, schemas | 2h |
| 1.4 | Criar endpoint `GET /api/metadata` | `src/api/metadata.py` | 2h |
| 1.5 | Adicionar testes para o endpoint | `tests/` | 1h |

**Entregável:** Endpoint `/api/metadata` funcionando com todos os enums e labels.

### Fase 2: Refatoração do Frontend (Prioridade Alta)

**Objetivo:** Consumir metadados do backend, eliminar duplicações

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 2.1 | Criar `MetadataContext` e `useMetadata` hook | `contexts/`, `hooks/` | 2h |
| 2.2 | Criar types sincronizados com backend | `types/metadata.types.ts` | 1h |
| 2.3 | Refatorar `CreateMemberDialog` para usar `useMetadata` | `CreateMemberDialog.tsx` | 1h |
| 2.4 | Refatorar `EditMemberDialog` para usar `useMetadata` | `EditMemberDialog.tsx` | 1h |
| 2.5 | Refatorar `MembersCards` para usar labels do contexto | `MembersCards.tsx` | 30min |
| 2.6 | Deprecar `member.constants.ts` | `constants/` | 30min |
| 2.7 | Remover duplicação em `types.ts` vs `types/members.types.ts` | `types/` | 1h |
| 2.8 | Atualizar `permissions.ts` para usar enums do contexto | `lib/permissions.ts` | 1h |

**Entregável:** Frontend sem hardcodes, consumindo tudo do backend.

### Fase 3: Melhorias no Sistema de Permissões (Prioridade Média)

**Objetivo:** Fortalecer a segurança e flexibilidade

| # | Tarefa | Arquivos | Esforço |
|---|--------|----------|---------|
| 3.1 | Incluir permissões do usuário na resposta de `/me` | `api/auth.py` | 1h |
| 3.2 | Criar endpoint `GET /api/permissions/check` para validação | `api/permissions.py` | 2h |
| 3.3 | Adicionar cache de permissões no frontend | `usePermissions.ts` | 1h |
| 3.4 | Criar testes E2E para cenários de permissão | `e2e/` | 3h |

**Entregável:** Sistema de permissões mais robusto e testado.

### Fase 4: Preparação para Mobile (Prioridade Baixa)

**Objetivo:** Garantir que a arquitetura suporte o app mobile

| # | Tarefa | Esforço |
|---|--------|---------|
| 4.1 | Documentar API de metadados para mobile | 1h |
| 4.2 | Criar SDK/lib compartilhada de permissões (opcional) | 4h |
| 4.3 | Avaliar geração automática de types (OpenAPI → TypeScript) | 2h |

---

## 4. Detalhamento Técnico

### 4.1 Novo Arquivo: `src/domain/labels.py`

```python
"""
Labels em pt-BR para todos os enums do sistema.
Fonte única de verdade para internacionalização.
"""

from .enums import (
    EcclesiasticalOffice,
    EcclesiasticalFunction,
    MemberStatus,
    Gender,
    MaritalStatus,
)

OFFICE_LABELS = {
    EcclesiasticalOffice.Membro: "Membro",
    EcclesiasticalOffice.Diacono: "Diácono",
    EcclesiasticalOffice.Presbitero: "Presbítero",
    EcclesiasticalOffice.Pastor: "Pastor",
}

FUNCTION_LABELS = {
    EcclesiasticalFunction.Tesoureiro: "Tesoureiro",
    EcclesiasticalFunction.Secretario: "Secretário",
    EcclesiasticalFunction.Evangelista: "Evangelista",
    EcclesiasticalFunction.Missionario: "Missionário",
}

STATUS_LABELS = {
    MemberStatus.Processo: "Em Processo",
    MemberStatus.Comungante: "Comungante",
    MemberStatus.NaoComungante: "Não Comungante",
    MemberStatus.Disciplina: "Sob Disciplina",
    MemberStatus.Afastado: "Afastado",
    MemberStatus.Transferido: "Transferido",
    MemberStatus.Falecido: "Falecido",
}

GENDER_LABELS = {
    Gender.Masculino: "Masculino",
    Gender.Feminino: "Feminino",
}

MARITAL_STATUS_LABELS = {
    MaritalStatus.Solteiro: "Solteiro(a)",
    MaritalStatus.Casado: "Casado(a)",
    MaritalStatus.Divorciado: "Divorciado(a)",
    MaritalStatus.Viuvo: "Viúvo(a)",
}
```

### 4.2 Novo Endpoint: `src/api/metadata.py`

```python
from fastapi import APIRouter
from src.domain.enums import (
    EcclesiasticalOffice,
    EcclesiasticalFunction,
    MemberStatus,
    Gender,
    MaritalStatus,
)
from src.domain.labels import (
    OFFICE_LABELS,
    FUNCTION_LABELS,
    STATUS_LABELS,
    GENDER_LABELS,
    MARITAL_STATUS_LABELS,
)

router = APIRouter(tags=["metadata"])


def enum_to_options(enum_class, labels: dict) -> list:
    """Converte enum para lista de options com value e label."""
    return [
        {"value": item.value, "label": labels.get(item, item.name)}
        for item in enum_class
    ]


@router.get("/metadata")
async def get_metadata():
    """
    Retorna todos os metadados do sistema (enums, labels).
    Usado pelo frontend para popular selects e validações.
    """
    return {
        "enums": {
            "ecclesiastical_offices": enum_to_options(EcclesiasticalOffice, OFFICE_LABELS),
            "ecclesiastical_functions": enum_to_options(EcclesiasticalFunction, FUNCTION_LABELS),
            "member_statuses": enum_to_options(MemberStatus, STATUS_LABELS),
            "genders": enum_to_options(Gender, GENDER_LABELS),
            "marital_statuses": enum_to_options(MaritalStatus, MARITAL_STATUS_LABELS),
        }
    }
```

### 4.3 Novo Hook: `useMetadata.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface EnumOption {
  value: string;
  label: string;
}

interface Metadata {
  enums: {
    ecclesiastical_offices: EnumOption[];
    ecclesiastical_functions: EnumOption[];
    member_statuses: EnumOption[];
    genders: EnumOption[];
    marital_statuses: EnumOption[];
  };
}

export function useMetadata() {
  return useQuery<Metadata>({
    queryKey: ['metadata'],
    queryFn: async () => {
      const response = await api.get('/metadata');
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hora - metadados mudam raramente
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

// Helpers
export function useOfficeOptions() {
  const { data } = useMetadata();
  return data?.enums.ecclesiastical_offices ?? [];
}

export function useFunctionOptions() {
  const { data } = useMetadata();
  return data?.enums.ecclesiastical_functions ?? [];
}

export function useStatusOptions() {
  const { data } = useMetadata();
  return data?.enums.member_statuses ?? [];
}
```

### 4.4 Componente Refatorado: Select Genérico

```typescript
// components/ui/EnumSelect.tsx
import { useMetadata } from '../../hooks/useMetadata';

interface EnumSelectProps {
  enumType: 'ecclesiastical_offices' | 'ecclesiastical_functions' | 'member_statuses' | 'genders' | 'marital_statuses';
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function EnumSelect({ enumType, value, onChange, placeholder = 'Selecione...', className }: EnumSelectProps) {
  const { data, isLoading } = useMetadata();
  const options = data?.enums[enumType] ?? [];

  if (isLoading) {
    return <select disabled className={className}><option>Carregando...</option></select>;
  }

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
```

---

## 5. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Breaking changes nos valores de enum | Alto | Criar migration para dados existentes |
| Performance do endpoint /metadata | Baixo | Cache agressivo (staleTime alto) |
| Complexidade adicional | Médio | Documentar bem, criar helpers |
| Regressões em formulários | Alto | Testes E2E antes de deploy |

---

## 6. Métricas de Sucesso

- [ ] Zero duplicação de definições de enum entre backend e frontend
- [ ] Todos os selects/comboboxes usando `useMetadata()` ou `EnumSelect`
- [ ] Endpoint `/api/metadata` com cobertura de testes > 90%
- [ ] Documentação atualizada para desenvolvimento mobile
- [ ] Nenhum hardcode de labels em componentes

---

## 7. Cronograma Sugerido

| Fase | Duração | Dependências |
|------|---------|--------------|
| Fase 1 - Backend | 1 semana | - |
| Fase 2 - Frontend | 1-2 semanas | Fase 1 |
| Fase 3 - Permissões | 1 semana | Fase 2 |
| Fase 4 - Mobile prep | Quando necessário | Fase 3 |

**Total estimado:** 3-4 semanas de trabalho focado.

---

## 8. Próximos Passos Imediatos

1. **Revisar este documento** e validar a abordagem proposta
2. **Decidir sobre Gender:** usar `M`/`F` (backend atual) ou `MALE`/`FEMALE` (frontend atual)?
3. **Criar branch** `feature/permissions-retrofit`
4. **Começar pela Fase 1.1:** criar `labels.py`
5. **Testar endpoint** `/api/metadata` localmente

---

## Apêndice A: Arquivos Afetados

### Backend
- `src/domain/enums.py` - Modificar
- `src/domain/labels.py` - Criar
- `src/domain/schemas.py` - Remover `role` deprecated
- `src/api/metadata.py` - Criar
- `src/lib/permissions.py` - Manter (já está bom)
- `src/middleware/permissions.py` - Manter

### Frontend
- `src/types.ts` - Deprecar, mover para `types/`
- `src/types/members.types.ts` - Consolidar
- `src/types/metadata.types.ts` - Criar
- `src/constants/member.constants.ts` - Deprecar
- `src/lib/permissions.ts` - Simplificar
- `src/hooks/useMetadata.ts` - Criar
- `src/hooks/usePermissions.ts` - Manter
- `src/contexts/MetadataContext.tsx` - Criar (opcional)
- `src/components/ui/EnumSelect.tsx` - Criar
- `src/features/members/components/CreateMemberDialog.tsx` - Refatorar
- `src/features/members/components/EditMemberDialog.tsx` - Refatorar
- `src/features/members/components/MembersCards.tsx` - Refatorar
- `src/features/members/components/MembersTable.tsx` - Refatorar

---

*Documento gerado por análise automatizada do código-fonte.*
