# Fase 9 — UX Desktop

> **Para execução:** Use `superpowers:executing-plans` ou `superpowers:subagent-driven-development`.

**Goal:** Otimizar a experiência desktop com Sidebar avançada com submenus, menus nativos (macOS menu bar e Windows system tray), atalhos de teclado globais, tray icon e ajuste de tipografia/espaçamento para telas maiores.

**Architecture:** Tauri `@tauri-apps/api/menu` e `@tauri-apps/api/tray` para menus e tray nativos. Hook `useKeyboardShortcuts` para atalhos. CSS media queries e classes Tailwind para ajustes de layout em telas grandes.

**Tech Stack:** `@tauri-apps/api/menu`, `@tauri-apps/api/tray`, `@tauri-apps/api/window`, TailwindCSS breakpoints.

---

## Estrutura de Arquivos desta Fase

```
apps/tauri/src/
├── hooks/
│   └── useKeyboardShortcuts.ts    # atalhos globais de teclado
├── components/
│   └── layout/
│       ├── Sidebar.tsx            # atualizar: submenus colapsáveis
│       └── AppShell.tsx           # atualizar: suporte a painel lateral
└── lib/
    └── tray.ts                    # configuração do tray icon
src-tauri/src/
└── lib.rs                         # registrar menu e tray na inicialização
```

---

## Task 1: Sidebar com submenus colapsáveis

**Files:**
- Modify: `apps/tauri/src/components/layout/Sidebar.tsx`

- [ ] **Adicionar estado de colapso por seção**

Substituir o Sidebar existente por:

```typescript
import { NavLink } from "react-router-dom";
import {
  Home, BookOpen, Music, BookMarked, Heart, Calendar,
  Users, DollarSign, GraduationCap, Settings, Vote,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavSection {
  label: string;
  items: { to: string; icon: React.ElementType; label: string }[];
}

const sections: NavSection[] = [
  {
    label: "Conteúdo",
    items: [
      { to: "/", icon: Home, label: "Início" },
      { to: "/biblia", icon: BookOpen, label: "Bíblia" },
      { to: "/hinario", icon: Music, label: "Hinário" },
      { to: "/manual", icon: BookMarked, label: "Manual IPB" },
    ],
  },
  {
    label: "Comunidade",
    items: [
      { to: "/member/prayer", icon: Heart, label: "Oração" },
      { to: "/member/events", icon: Calendar, label: "Eventos" },
      { to: "/member/directory", icon: Users, label: "Diretório" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { to: "/member/tithes", icon: DollarSign, label: "Dízimos" },
      { to: "/member/expenses", icon: DollarSign, label: "Despesas" },
    ],
  },
  {
    label: "Educação",
    items: [{ to: "/member/ebd", icon: GraduationCap, label: "EBD" }],
  },
  {
    label: "Administração",
    items: [
      { to: "/admin", icon: Vote, label: "Painel Admin" },
      { to: "/admin/governance", icon: Vote, label: "Governança" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-background">
      <div className="flex h-14 items-center px-4 font-bold text-primary text-lg tracking-tight">
        Filadelfias
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        {sections.map((section) => (
          <div key={section.label} className="mb-1">
            <button
              onClick={() => toggle(section.label)}
              className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              {section.label}
              {collapsed[section.label] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </button>

            {!collapsed[section.label] && (
              <div className="mb-2">
                {section.items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      )
                    }
                  >
                    <Icon size={15} />
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t p-2">
        <NavLink
          to="/member/profile"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted"
        >
          <Settings size={15} />
          Configurações
        </NavLink>
      </div>
    </aside>
  );
}
```

---

## Task 2: Atalhos de teclado

**Files:**
- Create: `apps/tauri/src/hooks/useKeyboardShortcuts.ts`

- [ ] **Criar hook de atalhos**

```typescript
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlatform } from "./usePlatform";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const platform = usePlatform();

  useEffect(() => {
    if (platform !== "desktop") return;

    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      switch (e.key) {
        case "b": e.preventDefault(); navigate("/biblia"); break;
        case "h": e.preventDefault(); navigate("/hinario"); break;
        case "p": e.preventDefault(); navigate("/member/prayer"); break;
        case "d": e.preventDefault(); navigate("/member/directory"); break;
        case "e": e.preventDefault(); navigate("/member/events"); break;
        case ",": e.preventDefault(); navigate("/member/profile"); break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, platform]);
}
```

- [ ] **Registrar hook no AppShell**

Em `AppShell.tsx`, no branch de desktop, adicionar:
```typescript
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Dentro do componente AppShell:
useKeyboardShortcuts();
```

---

