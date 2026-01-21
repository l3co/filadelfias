# Sistema de Permissões RBAC - Planejamento e Implementação
**Data:** Janeiro 2026  
**Módulo:** `apps/web` + `apps/backend`  
**Baseado em:** Manual Presbiteriano da IPB

---

## 1. Fundamentos do Manual Presbiteriano

### 1.1 Hierarquia Eclesiástica (Ofícios Ordenados)

O Manual Presbiteriano estabelece uma estrutura hierárquica clara:

| Ofício | Descrição | Autoridade |
|--------|-----------|------------|
| **PASTOR** | Ministro ordenado, preside o Conselho | Máxima - pode realizar todas as ações |
| **PRESBÍTERO** | Governa a igreja com o pastor, compõe o Conselho | Alta - governança e administração |
| **DIÁCONO** | Ofício de serviço assistencial | Média - serviço e assistência |
| **MEMBRO** | Membro comungante batizado | Básica - participação em assembleias |

### 1.2 Funções (Não são Ofícios)

Funções podem ser exercidas por membros independente do ofício:

| Função | Descrição | Permissões Extras |
|--------|-----------|-------------------|
| **TESOUREIRO** | Gerencia finanças da igreja | Acesso total ao financeiro |
| **SECRETÁRIO** | Gerencia documentação e atas | Acesso a membros e governança |
| **EVANGELISTA** | Coordena evangelismo | Acesso a missões e eventos |
| **MISSIONÁRIO** | Representa a igreja em missões | Acesso a missões |

### 1.3 Princípios do Manual Presbiteriano Aplicados

1. **Governo pelos Presbíteros**: Apenas pastores e presbíteros podem governar
2. **Conselho como Autoridade**: Decisões importantes passam pelo Conselho
3. **Transparência Financeira**: Tesouraria deve ser acessível aos responsáveis
4. **Serviço Diaconal**: Diáconos focam em assistência, não governo

---

## 2. Modelo de Permissões Implementado

### 2.1 Tipos de Permissão

```typescript
type Resource = 
  | 'members'      // Cadastro de membros
  | 'governance'   // Conselhos, reuniões, atas
  | 'financial'    // Tesouraria, transações
  | 'ebd'          // Escola Bíblica Dominical
  | 'missions'     // Missões e missionários
  | 'events'       // Eventos da igreja
  | 'settings'     // Configurações do tenant
  | 'reports';     // Relatórios

type Action = 'view' | 'create' | 'edit' | 'delete' | 'manage';

type Permission = `${Resource}:${Action}`;
// Exemplo: 'governance:manage', 'financial:view'
```

### 2.2 Matriz de Permissões por Ofício

#### PASTOR (Autoridade Máxima)
```
✅ members:*       - Acesso total a membros
✅ governance:*    - Acesso total à governança
✅ financial:*     - Acesso total ao financeiro
✅ ebd:*           - Acesso total à EBD
✅ missions:*      - Acesso total a missões
✅ events:*        - Acesso total a eventos
✅ settings:*      - Acesso total a configurações
✅ reports:*       - Acesso total a relatórios
```

#### PRESBÍTERO (Governo)
```
✅ members:view, create, edit, manage
✅ governance:*    - Compõe o Conselho
✅ financial:view, create, edit
✅ ebd:view, create, edit, manage
✅ missions:view, create, edit
✅ events:view, create, edit
✅ settings:view
✅ reports:view
```

#### DIÁCONO (Serviço)
```
✅ members:view, create
✅ governance:view  - Pode participar de reuniões
✅ financial:view
✅ ebd:view, create
✅ missions:view
✅ events:view, create
✅ reports:view
```

#### MEMBRO (Participação)
```
✅ members:view    - Lista pública
✅ ebd:view        - Pode se matricular
✅ missions:view
✅ events:view
```

### 2.3 Permissões Extras por Função

| Função | Permissões Adicionais |
|--------|----------------------|
| TESOUREIRO | `financial:*`, `reports:view` |
| SECRETÁRIO | `members:view,create,edit`, `governance:view,create`, `reports:*` |
| EVANGELISTA | `missions:view,create`, `events:view,create` |
| MISSIONÁRIO | `missions:view,create,edit` |

---

## 3. Arquitetura Implementada

### 3.1 Arquivos Criados

