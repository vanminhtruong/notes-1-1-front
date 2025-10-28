import { useEffect } from 'react';
import { blockService } from '@/services/blockService';
import { getSocket } from '../../components/interface/chatWindowImports';
import type { User } from '../../components/interface/chatWindowImports';

interface UseBlockStatusEffectProps {
  selectedChat: User | null;
  currentUserId?: number;
  setBlockStatus: React.Dispatch<React.SetStateAction<any>>;
}

export const useBlockStatusEffect = ({
  selectedChat,
  currentUserId,
  setBlockStatus,
}: UseBlockStatusEffectProps) => {
  useEffect(() => {
    let mounted = true;
    setBlockStatus(null);
    if (!selectedChat) return;
    
    (async () => {
      try {
        const res = await blockService.getStatus(selectedChat.id);
        if (mounted) setBlockStatus(res.data);
      } catch {
        if (mounted) setBlockStatus(null);
      }
    })();

    const socket = getSocket();
    const refreshIfMatch = (payload: any) => {
      const userId = Number(payload?.userId);
      const targetId = Number(payload?.targetId);
      const me = Number(currentUserId);
      const other = Number(selectedChat?.id);
      if (!me || !other) return;
      const involvesPair = (userId === me && targetId === other) || (userId === other && targetId === me);
      if (involvesPair) {
        blockService
          .getStatus(other)
          .then((res) => setBlockStatus(res.data))
          .catch(() => {});
      }
    };
    
    if (socket) {
      socket.on('user_blocked', refreshIfMatch);
      socket.on('user_unblocked', refreshIfMatch);
    }
    
    return () => {
      mounted = false;
      if (socket) {
        socket.off('user_blocked', refreshIfMatch);
        socket.off('user_unblocked', refreshIfMatch);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.id, currentUserId]);
};
