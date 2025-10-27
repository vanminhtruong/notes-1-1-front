import { useCallback } from 'react';
import { getSocket } from '../../../../services/socket';
import { chatService } from '../../../../services/chatService';
import { groupService } from '../../../../services/groupService';
import type { User, Message } from '../../components/interface/ChatTypes.interface';
import type { GroupSummary } from '../../../../services/groupService';

export function useChatOpeners(params: {
  currentUser: User | null | undefined;
  friends: User[];
  users: User[];
  setSelectedChat: React.Dispatch<React.SetStateAction<User | null>>;
  setSelectedGroup: React.Dispatch<React.SetStateAction<GroupSummary | null>>;
  setActiveTab: React.Dispatch<React.SetStateAction<'users' | 'chats' | 'unread' | 'groups' | 'sharedNotes'>>;
  markChatAsRead: (userId: number, onSuccess?: () => void) => Promise<void>;
  markGroupAsRead: (groupId: number) => void;
  refreshChatList: () => Promise<void>;
  setChatList: React.Dispatch<React.SetStateAction<Array<{ friend: User; lastMessage: Message | null; unreadCount?: number; friendshipId?: number }>>>;
  setMenuOpenKey: React.Dispatch<React.SetStateAction<string | null>>;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setHistoryLoading: React.Dispatch<React.SetStateAction<boolean>>;
  pendingImages: Array<{ id: string; file: File; preview: string }>;
  setPendingImages: React.Dispatch<React.SetStateAction<Array<{ id: string; file: File; preview: string }>>>;
  pendingFiles: Array<{ id: string; file: File }>;
  setPendingFiles: React.Dispatch<React.SetStateAction<Array<{ id: string; file: File }>>>;
  scrollToBottom: () => void;
}) {
  const {
    currentUser,
    friends,
    users,
    setSelectedChat,
    setSelectedGroup,
    setActiveTab,
    markChatAsRead,
    markGroupAsRead,
    refreshChatList,
    setChatList,
    setMenuOpenKey,
    setMessages,
    setHistoryLoading,
    pendingImages,
    setPendingImages,
    pendingFiles,
    setPendingFiles,
    scrollToBottom,
  } = params;

  const clearPending = useCallback(() => {
    if (pendingImages.length) {
      pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setPendingImages([]);
    }
    if (pendingFiles.length) {
      setPendingFiles([]);
    }
  }, [pendingImages, pendingFiles, setPendingFiles, setPendingImages]);

  const startChat = useCallback(async (user: User) => {
    clearPending();

    setSelectedGroup(null);
    // Get the most up-to-date user info from friends list to preserve online status
    const updatedUser = friends.find(f => f.id === user.id) || users.find(u => u.id === user.id) || user;
    setSelectedChat(updatedUser);
    setActiveTab('chats');

    // Notify backend that we joined this 1-1 chat so it can mark unread and emit receipts
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit('join_chat', { receiverId: user.id });
      }
    } catch (_e) {
      // ignore socket errors
    }

    await markChatAsRead(user.id, () => {
      // Optimistic local update for responsiveness
      setChatList((prev) => prev.map((it) => (it.friend.id === user.id ? { ...it, unreadCount: 0 } : it)));
      // And immediately fetch authoritative counts from backend
      void refreshChatList();
    });

    try {
      setHistoryLoading(true);
      const response = await chatService.getChatMessages(user.id);
      if (response.success) {
        // Update selectedChat with recipient status if provided
        if (response.recipient && typeof response.recipient.isActive === 'boolean') {
          setSelectedChat((prev) => prev ? { ...prev, isActive: response.recipient.isActive } : null);
        }
        // Normalize DM read receipts for persistence across reloads
        const msgs = (response.data as any[]).map((m: any) => {
          // Prefer existing readBy if already provided
          if (Array.isArray(m.readBy)) return m;
          // Backend variations: MessageReads / messageReads / reads
          const rawReads = (m && (m.MessageReads || m.messageReads || m.reads)) as any[] | undefined;
          let readBy: any[] = [];
          if (Array.isArray(rawReads)) {
            readBy = rawReads.map((read: any) => {
              const fallbackUser = friends.find((f) => f.id === read.userId) || users.find((uu) => uu.id === read.userId);
              return {
                userId: read.userId,
                readAt: read.readAt || read.createdAt || new Date().toISOString(),
                user: read.user || fallbackUser,
              };
            });
          }
          const isOwn = !!currentUser && m.senderId === currentUser.id;
          const readByOthers = readBy.filter((rb: any) => rb.userId !== currentUser?.id);
          let status = isOwn && readByOthers.length > 0 ? 'read' : m.status;

          // If backend marks message as read but didn't include readBy yet (after reload),
          // synthesize a minimal readBy entry using the other participant so avatars persist.
          if (isOwn && status === 'read' && readByOthers.length === 0 && user?.id) {
            const other = friends.find((f) => f.id === user.id) || users.find((uu) => uu.id === user.id) || user;
            const synthetic = {
              userId: other.id,
              readAt: m.updatedAt || m.readAt || m.createdAt || new Date().toISOString(),
              user: { id: other.id, name: other.name, avatar: (other as any).avatar },
            };
            readBy = [...readBy, synthetic];
            status = 'read';
          }
          return { ...m, readBy, status };
        });
        setMessages(msgs);
        setMenuOpenKey(null);
        setTimeout(scrollToBottom, 100);
        // No-op for DM: group-specific events not applicable here
      } else {
        setMessages([]);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading chat messages:', error);
      setMessages([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [clearPending, markChatAsRead, scrollToBottom, setActiveTab, setChatList, setMenuOpenKey, setMessages, setSelectedChat, setSelectedGroup]);

  const startGroupChat = useCallback(async (group: GroupSummary) => {
    clearPending();

    setSelectedChat(null);
    setSelectedGroup(group);
    setActiveTab('groups');
    // Update local unread map (notifications hook)
    markGroupAsRead(group.id);
    // Explicitly notify backend to mark as read for authoritative unread counts
    try { await groupService.markGroupMessagesRead(group.id); } catch {}
    // Notify other UI (e.g., GroupsTab list) to refresh unread badges
    try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('group_marked_read', { detail: { groupId: group.id } })); } catch {}

    try {
      setHistoryLoading(true);
      // Preload members to resolve sender avatars accurately
      let memberMap: Record<number, { id: number; name: string; avatar?: string | null }> = {};
      try {
        const memRes = await groupService.getGroupMembers(group.id);
        for (const u of (memRes?.data || [])) {
          const id = Number(u.id);
          if (!Number.isFinite(id)) continue;
          memberMap[id] = { id, name: String(u.name || `User ${id}`), avatar: u.avatar || null };
        }
      } catch {}

      const response = await groupService.getGroupMessages(group.id);
      if (response.success) {
        const msgs = (response.data as any[]).map((m: any) => {
          const u = (currentUser && currentUser.id === m.senderId)
            ? currentUser
            : (memberMap[m.senderId] || friends.find((f) => f.id === m.senderId) || users.find((uu) => uu.id === m.senderId));
          
          // Convert GroupMessageReads to readBy format for frontend
          let readBy: any[] = [];
          if (m.GroupMessageReads && Array.isArray(m.GroupMessageReads)) {
            readBy = m.GroupMessageReads.map((read: any) => ({
              userId: read.userId,
              readAt: read.readAt,
              user: read.user
            }));
          }
          // If it's our own message and someone else has read it, mark status as 'read'
          const isOwn = !!currentUser && m.senderId === currentUser.id;
          const readByOthers = readBy.filter((rb: any) => rb.userId !== currentUser?.id);
          const status = isOwn && readByOthers.length > 0 ? 'read' : m.status;

          return u ? { 
            ...m, 
            sender: { id: Number((u as any).id), name: String((u as any).name), avatar: (u as any).avatar },
            readBy,
            status,
          } : { 
            ...m, 
            readBy,
            status,
          };
        });
        setMessages(msgs);
        setMenuOpenKey(null);
        setTimeout(scrollToBottom, 100);
      } else {
        setMessages([]);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading group messages:', error);
      setMessages([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [clearPending, currentUser, friends, users, markGroupAsRead, scrollToBottom, setMenuOpenKey, setMessages, setSelectedChat, setSelectedGroup, setActiveTab]);

  const openChatById = useCallback((userId: number) => {
    const user = friends.find(f => f.id === userId) || users.find(u => u.id === userId);
    if (user) startChat(user);
  }, [friends, users, startChat]);

  return { startChat, startGroupChat, openChatById };
}
