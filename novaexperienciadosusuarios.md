# Nova Experiência dos Usuários - Planejamento
**Data:** Janeiro 2026  
**Status:** Planejamento

---

## 1. Visão Geral

A plataforma atualmente possui uma única experiência (visão administrativa) para todos os usuários. Este documento propõe a criação de **3 experiências distintas** baseadas no perfil do usuário, proporcionando uma navegação mais intuitiva e adequada às necessidades de cada tipo de acesso.

---

## 2. Tipos de Experiências

### 2.1 Experiência Administrativa (Atual)
**Público:** Pastores, Presbíteros, Diáconos, Admin do sistema

**Características:**
- Dashboard com sidebar completo
- Acesso a todos os módulos de gestão
- Relatórios e estatísticas
- Configurações do sistema

**Módulos disponíveis:**
- Membros (gestão completa)
- Governança (conselhos, reuniões)
- Tesouraria (financeiro)
- EBD (gestão de turmas, professores)
- Missões
- Eventos
- Configurações

---

### 2.2 Experiência do Membro/Visitante (NOVA)
**Público:** Membros comuns, visitantes cadastrados

**Filosofia:**
- Interface limpa e simples
- Sem sidebar complexo
- Navegação por **cards/caixinhas**
- Foco em conteúdo e participação

**Layout proposto:**
```
┌─────────────────────────────────────────────────────────────┐
│  Header simples: Logo + Nome do usuário + Notificações      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  "Olá, [Nome]! Bem-vindo à Igreja Filadélfia"              │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   📖        │  │   📚        │  │   🙏        │         │
│  │   Bíblia    │  │   Manual    │  │  Devocionais│         │
│  │   Online    │  │ Presbiteriano│ │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   👥        │  │   📅        │  │   🌍        │         │
│  │  Diretório  │  │   Eventos   │  │  Missões    │         │
│  │  de Membros │  │  Próximos   │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │   📖        │  │   💬        │                          │
│  │   EBD       │  │  Pedidos de │                          │
│  │  Minha Turma│  │   Oração    │                          │
│  └─────────────┘  └─────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Funcionalidades específicas:**

| Card | Descrição |
|------|-----------|
| **Bíblia Online** | Leitura da Bíblia integrada, planos de leitura |
| **Manual Presbiteriano** | Acesso ao manual para consulta |
| **Devocionais** | Devocionais diários, reflexões |
| **Diretório de Membros** | Lista de membros (visualização simples) |
| **Eventos Próximos** | Calendário de eventos da igreja |
| **Missões** | Missionários apoiados, como contribuir |
| **EBD - Minha Turma** | Turma atual, lições, materiais |
| **Pedidos de Oração** | Compartilhar e ver pedidos de oração |

---

### 2.3 Experiência do Professor(a) de EBD (NOVA)
**Público:** Professores de EBD, auxiliares de turma

**Filosofia:**
- Foco nas ferramentas de ensino
- Gestão simplificada da turma
- Acesso rápido aos materiais

**Layout proposto:**
```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo + "Área do Professor" + Perfil               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  "Olá, Professor(a) [Nome]!"                               │
│  Turma: [Nome da Turma] - [Faixa Etária]                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📊 Resumo da Turma                                  │  │
│  │  • Alunos matriculados: 15                           │  │
│  │  • Presença média: 78%                               │  │
│  │  • Próxima aula: Domingo, 09h                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   👥        │  │   📝        │  │   ✅        │         │
│  │   Meus      │  │   Lições    │  │  Chamada    │         │
│  │   Alunos    │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   📚        │  │   📊        │  │   💬        │         │
│  │  Materiais  │  │ Relatórios  │  │  Comunicados│         │
│  │  de Apoio   │  │  da Turma   │  │  aos Pais   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Funcionalidades específicas:**

| Card | Descrição |
|------|-----------|
| **Meus Alunos** | Lista de alunos, contatos, aniversários |
| **Lições** | Plano de aulas, conteúdo programático |
| **Chamada** | Registro de presença simplificado |
| **Materiais de Apoio** | PDFs, vídeos, recursos didáticos |
| **Relatórios da Turma** | Frequência, evolução, gráficos |
| **Comunicados aos Pais** | Enviar avisos, lembretes |

---

## 3. Lógica de Roteamento

### 3.1 Fluxo de Decisão no Login

```
┌─────────────────┐
│     LOGIN       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verificar Perfil│
└────────┬────────┘
         │
    ┌────┴────┬────────────────┐
    │         │                │
    ▼         ▼                ▼
┌───────┐ ┌───────┐      ┌──────────┐
│Admin/ │ │Profes-│      │ Membro/  │
│Pastor/│ │sor(a) │      │Visitante │
│Presb. │ │  EBD  │      │          │
└───┬───┘ └───┬───┘      └────┬─────┘
    │         │               │
    ▼         ▼               ▼
┌───────┐ ┌───────┐      ┌──────────┐
│/app   │ │/portal│      │ /membro  │
│(atual)│ │profes-│      │          │
│       │ │ sor   │      │          │
└───────┘ └───────┘      └──────────┘
```

### 3.2 Critérios de Identificação

| Critério | Rota | Experiência |
|----------|------|-------------|
| `office` = PASTOR, PRESBITERO, DIACONO | `/app` | Administrativa |
| `systemRole` = ADMIN | `/app` | Administrativa |
| `functions` inclui "PROFESSOR_EBD" | `/portal-professor` | Professor |
| Demais casos | `/membro` | Membro/Visitante |

