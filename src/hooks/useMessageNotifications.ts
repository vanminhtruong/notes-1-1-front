import { useCallback } from 'react';
import { chatService } from '@/services/chatService';
import { groupService } from '@/services/groupService';

// Chat unread counters/filters are removed. These callbacks solely preserve
// read receipts ("seen") for existing conversations.
export function useMessageNotifications() {
  const markChatAsRead = useCallback(async (otherUserId: number, onSuccess?: () => void) => {
    try {
      await chatService.markMessagesAsRead(otherUserId);
      onSuccess?.();
    } catch (error) {
      console.error('Unable to update message read receipt:', error);
    }
  }, []);

  const markGroupAsRead = useCallback(async (groupId: number) => {
    try {
      await groupService.markGroupMessagesRead(groupId);
    } catch (error) {
      console.error('Unable to update group read receipt:', error);
    }
  }, []);

  // Preserve API compatibility while removing all unread subscriptions, state
  // updates, and network requests for unread counts.
  return { markChatAsRead, markGroupAsRead };
}
