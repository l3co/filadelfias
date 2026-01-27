import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
    BookOpen, BookMarked, Heart, Users, Calendar,
    Globe, GraduationCap, MessageCircle, Bell, Music
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';

const FEATURE_COLORS: Record<string, { bg: string; icon: string }> = {
    blue: { bg: '#eff6ff', icon: '#3b82f6' },
    purple: { bg: '#f5f3ff', icon: '#8b5cf6' },
    red: { bg: '#fef2f2', icon: '#ef4444' },
    emerald: { bg: '#ecfdf5', icon: '#10b981' },
    orange: { bg: '#fff7ed', icon: '#f97316' },
    indigo: { bg: '#eef2ff', icon: '#6366f1' },
    yellow: { bg: '#fefce8', icon: '#eab308' },
    pink: { bg: '#fdf2f8', icon: '#ec4899' },
};

export default function MemberHomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, getCurrentTenant } = useAuthStore();
    const tenant = getCurrentTenant();

    const features = [
        { icon: BookOpen, title: 'Bíblia Online', description: 'Leia a Palavra de Deus', href: '/(member)/bible', color: 'blue' },
        { icon: Music, title: 'Hinário', description: 'Novo Cântico', href: '/(member)/hymnal', color: 'purple' },
        { icon: Heart, title: 'Devocionais', description: 'Reflexões diárias', href: '/(member)/devotionals', color: 'red' },
        { icon: BookMarked, title: 'Manual IPB', description: 'Princípios da nossa fé', href: '/(public)/manual', color: 'emerald' },
        { icon: Users, title: 'Membros', description: 'Diretório da igreja', href: '/(member)/directory', color: 'orange' },
        { icon: Calendar, title: 'Eventos', description: 'Próximas atividades', href: '/(member)/events', color: 'indigo' },
        { icon: Globe, title: 'Missões', description: 'Nossos missionários', href: '/(member)/missions', color: 'yellow' },
        { icon: GraduationCap, title: 'EBD', description: 'Sua turma e estudos', href: '/(member)/ebd', color: 'pink' },
        { icon: MessageCircle, title: 'Oração', description: 'Pedidos de oração', href: '/(member)/prayer', color: 'emerald' },
    ];

    const churchAcronym = tenant?.name
        ?.split(' ')
        .filter(word => word.length > 2 && word[0] === word[0].toUpperCase())
        .map(word => word[0])
        .join('')
        .slice(0, 3) || 'IP';

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Header Premium */}
            <LinearGradient
                colors={['#059669', '#10b981']}
                style={{ 
                    paddingHorizontal: 20, 
                    paddingBottom: 32, 
                    paddingTop: insets.top + 16,
                    borderBottomLeftRadius: 24,
                    borderBottomRightRadius: 24,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    {/* Logo da Igreja */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ 
                            height: 44, 
                            width: 44, 
                            borderRadius: 12, 
                            backgroundColor: 'rgba(255,255,255,0.2)', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>{churchAcronym}</Text>
                        </View>
                        <View style={{ marginLeft: 12 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Portal do Membro</Text>
                            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 15 }}>{tenant?.name}</Text>
                        </View>
                    </View>

                    {/* Notificações e Avatar */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Pressable style={{ padding: 8, position: 'relative' }}>
                            <Bell size={22} color="white" />
                            <View style={{ 
                                position: 'absolute', 
                                top: 6, 
                                right: 6, 
                                height: 8, 
                                width: 8, 
                                borderRadius: 4, 
                                backgroundColor: '#fbbf24' 
                            }} />
                        </Pressable>
                        <Pressable onPress={() => router.push('/(member)/profile')}>
                            <Avatar name={user?.name} size="md" />
                        </Pressable>
                    </View>
                </View>

                {/* Boas-vindas */}
                <View>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Olá,</Text>
                    <Text style={{ color: '#ffffff', fontSize: 26, fontWeight: '700' }}>
                        {user?.name?.split(' ')[0]}! 👋
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                        O que você gostaria de fazer hoje?
                    </Text>
                </View>
            </LinearGradient>

            {/* Grid de Cards */}
            <ScrollView
                style={{ flex: 1, marginTop: -16 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {features.map((feature) => {
                        const colors = FEATURE_COLORS[feature.color];
                        const Icon = feature.icon;
                        return (
                            <Pressable
                                key={feature.href}
                                onPress={() => router.push(feature.href as any)}
                                style={{
                                    width: '48%',
                                    backgroundColor: '#ffffff',
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 12,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.04,
                                    shadowRadius: 8,
                                    elevation: 2,
                                }}
                            >
                                <View style={{ 
                                    backgroundColor: colors.bg, 
                                    width: 44, 
                                    height: 44, 
                                    borderRadius: 12, 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    marginBottom: 12,
                                }}>
                                    <Icon size={22} color={colors.icon} />
                                </View>
                                <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a' }}>
                                    {feature.title}
                                </Text>
                                <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                                    {feature.description}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
