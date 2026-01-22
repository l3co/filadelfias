# 🔌 Mapeamento de APIs

## Visão Geral

Este documento mapeia todos os endpoints do backend necessários para o app mobile.

**Base URL:** `https://api.filadelfias.com` (produção) | `http://localhost:8000` (dev)

---

## Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/login` | Login com email/senha | ❌ |
| POST | `/auth/register` | Registrar novo usuário | ❌ |
| GET | `/auth/me` | Dados do usuário logado | ✅ |
| POST | `/auth/forgot-password` | Solicitar reset de senha | ❌ |
| POST | `/auth/reset-password` | Redefinir senha com token | ❌ |
| POST | `/auth/change-password` | Alterar senha (logado) | ✅ |
| DELETE | `/auth/me` | Excluir conta | ✅ |

### Detalhes

```typescript
// POST /auth/login
// Content-Type: application/x-www-form-urlencoded
Request: { username: string, password: string }
Response: { access_token: string, token_type: "bearer" }

// GET /auth/me
Response: {
  id: string,
  email: string,
  name: string,
  is_active: boolean,
  memberships: [{
    id: string,
    tenant: { id, name, slug, ... },
    role: "ADMIN" | "MEMBER" | "OWNER",
    status: "ACTIVE" | "INACTIVE",
    joined_at: string
  }]
}
```

---

## Bíblia

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/bible/versions` | Listar versões disponíveis | ❌ |
| GET | `/bible/books` | Listar livros da Bíblia | ❌ |
| GET | `/bible/{book}/{chapter}` | Ler capítulo | ❌ |
| GET | `/bible/download/{version}` | Download para offline | ❌ |

### Detalhes

```typescript
// GET /bible/versions
Response: [{
  id: "nvi" | "acf" | "aa",
  name: string,
  description: string
}]

// GET /bible/books?version=nvi
Response: [{
  abbrev: string,
  name: string,
  chapters_count: number,
  testament: "old" | "new"
}]

// GET /bible/{book}/{chapter}?version=nvi
Response: {
  book_abbrev: string,
  book_name: string,
  chapter: number,
  verses: string[],
  previous_chapter?: { book: string, chapter: number },
  next_chapter?: { book: string, chapter: number }
}

// GET /bible/download/{version} (NOVO - para offline)
Response: {
  id: string,
  name: string,
  books: [{
    abbrev: string,
    name: string,
    testament: string,
    chapters: string[][] // chapters[0] = array de versículos do cap 1
  }]
}
```

---

## Hinário

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/hymnal/` | Listar todos os hinos | ❌ |
| GET | `/hymnal/{number}` | Obter hino específico | ❌ |
| GET | `/hymnal/download` | Download para offline | ❌ |

### Detalhes

```typescript
// GET /hymnal/
Response: [{
  number: number,
  title: string,
  author: string,
  lyrics: string[]
}]

// GET /hymnal/{number}
Response: {
  number: number,
  title: string,
  author: string,
  lyrics: string[]
}
```

---

## Manual IPB

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/manual/structure` | Estrutura do manual | ❌ |
| GET | `/manual/article/{id}` | Obter artigo | ❌ |
| GET | `/manual/search` | Buscar no manual | ❌ |
| GET | `/manual/download` | Download para offline | ❌ |

### Detalhes

```typescript
// GET /manual/structure
Response: {
  metadata: { title, editionYear, language },
  parts: [{
    id: string,
    title: string,
    chapters: [{
      id: string,
      number: string,
      title: string,
      sections: [...],
      articles: [{ id, number }]
    }]
  }],
  total_articles: number
}

// GET /manual/article/{id}
Response: {
  id: string,
  number: string,
  text: string,
  structure: [{
    type: string,
    marker?: string,
    text: string,
    notes?: [...]
  }],
  notes: [...],
  navigation: {
    previous: { id, number } | null,
    next: { id, number } | null
  }
}

// GET /manual/search?q={query}&limit=20
Response: {
  query: string,
  count: number,
  results: [{
    id: string,
    number: string,
    excerpt: string,
    chapter: string,
    section: string | null
  }]
}
```

---

## Membros

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/members?tenant_id={id}` | Listar membros | ✅ |
| GET | `/members/{id}?tenant_id={id}` | Obter membro | ✅ |
| POST | `/members?tenant_id={id}` | Criar membro | ✅ Admin |
| PUT | `/members/{id}?tenant_id={id}` | Atualizar membro | ✅ Admin |
| DELETE | `/members/{id}?tenant_id={id}` | Excluir membro | ✅ Admin |

