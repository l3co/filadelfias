import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';
import { COMMON_STYLES } from '@/constants/theme';

type HeaderVariant = 'default' | 'transparent' | 'gradient';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    showProfile?: boolean;
    showNotifications?: boolean;
    rightAction?: React.ReactNode;
    variant?: HeaderVariant;
    large?: boolean;
}

export function Header({
    title,
    subtitle,
    showBack,
    showProfile,
    showNotifications,
    rightAction,
    variant = 'default',
    large = false,
}: HeaderProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();

    const isGradient = variant === 'gradient';
    const isTransparent = variant === 'transparent';

    const textColor = isGradient ? '#ffffff' : colors.slate[900];
    const iconColor = isGradient ? '#ffffff' : colors.slate[600];
    const subtitleColor = isGradient ? 'rgba(255,255,255,0.8)' : colors.slate[500];

    const containerStyle = {
        paddingTop: insets.top,
    };

    const content = (
        <View style={{ paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: large ? 'auto' : 56, paddingVertical: large ? 16 : 0 }}>
                {/* Left */}
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {showBack && (
                        <Pressable
                            onPress={() => router.back()}
                            accessibilityLabel="Voltar"
                            accessibilityRole="button"
                            style={{ marginRight: 12, marginLeft: -8, padding: 8 }}
                        >
                            <ChevronLeft size={24} color={iconColor} />
                        </Pressable>
                    )}
                    <View style={{ flex: 1 }}>
                        {title && (
                            <Text style={{ 
                                fontSize: large ? 28 : 18, 
                                fontWeight: large ? '700' : '600', 
                                color: textColor,
                                letterSpacing: large ? -0.5 : 0,
                            }}>
                                {title}
                            </Text>
                        )}
                        {subtitle && (
                            <Text style={{ color: subtitleColor, marginTop: 4 }}>
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Right */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {showNotifications && (
                        <Pressable 
                            accessibilityLabel="Notificações"
                            accessibilityRole="button"
                            style={{ padding: 8, position: 'relative' }}
                        >
                            <Bell size={22} color={iconColor} />
                            <View style={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8, 
                                height: 8, 
                                width: 8, 
                                borderRadius: 4, 
                                backgroundColor: '#10b981' 
                            }} />
                        </Pressable>
                    )}
                    {showProfile && (
                        <Pressable 
                            onPress={() => router.push('/(member)/profile')}
                            accessibilityLabel="Meu perfil"
                            accessibilityRole="button"
                        >
                            <Avatar name={user?.name} size="sm" />
                        </Pressable>
                    )}
                    {rightAction}
                </View>
            </View>
        </View>
    );

    if (isGradient) {
        return (
            <LinearGradient
                colors={COMMON_STYLES.headerGradient}
                style={containerStyle}
            >
                {content}
            </LinearGradient>
        );
    }

    return (
        <View
            style={[
                containerStyle,
                !isTransparent && { 
                    backgroundColor: '#ffffff', 
                    borderBottomWidth: 1, 
                    borderBottomColor: '#f1f5f9' 
                },
            ]}
        >
            {content}
        </View>
    );
}
