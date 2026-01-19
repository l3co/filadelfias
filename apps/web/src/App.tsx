import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './routes/LoginPage';
import RegisterPage from './routes/RegisterPage';
import HomePage from './routes/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import { MembersPage } from './routes/members/MembersPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OnboardingPage } from './routes/OnboardingPage';
import { PublicLayout } from './components/layout/PublicLayout';
import { LandingPage } from './routes/LandingPage';
import { BiblePage } from './routes/bible/BiblePage';
import { BibleReaderPage } from './routes/bible/BibleReaderPage';
import { HymnalPage } from './routes/hymnal/HymnalPage';
import { HymnalReaderPage } from './routes/hymnal/HymnalReaderPage';
import { CouncilsPage } from './routes/governance/CouncilsPage';
import { TreasuryPage } from './routes/financial/TreasuryPage';
import { MissionsPage } from './routes/missions/MissionsPage';
import { EBDClassesPage } from './routes/ebd/EBDClassesPage';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <>
      <Routes>
        {/* Rotas Públicas com Layout Público */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/bible" element={<BiblePage />} />
          <Route path="/bible/:book/:chapter" element={<BibleReaderPage />} />
          <Route path="/hymnal" element={<HymnalPage />} />
          <Route path="/hymnal/:number" element={<HymnalReaderPage />} />
        </Route>

        {/* Autenticação (Sem Layout Específico) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Onboarding Protegido */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Área Administrativa Protegida */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="governance" element={<CouncilsPage />} />
          <Route path="financial" element={<TreasuryPage />} />
          <Route path="missions" element={<MissionsPage />} />
          <Route path="ebd" element={<EBDClassesPage />} />
          <Route path="events" element={<div className="p-8 text-center text-gray-500">Módulo de Eventos (Em breve)</div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
