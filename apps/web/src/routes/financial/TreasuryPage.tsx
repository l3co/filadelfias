import { TreasuryPageView } from '../../features/financial/components/TreasuryPageView';
import { useTreasuryPageData } from '../../features/financial/hooks/useTreasuryPageData';

export function TreasuryPage() {
    const treasuryPageData = useTreasuryPageData();

    return <TreasuryPageView {...treasuryPageData} />;
}
