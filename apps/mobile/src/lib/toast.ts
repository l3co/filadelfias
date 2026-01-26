import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const toast = {
    success: (message: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Sucesso', message);
    },

    error: (message: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erro', message);
    },

    info: (message: string) => {
        Alert.alert('Aviso', message);
    },
};
