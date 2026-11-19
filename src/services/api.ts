import axios from 'axios';
import { getBackendOrigin } from './backendOrigin';

// Android uses a user-configured HTTPS backend; the website keeps its current behavior.
const API_BASE_URL = `${getBackendOrigin().replace(/\/$/, '')}/api/v1`;

// Create axios instance
const api = axios.create({
  timeout: 20000,
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
      const isAlreadyOnLogin = window.location.pathname === `${import.meta.env.BASE_URL}login`;

      // Only force-redirect when a valid session likely expired on a protected API
      if (hasToken && !isAuthEndpoint && !isAlreadyOnLogin) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = `${import.meta.env.BASE_URL}login`;
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
