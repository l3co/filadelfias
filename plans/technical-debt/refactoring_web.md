# 🏗️ Plano de Refatoração Web & Modernização

**Status**: Rascunho Inicial
**Data**: 19/01/2026
**Autor**: AntiGravity (AI Agent)

## 1. Diagnóstico Atual

Após análise da base de código (`apps/web`), identificamos os seguintes pontos críticos que violam princípios de Clean Code, Atomic Design e Scalability.

### 🚨 Problemas Críticos

1.  **Acoplamento Excessivo em Páginas ("God Components")**
    *   **Evidência**: O arquivo `TreasuryPage.tsx` contém **250 linhas** que misturam:
        *   Estado local de formulário (`useState` para cada campo).
        *   Regras de negócio (cálculo de `totalBalance`).
        *   Chamadas de API (Hooks do React Query diretos).
        *   Layout da página.
        *   Definição de Modal e Formulário inline.
    *   **Impacto**: Dificuldade de teste, impossibilidade de reuso do formulário de transação, leitura complexa.

2.  **Ausência de Design System (UI Kit)**
    *   **Evidência**: Pasta `src/components/ui` contém apenas `Modal.tsx`.
    *   **Prática Atual**: Estilos hardcoded com Tailwind (ex: `className="block w-full rounded-lg border-gray-300..."`) repetidos dezenas de vezes.
    *   **Impacto**: Inconsistência visual (botões com paddings diferentes, cores levemente distintas), manutenibilidade baixa (mudar a cor primária exige replace em todo projeto).

3.  **Arquitetura Híbrida/Confusa**
    *   **Evidência**: Estrutura atual mistura organização por tipo (`routes/`, `services/`) com tentativas de domínio (`routes/financial/`).
    *   **Impacto**: Conforme o app cresce, navegar entre `services/financial.ts`, `routes/financial/Page.tsx` e `types.ts` (global) torna-se caótico.

4.  **UX/UI "Básica" (Falta o Fator "Uau")**
    *   **Evidência**: Uso de cores padrão do Tailwind (`gray-50`, `indigo-600`). Ausência de transições (`Framer Motion`), feedbacks visuais ricos (Toasts, Skeletons) e Glassmorphism solicitado.

---

## 2. Estratégia de Solução (O "Caminho Feliz")

Adotaremos uma abordagem incremental baseada em **Vertical Slices** (Fatias de Domínio) e **Atomic Design**.

### 🎨 Pilares da Nova Arquitetura de UI

1.  **Design System Inteligente**
    *   Uso de `class-variance-authority` (CVA) ou `tailwind-variants` para criar componentes tipados e variantes (ex: `Button variant="primary" size="lg"`).
    *   Centralização de Tokens (Cores, Espaçamentos, Sombras).

2.  **Separação de Responsabilidades (MVVM-like)**
    *   **View**: Componente React "burro", só recebe props e exibe dados.
    *   **ViewModel (Hook)**: `useTreasuryLogic()`. Gerencia estado, chama services, prepara dados para view.
    *   **Service/Model**: Já existente (`services/financial.ts`), mas deve ser desacoplado da UI.

---

## 3. Plano de Implementação Tática

### Fase 1: Fundação & Design System (Prioridade Alta) 🚀
*Objetivo: Criar os blocos de construção para evitar repetição de código.*

*   [ ] **Setup de Bibliotecas UI**:
    *   Instalar `clsx` e `tailwind-merge` (já existem, verificar utilitário `cn`).
    *   Instalar `framer-motion` para micro-animações.
    *   Instalar `lucide-react` (já existe).
*   [ ] **Criação de Componentes Base (Atoms)**:
    *   `ui/Button`: Com variantes (solid, outline, ghost) e suporte a loading.
    *   `ui/Input`, `ui/Select`: Com tratamento de erro e labels integrados.
    *   `ui/Card`: Container com suporte a glassmorphism.
    *   `ui/Typography`: Padronização de H1, H2, p, caption.
    *   `ui/Skeleton`: Para estados de loading (substituir "Carregando..." texto).

### Fase 2: Refatoração do Módulo Financeiro (Prova de Conceito) 💰
*Objetivo: Transformar `TreasuryPage` no exemplo canônico da nova arquitetura.*

*   [ ] **Extração de Hooks**:
    *   Criar `hooks/modules/financial/useTransactions.ts`.
    *   Criar `hooks/modules/financial/useFinancialSummary.ts`.
*   [ ] **Componentização**:
    *   Criar `features/financial/components/TransactionForm.tsx` (Formulário isolado).
    *   Criar `features/financial/components/BalanceCard.tsx`.
    *   Criar `features/financial/components/TransactionList.tsx`.
*   [ ] **Página Principal**:
    *   Reescrever `TreasuryPage` para ser apenas orquestrador dos componentes acima.

### Fase 3: Modernização Visual (Look & Feel) ✨
*Objetivo: Aplicar a estética "Premium".*

*   [ ] **Glassmorphism**: Criar utilitário no Tailwind para fundos translúcidos (`bg-white/70 backdrop-blur-lg`).
*   [ ] **Paleta de Cores**: Refinar o `indigo` para algo mais vibrante ou alinhado à marca (ex: gradientes sutis).
*   [ ] **Micro-interações**: Adicionar animações suaves de entrada nos cards e listas.

### Fase 4: Testes e Qualidade 🛡️
*Objetivo: Garantir que a refatoração não quebre nada.*

*   [ ] **Testes de Componente**: Testar `TransactionForm` isoladamente (renderização, validação).
*   [ ] **Coverage**: Garantir cobertura nos Hooks de lógica.

---

## 4. Estrutura de Diretórios Proposta

```
src/
├── components/
│   ├── ui/               # Design System (Genérico)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   └── layout/           # Layouts Globais
├── features/             # Vertical Slices
│   ├── financial/
│   │   ├── components/   # Componentes específicos do domínio
│   │   │   ├── transaction-form.tsx
│   │   │   └── balance-card.tsx
│   │   ├── hooks/        # Lógica de negócio
│   │   │   └── use-transactions.ts
│   │   └── types.ts      # Tipos locais
├── lib/                  # Configurações (axios, utils)
└── routes/               # Páginas (Integradores)
```

## 5. Próximos Passos Imediatos

1.  Aprovar este plano.
2.  Executar **Fase 1** (Criar `Button`, `Input`, `Card`).
3.  Executar **Fase 2** (Refatorar `TreasuryPage`).
