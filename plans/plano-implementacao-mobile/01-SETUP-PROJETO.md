# 📦 Fase 1: Setup do Projeto

## Criação do Projeto

```bash
# Navegar para a pasta apps do monorepo
cd /Users/leco/Documents/filadelfias/apps

# Criar projeto Expo com TypeScript
npx create-expo-app@latest mobile --template expo-template-blank-typescript

# Entrar na pasta
cd mobile
```

---

## Dependências Principais

### Navegação
```bash
npx expo install expo-router expo-linking expo-constants expo-status-bar
```

### UI e Estilos
```bash
# NativeWind (TailwindCSS para React Native)
npm install nativewind tailwindcss
npx tailwindcss init

# Ícones (mesmos da web)
npm install lucide-react-native react-native-svg
npx expo install react-native-svg
```

### Estado e Data Fetching
```bash
npm install @tanstack/react-query axios zustand
```

### Formulários
```bash
npm install react-hook-form @hookform/resolvers zod
```

### Storage e Offline
```bash
npx expo install expo-sqlite expo-file-system
npm install react-native-mmkv
npx expo install expo-secure-store
```

### Utilidades
```bash
npx expo install expo-haptics expo-splash-screen
npm install date-fns clsx
```

---

## Configuração do NativeWind

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Cores do Filadélfias (mesmo da web)
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        emerald: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        teal: {
          500: '#14b8a6',
          600: '#0d9488',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### babel.config.js
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

### metro.config.js
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

### global.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### nativewind-env.d.ts
```typescript
/// <reference types="nativewind/types" />
```

---

## Estrutura de Pastas

```
apps/mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout
│   ├── index.tsx                 # Splash/redirect
│   ├── (public)/                 # Área pública (sem auth)
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Home/Welcome
│   │   ├── bible/
│   │   │   ├── index.tsx         # Lista de livros
│   │   │   └── [book]/[chapter].tsx
│   │   ├── hymnal/
│   │   │   ├── index.tsx
│   │   │   └── [number].tsx
│   │   └── manual/
│   │       ├── index.tsx
│   │       └── [articleId].tsx
│   ├── (auth)/                   # Telas de autenticação
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── (member)/                 # Portal do membro
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Dashboard
│   │   ├── devotionals.tsx
│   │   ├── directory.tsx
│   │   ├── events.tsx
│   │   ├── missions.tsx
│   │   ├── ebd.tsx
│   │   ├── prayer.tsx
│   │   └── profile.tsx
│   └── (admin)/                  # Área administrativa
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── members.tsx
│       ├── governance.tsx
│       ├── financial.tsx
│       ├── missions.tsx
│       ├── ebd/
│       │   ├── index.tsx
│       │   └── [classId].tsx
│       ├── events.tsx
│       ├── devotionals.tsx
│       └── settings.tsx
├── src/
│   ├── components/               # Componentes reutilizáveis
│   │   ├── ui/                   # Componentes base (Button, Card, etc)
│   │   ├── layout/               # Layouts compartilhados
│   │   └── features/             # Componentes de features
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useBible.ts
│   │   └── useOfflineStorage.ts
│   ├── services/                 # API services (copiar da web)
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── bible.ts
│   │   ├── hymnal.ts
│   │   ├── manual.ts
│   │   └── ...
│   ├── stores/                   # Zustand stores
│   │   ├── authStore.ts
│   │   └── offlineStore.ts
│   ├── lib/                      # Utilitários
│   │   ├── storage.ts            # MMKV wrapper
│   │   ├── secureStorage.ts      # SecureStore wrapper
│   │   └── database.ts           # SQLite helpers
│   ├── types/                    # TypeScript types (copiar da web)
│   └── constants/                # Constantes
│       ├── colors.ts
│       └── config.ts
├── assets/                       # Imagens, fontes
├── global.css                    # TailwindCSS
├── app.json                      # Expo config
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── babel.config.js
```

---

## app.json Configuração

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
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#059669"
      },
      "package": "com.filadelfias.app",
      "versionCode": 1
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
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
    "scheme": "filadelfias"
  }
}
```

---

## Variáveis de Ambiente

### .env
```bash
EXPO_PUBLIC_API_URL=https://api.filadelfias.com
```

### src/constants/config.ts
```typescript
export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
  appName: 'Filadélfias',
  version: '1.0.0',
};
```

---

## Comandos de Desenvolvimento

```bash
# Iniciar desenvolvimento
npx expo start

# Rodar no iOS Simulator
npx expo run:ios

# Rodar no Android Emulator
npx expo run:android

# Build de desenvolvimento
npx expo prebuild

# Lint
npm run lint

# TypeCheck
npx tsc --noEmit
```

---

## Próximos Passos

Após setup concluído:
1. → [02-ARQUITETURA.md](./02-ARQUITETURA.md) - Padrões de código
2. → [03-DESIGN-SYSTEM.md](./03-DESIGN-SYSTEM.md) - Componentes UI
