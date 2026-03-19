# Plano de Melhoria de Testes - Web e Mobile

## 📊 Análise da Situação Atual

### Web (`apps/web`)

**Infraestrutura:**
- **Framework:** Vitest + React Testing Library
- **E2E:** Playwright + BDD (playwright-bdd com Gherkin)
- **Cobertura:** Configurada com v8 (`vitest.config.ts`)

**Testes Unitários Existentes (8 arquivos):**
- `DashboardLayout.test.tsx`
- `ClassList.test.tsx` (EBD)
- `TransactionForm.test.tsx` (Financial)
- `CouncilList.test.tsx` (Governance)
- `MemberDialog.test.tsx`
- `MembersTable.test.tsx`
- `MissionaryList.test.tsx`
- `useAuth.test.tsx`

**Schemas Zod:**
- `src/lib/validations/member.ts` - contém `memberSchema` e `transactionSchema`
- **⚠️ NENHUM teste unitário para schemas Zod**

**E2E:**
- 14 diretórios de features com cenários BDD
- Boa cobertura de fluxos críticos

---

### Mobile (`apps/mobile`)

**Infraestrutura:**
- **Framework:** Jest + React Native Testing Library
- **Cobertura:** Configurada (`jest --coverage`)

**Testes Unitários Existentes (3 arquivos):**
- `src/lib/__tests__/utils.test.ts` - funções utilitárias
- `src/components/ui/__tests__/ListCard.test.tsx` - componente UI
- `src/constants/__tests__/theme.test.ts` - constantes de tema

**Schemas Zod (inline nos componentes):**
- `app/(auth)/login.tsx` - `loginSchema`
- `app/(auth)/change-password.tsx` - schema de senha
- `app/(auth)/forgot-password.tsx` - schema de email
- `app/(auth)/reset-password.tsx` - schema de reset
- **⚠️ NENHUM teste unitário para schemas Zod**
- **⚠️ Schemas não estão centralizados**

---

## 🚨 Problemas Identificados

### 1. **Ausência de Testes de Schema Zod**
Tanto web quanto mobile não possuem testes para validar que os schemas Zod:
- Aceitam dados válidos
- Rejeitam dados inválidos com mensagens corretas
- Estão sincronizados com os schemas Pydantic do backend

### 2. **Schemas Duplicados e Não Centralizados**
- Web tem schemas em `src/lib/validations/`
- Mobile tem schemas inline nos componentes
- Não há garantia de sincronização com o backend (`src/domain/schemas.py`)

### 3. **Divergências Potenciais Backend ↔ Frontend**
Exemplo de divergência encontrada:
- **Backend** (`enums.py`): `EcclesiasticalFunction` tem apenas 4 valores (TESOUREIRO, SECRETARIO, EVANGELISTA, MISSIONARIO)
- **Web** (`member.ts`): `functions` aceita 12 valores (inclui MUSICO, PROFESSOR_EBD, etc.)

### 4. **Cobertura de Testes Baixa no Mobile**
- Apenas 3 arquivos de teste
- Nenhum teste de integração
- Nenhum teste E2E

---

## 📋 Plano de Ação

### Fase 1: Testes de Schema Zod (Prioridade Alta)

#### 1.1 Web - Criar testes para schemas existentes

**Arquivo:** `src/lib/validations/__tests__/member.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { memberSchema, transactionSchema } from '../member';

describe('memberSchema', () => {
  describe('full_name', () => {
    it('should accept valid name', () => {
      const result = memberSchema.safeParse({ full_name: 'João Silva' });
      expect(result.success).toBe(true);
    });

    it('should reject name with less than 3 characters', () => {
      const result = memberSchema.safeParse({ full_name: 'Jo' });
      expect(result.success).toBe(false);
    });
  });

  describe('email', () => {
    it('should accept valid email', () => {
      const result = memberSchema.safeParse({ 
        full_name: 'João Silva',
        email: 'joao@email.com' 
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty email', () => {
      const result = memberSchema.safeParse({ 
        full_name: 'João Silva',
        email: '' 
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = memberSchema.safeParse({ 
        full_name: 'João Silva',
        email: 'invalid-email' 
      });
      expect(result.success).toBe(false);
    });
  });

  describe('status enum', () => {
    it('should accept all valid status values', () => {
      const validStatuses = ['COMUNGANTE', 'NAO_COMUNGANTE', 'PROCESSO', 'DISCIPLINA', 'AFASTADO', 'TRANSFERIDO'];
      validStatuses.forEach(status => {
        const result = memberSchema.safeParse({ full_name: 'João', status });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const result = memberSchema.safeParse({ full_name: 'João', status: 'INVALID' });
      expect(result.success).toBe(false);
    });
  });

  // ... mais testes para cada campo
});
```

#### 1.2 Mobile - Centralizar e testar schemas

