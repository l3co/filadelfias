import { HomePageView } from '../features/dashboard/components/HomePageView';
import { useHomePageData } from '../features/dashboard/hooks/useHomePageData';

export default function HomePage() {
    const homePageData = useHomePageData();

    return <HomePageView {...homePageData} />;
}
