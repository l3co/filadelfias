# Módulos do Sistema — Filadelfias

Este documento descreve os módulos funcionais do sistema, suas responsabilidades e dependências.

---

## 📦 Visão Geral dos Módulos

```
┌─────────────────────────────────────────────────────────────────┐
│                        PLATAFORMA                                │
├─────────────────────────────────────────────────────────────────┤
│  [Auth]  [Users]  [Tenants]  [RBAC]  [Notifications]            │
├─────────────────────────────────────────────────────────────────┤
│                        CONTEÚDO                                  │
├─────────────────────────────────────────────────────────────────┤
│  [Bible]  [Hymnal]  [Bulletins]  [Devotionals]                  │
├─────────────────────────────────────────────────────────────────┤
│                      COMUNIDADE                                  │
├─────────────────────────────────────────────────────────────────┤
│  [Members]  [Prayer]  [Visitation]  [Events]  [Attendance]      │
├─────────────────────────────────────────────────────────────────┤
│                      MINISTÉRIOS                                 │
├─────────────────────────────────────────────────────────────────┤
│  [Rosters]  [Music]  [EBD]                                      │
├─────────────────────────────────────────────────────────────────┤
│                       GOVERNO                                    │
├─────────────────────────────────────────────────────────────────┤
│  [Assemblies]  [Voting]  [Minutes]  [Discipline]                │
├─────────────────────────────────────────────────────────────────┤
│                      FINANCEIRO                                  │
├─────────────────────────────────────────────────────────────────┤
│  [Treasury]  [Contributions]  [Reports]                         │
├─────────────────────────────────────────────────────────────────┤
│                       MISSÕES                                    │
├─────────────────────────────────────────────────────────────────┤
│  [Missionaries]  [Projects]                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Módulos de Plataforma

### `auth` — Autenticação
**Responsabilidade**: Login, logout, refresh token, reset de senha.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/auth/login` | POST | Autenticação por email/senha |
| `/auth/register` | POST | Criação de conta (usuário órfão) |
| `/auth/refresh` | POST | Renovação de access token |
| `/auth/logout` | POST | Invalidação de tokens |
| `/auth/password-reset` | POST | Envio de email de reset |

**Dependências**: `users`

---

### `users` — Gestão de Usuários Globais
**Responsabilidade**: CRUD de usuários da plataforma.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/users/me` | GET | Perfil do usuário logado |
| `/users/me` | PATCH | Atualização de perfil |
| `/users/{id}` | GET | Detalhes de um usuário (admin) |

**Dependências**: `auth`, `tenants`

---

### `tenants` — Gestão de Igrejas (Multi-tenant)
**Responsabilidade**: CRUD de igrejas, configurações por tenant.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/tenants` | GET | Lista de igrejas públicas (mapa) |
| `/tenants/{slug}` | GET | Detalhes de uma igreja |
| `/tenants` | POST | Criação de nova igreja (super admin) |
| `/tenants/{id}/settings` | PATCH | Configurações da igreja |

**Entidades**: `Tenant`, `TenantSettings`

---

### `rbac` — Controle de Acesso
**Responsabilidade**: Gestão de roles e permissões.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/admin/users/search` | GET | Busca usuários por email |
| `/admin/users/{id}/associate` | POST | Associa usuário à igreja |
| `/admin/memberships` | GET | Lista membros da igreja |
| `/admin/memberships/{id}` | PATCH | Altera role de um membro |

**Entidades**: `Role`, `Permission`, `UserChurchMembership`

---

## 📖 Módulos de Conteúdo

### `bible` — Bíblia Sagrada
**Responsabilidade**: Leitura de versículos, busca, versões.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/bible/books` | GET | Lista de livros |
| `/bible/{book}/{chapter}` | GET | Versículos de um capítulo |
| `/bible/search` | GET | Busca textual |
| `/bible/versions` | GET | Versões disponíveis |

**Estratégia**:
- **ARC (1969)**: Armazenada localmente (offline).
- **Outras versões**: Proxy para A Bíblia Digital API.

---

### `hymnal` — Hinário
**Responsabilidade**: Catálogo de hinos, letras, cifras.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/hymnal/songs` | GET | Lista de hinos |
| `/hymnal/songs/{id}` | GET | Detalhes de um hino |
| `/hymnal/songs` | POST | Adicionar hino (admin) |

**Entidades**: `Song`, `SongAttachment`

---

### `bulletins` — Boletins e Comunicados
**Responsabilidade**: Publicação de avisos da igreja.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/bulletins` | GET | Lista de boletins |
| `/bulletins/{id}` | GET | Detalhes |
| `/bulletins` | POST | Criar boletim |
| `/bulletins/{id}` | PUT | Atualizar |
| `/bulletins/{id}` | DELETE | Remover |