```
apps/web/src/
├── lib/
│   └── permissions.ts          # Definições RBAC, matrizes, utilitários
├── hooks/
│   └── usePermissions.ts       # Hook principal de permissões
├── components/
│   ├── PermissionGate.tsx      # Componentes de controle de acesso
│   └── ProtectedRouteWithPermission.tsx  # Rota protegida
```

### 3.2 Componentes de Controle de Acesso

#### PermissionGate
```tsx
// Renderiza children apenas se tiver permissão
<PermissionGate resource="governance" action="view">
  <GovernanceContent />
</PermissionGate>

// Com fallback customizado
<PermissionGate 
  resource="financial" 
  action="manage"
  fallback={<AccessDenied />}
>
  <FinancialAdmin />
</PermissionGate>
```

#### RequireLeadership
```tsx
// Apenas para Pastores e Presbíteros
<RequireLeadership>
  <CouncilManagement />
</RequireLeadership>
```

#### AccessDenied
```tsx
// Tela de acesso negado com mensagem contextual
<AccessDenied resource="governance" />
```

#### PermissionBadge
```tsx
// Badge indicando nível de acesso do usuário
<PermissionBadge /> // Exibe: "Pastor", "Presbítero", "Diácono", etc.
```

### 3.3 Hook usePermissions

```tsx
const { 
  // Estado
  isLoading,
  currentMember,
  systemRole,
  permissions,
  
  // Verificações
  can,           // can('governance', 'view')
  canAny,        // canAny([{resource: 'members', action: 'view'}, ...])
  canAll,        // canAll([...])
  
  // Verificações de ofício
  isLeader,      // Pastor ou Presbítero
  isOfficer,     // Pastor, Presbítero ou Diácono
  office,        // Ofício atual
  
  // Atalhos comuns
  canViewMembers,
  canManageMembers,
  canViewGovernance,
  canManageGovernance,
  canViewFinancial,
  canManageFinancial,
  // ...
} = usePermissions();
```

---

## 4. Integrações Realizadas

### 4.1 DashboardLayout
- ✅ Navegação filtrada por permissões
- ✅ PermissionBadge no perfil do usuário
- ✅ Menu dinâmico baseado em `can(resource, 'view')`

### 4.2 CouncilsPage (Governança)
- ✅ Verificação de acesso: `canViewGovernance`
- ✅ Botão "Novo Órgão" protegido com `PermissionGate`
- ✅ Tela AccessDenied para não autorizados

### 4.3 TreasuryPage (Financeiro)
- ✅ Verificação de acesso: `canViewFinancial`
- ✅ Botões de transação protegidos com `PermissionGate`
- ✅ Tela AccessDenied para não autorizados

---

## 5. Matriz de Acesso por Módulo

| Módulo | Pastor | Presbítero | Diácono | Tesoureiro | Secretário | Membro |
|--------|--------|------------|---------|------------|------------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Membros | ✅ Full | ✅ Edit | ✅ View | ❌ | ✅ Edit | ✅ View |
| **Governança** | ✅ Full | ✅ Full | ✅ View | ❌ | ✅ View | ❌ |
| **Tesouraria** | ✅ Full | ✅ Edit | ✅ View | ✅ Full | ❌ | ❌ |
| EBD | ✅ Full | ✅ Manage | ✅ Create | ❌ | ❌ | ✅ View |
| Missões | ✅ Full | ✅ Edit | ✅ View | ❌ | ❌ | ✅ View |
| Eventos | ✅ Full | ✅ Edit | ✅ Create | ❌ | ❌ | ✅ View |
| Configurações | ✅ Full | ✅ View | ❌ | ❌ | ❌ | ❌ |

**Legenda:**
- ✅ Full = view, create, edit, delete, manage
- ✅ Manage = view, create, edit, manage
- ✅ Edit = view, create, edit
- ✅ Create = view, create
- ✅ View = apenas visualização
- ❌ = sem acesso

---

## 6. Casos de Uso Específicos

### 6.1 Quem pode criar Conselhos/Reuniões?
- ✅ Pastor
- ✅ Presbítero
- ❌ Diácono (pode visualizar, não criar)
- ❌ Membro

### 6.2 Quem pode registrar transações financeiras?
- ✅ Pastor
- ✅ Presbítero
- ✅ Tesoureiro (mesmo sendo membro comum)
- ❌ Diácono (sem função de tesoureiro)
- ❌ Membro

