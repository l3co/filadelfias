# Análise de Testes E2E - Filadélfias

## Resumo da Situação Atual

### Features Existentes (14 arquivos)

| Módulo | Arquivo | Cenários | Status |
|--------|---------|----------|--------|
| Auth | `login.feature` | 4 cenários | ✅ Básico |
| Auth | `forgot-password.feature` | 1 cenário | ✅ Smoke |
| Auth | `reset-password.feature` | 1 cenário | ⚠️ Skip |
| Dashboard | `navigation.feature` | 1 cenário | ✅ Básico |
| EBD | `classes.feature` | 1 cenário | ⚠️ Mínimo |
| Financial | `treasury.feature` | 1 cenário | ⚠️ Mínimo |
| Governance | `councils.feature` | 1 cenário | ⚠️ Mínimo |
| Members | `members-management.feature` | 1 cenário | ⚠️ Mínimo |
| Missions | `missionaries.feature` | 1 cenário | ⚠️ Mínimo |
| Public | `bible.feature` | ? | ✅ |
| Public | `hymnal.feature` | ? | ✅ |
| Public | `manual.feature` | ? | ✅ |
| Registration | `church-registration.feature` | 3 cenários | ✅ Wizard |
| Settings | `church-settings.feature` | 1 cenário | ⚠️ Mínimo |

### Problemas Identificados

1. **Sem cobertura para funcionalidades novas:**
   - ❌ Devocionais (existe rota `/membro/devocionais`)
   - ❌ Pedidos de Oração (existe rota `/membro/oracao`)
   - ❌ Eventos (existe rota `/membro/eventos`)

2. **Sem visão de membro:**
   - Todos os testes usam `logado como administrador`
   - Área de membro (`/membro/*`) não testada
   - Diferença de permissões não validada

3. **Sem fluxos completos E2E:**
   - Não há teste de jornada completa (cadastro → login → uso)
   - Não há teste de convite de membro

4. **Sem testes de RBAC:**
   - Diferentes ofícios (Pastor, Presbítero, Diácono, Membro)
   - Diferentes funções (Tesoureiro, Secretário)
   - Restrições de acesso não testadas

---

## Plano de Implementação

### Fase 1: Fluxos Críticos de Jornada (Prioridade Alta)

#### 1.1 Jornada Completa: Igreja Nova
```gherkin
# e2e/features/journeys/complete-onboarding.feature
Funcionalidade: Jornada completa de onboarding
  Como um líder que quer usar a plataforma
  Eu quero cadastrar minha igreja e começar a usar
  Para gerenciar minha comunidade

  @journey @integration @needs-backend
  Cenário: Cadastro completo de igreja e primeiro acesso
    Dado que estou na página de cadastro de igreja
    Quando preencho todos os dados da igreja
    E preencho os dados do administrador
    E confirmo o cadastro
    Então devo receber email de boas-vindas
    E devo conseguir fazer login
    E devo ser redirecionado para o dashboard administrativo
```

#### 1.2 Jornada: Convite e Login de Membro
```gherkin
# e2e/features/journeys/member-invitation.feature
Funcionalidade: Convite e acesso de membro
  Como um administrador
  Eu quero convidar membros para a plataforma
  Para que eles possam acessar a área de membros

  @journey @integration @needs-backend
  Cenário: Fluxo completo de convite de membro
    Dado que estou logado como administrador
    E que cadastrei um novo membro "João Silva" com email "joao@email.com"
    Quando envio o convite para o membro
    Então o membro deve receber email com senha temporária
    
    # Membro acessa
    Dado que o membro acessa a plataforma
    Quando o membro faz login com a senha temporária
    Então o membro deve ser redirecionado para "/membro"
    E o membro deve ver o dashboard de membros
    E o membro NÃO deve ver menu de administração
```

---

### Fase 2: Área de Membros (Prioridade Alta)

#### 2.1 Dashboard de Membro
```gherkin
# e2e/features/member/member-dashboard.feature
Funcionalidade: Dashboard do Membro
  Como um membro da igreja
  Eu quero acessar minha área
  Para participar da comunidade

  Contexto:
    Dado que estou logado como membro

  @integration @needs-backend
  Cenário: Visualizar dashboard de membro
    Então devo ser redirecionado para "/membro"
    E devo ver card "Bíblia Online"
    E devo ver card "Devocionais"
    E devo ver card "Pedidos de Oração"
    E devo ver card "Eventos"
    E devo ver card "Membros"
    E devo ver card "EBD"
    E devo ver card "Missões"

  @integration @needs-backend  
  Cenário: Membro não vê opções administrativas
    Então NÃO devo ver link para "Tesouraria"
    E NÃO devo ver link para "Governança"
    E NÃO devo ver link para "Configurações"
```

