# 🔔 Fase 6: Push Notifications

## Objetivo
Implementar notificações push para manter membros engajados com eventos, devocionais e pedidos de oração.

---

## Setup

### Dependências

```bash
npx expo install expo-notifications expo-device expo-constants
```

### Configuração do app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#059669",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

---

## Serviço de Notificações

```typescript
// src/services/notificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from './api';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  /**
   * Registrar dispositivo para push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications não funcionam no simulador');
      return null;
    }

    // Verificar permissões
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão para notificações negada');
      return null;
    }

    // Configuração específica do Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Filadélfias',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#059669',
      });
    }

    // Obter token Expo Push
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'seu-project-id', // Do app.json ou EAS
    });

    return token.data;
  },

  /**
   * Registrar token no backend
   */
  async registerTokenOnServer(pushToken: string, userId: string): Promise<void> {
    try {
      await api.post('/notifications/register', {
        push_token: pushToken,
        user_id: userId,
        platform: Platform.OS,
        device_name: Device.deviceName,
      });
    } catch (error) {
      console.error('Erro ao registrar token:', error);
    }
  },

  /**
   * Remover registro ao fazer logout
   */
  async unregisterToken(pushToken: string): Promise<void> {
    try {
      await api.delete('/notifications/unregister', {
        data: { push_token: pushToken },
      });
    } catch (error) {
      console.error('Erro ao remover token:', error);
    }
  },

  /**
   * Agendar notificação local
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: object,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: trigger || null, // null = imediato
    });
  },

  /**
   * Cancelar notificação agendada
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  /**
   * Limpar todas as notificações
   */
  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  },

  /**
   * Obter badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  },

  /**
   * Setar badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  },
};
```

---

## Hook de Notificações

```typescript
// src/hooks/useNotifications.ts
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { notificationService } from '@/services/notificationService';
import { useAuthStore } from '@/stores/authStore';

export function useNotifications() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Registrar para push notifications
    notificationService.registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token);
        
        // Se usuário logado, registrar no servidor
        if (isAuthenticated && user?.id) {
          notificationService.registerTokenOnServer(token, user.id);
        }
      }
    });

    // Listener para notificações recebidas (app em foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notificação recebida:', notification);
        // Aqui você pode atualizar estado local, mostrar toast, etc.
      }
    );

    // Listener para quando usuário toca na notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        handleNotificationNavigation(data);
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated, user?.id]);

  // Registrar token quando usuário logar
  useEffect(() => {
    if (isAuthenticated && user?.id && expoPushToken) {
      notificationService.registerTokenOnServer(expoPushToken, user.id);
    }
  }, [isAuthenticated, user?.id, expoPushToken]);

  const handleNotificationNavigation = (data: any) => {
    if (!data?.type) return;

    switch (data.type) {
      case 'devotional':
        router.push(`/(member)/devotionals/${data.devotionalId}`);
        break;
      case 'event':
        router.push(`/(member)/events/${data.eventId}`);
        break;
      case 'prayer_request':
        router.push('/(member)/prayer');
        break;
      case 'new_member':
        router.push('/(admin)/members');
        break;
      default:
        router.push('/(member)');
    }
  };

  return {
    expoPushToken,
    scheduleNotification: notificationService.scheduleLocalNotification,
    cancelNotification: notificationService.cancelNotification,
    clearAll: notificationService.clearAllNotifications,
  };
}
```

---

## Integração no Root Layout

```tsx
// app/_layout.tsx
import { useNotifications } from '@/hooks/useNotifications';

export default function RootLayout() {
  // Inicializar sistema de notificações
  useNotifications();

  // ... resto do layout
}
```

---

## Backend - Endpoints de Notificação