### 6.3 Quem pode editar dados de membros?
- ✅ Pastor
- ✅ Presbítero
- ✅ Secretário
- ❌ Diácono (pode cadastrar, não editar)
- ❌ Membro

### 6.4 Quem vê a área de Governança no menu?
- ✅ Pastor
- ✅ Presbítero
- ✅ Diácono (visualização apenas)
- ❌ Membro comum

---

## 7. Implementação Backend (CONCLUÍDA ✅)

### 7.1 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/__init__.py` | Init do módulo lib |
| `src/lib/permissions.py` | Sistema RBAC completo (matrizes, funções) |
| `src/middleware/permissions.py` | Dependencies FastAPI para verificação |

### 7.2 PermissionChecker (Dependency)

```python
# src/middleware/permissions.py
class PermissionChecker:
    def __init__(self, resource: str, action: str):
        self.resource = resource
        self.action = action
    
    async def __call__(
        self,
        tenant_id: str = Query(...),
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        # Busca membership e member
        membership = await membership_repository.get_by_user_and_tenant(user_id, tenant_id)
        member = await member_repository.get_by_user_id(tenant_id, user_id)
        
        # Verifica permissão
        if not check_permission(member, system_role, self.resource, self.action):
            raise HTTPException(status_code=403, detail="Sem permissão")
        
        return {"user": current_user, "member": member, "permissions": ...}
```

### 7.3 Endpoints Protegidos

| Endpoint | Permissão Requerida |
|----------|---------------------|
| `POST /governance/councils` | `governance:create` |
| `GET /governance/councils` | `governance:view` |
| `DELETE /governance/councils/{id}` | `governance:manage` |
| `POST /financial/transactions` | `financial:create` |
| `GET /financial/transactions` | `financial:view` |
| `POST /financial/accounts` | `financial:manage` |
| `POST /tenants/{id}/members` | `members:create` |
| `PATCH /tenants/{id}/members/{id}` | `members:edit` |
| `POST /ebd/classes` | `ebd:manage` |
| `POST /missions/missionaries` | `missions:create` |

### 7.4 Uso nos Endpoints

```python
# src/api/governance.py
from src.middleware.permissions import require_create_governance

@router.post("/councils", response_model=CouncilResponse)
async def create_council(
    data: CouncilCreate,
    tenant_id: str = Query(...),
    auth_context: dict = Depends(require_create_governance),  # ✅ Protegido
):
    # Apenas pastores e presbíteros chegam aqui
    ...
```

### 7.5 Instâncias Pré-configuradas

```python
# Disponíveis em src/middleware/permissions.py
require_view_members = PermissionChecker("members", "view")
require_manage_members = PermissionChecker("members", "manage")
require_view_governance = PermissionChecker("governance", "view")
require_create_governance = PermissionChecker("governance", "create")
require_manage_governance = PermissionChecker("governance", "manage")
require_view_financial = PermissionChecker("financial", "view")
require_create_financial = PermissionChecker("financial", "create")
require_manage_financial = PermissionChecker("financial", "manage")
require_view_ebd = PermissionChecker("ebd", "view")
require_manage_ebd = PermissionChecker("ebd", "manage")
require_view_missions = PermissionChecker("missions", "view")
require_manage_missions = PermissionChecker("missions", "manage")
```

---

## 8. Testes Recomendados

### 8.1 Testes Unitários (Frontend)

```typescript
// __tests__/permissions.test.ts
describe('getMemberPermissions', () => {
  it('pastor should have all permissions', () => {
    const member = { office: 'PASTOR', functions: [] };
    const perms = getMemberPermissions(member, 'ATTENDEE');
    expect(perms.has('governance:manage')).toBe(true);
    expect(perms.has('financial:manage')).toBe(true);
  });

  it('member with TESOUREIRO function should access financial', () => {
    const member = { office: 'MEMBRO', functions: ['TESOUREIRO'] };
    const perms = getMemberPermissions(member, 'ATTENDEE');
    expect(perms.has('financial:manage')).toBe(true);
    expect(perms.has('governance:view')).toBe(false);
  });

  it('regular member should not access governance', () => {
    const member = { office: 'MEMBRO', functions: [] };
    const perms = getMemberPermissions(member, 'ATTENDEE');
    expect(perms.has('governance:view')).toBe(false);
  });
});
```

### 8.2 Testes E2E

