import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { chatService, groupService } from '../../components/interface/chatWindowImports';
import type { User, Message, GroupSummary } from '../../components/interface/chatWindowImports';

interface UseMessageActionsHandlerProps {
  selectedChat: User | null;
  selectedGroup: GroupSummary | null;
  setMessages: React.Dispatch<React.SetStateAction<(Message | any)[]>>;
  setChatList: React.Dispatch<React.SetStateAction<Array<{ friend: User; lastMessage: Message | null; unreadCount?: number; friendshipId?: number; isPinned?: boolean }>>>;
  setMenuOpenKey: React.Dispatch<React.SetStateAction<string | null>>;
  t: any;
}

export const useMessageActionsHandler = ({
  selectedChat,
  selectedGroup,
  setMessages,
  setChatList,
  setMenuOpenKey,
  t,
}: UseMessageActionsHandlerProps) => {
  const editMessage = useCallback(async (msg: Message, content: string) => {
    try {
      if (selectedGroup) {
        const res = await groupService.editGroupMessage(selectedGroup.id, msg.id, content);
        if (res.success) {
          setMessages((prev) => prev.map((m: any) => (m.id === msg.id ? { ...m, content: res.data.content, updatedAt: res.data.updatedAt } : m)));
          toast.success(t('chat.success.edit', 'Đã cập nhật tin nhắn'));
        }
      } else if (selectedChat) {
        const res = await chatService.editMessage(msg.id, content);
        if (res.success) {
          setMessages((prev) => prev.map((m: any) => (m.id === msg.id ? { ...m, content: res.data.content, updatedAt: res.data.updatedAt } : m)));
          setChatList((prev) => prev.map((it) => {
            const lm = it.lastMessage;
            if (!lm || lm.id !== msg.id) return it;
            return { ...it, lastMessage: { ...lm, content: res.data.content } };
          }));
          toast.success(t('chat.success.edit', 'Đã cập nhật tin nhắn'));
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('chat.errors.generic'));
    }
  }, [selectedGroup, selectedChat, setMessages, setChatList, t]);

  const recallMessage = useCallback(async (msg: Message, scope: 'self' | 'all') => {
    try {
      let ok = false;
      if (selectedGroup) {
        const resp = await groupService.recallGroupMessages(selectedGroup.id, [msg.id], scope);
        ok = !!resp.success;
      } else if (selectedChat) {
        const resp = await chatService.recallMessages([msg.id], scope);
        ok = !!resp.success;
      } else {
        return;
      }
      if (ok) {
        if (scope === 'self') {
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
          toast.success(t('chat.success.recallSelf'));
        } else {
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isDeletedForAll: true } : m)));
          setChatList((prev) => prev.map((it) => {
            const lm = it.lastMessage;
            if (!lm || lm.id !== msg.id) return it;
            return { ...it, lastMessage: { ...lm, isDeletedForAll: true } };
          }));
          toast.success(t('chat.success.recallAll'));
        }
        setMenuOpenKey(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.recall'));
    }
  }, [selectedGroup, selectedChat, setMessages, setChatList, setMenuOpenKey, t]);

  const recallGroup = useCallback(async (group: any, scope: 'self' | 'all') => {
    const ids = group.items.map((i: any) => i.id);
    try {
      let ok = false;
      if (selectedGroup) {
        const resp = await groupService.recallGroupMessages(selectedGroup.id, ids, scope);
        ok = !!resp.success;
      } else if (selectedChat) {
        const resp = await chatService.recallMessages(ids, scope);
        ok = !!resp.success;
      } else {
        return;
      }
      if (ok) {
        if (scope === 'self') {
          setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
          toast.success(t('chat.success.recallSelf'));
        } else {
          setMessages((prev) => prev.map((m) => (ids.includes(m.id) ? { ...m, isDeletedForAll: true } : m)));
          toast.success(t('chat.success.recallAll'));
        }
        setMenuOpenKey(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.recall'));
    }
  }, [selectedGroup, selectedChat, setMessages, setMenuOpenKey, t]);

  const handlePrependMessages = useCallback((older: any[]) => {
    if (!Array.isArray(older) || older.length === 0) return;
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m: any) => m.id));
      const dedup = older.filter((m: any) => m && !existingIds.has(m.id));
      if (dedup.length === 0) return prev;
      return [...dedup, ...prev];
    });
  }, [setMessages]);

  const handleRemoveMessages = useCallback((messageIds: number[]) => {
    setMessages((prev) => prev.filter((m: any) => !messageIds.includes(m.id)));
  }, [setMessages]);

  return {
    editMessage,
    recallMessage,
    recallGroup,
    handlePrependMessages,
    handleRemoveMessages,
  };
};