**Entidades**: `Bulletin`, `BulletinAttachment`

---

## 👥 Módulos de Comunidade

### `members` — Gestão de Membros
**Responsabilidade**: Perfil eclesiástico dos membros.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/members` | GET | Diretório de membros |
| `/members/{id}` | GET | Perfil detalhado |
| `/members/birthdays` | GET | Aniversariantes do mês |

**Entidades**: `MemberProfile`

---

### `prayer` — Pedidos de Oração
**Responsabilidade**: Gestão de pedidos de oração.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/prayer-requests` | GET | Lista de pedidos |
| `/prayer-requests` | POST | Novo pedido |
| `/prayer-requests/{id}/prayed` | POST | Registrar "orei por você" |

**Entidades**: `PrayerRequest`, `PrayerInteraction`

---

### `events` — Eventos e Calendário
**Responsabilidade**: Agenda da igreja.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/events` | GET | Lista de eventos |
| `/events/{id}` | GET | Detalhes |
| `/events` | POST | Criar evento |
| `/events/{id}/checkin` | POST | Check-in de presença |

**Entidades**: `Event`, `AttendanceLog`

---

## 🎵 Módulos de Ministérios

### `rosters` — Escalas de Serviço
**Responsabilidade**: Gerenciamento de escalas.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/rosters` | GET | Escalas do mês |
| `/rosters/{id}/confirm` | POST | Confirmar presença |
| `/rosters/{id}/decline` | POST | Recusar escala |

**Entidades**: `Ministry`, `Volunteer`, `Roster`, `RosterSlot`

---

### `music` — Ministério de Música
**Responsabilidade**: Repertório, ensaios, setlists.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/music/songs` | GET | Repertório |
| `/music/rehearsals` | GET | Próximos ensaios |
| `/music/setlists` | GET | Setlists de culto |

**Entidades**: `RehearsalSong`, `Setlist`

---

### `ebd` — Escola Bíblica Dominical
**Responsabilidade**: Classes, lições, frequência.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/ebd/classes` | GET | Lista de classes |
| `/ebd/classes/{id}/lessons` | GET | Lições do trimestre |
| `/ebd/classes/{id}/attendance` | POST | Registrar chamada |

**Entidades**: `EbdClass`, `Lesson`, `EbdAttendance`

---

## ⚖️ Módulos de Governo

### `assemblies` — Assembleias
**Responsabilidade**: Convocação, pauta, quórum.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/assemblies` | GET | Próximas assembleias |
| `/assemblies/{id}` | GET | Detalhes e pauta |
| `/assemblies/{id}/checkin` | POST | Registrar presença |

**Entidades**: `Assembly`, `AssemblyAgendaItem`

---

### `voting` — Votações
**Responsabilidade**: Eleições e deliberações.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/voting/elections` | GET | Eleições abertas |
| `/voting/elections/{id}/vote` | POST | Registrar voto |
| `/voting/elections/{id}/results` | GET | Resultados |

**Entidades**: `Election`, `Candidate`, `Vote`

---

### `minutes` — Atas
**Responsabilidade**: Registro e aprovação de atas.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/minutes` | GET | Lista de atas |
| `/minutes/{id}` | GET | Conteúdo da ata |
| `/minutes` | POST | Criar ata |
| `/minutes/{id}/approve` | POST | Aprovar ata |

**Entidades**: `Minute`, `MinuteApproval`

---

## 💰 Módulos Financeiros

### `treasury` — Livro Caixa
**Responsabilidade**: Lançamentos financeiros.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/treasury/entries` | GET | Lançamentos do mês |
| `/treasury/entries` | POST | Novo lançamento |
| `/treasury/balance` | GET | Saldo atual |

**Entidades**: `LedgerEntry`, `LedgerCategory`

---

### `contributions` — Contribuições
**Responsabilidade**: Upload de comprovantes, histórico.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/contributions/my` | GET | Meus comprovantes |
| `/contributions` | POST | Enviar comprovante |

**Entidades**: `Contribution`, `ContributionReceipt`

---

## 🌍 Módulos de Missões

### `missionaries` — Missionários Apoiados
**Responsabilidade**: Cadastro e acompanhamento.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/missionaries` | GET | Lista de missionários |
| `/missionaries/{id}` | GET | Perfil e campo |

**Entidades**: `Missionary`, `MissionField`
