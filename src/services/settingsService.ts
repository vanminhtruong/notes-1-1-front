import api from './api';

export const settingsService = {
  async getE2EE(): Promise<{ enabled: boolean }> {
    const res = await api.get('/settings/e2ee');
    return res.data;
  },
  async setE2EE(enabled: boolean): Promise<{ message: string; enabled: boolean }> {
    const res = await api.put('/settings/e2ee', { enabled });
    return res.data;
  },
  async getE2EEPin(): Promise<{ pinHash: string | null }> {
    const res = await api.get('/settings/e2ee/pin');
    return res.data;
  },
  async setE2EEPin(payload: { pinHash: string | null; oldPinHash?: string }): Promise<{ message: string; pinHash: string | null }> {
    const res = await api.put('/settings/e2ee/pin', payload);
    return res.data;
  },
  async getReadStatus(): Promise<{ enabled: boolean }> {
    const res = await api.get('/settings/read-status');
    return res.data;
  },
  async setReadStatus(enabled: boolean): Promise<{ message: string; enabled: boolean }> {
    const res = await api.put('/settings/read-status', { enabled });
    return res.data;
  },
  async getTheme(): Promise<{ mode: 'light' | 'dark' }> {
    const res = await api.get('/settings/theme');
    return res.data;
  },
  async setTheme(mode: 'light' | 'dark'): Promise<{ message: string; mode: 'light' | 'dark' }> {
    const res = await api.put('/settings/theme', { mode });
    return res.data;
  },
  async getLanguage(): Promise<{ language: string }> {
    const res = await api.get('/settings/language');
    return res.data;
  },
  async setLanguage(language: string): Promise<{ message: string; language: string }> {
    const res = await api.put('/settings/language', { language });
    return res.data;
  },
};
