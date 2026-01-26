import { View, Pressable } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    onPress?: () => void;
    className?: string;
    variant?: 'default' | 'elevated' | 'outline';
}

export function Card({ children, onPress, className, variant = 'default' }: CardProps) {
    const variantStyles = {
        default: 'bg-white',
        elevated: 'bg-white shadow-lg shadow-slate-200',
        outline: 'bg-white border border-slate-200',
    };

    const Component = onPress ? Pressable : View;

    return (
        <Component
            onPress={onPress}
            className={cn(
                'rounded-2xl p-4',
                variantStyles[variant],
                onPress && 'active:scale-[0.98] active:opacity-90',
                className
            )}
        >
            {children}
        </Component>
    );
}
