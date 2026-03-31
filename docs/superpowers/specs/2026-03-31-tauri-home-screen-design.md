# Tela de Início (HomeScreen) — App Tauri

**Data:** 2026-03-31
**Branch:** `retrofit-app`
**Status:** Aprovado para implementação

---

## Contexto

A rota `/` do app Tauri atualmente renderiza `<Placeholder name="Inicio" />`. Este spec define a tela de início real, que funciona em dois modos: não autenticado (apresentação da plataforma) e autenticado (resumo personalizado da igreja do usuário).

---

## Decisões de Design

### Abordagem: Tela única adaptativa

Uma única `HomeScreen` lê `isAuthenticated` e `isLoading` do `useAuthStore` e renderiza seções diferentes no mesmo componente. Sem redirecionamentos, sem arquivos de rota adicionais.

---

## Componentes e Comportamento

### 1. Versículo do Dia

Sempre visível, independente de autenticação.

- **Fonte:** array local de 30 versículos clássicos em português, selecionado por `dayOfYear(new Date()) % verses.length`
- **Sem chamada de API** — funciona offline garantido
- **Visual:** card com fundo em gradiente `from-green-700 to-teal-600`, texto branco, referência em menor destaque

Estrutura do dado:
```ts
interface DailyVerse {
  text: string;
  reference: string; // ex: "João 3:16"
}
```

### 2. Layout — Não Autenticado

Exibido quando `!isLoading && !isAuthenticated`.

**Seções (ordem de cima para baixo):**

1. **Versículo do dia** — card verde/teal com texto e referência
2. **Descrição da plataforma** — 2 linhas: "Filadélfias é a plataforma digital para igrejas presbiterianas. Acesse a Bíblia, o Hinário e o Manual IPB gratuitamente."
3. **Cards de recursos** — grade 2×2, cada card com ícone (lucide-react), título e descrição curta:
   - 📖 **Bíblia** — "ARC, NVI e outras versões" → navega para `/biblia`
   - 🎵 **Hinário** — "Hinário Presbiteriano completo" → navega para `/hinario`
   - 📚 **Manual IPB** — "Constituição da Igreja" → navega para `/manual`
   - ⬇️ **Downloads** — "Conteúdo offline" → navega para `/downloads`
4. **Botão CTA** — "Entrar na Minha Igreja", largura total, variante `default` (verde primário) → navega para `/auth/login`

### 3. Layout — Autenticado

Exibido quando `!isLoading && isAuthenticated`.

**Seções (ordem de cima para baixo):**

1. **Versículo do dia** — mesmo card verde/teal
2. **Saudação** — "Olá, {user.name.split(' ')[0]}" + nome da igreja (`user.churches[0]?.name`) em `text-muted-foreground`
3. **Próximos eventos** — título "Próximos eventos", lista dos 3 eventos mais próximos com `starts_at >= hoje` ordenados por data. Cada item: título + data formatada (`dd 'de' MMMM, HH:mm`). Estado vazio: "Nenhum evento próximo." Link "Ver agenda completa" → `/member/events`
4. **Devocional de hoje** — título "Devocional de hoje". Chama `devotionalsService.getTodayDevotional(churchId)`. Mostra título + primeiras 120 chars do conteúdo + reticências. Navega para `/member/devotionals`. Se `null`, omite a seção silenciosamente.

### 4. Estado de carregamento

Durante `isLoading === true`: renderiza apenas o card do versículo do dia (já disponível localmente, sem espera) e um esqueleto de 2 linhas abaixo. Não bloqueia a tela.

---

## Dados e Hooks

| Dado | Origem | Condição |
|------|--------|----------|
| Versículo do dia | Array local, índice por dia do ano | Sempre |
| `isAuthenticated`, `isLoading`, `user` | `useAuthStore` | Sempre |
| `currentChurchId` | `useAuthStore` | Sempre |
| Eventos | `useEvents()` | Somente autenticado |
| Devocional | `devotionalsService.getTodayDevotional(churchId)` via query | Somente autenticado |

O devocional usa `useQuery` com `enabled: Boolean(churchId)` e `staleTime: 1000 * 60 * 5`.

---

## Arquivos Afetados

| Arquivo | Operação |
|---------|----------|
| `apps/tauri/src/routes/public/HomeScreen.tsx` | Criar |
| `apps/tauri/src/routes/index.tsx` | Modificar — trocar `<Placeholder name="Inicio" />` por `<HomeScreen />` e adicionar import |

---

## O que está fora do escopo

- Notificações push ou badges de contagem
- Feed de atualizações em tempo real
- Cards de missões ou EBD na home
- Qualquer mudança no app web