### Detalhes

```typescript
// GET /members?tenant_id={id}
Response: [{
  id: string,
  full_name: string,
  email?: string,
  phone?: string,
  birth_date?: string,
  gender?: "M" | "F",
  status: "PROCESSO" | "COMUNGANTE" | "NAO_COMUNGANTE",
  office: "MEMBRO" | "DIACONO" | "PRESBITERO" | "PASTOR",
  user_id?: string,
  created_at: string
}]

// POST /members?tenant_id={id}
Request: {
  full_name: string,
  email?: string,
  phone?: string,
  birth_date?: string,
  gender?: "M" | "F",
  status?: string,
  office?: string
}
```

---

## Convites

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/tenants/{tid}/members/{mid}/invite` | Enviar convite | ✅ Admin |

### Detalhes

```typescript
// POST /tenants/{tenant_id}/members/{member_id}/invite
Response: {
  success: boolean,
  message: string,
  temporary_password?: string,
  email_sent: boolean
}
```

---

## Devocionais

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/devotionals?tenant_id={id}` | Listar devocionais | ✅ |
| GET | `/devotionals/{id}?tenant_id={id}` | Obter devocional | ✅ |
| POST | `/devotionals?tenant_id={id}` | Criar devocional | ✅ Admin |
| PUT | `/devotionals/{id}?tenant_id={id}` | Atualizar | ✅ Admin |
| DELETE | `/devotionals/{id}?tenant_id={id}` | Excluir | ✅ Admin |

### Detalhes

```typescript
// GET /devotionals?tenant_id={id}
Response: [{
  id: string,
  title: string,
  date: string,
  verse_reference: string,
  verse_text: string,
  meditation: string,
  reflection?: string,
  prayer?: string,
  author?: string,
  created_at: string
}]

// POST /devotionals?tenant_id={id}
Request: {
  title: string,
  date: string,
  verse_reference: string,
  verse_text: string,
  meditation: string,
  reflection?: string,
  prayer?: string,
  author?: string
}
```

---

## Pedidos de Oração

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/prayer?tenant_id={id}` | Listar pedidos | ✅ |
| POST | `/prayer?tenant_id={id}` | Criar pedido | ✅ |
| POST | `/prayer/{id}/pray?tenant_id={id}` | Marcar que orou | ✅ |
| DELETE | `/prayer/{id}?tenant_id={id}` | Excluir pedido | ✅ |

### Detalhes

```typescript
// GET /prayer?tenant_id={id}
Response: [{
  id: string,
  content: string,
  category?: string,
  is_anonymous: boolean,
  author_name?: string,
  author_id?: string,
  prayer_count: number,
  prayed_by_me: boolean,
  created_at: string
}]

// POST /prayer?tenant_id={id}
Request: {
  content: string,
  category?: string,
  is_anonymous?: boolean
}
```

---

## Eventos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/events?tenant_id={id}` | Listar eventos | ✅ |
| GET | `/events/{id}?tenant_id={id}` | Obter evento | ✅ |
| POST | `/events?tenant_id={id}` | Criar evento | ✅ Admin |
| PUT | `/events/{id}?tenant_id={id}` | Atualizar | ✅ Admin |
| DELETE | `/events/{id}?tenant_id={id}` | Excluir | ✅ Admin |

### Detalhes

```typescript
// GET /events?tenant_id={id}
Response: [{
  id: string,
  title: string,
  description?: string,
  date: string,
  time?: string,
  location?: string,
  created_at: string
}]
```

---

## Finanças

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/financial/summary?tenant_id={id}` | Resumo financeiro | ✅ Admin |
| GET | `/financial/accounts?tenant_id={id}` | Listar contas | ✅ Admin |
| GET | `/financial/transactions?tenant_id={id}` | Listar transações | ✅ Admin |
| POST | `/financial/transactions?tenant_id={id}` | Criar transação | ✅ Admin |

### Detalhes

```typescript
// GET /financial/summary?tenant_id={id}
Response: {
  balance: number,
  income: number,
  expenses: number,
  month: string
}