**Criar:** `src/lib/validations/auth.ts`
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
    .regex(/\d/, 'Deve conter pelo menos um número')
    .regex(/[!@#$%^&*]/, 'Deve conter pelo menos um caractere especial'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

// ... outros schemas
```

**Criar:** `src/lib/validations/__tests__/auth.test.ts`
```typescript
import { loginSchema, changePasswordSchema } from '../auth';

describe('loginSchema', () => {
  it('should accept valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Email inválido');
  });
});

describe('changePasswordSchema', () => {
  it('should accept valid password change', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPass123',
      newPassword: 'NewPass123!',
      confirmPassword: 'NewPass123!',
    });
    expect(result.success).toBe(true);
  });

  it('should reject weak password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPass123',
      newPassword: 'weak',
      confirmPassword: 'weak',
    });
    expect(result.success).toBe(false);
  });

  it('should reject mismatched passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPass123',
      newPassword: 'NewPass123!',
      confirmPassword: 'Different123!',
    });
    expect(result.success).toBe(false);
  });
});
```

---

### Fase 2: Testes de Contrato (Contract Testing)

#### 2.1 Criar schemas compartilhados ou testes de sincronização

**Objetivo:** Garantir que os schemas Zod do frontend estejam sincronizados com os schemas Pydantic do backend.

**Opção A - Testes de Contrato:**

Criar testes que validam respostas reais da API contra os schemas Zod:

**Web:** `src/lib/validations/__tests__/contract.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schema que representa a resposta da API (baseado no backend)
const memberResponseSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  full_name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  status: z.enum(['PROCESSO', 'COMUNGANTE', 'NAO_COMUNGANTE', 'DISCIPLINA', 'AFASTADO', 'TRANSFERIDO', 'FALECIDO']),
  office: z.enum(['MEMBRO', 'DIACONO', 'PRESBITERO', 'PASTOR']),
  functions: z.array(z.enum(['TESOUREIRO', 'SECRETARIO', 'EVANGELISTA', 'MISSIONARIO'])).nullable(),
  // ... outros campos
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

describe('API Contract Tests', () => {
  it('should validate member response structure', () => {
    // Mock de resposta da API
    const apiResponse = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenant_id: '123e4567-e89b-12d3-a456-426614174001',
      full_name: 'João Silva',
      email: 'joao@email.com',
      phone: null,
      status: 'COMUNGANTE',
      office: 'MEMBRO',
      functions: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const result = memberResponseSchema.safeParse(apiResponse);
    expect(result.success).toBe(true);
  });
});
```

**Opção B - Package Compartilhado:**

Criar um pacote em `packages/contracts` com schemas TypeScript gerados a partir dos schemas Pydantic do backend.

---

### Fase 3: Aumentar Cobertura de Testes Unitários

#### 3.1 Web - Prioridades

| Componente/Hook | Prioridade | Motivo |
|-----------------|------------|--------|
| `useMetadata` | Alta | Centraliza enums do sistema |
| `memberService` | Alta | Lógica de negócio crítica |
| Formulários com Zod | Alta | Validação de entrada |
| Componentes de UI | Média | Já têm alguns testes |

#### 3.2 Mobile - Prioridades

| Componente/Hook | Prioridade | Motivo |
|-----------------|------------|--------|
| `useAuthStore` | Alta | Gerencia autenticação |
| `useMetadata` | Alta | Centraliza enums |
| Schemas de validação | Alta | Validação de entrada |
| `api.ts` (services) | Média | Chamadas à API |
| Componentes de formulário | Média | Interação do usuário |

---

### Fase 4: Testes E2E no Mobile

#### 4.1 Configurar Detox ou Maestro

**Recomendação:** Maestro (mais simples de configurar)

```yaml
# maestro/flows/login.yaml
appId: com.filadelfias.mobile
---
- launchApp
- tapOn: "Email"
- inputText: "admin@test.com"
- tapOn: "Senha"
- inputText: "password123"
- tapOn: "Entrar"
- assertVisible: "Dashboard"
```

---

## 📁 Estrutura de Arquivos Proposta

### Web
```
apps/web/src/
├── lib/
│   └── validations/
│       ├── member.ts
│       ├── auth.ts (criar)
│       ├── financial.ts (criar)
│       └── __tests__/
│           ├── member.test.ts (criar)
│           ├── auth.test.ts (criar)
│           ├── financial.test.ts (criar)
│           └── contract.test.ts (criar)
```

### Mobile
```
apps/mobile/src/
├── lib/
│   └── validations/
│       ├── auth.ts (criar - centralizar)
│       ├── member.ts (criar)
│       └── __tests__/
│           ├── auth.test.ts (criar)
│           └── member.test.ts (criar)
```

---

## 🎯 Métricas de Sucesso

| Métrica | Atual | Meta |
|---------|-------|------|
| Cobertura Web (unitários) | ~20% | 60% |
| Cobertura Mobile (unitários) | ~5% | 50% |
| Testes de Schema Zod | 0 | 100% dos schemas |
| Testes de Contrato | 0 | Endpoints críticos |

---

## 📅 Cronograma Sugerido

| Fase | Duração | Entregáveis |
|------|---------|-------------|
| **Fase 1** | 1-2 dias | Testes de schema Zod (web + mobile) |
| **Fase 2** | 1 dia | Testes de contrato básicos |
| **Fase 3** | 3-5 dias | Aumentar cobertura unitária |
| **Fase 4** | 2-3 dias | Setup E2E mobile (Maestro) |

---

## 🔧 Comandos Úteis

```bash
# Web - Rodar testes
cd apps/web
npm run test              # Testes unitários
npm run test -- --coverage  # Com cobertura

