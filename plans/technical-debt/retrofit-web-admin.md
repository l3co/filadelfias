# Retrofit Web Admin - Plano de Redesign

> **Objetivo**: Modernizar a área administrativa do Filadélfias com design premium, focado em experiência do usuário, legibilidade e elegância visual.

---

## 📋 Escopo

### ✅ Incluído no Redesign
| Arquivo | Descrição | Prioridade |
|---------|-----------|------------|
| `LoginPage.tsx` | Tela de login | Alta |
| `RegisterPage.tsx` | Tela de cadastro | Alta |
| `OnboardingPage.tsx` | Wizard de onboarding | Alta |
| `HomePage.tsx` | Dashboard principal pós-login | Alta |
| `DashboardLayout.tsx` | Layout/Sidebar do admin | Alta |
| `MembersPage.tsx` | Listagem de membros | Alta |
| `TreasuryPage.tsx` | Gestão financeira | Alta |
| `CouncilsPage.tsx` | Governança/Conselhos | Média |
| `MissionsPage.tsx` | Módulo de missões | Média |
| `EBDClassesPage.tsx` | Escola Bíblica Dominical | Média |
| Componentes UI (`card.tsx`, `button.tsx`, `table.tsx`, etc.) | Design system base | Alta |
| Features components (`financial/`, `members/`, etc.) | Componentes de cada módulo | Média |

### ❌ Fora do Escopo (NÃO MODIFICAR)
- `bible/BiblePage.tsx`
- `bible/BibleReaderPage.tsx`
- `hymnal/HymnalPage.tsx`
- `hymnal/HymnalReaderPage.tsx`
- `LandingPage.tsx` *(já modernizada)*
- `PublicLayout.tsx` *(já modernizado)*

---

## 🎨 Design System Proposto

### Paleta de Cores
```css
/* Primárias */
--green-700: #15803d    /* Ações principais, CTAs */
--teal-600: #0d9488     /* Gradientes, accents */
--navy-900: #002333     /* Textos escuros, headers */

/* Neutras */
--gray-50: #f9fafb      /* Background principal */
--gray-100: #f3f4f6     /* Cards, alternância */
--gray-200: #e5e7eb     /* Bordas */
--gray-500: #6b7280     /* Texto secundário */
--gray-900: #111827     /* Texto principal */

/* Semânticas */
--success: #16a34a      /* Verde sucesso */
--warning: #f59e0b      /* Amarelo alerta */
--error: #dc2626        /* Vermelho erro */
--info: #0ea5e9         /* Azul informativo */
```

### Tipografia
- **Títulos**: `font-extrabold tracking-tight` (text-2xl a text-4xl)
- **Subtítulos**: `font-semibold text-gray-700`
- **Corpo**: `text-gray-600 leading-relaxed`
- **Labels**: `text-sm font-medium text-gray-500 uppercase tracking-wider`

### Componentes Base
- **Cards**: `rounded-2xl border-0 shadow-lg` com gradientes sutis
- **Botões**: Gradiente verde, `rounded-xl shadow-md hover:shadow-lg`
- **Tabelas**: Linhas alternadas, hover states, ações inline
- **Inputs**: `rounded-lg border-gray-200 focus:ring-green-500`

---

## 📐 Referências Visuais (templates/)

### admin_1.png - Listagem/Tabela
- Header com busca, notificações, avatar
- Sidebar com menu hierárquico e submenus
- Tabela elegante com bordas sutis
- Botão de ação principal destacado (CTA)
- Ações inline (editar, deletar) com ícones

### admin_2.png - Dashboard/Analytics
- Cards de KPIs com ícones coloridos em círculos
- Gráficos de barras e pizza
- Layout em grid responsivo
- Widgets de resumo (Trending Items, Sales Summary)
- Espaçamento generoso entre elementos

### admin_3.png - Perfil/Detalhes
- Banner/cover image no topo
- Avatar com informações inline
- Tabs para navegação interna
- Cards de estatísticas numéricas
- Layout moderno estilo social

---

## 🔧 Tarefas por Componente

### 1. LoginPage.tsx
- [ ] Background com gradiente sutil ou pattern
- [ ] Card centralizado com sombra premium (`shadow-2xl`)
- [ ] Logo Filadélfias com gradiente
- [ ] Inputs com ícones (email, lock)
- [ ] Botão com gradiente verde → teal
- [ ] Link "Esqueci minha senha" estilizado
- [ ] Animação de entrada (fade-in)

