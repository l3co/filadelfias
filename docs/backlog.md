# Backlog — App Tauri (Filadélfias)

**Última atualização:** 2026-03-30
**Branch de trabalho:** `retrofit-app`

---

## Legenda de prioridade

| Prioridade | Critério |
|------------|----------|
| 🔴 P1 — Crítico | Funcionalidade quebrada / tela inacessível |
| 🟡 P2 — Importante | Feature existe na web mas ausente no app |
| 🟢 P3 — Melhoria | Feature nova ou refinamento de UX |

---

## Bugs

### BUG-01 — Manual Presbiteriano não carrega 🔴 P1

**Sintoma:** A tela `/manual` exibe "Estrutura do manual indisponível." e nunca carrega a hierarquia de artigos.

**Causa provável:** O endpoint `GET /api/manual/structure` retorna 404 — ou não está implementado no backend, ou a rota está incorreta. O endpoint é público (não requer token) e o fallback local SQLite só existe para artigos individuais, não para a estrutura.

**Investigação necessária:**
- Testar `curl https://api.filadelfias.com/manual/structure` — confirmar se o backend implementou
- Verificar se há dados de structure no banco SQLite local (tabela `manual_structure` ou similar)
- Se o backend não tiver o endpoint, considerar empacotar a estrutura do manual como JSON estático no app (já que o conteúdo é estático)

**Arquivos afetados:**
- `apps/tauri/src/services/manual.ts` — `getStructure()`
- `apps/tauri/src/hooks/useManual.ts`

---

### BUG-02 — Erros 404 em endpoints de área de membro 🔴 P1

**Sintoma:** Console mostra ~30 erros 404 para os seguintes paths:
`today` (devotionals), `devotionals`, `events`, `my-tithes`, `summary`, `my-class`, `classes`, `me`

**Causa provável (duas hipóteses):**
1. **`churchId` nulo:** Se `currentChurchId` é `null` na store, as URLs ficam `/tenants/null/events` → 404. Isso aconteceria se o usuário autenticado não tiver uma igreja associada na sua conta.
2. **Backend não implementado:** Endpoints ainda não estão disponíveis no servidor `api.filadelfias.com`.

**Investigação necessária:**
- Logar `currentChurchId` no console após login para confirmar se está sendo populado
- Testar manualmente `GET /members/me` com o token do usuário — se retorna 404, é problema de backend
- Verificar se o usuário de teste tem churches no payload JWT

**Arquivos afetados:**
- `apps/tauri/src/services/*.ts` (events, tithe, ebd, members, devotionals)
- `apps/tauri/src/stores/authStore.ts` — `currentChurchId`

---

## Features ausentes (paridade com a web)

### FEAT-01 — Controle de tamanho de fonte na Bíblia 🟡 P2

**Sintoma:** Na versão web, o leitor bíblico tem botões `−` e `+` para ajustar o tamanho da fonte (14–32px), persistido em `localStorage`. No app Tauri, o tamanho é fixo.

**Referência:** `apps/web/src/routes/bible/BibleReaderPage.tsx`
- Estado inicializado de `localStorage.getItem('bible-font-size')`, default `18`
- `handleFontSize(delta)` com clamp 14–32
- Botões `Minus`/`Plus` do lucide-react na toolbar
- Aplicado via `style={{ fontSize: \`${fontSize}px\` }}`

**Arquivo a modificar:** `apps/tauri/src/routes/public/BibleChapterScreen.tsx`

---

### FEAT-02 — Controle de tamanho de fonte no Hinário 🟡 P2

**Sintoma:** O leitor de hinos tem tamanho de fonte fixo. Na web existe controle `−`/`+`.

**Referência:** `apps/web/src/routes/hymnal/HymnalReaderPage.tsx`
- Estado de `localStorage.getItem('hymnal-font-size')`, default `20`, clamp 16–40
- Toolbar pill com `Minus`/`Plus` ao lado do botão TTS

**Arquivo a modificar:** `apps/tauri/src/routes/public/HymnScreen.tsx`

---

