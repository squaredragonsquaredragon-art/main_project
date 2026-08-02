import axios from 'axios';
import { getToken, setToken, getRefreshToken, clearAuth } from '../utils/tokenHelper';
import { API_BASE } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach Token if present
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 without forcing logout on static/mock tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const token = getToken();

    // Prevent redirecting for super admin static session
    if (token && (token.startsWith('super-admin') || token.startsWith('static-'))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = getRefreshToken();
        if (!refresh || refresh.startsWith('super-admin') || refresh.startsWith('static-')) {
          throw new Error('Static token — no refresh needed');
        }
        const { data } = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
        setToken(data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
