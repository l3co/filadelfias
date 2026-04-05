# Tauri — Tema Visual, Navegação Auth-Gated e Correções Técnicas

**Data:** 2026-03-30
**Branch:** retrofit-app
**Status:** Aprovado para implementação

---

## Contexto

O app Tauri foi scaffoldado com o template padrão do shadcn/ui (tema azul). A identidade visual do Filadélfias usa verde/teal. Além disso, a navegação expõe itens da área de membro para usuários não autenticados, e há falhas técnicas nas permissões SQL e inicialização do banco de dados.

---

## Decisões de Design

### 1. Tema Visual

Substituir o tema shadcn azul pela paleta verde/teal da identidade Filadélfias, alinhada com o app web.

**Paleta definida:**

| Token CSS | Valor HSL | Hex equivalente |
|-----------|-----------|-----------------|
| `--primary` | `142.1 76.2% 36.3%` | `#16a34a` (green-600) |
| `--primary-foreground` | `0 0% 100%` | branco |
| `--ring` | `142.1 76.2% 36.3%` | green-600 |

**Cores customizadas Tailwind:**
- `mint-50`: `#DEEFE7` (background suave — igual web)
- `navy-900`: `#002333` (text escuro de marca)
- `teal-500`: `#159A9C` (foco/destaque secundário)

**Gradiente de marca** (logo, elementos de destaque, itens ativos):
`from-green-700 to-teal-600` → `#15803d` → `#0d9488`

**Arquivos a modificar:**
- `apps/tauri/src/index.css` — variáveis CSS HSL do shadcn
- `apps/tauri/tailwind.config.js` — adicionar cores customizadas
- `apps/tauri/src/components/layout/Sidebar.tsx` — logo com gradiente + ícone
- `apps/tauri/src/components/layout/BottomNav.tsx` — cores dos tabs ativos

---

### 2. Navegação Auth-Gated (Opção C)

**Princípio:** Conteúdo público sempre visível. Área de membro acessível apenas após login, representada por uma entrada única "Minha Igreja" que expande após autenticação.

#### Sidebar — Desktop

**Sem login:**
```
Seção: Conteúdo
  - Início
  - Bíblia
  - Hinário
  - Manual IPB
  - Downloads

[Rodapé] Card "Minha Igreja"
  Ícone church, gradiente green→teal
  Subtítulo: "Entrar para acessar" → navega para /auth/login
```

**Com login:**
```
Seção: Conteúdo
  - Início
  - Bíblia
  - Hinário
  - Manual IPB
  - Downloads

Seção: Minha Igreja  ← label com nome da igreja do usuário
  - Oração
  - Eventos
  - Diretório
  - Devocionais
  - Missões
  - Dízimos
  - Despesas
  - EBD

[Admin — condicional]  ← só se hasAdminAccess
  - Painel Admin
  - Governança

[Rodapé] Card do usuário
  Avatar (inicial do nome), nome completo, cargo na igreja
  Link Configurações
```

**Implementação:** `Sidebar.tsx` lê `useAuthStore` (`isAuthenticated`, `user`, `currentChurchId`). Nenhuma nova store necessária.

---

#### BottomNav — Mobile

**5 tabs fixos, composição muda com auth:**

| Posição | Sem login | Com login |
|---------|-----------|-----------|
| 1 | Início (Home) | Início (Home) |
| 2 | Bíblia (BookOpen) | Bíblia (BookOpen) |
| 3 | Hinário (Music) | Oração (Heart) |
| 4 | Manual (BookMarked) | Comunidade (Users) → `/member/directory` |
| 5 | Entrar (Church) → `/auth/login` | Perfil (User) → `/member/profile` |

O tab "Entrar" (posição 5, sem login) usa o ícone `Church` do lucide-react com label "Entrar", cor `green-600`, e navega diretamente para `/auth/login`.

---

### 3. Correções Técnicas

#### 3.1 Permissões SQL — capabilities/default.json
Adicionar ao array de permissions:
- `"sql:allow-execute"` — permite `database.execute()` (CREATE TABLE, INSERT, UPDATE, DELETE)
- `"sql:allow-select"` — permite `database.select()` (SELECT)

> **Já aplicado** em sessão anterior. Verificar no plano de implementação.

#### 3.2 Inicialização do banco antes da navegação
**Problema:** `getDatabase()` é chamado em `App.tsx` via `useEffect` (assíncrono). Se o usuário navegar para Bíblia ou Downloads antes da migration completar, os `select()`s falham com "no such table".

**Fix:** Adicionar estado `dbReady` no `App.tsx`. Enquanto `dbReady === false`, renderizar um loading screen leve. Só liberar o `RouterProvider` após `getDatabase()` resolver.

```
App.tsx:
  const [dbReady, setDbReady] = useState(false)

  useEffect(() => {
    getDatabase()
      .then(() => setDbReady(true))
      .catch(() => setDbReady(true))  // não bloquear em caso de erro
  }, [])

  if (!dbReady) return <SplashScreen />
```

#### 3.3 TrayIcon drop — src-tauri/src/lib.rs
**Problema:** `_tray` era dropped ao fim do bloco `setup`, removendo o ícone da bandeja imediatamente.

**Fix:** `app.manage(TrayState(Mutex::new(Some(tray))))` onde `TrayState` é um newtype `struct TrayState(Mutex<Option<TrayIcon<tauri::Wry>>>)`.

> **Já aplicado** em sessão anterior. Verificar no plano.

#### 3.4 Capabilities sem campo `windows`
**Problema:** `capabilities/default.json` e `desktop-updater.json` sem `"windows": ["main"]` — nenhuma permissão era aplicada.

> **Já aplicado** em sessão anterior. Verificar no plano.

---

## Arquivos Afetados

| Arquivo | Operação |
|---------|----------|
| `apps/tauri/src/index.css` | Modificar variáveis CSS (tema) |
| `apps/tauri/tailwind.config.js` | Adicionar cores customizadas |
| `apps/tauri/src/components/layout/Sidebar.tsx` | Reescrever com auth-gating + novo tema |
| `apps/tauri/src/components/layout/BottomNav.tsx` | Reescrever com auth-gating + novo tema |
| `apps/tauri/src/App.tsx` | Adicionar `dbReady` gate |
| `apps/tauri/src-tauri/capabilities/default.json` | Verificar sql:allow-execute (já aplicado) |
| `apps/tauri/src-tauri/src/lib.rs` | Verificar TrayState fix (já aplicado) |

---

## O que está fora do escopo deste plano

- Implementação das telas de membro (Oração, Eventos, etc.) — pertencem às Fases 5–6 do roadmap
- Login / autenticação real — pertence à Fase 4
- Download de conteúdo offline (Bíblia, Hinário) — pertence à Fase 3
- Qualquer mudança no app web