// GET /financial/transactions?tenant_id={id}
Response: [{
  id: string,
  type: "income" | "expense",
  amount: number,
  category: string,
  description: string,
  date: string,
  created_at: string
}]
```

---

## Governança

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/governance/councils?tenant_id={id}` | Listar conselhos | ✅ Admin |
| POST | `/governance/councils?tenant_id={id}` | Criar conselho | ✅ Admin |
| GET | `/governance/councils/{id}/meetings?tenant_id={id}` | Listar reuniões | ✅ Admin |
| POST | `/governance/meetings?tenant_id={id}` | Criar reunião | ✅ Admin |

---

## EBD

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/ebd/classes?tenant_id={id}` | Listar turmas | ✅ |
| GET | `/ebd/classes/{id}?tenant_id={id}` | Obter turma | ✅ |
| POST | `/ebd/classes?tenant_id={id}` | Criar turma | ✅ Admin |
| POST | `/ebd/classes/{id}/students?tenant_id={id}` | Matricular aluno | ✅ Admin |
| POST | `/ebd/classes/{id}/lessons?tenant_id={id}` | Criar lição | ✅ Admin |

---

## Missões

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/missions?tenant_id={id}` | Listar missionários | ✅ |
| GET | `/missions/{id}?tenant_id={id}` | Obter missionário | ✅ |
| POST | `/missions?tenant_id={id}` | Criar missionário | ✅ Admin |

---

## Tenants (Igrejas)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/tenants/{id}` | Obter dados da igreja | ✅ |
| PUT | `/tenants/{id}` | Atualizar igreja | ✅ Admin |
| POST | `/churches/register` | Cadastrar nova igreja | ❌ |
| GET | `/churches/check-slug/{slug}` | Verificar slug | ❌ |

---

## Notificações (NOVO)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/notifications/register` | Registrar push token | ✅ |
| DELETE | `/notifications/unregister` | Remover push token | ✅ |

### Detalhes

```typescript
// POST /notifications/register
Request: {
  push_token: string,
  user_id: string,
  platform: "ios" | "android",
  device_name?: string
}
```

---

## Headers Padrão

```typescript
// Todas as requisições
{
  "Content-Type": "application/json"
}

// Requisições autenticadas
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {access_token}"
}
```

---

## Tratamento de Erros

```typescript
// Resposta de erro padrão
{
  "detail": "Mensagem de erro"
}

// Erro de validação (422)
{
  "detail": [{
    "loc": ["body", "email"],
    "msg": "field required",
    "type": "value_error.missing"
  }]
}
```

### Códigos de Status

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Bad Request |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 422 | Erro de validação |
| 500 | Erro interno |

---

## Endpoints a Criar no Backend

Para suportar funcionalidade offline:

```python
# 1. GET /bible/download/{version}
# Retorna Bíblia completa em formato otimizado

# 2. GET /hymnal/download
# Retorna todos os hinos

# 3. GET /manual/download
# Retorna todos os artigos do manual

# 4. POST /notifications/register
# Registra token de push notification

# 5. DELETE /notifications/unregister
# Remove token de push notification
```

---

## Services a Criar no Mobile

Copiar de `apps/web/src/services/` e adaptar:

| Arquivo Web | Arquivo Mobile | Alterações |
|-------------|----------------|------------|
| `auth.ts` | `auth.ts` | SecureStore ao invés de localStorage |
| `bible.ts` | `bible.ts` | Apenas import do api |
| `hymnal.ts` | `hymnal.ts` | Apenas import do api |
| `manual.ts` | `manual.ts` | Apenas import do api |
| `devotionals.ts` | `devotionals.ts` | Apenas import do api |
| `prayer.ts` | `prayer.ts` | Apenas import do api |
| `events.ts` | `events.ts` | Apenas import do api |
| `members.ts` | `members.ts` | Apenas import do api |
| `financial.ts` | `financial.ts` | Apenas import do api |
| `governance.ts` | `governance.ts` | Apenas import do api |
| `ebd.ts` | `ebd.ts` | Apenas import do api |
| `missions.ts` | `missions.ts` | Apenas import do api |

---

## Conclusão

Este mapeamento cobre todos os endpoints necessários para implementar o app mobile com paridade à versão web, incluindo os novos endpoints para suporte offline e notificações push.
