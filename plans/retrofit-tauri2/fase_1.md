# Fase 1 — Fundação Tauri

> **Para execução:** Use `superpowers:executing-plans` ou `superpowers:subagent-driven-development`.

**Goal:** Criar `apps/tauri/` com Tauri 2.0 configurado para todos os targets (Android, iOS, Windows, macOS, Linux), plugins instalados e CI/CD base funcionando.

**Architecture:** Estrutura Vite + React servida pelo WebView do Tauri. Camada Rust mínima: apenas registro de plugins oficiais. Build multi-target via `cargo tauri build --target`.

**Tech Stack:** Tauri 2.0, Rust (cargo), Vite 6, React 19, TypeScript, GitHub Actions.

---

## Estrutura de Arquivos desta Fase

```
apps/tauri/
├── src/
│   ├── main.tsx              # entry point React
│   ├── App.tsx               # root component (placeholder)
│   ├── index.css             # TailwindCSS imports
│   └── vite-env.d.ts
├── src-tauri/
│   ├── src/
│   │   ├── main.rs           # entry point Rust (desktop)
│   │   └── lib.rs            # lógica compartilhada + plugin registration
│   ├── capabilities/
│   │   └── default.json      # permissões Tauri 2.0
│   ├── icons/                # ícones gerados (não editar manualmente)
│   ├── Cargo.toml
│   ├── build.rs
│   └── tauri.conf.json
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── tailwind.config.js
.github/workflows/
└── tauri-ci.yml              # CI pipeline
```

---

## Pré-requisitos

- [ ] **Verificar Rust instalado**

```bash
rustc --version   # precisa >= 1.77
cargo --version
```

Se não estiver: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

- [ ] **Instalar tauri-cli v2**

```bash
cargo install tauri-cli --version "^2.0"
cargo tauri --version   # deve mostrar tauri-cli 2.x.x
```

- [ ] **Verificar Node.js**

```bash
node --version   # precisa >= 20
```

- [ ] **Android: instalar Android Studio + NDK**

Siga: https://tauri.app/v2/guides/prerequisites/#android
Variáveis necessárias:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export NDK_HOME=$ANDROID_HOME/ndk/$(ls $ANDROID_HOME/ndk)
```

- [ ] **iOS: instalar Xcode + command line tools** (macOS apenas)

```bash
xcode-select --install
```

---

## Task 1: Criar estrutura do projeto

**Files:**
- Create: `apps/tauri/` (diretório raiz)

- [ ] **Navegar para apps/ e criar o projeto Tauri**

```bash
cd /Users/leco/Documents/filadelfias/apps
npm create tauri-app@latest tauri -- --template react-ts --manager npm
```

Quando solicitado:
- Project name: `tauri`
- Package manager: `npm`
- Frontend template: `React` + `TypeScript`

- [ ] **Verificar estrutura criada**

```bash
ls apps/tauri/
# deve mostrar: src/ src-tauri/ index.html package.json vite.config.ts
```

- [ ] **Instalar dependências**

```bash
cd apps/tauri
npm install
```

- [ ] **Testar primeira execução desktop**

```bash
cargo tauri dev
# deve abrir janela desktop com "Welcome to Tauri"
```

- [ ] **Commit inicial**

```bash
cd /Users/leco/Documents/filadelfias
git add apps/tauri/
git commit -m "feat(tauri): initialize Tauri 2.0 project with React/TypeScript"
```

---

## Task 2: Configurar tauri.conf.json

**Files:**
- Modify: `apps/tauri/src-tauri/tauri.conf.json`

- [ ] **Substituir conteúdo do tauri.conf.json**

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Filadelfias",
  "version": "0.1.0",
  "identifier": "com.filadelfias.app",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:5173",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "Filadelfias",
        "width": 390,
        "height": 844,
        "minWidth": 360,
        "minHeight": 640,
        "resizable": true,
        "fullscreen": false,
        "decorations": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'"
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

- [ ] **Verificar que ainda abre corretamente**

```bash
cargo tauri dev
```

---

## Task 3: Configurar Cargo.toml com plugins

**Files:**
- Modify: `apps/tauri/src-tauri/Cargo.toml`

- [ ] **Substituir Cargo.toml**

```toml
[package]
name = "filadelfias"
version = "0.1.0"
edition = "2021"

[lib]
name = "filadelfias_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
tauri-plugin-store = "2"
tauri-plugin-notification = "2"
tauri-plugin-fs = "2"
tauri-plugin-haptics = "2"
tauri-plugin-clipboard-manager = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
```

- [ ] **Atualizar lib.rs para registrar plugins**

`apps/tauri/src-tauri/src/lib.rs`:
```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_haptics::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Baixar dependências Rust**

```bash
cd apps/tauri/src-tauri
cargo fetch
```

Esperado: download de ~50 crates, sem erros.

---

## Task 4: Configurar Capabilities (segurança Tauri 2.0)

**Files:**
- Create: `apps/tauri/src-tauri/capabilities/default.json`

- [ ] **Criar arquivo de capabilities**

