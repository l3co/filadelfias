# Relatório de Bugs e Features - Filadélfias

**Data:** 21/01/2026  
**Versão:** 1.0  
**Status:** Análise Inicial

---

## Índice

1. [Bugs - Painel Administrativo](#bugs---painel-administrativo)
2. [Bugs - Portal do Membro](#bugs---portal-do-membro)
3. [Features - Painel Administrativo](#features---painel-administrativo)
4. [Features - Portal do Membro](#features---portal-do-membro)
5. [Verificações Pendentes](#verificações-pendentes)
6. [Priorização e Estimativas](#priorização-e-estimativas)

---

## Bugs - Painel Administrativo

### 🔴 Crítico

#### BUG-001: Sidebar com comportamento inconsistente
- **Descrição:** O botão de logout não aparece consistentemente em todas as telas
- **Comportamento atual:**
  - ✅ Visível em: Governança, Tesouraria, Missões, Eventos, Configurações
  - ❌ Oculto em: Dashboard, Membros, EBD
- **Causa provável:** Problema de altura/scroll do sidebar ou conteúdo que empurra o footer
- **Arquivo afetado:** `apps/web/src/components/layout/DashboardLayout.tsx`
- **Solução proposta:** Revisar CSS do sidebar para garantir `flex-shrink-0` no footer e `overflow-y-auto` no nav

#### BUG-002: RBAC não reconhecendo perfil de Admin corretamente
- **Descrição:** Área de edição da igreja mostra "Acesso Restrito" mesmo para administradores
- **Comportamento atual:** Admin vê mensagem de acesso restrito na área de configurações da igreja
- **Causa provável:** Comparação de roles case-sensitive (similar ao bug anterior com 'admin' vs 'ADMIN')
- **Arquivo afetado:** `apps/web/src/routes/settings/ChurchSettingsPage.tsx`
- **Solução proposta:** Normalizar role para uppercase em todas as verificações de permissão

#### BUG-003: Botão "Editar" não funciona em Governança
- **Descrição:** Ao clicar em "Editar" um órgão de governança, nada acontece
- **Comportamento atual:** Botão "Excluir" funciona, mas "Editar" não
- **Arquivo afetado:** `apps/web/src/routes/governance/CouncilsPage.tsx`
- **Solução proposta:** Implementar modal de edição ou verificar se handler está conectado

### 🟠 Alto

#### BUG-004: Busca e filtros não funcionam na página de Membros (Admin)
- **Descrição:** Campo de busca e filtros na listagem de membros não estão funcionais
- **Arquivo afetado:** `apps/web/src/routes/members/MembersPage.tsx`
- **Solução proposta:** Revisar lógica de filtro e verificar se estado está sendo atualizado corretamente

#### BUG-005: Categorias não carregam em Nova Receita/Despesa (Tesouraria)
- **Descrição:** Dropdown de "Categoria" aparece vazio ao criar nova receita ou despesa
- **Comportamento atual:** Campo "Conta" funciona, "Categoria" não carrega opções
- **Arquivo afetado:** `apps/web/src/routes/financial/TreasuryPage.tsx`
- **Solução proposta:** Verificar se endpoint de categorias existe e está sendo chamado

#### BUG-006: Não é possível excluir missões
- **Descrição:** Não existe funcionalidade para excluir ou editar missões cadastradas
- **Arquivo afetado:** `apps/web/src/routes/missions/MissionsPage.tsx`
- **Solução proposta:** Adicionar botões de ação (editar/excluir) nos cards de missões

#### BUG-007: Clique em "Alunos" e "Lições" (EBD) não faz nada
- **Descrição:** Botões/links de Alunos e Lições não redirecionam para nenhuma tela
- **Arquivo afetado:** `apps/web/src/routes/ebd/EBDClassesPage.tsx`
- **Solução proposta:** Implementar navegação para sub-rotas `/app/ebd/alunos` e `/app/ebd/licoes`

#### BUG-008: Não é possível cadastrar eventos (Admin)
- **Descrição:** Tela de eventos mostra placeholder "Em breve", sem funcionalidade
- **Arquivo afetado:** `apps/web/src/App.tsx` (rota de eventos)
- **Solução proposta:** Implementar tela completa de gestão de eventos

---

## Bugs - Portal do Membro

### 🟠 Alto

#### BUG-009: Edição de perfil com UX inadequada
- **Descrição:** Ao clicar em "Editar" no perfil, campos são habilitados inline ao invés de abrir modal
- **Comportamento atual:** Apenas nome e telefone podem ser editados
- **Arquivo afetado:** `apps/web/src/routes/profile/ProfilePage.tsx`
- **Solução proposta:** Converter para modal de edição com mais campos disponíveis

---

## Features - Painel Administrativo

### 📋 Governança

| ID | Feature | Descrição | Prioridade | Esforço |
|----|---------|-----------|------------|---------|
| FEAT-001 | Adicionar membros em órgãos | Botão para vincular membros a conselhos/diaconato | Alta | Médio |
| FEAT-002 | Modal de edição de órgãos | Permitir editar informações de órgãos existentes | Alta | Baixo |

### 📋 Missões

| ID | Feature | Descrição | Prioridade | Esforço |
|----|---------|-----------|------------|---------|
| FEAT-003 | Select de países com ISO | Substituir campo texto por combobox com autocomplete de países | Média | Médio |
| FEAT-004 | Substituir lat/long por Estado/Cidade | Campos mais intuitivos para localização | Média | Baixo |
| FEAT-005 | Editar/Excluir missões | Adicionar ações de CRUD completo nas missões | Alta | Baixo |

### 📋 Tesouraria

| ID | Feature | Descrição | Prioridade | Esforço |
|----|---------|-----------|------------|---------|
| FEAT-006 | Separar Dízimos de Ofertas | Criar contas distintas para dízimos e ofertas | Média | Baixo |
| FEAT-007 | Carregar categorias | Implementar endpoint e carregamento de categorias | Alta | Médio |

### 📋 EBD (Escola Bíblica Dominical)

| ID | Feature | Descrição | Prioridade | Esforço |
|----|---------|-----------|------------|---------|
| FEAT-008 | Tela de Alunos | Lista de alunos matriculados por turma | Alta | Alto |
| FEAT-009 | Tela de Lições | Gestão de lições com upload de materiais | Alta | Alto |
| FEAT-010 | Interação Professor/Aluno | Sistema de comentários e acompanhamento | Média | Alto |

### 📋 Eventos

| ID | Feature | Descrição | Prioridade | Esforço |
|----|---------|-----------|------------|---------|
| FEAT-011 | Tela completa de Eventos | CRUD de eventos com data, descrição, local | Alta | Alto |

### 📋 Membros

| ID | Feature | Descrição | Prioridade | Esforço |
|----|---------|-----------|------------|---------|
| FEAT-012 | Exibir funções eclesiásticas | Mostrar funções além do cargo (ex: tesoureiro, secretário) | Média | Baixo |
| FEAT-013 | Filtros funcionais | Corrigir e melhorar sistema de busca e filtros | Alta | Médio |

### 📋 Devocionais

| ID | Feature | Descrição | Prioridade | Esforço |
|----|---------|-----------|------------|---------|
| FEAT-014 | Gestão de Devocionais (Admin) | Área para criar/editar devocionais diários | Alta | Alto |

---

## Features - Portal do Membro

### 📋 Perfil

| ID | Feature | Descrição | Prioridade | Esforço |
|----|---------|-----------|------------|---------|
| FEAT-015 | Modal de edição completo | Mais campos editáveis em modal | Média | Médio |
| FEAT-016 | Exibir funções do membro | Mostrar funções além do cargo eclesiástico | Média | Baixo |

### 📋 Pedidos de Oração

| ID | Feature | Descrição | Prioridade | Esforço |
|----|---------|-----------|------------|---------|
| FEAT-017 | Sistema de Pedidos de Oração | Membros podem enviar e visualizar pedidos | Alta | Alto |

### 📋 Mídias Sociais

| ID | Feature | Descrição | Prioridade | Esforço |
|----|---------|-----------|------------|---------|
| FEAT-018 | Card de Mídias Sociais | HomeCard com links para YouTube, Instagram, etc. | Média | Baixo |
| FEAT-019 | Campos de mídias sociais no cadastro da igreja | YouTube, Instagram, Facebook, etc. | Média | Baixo |

---

## Verificações Pendentes

### ✅ Itens verificados no código

| Item | Descrição | Status | Detalhes |
|------|-----------|--------|----------|
| VER-001 | Devocionais implementados? | ⚠️ **Parcial** | Frontend com mock data. Falta: backend, CRUD admin, integração |
| VER-002 | Pedidos de Oração implementados? | ⚠️ **Parcial** | Frontend com mock data. Falta: backend, persistência real |
| VER-003 | EBD (Minha Turma) implementado? | ⚠️ **Parcial** | Frontend com mock data. Falta: backend, matrícula real |
| VER-004 | Campos de mídias sociais no schema de Church | ❌ **Não existe** | Nenhum campo de YouTube, Instagram, Facebook no schema |
| VER-005 | Funcionalidade de Professor implementada? | ❓ **A verificar** | Rotas `/professor/*` não encontradas |

### 📝 Detalhes das Verificações

#### VER-001: Devocionais
- **Arquivo:** `apps/web/src/routes/member/MemberDevotionalsPage.tsx`
- **Status atual:** Tela funcional com dados mockados
- **O que existe:**
  - Navegação por data (anterior/próximo)
  - Exibição de versículo, meditação, reflexão, oração
  - Lista de devocionais anteriores
- **O que falta:**
  - Endpoint no backend para buscar devocionais
  - Tela de admin para criar/editar devocionais
  - Integração frontend-backend

#### VER-002: Pedidos de Oração
- **Arquivo:** `apps/web/src/routes/member/MemberPrayerPage.tsx`
- **Status atual:** Tela funcional com dados mockados
- **O que existe:**
  - Formulário para novo pedido (com opção anônimo)
  - Lista de pedidos com categorias (saúde, família, trabalho, espiritual)
  - Botão "Orar" com contador
- **O que falta:**
  - Endpoint no backend (CRUD de prayer_requests)
  - Persistência real dos pedidos
  - Notificações quando alguém ora

#### VER-003: EBD - Minha Turma
- **Arquivo:** `apps/web/src/routes/member/MemberEBDPage.tsx`
- **Status atual:** Tela funcional com dados mockados
- **O que existe:**
  - Exibição da turma do usuário
  - Informações do professor, horário, local
  - Lista de lições do trimestre com status
- **O que falta:**
  - Endpoint para buscar turma do usuário
  - Sistema de matrícula
  - Upload de materiais por professores

#### VER-004: Mídias Sociais
- **Schema verificado:** `apps/backend/src/domain/schemas.py`
- **Status:** Não há campos de mídias sociais
- **Campos a adicionar no modelo Church:**
  - `youtube_url`: URL do canal do YouTube
  - `instagram_url`: URL do perfil Instagram
  - `facebook_url`: URL da página Facebook
  - `website_url`: Site oficial da igreja

---

## Priorização e Estimativas

### 🔥 Sprint 1 - Correções Críticas (Bugs)

| ID | Descrição | Esforço | Status |
|----|-----------|---------|--------|
| BUG-001 | Sidebar inconsistente | 1h | Pendente |
| BUG-002 | RBAC Admin | 30min | Pendente |
| BUG-003 | Editar governança | 1h | Pendente |
| BUG-004 | Busca/filtros membros | 2h | Pendente |
| BUG-005 | Categorias tesouraria | 2h | Pendente |

**Total estimado:** ~6.5 horas

### 🚀 Sprint 2 - Features Essenciais

| ID | Descrição | Esforço | Status |
|----|-----------|---------|--------|
| FEAT-005 | Editar/Excluir missões | 2h | Pendente |
| FEAT-007 | Categorias tesouraria | 3h | Pendente |
| FEAT-012 | Funções eclesiásticas | 2h | Pendente |
| FEAT-018 | Card mídias sociais | 1h | Pendente |
| FEAT-019 | Campos mídias na igreja | 2h | Pendente |

**Total estimado:** ~10 horas

### 📅 Sprint 3 - Features Complexas

| ID | Descrição | Esforço | Status |
|----|-----------|---------|--------|
| FEAT-008 | Tela de Alunos EBD | 8h | Pendente |
| FEAT-009 | Tela de Lições EBD | 8h | Pendente |
| FEAT-011 | Tela de Eventos | 8h | Pendente |
| FEAT-014 | Gestão de Devocionais | 8h | Pendente |
| FEAT-017 | Pedidos de Oração | 8h | Pendente |

**Total estimado:** ~40 horas

---

## Resumo Executivo

| Categoria | Quantidade |
|-----------|------------|
| 🐛 Bugs Críticos | 3 |
| 🐛 Bugs Altos | 6 |
| ✨ Features Admin | 14 |
| ✨ Features Membro | 5 |
| ❓ Verificações | 4 |

**Esforço total estimado:** ~56.5 horas de desenvolvimento

---

## Próximos Passos

1. **Imediato:** Corrigir bugs críticos (BUG-001, BUG-002, BUG-003)
2. **Curto prazo:** Resolver bugs de alta prioridade
3. **Médio prazo:** Implementar features essenciais (Sprint 2)
4. **Longo prazo:** Desenvolver módulos complexos (Sprint 3)

---

*Documento gerado em 21/01/2026 - Última atualização: 21/01/2026*
