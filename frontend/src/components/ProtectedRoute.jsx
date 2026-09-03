import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../utils/api';

function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  // The persisted `user` object is just cached display data — it can't prove
  // the httpOnly session cookie is still valid. Confirm with the server
  // before trusting it (closes the "stale/crafted localStorage user" gap).
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

  if (!checked) {
    return null;
  }

  if (!sessionValid) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
