import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000, // 12s — prevents indefinite hangs if backend is slow
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sentinel_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle expired token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('sentinel_refresh_token');
        if (refresh) {
          // Attempt refreshing
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
          const { access } = response.data;
          
          localStorage.setItem('sentinel_access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed -> Clear localStorage and redirect to login
        localStorage.removeItem('sentinel_access_token');
        localStorage.removeItem('sentinel_refresh_token');
        localStorage.removeItem('sentinel_user');
        window.dispatchEvent(new Event('auth_session_expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
