# Design Spec — Retrofit Tauri 2.0

**Data:** 2026-03-29
**Status:** Aprovado
**Autor:** Sessão de brainstorming com Claude

---

## Contexto

O Filadelfias possui um app mobile em Expo/React Native (`apps/mobile`). Este projeto recria o app como uma aplicação **Tauri 2.0 multi-plataforma**, cobrindo iOS, Android e Desktop (Windows, macOS, Linux) a partir de uma única codebase React/TypeScript.

---

## Decisões de Design

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Plataformas alvo | iOS + Android + Windows + macOS + Linux | Tauri 2.0 suporta todas nativamente |
| Base do frontend | Reusar `apps/web` como ponto de partida | Evita duplicação; mesma stack React 19 + TailwindCSS |
| Camada Rust | Mínima (plugins oficiais apenas) | Time é TypeScript-first; domínio não exige performance Rust |
| Estrutura no monorepo | `apps/tauri/` isolado | Evita acoplamento com `apps/web`; tooling Tauri/Cargo separado |
| Distribuição | Google Play + App Store + Microsoft Store | Usuário já possui conta Google; Apple e Microsoft em aquisição |
| Estratégia de fases | Fundação primeiro | Infraestrutura Tauri é o maior risco técnico — validar antes das features |

---

## Arquitetura

### Estrutura no Monorepo

```
filadelfias/
├── apps/
│   ├── backend/          # sem alteração
│   ├── web/              # sem alteração
│   ├── mobile/           # mantido (Expo — não removido)
│   └── tauri/            # ← NOVO
│       ├── src/          # React 19 + TS + Vite
│       │   ├── components/
│       │   ├── features/
│       │   ├── hooks/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── stores/
│       │   └── types/
│       └── src-tauri/    # Rust mínimo
│           ├── src/
│           │   └── main.rs
│           ├── capabilities/
│           ├── icons/
│           ├── Cargo.toml
│           └── tauri.conf.json
└── packages/
    ├── contracts/        # sem alteração
    └── ui/               # (opcional, fase futura)
```

### Mapeamento de Dependências Expo → Tauri

| Expo (atual) | Tauri Plugin | Notas |
|---|---|---|
| `expo-sqlite` | `tauri-plugin-sql` | SQLite com FTS para busca offline |
| `expo-secure-store` | `tauri-plugin-store` | Armazenamento seguro de tokens JWT |
| `expo-notifications` | `tauri-plugin-notification` | Notificações locais |
| `expo-file-system` | `tauri-plugin-fs` | Downloads de conteúdo offline |
| `expo-speech` | Web Speech API | Nativa do WebView; sem plugin extra |
| `expo-haptics` | `tauri-plugin-haptics` | Feedback tátil mobile |
| `expo-clipboard` | `tauri-plugin-clipboard-manager` | Copiar versículos |
| Expo Router | React Router v7 | Mesmo usado em `apps/web` |
| NativeWind | TailwindCSS | Mesmo CSS, sem camada de abstração |

### Stack Frontend (`apps/tauri/src/`)

- React 19 + TypeScript + Vite
- TailwindCSS + shadcn/ui (Radix UI)
- TanStack Query v5
- Zustand v5
- React Router v7
- React Hook Form + Zod v4
- Axios (HTTP para API backend)

### UX Adaptativa

O componente `AppShell` detecta a plataforma via hook `usePlatform()` e renderiza o layout correto:

**Mobile:**
- Top bar com título + ações
- Bottom Navigation (5 tabs: Início, Bíblia, +, Membro, Perfil)
- Navegação por gestos (swipe)

**Desktop:**
- Sidebar fixa à esquerda com todos os módulos
- Top bar com busca global
- Suporte a atalhos de teclado
- Tray icon (macOS/Windows)

Grupos de rotas (React Router v7):
- `/` → área pública (Bíblia, Hinário, Manual IPB)
- `/auth/*` → login, registro, recuperação de senha
- `/member/*` → área autenticada do membro
- `/admin/*` → área administrativa

---

## Fases de Implementação

