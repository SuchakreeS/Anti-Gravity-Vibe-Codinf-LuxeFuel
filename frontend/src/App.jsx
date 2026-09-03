import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterOrganization from './pages/RegisterOrganization';
import Landing from './pages/Landing';
import AdminRoute from './components/AdminRoute';
import { CyberToastProvider } from './components/CyberToast';

// Code-split the authenticated-only pages so the initial bundle (login/
// landing) doesn't ship admin/dashboard/chart-heavy code that most visitors
// never load.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const MileageLog = lazy(() => import('./pages/MileageLog'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-asphalt">
    <div className="w-2 h-2 rounded-full bg-neon-violet animate-ping" />
  </div>
);

function App() {
  const user = useAuthStore((state) => state.user);
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <CyberToastProvider>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-org" element={<RegisterOrganization />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/mileage-log" element={<MileageLog />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </CyberToastProvider>
  );
}

export default App;
