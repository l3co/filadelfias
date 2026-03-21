import { lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { MemberLayout } from './components/layout/MemberLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { Toaster } from './components/ui/sonner';
import { LoadingOverlay } from './components/ui/spinner';
import { ErrorBoundary, ErrorFallback } from './components/ErrorBoundary';
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { OfflineBanner } from './components/pwa/OfflineBanner';
import { ROUTES } from './lib/routes';
import { AppMetadata } from './lib/page-metadata';

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

function RouteBoundary({
  children,
  description = 'A página não pôde ser carregada. Tente novamente.',
  message = 'Carregando...',
  title = 'Erro ao carregar página',
}: {
  children: ReactNode;
  description?: string;
  message?: string;
  title?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback
          error={null}
          title={title}
          description={description}
          onRetry={() => window.location.reload()}
        />
      }
    >
      <Suspense fallback={<LoadingOverlay message={message} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <>
      <AppMetadata />
      <OfflineBanner />
      <InstallPrompt />
      <Routes>
        {/* Rotas Públicas com Layout Público */}
        <Route element={<RouteBoundary message="Carregando portal público..."><PublicLayout /></RouteBoundary>}>
          <Route path={ROUTES.PUBLIC.HOME} element={<RouteBoundary message="Carregando página inicial..."><LandingPage /></RouteBoundary>} />
          <Route path={ROUTES.PUBLIC.BIBLE} element={<RouteBoundary message="Carregando Bíblia..."><BiblePage /></RouteBoundary>} />
          <Route path={`${ROUTES.PUBLIC.BIBLE}/:book/:chapter`} element={<RouteBoundary message="Carregando leitura bíblica..."><BibleReaderPage /></RouteBoundary>} />
          <Route path={ROUTES.PUBLIC.HYMNAL} element={<RouteBoundary message="Carregando hinário..."><HymnalPage /></RouteBoundary>} />
          <Route path={`${ROUTES.PUBLIC.HYMNAL}/:number`} element={<RouteBoundary message="Carregando hino..."><HymnalReaderPage /></RouteBoundary>} />
          <Route path={ROUTES.PUBLIC.MANUAL} element={<RouteBoundary message="Carregando manual..."><ManualPage /></RouteBoundary>} />
          <Route path={`${ROUTES.PUBLIC.MANUAL}/*`} element={<RouteBoundary message="Carregando artigo..."><ManualReaderPage /></RouteBoundary>} />
          <Route path={ROUTES.PUBLIC.TERMS} element={<RouteBoundary message="Carregando termos..."><TermsPage /></RouteBoundary>} />
          <Route path={ROUTES.PUBLIC.PRIVACY} element={<RouteBoundary message="Carregando política de privacidade..."><PrivacyPage /></RouteBoundary>} />
        </Route>

        {/* Autenticação (Sem Layout Específico) */}
        <Route path={ROUTES.AUTH.LOGIN} element={<RouteBoundary message="Carregando login..."><LoginPage /></RouteBoundary>} />
        <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<RouteBoundary message="Carregando recuperação de senha..."><ForgotPasswordPage /></RouteBoundary>} />
        <Route path={ROUTES.AUTH.RESET_PASSWORD} element={<RouteBoundary message="Carregando redefinição de senha..."><ResetPasswordPage /></RouteBoundary>} />
        <Route path={ROUTES.AUTH.REGISTER} element={<RouteBoundary message="Carregando cadastro..."><ChurchRegistrationWizard /></RouteBoundary>} />

        {/* Onboarding Protegido */}
        <Route
          path={ROUTES.AUTH.ONBOARDING}
          element={
            <RouteBoundary message="Carregando onboarding...">
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            </RouteBoundary>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path={ROUTES.ADMIN.ROOT}
          element={
            <RouteBoundary message="Carregando painel administrativo...">
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            </RouteBoundary>
          }
        >
          <Route index element={<RouteBoundary message="Carregando dashboard..."><HomePage /></RouteBoundary>} />
          <Route path="members" element={<RouteBoundary message="Carregando membros..."><MembersPage /></RouteBoundary>} />
          <Route path="governance" element={<RouteBoundary message="Carregando governança..."><CouncilsPage /></RouteBoundary>} />
          <Route path="treasury" element={<RouteBoundary message="Carregando tesouraria..."><TreasuryPage /></RouteBoundary>} />
          <Route path="missions" element={<RouteBoundary message="Carregando missões..."><MissionsPage /></RouteBoundary>} />
          <Route path="education" element={<RouteBoundary message="Carregando educação..."><EBDClassesPage /></RouteBoundary>} />
          <Route path="education/:classId" element={<RouteBoundary message="Carregando turma..."><EBDClassDetailPage /></RouteBoundary>} />
          <Route path="events" element={<RouteBoundary message="Carregando eventos..."><EventsPage /></RouteBoundary>} />
          <Route path="devotionals" element={<RouteBoundary message="Carregando devocionais..."><DevotionalsPage /></RouteBoundary>} />
          <Route path="settings" element={<RouteBoundary message="Carregando configurações..."><ChurchSettingsPage /></RouteBoundary>} />
          <Route path="profile" element={<RouteBoundary message="Carregando perfil..."><ProfilePage /></RouteBoundary>} />
        </Route>

        {/* Legacy redirects for /app/* */}
        <Route path={ROUTES.LEGACY.APP} element={<Navigate to={ROUTES.ADMIN.ROOT} replace />} />
        <Route path={ROUTES.LEGACY.APP_ANY} element={<Navigate to={ROUTES.ADMIN.ROOT} replace />} />

        {/* Member Portal */}
        <Route
          path={ROUTES.MEMBER.ROOT}
          element={
            <RouteBoundary message="Carregando portal do membro...">
              <ProtectedRoute>
                <MemberLayout />
              </ProtectedRoute>
            </RouteBoundary>
          }
        >
          <Route index element={<RouteBoundary message="Carregando início..."><MemberHomePage /></RouteBoundary>} />
          <Route path="directory" element={<RouteBoundary message="Carregando diretório..."><MemberDirectoryPage /></RouteBoundary>} />
          <Route path="events" element={<RouteBoundary message="Carregando eventos..."><MemberEventsPage /></RouteBoundary>} />
          <Route path="missions" element={<RouteBoundary message="Carregando missões..."><MemberMissionsPage /></RouteBoundary>} />
          <Route path="bible" element={<RouteBoundary message="Carregando Bíblia..."><BiblePage /></RouteBoundary>} />
          <Route path="hymnal" element={<RouteBoundary message="Carregando hinário..."><HymnalPage /></RouteBoundary>} />
          <Route path="manual" element={<RouteBoundary message="Carregando manual..."><ManualPage /></RouteBoundary>} />
          <Route path="education" element={<RouteBoundary message="Carregando educação..."><MemberEBDPage /></RouteBoundary>} />
          <Route path="prayer" element={<RouteBoundary message="Carregando oração..."><MemberPrayerPage /></RouteBoundary>} />
          <Route path="devotionals" element={<RouteBoundary message="Carregando devocionais..."><MemberDevotionalsPage /></RouteBoundary>} />
          <Route path="governance" element={<RouteBoundary message="Carregando governança..."><MemberGovernancePage /></RouteBoundary>} />
          <Route path="tithes" element={<RouteBoundary message="Carregando dízimos..."><MyTithesPage /></RouteBoundary>} />
          <Route path="expenses" element={<RouteBoundary message="Carregando despesas..."><MyExpensesPage /></RouteBoundary>} />
          <Route path="profile" element={<RouteBoundary message="Carregando perfil..."><ProfilePage /></RouteBoundary>} />
        </Route>

        {/* Legacy redirects for /membro/* */}
        <Route path={ROUTES.LEGACY.MEMBER_PT} element={<Navigate to={ROUTES.MEMBER.ROOT} replace />} />
        <Route path={ROUTES.LEGACY.MEMBER_PT_ANY} element={<Navigate to={ROUTES.MEMBER.ROOT} replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.PUBLIC.HOME} replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
