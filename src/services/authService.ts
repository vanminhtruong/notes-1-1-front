import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<{ message: string }> {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async getProfile(): Promise<{ user: User; totalNotes: number }> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(data: { name: string; avatar?: string }): Promise<{ message: string; user: User }> {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async verifyOtp(data: { email: string; otp: string }): Promise<{ message: string }> {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },

  async resetPassword(data: { email: string; otp: string; newPassword: string }): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },

  async loginWithFacebook(accessToken: string): Promise<AuthResponse> {
    const response = await api.post('/auth/facebook', { accessToken });
    return response.data;
  },
};
