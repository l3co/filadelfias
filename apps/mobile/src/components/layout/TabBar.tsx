import { View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, BookOpen, BookMarked, Heart, User } from 'lucide-react-native';
import { usePathname, useRouter } from 'expo-router';
import { cn } from '@/lib/utils';
import { colors } from '@/constants/colors';

const tabs = [
    { href: '/(member)', icon: Home, label: 'Início' },
    { href: '/(member)/devotionals', icon: Heart, label: 'Devocionais' },
    { href: '/(public)/bible', icon: BookOpen, label: 'Bíblia' },
    { href: '/(public)/manual', icon: BookMarked, label: 'Manual' },
    { href: '/(member)/profile', icon: User, label: 'Perfil' },
];

export function TabBar() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    return (
        <View
            className="flex-row bg-white border-t border-slate-100"
            style={{ paddingBottom: insets.bottom }}
        >
            {tabs.map((tab) => {
                const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
                const Icon = tab.icon;

                return (
                    <Pressable
                        key={tab.href}
                        onPress={() => router.push(tab.href)}
                        className="flex-1 items-center py-2"
                    >
                        <Icon
                            size={22}
                            color={isActive ? colors.primary[600] : colors.slate[400]}
                        />
                        <Text
                            className={cn(
                                'text-xs mt-1',
                                isActive ? 'text-emerald-600 font-medium' : 'text-slate-400'
                            )}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
