#!/bin/bash
# Script para build local de produção Android - Filadélfias
# Uso: ./build-android.sh [--install]

set -e

cd "$(dirname "$0")"

echo "🚀 Filadélfias Android Build"
echo "============================"

# Configurar Java 17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
echo "☕ Java: $JAVA_HOME"

# API de produção
export EXPO_PUBLIC_API_URL="https://filadelfias-api-332378056596.southamerica-east1.run.app"
echo "🌐 API: $EXPO_PUBLIC_API_URL"

# Keystore de produção (EAS credentials)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
KEYSTORE_PATH="$SCRIPT_DIR/credentials/android/keystore.jks"
KEYSTORE_PASSWORD="191b3de8105af07972d24a322594deb0"
KEY_ALIAS="0d6cbd18911b228b44734b55cc85cc09"
KEY_PASSWORD="32510f095e82f204071ebc85fc42f1d2"

if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "❌ Keystore não encontrada: $KEYSTORE_PATH"
    echo "   Execute: eas credentials --platform android"
    echo "   E baixe as credenciais"
    exit 1
fi

echo "🔐 Keystore: $KEYSTORE_PATH"

# Gerar projeto nativo
echo "📦 Gerando projeto nativo..."
npx expo prebuild --platform android --clean

# Build AAB para Google Play Store
echo "🔨 Buildando AAB de release..."
cd android
./gradlew bundleRelease \
    -Pandroid.injected.signing.store.file="$KEYSTORE_PATH" \
    -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \
    -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \
    -Pandroid.injected.signing.key.password="$KEY_PASSWORD"

AAB_PATH="app/build/outputs/bundle/release/app-release.aab"

if [ -f "$AAB_PATH" ]; then
    echo ""
    echo "✅ Build concluído!"
    echo "📁 AAB: $(pwd)/$AAB_PATH"
    echo "📊 Tamanho: $(du -h $AAB_PATH | cut -f1)"
    
    # Instalar APK se --install foi passado
    if [ "$1" == "--install" ]; then
        echo ""
        echo "📱 Gerando APK e instalando..."
        ./gradlew assembleRelease \
            -Pandroid.injected.signing.store.file="$KEYSTORE_PATH" \
            -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \
            -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \
            -Pandroid.injected.signing.key.password="$KEY_PASSWORD"
        
        APK_PATH="app/build/outputs/apk/release/app-release.apk"
        adb install -r "$APK_PATH"
        echo "✅ APK instalado!"
    fi
else
    echo "❌ Erro: AAB não foi gerado"
    exit 1
fi
