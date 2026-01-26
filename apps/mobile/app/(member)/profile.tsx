import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
    User, Mail, LogOut, ChevronRight,
    Lock, Bell, Download
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, logout, getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();

    const handleLogout = () => {
        Alert.alert(
            'Sair da conta',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(public)');
                    }
                },
            ]
        );
    };

    const menuItems = [
        { icon: Lock, label: 'Alterar senha', onPress: () => router.push('/(auth)/change-password') },
        { icon: Bell, label: 'Notificações', onPress: () => { } },
        { icon: Download, label: 'Conteúdo offline', onPress: () => router.push('/(public)/downloads') },
    ];

    return (
        <View className="flex-1 bg-slate-50">
            <Header title="Meu Perfil" showBack />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
                {/* Avatar e Info */}
                <View className="bg-white px-6 py-8 items-center border-b border-slate-100">
                    <Avatar name={user?.name} size="xl" />
                    <Text className="text-xl font-bold text-slate-900 mt-4">{user?.name}</Text>
                    <Text className="text-slate-500">{tenant?.name}</Text>

                    <View className="flex-row items-center mt-4 gap-4">
                        {user?.email && (
                            <View className="flex-row items-center">
                                <Mail size={16} color={colors.slate[400]} />
                                <Text className="text-sm text-slate-500 ml-1">{user.email}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Menu Items */}
                <View className="mt-4 bg-white border-y border-slate-100">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Pressable
                                key={item.label}
                                onPress={item.onPress}
                                className={`flex-row items-center px-6 py-4 ${index > 0 ? 'border-t border-slate-50' : ''}`}
                            >
                                <Icon size={20} color={colors.slate[600]} />
                                <Text className="flex-1 ml-3 text-slate-700">{item.label}</Text>
                                <ChevronRight size={20} color={colors.slate[300]} />
                            </Pressable>
                        );
                    })}
                </View>

                {/* Logout */}
                <Pressable
                    onPress={handleLogout}
                    className="mt-4 mx-4 flex-row items-center justify-center py-4 bg-red-50 rounded-xl"
                >
                    <LogOut size={20} color={colors.error} />
                    <Text className="text-red-600 font-medium ml-2">Sair da conta</Text>
                </Pressable>

                {/* Versão */}
                <Text className="text-center text-xs text-slate-400 mt-8">
                    Filadélfias v1.0.0
                </Text>
            </ScrollView>
        </View>
    );
}
