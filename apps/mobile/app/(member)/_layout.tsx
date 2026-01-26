import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Heart, BookOpen, MessageCircle, User } from 'lucide-react-native';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

export default function MemberLayout() {
    const insets = useSafeAreaInsets();
    
    // Calcula a altura da tab bar considerando a área segura inferior
    const tabBarHeight = 56 + Math.max(insets.bottom, 8);
    const tabBarPaddingBottom = Math.max(insets.bottom, 8);

    return (
        <ProtectedRoute>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#10b981',
                    tabBarInactiveTintColor: '#94a3b8',
                    tabBarStyle: {
                        backgroundColor: '#ffffff',
                        borderTopWidth: 1,
                        borderTopColor: '#f1f5f9',
                        paddingTop: 8,
                        paddingBottom: tabBarPaddingBottom,
                        height: tabBarHeight,
                    },
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '500',
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Início',
                        tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="devotionals"
                    options={{
                        title: 'Devocionais',
                        tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="bible"
                    options={{
                        title: 'Bíblia',
                        tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="prayer"
                    options={{
                        title: 'Oração',
                        tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Perfil',
                        tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                    }}
                />
                {/* Telas ocultas da tab bar - acessíveis via navegação */}
                <Tabs.Screen name="directory" options={{ href: null }} />
                <Tabs.Screen name="ebd" options={{ href: null }} />
                <Tabs.Screen name="events" options={{ href: null }} />
                <Tabs.Screen name="missions" options={{ href: null }} />
                <Tabs.Screen name="tithes" options={{ href: null }} />
            </Tabs>
        </ProtectedRoute>
    );
}