```json
{
  "$schema": "https://schemas.tauri.app/config/capabilities",
  "identifier": "default",
  "description": "Permissões padrão do Filadelfias",
  "platforms": ["macOS", "windows", "linux", "android", "iOS"],
  "permissions": [
    "core:default",
    "core:window:default",
    "sql:default",
    "store:default",
    "notification:default",
    "fs:default",
    "haptics:default",
    "clipboard-manager:default"
  ]
}
```

- [ ] **Verificar que o app ainda compila**

```bash
cargo tauri dev
```

Esperado: app abre sem erros no console.

---

## Task 5: Configurar target Android

**Files:**
- Create: `apps/tauri/src-tauri/gen/android/` (gerado automaticamente)

- [ ] **Inicializar target Android**

```bash
cd apps/tauri
cargo tauri android init
```

Esperado: cria `src-tauri/gen/android/` com projeto Gradle.

- [ ] **Executar no Android (emulador ou device)**

```bash
cargo tauri android dev
```

Esperado: app abre no Android com "Welcome to Tauri". Se falhar, verificar `ANDROID_HOME` e `NDK_HOME`.

- [ ] **Commit do target Android**

```bash
git add apps/tauri/src-tauri/gen/android/
git commit -m "feat(tauri): initialize Android target"
```

---

## Task 6: Configurar target iOS (requer macOS)

**Files:**
- Create: `apps/tauri/src-tauri/gen/apple/` (gerado automaticamente)

- [ ] **Inicializar target iOS**

```bash
cd apps/tauri
cargo tauri ios init
```

- [ ] **Executar no simulador iOS**

```bash
cargo tauri ios dev
```

Esperado: app abre no simulador iOS.

- [ ] **Commit do target iOS**

```bash
git add apps/tauri/src-tauri/gen/apple/
git commit -m "feat(tauri): initialize iOS target"
```

---

## Task 7: Instalar dependências npm base

**Files:**
- Modify: `apps/tauri/package.json`

- [ ] **Instalar dependências frontend**

```bash
cd apps/tauri
npm install \
  react-router-dom \
  @tanstack/react-query \
  zustand \
  axios \
  zod \
  react-hook-form \
  @hookform/resolvers \
  clsx \
  tailwind-merge \
  lucide-react \
  class-variance-authority \
  date-fns \
  sonner
```

- [ ] **Instalar devDependencies**

```bash
npm install -D \
  tailwindcss \
  @tailwindcss/vite \
  autoprefixer \
  postcss \
  @types/react \
  @types/react-dom \
  @types/node \
  vitest \
  @testing-library/react \
  @testing-library/user-event \
  @vitejs/plugin-react
```

- [ ] **Inicializar TailwindCSS**

```bash
npx tailwindcss init -p
```

- [ ] **Commit das dependências**

```bash
git add apps/tauri/package.json apps/tauri/package-lock.json
git commit -m "chore(tauri): add frontend dependencies"
```

---

## Task 8: Configurar Vite + TailwindCSS

**Files:**
- Modify: `apps/tauri/vite.config.ts`
- Modify: `apps/tauri/tailwind.config.js`
- Modify: `apps/tauri/src/index.css`

- [ ] **Atualizar vite.config.ts**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async () => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
```

- [ ] **Atualizar tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
```

- [ ] **Atualizar src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --border: 217.2 32.6% 17.5%;
  }
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  -webkit-user-select: none;
  user-select: none;
}
```

- [ ] **Verificar app com estilos**

```bash
cargo tauri dev
```

---

## Task 9: Configurar GitHub Actions CI

**Files:**
- Create: `.github/workflows/tauri-ci.yml`

- [ ] **Criar workflow CI**

```yaml
name: Tauri CI

on:
  push:
    branches: [main]
    paths: ["apps/tauri/**"]
  pull_request:
    branches: [main]
    paths: ["apps/tauri/**"]

jobs:
  test-build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: apps/tauri/package-lock.json

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Rust cache
        uses: swatinem/rust-cache@v2
        with:
          workspaces: "apps/tauri/src-tauri -> target"

      - name: Install Linux dependencies
        if: matrix.os == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev \
            libappindicator3-dev librsvg2-dev patchelf

      - name: Install frontend deps
        run: npm ci
        working-directory: apps/tauri

      - name: Build frontend
        run: npm run build
        working-directory: apps/tauri

      - name: Build Tauri (desktop)
        run: cargo tauri build
        working-directory: apps/tauri
        env:
          TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
          TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
```

- [ ] **Commit do CI**

```bash
git add .github/workflows/tauri-ci.yml
git commit -m "ci: add GitHub Actions workflow for Tauri desktop build"
```

---

## Checklist de Conclusão da Fase 1

- [ ] `cargo tauri dev` abre app desktop (macOS/Windows/Linux)
- [ ] `cargo tauri android dev` abre no Android
- [ ] `cargo tauri ios dev` abre no simulador iOS
- [ ] Todos os plugins registrados sem erros no console Rust
- [ ] GitHub Actions passa no push para `main`
- [ ] `apps/tauri/` commitado e estrutura conforme documentado

**Próximo passo:** [Fase 2 — Shell e Navegação](fase_2.md)
