import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { LucideIcon } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface HomeCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    href: string;
    color: 'blue' | 'purple' | 'red' | 'emerald' | 'orange' | 'indigo' | 'yellow' | 'pink';
}

const colorMap = {
    blue: { bg: 'bg-blue-50', icon: '#3b82f6', gradient: ['#3b82f6', '#2563eb'] },
    purple: { bg: 'bg-purple-50', icon: '#8b5cf6', gradient: ['#8b5cf6', '#7c3aed'] },
    red: { bg: 'bg-red-50', icon: '#ef4444', gradient: ['#ef4444', '#dc2626'] },
    emerald: { bg: 'bg-emerald-50', icon: '#10b981', gradient: ['#10b981', '#059669'] },
    orange: { bg: 'bg-orange-50', icon: '#f97316', gradient: ['#f97316', '#ea580c'] },
    indigo: { bg: 'bg-indigo-50', icon: '#6366f1', gradient: ['#6366f1', '#4f46e5'] },
    yellow: { bg: 'bg-yellow-50', icon: '#eab308', gradient: ['#eab308', '#ca8a04'] },
    pink: { bg: 'bg-pink-50', icon: '#ec4899', gradient: ['#ec4899', '#db2777'] },
};

export function HomeCard({ icon: Icon, title, description, href, color }: HomeCardProps) {
    const router = useRouter();
    const colorConfig = colorMap[color];

    return (
        <Pressable
            onPress={() => router.push(href)}
            className="active:scale-[0.97] active:opacity-90"
        >
            <View className="bg-white rounded-2xl p-4 shadow-sm shadow-slate-100 border border-slate-100">
                <View className={cn('h-12 w-12 rounded-xl items-center justify-center mb-3', colorConfig.bg)}>
                    <Icon size={24} color={colorConfig.icon} />
                </View>
                <Text className="font-semibold text-slate-900 text-base mb-1">{title}</Text>
                <Text className="text-sm text-slate-500 leading-5">{description}</Text>
            </View>
        </Pressable>
    );
}
