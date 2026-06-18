#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TAURI_DIR="$SCRIPT_DIR/../apps/tauri"

echo "Filadelfias — Android Dev Build"
echo ""

# Verificar adb disponível
if ! command -v adb &>/dev/null; then
  echo "ERRO: adb não encontrado. Instale o Android SDK Platform-Tools."
  exit 1
fi

# Verificar dispositivo conectado
DEVICES=$(adb devices | grep -E "(device|emulator)" | grep -v "List of" | wc -l | tr -d ' ')
if [ "$DEVICES" -eq 0 ]; then
  echo "ERRO: Nenhum dispositivo Android conectado."
  echo ""
  echo "Para dispositivo físico: conecte via USB com USB Debugging ativado."
  echo "Para emulador: inicie com o Emulator Manager do Android Studio."
  exit 1
fi

echo "Dispositivos detectados:"
adb devices | grep -E "(device|emulator)" | grep -v "List of"
echo ""

# Verificar variáveis de ambiente necessárias
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
  # Tenta localizar SDK padrão do homebrew
  ANDROID_SDK="/opt/homebrew/share/android-commandlinetools"
  if [ -d "$ANDROID_SDK" ]; then
    export ANDROID_HOME="$ANDROID_SDK"
    export ANDROID_SDK_ROOT="$ANDROID_SDK"
  else
    echo "AVISO: ANDROID_HOME não definido. O build pode falhar."
  fi
fi

cd "$TAURI_DIR"

echo "Iniciando tauri android dev..."
echo "API: $(grep VITE_API_URL .env.development 2>/dev/null || echo 'default')"
echo ""

npm run tauri -- android dev --no-watch
