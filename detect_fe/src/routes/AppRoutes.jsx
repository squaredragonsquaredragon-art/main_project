import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Lazy-load all pages — only download code when the route is first visited
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Alerts = lazy(() => import('../pages/Alerts'));
const LoginHistory = lazy(() => import('../pages/LoginHistory'));
const Admin = lazy(() => import('../pages/Admin'));
const Profile = lazy(() => import('../pages/Profile'));
const Reports = lazy(() => import('../pages/Reports'));
const NotFound = lazy(() => import('../pages/NotFound'));

const PageFallback = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: '16px', background: 'var(--clr-bg-primary)'
  }}>
    <div style={{
      width: '44px', height: '44px', borderRadius: '50%',
      border: '3px solid rgba(59,130,246,0.15)',
      borderTopColor: 'var(--clr-accent-blue)',
      animation: 'spin 0.8s linear infinite'
    }} />
    <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>Loading...</span>
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<PageFallback />}>
  <Routes>
    {/* Auth routes */}
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>

    {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/login-history" element={<LoginHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Route>

    {/* Admin-only */}
    <Route element={<ProtectedRoute adminOnly />}>
      <Route element={<DashboardLayout />}>
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Route>

    {/* Redirects */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
  </Suspense>
);

export default AppRoutes;
