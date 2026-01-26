import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
    BookOpen, BookMarked, Heart, Users, Calendar,
    Globe, GraduationCap, MessageCircle, Bell
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { HomeCard } from '@/components/ui/HomeCard';
import { Avatar } from '@/components/ui/Avatar';
import { colors } from '@/constants/colors';

export default function MemberHomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();

    const features = [
        { icon: BookOpen, title: 'Bíblia Online', description: 'Leia a Palavra de Deus', href: '/(member)/bible', color: 'blue' as const },
        { icon: BookMarked, title: 'Manual IPB', description: 'Princípios da nossa fé', href: '/(public)/manual', color: 'purple' as const },
        { icon: Heart, title: 'Devocionais', description: 'Reflexões diárias', href: '/(member)/devotionals', color: 'red' as const },
        { icon: Users, title: 'Membros', description: 'Diretório da igreja', href: '/(member)/directory', color: 'emerald' as const },
        { icon: Calendar, title: 'Eventos', description: 'Próximas atividades', href: '/(member)/events', color: 'orange' as const },
        { icon: Globe, title: 'Missões', description: 'Nossos missionários', href: '/(member)/missions', color: 'indigo' as const },
        { icon: GraduationCap, title: 'EBD', description: 'Sua turma e estudos', href: '/(member)/ebd', color: 'yellow' as const },
        { icon: MessageCircle, title: 'Oração', description: 'Pedidos de oração', href: '/(member)/prayer', color: 'pink' as const },
    ];

    // Acrônimo da igreja
    const churchAcronym = tenant?.name
        ?.split(' ')
        .filter(word => word.length > 2 && word[0] === word[0].toUpperCase())
        .map(word => word[0])
        .join('')
        .slice(0, 3) || 'IP';

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header Premium */}
            <LinearGradient
                colors={colors.gradients.primary}
                className="px-4 pb-6 rounded-b-3xl"
                style={{ paddingTop: insets.top + 12 }}
            >
                <View className="flex-row items-center justify-between mb-4">
                    {/* Logo da Igreja */}
                    <View className="flex-row items-center">
                        <View className="h-10 w-10 rounded-xl bg-white/20 items-center justify-center">
                            <Text className="text-white font-bold text-sm">{churchAcronym}</Text>
                        </View>
                        <View className="ml-3">
                            <Text className="text-white/80 text-xs">Portal do Membro</Text>
                            <Text className="text-white font-semibold">{tenant?.name}</Text>
                        </View>
                    </View>

                    {/* Notificações e Avatar */}
                    <View className="flex-row items-center gap-2">
                        <Pressable className="p-2 relative">
                            <Bell size={22} color="white" />
                            <View className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-400" />
                        </Pressable>
                        <Pressable onPress={() => router.push('/(member)/profile')}>
                            <Avatar name={user?.name} size="md" />
                        </Pressable>
                    </View>
                </View>

                {/* Boas-vindas */}
                <View className="mt-2">
                    <Text className="text-white/80 text-sm">Olá,</Text>
                    <Text className="text-white text-2xl font-bold">
                        {user?.name?.split(' ')[0]}! 👋
                    </Text>
                    <Text className="text-white/70 mt-1">
                        O que você gostaria de fazer hoje?
                    </Text>
                </View>
            </LinearGradient>

            {/* Grid de Cards */}
            <ScrollView
                className="flex-1 px-4 -mt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                <View className="flex-row flex-wrap justify-between">
                    {features.map((feature) => (
                        <View key={feature.href} className="w-[48%] mb-3">
                            <HomeCard {...feature} />
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
