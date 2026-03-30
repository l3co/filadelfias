# Filadelfias Desktop and Mobile Shell

Aplicacao Tauri 2 com React, TypeScript e Vite para desktop, com alvo Android inicializado.

## Requisitos

- Node.js 20+
- npm
- Rust com `cargo`
- Xcode para fluxo iOS/macOS nativo
- Android SDK/NDK para build Android

## Setup

No diretorio do app:

```bash
cd apps/tauri
npm ci
```

O frontend usa estas variaveis:

- desenvolvimento: `VITE_API_URL=http://localhost:8000`
- producao: `VITE_API_URL=https://api.filadelfias.com`

Arquivos usados:

- [`.env`](/Users/leco/Documents/filadelfias/apps/tauri/.env)
- [`.env.production`](/Users/leco/Documents/filadelfias/apps/tauri/.env.production)

## Como executar

Frontend puro:

```bash
cd apps/tauri
npm run dev
```

App Tauri desktop:

```bash
cd apps/tauri
npm run tauri dev
```

Build web local:

```bash
cd apps/tauri
npm run build
```

## Build desktop

Validacao Rust:

```bash
cd apps/tauri/src-tauri
cargo check
```

Build desktop empacotado:

```bash
cd apps/tauri
npm run tauri build
```

## Android

O projeto Android ja foi inicializado em:

- [`src-tauri/gen/android`](/Users/leco/Documents/filadelfias/apps/tauri/src-tauri/gen/android)

Nesta maquina, o ambiente Android validado foi:

```bash
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export ANDROID_SDK_ROOT=/opt/homebrew/share/android-commandlinetools
export NDK_HOME=/opt/homebrew/share/android-commandlinetools/ndk/27.1.12297006
```

Se os targets Rust Android ainda nao estiverem instalados:

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

Build debug de APK para arm64:

```bash
cd apps/tauri
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools \
ANDROID_SDK_ROOT=/opt/homebrew/share/android-commandlinetools \
NDK_HOME=/opt/homebrew/share/android-commandlinetools/ndk/27.1.12297006 \
cargo tauri android build --debug --apk --target aarch64 --ci
```

Artefato validado:

- [`app-universal-debug.apk`](/Users/leco/Documents/filadelfias/apps/tauri/src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk)

Build de release Android:

```bash
cd apps/tauri
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools \
ANDROID_SDK_ROOT=/opt/homebrew/share/android-commandlinetools \
NDK_HOME=/opt/homebrew/share/android-commandlinetools/ndk/27.1.12297006 \
cargo tauri android build --aab --target aarch64 --ci
```

Build assinado validado localmente:

```bash
cd apps/tauri
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools \
ANDROID_SDK_ROOT=/opt/homebrew/share/android-commandlinetools \
NDK_HOME=/opt/homebrew/share/android-commandlinetools/ndk/27.1.12297006 \
ANDROID_KEYSTORE_PATH=/Users/leco/Documents/filadelfias/apps/tauri/src-tauri/gen/android/keystore/release.jks \
ANDROID_KEY_ALIAS=seu_alias \
ANDROID_KEY_PASSWORD='sua_senha_do_alias' \
ANDROID_STORE_PASSWORD='sua_senha_da_keystore' \
cargo tauri android build --aab --target aarch64 --ci
```

O signing de release do Android e lido por variaveis de ambiente em [`build.gradle.kts`](/Users/leco/Documents/filadelfias/apps/tauri/src-tauri/gen/android/app/build.gradle.kts):

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `ANDROID_STORE_PASSWORD`
- `ANDROID_KEYSTORE_PATH`

## Release e updater

O updater e o workflow de release estao documentados em:

- [`RELEASING.md`](/Users/leco/Documents/filadelfias/apps/tauri/RELEASING.md)
- [`tauri-release.yml`](/Users/leco/Documents/filadelfias/.github/workflows/tauri-release.yml)

Bundle/package identifier atual:

- `com.filadelfias`

## Comandos uteis

Se a porta `5173` estiver ocupada:

```bash
lsof -ti :5173 | xargs -r kill
```

Se quiser revalidar desktop rapidamente:

```bash
cd apps/tauri/src-tauri
cargo check

cd /Users/leco/Documents/filadelfias/apps/tauri
npm run build
```
