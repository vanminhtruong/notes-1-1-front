import { useCallback } from 'react';
import { chatService } from '../../../services/chatService';
import { groupService } from '../../../services/groupService';
import type { User, Message } from '../components/component-child/ChatWindow-child/types';
import type { GroupSummary } from '../../../services/groupService';

export function useChatOpeners(params: {
  currentUser: User | null | undefined;
  friends: User[];
  users: User[];
  setSelectedChat: React.Dispatch<React.SetStateAction<User | null>>;
  setSelectedGroup: React.Dispatch<React.SetStateAction<GroupSummary | null>>;
  setActiveTab: React.Dispatch<React.SetStateAction<'users' | 'chats' | 'unread' | 'groups'>>;
  markChatAsRead: (userId: number) => void;
  markGroupAsRead: (groupId: number) => void;
  setChatList: React.Dispatch<React.SetStateAction<Array<{ friend: User; lastMessage: Message | null; unreadCount?: number; friendshipId?: number }>>>;
  setMenuOpenKey: React.Dispatch<React.SetStateAction<string | null>>;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
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
    setChatList,
    setMenuOpenKey,
    setMessages,
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

    markChatAsRead(user.id);
    setChatList((prev) => prev.map((it) => (it.friend.id === user.id ? { ...it, unreadCount: 0 } : it)));

    try {
      const response = await chatService.getChatMessages(user.id);
      if (response.success) {
        setMessages(response.data);
        setMenuOpenKey(null);
        setTimeout(scrollToBottom, 100);
      } else {
        setMessages([]);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading chat messages:', error);
      setMessages([]);
    }
  }, [clearPending, markChatAsRead, scrollToBottom, setActiveTab, setChatList, setMenuOpenKey, setMessages, setSelectedChat, setSelectedGroup]);

  const startGroupChat = useCallback(async (group: GroupSummary) => {
    clearPending();

    setSelectedChat(null);
    setSelectedGroup(group);
    setActiveTab('groups');
    markGroupAsRead(group.id);

    try {
      const response = await groupService.getGroupMessages(group.id);
      if (response.success) {
        const msgs = (response.data as any[]).map((m: any) => {
          const u = (currentUser && currentUser.id === m.senderId)
            ? currentUser
            : (friends.find((f) => f.id === m.senderId) || users.find((uu) => uu.id === m.senderId));
          return u ? { ...m, sender: { id: u.id, name: u.name, avatar: u.avatar } } : m;
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
    }
  }, [clearPending, currentUser, friends, users, markGroupAsRead, scrollToBottom, setMenuOpenKey, setMessages, setSelectedChat, setSelectedGroup, setActiveTab]);

  const openChatById = useCallback((userId: number) => {
    const user = friends.find(f => f.id === userId) || users.find(u => u.id === userId);
    if (user) startChat(user);
  }, [friends, users, startChat]);

  return { startChat, startGroupChat, openChatById };
}
