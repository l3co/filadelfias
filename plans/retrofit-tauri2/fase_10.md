# Fase 10 — Build, Signing e Distribuição

> **Para execução:** Use `superpowers:executing-plans` ou `superpowers:subagent-driven-development`.

**Goal:** Configurar signing completo para todos os targets, criar pipeline de release automatizado via GitHub Actions, configurar Tauri Updater para auto-atualização, e submeter o app ao Google Play, App Store e Microsoft Store.

**Architecture:** Um único workflow `release.yml` no GitHub Actions detecta a tag `v*.*.*` e dispara builds paralelos para Android, iOS, Windows, macOS e Linux. Artefatos publicados como GitHub Release + update server (GitHub Releases como CDN).

**Tech Stack:** GitHub Actions, `tauri-action`, Android Keystore, Apple Certificates, Windows EV Code Signing, macOS Notarization, Tauri Updater v2.

---

## Estrutura de Arquivos desta Fase

```
.github/workflows/
├── tauri-ci.yml           # existente (CI em PRs)
└── tauri-release.yml      # NOVO: build e publicação de releases
apps/tauri/src-tauri/
└── tauri.conf.json        # atualizar: adicionar updater config
```

---

## Task 1: Gerar chave de signing Tauri (auto-update)

**Files:**
- Modify: `apps/tauri/src-tauri/tauri.conf.json`

- [ ] **Gerar par de chaves para o Tauri Updater**

```bash
cd apps/tauri
cargo tauri signer generate -w ~/.tauri/filadelfias.key
```

Saída esperada:
```
Private key written to ~/.tauri/filadelfias.key
Public key: dW50cnVzdGVkIGNvbW1lbnQ6...
```

- [ ] **Salvar chave privada como GitHub Secret**