### Fase 1 — Fundação Tauri
Criar `apps/tauri/`, configurar Tauri 2.0 com todos os targets (Android, iOS, Windows, macOS, Linux), instalar e validar plugins base, configurar CI/CD com GitHub Actions.

**Entrega:** App Tauri rodando "Hello World" em todas as plataformas com plugins funcionais.

### Fase 2 — Shell e Navegação
Implementar `AppShell` com layout adaptativo mobile/desktop, React Router v7, tema claro/escuro, splash screen e ícones.

**Entrega:** Navegação completa entre telas vazias em todos os targets.

### Fase 3 — Conteúdo Público Offline
Portar Bíblia (múltiplas versões + SQLite FTS), Hinário Novo Cântico e Manual IPB do `apps/mobile`. Download com progresso, leitura offline, TTS via Web Speech API.

**Entrega:** Conteúdo público 100% funcional offline, sem autenticação.

### Fase 4 — Autenticação e Segurança
Portar fluxo de auth: login, registro, recuperação de senha, refresh token, armazenamento seguro de JWT via `tauri-plugin-store`, proteção de rotas.

**Entrega:** Autenticação completa e funcional em todas as plataformas.

### Fase 5 — Área do Membro — Core
Portar: perfil, diretório de membros, devocionais, eventos e missões.

**Entrega:** Área do membro navegável com dados reais da API.

### Fase 6 — Comunidade e Interação
Portar: pedidos de oração (criar, orar, categorias), calendário comunitário.

**Entrega:** Módulos de comunidade funcionais.

### Fase 7 — Financeiro e Educação
Portar: dízimos/ofertas (envio + histórico), despesas/reembolsos, EBD (classes, lições, frequência).

**Entrega:** Módulos financeiros e educacionais funcionais.

### Fase 8 — Governança e Admin
Portar área administrativa: aprovações de dízimos/despesas, gestão de membros, módulo de governança eclesiástica.

**Entrega:** Área admin funcional com controle de permissões RBAC.

### Fase 9 — UX Desktop
Otimizações exclusivas para desktop: sidebar avançada, menus nativos (macOS menu bar, Windows taskbar), atalhos de teclado globais, tray icon, suporte a múltiplas janelas, zoom/escala.

**Entrega:** Experiência desktop polida e idiomática por plataforma.

### Fase 10 — Build, Signing e Distribuição
Configuração completa de signing (Android keystore, Apple certificates, Windows/macOS codesign), builds de release automatizados via CI/CD, submissão às lojas, configuração de auto-update (Tauri Updater).

**Entrega:** App publicado no Google Play, App Store e Microsoft Store com pipeline de release automatizado.

---

## Dependências entre Fases

```
Fase 1 (Fundação)
  └── Fase 2 (Shell)
        ├── Fase 3 (Offline) ← independente de auth
        ├── Fase 4 (Auth)
        │     ├── Fase 5 (Membro Core)
        │     │     ├── Fase 6 (Comunidade)
        │     │     ├── Fase 7 (Financeiro + EBD)
        │     │     └── Fase 8 (Admin)
        └── Fase 9 (UX Desktop) ← paralela a 5-8
Fase 10 (Distribuição) ← depende de todas
```

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Tauri mobile ainda imaturo | Alto | Validar build Android/iOS na Fase 1 antes de qualquer feature |
| WebView limitações em iOS (WKWebView) | Médio | Testar Web Speech API e SQLite em iOS na Fase 1 |
| Rejeição nas lojas | Médio | Revisar guidelines Apple/Google antes da Fase 10; usar TestFlight/internal track cedo |
| Divergência de UX mobile vs desktop | Baixo | `AppShell` centraliza o layout; uma mudança afeta ambos |

---

## Fora de Escopo

- Remover ou deprecar `apps/mobile` (Expo) — mantido em paralelo durante a transição
- Reescrever a lógica de negócio em Rust
- Criar biblioteca `packages/ui` compartilhada (considerado fase futura opcional)
- Testes E2E multi-plataforma com Tauri (fora do escopo inicial)
