import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterOrganization from './pages/RegisterOrganization';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MileageLog from './pages/MileageLog';
import AdminPanel from './pages/AdminPanel';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-org" element={<RegisterOrganization />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mileage-log" element={<MileageLog />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
