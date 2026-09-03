import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../utils/api';

function AdminRoute() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const logout = useAuthStore((state) => state.logout);
  // Same server-side confirmation as ProtectedRoute: the cached `user` role
  // can't prove the session cookie (or the role itself) is still valid.
  const [checked, setChecked] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);

  useEffect(() => {
    if (!user) {
      setChecked(true);
      return;
    }
    let cancelled = false;
    api.get('/auth/me')
      .then(() => { if (!cancelled) setSessionValid(true); })
      .catch(() => { if (!cancelled) logout(); })
      .finally(() => { if (!cancelled) setChecked(true); });
    return () => { cancelled = true; };
  }, [user, logout]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (!checked) {
    return null;
  }

  if (!sessionValid) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
