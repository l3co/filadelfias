import { Redirect } from 'expo-router';

export default function AdminIndex() {
    // Por enquanto, redireciona para o portal do membro
    // Depois implementar dashboard admin
    return <Redirect href="/(member)" />;
}
