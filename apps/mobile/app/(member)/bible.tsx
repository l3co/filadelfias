import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function BibleRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Delay navigation to avoid view hierarchy conflicts
        const timer = setTimeout(() => {
            router.replace('/(public)/bible');
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);

    return <LoadingScreen message="Carregando Bíblia..." />;
}