### 2. RegisterPage.tsx
- [ ] Mesmo estilo do LoginPage
- [ ] Steps/progress indicator (se aplicável)
- [ ] Validação visual nos campos
- [ ] Termos de uso estilizados

### 3. OnboardingPage.tsx
- [ ] Wizard com steps visuais
- [ ] Ilustrações ou ícones grandes
- [ ] Progress bar elegante
- [ ] Cards de seleção (tipo igreja, etc.)

### 4. DashboardLayout.tsx (Sidebar)
- [ ] Sidebar com fundo sutil (gray-50 ou gradiente leve)
- [ ] Logo Filadélfias com gradiente ✅
- [ ] Menu items com ícones e hover elegante
- [ ] Indicador de item ativo (barra lateral verde)
- [ ] Seção de usuário no rodapé com avatar
- [ ] Notificações e busca no header
- [ ] Responsividade aprimorada

### 5. HomePage.tsx (Dashboard)
- [ ] Saudação personalizada com data
- [ ] Grid de KPIs (4 cards) com ícones e indicadores
- [ ] Card hero de boas-vindas com gradiente escuro
- [ ] Ações rápidas (grid de módulos)
- [ ] Widgets: próximos eventos, atividade recente
- [ ] Animações de entrada

### 6. MembersPage.tsx
- [ ] Header com título, descrição e botão "Novo Membro"
- [ ] Barra de busca e filtros
- [ ] Tabela elegante com:
  - Avatar do membro
  - Status com badge colorido
  - Ações inline (ver, editar, excluir)
  - Hover state nas linhas
- [ ] Paginação estilizada
- [ ] Modal de novo membro modernizado

### 7. TreasuryPage.tsx
- [ ] Manter estrutura atual (já está boa)
- [ ] Ajustar cores para verde bandeira (remover indigo)
- [ ] Melhorar cards de saldo com gradientes
- [ ] Tabela de transações com ícones de tipo

### 8. CouncilsPage.tsx
- [ ] Cards de conselhos/reuniões
- [ ] Timeline de atas
- [ ] Status visual (pendente, aprovado, etc.)

### 9. MissionsPage.tsx
- [ ] Cards de missionários com foto
- [ ] Mapa ou indicador de localização
- [ ] Progress de metas/arrecadação

### 10. EBDClassesPage.tsx
- [ ] Grid de classes com cards visuais
- [ ] Indicador de alunos/professores
- [ ] Calendário de aulas

### 11. Componentes UI Base
- [ ] `card.tsx` - Variantes premium
- [ ] `button.tsx` - Variantes com gradiente
- [ ] `table.tsx` - Estilo moderno
- [ ] `input.tsx` - Com ícones e estados
- [ ] `badge.tsx` - Cores consistentes
- [ ] Novo: `avatar.tsx`
- [ ] Novo: `stats-card.tsx`
- [ ] Novo: `page-header.tsx`

---

## 📅 Ordem de Execução Sugerida

### Fase 1 - Fundação (Prioridade Alta)
1. Atualizar componentes UI base (`card`, `button`, `input`, `table`)
2. Criar novos componentes reutilizáveis (`stats-card`, `page-header`, `avatar`)
3. LoginPage.tsx
4. RegisterPage.tsx

### Fase 2 - Dashboard Core
5. DashboardLayout.tsx (sidebar e header)
6. HomePage.tsx (dashboard principal)

### Fase 3 - Módulos Principais
7. MembersPage.tsx + componentes de members/
8. TreasuryPage.tsx + componentes de financial/

### Fase 4 - Módulos Secundários
9. OnboardingPage.tsx
10. CouncilsPage.tsx
11. MissionsPage.tsx
12. EBDClassesPage.tsx

---

## ✅ Checklist de Qualidade

- [ ] Responsividade em todos os breakpoints (mobile, tablet, desktop)
- [ ] Estados de loading com skeletons
- [ ] Estados vazios com ilustrações
- [ ] Feedback visual em ações (toast, animações)
- [ ] Acessibilidade (contraste, focus states)
- [ ] Performance (lazy loading, otimizações)
- [ ] Consistência visual entre páginas

---

## 📝 Notas

- Manter consistência com a LandingPage já modernizada
- Usar o mesmo gradiente verde → teal como identidade visual
- Preferir `rounded-2xl` para cards e `rounded-xl` para botões
- Espaçamento generoso (`space-y-6`, `gap-6`, `p-6`)
- Animações sutis com `transition-all duration-300`

---

*Documento criado em: 19/01/2026*
*Última atualização: 19/01/2026*
