import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';

interface ListCardProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
}

export function ListCard({ children, onPress, style }: ListCardProps) {
    const Component = onPress ? Pressable : View;

    return (
        <Component
            onPress={onPress}
            style={[
                styles.card,
                onPress && styles.pressable,
                style,
            ]}
        >
            {children}
        </Component>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    pressable: {
        // React Native doesn't support active:scale in StyleSheet
        // This will be handled by the Pressable's style prop if needed
    },
});