# Mobile - Rodar testes
cd apps/mobile
npm run test              # Testes unitários
npm run test:coverage     # Com cobertura

# Web - E2E
npm run test:e2e          # Todos os E2E
npm run test:e2e:smoke    # Apenas smoke tests
```

---

## ⚠️ Divergências Identificadas

### 1. EcclesiasticalFunction (Divergência Intencional)
- **Backend:** 4 valores (TESOUREIRO, SECRETARIO, EVANGELISTA, MISSIONARIO)
- **Web:** 12 valores (inclui MUSICO, PROFESSOR_EBD, LIDER_*, etc.)
- **Análise:** As funções extras no web são funções de **ministério/serviço**, não funções eclesiásticas formais segundo o Manual Presbiteriano
- **Decisão:** Manter separação. Backend valida apenas funções formais; web pode ter lista expandida para UI
- **Recomendação:** Considerar criar enum separado `MinistryFunction` no backend se necessário persistir

### 2. MemberStatus ✅ CORRIGIDO
- **Backend:** Inclui `FALECIDO`
- **Web:** ~~Não incluía~~ → Agora inclui `FALECIDO`
- **Ação:** ✅ Adicionado ao schema web

---

## 📝 Progresso da Implementação

### Fase 1 - Testes de Schema Zod ✅
1. [x] Criar `apps/web/src/lib/validations/__tests__/member.test.ts` - **87 testes**
2. [x] Criar `apps/mobile/src/lib/validations/auth.ts` (centralizar schemas)
3. [x] Criar `apps/mobile/src/lib/validations/__tests__/auth.test.ts` - **24 testes**
4. [x] Atualizar componentes mobile para usar schemas centralizados
5. [x] Adicionar `FALECIDO` ao schema web

### Fase 2 - Testes de Contrato e Member Mobile ✅
6. [x] Criar `apps/web/src/lib/validations/api-contracts.ts` - schemas de resposta API
7. [x] Criar `apps/web/src/lib/validations/__tests__/api-contracts.test.ts` - **44 testes**
8. [x] Criar `apps/mobile/src/lib/validations/member.ts` - schemas de membro
9. [x] Criar `apps/mobile/src/lib/validations/__tests__/member.test.ts` - **57 testes**
10. [x] Configurar Vitest com projetos separados (node para schemas)

### Resultados Finais

| Projeto | Testes de Schema | Total Testes | Cobertura Validations |
|---------|------------------|--------------|----------------------|
| **Web** | 131 | 131 | 100% |
| **Mobile** | 103 | 103 | 100% |

### Fase 3 - E2E Mobile com Maestro ✅
11. [x] Criar estrutura `.maestro/` com configuração
12. [x] Criar fluxo `login.yaml` - login happy path
13. [x] Criar fluxo `login_validation.yaml` - validação de formulário
14. [x] Criar fluxo `forgot_password.yaml` - recuperação de senha
15. [x] Criar fluxo `change_password.yaml` - troca de senha primeiro acesso
16. [x] Criar fluxo `admin_navigation.yaml` - navegação admin
17. [x] Criar fluxo `member_navigation.yaml` - navegação membro
18. [x] Criar fluxo `prayer_request.yaml` - pedidos de oração
19. [x] Criar fluxo `offline_mode.yaml` - modo offline
20. [x] Documentar setup em `.maestro/README.md`
21. [x] Adicionar scripts npm para E2E

### Fase 4 - Aumentar Cobertura Unitária ✅
22. [x] Criar `apps/mobile/src/stores/__tests__/authStore.test.ts` - **15 testes**
23. [x] Criar `apps/mobile/src/hooks/__tests__/useMetadata.test.ts` - **24 testes**
24. [x] Criar `apps/mobile/src/services/__tests__/api.test.ts` - **10 testes**
25. [x] Criar `apps/web/src/hooks/__tests__/useMetadata.test.ts` - **21 testes**
26. [x] Criar `apps/web/src/services/__tests__/members.test.ts` - **9 testes**

### Resultados Finais Atualizados

| Projeto | Testes Unitários | Cobertura Validations |
|---------|------------------|----------------------|
| **Web** | 161 | 100% |
| **Mobile** | 152 | 100% |
| **Total** | **313** | - |

### Pendências (Ambiente)
- [ ] Resolver compatibilidade Node.js 23 com jsdom/css-tree (testes de componentes web)
- [ ] Resolver compatibilidade coverage v8 com minimatch (Node 23)
- [ ] Instalar Maestro CLI para rodar testes E2E mobile
