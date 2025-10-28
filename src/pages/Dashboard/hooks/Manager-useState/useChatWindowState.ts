import { useState } from 'react';
import type { User, Message, GroupSummary } from '../../components/interface/chatWindowImports';

export const useChatWindowState = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'chats' | 'unread' | 'groups' | 'sharedNotes'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [friendRequestsMeta, setFriendRequestsMeta] = useState<Record<number, string | Date>>({});
  const [persistedFriendRequests, setPersistedFriendRequests] = useState<User[]>([]);
  const [persistedFriendRequestsMeta, setPersistedFriendRequestsMeta] = useState<Record<number, string | Date>>({});
  const [selectedChat, setSelectedChat] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupSummary | null>(null);
  const [messages, setMessages] = useState<(Message | any)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineIds, setOnlineIds] = useState<number[]>([]);
  const [chatList, setChatList] = useState<Array<{ friend: User; lastMessage: Message | null; unreadCount?: number; friendshipId?: number; isPinned?: boolean }>>([]);
  const [myGroups, setMyGroups] = useState<GroupSummary[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Array<{ id: number; status: 'pending' | 'accepted' | 'declined'; group: any; inviter: any }>>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  return {
    activeTab,
    setActiveTab,
    users,
    setUsers,
    friends,
    setFriends,
    friendRequests,
    setFriendRequests,
    friendRequestsMeta,
    setFriendRequestsMeta,
    persistedFriendRequests,
    setPersistedFriendRequests,
    persistedFriendRequestsMeta,
    setPersistedFriendRequestsMeta,
    selectedChat,
    setSelectedChat,
    selectedGroup,
    setSelectedGroup,
    messages,
    setMessages,
    searchTerm,
    setSearchTerm,
    onlineIds,
    setOnlineIds,
    chatList,
    setChatList,
    myGroups,
    setMyGroups,
    pendingInvites,
    setPendingInvites,
    historyLoading,
    setHistoryLoading,
  };
};
