import { useEffect } from 'react';
import type { User } from '../../components/interface/ChatTypes.interface';

interface Params {
  selectedChatId: number | null;
  selectedGroup: any | null;
  friends: User[];
  users: User[];
  setIsPartnerTyping: (v: boolean) => void;
  setGroupTypingUsers: (v: any[]) => void;
  setMessages: (updater: (prev: any[]) => any[]) => void;
}

export function useTypingAndGroupSync({
  selectedChatId,
  selectedGroup,
  friends,
  users,
  setIsPartnerTyping,
  setGroupTypingUsers,
  setMessages,
}: Params) {
  useEffect(() => {
    setIsPartnerTyping(false);
  }, [selectedChatId]);

  useEffect(() => {
    setGroupTypingUsers([]);
  }, [selectedGroup?.id]);

  useEffect(() => {
    if (!selectedGroup) return;
    if ((!friends || friends.length === 0) && (!users || users.length === 0)) return;
    setMessages((prev: any[]) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev;
      const byId = new Map<number, any>();
      friends.forEach((u) => byId.set(u.id, u));
      users.forEach((u) => byId.set(u.id, u));
      return prev.map((m: any) => {
        if (!m || typeof m !== 'object' || !('senderId' in m)) return m;
        const u = byId.get(m.senderId);
        if (!u) return m;
        const sender = m.sender || {};
        if (sender.avatar !== u.avatar || sender.name !== u.name) {
          return { ...m, sender: { id: u.id, name: u.name, avatar: u.avatar } };
        }
        return m;
      });
    });
  }, [selectedGroup?.id, friends, users]);
}