#### 2.2 Devocionais
```gherkin
# e2e/features/member/devotionals.feature
Funcionalidade: Devocionais
  Como um membro da igreja
  Eu quero ler os devocionais
  Para minha edificação espiritual

  @integration @needs-backend
  Cenário: Visualizar devocional do dia
    Dado que estou logado como membro
    E que estou na página de Devocionais
    Então devo ver o devocional de hoje
    E devo ver o título do devocional
    E devo ver a referência bíblica
    E devo ver o texto da meditação

  @integration @needs-backend
  Cenário: Administrador cria devocional
    Dado que estou logado como administrador
    E que estou na página de Devocionais (admin)
    Quando clico em "Novo Devocional"
    E preencho o título "Amor de Deus"
    E preencho a referência "João 3:16"
    E preencho o texto do versículo
    E preencho a meditação
    E clico em "Salvar"
    Então devo ver mensagem de sucesso
    E o devocional deve aparecer na lista
```

#### 2.3 Pedidos de Oração
```gherkin
# e2e/features/member/prayer-requests.feature
Funcionalidade: Pedidos de Oração
  Como um membro da igreja
  Eu quero compartilhar e orar por pedidos
  Para fortalecer nossa comunidade

  @integration @needs-backend
  Cenário: Criar pedido de oração
    Dado que estou logado como membro
    E que estou na página de Pedidos de Oração
    Quando clico em "Novo Pedido"
    E preencho o conteúdo "Oração pela minha família"
    E seleciono categoria "Família"
    E clico em "Enviar"
    Então devo ver mensagem de sucesso
    E meu pedido deve aparecer na lista

  @integration @needs-backend
  Cenário: Criar pedido anônimo
    Dado que estou logado como membro
    E que estou na página de Pedidos de Oração
    Quando clico em "Novo Pedido"
    E preencho o conteúdo "Pedido confidencial"
    E marco como anônimo
    E clico em "Enviar"
    Então o pedido deve aparecer sem meu nome

  @integration @needs-backend
  Cenário: Orar por um pedido
    Dado que estou logado como membro
    E que existe um pedido de oração
    Quando clico em "Orei por este pedido"
    Então o contador de orações deve aumentar
```

#### 2.4 Eventos
```gherkin
# e2e/features/member/events.feature
Funcionalidade: Eventos
  Como um membro da igreja
  Eu quero ver os próximos eventos
  Para participar das atividades

  @integration @needs-backend
  Cenário: Visualizar lista de eventos
    Dado que estou logado como membro
    E que estou na página de Eventos
    Então devo ver lista de eventos futuros
    E cada evento deve mostrar data e horário
    E cada evento deve mostrar local
```

---

### Fase 3: Testes de RBAC/Permissões (Prioridade Média)

#### 3.1 Permissões por Ofício
```gherkin
# e2e/features/rbac/office-permissions.feature
Funcionalidade: Permissões por Ofício Eclesiástico
  Como administrador do sistema
  Eu quero que cada ofício tenha permissões adequadas
  Para manter a governança bíblica

  @rbac @integration @needs-backend
  Cenário: Pastor tem acesso total
    Dado que estou logado como Pastor
    Então devo ver menu "Membros"
    E devo ver menu "Governança"
    E devo ver menu "Tesouraria"
    E devo ver menu "EBD"
    E devo ver menu "Missões"
    E devo ver menu "Configurações"
    E devo poder criar novos membros
    E devo poder excluir membros

  @rbac @integration @needs-backend
  Cenário: Presbítero tem acesso de governança
    Dado que estou logado como Presbítero
    Então devo ver menu "Membros"
    E devo ver menu "Governança"
    E devo ver menu "Tesouraria"
    E devo poder criar membros
    Mas NÃO devo poder excluir membros
    E NÃO devo poder editar configurações

  @rbac @integration @needs-backend
  Cenário: Diácono tem acesso limitado
    Dado que estou logado como Diácono
    Então devo ver menu "Membros"
    E devo ver menu "Tesouraria"
    Mas NÃO devo ver menu "Governança"
    E NÃO devo poder excluir membros

  @rbac @integration @needs-backend
  Cenário: Membro comum só vê área de membro
    Dado que estou logado como Membro
    Então devo ser redirecionado para "/membro"
    E NÃO devo ter acesso a "/app"
```

