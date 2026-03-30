# Releasing Filadelfias Tauri

## Updater

- Private key path: `~/.tauri/filadelfias.key`
- Public key path: `~/.tauri/filadelfias.key.pub`
- Public key is already configured in `/Users/leco/Documents/filadelfias/apps/tauri/src-tauri/tauri.conf.json`

GitHub secrets still required:

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

Suggested commands:

```bash
cat ~/.tauri/filadelfias.key
git tag v0.1.0
git push origin v0.1.0
```

## Secrets Checklist

GitHub Actions still needs these secrets to complete the release flow end-to-end:

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `ANDROID_STORE_PASSWORD`
- `APPLE_CERTIFICATE_BASE64`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_ID`
- `APPLE_PASSWORD`
- `APPLE_TEAM_ID`
- `WINDOWS_CERTIFICATE_BASE64`
- `WINDOWS_CERTIFICATE_PASSWORD`

## Desktop Release Workflow

The workflow at `/Users/leco/Documents/filadelfias/.github/workflows/tauri-release.yml` builds desktop bundles for:

- macOS Apple Silicon
- macOS Intel
- Linux
- Windows

It publishes a draft GitHub Release and lets `tauri-action` generate updater artifacts, including `latest.json`.

The same workflow now also has an Android job that:

- restores `release.jks` from `ANDROID_KEYSTORE_BASE64`
- exports the signing env vars expected by Gradle
- builds a signed `.aab`
- uploads the bundle as a GitHub Actions artifact

## Pending Manual Setup

- Add Apple signing and notarization secrets before shipping signed macOS builds.
- Add Windows signing secrets before shipping signed Windows builds.

## Android

Android init is already done in this workspace at `/Users/leco/Documents/filadelfias/apps/tauri/src-tauri/gen/android`.

Current bundle/package identifier:

- `com.filadelfias`

Release signing in `/Users/leco/Documents/filadelfias/apps/tauri/src-tauri/gen/android/app/build.gradle.kts` now reads:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `ANDROID_STORE_PASSWORD`
- `ANDROID_KEYSTORE_PATH`

### Local signed AAB validation

A local validation keystore was generated at:

- `/Users/leco/Documents/filadelfias/apps/tauri/src-tauri/gen/android/keystore/release.jks`

Important:

- this file is ignored by git
- it was used only to validate the release signing flow locally
- for production, generate or import the real Play Console keystore and update the GitHub secrets with its values

Suggested local environment for this machine:

```bash
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export ANDROID_SDK_ROOT=/opt/homebrew/share/android-commandlinetools
export NDK_HOME=/opt/homebrew/share/android-commandlinetools/ndk/27.1.12297006
```

Suggested release build commands:

```bash
cargo tauri android build --debug --apk
cargo tauri android build --aab
```

Signed local validation command used successfully on this machine:

```bash
cd /Users/leco/Documents/filadelfias/apps/tauri
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools \
ANDROID_SDK_ROOT=/opt/homebrew/share/android-commandlinetools \
NDK_HOME=/opt/homebrew/share/android-commandlinetools/ndk/27.1.12297006 \
ANDROID_KEYSTORE_PATH=/Users/leco/Documents/filadelfias/apps/tauri/src-tauri/gen/android/keystore/release.jks \
ANDROID_KEY_ALIAS=seu_alias \
ANDROID_KEY_PASSWORD='sua_senha_do_alias' \
ANDROID_STORE_PASSWORD='sua_senha_da_keystore' \
cargo tauri android build --aab --target aarch64 --ci
```

Generated artifact:

- `/Users/leco/Documents/filadelfias/apps/tauri/src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab`

The repository already ignores `.jks` files, so `apps/tauri/src-tauri/gen/android/keystore/release.jks` is safe from accidental commit as long as the existing `.gitignore` rules are preserved.
