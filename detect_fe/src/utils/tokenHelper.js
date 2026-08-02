// Token helpers
const TOKEN_KEY = 'sentinel_token';
const REFRESH_KEY = 'sentinel_refresh';
const USER_KEY = 'sentinel_user';

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const setRefreshToken = (token) => localStorage.setItem(REFRESH_KEY, token);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const removeRefreshToken = () => localStorage.removeItem(REFRESH_KEY);

export const setUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};
export const removeUser = () => localStorage.removeItem(USER_KEY);

export const clearAuth = () => {
  removeToken();
  removeRefreshToken();
  removeUser();
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  if (token.startsWith('super-admin') || token.startsWith('static-')) return false;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return false;
  }
};
