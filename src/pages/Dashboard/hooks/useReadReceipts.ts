import { useEffect } from 'react';
import { getSocket } from '../../../services/socket';
import type { Message } from '../components/component-child/ChatWindow-child/types';

interface Params {
  selectedChatId: number | null;
  currentUserId: number | undefined;
  messages: Message[] | any[];
  markChatAsRead: (chatId: number, after?: () => void) => void;
  loadChatList: () => Promise<void> | void;
  setMessages: (updater: (prev: any[]) => any[]) => void;
}

export function useReadReceipts({
  selectedChatId,
  currentUserId,
  messages,
  markChatAsRead,
  loadChatList,
  setMessages,
}: Params) {
  useEffect(() => {
    if (!selectedChatId || !currentUserId) return;

    const socket = getSocket();
    if (!socket) return;

    const unreadMessages = messages.filter(
      (msg: any) => msg.senderId !== currentUserId && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      markChatAsRead(selectedChatId, () => {
        loadChatList();
      });

      setMessages((prev: any[]) => {
        return prev.map((m: any) => {
          if (unreadMessages.some((um: any) => um.id === m.id)) {
            const readBy = m.readBy || [];
            const existingIndex = readBy.findIndex((rb: any) => rb.userId === currentUserId);
            let updatedReadBy;
            if (existingIndex >= 0) {
              updatedReadBy = [...readBy];
              updatedReadBy[existingIndex] = {
                userId: currentUserId,
                readAt: new Date().toISOString(),
              };
            } else {
              updatedReadBy = [
                ...readBy,
                {
                  userId: currentUserId,
                  readAt: new Date().toISOString(),
                },
              ];
            }
            return {
              ...m,
              status: 'read',
              isRead: true,
              readBy: updatedReadBy,
            };
          }
          return m;
        });
      });

      unreadMessages.forEach((msg: any) => {
        socket.emit('message_read', {
          messageId: msg.id,
          chatId: selectedChatId,
          userId: currentUserId,
          readAt: new Date().toISOString(),
        });
      });
    }
  }, [selectedChatId, currentUserId, messages.length]);
}
