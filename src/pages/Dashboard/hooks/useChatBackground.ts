import { useEffect, useState } from 'react';
import { chatService } from '../../../services/chatService';
import { uploadService } from '../../../services/uploadService';
import toast from 'react-hot-toast';
import type { TFunction } from 'i18next';

export function useChatBackground(selectedChatId: number | null, t: TFunction<'dashboard'>) {
  const [chatBackgroundUrl, setChatBackgroundUrl] = useState<string | null>(null);

  // Load per-chat background on chat selection
  useEffect(() => {
    const loadBackground = async () => {
      if (!selectedChatId) {
        setChatBackgroundUrl(null);
        return;
      }
      try {
        const resp = await chatService.getChatBackground(selectedChatId);
        setChatBackgroundUrl(resp?.data?.backgroundUrl || null);
      } catch {
        setChatBackgroundUrl(null);
      }
    };
    loadBackground();
  }, [selectedChatId]);

  const changeBackground = async (selectedChatIdParam: number | null) => {
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
  };

  const resetBackground = async (selectedChatIdParam: number | null) => {
    try {
      if (!selectedChatIdParam) return;
      const resp = await chatService.setChatBackground(selectedChatIdParam, null);
      setChatBackgroundUrl(resp?.data?.backgroundUrl || null);
      toast.success(t('chat.background.reset', 'Đã khôi phục nền mặc định'));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('chat.errors.generic'));
    }
  };

  return { chatBackgroundUrl, changeBackground, resetBackground };
}
