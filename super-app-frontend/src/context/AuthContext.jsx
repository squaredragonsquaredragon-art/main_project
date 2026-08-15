import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user, accessToken, loading, error, login, register, logout, fetchMe, updateProfile } = useAuthStore();

  useEffect(() => {
    if (accessToken && !user) {
      fetchMe();
    }
  }, [accessToken, user, fetchMe]);

  // Handle global session expiry from Axios interceptors
  useEffect(() => {
    const handleExpiry = () => {
      logout();
    };
    window.addEventListener('auth_session_expired', handleExpiry);
    return () => window.removeEventListener('auth_session_expired', handleExpiry);
  }, [logout]);

  // Real-time Safe Account heartbeat: check if Admin force-logged out this user
  useEffect(() => {
    if (!accessToken) return;
    const interval = setInterval(() => {
      fetchMe();
    }, 4000);
    return () => clearInterval(interval);
  }, [accessToken, fetchMe]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