#### 3.2 Permissões por Função
```gherkin
# e2e/features/rbac/function-permissions.feature
Funcionalidade: Permissões por Função
  Como administrador
  Eu quero que funções específicas tenham permissões extras
  Para delegar responsabilidades

  @rbac @integration @needs-backend
  Cenário: Tesoureiro tem acesso financeiro completo
    Dado que estou logado como membro com função "Tesoureiro"
    Então devo ver menu "Tesouraria"
    E devo poder criar transações
    E devo poder gerar relatórios financeiros

  @rbac @integration @needs-backend
  Cenário: Secretário tem acesso a documentação
    Dado que estou logado como membro com função "Secretário"
    Então devo ver menu "Governança"
    E devo poder criar atas de reunião
    E devo poder gerenciar documentos
```

---

### Fase 4: Fluxos CRUD Completos (Prioridade Média)

#### 4.1 Membros - CRUD Completo
```gherkin
# e2e/features/members/members-crud.feature
Funcionalidade: CRUD de Membros
  Como um administrador
  Eu quero gerenciar membros completamente
  Para manter o rol atualizado

  @integration @needs-backend
  Cenário: Criar novo membro
    Dado que estou logado como administrador
    E que estou na página de Membros
    Quando clico em "Novo Membro"
    E preencho o nome "Maria Santos"
    E preencho o email "maria@email.com"
    E seleciono status "Comungante"
    E clico em "Salvar"
    Então devo ver mensagem de sucesso
    E o membro deve aparecer na lista

  @integration @needs-backend
  Cenário: Editar membro existente
    Dado que estou logado como administrador
    E que existe um membro "João Silva"
    Quando acesso a edição do membro
    E altero o telefone para "(11) 99999-0000"
    E clico em "Salvar"
    Então devo ver mensagem de sucesso

  @integration @needs-backend
  Cenário: Buscar membro
    Dado que estou logado como administrador
    E que estou na página de Membros
    Quando pesquiso por "Silva"
    Então devo ver apenas membros com "Silva" no nome

  @integration @needs-backend
  Cenário: Excluir membro (apenas Pastor)
    Dado que estou logado como Pastor
    E que existe um membro "Carlos Inativo"
    Quando excluo o membro
    Então devo ver confirmação
    E o membro não deve mais aparecer na lista
```

#### 4.2 EBD - Fluxo Completo
```gherkin
# e2e/features/ebd/ebd-complete.feature
Funcionalidade: Gestão Completa de EBD
  Como um administrador
  Eu quero gerenciar classes, alunos e lições
  Para organizar a Escola Bíblica Dominical

  @integration @needs-backend
  Cenário: Criar classe de EBD
    Dado que estou logado como administrador
    E que estou na página de EBD
    Quando clico em "Nova Classe"
    E preencho nome "Jovens"
    E defino faixa etária 15 a 25
    E clico em "Salvar"
    Então a classe deve aparecer na lista

  @integration @needs-backend
  Cenário: Matricular aluno em classe
    Dado que estou logado como administrador
    E que existe uma classe "Jovens"
    E que existe um membro "Pedro Santos"
    Quando acesso a classe "Jovens"
    E clico em "Adicionar Aluno"
    E seleciono "Pedro Santos"
    Então o aluno deve aparecer na lista da classe

  @integration @needs-backend
  Cenário: Membro vê sua turma
    Dado que estou logado como membro matriculado em "Jovens"
    E que estou na página de EBD (membro)
    Então devo ver minha classe "Jovens"
    E devo ver os materiais de estudo
```

---

### Fase 5: Testes de Erro e Edge Cases (Prioridade Baixa)

