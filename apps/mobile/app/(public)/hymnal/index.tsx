import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HymnalList } from '@/components/features/HymnalList';

export default function HymnalListScreen() {
    const insets = useSafeAreaInsets();
    return <HymnalList topPadding={insets.top} />;
}
