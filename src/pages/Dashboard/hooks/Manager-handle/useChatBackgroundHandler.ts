import { useCallback } from 'react';
import { chatService } from '../../../../services/chatService';
import { uploadService } from '../../../../services/uploadService';
import toast from 'react-hot-toast';
import type { TFunction } from 'i18next';
import { getSocket } from '../../../../services/socket';

interface UseChatBackgroundHandlerProps {
  setChatBackgroundUrl: (url: string | null) => void;
  t: TFunction<'dashboard'>;
}

export const useChatBackgroundHandler = ({ 
  setChatBackgroundUrl, 
  t 
}: UseChatBackgroundHandlerProps) => {
  const changeBackground = useCallback(async (selectedChatIdParam: number | null) => {
    try {
      if (!selectedChatIdParam) return;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const loadingId = toast.loading(t('chat.background.uploading', 'Đang tải ảnh nền...'));
        try {
          const { url } = await uploadService.uploadImage(file);
          const resp = await chatService.setChatBackground(selectedChatIdParam, url);
          setChatBackgroundUrl(resp?.data?.backgroundUrl || url || null);
          const socket = getSocket();
          if (socket) {
            socket.emit('chat_background_update', { userId: selectedChatIdParam, backgroundUrl: url });
          }
          toast.success(t('chat.background.updated', 'Đã cập nhật ảnh nền'));
        } catch (err: any) {
          toast.error(err?.response?.data?.message || t('chat.errors.generic'));
        } finally {
          toast.dismiss(loadingId);
        }
      };
      input.click();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('chat.errors.generic'));
    }
  }, [setChatBackgroundUrl, t]);

  const changeBackgroundForBoth = useCallback(async (selectedChatIdParam: number | null) => {
    try {
      if (!selectedChatIdParam) return;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const loadingId = toast.loading(t('chat.background.uploading', 'Đang tải ảnh nền...'));
        try {
          const { url } = await uploadService.uploadImage(file);
          const resp = await chatService.setChatBackground(selectedChatIdParam, url);
          setChatBackgroundUrl(resp?.data?.backgroundUrl || url || null);
          const socket = getSocket();
          if (socket) {
            socket.emit('chat_background_update', { userId: selectedChatIdParam, backgroundUrl: url, persistForPeer: true });
          }
          toast.success(t('chat.background.updated', 'Đã cập nhật ảnh nền'));
        } catch (err: any) {
          toast.error(err?.response?.data?.message || t('chat.errors.generic'));
        } finally {
          toast.dismiss(loadingId);
        }
      };
      input.click();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('chat.errors.generic'));
    }
  }, [setChatBackgroundUrl, t]);

  const resetBackground = useCallback(async (selectedChatIdParam: number | null) => {
    try {
      if (!selectedChatIdParam) return;
      const resp = await chatService.setChatBackground(selectedChatIdParam, null);
      setChatBackgroundUrl(resp?.data?.backgroundUrl || null);
      const socket = getSocket();
      if (socket) {
        socket.emit('chat_background_update', { userId: selectedChatIdParam, backgroundUrl: null });
      }
      toast.success(t('chat.background.reset', 'Đã khôi phục nền mặc định'));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('chat.errors.generic'));
    }
  }, [setChatBackgroundUrl, t]);

  return { 
    changeBackground, 
    changeBackgroundForBoth, 
    resetBackground 
  };
};
