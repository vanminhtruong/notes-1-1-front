import api from './api';

export interface LoginData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string | null;
  birthDate?: string | null; // ISO date (YYYY-MM-DD)
  gender?: 'male' | 'female' | 'other' | 'unspecified';
}

export interface User {
  id: number;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  phone?: string | null;
  birthDate?: string | null; // ISO date
  gender?: 'male' | 'female' | 'other' | 'unspecified';
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  const response = await api.put('/auth/change-password', data);
  return response.data;
};

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

  async updateProfile(data: { name?: string; avatar?: string; phone?: string | null; birthDate?: string | null; gender?: 'male' | 'female' | 'other' | 'unspecified' }): Promise<{ message: string; user: User }> {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  async requestPasswordReset(payload: { email?: string; phone?: string }): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', payload);
    return response.data;
  },

  async verifyOtp(data: { email?: string; phone?: string; otp: string }): Promise<{ message: string }> {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },

  async resetPassword(data: { email?: string; phone?: string; otp: string; newPassword: string }): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },

  async getRememberPref(email: string): Promise<{ remember: boolean }> {
    const response = await api.post('/auth/remember-pref', { email });
    return response.data;
  },

  async deleteAccount(): Promise<{ message: string }> {
    const response = await api.delete('/auth/account');
    return response.data;
  },
};

