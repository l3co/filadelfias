import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                freezeOnBlur: false,
                animation: 'slide_from_right',
            }}
        />
    );
}
