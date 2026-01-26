import { View, ActivityIndicator, Text } from 'react-native';
import { colors } from '@/constants/colors';

interface LoadingScreenProps {
    message?: string;
}

export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator size="large" color={colors.primary[600]} />
            <Text className="mt-4 text-slate-500">{message}</Text>
        </View>
    );
}
