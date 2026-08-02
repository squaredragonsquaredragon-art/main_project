import api from './axios';

export const authApi = {
  register: async (userData, app = 'all') => {
    const response = await api.post(`/auth/register/?app=${app}`, userData);
    return response.data;
  },

  login: async (credentials, app = 'all') => {
    const response = await api.post(`/auth/login/?app=${app}`, credentials);
    return response.data;
  },

  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout/', { refresh: refreshToken });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password/', passwordData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.patch('/users/me/', profileData);
    return response.data;
  }
};
