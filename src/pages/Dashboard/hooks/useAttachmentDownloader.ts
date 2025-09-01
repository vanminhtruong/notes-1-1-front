import toast from 'react-hot-toast';
import api from '../../../services/api';

export function useAttachmentDownloader(t: (key: string, defaultValue?: any) => string) {
  const downloadAttachment = async (url: string) => {
    try {
      const getApiOrigin = () => {
        try {
          const base = (api.defaults.baseURL || '').toString();
          const u = new URL(base);
          return u.origin;
        } catch {
          return window.location.origin;
        }
      };

      const normalizedUrl = (() => {
        try {
          const u = new URL(url);
          return u.toString();
        } catch {
          const origin = getApiOrigin();
          const leading = url.startsWith('/') ? '' : '/';
          return `${origin}${leading}${url}`;
        }
      })();

      const res = await fetch(normalizedUrl, { credentials: 'omit' });
      if (!res.ok) throw new Error('Failed to fetch file');
      const blob = await res.blob();
      const filename = (() => { try { const u = new URL(normalizedUrl); return decodeURIComponent(u.pathname.split('/').pop() || 'file'); } catch { return 'file'; } })();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast.error(t('chat.errors.downloadFile'));
    }
  };

  return { downloadAttachment };
}
