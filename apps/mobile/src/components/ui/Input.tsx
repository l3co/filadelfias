import { View, TextInput, Text } from 'react-native';
import { cn } from '@/lib/utils';
import { colors } from '@/constants/colors';

interface InputProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    error?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    icon?: React.ReactNode;
    className?: string;
}

export function Input({
    label,
    placeholder,
    value,
    onChangeText,
    error,
    secureTextEntry,
    keyboardType = 'default',
    autoCapitalize = 'none',
    icon,
    className,
}: InputProps) {
    return (
        <View className={cn('mb-4', className)}>
            {label && (
                <Text className="text-sm font-medium text-slate-700 mb-1.5">{label}</Text>
            )}
            <View
                className={cn(
                    'flex-row items-center bg-slate-50 rounded-xl border-2 px-4',
                    error ? 'border-red-500' : 'border-transparent focus:border-emerald-500'
                )}
            >
                {icon && <View className="mr-3">{icon}</View>}
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={colors.slate[400]}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    className="flex-1 py-3.5 text-base text-slate-900"
                />
            </View>
            {error && <Text className="text-sm text-red-500 mt-1">{error}</Text>}
        </View>
    );
}
