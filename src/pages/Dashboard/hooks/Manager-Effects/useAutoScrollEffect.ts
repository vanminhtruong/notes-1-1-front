import { useEffect, useRef } from 'react';

export function useAutoScroll(messages: any[], isPartnerTyping: boolean, scrollToBottom: () => void, selectedChatId?: number | null, selectedGroupId?: number | null) {
  // Scroll to bottom only when a new message is appended at the end
  // Avoid scrolling on reactions/edits or when prepending older messages
  const prevLenRef = useRef<number>(-1);
  const prevLastIdRef = useRef<any>(null);
  useEffect(() => {
    const newLen = Array.isArray(messages) ? messages.length : 0;
    const newLastId = newLen > 0 ? (messages as any[])[newLen - 1]?.id : null;
    const prevLen = prevLenRef.current;
    const prevLastId = prevLastIdRef.current;

    // Append detected if list grew and the last message id changed
    const appendedNewMessage = newLen > prevLen && newLastId !== prevLastId;
    if (appendedNewMessage) {
      scrollToBottom();
    }

    prevLenRef.current = newLen;
    prevLastIdRef.current = newLastId;
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
