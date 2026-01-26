import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@/lib/utils';
import { colors } from '@/constants/colors';

interface ButtonProps {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

export function Button({
    children,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled,
    loading,
    icon,
    className,
}: ButtonProps) {
    const isDisabled = disabled || loading;

    const sizeStyles = {
        sm: 'px-3 py-2',
        md: 'px-4 py-3',
        lg: 'px-6 py-4',
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    if (variant === 'primary') {
        return (
            <Pressable
                onPress={onPress}
                disabled={isDisabled}
                className={cn(
                    'rounded-xl overflow-hidden',
                    isDisabled && 'opacity-50',
                    className
                )}
            >
                <LinearGradient
                    colors={colors.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className={cn('flex-row items-center justify-center', sizeStyles[size])}
                >
                    {loading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            {icon && <View className="mr-2">{icon}</View>}
                            <Text className={cn('font-semibold text-white', textSizes[size])}>
                                {children}
                            </Text>
                        </>
                    )}
                </LinearGradient>
            </Pressable>
        );
    }

    const variantStyles = {
        secondary: 'bg-slate-100 active:bg-slate-200',
        outline: 'border-2 border-emerald-600 bg-transparent active:bg-emerald-50',
        ghost: 'bg-transparent active:bg-slate-100',
        destructive: 'bg-red-500 active:bg-red-600',
    };

    const textStyles = {
        secondary: 'text-slate-700',
        outline: 'text-emerald-600',
        ghost: 'text-slate-600',
        destructive: 'text-white',
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            className={cn(
                'flex-row items-center justify-center rounded-xl',
                sizeStyles[size],
                variantStyles[variant],
                isDisabled && 'opacity-50',
                className
            )}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'destructive' ? 'white' : colors.primary[600]}
                    size="small"
                />
            ) : (
                <>
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text className={cn('font-semibold', textSizes[size], textStyles[variant])}>
                        {children}
                    </Text>
                </>
            )}
        </Pressable>
    );
}
