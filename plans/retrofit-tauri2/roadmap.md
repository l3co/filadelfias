# Retrofit Tauri 2.0 — Roadmap

> Migração do app mobile Filadelfias (Expo/React Native) para Tauri 2.0 multi-plataforma.
> Plataformas alvo: **Android · iOS · Windows · macOS · Linux**

---

## Fases

| # | Fase | Objetivo | Depende de |
|---|------|----------|------------|
| 1 | [Fundação Tauri](fase_1.md) | Setup do projeto, plugins, targets, CI base | — |
| 2 | [Shell e Navegação](fase_2.md) | Layout adaptativo mobile/desktop, roteamento, temas | Fase 1 |
| 3 | [Conteúdo Público Offline](fase_3.md) | Bíblia (FTS), Hinário, Manual IPB — SQLite offline | Fase 1 |
| 4 | [Autenticação e Segurança](fase_4.md) | Login, JWT, secure store, rotas protegidas | Fase 2 |
| 5 | [Área do Membro — Core](fase_5.md) | Perfil, diretório, devocionais, eventos, missões | Fase 4 |
| 6 | [Comunidade e Interação](fase_6.md) | Pedidos de oração, calendário comunitário | Fase 5 |
| 7 | [Financeiro e Educação](fase_7.md) | Dízimos, despesas/reembolsos, EBD | Fase 5 |
| 8 | [Governança e Admin](fase_8.md) | Área administrativa, aprovações, governança | Fase 5 |
| 9 | [UX Desktop](fase_9.md) | Sidebar avançada, menus nativos, atalhos, tray icon | Fase 2 |
| 10 | [Build e Distribuição](fase_10.md) | Signing, Google Play, App Store, Microsoft Store | Todas |

---

## Diagrama de Dependências

```
Fase 1 — Fundação Tauri
  └── Fase 2 — Shell e Navegação
        ├── Fase 3 — Conteúdo Público Offline  ← pode rodar paralelo a Fase 4
        ├── Fase 4 — Autenticação e Segurança
        │     ├── Fase 5 — Área do Membro Core
        │     │     ├── Fase 6 — Comunidade e Interação
        │     │     ├── Fase 7 — Financeiro e Educação
        │     │     └── Fase 8 — Governança e Admin
        └── Fase 9 — UX Desktop  ← pode rodar paralelo a Fase 5–8
Fase 10 — Build e Distribuição  ← depende de TODAS as anteriores
```

---

## Stack de Referência Rápida

| Camada | Tecnologia |
|--------|------------|
| Shell nativo | Tauri 2.0 (Rust) |
| Frontend | React 19 + TypeScript + Vite |
| Estilo | TailwindCSS 3 + shadcn/ui (Radix UI) |
| Estado servidor | TanStack Query v5 |
| Estado cliente | Zustand v5 |
| Roteamento | React Router v7 |
| Formulários | React Hook Form + Zod v4 |
| HTTP | Axios |
| SQLite offline | tauri-plugin-sql |
| Armazenamento seguro | tauri-plugin-store |
| Notificações | tauri-plugin-notification |
| Sistema de arquivos | tauri-plugin-fs |
| Feedback tátil | tauri-plugin-haptics |
| TTS | Web Speech API (nativa do WebView) |

---

## Localização dos Arquivos

```
filadelfias/
├── apps/tauri/               ← app criado na Fase 1
│   ├── src/                  ← React frontend
│   └── src-tauri/            ← Rust / Tauri config
├── plans/retrofit-tauri2/    ← este roadmap + fases
└── docs/superpowers/specs/
    └── 2026-03-29-retrofit-tauri2-design.md  ← spec aprovado
```

---

## Referências de API

| Recurso | URL |
|---------|-----|
| API Produção | `https://api.filadelfias.com` |
| API Local | `http://localhost:8000` |
| Docs API | `http://localhost:8000/docs` |
| Tauri Docs | `https://tauri.app/v2/` |
| tauri-plugin-sql | `https://github.com/tauri-apps/tauri-plugin-sql` |

---

## Convenção de Commits neste Projeto

```
feat(tauri): add SQLite offline schema
fix(tauri): correct iOS WebView CSP headers
chore(tauri): configure Android signing
test(tauri): add auth store unit tests
```

Escopo sempre `tauri` para diferenciar dos outros apps do monorepo.
