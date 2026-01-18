# 🏛️ Plano 2.1: Portal Público (Bíblia, Hinário e Landing Page)

## 🎯 Visão Geral
Criação de uma área pública robusta que serve tanto como **ferramenta de edificação** (Bíblia/Hinário) quanto como **porta de entrada** para novas igrejas (Landing Page).

A estratégia é oferecer valor imediato ao visitante, incentivando o cadastro institucional através da utilidade.

---

## 🧭 Mapa de Navegação Público

### 1. Landing Page (`/`)
A "vitrine" do ecossistema.
- **Hero Section**: Proposta de valor clara ("Gestão e Edificação").
- **Cards de Acesso Rápido**:
  - 📖 **Bíblia Online**: Link direto para leitura.
  - 🎵 **Hinário**: Link direto para cânticos.
  - 🏛️ **Cadastre sua Igreja**: Chamada para ação (CTA).
- **Rodapé Intuitivo**: Links para Login, Sobre, Contato.

### 2. Módulo Bíblia (`/bible`)
Ferramenta de leitura offline-first e rápida.
- **Estrutura**:
  - Navegação: Testamento > Livro > Capítulo.
  - Interface limpa, foco no texto.
- **Integração com Landing Page**: Botão "Voltar para Início" ou Navbar persistente.

### 3. Módulo Hinário (`/hymnal`)
Ferramenta de louvor.
- **Estrutura**:
  - Busca por Número ou Título.
  - Exibição de letra, autor e (futuro) cifra/áudio.
- **Integração**: Destaque na Landing Page ("Prepare o louvor de domingo").

---

## 🔗 Integração com o Sistema Administrativo

### Fluxo de Conversão ("Funil")
1. Usuário acessa `/bible` para ler.
2. Vê um banner ou menu: "Sua igreja ainda não usa o Filadélfias?".
3. Clica e vai para `/onboarding` (Cadastro de Igreja).
4. Cria a conta e acessa o `/dashboard`.

### Arquitetura de Layout
- **PublicLayout**: Navbar simplificada (Logo, Bíblia, Hinário, Entrar).
- **DashboardLayout**: Sidebar completa administrativa (Membros, Tesouraria, etc).

---

## 📝 Roadmap de Implementação

### Passo 1: Fundação Pública
- [ ] Criar `PublicLayout`.
- [ ] Implementar Landing Page em `/` com design moderno.
- [ ] Mover Dashboard atual para `/dashboard` (roteamento).

### Passo 2: Recursos de Edificação
- [ ] Implementar Leitor de Bíblia (JSON ARA).
- [ ] Implementar Hinário (JSON Novo Cântico).

### Passo 3: Conexão
- [ ] Linkar "Cadastre sua Igreja" ao fluxo de Onboarding existente.
