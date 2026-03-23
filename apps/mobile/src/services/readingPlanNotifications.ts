import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';

const REMINDER_KEY = 'reading_plan_daily_reminder';

type ReminderPayload = {
    planId: string;
    planName: string;
    hour: number;
    minute: number;
    notificationId: string;
};

export const readingPlanNotifications = {
    configure: () => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    },

    requestPermission: async (): Promise<boolean> => {
        const settings = await Notifications.getPermissionsAsync();
        if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
            return true;
        }

        const requested = await Notifications.requestPermissionsAsync();
        return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    },

    scheduleDailyReminder: async (planId: string, planName: string, hour: number = 7, minute: number = 0) => {
        const allowed = await readingPlanNotifications.requestPermission();
        if (!allowed) {
            throw new Error('notification-permission-denied');
        }

        await readingPlanNotifications.cancelReminder();

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Plano de leitura',
                body: `Hora de continuar o plano "${planName}".`,
                data: { planId },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
        });

        const payload: ReminderPayload = {
            planId,
            planName,
            hour,
            minute,
            notificationId,
        };
        await SecureStore.setItemAsync(REMINDER_KEY, JSON.stringify(payload));
        return payload;
    },

    cancelReminder: async () => {
        const current = await SecureStore.getItemAsync(REMINDER_KEY);
        if (current) {
            const parsed = JSON.parse(current) as ReminderPayload;
            await Notifications.cancelScheduledNotificationAsync(parsed.notificationId);
            await SecureStore.deleteItemAsync(REMINDER_KEY);
        }
    },

    getReminder: async (): Promise<ReminderPayload | null> => {
        const raw = await SecureStore.getItemAsync(REMINDER_KEY);
        return raw ? (JSON.parse(raw) as ReminderPayload) : null;
    },
};
