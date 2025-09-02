import { useEffect } from 'react';

export function useAutoScroll(messages: any[], isPartnerTyping: boolean, scrollToBottom: () => void, selectedChatId?: number | null, selectedGroupId?: number | null) {
  // Always scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Scroll to bottom when entering a new chat
  useEffect(() => {
    if (selectedChatId || selectedGroupId) {
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedChatId, selectedGroupId, scrollToBottom]);

  // Scroll to bottom when partner is typing
  useEffect(() => {
    if (isPartnerTyping) {
      setTimeout(scrollToBottom, 50);
    }
  }, [isPartnerTyping, scrollToBottom]);
}
