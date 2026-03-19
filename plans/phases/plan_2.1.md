# 🗺️ Plano 2.1: Portal Público e Expansão Institucional

## 🎯 Visão Geral
Refinar a estratégia do produto para que o **Filadélfias** não seja apenas um sistema administrativo (ERP), mas um **Portal de Serviços Cristãos** focado no usuário final. A entrada do sistema será uma Landing Page atraente que oferece valor imediato (Bíblia, Hinário) e convida igrejas a se cadastrarem.

---

## 1. Landing Page & Área Pública
O foco inicial muda de "Login" para "Utilidade". A página inicial deve ser bonita, moderna e convidativa.

### A. Estrutura da Landing Page
- **Hero Section**: Título impactante, design inspirador (ex: "Sua jornada cristã em um só lugar").
- **Acesso Rápido (Cards)**:
  - 📖 **Bíblia Online**: Leitura rápida e fácil.
  - 🎵 **Hinário**: Acesso ao Novo Cântico (e outros) com letras e cifras.
  - 🏛️ **Encontrar Igreja**: (Futuro) Localizar igrejas cadastradas próximas.
- **Seção Institucional ("Para Igrejas")**:
  - Explicação dos benefícios de gestão.
  - **CTA Principal**: "Cadastre sua Igreja".
- **Rodapé / Header Discreto**:
  - Link "Já tenho conta / Fazer Login".

### B. Funcionalidades Públicas (Sem Login)
- **Leitor da Bíblia**: Interface limpa para leitura (integrar API ou JSON local).
- **Hinário Digital**: Busca inteligente por número ou título.

---

## 2. Refinamento do Cadastro de Igreja (Onboarding)
O cadastro atual de "Nome + Slug" é insuficiente para igrejas formais (ex: IPB). Vamos expandir o modelo para capturar dados institucionais reais.

### A. Novos Dados do Tenant (Igreja)
Expandir a tabela `tenants` para incluir:
- **Dados Legais**:
  - `cnpj`: Cadastro Nacional de Pessoa Jurídica (opcional no início, mas recomendado).
  - `foundation_date`: Data de organização.
- **Contato & Localização**:
  - `address`: Endereço completo.
  - `phone`: Telefone/WhatsApp oficial.
  - `website`: Site ou redes sociais.
  - `email`: Email institucional.
- **Liderança (Simples)**:
  - `pastor_name`: Nome do Pastor Titular.
  - `secretary_name`: Nome do(a) Secretário(a).
  - `treasurer_name`: Nome do(a) Tesoureiro(a).

### B. Fluxo de Cadastro ("Cadastre sua Igreja")
1. **Passo 1: Dados Básicos** (Nome, Slug).
2. **Passo 2: Detalhes Institucionais** (Endereço, CNPJ - pode ser "pular por enquanto").
3. **Passo 3: Liderança** (Quem responde pela igreja).

---

## 3. Arquitetura de Frontend (Layouts)
Precisamos separar claramente os "ambientes" no React:

1.  **PublicLayout (`/`)**:
    - Navbar transparente ou simplificada.
    - Foco em conteúdo.
    - Sem Sidebar administrativa.
2.  **DashboardLayout (`/app/*`)**:
    - Sidebar completa.
    - Foco em gestão.
    - Requer Autenticação (`ProtectedRoute`).

---

## 4. Roteiro de Implementação (Roadmap 2.1)

### Fase 1: Fundação Pública
- [ ] Criar `PublicLayout`.
- [ ] Desenvolver Landing Page (Home).
- [ ] Redirecionar `/` para Landing Page e mover Dashboard para `/app` ou `/dashboard`.

### Fase 2: Ferramentas do Usuário
- [ ] Criar página `/bible` (Bíblia Online simplificada).
- [ ] Criar página `/hymnal` (Hinário).

### Fase 3: Expansão Institucional (Backend)
- [ ] Migração: Adicionar colunas na tabela `tenants`.
- [ ] Atualizar Schema Pydantic `TenantCreate` e `TenantResponse`.
- [ ] Atualizar Endpoint `POST /tenants`.

### Fase 4: Onboarding Rico (Frontend)
- [ ] Melhorar formulário de criação de igreja (Multi-step wizard).
- [ ] Linkar "Cadastre sua Igreja" na Landing Page.

---
## 📝 Discussão
- **Bíblia/Hinário**: Deseja usar uma API pública existente (ex: Bible API) ou ter os dados locais para performance/offline?
- **Nível de Rigor**: O CNPJ deve ser obrigatório agora ou opcional para facilitar a entrada?
