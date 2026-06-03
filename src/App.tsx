import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PresenceProvider } from './context/PresenceContext';
import Layout from './components/Layout';
import OnlineUsersSidebar from './components/OnlineUsersSidebar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import ModuleDetail from './pages/ModuleDetail';
import Community from './pages/Community';
import Celebrations from './pages/Celebrations';
import Rewards from './pages/Rewards';
import Meetups from './pages/Meetups';
import Devices from './pages/Devices';
import Library from './pages/Library';
import Profile from './pages/Profile';
import GettingStarted from './pages/GettingStarted';
import AccessibilityPage from './pages/Accessibility';
import AdminUsers from './pages/AdminUsers';

function ProtectedRoute({ children, skipOnboarding }: { children: React.ReactNode; skipOnboarding?: boolean }) {
  const { user, profile, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  if (!skipOnboarding && (!profile || profile.avatar_key === 'default') && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute skipOnboarding><Onboarding /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/modules" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
      <Route path="/modules/:id" element={<ProtectedRoute><ModuleDetail /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/celebrations" element={<ProtectedRoute><Celebrations /></ProtectedRoute>} />
      <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
      <Route path="/meetups" element={<ProtectedRoute><Meetups /></ProtectedRoute>} />
      <Route path="/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
      <Route path="/getting-started" element={<ProtectedRoute><GettingStarted /></ProtectedRoute>} />
      <Route path="/accessibility" element={<ProtectedRoute><AccessibilityPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PresenceProvider>
          <AppRoutes />
          <OnlineUsersSidebar />
        </PresenceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
