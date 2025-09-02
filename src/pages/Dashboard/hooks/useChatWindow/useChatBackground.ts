import { useEffect, useState } from 'react';
import { chatService } from '../../../../services/chatService';
import { uploadService } from '../../../../services/uploadService';
import toast from 'react-hot-toast';
import type { TFunction } from 'i18next';
import { getSocket } from '../../../../services/socket';

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

  // Listen for realtime background updates from socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (payload: { userId: number; backgroundUrl: string | null }) => {
      if (!selectedChatId) return;
      if (payload && payload.userId === selectedChatId) {
        setChatBackgroundUrl(payload.backgroundUrl || null);
      }
    };
    socket.off('chat_background_update', handler);
    socket.on('chat_background_update', handler);
    return () => {
      socket.off('chat_background_update', handler);
    };
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
  };

  const changeBackgroundForBoth = async (selectedChatIdParam: number | null) => {
    // For frontend, same flow as changeBackground but we explicitly broadcast to the other user as well
    await changeBackground(selectedChatIdParam);
  };

  const resetBackground = async (selectedChatIdParam: number | null) => {
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
  };

  return { chatBackgroundUrl, changeBackground, changeBackgroundForBoth, resetBackground };
}
