# Manual Presbiteriano — Redesign UX

**Data:** 2026-06-13  
**Plataformas:** Web (`apps/web`) + Tauri (`apps/tauri`)  
**Design escolhido:** Search-first home + índice com excerpts + leitor com breadcrumb e favoritos

---

## Problema

A experiência atual do Manual tem quatro falhas críticas identificadas pelo usuário:

1. **Difícil achar artigos** — índice mostra botõezinhos com só o número, sem contexto do conteúdo
2. **Sem contexto no leitor** — ao ler um artigo não se sabe em qual capítulo/parte está
3. **Busca limitada** — Tauri filtra só títulos estruturais, não conteúdo dos artigos
4. **Notas confusas** — referências bíblicas aparecem como badges numéricos sem contexto

---

## Público e casos de uso

- **Pastores** — busca pontual de artigos específicos (referência rápida)
- **Anciãos** — exploração temática por capítulo
- **Membros** — leitura sequencial para estudo

O design deve servir os três perfis igualmente.

---

## Arquitetura

### Backend — mudança necessária

**`apps/backend/src/services/manual_service.py`**

Adicionar campo `excerpt` ao summary de artigo na estrutura. Em `get_manual_structure()`, ao invés de remover apenas `text/structure/notes`, preservar os primeiros 100 caracteres do texto como `excerpt`:

```python
article["excerpt"] = article.pop("text", "")[:100]
article.pop("structure", None)
article.pop("notes", None)
```

Isso permite que o índice mostre uma prévia legível sem requerer fetch individual de cada artigo.

**`apps/backend/src/api/manual.py`** — sem mudanças.

### Frontend — componentes afetados

#### Web (`apps/web/src/routes/manual/`)
- `ManualPage.tsx` — reescrita completa (home search-first + índice com excerpts)
- `ManualReaderPage.tsx` — adicionar breadcrumb, botão favoritar, notas inline

#### Tauri (`apps/tauri/src/routes/public/`)
- `ManualScreen.tsx` — reescrita completa (mesma lógica da web)
- `ManualArticleScreen.tsx` — adicionar breadcrumb, botão favoritar, notas inline, controle de fonte

#### Tipos (`apps/tauri/src/services/manual.ts` + `apps/web/src/services/manual.ts`)
- Adicionar `excerpt?: string` ao `ManualArticleSummary`

---

## Design das telas

### Tela 1 — Home (rota `/manual`)

Substitui o índice accordion como tela principal.

**Layout:**
```
[ Ícone ] Manual Presbiteriano
          Edição 2019 · 488 artigos

[ 🔍  Buscar artigo, tema ou palavra-chave… ]

┌─────────────────┐  ┌─────────────────┐
│ RECENTES        │  │ ⭐ FAVORITOS    │
│ 13 · Diáconos   │  │ 1 · Igreja      │
│ 45 · Disciplina │  │ 56 · Ordenação  │
│ 8  · Culto      │  │                 │
└─────────────────┘  └─────────────────┘

        📖 Navegar pelo índice completo →
```

**Busca ativa:** substitui os cards de recentes/favoritos por lista de resultados com excerpt destacado.

**Estado vazio (sem recentes/favoritos):** mostra diretamente o índice accordion.

### Tela 2 — Índice (`/manual` em modo browse)

Accordion accordion de três níveis. Ao expandir capítulo, artigos aparecem como linhas com excerpt:

```
▼ Parte II — Governo                    [8 caps]
  ▼ Cap. 2 — Do Governo Local
    ┌──────────────────────────────────────────┐
    │ 12  Os presbíteros são eleitos pela...   │
    │ 13  Os diáconos exercem funções de...  ⭐│  ← favorito
    │ 14  As eleições ocorrem anualmente...    │
    └──────────────────────────────────────────┘
```

**Comportamento:**
- Partes: uma abre, outra fecha (accordion exclusivo)
- Capítulos: múltiplos podem estar abertos
- Artigo com favorito: ícone ⭐ na linha
- Artigo em leitura ativa: destaque verde

### Tela 3 — Leitor de Artigo

```
← Manual   Parte II › Cap. 2 › Art. 13        [ A- ] [ A+ ]  [ ⭐ ]

┌─────────────────────────────────────────────────────────┐
│                       Artigo 13                         │
│                                                         │
│  Os diáconos são eleitos pela congregação para servir   │
│  às necessidades temporais da Igreja e de seus          │
│  membros¹, administrando os fundos benevolentes²...     │
│                                                         │
│  ─────────────────────────────────────────────────      │
│  Notas                                                  │
│  ¹ Atos 6:1-6                                           │
│  ² 1 Timóteo 3:8-13                                     │
└─────────────────────────────────────────────────────────┘

  [ ← Art. 12 ]                            [ Art. 14 → ]
```

**Notas:** renderizadas no rodapé do card (não como badges soltos). Marcador inline no texto (`¹`, `²`) correlacionado à nota no rodapé.

**Breadcrumb:** `Parte II › Cap. 2 › Art. 13` — clicável para voltar ao índice naquele ponto.

**Favoritar:** ícone ⭐ no header — toggle. Salvo em localStorage.

---

## Persistência (localStorage)

| Chave | Formato | Descrição |
|-------|---------|-----------|
| `manual-favorites` | `string[]` | Array de article IDs favoritados |
| `manual-recent` | `{id,number,excerpt}[]` | Últimos 5 artigos lidos |
| `manual-font-size` | `number` | Tamanho de fonte do leitor (14–32px) |

Ambas as plataformas usam o mesmo `localStorage` local (não sincronizado com backend).

---

## Sequência de implementação

1. **Backend** — adicionar `excerpt` no `get_manual_structure()` (5 min)
2. **Tipos** — adicionar `excerpt?: string` nos tipos TypeScript de ambas as plataformas
3. **Hook `useManualFavorites`** — lógica de favoritos/recentes reutilizável
4. **Web: `ManualPage.tsx`** — reescrita com home + índice melhorado
5. **Web: `ManualReaderPage.tsx`** — breadcrumb + favoritar + notas no rodapé
6. **Tauri: `ManualScreen.tsx`** — reescrita (mesma lógica da web)
7. **Tauri: `ManualArticleScreen.tsx`** — alinhamento com web + fonte

---

## O que não está neste escopo

- Sincronização de favoritos com servidor (pode vir depois)
- Modo offline de busca full-text no Tauri (depende de índice FTS no SQLite)
- Anotações pessoais nos artigos
- Modo de impressão