## Task 3: Menu nativo (macOS e Windows)

**Files:**
- Modify: `apps/tauri/src-tauri/src/lib.rs`

- [ ] **Adicionar menus nativos ao lib.rs**

```rust
use tauri::menu::{Menu, MenuItem, Submenu};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_haptics::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            #[cfg(desktop)]
            {
                let handle = app.handle();

                let bible_item = MenuItem::with_id(handle, "nav_bible", "Bíblia", true, Some("CmdOrCtrl+B"))?;
                let hymnal_item = MenuItem::with_id(handle, "nav_hymnal", "Hinário", true, Some("CmdOrCtrl+H"))?;
                let prayer_item = MenuItem::with_id(handle, "nav_prayer", "Oração", true, Some("CmdOrCtrl+P"))?;
                let directory_item = MenuItem::with_id(handle, "nav_directory", "Diretório", true, Some("CmdOrCtrl+D"))?;

                let nav_menu = Submenu::with_items(handle, "Navegar", true, &[
                    &bible_item, &hymnal_item, &prayer_item, &directory_item,
                ])?;

                let menu = Menu::with_items(handle, &[&nav_menu])?;
                app.set_menu(menu)?;

                app.on_menu_event(|app, event| {
                    let window = app.get_webview_window("main").unwrap();
                    match event.id().as_ref() {
                        "nav_bible" => { let _ = window.eval("window.location.href='/biblia'"); }
                        "nav_hymnal" => { let _ = window.eval("window.location.href='/hinario'"); }
                        "nav_prayer" => { let _ = window.eval("window.location.href='/member/prayer'"); }
                        "nav_directory" => { let _ = window.eval("window.location.href='/member/directory'"); }
                        _ => {}
                    }
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Adicionar dependência tauri com feature menu ao Cargo.toml**

```toml
tauri = { version = "2", features = ["tray-icon"] }
```

- [ ] **Verificar menus no macOS**

```bash
cargo tauri dev
```

Esperado: menu "Navegar" aparece na barra de menu do macOS com atalhos ⌘B, ⌘H, ⌘P, ⌘D.

---

## Task 4: Tray icon

**Files:**
- Create: `apps/tauri/src/lib/tray.ts`
- Modify: `apps/tauri/src-tauri/src/lib.rs`

- [ ] **Adicionar tray icon ao setup do lib.rs**

Dentro do `setup`, após o bloco `#[cfg(desktop)]`:
```rust
use tauri::tray::{TrayIconBuilder, MouseButton, MouseButtonState, TrayIconEvent};

let tray = TrayIconBuilder::new()
    .icon(app.default_window_icon().unwrap().clone())
    .tooltip("Filadelfias")
    .on_tray_icon_event(|tray, event| {
        if let TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
        } = event {
            let app = tray.app_handle();
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
    })
    .build(app)?;
```

- [ ] **Ajustar tauri.conf.json para esconder da taskbar quando minimizado** (opcional, Windows/macOS)

```json
"app": {
  "windows": [{
    "skipTaskbar": false,
    "visibleOnAllWorkspaces": false
  }]
}
```

---

## Task 5: Layout desktop otimizado

**Files:**
- Modify: `apps/tauri/src/components/layout/AppShell.tsx`

- [ ] **Ajustar AppShell para desktop com margem de conteúdo**

No branch desktop do `AppShell`, atualizar a área de conteúdo:
```typescript
<div className="flex flex-1 flex-col overflow-hidden">
  <main className="flex-1 overflow-y-auto">
    <div className="mx-auto max-w-4xl px-6 py-6">
      <Outlet />
    </div>
  </main>
</div>
```

- [ ] **Ajustar tipografia base para desktop em index.css**

```css
@media (min-width: 768px) {
  body {
    font-size: 15px;
  }
}
```

- [ ] **Commit**

```bash
git add apps/tauri/src/ apps/tauri/src-tauri/
git commit -m "feat(tauri): implement desktop UX (sidebar submenus, keyboard shortcuts, native menus, tray icon)"
```

---

## Checklist de Conclusão da Fase 9

- [ ] Sidebar colapsa/expande seções com animação
- [ ] ⌘B / Ctrl+B navega para Bíblia (e demais atalhos)
- [ ] Menu nativo macOS exibe "Navegar" com atalhos registrados
- [ ] Tray icon aparece na system tray e abre janela ao clicar
- [ ] Layout desktop usa `max-w-4xl` para não estender demais em telas largas
- [ ] Não há regressão em mobile (Sidebar e atalhos desativados)

**Próximo passo:** [Fase 10 — Build e Distribuição](fase_10.md)
