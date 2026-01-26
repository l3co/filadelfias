import { Tabs } from 'expo-router';
import { Home, Heart, BookOpen, MessageCircle, User } from 'lucide-react-native';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { colors } from '@/constants/colors';

export default function MemberLayout() {
    return (
        <ProtectedRoute>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: colors.primary[600],
                    tabBarInactiveTintColor: colors.slate[400],
                    tabBarStyle: {
                        borderTopWidth: 1,
                        borderTopColor: colors.slate[100],
                        paddingTop: 8,
                        paddingBottom: 8,
                        height: 60,
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
            </Tabs>
        </ProtectedRoute>
    );
}
