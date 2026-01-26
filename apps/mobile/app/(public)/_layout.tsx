import { Tabs } from 'expo-router';
import { Home, BookOpen, Music, BookMarked, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

export default function PublicLayout() {
    const insets = useSafeAreaInsets();
    
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary[600],
                tabBarInactiveTintColor: colors.slate[400],
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: colors.slate[100],
                    paddingTop: 8,
                    paddingBottom: Math.max(insets.bottom, 8),
                    height: 64 + insets.bottom,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
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
                name="hymnal"
                options={{
                    title: 'Hinário',
                    tabBarIcon: ({ color, size }) => <Music size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="manual"
                options={{
                    title: 'Manual',
                    tabBarIcon: ({ color, size }) => <BookMarked size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: 'Conta',
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="downloads"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
        </Tabs>
    );
}