### 3.3 Nova Função Proposta

Adicionar função **PROFESSOR_EBD** ao enum `EcclesiasticalFunction`:

```typescript
type EcclesiasticalFunction = 
  | 'TESOUREIRO' 
  | 'SECRETARIO' 
  | 'EVANGELISTA' 
  | 'MISSIONARIO'
  | 'PROFESSOR_EBD';  // NOVA
```

---

## 4. Estrutura de Rotas Proposta

```
/                       → Landing page (pública)
/login                  → Login
/register               → Registro

/app                    → Dashboard Administrativo (atual)
  /app/members
  /app/governance
  /app/financial
  /app/ebd
  /app/missions
  /app/events
  /app/settings

/membro                 → Portal do Membro (NOVO)
  /membro/biblia
  /membro/manual
  /membro/devocionais
  /membro/diretorio
  /membro/eventos
  /membro/missoes
  /membro/ebd
  /membro/oracao

/portal-professor       → Portal do Professor (NOVO)
  /portal-professor/turma
  /portal-professor/alunos
  /portal-professor/licoes
  /portal-professor/chamada
  /portal-professor/materiais
  /portal-professor/relatorios
```

---

## 5. Componentes UI Necessários

### 5.1 Componentes Novos

| Componente | Descrição |
|------------|-----------|
| `HomeCard` | Card clicável com ícone, título e descrição |
| `MemberLayout` | Layout sem sidebar, header simplificado |
| `TeacherLayout` | Layout do professor com resumo da turma |
| `QuickAccessGrid` | Grid responsivo de cards |
| `WelcomeBanner` | Banner de boas-vindas personalizado |

### 5.2 Exemplo de HomeCard

```tsx
<HomeCard
  icon={<BookOpen />}
  title="Bíblia Online"
  description="Leia e medite na Palavra"
  href="/membro/biblia"
  color="blue"
/>
```

---

## 6. Integrações Externas Sugeridas

### 6.1 Bíblia Online
- **API:** Bible API (api.scripture.api.bible) ou ABibliaDigital
- **Funcionalidades:** Busca, leitura, planos de leitura

### 6.2 Manual Presbiteriano
- **Formato:** PDF embarcado ou HTML
- **Funcionalidades:** Busca, favoritos, índice

### 6.3 Devocionais
- **Opções:** Conteúdo próprio ou integração com APIs
- **Funcionalidades:** Devocional do dia, histórico

---

## 7. Priorização

### Fase 1 - MVP do Portal do Membro
1. Layout `MemberLayout` sem sidebar
2. Componente `HomeCard`
3. Tela inicial com cards
4. Roteamento baseado em perfil
5. Diretório de membros (visualização)
6. Eventos (visualização)

### Fase 2 - Conteúdo Espiritual
1. Integração Bíblia Online
2. Manual Presbiteriano (PDF)
3. Devocionais básicos
4. Pedidos de oração

### Fase 3 - Portal do Professor
1. Layout `TeacherLayout`
2. Gestão de turma simplificada
3. Chamada digital
4. Materiais de apoio

### Fase 4 - Refinamentos
1. Notificações push
2. Gamificação (badges de leitura)
3. Integração com WhatsApp
4. App mobile (PWA)

---

## 8. Mockups Conceituais

### 8.1 Tela do Membro (Mobile)

```
┌─────────────────────┐
│ ☰  Igreja Filadélfia│
├─────────────────────┤
│                     │
│  Olá, João!         │
│  Bem-vindo de volta │
│                     │
│  ┌───────┐ ┌───────┐│
│  │📖     │ │📚     ││
│  │Bíblia │ │Manual ││
│  └───────┘ └───────┘│
│                     │
│  ┌───────┐ ┌───────┐│
│  │👥     │ │📅     ││
│  │Membros│ │Eventos││
│  └───────┘ └───────┘│
│                     │
│  ┌───────┐ ┌───────┐│
│  │📖     │ │🙏     ││
│  │EBD    │ │Oração ││
│  └───────┘ └───────┘│
│                     │
└─────────────────────┘
```

---

## 9. Considerações Técnicas

### 9.1 Alterações no Backend
- Adicionar função `PROFESSOR_EBD` ao enum
- Endpoint para verificar tipo de experiência
- Adaptar permissões para novos contextos

### 9.2 Alterações no Frontend
- Criar novos layouts (`MemberLayout`, `TeacherLayout`)
- Lógica de redirecionamento pós-login
- Novos componentes de card
- Novas rotas e páginas

### 9.3 Banco de Dados
- Nenhuma alteração estrutural necessária
- Dados já existentes são suficientes

---

## 10. Resumo

| Experiência | Público | Rota Base | Layout |
|-------------|---------|-----------|--------|
| Administrativa | Pastor, Presbítero, Diácono, Admin | `/app` | Sidebar completo |
| Membro | Membros, Visitantes | `/membro` | Cards, sem sidebar |
| Professor | Professores de EBD | `/portal-professor` | Focado na turma |

**Objetivo principal:** Proporcionar uma experiência adequada para cada tipo de usuário, simplificando a navegação para membros comuns e professores, enquanto mantém a complexidade necessária para a administração.