### FEAT-03 — Busca na Bíblia 🟡 P2

**Sintoma:** O app Tauri não tem barra de busca na Bíblia. Na web existe busca por texto com filtro de testamento.

**Referência:** `apps/web/src/routes/bible/BiblePage.tsx`
- Input bound a `search` state, sincronizado com query param `?q=`
- Hook `useBibleSearch(search, version, testament)`
- Resultados com referência, número e texto do versículo
- Filtro dropdown: Todos / AT / NT

**Arquivo a modificar:** `apps/tauri/src/routes/public/BibleScreen.tsx`
**Hook a criar:** `apps/tauri/src/hooks/useBibleSearch.ts`
**Serviço:** `apps/tauri/src/services/bible.ts` — verificar se `search()` existe

---

### FEAT-04 — Criar evento no calendário comunitário 🟡 P2

**Sintoma:** O calendário em `/member/events` é somente leitura. Usuários não podem cadastrar novos eventos.

**Investigação necessária:**
- Verificar se `POST /tenants/:churchId/events` está implementado no backend (BUG-02 pode estar relacionado)
- Definir quem pode criar eventos: todos os membros autenticados, ou apenas admins/pastores?

**Sugestão de implementação:**
- Botão `+` flutuante (FAB) no canto inferior direito da tela de eventos
- Modal ou tela `/member/events/new` com formulário: título, data/hora início, data/hora fim (opcional), local (opcional), descrição (opcional)
- Após sucesso, invalidar query `useEvents()` para recarregar o calendário

**Arquivo a modificar:** `apps/tauri/src/routes/member/EventsScreen.tsx`
**Arquivo a criar:** `apps/tauri/src/routes/member/EventNewScreen.tsx` (ou modal)

---

## Features novas

### FEAT-05 — Tela de Início (Home) 🟢 P3

**Sintoma:** A rota `/` renderiza `<Placeholder name="Inicio" />` — uma tela em construção. Não existe uma tela de início real.

**Objetivo:** Criar uma tela de início que:
- Funcione para usuários **não autenticados**: apresenta a plataforma, explica o que é o Filadélfias, destaca as principais funcionalidades (Bíblia, Hinário, Manual, Área de membro), referencia o site `filadelfias.com`
- Funcione para usuários **autenticados**: pode redirecionar diretamente para o dashboard de membro (`/member`) ou exibir um resumo personalizado

**Precisa de brainstorming** — design da tela não está especificado. Itens a decidir:
- Layout dos cards (grade 2x2? lista vertical? hero + cards?)
- O que cada card mostra (ícone, título, descrição curta)
- CTA para usuários não autenticados (botão "Entrar" prominente?)
- Se autenticados devem ser redirecionados para `/member` automaticamente

**Arquivo a modificar:** `apps/tauri/src/routes/index.tsx` (rota `/`)

---

## Ordem de implementação sugerida

| # | Item | Prioridade | Esforço | Depende de |
|---|------|------------|---------|------------|
| 1 | BUG-01: Manual não carrega | 🔴 P1 | Médio (depende de investigação) | — |
| 2 | BUG-02: 404s na área de membro | 🔴 P1 | Médio (depende de investigação) | — |
| 3 | FEAT-01: Fonte Bíblia | 🟡 P2 | Pequeno (port da web) | — |
| 4 | FEAT-02: Fonte Hinário | 🟡 P2 | Pequeno (port da web) | — |
| 5 | FEAT-03: Busca Bíblia | 🟡 P2 | Médio (port da web + hook) | BUG-02 (se busca for via API) |
| 6 | FEAT-04: Criar evento | 🟡 P2 | Médio | BUG-02 (POST depende da API) |
| 7 | FEAT-05: Tela de início | 🟢 P3 | Médio-alto | Brainstorm necessário |

**Recomendação:** começar pelos bugs (BUG-01 e BUG-02) pois ambos bloqueiam features de área de membro. Em paralelo, as features de fonte (FEAT-01, FEAT-02) são ports mecânicos da web e podem ser feitas independentemente sem dependência de API.
