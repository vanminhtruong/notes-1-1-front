import { useEffect } from 'react';
import { chatService } from '../../../../services/chatService';
import { getSocket } from '../../../../services/socket';

interface UseChatBackgroundEffectsProps {
  selectedChatId: number | null;
  setChatBackgroundUrl: (url: string | null) => void;
}

export const useChatBackgroundEffects = ({ 
  selectedChatId, 
  setChatBackgroundUrl 
}: UseChatBackgroundEffectsProps) => {
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
  }, [selectedChatId, setChatBackgroundUrl]);

  // Listen for realtime background updates from socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = async (payload: { userId: number; backgroundUrl: string | null; persistForPeer?: boolean }) => {
      if (!selectedChatId) return;
      if (payload && payload.userId === selectedChatId) {
        setChatBackgroundUrl(payload.backgroundUrl || null);
        // If sender requests peer persistence, save it on this client as well
        if (payload.persistForPeer === true) {
          try {
            await chatService.setChatBackground(selectedChatId, payload.backgroundUrl ?? null);
          } catch {
            // ignore persistence errors on peer
          }
        }
      }
    };
    socket.off('chat_background_update', handler);
    socket.on('chat_background_update', handler);
    return () => {
      socket.off('chat_background_update', handler);
    };
  }, [selectedChatId, setChatBackgroundUrl]);
};
