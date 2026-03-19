# Plano 2: Gestão de Membros e Vida Eclesiástica

O objetivo desta fase é implementar o núcleo do sistema de gestão eclesiástica, focando no gerenciamento de membros (pessoas) dentro de cada igreja (tenant).

> **Atenção:** Diferenciamos `User` (conta de acesso ao sistema) de `Member` (ficha cadastral na igreja). Um membro pode ou não ter um usuário de acesso vinculado.

## 🎯 Objetivos

1.  **Backend - Domínio de Membros**
    - [ ] Criar entidade `Member` (Dados pessoais, eclesiásticos e contato)
    - [ ] Implementar CRUD completo de membros
    - [ ] Permitir vincular um `Member` a um `User` (para dar acesso)
    - [ ] Upload de foto de perfil do membro

2.  **Frontend - Dashboard e Gestão**
    - [ ] Criar **Dashboard Layout** (Sidebar, Header, Navegação)
    - [ ] Criar tela de **Listagem de Membros** (Tabela com filtros)
    - [ ] Criar formulário de **Cadastro/Edição de Membro**
    - [ ] Visualização de perfil do membro

3.  **Qualidade & Testes (TDD)**
    - [ ] Testes de repositório e servicos de membros
    - [ ] Testes de integração de endpoints
    - [ ] Testes unitários de componentes frontend

## 📋 Detalhamento Técnico

### Backend Models (`Member`)
- **Dados Pessoais**: Nome completo, Data Nascimento, Sexo, Estado Civil, Nacionalidade.
- **Contato**: Email, Telefone, Celular, Endereço completo.
- **Eclesiástico**:
    - Data de admissão
    - Modo de admissão (Batismo, Profissão de Fé, Transferência)
    - Status (Comungante, Não-Comungante, Em disciplina, Afastado)
    - Cargo (Membro, Diácono, Presbítero, Pastor)
- **Sistema**: `tenant_id` (FK), `user_id` (FK opcional).

### Frontend
- **Bibliotecas**:
    - `lucide-react` (ícones)
    - `date-fns` (formatação de data)
    - `react-hook-form` + `zod` (formulários complexos)
    - Componentes de UI (Table, Modal, Dropdown) - criaremos componentes baseados em Tailwind.

---

## 🚀 Passos de Execução

### Fase 1: Backend Core (TDD)
1.  Escrever testes para o futuro `MemberRepository` e `MemberSchemas`.
2.  Implementar Modelo SQLAlchemy `Member`.
3.  Gerar Migrations.
4.  Implementar Repositório e Service.
5.  Implementar Endpoints CRUD (`/tenants/{tenant_id}/members`).

### Fase 2: Frontend Dashboard
1.  Implementar `DashboardLayout` e menu lateral.
2.  Configurar rotas aninhadas `/app/*`.
3.  Criar `MembersService` (Axios).

### Fase 3: Funcionalidade de Membros (Front)
1.  Tela de Listagem (Data Fetching com React Query).
2.  Tela de Cadastro (Formulário completo).
3.  Vínculo User <-> Member.

### Fase 4: Refinamento
1.  Upload de foto.
2.  Responsividade mobile.