No GitHub (Settings → Secrets → Actions):
- `TAURI_SIGNING_PRIVATE_KEY` = conteúdo de `~/.tauri/filadelfias.key`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` = senha escolhida (deixar vazio se sem senha)

- [ ] **Adicionar configuração de updater ao tauri.conf.json**

```json
"plugins": {
  "updater": {
    "active": true,
    "endpoints": [
      "https://github.com/l3co/filadelfias/releases/latest/download/latest.json"
    ],
    "dialog": true,
    "pubkey": "COLE_AQUI_A_PUBLIC_KEY_GERADA_ACIMA"
  }
}
```

- [ ] **Adicionar tauri-plugin-updater ao Cargo.toml**

```toml
tauri-plugin-updater = "2"
```

Em `src/lib.rs`, registrar:
```rust
.plugin(tauri_plugin_updater::Builder::new().build())
```

---

## Task 2: Signing Android (Google Play)

**Files:**
- Create: `apps/tauri/src-tauri/gen/android/keystore/` (não commitar a keystore!)

- [ ] **Gerar keystore Android**

```bash
keytool -genkey -v \
  -keystore ~/.android/filadelfias-release.jks \
  -alias filadelfias \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```

Preencher os campos solicitados (nome, organização, cidade, país).

- [ ] **Adicionar secrets no GitHub**

- `ANDROID_KEY_ALIAS` = `filadelfias`
- `ANDROID_KEY_PASSWORD` = senha do alias
- `ANDROID_STORE_PASSWORD` = senha da keystore
- `ANDROID_KEYSTORE_BASE64` = conteúdo Base64 da keystore:

```bash
base64 -i ~/.android/filadelfias-release.jks | pbcopy
```

- [ ] **Configurar signing no arquivo Gradle**

Em `apps/tauri/src-tauri/gen/android/app/build.gradle.kts`:
```kotlin
android {
    signingConfigs {
        create("release") {
            keyAlias = System.getenv("ANDROID_KEY_ALIAS")
            keyPassword = System.getenv("ANDROID_KEY_PASSWORD")
            storeFile = file(System.getenv("ANDROID_KEYSTORE_PATH") ?: "keystore/release.jks")
            storePassword = System.getenv("ANDROID_STORE_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

---

## Task 3: Signing iOS (App Store)

**Pré-requisito:** Conta Apple Developer ($99/ano).

- [ ] **Criar App ID no Apple Developer Portal**

1. Acessar https://developer.apple.com/account/resources/identifiers/list
2. Criar novo Identifier com bundle ID `com.filadelfias.app`

- [ ] **Criar provisioning profile**

1. Em https://developer.apple.com/account/resources/profiles/list
2. Criar "App Store" provisioning profile para `com.filadelfias.app`
3. Baixar e instalar no macOS

- [ ] **Exportar certificado como Base64 para GitHub Secrets**

```bash
# Exportar certificado de distribuição do Keychain
security export -t identities -p12 -f pkcs12 \
  -o ~/filadelfias-dist.p12 -P "senha_aqui"

base64 -i ~/filadelfias-dist.p12 | pbcopy
```

Secrets no GitHub:
- `APPLE_CERTIFICATE_BASE64` = p12 em Base64
- `APPLE_CERTIFICATE_PASSWORD` = senha do p12
- `APPLE_PROVISIONING_PROFILE_BASE64` = provisioning profile em Base64
- `APPLE_TEAM_ID` = Team ID do Apple Developer

---

## Task 4: Signing Windows (Microsoft Store)

- [ ] **Criar certificado auto-assinado para testes**

```powershell
$cert = New-SelfSignedCertificate `
  -Subject "CN=Filadelfias" `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -Type CodeSigningCert
Export-PfxCertificate -Cert $cert -FilePath filadelfias-win.pfx -Password (ConvertTo-SecureString "senha" -AsPlainText -Force)
```

- [ ] **Para Microsoft Store: obter certificado EV**

Para publicação na Microsoft Store, um certificado EV (Extended Validation) é necessário. Comprar de: DigiCert, Sectigo, GlobalSign (custo ~$300/ano).

Secrets no GitHub:
- `WINDOWS_CERTIFICATE_BASE64` = pfx em Base64
- `WINDOWS_CERTIFICATE_PASSWORD` = senha

---

## Task 5: macOS Notarization

- [ ] **Configurar notarização no tauri.conf.json**

```json
"bundle": {
  "macOS": {
    "signingIdentity": "Developer ID Application: Seu Nome (TEAM_ID)",
    "providerShortName": "TEAM_ID",
    "entitlements": null
  }
}
```

Secrets no GitHub:
- `APPLE_ID` = seu Apple ID (e-mail)
- `APPLE_PASSWORD` = App-Specific Password gerado em appleid.apple.com
- `APPLE_TEAM_ID` = Team ID

---

## Task 6: Workflow de Release

**Files:**
- Create: `.github/workflows/tauri-release.yml`

- [ ] **Criar workflow de release**

```yaml
name: Tauri Release

on:
  push:
    tags:
      - "v*.*.*"

jobs:
  release:
    permissions:
      contents: write
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: macos-latest
            args: "--target aarch64-apple-darwin"
          - platform: macos-latest
            args: "--target x86_64-apple-darwin"
          - platform: ubuntu-22.04
            args: ""
          - platform: windows-latest
            args: ""
    runs-on: ${{ matrix.platform }}

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
        with:
          targets: ${{ matrix.platform == 'macos-latest' && 'aarch64-apple-darwin,x86_64-apple-darwin' || '' }}

      - name: Rust cache
        uses: swatinem/rust-cache@v2
        with:
          workspaces: "apps/tauri/src-tauri -> target"

      - name: Install Linux dependencies
        if: matrix.platform == 'ubuntu-22.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev \
            libappindicator3-dev librsvg2-dev patchelf

      - name: Install frontend deps
        run: npm ci
        working-directory: apps/tauri

      - name: Build and release
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
          TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE_BASE64 }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
          APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: "Filadelfias ${{ github.ref_name }}"
          releaseBody: "Veja as notas de versão."
          releaseDraft: true
          prerelease: false
          projectPath: apps/tauri
          args: ${{ matrix.args }}

  release-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: "17"
          distribution: "temurin"

      - name: Setup Android NDK
        uses: nttld/setup-ndk@v1
        with:
          ndk-version: r26d

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: apps/tauri/package-lock.json

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: aarch64-linux-android,armv7-linux-androideabi,x86_64-linux-android

      - name: Decode keystore
        run: |
          echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > \
            apps/tauri/src-tauri/gen/android/keystore/release.jks

      - name: Install frontend deps
        run: npm ci
        working-directory: apps/tauri

      - name: Build Android APK/AAB
        run: cargo tauri android build --aab
        working-directory: apps/tauri
        env:
          ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
          ANDROID_STORE_PASSWORD: ${{ secrets.ANDROID_STORE_PASSWORD }}
          ANDROID_KEYSTORE_PATH: keystore/release.jks
          NDK_HOME: ${{ env.ANDROID_NDK_HOME }}

      - name: Upload AAB
        uses: actions/upload-artifact@v4
        with:
          name: android-aab
          path: apps/tauri/src-tauri/gen/android/app/build/outputs/bundle/universalRelease/
```

---

## Task 7: Primeiro release — passo a passo

- [ ] **Criar e fazer push de uma tag de versão**

```bash
git tag v0.1.0
git push origin v0.1.0
```

Esperado: workflow `tauri-release.yml` inicia automaticamente.

- [ ] **Verificar artefatos gerados no GitHub Release (Draft)**

Deve conter:
- `.dmg` (macOS Intel + ARM)
- `.exe` / `.msi` (Windows)
- `.AppImage` / `.deb` (Linux)
- `latest.json` (Tauri Updater manifest)

- [ ] **Publicar o draft do release**

No GitHub → Releases → editar draft → "Publish release"

---

## Task 8: Submissão ao Google Play

- [ ] **Criar aplicativo no Google Play Console**

1. Acessar https://play.google.com/console
2. "Criar app" → preencher nome, categoria, tipo (app)
3. Preencher ficha da loja (descrição, capturas de tela, ícone 512x512)

- [ ] **Upload do AAB para internal testing**

1. Em "Versões" → "Internal testing" → "Criar nova versão"
2. Fazer upload do `.aab` gerado pelo workflow
3. Adicionar testadores (e-mail)

- [ ] **Fluxo de aprovação para produção**

Após aprovação interna:
1. Promover para "Closed testing" (beta)
2. Aguardar feedback
3. Promover para "Production"

Prazo típico de revisão inicial: 3–7 dias úteis.

---

## Task 9: Submissão à App Store (iOS)

**Pré-requisito:** Conta Apple Developer ativa e app criado no App Store Connect.

- [ ] **Criar app no App Store Connect**

1. Acessar https://appstoreconnect.apple.com
2. "Apps" → "+" → preencher Bundle ID `com.filadelfias.app`, nome, idioma
3. Preencher metadados: descrição, palavras-chave, capturas de tela

- [ ] **Submeter via Xcode ou Transporter**

```bash
# Com Xcode instalado:
cargo tauri ios build --release
# Abrir Xcode, selecionar "Any iOS Device (arm64)", Product → Archive → Distribute App → App Store Connect
```

- [ ] **Preencher dados de revisão da Apple**

- URL de privacidade (obrigatória)
- Contato de revisão
- Informações de login para testadores (criar conta de teste)

Prazo típico: 1–3 dias úteis.

---

## Task 10: Submissão à Microsoft Store

- [ ] **Criar app no Partner Center**

1. Acessar https://partner.microsoft.com/dashboard
2. "New product" → "App" → reservar nome "Filadelfias"
3. Preencher ficha: descrição, capturas de tela, classificação etária

- [ ] **Upload do instalador MSIX**

```bash
# Gerar MSIX (precisa de certificado EV para submissão à Store)
cargo tauri build --bundles msix
```

Upload do `.msix` em "Packages" no Partner Center.

Prazo típico: 3–5 dias úteis.

---

## Task 11: Configurar auto-update no app

- [ ] **Verificar atualização no startup**

Em `App.tsx`, adicionar:
```typescript
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { toast } from "sonner";

useEffect(() => {
  async function checkUpdate() {
    try {
      const update = await check();
      if (update?.available) {
        toast.info(`Nova versão ${update.version} disponível`, {
          action: {
            label: "Atualizar",
            onClick: async () => {
              await update.downloadAndInstall();
              await relaunch();
            },
          },
          duration: 10000,
        });
      }
    } catch {
      // silencioso — não interrompe o uso
    }
  }
  checkUpdate();
}, []);
```

- [ ] **Instalar plugin process**

```bash
npm install @tauri-apps/plugin-process
```

Em `Cargo.toml`:
```toml
tauri-plugin-process = "2"
```

Em `lib.rs`:
```rust
.plugin(tauri_plugin_process::init())
```

Em `capabilities/default.json`:
```json
"process:default"
```

- [ ] **Commit final**

```bash
git add .
git commit -m "feat(tauri): configure signing, release pipeline and auto-update"
```

---

## Checklist de Conclusão da Fase 10

- [ ] Tag `v0.1.0` gera GitHub Release com artefatos de todos os targets
- [ ] AAB Android assinado com keystore de produção
- [ ] Instaladores macOS notarizados pela Apple
- [ ] `latest.json` publicado no GitHub Release para auto-update
- [ ] App disponível no Google Play Internal Testing
- [ ] App submetido para revisão na App Store
- [ ] App submetido para revisão na Microsoft Store
- [ ] Auto-update funciona: nova tag → usuário recebe notificação

---

## Resumo do Projeto Concluído

Com a Fase 10 finalizada, o Filadelfias está disponível em:

| Plataforma | Distribuição | Status |
|-----------|--------------|--------|
| Android | Google Play | Publicado |
| iOS | App Store | Publicado |
| Windows | Microsoft Store + GitHub | Publicado |
| macOS | GitHub Releases | Publicado |
| Linux | GitHub Releases (.AppImage) | Publicado |

**Atualizações futuras:** apenas criar uma nova tag `vX.Y.Z` e o pipeline cuida do resto.