```typescript
// e2e/permissions.spec.ts
test('member cannot access governance page', async ({ page }) => {
  await loginAs('membro@igreja.com');
  await page.goto('/app/governance');
  await expect(page.getByText('Acesso Restrito')).toBeVisible();
});

test('presbitero can create council', async ({ page }) => {
  await loginAs('presbitero@igreja.com');
  await page.goto('/app/governance');
  await expect(page.getByText('Novo Órgão')).toBeVisible();
});
```

---

## 9. Considerações de Segurança

### 9.1 Defesa em Profundidade
- ✅ Frontend: Esconde elementos sem permissão
- ✅ Backend: Valida permissões em cada endpoint
- ✅ Database: Firestore Rules implementadas

### 9.2 Princípio do Menor Privilégio
- Usuários começam com permissões mínimas (ATTENDEE)
- Permissões são incrementadas baseado em ofício e funções
- `manage` implica todas as outras ações

### 9.3 Auditoria
- 🔲 Log de ações sensíveis (criar, editar, deletar)
- 🔲 Histórico de mudanças de permissões

---

## 10. Resumo da Implementação

### Arquivos Criados - Frontend (apps/web)
| Arquivo | Descrição |
|---------|-----------|
| `src/lib/permissions.ts` | Definições RBAC e funções utilitárias |
| `src/hooks/usePermissions.ts` | Hook de permissões |
| `src/components/PermissionGate.tsx` | Componentes de controle |
| `src/components/ProtectedRouteWithPermission.tsx` | Rota protegida |

### Arquivos Criados - Backend (apps/backend)
| Arquivo | Descrição |
|---------|-----------|
| `src/lib/__init__.py` | Init do módulo lib |
| `src/lib/permissions.py` | Sistema RBAC (matrizes, funções de verificação) |
| `src/middleware/permissions.py` | PermissionChecker dependency para FastAPI |

### Arquivos Modificados - Frontend
| Arquivo | Mudança |
|---------|---------|
| `DashboardLayout.tsx` | Menu filtrado + PermissionBadge |
| `CouncilsPage.tsx` | Verificação de acesso + PermissionGate |
| `TreasuryPage.tsx` | Verificação de acesso + PermissionGate |

### Arquivos Modificados - Backend
| Arquivo | Mudança |
|---------|---------|
| `src/api/governance.py` | Endpoints protegidos com require_*_governance |
| `src/api/financial.py` | Endpoints protegidos com require_*_financial |
| `src/api/members.py` | Endpoints protegidos com require_*_members |
| `src/api/ebd.py` | Endpoints protegidos com require_*_ebd |
| `src/api/mission.py` | Endpoints protegidos com require_*_missions |

### Firestore Rules (firestore.rules)
| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| `users/{id}` | Próprio usuário | Próprio | Próprio | Próprio |
| `tenants/{id}` | Membros | Autenticado | Admin/Pastor | Admin |
| `tenants/{id}/members` | Membros | Leadership/Diácono/Secretário | Leadership/Secretário | Pastor |
| `tenants/{id}/councils` | Officer | Leadership | Leadership | Leadership |
| `tenants/{id}/transactions` | Officer/Tesoureiro | Leadership/Tesoureiro | Pastor/Tesoureiro | Pastor/Tesoureiro |
| `tenants/{id}/ebd_classes` | Membros | Leadership | Leadership | Pastor |
| `tenants/{id}/missionaries` | Membros | Leadership/Evangelista | Leadership | Pastor |

### Pendências
| Item | Prioridade |
|------|------------|
| ~~Middleware backend~~ | ~~Alta~~ ✅ Concluído |
| ~~Firestore Rules~~ | ~~Baixa~~ ✅ Concluído |
| Testes unitários | Média |
| Testes E2E | Média |
| Auditoria de ações | Baixa |

---

## 11. Conclusão

O sistema RBAC implementado segue fielmente os princípios do Manual Presbiteriano:

1. **Pastores e Presbíteros** governam a igreja (acesso à governança)
2. **Diáconos** servem mas não governam (visualização, não gestão)
3. **Funções** complementam ofícios (Tesoureiro tem acesso financeiro independente do ofício)
4. **Membros** participam de assembleias e atividades básicas

A implementação frontend está completa e funcional. O próximo passo crítico é implementar a validação de permissões no backend para garantir segurança completa.
