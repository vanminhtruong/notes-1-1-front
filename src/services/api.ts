import axios from 'axios';

// Prefer explicit env, otherwise use current hostname so cross-device/LAN works
const envBase = (import.meta as any).env?.VITE_BACKEND_HTTP_URL as string | undefined;
const host = (typeof window !== 'undefined' && window.location?.hostname) ? window.location.hostname : 'localhost';
const baseOrigin = envBase || `http://${host}:3000`;
const API_BASE_URL = `${baseOrigin.replace(/\/$/, '')}/api/v1`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const reqUrl: string = error.config?.url || '';
      const isAuthEndpoint = [
        '/auth/login',
        '/auth/register',
        '/auth/google',
        '/auth/facebook',
        '/auth/forgot-password',
        '/auth/verify-otp',
        '/auth/reset-password',
      ].some((p) => reqUrl.includes(p));
      const hasToken = !!localStorage.getItem('token');
      const isAlreadyOnLogin = window.location.pathname === '/login';

      // Only force-redirect when a valid session likely expired on a protected API
      if (hasToken && !isAuthEndpoint && !isAlreadyOnLogin) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Background API functions
export const backgroundApi = {
  getColors: (search?: string, page: number = 1, limit: number = 10) => {
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    if (page) q.set('page', String(page));
    if (limit) q.set('limit', String(limit));
    const params = q.toString();
    return api.get(`/settings/background/colors${params ? `?${params}` : ''}`);
  },
  getImages: (search?: string, page: number = 1, limit: number = 10) => {
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    if (page) q.set('page', String(page));
    if (limit) q.set('limit', String(limit));
    const params = q.toString();
    return api.get(`/settings/background/images${params ? `?${params}` : ''}`);
  }
};

export default api;
