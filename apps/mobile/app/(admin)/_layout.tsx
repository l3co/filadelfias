import { Stack } from 'expo-router';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

export default function AdminLayout() {
    return (
        <ProtectedRoute>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            />
        </ProtectedRoute>
    );
}
