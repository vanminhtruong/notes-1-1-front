import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { chatService } from '../../../../services/chatService';
import { groupService } from '../../../../services/groupService';
import type { User, Message } from '../../components/interface/ChatTypes.interface';
import type { GroupSummary } from '../../../../services/groupService';

export type ChatListItem = {
  friend: User;
  lastMessage: Message | null;
  unreadCount?: number;
  friendshipId?: number;
  isPinned?: boolean;
  nickname?: string | null;
};

interface UseChatDataParams {
  setUsers: Dispatch<SetStateAction<User[]>>;
  setFriends: Dispatch<SetStateAction<User[]>>;
  setOnlineIds: Dispatch<SetStateAction<number[]>>;
  setChatList: Dispatch<SetStateAction<ChatListItem[]>>;
  setFriendRequests: Dispatch<SetStateAction<User[]>>;
  setPendingInvites: Dispatch<SetStateAction<Array<{ id: number; status: 'pending' | 'accepted' | 'declined'; group: any; inviter: any }>>>;
  setMyGroups: Dispatch<SetStateAction<GroupSummary[]>>;
}

export function useChatData({
  setUsers,
  setFriends,
  setOnlineIds,
  setChatList,
  setFriendRequests,
  setPendingInvites,
  setMyGroups,
}: UseChatDataParams) {
  const loadUsers = async (search?: string) => {
    try {
      const response = await chatService.getUsers(search);
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadFriends = async () => {
    try {
      const response = await chatService.getFriends();
      if (response.success) {
        setFriends(response.data);
        // Initialize onlineIds from friends list
        const online = (response.data || [])
          .filter((u: any) => u.isOnline)
          .map((u: any) => u.id);
        setOnlineIds(online);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadChatList = async () => {
    try {
      const response = await chatService.getChatList();
      if (response.success) {
        const items = (response.data || []).map((it: any) => ({
          friend: it.friend as User,
          lastMessage: it.lastMessage as Message | null,
          unreadCount: it.unreadCount as number | undefined,
          friendshipId: it.friendshipId as number | undefined,
          isPinned: !!it.isPinned,
          nickname: it.nickname ?? null,
        }));
        setChatList(items);
      }
    } catch (error) {
      console.error('Error loading chat list:', error);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const response = await chatService.getFriendRequests();
      if (response.success) {
        setFriendRequests(response.data.map((req: any) => req.requester));
      }
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const loadPendingInvites = async () => {
    try {
      const res = await groupService.getMyInvites();
      if (res.success) {
        setPendingInvites((res.data || []).filter((inv: any) => inv.status === 'pending'));
      }
    } catch (e) {
      // silent
    }
  };

  const loadMyGroups = async () => {
    try {
      const res = await groupService.listMyGroups();
      if (res.success) setMyGroups(res.data || []);
    } catch (e) {
      // noop
    }
  };

  // Initial load (moved from ChatWindow)
  useEffect(() => {
    loadFriends();
    loadFriendRequests();
    loadUsers();
    loadChatList();
    loadPendingInvites();
  }, []);

  // Fetch groups once for bell metadata
  useEffect(() => {
    loadMyGroups();
  }, []);

  return {
    loadUsers,
    loadFriends,
    loadChatList,
    loadFriendRequests,
    loadPendingInvites,
    loadMyGroups,
  };
}
