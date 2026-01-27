import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { FEATURE_COLORS, FeatureColor } from '@/constants/theme';

interface HomeCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    href: string;
    color: FeatureColor;
}

export function HomeCard({ icon: Icon, title, description, href, color }: HomeCardProps) {
    const router = useRouter();
    const colorConfig = FEATURE_COLORS[color];

    return (
        <Pressable
            onPress={() => router.push(href as any)}
            className="active:scale-[0.97] active:opacity-90"
        >
            <View className="bg-white rounded-2xl p-4 shadow-sm shadow-slate-100 border border-slate-100">
                <View 
                    className="h-12 w-12 rounded-xl items-center justify-center mb-3"
                    style={{ backgroundColor: colorConfig.bg }}
                >
                    <Icon size={24} color={colorConfig.icon} />
                </View>
                <Text className="font-semibold text-slate-900 text-base mb-1">{title}</Text>
                <Text className="text-sm text-slate-500 leading-5">{description}</Text>
            </View>
        </Pressable>
    );
}
