import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';

interface HeaderProps {
    title?: string;
    showBack?: boolean;
    showProfile?: boolean;
    showNotifications?: boolean;
    rightAction?: React.ReactNode;
}

export function Header({
    title,
    showBack,
    showProfile,
    showNotifications,
    rightAction
}: HeaderProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();

    return (
        <View
            className="bg-white border-b border-slate-100 px-4"
            style={{ paddingTop: insets.top }}
        >
            <View className="flex-row items-center justify-between h-14">
                {/* Left */}
                <View className="flex-row items-center">
                    {showBack && (
                        <Pressable
                            onPress={() => router.back()}
                            className="mr-3 -ml-2 p-2"
                        >
                            <ChevronLeft size={24} color={colors.slate[600]} />
                        </Pressable>
                    )}
                    {title && (
                        <Text className="text-lg font-semibold text-slate-900">{title}</Text>
                    )}
                </View>

                {/* Right */}
                <View className="flex-row items-center gap-2">
                    {showNotifications && (
                        <Pressable className="p-2 relative">
                            <Bell size={22} color={colors.slate[600]} />
                            <View className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500" />
                        </Pressable>
                    )}
                    {showProfile && (
                        <Pressable onPress={() => router.push('/profile')}>
                            <Avatar name={user?.name} size="sm" />
                        </Pressable>
                    )}
                    {rightAction}
                </View>
            </View>
        </View>
    );
}
