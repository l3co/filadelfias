import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';
import { colors } from '@/constants/colors';

interface AvatarProps {
    name?: string;
    imageUrl?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeMap = {
    sm: { container: 'h-8 w-8', text: 'text-xs' },
    md: { container: 'h-10 w-10', text: 'text-sm' },
    lg: { container: 'h-12 w-12', text: 'text-base' },
    xl: { container: 'h-16 w-16', text: 'text-xl' },
};

export function Avatar({ name, imageUrl, size = 'md', className }: AvatarProps) {
    const sizeConfig = sizeMap[size];

    if (imageUrl) {
        return (
            <Image
                source={{ uri: imageUrl }}
                className={cn('rounded-xl', sizeConfig.container, className)}
            />
        );
    }

    return (
        <LinearGradient
            colors={colors.gradients.primary}
            className={cn('rounded-xl items-center justify-center', sizeConfig.container, className)}
        >
            <Text className={cn('font-bold text-white', sizeConfig.text)}>
                {getInitials(name || 'U')}
            </Text>
        </LinearGradient>
    );
}
