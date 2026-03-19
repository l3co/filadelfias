# 🚀 Fase 8: Build e Deploy

## Objetivo
Configurar builds de produção e publicar nas lojas (App Store e Google Play).

---

## Pré-requisitos

### Contas Necessárias
- [ ] **Apple Developer Account** ($99/ano) - [developer.apple.com](https://developer.apple.com)
- [ ] **Google Play Console** ($25 único) - [play.google.com/console](https://play.google.com/console)
- [ ] **Expo Account** (grátis) - [expo.dev](https://expo.dev)

### Certificados e Chaves
- [ ] **iOS**: Certificados de distribuição e provisioning profiles
- [ ] **Android**: Keystore para assinatura do app

---

## EAS Build (Expo Application Services)

### Instalação

```bash
npm install -g eas-cli
eas login
```

### Configuração

```bash
# Inicializar EAS no projeto
eas build:configure
```

### eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "resourceClass": "m1-medium"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "seu@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "XXXXXXXXXX"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

---

## Configuração do App

### app.json completo para produção

```json
{
  "expo": {
    "name": "Filadélfias",
    "slug": "filadelfias",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#059669"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.filadelfias.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "Usado para foto de perfil",
        "NSPhotoLibraryUsageDescription": "Usado para selecionar foto de perfil",
        "UIBackgroundModes": ["fetch", "remote-notification"]
      },
      "config": {
        "usesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#059669"
      },
      "package": "com.filadelfias.app",
      "versionCode": 1,
      "permissions": [
        "INTERNET",
        "VIBRATE",
        "RECEIVE_BOOT_COMPLETED"
      ],
      "googleServicesFile": "./google-services.json"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#059669"
        }
      ],
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#059669",
          "image": "./assets/splash-icon.png",
          "imageWidth": 200
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "scheme": "filadelfias",
    "extra": {
      "eas": {
        "projectId": "seu-project-id-do-expo"
      }
    },
    "owner": "seu-username-expo"
  }
}
```

---

## Assets Necessários

### Ícones e Imagens

| Asset | Tamanho | Formato | Descrição |
|-------|---------|---------|-----------|
| `icon.png` | 1024x1024 | PNG | Ícone principal do app |
| `adaptive-icon.png` | 1024x1024 | PNG | Foreground do ícone Android |
| `splash.png` | 1284x2778 | PNG | Splash screen |
| `splash-icon.png` | 200x200 | PNG | Logo na splash |
| `notification-icon.png` | 96x96 | PNG | Ícone de notificação (Android) |
| `favicon.png` | 48x48 | PNG | Favicon web |

### Diretrizes de Ícone
- Fundo com gradiente emerald (#059669 → #047857)
- Logo branco centralizado
- Bordas arredondadas (iOS) ou adaptive (Android)

---

## Builds

### Build de Desenvolvimento

```bash
# iOS Simulator
eas build --profile development --platform ios

# Android APK
eas build --profile development --platform android
```

### Build de Preview (TestFlight / Internal Testing)

```bash
# iOS (TestFlight)
eas build --profile preview --platform ios

# Android (APK para teste interno)
eas build --profile preview --platform android
```

### Build de Produção

```bash
# iOS (App Store)
eas build --profile production --platform ios

# Android (Google Play)
eas build --profile production --platform android

# Ambas plataformas
eas build --profile production --platform all
```

---

## Submit para as Lojas

### iOS - App Store

```bash
# Submit automático via EAS
eas submit --platform ios

# Ou manual:
# 1. Baixar .ipa do EAS
# 2. Usar Transporter app (macOS)
# 3. Fazer upload para App Store Connect
```

### Android - Google Play

```bash
# Submit automático via EAS
eas submit --platform android

# Ou manual:
# 1. Baixar .aab do EAS
# 2. Upload no Google Play Console
```

---

## Informações para as Lojas

### App Store (iOS)

```yaml
Nome: Filadélfias
Subtítulo: Gestão de Igreja Presbiteriana
Categoria Primária: Estilo de Vida
Categoria Secundária: Referência

Palavras-chave: igreja, presbiteriana, bíblia, hinário, cristão, evangélico, IPB

Descrição:
  Filadélfias é o aplicativo oficial para membros e líderes de igrejas presbiterianas. 
  Acesse a Bíblia Sagrada, o Hinário Novo Cântico e o Manual da Igreja Presbiteriana 
  do Brasil, tudo em um só lugar.

  RECURSOS:
  📖 Bíblia Sagrada em múltiplas versões (NVI, ACF, AA)
  🎵 Hinário Novo Cântico completo
  📚 Manual da Igreja Presbiteriana do Brasil 2019
  📴 Leitura offline - baixe para ler sem internet
  💒 Portal do Membro com acesso a eventos, devocionais e mais
  🙏 Pedidos de oração da comunidade
  📅 Agenda de eventos da igreja

  Para administradores de igreja:
  👥 Gestão completa de membros
  💰 Controle financeiro (tesouraria)
  📊 EBD - Escola Bíblica Dominical
  ⚙️ Configurações da igreja

Classificação: 4+ (sem conteúdo censurável)

Política de Privacidade: https://filadelfias.com/privacidade
Suporte: suporte@filadelfias.com
```

### Google Play (Android)

```yaml
Título: Filadélfias - Igreja Presbiteriana
Descrição curta: Bíblia, Hinário e Manual IPB para sua igreja

Categoria: Estilo de Vida
Classificação: Todos

Descrição completa: (mesma do iOS)

Gráficos:
  - Ícone: 512x512 PNG
  - Feature graphic: 1024x500 PNG
  - Screenshots: 
    - Phone: 1080x1920 ou 1080x2340
    - Tablet 7": 1200x1920
    - Tablet 10": 1600x2560

Conteúdo:
  - Não contém anúncios
  - Contém compras no app: Não
  - Classificação de conteúdo: Todos
```

---

## CI/CD com GitHub Actions

```yaml
# .github/workflows/eas-build.yml
name: EAS Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
          cache-dependency-path: apps/mobile/package-lock.json
      
      - name: Install dependencies
        working-directory: apps/mobile
        run: npm ci
      
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Build iOS
        working-directory: apps/mobile
        run: eas build --platform ios --profile production --non-interactive
      
      - name: Build Android
        working-directory: apps/mobile
        run: eas build --platform android --profile production --non-interactive

  submit:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Submit to stores
        working-directory: apps/mobile
        run: |
          eas submit --platform ios --non-interactive
          eas submit --platform android --non-interactive
```

---

## Versionamento

### Padrão Semântico
- `1.0.0` - Release inicial
- `1.0.1` - Bug fixes
- `1.1.0` - Novas features menores
- `2.0.0` - Breaking changes

### Incrementar Versão

```bash
# package.json e app.json
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.1 → 1.1.0
npm version major  # 1.1.0 → 2.0.0
```

### Build Number
- iOS: Incrementar `buildNumber` a cada submit
- Android: Incrementar `versionCode` a cada submit

---

## Checklist de Release

### Antes do Build
- [ ] Versão atualizada em app.json e package.json
- [ ] Changelog atualizado
- [ ] Testes passando
- [ ] Assets finais (ícones, splash)
- [ ] Variáveis de ambiente de produção

### Após Build
- [ ] Testar build em dispositivo real
- [ ] Verificar deep links
- [ ] Verificar notificações push
- [ ] Verificar funcionalidade offline
- [ ] Testar em múltiplos dispositivos

### Após Submit
- [ ] Preencher informações na loja
- [ ] Fazer upload de screenshots
- [ ] Responder review questions
- [ ] Aguardar aprovação
- [ ] Anunciar lançamento

---

## Monitoramento Pós-Release

### Ferramentas Recomendadas
- **Sentry** - Crash reporting
- **Firebase Analytics** - Métricas de uso
- **Expo Updates** - OTA updates

### Métricas Importantes
- Crash-free rate (>99%)
- App rating (>4.5)
- Daily Active Users (DAU)
- Retention (D1, D7, D30)

---

## Updates OTA (Over-The-Air)

```bash
# Instalar expo-updates
npx expo install expo-updates

# Publicar update
eas update --branch production --message "Fix: bug na navegação"
```

Updates OTA permitem correções rápidas sem passar pela review das lojas.

---

## Próximos Passos

1. → [12-API-MAPPING.md](./12-API-MAPPING.md) - Mapeamento completo de APIs
