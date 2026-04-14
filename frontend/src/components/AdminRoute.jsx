import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Navigate, Outlet } from 'react-router-dom';

function AdminRoute() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
