import { useMemo } from 'react';
import type { Message, MessageGroup } from '../../components/component-child/ChatWindow-child/types';

export function useGroupedMessages(messages: Message[] | any[]): MessageGroup[] {
  return useMemo(() => {
    const GROUP_WINDOW_MS = 60 * 1000; // 1 minute window
    if (!messages || messages.length === 0) return [] as MessageGroup[];
    const sorted = [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const groups: MessageGroup[] = [];
    let current: MessageGroup | null = null;

    for (const m of sorted) {
      if (!current) {
        current = { senderId: m.senderId, items: [m], start: m.createdAt, end: m.createdAt };
        continue;
      }
      const sameSender = m.senderId === current.senderId;
      const delta = new Date(m.createdAt).getTime() - new Date(current.end).getTime();
      if (sameSender && delta <= GROUP_WINDOW_MS) {
        current.items.push(m);
        current.end = m.createdAt;
      } else {
        groups.push(current);
        current = { senderId: m.senderId, items: [m], start: m.createdAt, end: m.createdAt };
      }
    }
    if (current) groups.push(current);
    return groups;
  }, [messages]);
}
