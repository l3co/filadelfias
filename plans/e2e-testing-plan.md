# Plano de Testes End-to-End — Filadélfias Web

**Última atualização:** 2026-01-20  
**Stack de testes:** Cucumber + Gherkin + Playwright  
**Objetivo:** Garantir a qualidade dos fluxos críticos através de testes legíveis e mantíveis

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Pastas](#estrutura-de-pastas)
3. [Fluxos de Teste](#fluxos-de-teste)
   - [Autenticação](#1-autenticação)
   - [Registro de Igreja](#2-registro-de-igreja)
   - [Área Pública](#3-área-pública)
   - [Dashboard e Navegação](#4-dashboard-e-navegação)
   - [Gestão de Membros](#5-gestão-de-membros)
   - [Tesouraria](#6-tesouraria)
   - [Governança](#7-governança)
   - [EBD](#8-ebd)
   - [Missões](#9-missões)
   - [Configurações](#10-configurações)
4. [Priorização](#priorização)
5. [Configuração Técnica](#configuração-técnica)

---

## Visão Geral

Este documento define todos os cenários de teste E2E para a plataforma web Filadélfias, utilizando **Gherkin** para escrita dos cenários e **Playwright** para execução.

### Benefícios da abordagem Cucumber + Gherkin

- **Legibilidade:** Cenários escritos em linguagem natural (português)
- **Documentação viva:** Os testes servem como especificação
- **Colaboração:** Não-técnicos podem entender e contribuir
- **Reusabilidade:** Steps podem ser reutilizados entre cenários

---

## Estrutura de Pastas

```
apps/web/
├── e2e/
│   ├── features/                    # Arquivos .feature (Gherkin)
│   │   ├── auth/
│   │   │   ├── login.feature
│   │   │   ├── forgot-password.feature
│   │   │   └── reset-password.feature
│   │   ├── registration/
│   │   │   └── church-registration.feature
│   │   ├── public/
│   │   │   ├── bible.feature
│   │   │   ├── hymnal.feature
│   │   │   └── manual.feature
│   │   ├── members/
│   │   │   └── members-management.feature
│   │   ├── financial/
│   │   │   └── treasury.feature
│   │   ├── governance/
│   │   │   └── councils.feature
│   │   ├── ebd/
│   │   │   └── classes.feature
│   │   ├── missions/
│   │   │   └── missionaries.feature
│   │   └── settings/
│   │       └── church-settings.feature
│   ├── steps/                       # Step definitions (TypeScript)
│   │   ├── auth.steps.ts
│   │   ├── registration.steps.ts
│   │   ├── navigation.steps.ts
│   │   ├── members.steps.ts
│   │   └── common.steps.ts
│   ├── support/
│   │   ├── hooks.ts                 # Before/After hooks
│   │   ├── world.ts                 # Contexto compartilhado
│   │   └── fixtures.ts              # Dados de teste
│   └── cucumber.config.ts
├── playwright.config.ts
└── package.json
```

---

## Fluxos de Teste

### 1. Autenticação

#### 1.1 Login (`auth/login.feature`)

```gherkin
# language: pt

Funcionalidade: Login de usuário
  Como um usuário cadastrado
  Eu quero fazer login na plataforma
  Para acessar a área administrativa da minha igreja

  Contexto:
    Dado que estou na página de login

  @smoke @critical
  Cenário: Login com credenciais válidas
    Quando preencho o email "admin@igreja.com"
    E preencho a senha "MinhaS3nh@Segura"
    E clico no botão "Entrar"
    Então devo ser redirecionado para "/app"
    E devo ver a mensagem de boas-vindas

  @smoke
  Cenário: Login com credenciais inválidas
    Quando preencho o email "usuario@inexistente.com"
    E preencho a senha "senhaerrada"
    E clico no botão "Entrar"
    Então devo ver a mensagem de erro "Email ou senha incorretos"
    E devo permanecer na página de login

  Cenário: Login com email inválido
    Quando preencho o email "emailinvalido"
    E clico no botão "Entrar"
    Então devo ver erro de validação no campo email

  Cenário: Login com senha vazia
    Quando preencho o email "admin@igreja.com"
    E deixo o campo senha vazio
    E clico no botão "Entrar"
    Então devo ver erro de validação no campo senha

  Cenário: Navegar para recuperação de senha
    Quando clico no link "Esqueceu sua senha?"
    Então devo ser redirecionado para "/forgot-password"

  Cenário: Navegar para cadastro de igreja
    Quando clico no link "Cadastre sua igreja"
    Então devo ser redirecionado para "/register"
```

#### 1.2 Recuperação de Senha (`auth/forgot-password.feature`)

```gherkin
# language: pt

Funcionalidade: Recuperação de senha
  Como um usuário que esqueceu a senha
  Eu quero solicitar um link de redefinição
  Para recuperar o acesso à minha conta

  Contexto:
    Dado que estou na página de recuperação de senha

  @smoke
  Cenário: Solicitar recuperação com email válido
    Quando preencho o email "admin@igreja.com"
    E clico no botão "Enviar link"
    Então devo ver a mensagem "Link enviado para seu email"

  Cenário: Solicitar recuperação com email não cadastrado
    Quando preencho o email "naoexiste@email.com"
    E clico no botão "Enviar link"
    Então devo ver a mensagem "Email não encontrado"

  Cenário: Voltar para página de login
    Quando clico no link "Voltar para login"
    Então devo ser redirecionado para "/login"
```

#### 1.3 Redefinição de Senha (`auth/reset-password.feature`)

```gherkin
# language: pt

Funcionalidade: Redefinição de senha
  Como um usuário com link de redefinição
  Eu quero criar uma nova senha
  Para recuperar o acesso à minha conta

  Contexto:
    Dado que acessei o link de redefinição válido

  @smoke
  Cenário: Redefinir senha com sucesso
    Quando preencho a nova senha "NovaS3nh@Segura"
    E confirmo a senha "NovaS3nh@Segura"
    E clico no botão "Redefinir senha"
    Então devo ver a mensagem "Senha alterada com sucesso"
    E devo ser redirecionado para "/login"

  Cenário: Senhas não conferem
    Quando preencho a nova senha "NovaS3nh@Segura"
    E confirmo a senha "SenhaDiferente"
    E clico no botão "Redefinir senha"
    Então devo ver erro "As senhas não conferem"

  Cenário: Senha muito fraca
    Quando preencho a nova senha "123"
    E confirmo a senha "123"
    E clico no botão "Redefinir senha"
    Então devo ver erro de validação de senha fraca

  Cenário: Link expirado
    Dado que o link de redefinição expirou
    Então devo ver a mensagem "Link expirado ou inválido"
    E devo ver opção para solicitar novo link
```

---

### 2. Registro de Igreja

#### 2.1 Wizard de Cadastro (`registration/church-registration.feature`)

```gherkin
# language: pt

Funcionalidade: Cadastro de nova igreja
  Como um líder de igreja
  Eu quero cadastrar minha igreja na plataforma
  Para utilizar as ferramentas de gestão

  Contexto:
    Dado que estou na página de cadastro de igreja

  @smoke @critical
  Cenário: Cadastro completo com sucesso
    # Passo 1: Dados da Igreja
    Quando preencho o nome da igreja "Igreja Presbiteriana Central"
    E preencho o identificador "ipc-centro"
    E verifico que o identificador está disponível
    E clico em "Próximo"
    
    # Passo 2: Endereço
    E preencho o CEP "01310-100"
    E aguardo o preenchimento automático do endereço
    E preencho o número "100"
    E clico em "Próximo"
    
    # Passo 3: Dados do Administrador
    E preencho o nome do administrador "Pastor João Silva"
    E preencho o email "pastor@ipc-centro.com"
    E preencho o telefone "(11) 99999-9999"
    E preencho a senha "S3nh@Segura123"
    E confirmo a senha "S3nh@Segura123"
    E clico em "Cadastrar Igreja"
    
    Então devo ver a mensagem de sucesso
    E devo ser redirecionado para a área administrativa
    E devo estar logado como "Pastor João Silva"

  Cenário: Identificador já em uso
    Quando preencho o nome da igreja "Outra Igreja"
    E preencho o identificador "ipc-existente"
    Então devo ver aviso "Este identificador já está em uso"
    E o botão "Próximo" deve estar desabilitado

  Cenário: Validação de CEP
    Dado que estou no passo de endereço
    Quando preencho o CEP "00000-000"
    Então devo ver erro "CEP não encontrado"

  Cenário: Email já cadastrado
    Dado que estou no passo de dados do administrador
    Quando preencho o email "admin@existente.com"
    E clico em "Cadastrar Igreja"
    Então devo ver erro "Este email já está cadastrado"

  Cenário: Voltar entre passos
    Dado que estou no passo 2
    Quando clico em "Voltar"
    Então devo estar no passo 1
    E os dados preenchidos devem ser mantidos
```

---

### 3. Área Pública

#### 3.1 Bíblia (`public/bible.feature`)

```gherkin
# language: pt

Funcionalidade: Leitura da Bíblia
  Como um visitante ou membro
  Eu quero ler a Bíblia online
  Para meditar na Palavra de Deus

  @smoke
  Cenário: Acessar página inicial da Bíblia
    Dado que estou na página da Bíblia
    Então devo ver a lista de livros do Antigo Testamento
    E devo ver a lista de livros do Novo Testamento
    E devo ver seletor de versão da Bíblia

  Cenário: Selecionar livro e capítulo
    Dado que estou na página da Bíblia
    Quando clico no livro "Gênesis"
    E seleciono o capítulo 1
    Então devo ser redirecionado para "/bible/genesis/1"
    E devo ver o texto de Gênesis 1

  Cenário: Navegar entre capítulos
    Dado que estou lendo Gênesis capítulo 1
    Quando clico em "Próximo capítulo"
    Então devo estar em Gênesis capítulo 2

  Cenário: Trocar versão da Bíblia
    Dado que estou lendo na versão ARA
    Quando seleciono a versão "NVI"
    Então o texto deve ser atualizado para a versão NVI

  Cenário: Buscar passagem específica
    Dado que estou na página da Bíblia
    Quando busco por "João 3:16"
    Então devo ser redirecionado para o versículo
    E devo ver o texto destacado
```

#### 3.2 Hinário (`public/hymnal.feature`)

```gherkin
# language: pt

Funcionalidade: Consulta ao Hinário
  Como um membro da igreja
  Eu quero consultar hinos do Novo Cântico
  Para louvar a Deus nos cultos

  @smoke
  Cenário: Acessar página do Hinário
    Dado que estou na página do Hinário
    Então devo ver campo de busca
    E devo ver lista de hinos

  Cenário: Buscar hino por número
    Dado que estou na página do Hinário
    Quando busco pelo número "001"
    Então devo ver o hino "Santo, Santo, Santo"

  Cenário: Buscar hino por título
    Dado que estou na página do Hinário
    Quando busco por "Castelo Forte"
    Então devo ver o hino número 581

  Cenário: Visualizar letra completa
    Dado que estou na página do Hinário
    Quando clico no hino "001"
    Então devo ser redirecionado para "/hymnal/1"
    E devo ver a letra completa do hino
    E devo ver informações do autor
```

#### 3.3 Manual Presbiteriano (`public/manual.feature`)

```gherkin
# language: pt

Funcionalidade: Consulta ao Manual Presbiteriano
  Como um presbítero ou membro
  Eu quero consultar o Manual Presbiteriano
  Para conhecer as normas da IPB

  @smoke
  Cenário: Acessar página do Manual
    Dado que estou na página do Manual
    Então devo ver índice com seções do manual
    E devo ver campo de busca

  Cenário: Navegar por seção
    Dado que estou na página do Manual
    Quando clico na seção "Da Igreja"
    Então devo ver o conteúdo da seção

  Cenário: Buscar por termo
    Dado que estou na página do Manual
    Quando busco por "batismo"
    Então devo ver resultados relacionados a batismo
```

---

### 4. Dashboard e Navegação

#### 4.1 Navegação Geral (`dashboard/navigation.feature`)

```gherkin
# language: pt

Funcionalidade: Navegação na área administrativa
  Como um usuário autenticado
  Eu quero navegar pelos módulos da plataforma
  Para gerenciar minha igreja

  Contexto:
    Dado que estou logado como administrador
    E estou na área administrativa

  @smoke
  Cenário: Visualizar dashboard
    Então devo ver o nome da minha igreja
    E devo ver menu lateral com todos os módulos
    E devo ver meu nome no canto superior

  Cenário: Navegar para Membros
    Quando clico em "Membros" no menu
    Então devo ser redirecionado para "/app/members"

  Cenário: Navegar para Tesouraria
    Quando clico em "Tesouraria" no menu
    Então devo ser redirecionado para "/app/financial"

  Cenário: Navegar para Governança
    Quando clico em "Governança" no menu
    Então devo ser redirecionado para "/app/governance"

  Cenário: Navegar para EBD
    Quando clico em "EBD" no menu
    Então devo ser redirecionado para "/app/ebd"

  Cenário: Navegar para Missões
    Quando clico em "Missões" no menu
    Então devo ser redirecionado para "/app/missions"

  Cenário: Navegar para Configurações
    Quando clico em "Configurações" no menu
    Então devo ser redirecionado para "/app/settings"

  Cenário: Fazer logout
    Quando clico em "Sair da conta"
    Então devo ser redirecionado para "/login"
    E não devo estar mais autenticado
```

---

### 5. Gestão de Membros

#### 5.1 Listagem e CRUD (`members/members-management.feature`)

```gherkin
# language: pt

Funcionalidade: Gestão de Membros
  Como um administrador da igreja
  Eu quero gerenciar os membros
  Para manter o rol de membros atualizado

  Contexto:
    Dado que estou logado como administrador
    E estou na página de Membros

  @smoke
  Cenário: Visualizar lista de membros
    Então devo ver a tabela de membros
    E devo ver campo de busca
    E devo ver botão "Adicionar Membro"

  Cenário: Buscar membro por nome
    Dado que existe um membro "Maria Santos"
    Quando busco por "Maria"
    Então devo ver "Maria Santos" na lista
    E não devo ver membros que não contêm "Maria"

  @smoke
  Cenário: Adicionar novo membro
    Quando clico em "Adicionar Membro"
    E preencho o nome "João Pereira"
    E preencho o email "joao@email.com"
    E seleciono o status "Comungante"
    E clico em "Salvar"
    Então devo ver mensagem "Membro cadastrado com sucesso"
    E "João Pereira" deve aparecer na lista

  Cenário: Editar membro existente
    Dado que existe um membro "Carlos Silva"
    Quando clico em editar "Carlos Silva"
    E altero o telefone para "(11) 88888-8888"
    E clico em "Salvar"
    Então devo ver mensagem "Membro atualizado com sucesso"

  Cenário: Filtrar por status
    Quando seleciono o filtro "Comungantes"
    Então devo ver apenas membros comungantes

  Cenário: Exportar lista de membros
    Quando clico em "Exportar"
    Então um arquivo deve ser baixado
```

---

### 6. Tesouraria

#### 6.1 Gestão Financeira (`financial/treasury.feature`)

```gherkin
# language: pt

Funcionalidade: Gestão da Tesouraria
  Como um tesoureiro da igreja
  Eu quero gerenciar as finanças
  Para manter a transparência financeira

  Contexto:
    Dado que estou logado como administrador
    E estou na página de Tesouraria

  @smoke
  Cenário: Visualizar resumo financeiro
    Então devo ver o saldo atual
    E devo ver total de entradas do mês
    E devo ver total de saídas do mês

  Cenário: Registrar entrada (dízimo)
    Quando clico em "Nova Entrada"
    E seleciono categoria "Dízimo"
    E preencho o valor "500,00"
    E preencho a descrição "Dízimo - João Silva"
    E seleciono a data de hoje
    E clico em "Registrar"
    Então devo ver mensagem "Entrada registrada com sucesso"
    E o saldo deve ser atualizado

  Cenário: Registrar saída (despesa)
    Quando clico em "Nova Saída"
    E seleciono categoria "Conta de luz"
    E preencho o valor "350,00"
    E preencho a descrição "Conta de luz - Janeiro"
    E clico em "Registrar"
    Então devo ver mensagem "Saída registrada com sucesso"

  Cenário: Filtrar por período
    Quando seleciono o período "Janeiro 2026"
    Então devo ver apenas transações de janeiro

  Cenário: Gerar relatório mensal
    Quando clico em "Gerar Relatório"
    E seleciono o mês "Janeiro 2026"
    Então devo ver o relatório formatado
    E devo ver opção de exportar PDF
```

---

### 7. Governança

#### 7.1 Conselhos e Reuniões (`governance/councils.feature`)

```gherkin
# language: pt

Funcionalidade: Gestão de Governança
  Como um presbítero
  Eu quero gerenciar os conselhos
  Para organizar a governança da igreja

  Contexto:
    Dado que estou logado como administrador
    E estou na página de Governança

  @smoke
  Cenário: Visualizar conselhos
    Então devo ver lista de conselhos
    E devo ver "Conselho da Igreja"
    E devo ver "Junta Diaconal"

  Cenário: Ver membros de um conselho
    Quando clico em "Conselho da Igreja"
    Então devo ver lista de presbíteros
    E devo ver seus respectivos mandatos

  Cenário: Agendar reunião
    Quando clico em "Nova Reunião"
    E seleciono o conselho "Conselho da Igreja"
    E defino a data e hora
    E adiciono pauta da reunião
    E clico em "Agendar"
    Então a reunião deve aparecer no calendário
```

---

### 8. EBD

#### 8.1 Escola Bíblica Dominical (`ebd/classes.feature`)

```gherkin
# language: pt

Funcionalidade: Gestão da EBD
  Como um superintendente da EBD
  Eu quero gerenciar as classes
  Para organizar a escola dominical

  Contexto:
    Dado que estou logado como administrador
    E estou na página de EBD

  @smoke
  Cenário: Visualizar classes
    Então devo ver lista de classes
    E devo ver quantidade de alunos por classe

  Cenário: Criar nova classe
    Quando clico em "Nova Classe"
    E preencho o nome "Jovens"
    E seleciono o professor "Prof. Maria"
    E clico em "Criar"
    Então a classe "Jovens" deve aparecer na lista

  Cenário: Registrar presença
    Dado que existe a classe "Adultos"
    Quando clico em "Registrar Presença"
    E seleciono a data de hoje
    E marco os alunos presentes
    E clico em "Salvar"
    Então a presença deve ser registrada
```

---

### 9. Missões

#### 9.1 Missionários (`missions/missionaries.feature`)

```gherkin
# language: pt

Funcionalidade: Gestão de Missões
  Como um líder de missões
  Eu quero gerenciar os missionários
  Para acompanhar o trabalho missionário

  Contexto:
    Dado que estou logado como administrador
    E estou na página de Missões

  @smoke
  Cenário: Visualizar missionários
    Então devo ver lista de missionários apoiados
    E devo ver campo missionário de cada um

  Cenário: Adicionar missionário
    Quando clico em "Adicionar Missionário"
    E preencho o nome "Família Silva"
    E preencho o campo "África do Sul"
    E preencho o valor de sustento "2.000,00"
    E clico em "Salvar"
    Então o missionário deve aparecer na lista
```

---

### 10. Configurações

#### 10.1 Configurações da Igreja (`settings/church-settings.feature`)

```gherkin
# language: pt

Funcionalidade: Configurações da Igreja
  Como um administrador
  Eu quero configurar os dados da igreja
  Para manter as informações atualizadas

  Contexto:
    Dado que estou logado como administrador
    E estou na página de Configurações

  @smoke
  Cenário: Visualizar dados da igreja
    Então devo ver o nome da igreja
    E devo ver o endereço
    E devo ver informações de contato

  Cenário: Atualizar dados básicos
    Quando altero o nome para "Igreja Presbiteriana Nova"
    E clico em "Salvar Alterações"
    Então devo ver mensagem "Dados atualizados com sucesso"

  Cenário: Atualizar endereço via CEP
    Quando preencho o CEP "04538-132"
    Então o endereço deve ser preenchido automaticamente

  @critical
  Cenário: Excluir igreja (Zona de Perigo)
    Quando rolo até "Zona de Perigo"
    E clico em "Excluir Igreja"
    E digito o identificador da igreja para confirmar
    E clico em "Confirmar Exclusão"
    Então devo ver mensagem "Igreja excluída com sucesso"
    E devo ser redirecionado para a página inicial
```

---

## Priorização

### Fase 1: Smoke Tests (Críticos)
Testes marcados com `@smoke` - devem passar em todo PR.

| Feature | Cenários | Prioridade |
|---------|----------|------------|
| Login | 2 | P0 |
| Registro de Igreja | 1 | P0 |
| Dashboard | 1 | P0 |
| Membros (listagem) | 2 | P1 |
| Bíblia | 1 | P1 |

### Fase 2: Fluxos Principais
Fluxos completos de cada módulo.

| Feature | Cenários | Prioridade |
|---------|----------|------------|
| CRUD Membros | 4 | P1 |
| Tesouraria | 5 | P1 |
| Governança | 3 | P2 |
| EBD | 3 | P2 |
| Missões | 2 | P2 |
| Configurações | 4 | P2 |

### Fase 3: Edge Cases
Cenários de erro e casos de borda.

---

## Configuração Técnica

### Dependências a instalar

```bash
npm install -D @cucumber/cucumber @playwright/test playwright-bdd
```

### Estrutura do cucumber.config.ts

```typescript
import { defineConfig } from '@cucumber/cucumber';

export default defineConfig({
  paths: ['e2e/features/**/*.feature'],
  require: ['e2e/steps/**/*.ts'],
  requireModule: ['ts-node/register'],
  format: [
    'progress-bar',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json'
  ],
  language: 'pt',
  publishQuiet: true
});
```

### Scripts no package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:cucumber": "cucumber-js",
    "test:e2e:smoke": "cucumber-js --tags @smoke",
    "test:e2e:critical": "cucumber-js --tags @critical"
  }
}
```

### Integração com CI/CD

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  pull_request:
    paths:
      - 'apps/web/**'

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
        working-directory: apps/web
      - run: npx playwright install --with-deps
        working-directory: apps/web
      - run: npm run test:e2e:smoke
        working-directory: apps/web
```

---

## Próximos Passos

1. [ ] Configurar Cucumber + Playwright no projeto
2. [ ] Implementar steps comuns (login, navegação)
3. [ ] Implementar smoke tests (Fase 1)
4. [ ] Integrar com CI (rodar em PRs)
5. [ ] Implementar fluxos principais (Fase 2)
6. [ ] Adicionar relatórios visuais
