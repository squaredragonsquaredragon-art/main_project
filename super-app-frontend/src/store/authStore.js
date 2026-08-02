import { create } from 'zustand';
import { authApi } from '../api/authApi';
import storageHelper from '../utils/storageHelper';

export const useAuthStore = create((set, get) => ({
  user: storageHelper.get('sentinel_user', null),
  accessToken: localStorage.getItem('sentinel_access_token') || null,
  refreshToken: localStorage.getItem('sentinel_refresh_token') || null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const appType = localStorage.getItem('sentinel_active_app') || 'all';
      const response = await authApi.login(credentials, appType);
      const { access, refresh, user } = response;
      
      localStorage.setItem('sentinel_access_token', access);
      localStorage.setItem('sentinel_refresh_token', refresh);
      storageHelper.set('sentinel_user', user);
      
      set({ user, accessToken: access, refreshToken: refresh, loading: false });
      return { success: true, user };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Authentication failed. Please verify credentials.';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg, details: err.response?.data };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const appType = localStorage.getItem('sentinel_active_app') || 'all';
      const response = await authApi.register(userData, appType);
      set({ loading: false });
      return { success: true, message: response.detail || 'Registration successful!' };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Registration failed. Username or email may already be taken.';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  logout: async () => {
    const refresh = get().refreshToken;
    if (refresh) {
      try {
        await authApi.logout(refresh);
      } catch (err) {
        console.error('Logout request failed:', err);
      }
    }
    localStorage.removeItem('sentinel_access_token');
    localStorage.removeItem('sentinel_refresh_token');
    storageHelper.remove('sentinel_user');
    set({ user: null, accessToken: null, refreshToken: null });
  },

  fetchMe: async () => {
    try {
      const user = await authApi.getMe();
      storageHelper.set('sentinel_user', user);
      set({ user });
    } catch (err) {
      console.error('Failed to fetch user profiles:', err);
    }
  },

  updateProfile: async (data) => {
    set({ loading: true });
    try {
      const updated = await authApi.updateProfile(data);
      set((state) => {
        const newUser = { ...state.user, ...updated };
        storageHelper.set('sentinel_user', newUser);
        return { user: newUser, loading: false };
      });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: err.response?.data?.detail || 'Update failed' };
    }
  }
}));
