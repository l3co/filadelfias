# 🏗️ Plano de Refatoração Web - Fase 2 (Expansão e Consolidação)

**Status**: Planejado
**Dependência**: Conclusão da Fase 1 (Financeiro POC)

## 🎯 Objetivo Global
Elevar 100% da aplicação Web (`apps/web`) para o novo padrão de arquitetura definido no piloto da Tesouraria. O meta é eliminar código legado, centralizar UI no Design System e garantir cobertura de testes.

---

## 📅 Roadmap de Implementação

### 1. 🎨 Design System Completo (Infrastrutura)
Antes de migrar páginas complexas, precisamos de componentes mais robustos para substituir o HTML nativo.

*   [ ] **Feedback UI**:
    *   Implementar `Toast/Sonner`: Para notificações de sucesso/erro (substituir `alert()` e modais simples).
    *   Implementar `Dialog/Modal`: Um componente reutilizável via `@radix-ui` ou similar para substituir o modal inline atual.
*   [ ] **Data Display**:
    *   Implementar `Table`: Componente de tabela com suporte a headers estilizados, zebra-striping e sorting.
    *   Implementar `Badge/Tag`: Para status (Ativo/Inativo, Pago/Pendente).
*   [ ] **Form Elements**:
    *   Implementar `Select` (Customizado): Melhorar a UX do select nativo, permitindo busca e ícones.
    *   Implementar `DatePicker`: Essencial para EBD e Membros.

### 2. 🧹 Saneamento Técnico (Dívida Técnica)
Resolver pendências deixadas pelo código legado para ter um "Clean Slate".

*   [ ] **Lint Zero**: Corrigir os arquivos restantes que violam regras de tipo explícito e `no-explicit-any`:
    *   `src/routes/RegisterPage.tsx`
    *   `src/routes/OnboardingPage.tsx`
    *   `src/hooks/useAuth.test.tsx`
*   [ ] **Padronização de Testes**:
    *   Configurar `vitest` para rodar com alias de paths corretamente.
    *   Substituir mocks manuais excessivos por factories.

### 3. 🔄 Migração de Módulos (Vertical Slices)
Aplicar o padrão **Hook (Lógica) + Componentes (View)** módulo a módulo.

#### 👥 Módulo de Membros (`MembersPage`)
*   **Estado Atual**: Tabela gigante com lógica misturada.
*   **Refatoração**:
    *   Criar hook `useMembers(tenantId)`.
    *   Componente `MemberTable` (usando o novo `Table`).
    *   Componente `MemberFormDialog`.

#### 📚 Módulo EBD (`EBDClassesPage`)
*   **Estado Atual**: Cards dispersos.
*   **Refatoração**:
    *   Criar hook `useEducation(tenantId)`.
    *   Componente `ClassCard` (usando o novo `Card`).

#### 🏛️ Governança e Missões
*   Mesma estratégia dos anteriores.

---

## 🛡️ Estratégia de Testes
Para cada módulo migrado, a regra é: **"Nenhum componente novo entra sem teste."**

1.  **Testes Unitários**: Garantir renderização e comportamento isolado (como feito no `TransactionForm`).
2.  **Coverage**: Manter cobertura mínima de 80% nos Hooks de Regra de Negócio.

## 🚀 Próximo Passo Recomendado
Iniciar pela **Fase 1 (Design System - Dialog & Toast)**, pois o módulo de Membros dependerá fortemente desses componentes para edição e cadastro.
