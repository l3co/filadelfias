import { Stack } from 'expo-router';

export default function ManualLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
}
