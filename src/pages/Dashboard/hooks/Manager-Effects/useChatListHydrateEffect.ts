import { useEffect } from 'react';
import type { User, Message } from '../../components/interface/chatWindowImports';

interface UseChatListHydrateEffectProps {
  chatList: Array<{ friend: User; lastMessage: Message | null; unreadCount?: number; friendshipId?: number; isPinned?: boolean }>;
  hydrateFromChatList: (chatList: any) => void;
}

export const useChatListHydrateEffect = ({
  chatList,
  hydrateFromChatList,
}: UseChatListHydrateEffectProps) => {
  useEffect(() => {
    if (Array.isArray(chatList) && chatList.length >= 0) {
      hydrateFromChatList(chatList as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatList]);
};