```gherkin
# e2e/features/errors/error-handling.feature
Funcionalidade: Tratamento de Erros
  
  @error-handling
  Cenário: Login com credenciais inválidas
    Dado que estou na página de login
    Quando tento logar com email inválido
    Então devo ver mensagem "Credenciais inválidas"

  @error-handling
  Cenário: Acesso não autorizado
    Dado que estou logado como Membro
    Quando tento acessar "/app/tesouraria"
    Então devo ser redirecionado para página de erro
    Ou devo ser redirecionado para "/membro"

  @error-handling
  Cenário: Sessão expirada
    Dado que minha sessão expirou
    Quando tento realizar uma ação
    Então devo ser redirecionado para login
    E devo ver mensagem "Sessão expirada"
```

---

## Estrutura de Arquivos Proposta

```
e2e/features/
├── auth/
│   ├── login.feature ✅
│   ├── forgot-password.feature ✅
│   └── reset-password.feature ✅
├── journeys/                    # NOVO
│   ├── complete-onboarding.feature
│   └── member-invitation.feature
├── member/                      # NOVO
│   ├── member-dashboard.feature
│   ├── devotionals.feature
│   ├── prayer-requests.feature
│   └── events.feature
├── rbac/                        # NOVO
│   ├── office-permissions.feature
│   └── function-permissions.feature
├── members/
│   ├── members-management.feature ✅
│   └── members-crud.feature     # NOVO
├── ebd/
│   ├── classes.feature ✅
│   └── ebd-complete.feature     # NOVO
├── financial/
│   └── treasury.feature ✅
├── governance/
│   └── councils.feature ✅
├── missions/
│   └── missionaries.feature ✅
├── errors/                      # NOVO
│   └── error-handling.feature
└── ...
```

---

## Fixtures Necessárias

```typescript
// e2e/support/fixtures.ts - ADICIONAR

export const testUsers = {
  // Existentes
  admin: { ... },
  member: { ... },
  
  // NOVOS
  pastor: {
    email: 'pastor@igreja.com',
    password: 'S3nh@Pastor',
    name: 'Rev. João Silva',
    office: 'PASTOR',
  },
  presbitero: {
    email: 'presbitero@igreja.com',
    password: 'S3nh@Presb',
    name: 'Presb. Carlos Santos',
    office: 'PRESBITERO',
  },
  diacono: {
    email: 'diacono@igreja.com',
    password: 'S3nh@Diac',
    name: 'Diác. Pedro Lima',
    office: 'DIACONO',
  },
  tesoureiro: {
    email: 'tesoureiro@igreja.com',
    password: 'S3nh@Tes',
    name: 'Ana Tesoureira',
    office: 'MEMBRO',
    functions: ['TESOUREIRO'],
  },
};

export const testDevotionals = {
  today: {
    title: 'O Amor de Deus',
    verseReference: 'João 3:16',
    verseText: 'Porque Deus amou o mundo...',
    meditation: 'Reflexão sobre o amor incondicional.',
  },
};

export const testPrayerRequests = {
  public: {
    content: 'Oração pela família',
    category: 'family',
    isAnonymous: false,
  },
  anonymous: {
    content: 'Pedido confidencial',
    category: 'spiritual',
    isAnonymous: true,
  },
};
```

---

## Ordem de Implementação Sugerida

### Sprint 1 (Crítico)
1. ✅ `journeys/member-invitation.feature` - Fluxo de convite
2. ✅ `member/member-dashboard.feature` - Dashboard membro

### Sprint 2 (Funcionalidades Novas)
3. ✅ `member/devotionals.feature`
4. ✅ `member/prayer-requests.feature`
5. ✅ `member/events.feature`

### Sprint 3 (RBAC)
6. ✅ `rbac/office-permissions.feature`
7. ✅ `rbac/function-permissions.feature`

### Sprint 4 (CRUD Completo)
8. ✅ `members/members-crud.feature`
9. ✅ `ebd/ebd-complete.feature`

### Sprint 5 (Robustez)
10. ✅ `errors/error-handling.feature`

---

## Comandos para Execução

```bash
# Todos os testes E2E
pnpm test:e2e

# Apenas smoke tests (rápido, sem backend)
pnpm test:e2e --tags @smoke

# Testes de integração (precisa backend)
pnpm test:e2e --tags @integration

# Testes de jornada completa
pnpm test:e2e --tags @journey

# Testes de RBAC
pnpm test:e2e --tags @rbac

# Testes de área de membro
pnpm test:e2e --tags @member
```
