import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = () => {
  const { accessToken } = useAuthStore();
  const location = useLocation();

  const detectAppFromPath = (pathname) => {
    if (pathname.startsWith('/reels')) return 'instagram';
    if (pathname.startsWith('/payment')) return 'payment';
    return null;
  };

  const pathApp = detectAppFromPath(location.pathname);
  const activeApp = localStorage.getItem('sentinel_active_app');

  // Enforce boundary: if logged in but accessing another app's path, log out of current session.
  if (accessToken && pathApp && activeApp && pathApp !== activeApp) {
    localStorage.removeItem('sentinel_access_token');
    localStorage.removeItem('sentinel_refresh_token');
    localStorage.setItem('sentinel_active_app', pathApp);
    window.location.href = '/login';
    return null;
  }

  if (!accessToken) {
    if (pathApp) {
      localStorage.setItem('sentinel_active_app', pathApp);
      return <Navigate to="/login" replace />;
    }

    if (!activeApp) {
      return <Navigate to="/select-app" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