```python
# apps/backend/src/api/notifications.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class RegisterTokenRequest(BaseModel):
    push_token: str
    user_id: str
    platform: str  # 'ios' or 'android'
    device_name: Optional[str] = None

class UnregisterTokenRequest(BaseModel):
    push_token: str

# Armazenar tokens (em produção, usar banco de dados)
push_tokens_store = {}

@router.post("/register")
async def register_push_token(data: RegisterTokenRequest):
    """Registrar token de push notification."""
    push_tokens_store[data.push_token] = {
        "user_id": data.user_id,
        "platform": data.platform,
        "device_name": data.device_name,
    }
    return {"success": True}

@router.delete("/unregister")
async def unregister_push_token(data: UnregisterTokenRequest):
    """Remover token de push notification."""
    if data.push_token in push_tokens_store:
        del push_tokens_store[data.push_token]
    return {"success": True}

async def send_push_notification(
    push_tokens: list[str],
    title: str,
    body: str,
    data: dict = None
):
    """Enviar notificação via Expo Push Service."""
    messages = [
        {
            "to": token,
            "sound": "default",
            "title": title,
            "body": body,
            "data": data or {},
        }
        for token in push_tokens
    ]

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://exp.host/--/api/v2/push/send",
            json=messages,
            headers={"Content-Type": "application/json"},
        )
        return response.json()

# Exemplo de uso em outros endpoints
async def notify_new_devotional(tenant_id: str, devotional: dict):
    """Notificar membros sobre novo devocional."""
    # Buscar tokens dos membros do tenant
    tokens = [
        token for token, data in push_tokens_store.items()
        # Filtrar por tenant_id se necessário
    ]
    
    if tokens:
        await send_push_notification(
            tokens,
            title="📖 Novo Devocional",
            body=devotional["title"],
            data={"type": "devotional", "devotionalId": devotional["id"]},
        )
```

---

## Tipos de Notificação

| Tipo | Trigger | Mensagem |
|------|---------|----------|
| Novo Devocional | Admin publica | "📖 Novo devocional: {título}" |
| Evento Próximo | 1 dia antes | "📅 Amanhã: {evento}" |
| Pedido de Oração | Novo pedido | "🙏 Novo pedido de oração" |
| Novo Membro (admin) | Convite aceito | "👤 {nome} aceitou o convite" |
| Aniversário | No dia | "🎂 Hoje é aniversário de {nome}!" |

---

## Notificações Locais Agendadas

```typescript
// Exemplo: Lembrete de leitura diária
import * as Notifications from 'expo-notifications';

async function scheduleDailyDevotionalReminder() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📖 Hora da Leitura',
      body: 'Reserve um momento para sua leitura diária',
    },
    trigger: {
      hour: 7,
      minute: 0,
      repeats: true,
    },
  });
}

// Exemplo: Lembrete de evento
async function scheduleEventReminder(event: Event) {
  const eventDate = new Date(event.date);
  const reminderDate = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000); // 1 dia antes

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📅 Evento Amanhã',
      body: event.title,
      data: { type: 'event', eventId: event.id },
    },
    trigger: reminderDate,
  });
}
```

---

## Configurações de Notificação (Preferências do Usuário)

```tsx
// src/components/features/NotificationSettings.tsx
import { View, Text, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    devotionals: true,
    events: true,
    prayerRequests: true,
    dailyReminder: false,
  });

  useEffect(() => {
    const saved = storage.getString('notification_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const updateSetting = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    storage.set('notification_settings', JSON.stringify(newSettings));
  };

  return (
    <View className="bg-white rounded-2xl divide-y divide-slate-50">
      <View className="flex-row items-center justify-between p-4">
        <Text className="text-slate-700">Novos Devocionais</Text>
        <Switch
          value={settings.devotionals}
          onValueChange={(v) => updateSetting('devotionals', v)}
        />
      </View>
      <View className="flex-row items-center justify-between p-4">
        <Text className="text-slate-700">Eventos</Text>
        <Switch
          value={settings.events}
          onValueChange={(v) => updateSetting('events', v)}
        />
      </View>
      <View className="flex-row items-center justify-between p-4">
        <Text className="text-slate-700">Pedidos de Oração</Text>
        <Switch
          value={settings.prayerRequests}
          onValueChange={(v) => updateSetting('prayerRequests', v)}
        />
      </View>
      <View className="flex-row items-center justify-between p-4">
        <Text className="text-slate-700">Lembrete Diário (7h)</Text>
        <Switch
          value={settings.dailyReminder}
          onValueChange={(v) => updateSetting('dailyReminder', v)}
        />
      </View>
    </View>
  );
}
```

---

## Próximos Passos

1. → [10-FASE7-TESTES.md](./10-FASE7-TESTES.md) - Testes e QA
