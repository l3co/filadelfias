import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { MemberLayout } from './components/layout/MemberLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { Toaster } from './components/ui/sonner';
import { LoadingOverlay } from './components/ui/spinner';
import { ROUTES } from './lib/routes';

// Lazy loaded pages - Auth
const LoginPage = lazy(() => import('./routes/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./routes/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./routes/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const ChurchRegistrationWizard = lazy(() => import('./routes/ChurchRegistrationWizard').then(m => ({ default: m.ChurchRegistrationWizard })));
const OnboardingPage = lazy(() => import('./routes/OnboardingPage').then(m => ({ default: m.OnboardingPage })));

// Lazy loaded pages - Public
const LandingPage = lazy(() => import('./routes/LandingPage').then(m => ({ default: m.LandingPage })));
const BiblePage = lazy(() => import('./routes/bible/BiblePage').then(m => ({ default: m.BiblePage })));
const BibleReaderPage = lazy(() => import('./routes/bible/BibleReaderPage').then(m => ({ default: m.BibleReaderPage })));
const HymnalPage = lazy(() => import('./routes/hymnal/HymnalPage').then(m => ({ default: m.HymnalPage })));
const HymnalReaderPage = lazy(() => import('./routes/hymnal/HymnalReaderPage').then(m => ({ default: m.HymnalReaderPage })));
const ManualPage = lazy(() => import('./routes/manual/ManualPage').then(m => ({ default: m.ManualPage })));
const ManualReaderPage = lazy(() => import('./routes/manual/ManualReaderPage').then(m => ({ default: m.ManualReaderPage })));
const TermsPage = lazy(() => import('./routes/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./routes/PrivacyPage').then(m => ({ default: m.PrivacyPage })));

// Lazy loaded pages - Admin Dashboard
const HomePage = lazy(() => import('./routes/HomePage'));
const MembersPage = lazy(() => import('./routes/members/MembersPage').then(m => ({ default: m.MembersPage })));
const CouncilsPage = lazy(() => import('./routes/governance/CouncilsPage').then(m => ({ default: m.CouncilsPage })));
const TreasuryPage = lazy(() => import('./routes/financial/TreasuryPage').then(m => ({ default: m.TreasuryPage })));
const MissionsPage = lazy(() => import('./routes/missions/MissionsPage').then(m => ({ default: m.MissionsPage })));
const EBDClassesPage = lazy(() => import('./routes/ebd/EBDClassesPage').then(m => ({ default: m.EBDClassesPage })));
const EBDClassDetailPage = lazy(() => import('./routes/ebd/EBDClassDetailPage').then(m => ({ default: m.EBDClassDetailPage })));
const EventsPage = lazy(() => import('./routes/events/EventsPage').then(m => ({ default: m.EventsPage })));
const DevotionalsPage = lazy(() => import('./routes/devotionals/DevotionalsPage').then(m => ({ default: m.DevotionalsPage })));
const ChurchSettingsPage = lazy(() => import('./routes/settings/ChurchSettingsPage').then(m => ({ default: m.ChurchSettingsPage })));

// Lazy loaded pages - Member Portal
const MemberHomePage = lazy(() => import('./routes/member/MemberHomePage').then(m => ({ default: m.MemberHomePage })));
const MemberDirectoryPage = lazy(() => import('./routes/member/MemberDirectoryPage').then(m => ({ default: m.MemberDirectoryPage })));
const MemberEventsPage = lazy(() => import('./routes/member/MemberEventsPage').then(m => ({ default: m.MemberEventsPage })));
const MemberMissionsPage = lazy(() => import('./routes/member/MemberMissionsPage').then(m => ({ default: m.MemberMissionsPage })));
const MemberDevotionalsPage = lazy(() => import('./routes/member/MemberDevotionalsPage').then(m => ({ default: m.MemberDevotionalsPage })));
const MemberPrayerPage = lazy(() => import('./routes/member/MemberPrayerPage').then(m => ({ default: m.MemberPrayerPage })));
const MemberEBDPage = lazy(() => import('./routes/member/MemberEBDPage').then(m => ({ default: m.MemberEBDPage })));
const MemberGovernancePage = lazy(() => import('./routes/member/MemberGovernancePage').then(m => ({ default: m.MemberGovernancePage })));
const MyTithesPage = lazy(() => import('./routes/tithe/MyTithesPage').then(m => ({ default: m.MyTithesPage })));
const MyExpensesPage = lazy(() => import('./routes/expense/MyExpensesPage').then(m => ({ default: m.MyExpensesPage })));

// Lazy loaded pages - Shared
const ProfilePage = lazy(() => import('./routes/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));

function App() {
  return (
    <>
      <Suspense fallback={<LoadingOverlay message="Carregando..." />}>
        <Routes>
        {/* Rotas Públicas com Layout Público */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.PUBLIC.HOME} element={<LandingPage />} />
          <Route path={ROUTES.PUBLIC.BIBLE} element={<BiblePage />} />
          <Route path={`${ROUTES.PUBLIC.BIBLE}/:book/:chapter`} element={<BibleReaderPage />} />
          <Route path={ROUTES.PUBLIC.HYMNAL} element={<HymnalPage />} />
          <Route path={`${ROUTES.PUBLIC.HYMNAL}/:number`} element={<HymnalReaderPage />} />
          <Route path={ROUTES.PUBLIC.MANUAL} element={<ManualPage />} />
          <Route path={`${ROUTES.PUBLIC.MANUAL}/*`} element={<ManualReaderPage />} />
          <Route path={ROUTES.PUBLIC.TERMS} element={<TermsPage />} />
          <Route path={ROUTES.PUBLIC.PRIVACY} element={<PrivacyPage />} />
        </Route>

        {/* Autenticação (Sem Layout Específico) */}
        <Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.AUTH.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={ROUTES.AUTH.REGISTER} element={<ChurchRegistrationWizard />} />

        {/* Onboarding Protegido */}
        <Route
          path={ROUTES.AUTH.ONBOARDING}
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path={ROUTES.ADMIN.ROOT}
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="governance" element={<CouncilsPage />} />
          <Route path="treasury" element={<TreasuryPage />} />
          <Route path="missions" element={<MissionsPage />} />
          <Route path="education" element={<EBDClassesPage />} />
          <Route path="education/:classId" element={<EBDClassDetailPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="devotionals" element={<DevotionalsPage />} />
          <Route path="settings" element={<ChurchSettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Legacy redirects for /app/* */}
        <Route path={ROUTES.LEGACY.APP} element={<Navigate to={ROUTES.ADMIN.ROOT} replace />} />
        <Route path={ROUTES.LEGACY.APP_ANY} element={<Navigate to={ROUTES.ADMIN.ROOT} replace />} />

        {/* Member Portal */}
        <Route
          path={ROUTES.MEMBER.ROOT}
          element={
            <ProtectedRoute>
              <MemberLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MemberHomePage />} />
          <Route path="directory" element={<MemberDirectoryPage />} />
          <Route path="events" element={<MemberEventsPage />} />
          <Route path="missions" element={<MemberMissionsPage />} />
          <Route path="bible" element={<BiblePage />} />
          <Route path="hymnal" element={<HymnalPage />} />
          <Route path="manual" element={<ManualPage />} />
          <Route path="education" element={<MemberEBDPage />} />
          <Route path="prayer" element={<MemberPrayerPage />} />
          <Route path="devotionals" element={<MemberDevotionalsPage />} />
          <Route path="governance" element={<MemberGovernancePage />} />
          <Route path="tithes" element={<MyTithesPage />} />
          <Route path="expenses" element={<MyExpensesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Legacy redirects for /membro/* */}
        <Route path={ROUTES.LEGACY.MEMBER_PT} element={<Navigate to={ROUTES.MEMBER.ROOT} replace />} />
        <Route path={ROUTES.LEGACY.MEMBER_PT_ANY} element={<Navigate to={ROUTES.MEMBER.ROOT} replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.PUBLIC.HOME} replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
