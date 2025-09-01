import api from './api';

const getApiOrigin = () => {
  try {
    const base = (api.defaults.baseURL || '').toString();
    const u = new URL(base);
    return u.origin;
  } catch {
    return window.location.origin;
  }
};

export const uploadService = {
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const form = new FormData();
    form.append('file', file);

    const response = await api.post('/uploads/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const origin = getApiOrigin();
    const data = response.data?.data || {};
    const url: string = data.url?.startsWith('http') ? data.url : `${origin}${data.url}`;
    return { url, filename: data.filename };
  },

  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const form = new FormData();
    form.append('file', file);

    const response = await api.post('/uploads/file', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const origin = getApiOrigin();
    const data = response.data?.data || {};
    const url: string = data.url?.startsWith('http') ? data.url : `${origin}${data.url}`;
    return { url, filename: data.filename };
  },
};
