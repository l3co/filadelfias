import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './routes/LoginPage';
import RegisterPage from './routes/RegisterPage';
import HomePage from './routes/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import { MembersPage } from './routes/members/MembersPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OnboardingPage } from './routes/OnboardingPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="events" element={<div className="p-8 text-center text-gray-500">Módulo de Eventos (Em breve)</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
