import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

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

export default api;
