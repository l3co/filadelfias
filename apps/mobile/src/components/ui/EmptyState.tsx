import { View, Text } from 'react-native';
import { LucideIcon, Inbox } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action
}: EmptyStateProps) {
    return (
        <View className="flex-1 items-center justify-center px-8 py-12">
            <View className="h-16 w-16 rounded-2xl bg-slate-100 items-center justify-center mb-4">
                <Icon size={32} color={colors.slate[400]} />
            </View>
            <Text className="text-lg font-semibold text-slate-700 text-center">{title}</Text>
            {description && (
                <Text className="text-sm text-slate-500 text-center mt-2">{description}</Text>
            )}
            {action && <View className="mt-4">{action}</View>}
        </View>
    );
}
