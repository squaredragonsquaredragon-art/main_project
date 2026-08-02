import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const PublicRoute = () => {
  const { accessToken } = useAuthStore();
  const activeApp = localStorage.getItem('sentinel_active_app');

  if (accessToken) {
    if (activeApp === 'payment') return <Navigate to="/payment" replace />;
    if (activeApp === 'instagram') return <Navigate to="/reels" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
