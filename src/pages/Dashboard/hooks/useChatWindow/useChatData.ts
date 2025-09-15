import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { chatService } from '../../../../services/chatService';
import { notificationService, type BackendNotification } from '../../../../services/notificationService';
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
  setFriendRequestsMeta?: Dispatch<SetStateAction<Record<number, string | Date>>>;
  setPersistedFriendRequests?: Dispatch<SetStateAction<User[]>>;
  setPersistedFriendRequestsMeta?: Dispatch<SetStateAction<Record<number, string | Date>>>;
  setPendingInvites: Dispatch<SetStateAction<Array<{ id: number; status: 'pending' | 'accepted' | 'declined'; group: any; inviter: any }>>>;
  setPersistedInvites?: Dispatch<SetStateAction<Array<{ id: number; status: 'pending' | 'accepted' | 'declined'; group: any; inviter: any; createdAt?: string }>>>;
  // NEW: ALL (read + unread) aggregated sources for persistent presence and latest times
  setPersistedAllFriendRequestsMeta?: Dispatch<SetStateAction<Record<number, string | Date>>>;
  setPersistedAllInvites?: Dispatch<SetStateAction<Array<{ id: number; status: 'pending' | 'accepted' | 'declined'; group: any; inviter: any; createdAt?: string }>>>;
  // NEW: ALL messages for bell persistence when unread count is 0
  setPersistedAllMessages?: Dispatch<SetStateAction<Array<{ otherUserId: number; user: any; createdAt: string }>>>;
  // NEW: Latest friend-request user for avatar seeding after mark-all-read
  setPersistedAllFriendRequestsUsers?: Dispatch<SetStateAction<User[]>>;
  setBellOrder?: Dispatch<SetStateAction<Array<{ kind: 'dm' | 'fr' | 'inv'; id?: number }>>>;
  setMyGroups: Dispatch<SetStateAction<GroupSummary[]>>;
}

export function useChatData({
  setUsers,
  setFriends,
  setOnlineIds,
  setChatList,
  setFriendRequests,
  setFriendRequestsMeta,
  setPersistedFriendRequests,
  setPersistedFriendRequestsMeta,
  setPendingInvites,
  setPersistedInvites,
  setPersistedAllFriendRequestsMeta,
  setPersistedAllInvites,
  setPersistedAllMessages,
  setPersistedAllFriendRequestsUsers,
  setBellOrder,
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

  const loadNotifications = async () => {
    try {
      // Fetch unread-only for counts (no collapse needed; we're not using message rows here)
      const unreadRes = await notificationService.listMyNotifications({ unreadOnly: true, limit: 100 });
      if (unreadRes.success) {
        const list = unreadRes.data as BackendNotification[];
        const frUsers: User[] = [] as any;
        const frMeta: Record<number, string | Date> = {};
        const invites: Array<{ id: number; status: 'pending' | 'accepted' | 'declined'; group: any; inviter: any; createdAt?: string }> = [];
        for (const n of list) {
          const ts = (n as any).updatedAt || n.createdAt;
          if (n.type === 'friend_request' && n.fromUser) {
            frUsers.push({ id: n.fromUser.id, name: n.fromUser.name, avatar: n.fromUser.avatar } as any);
            frMeta[n.fromUser.id] = ts;
          } else if (n.type === 'group_invite') {
            invites.push({ id: n.id, status: 'pending', group: n.group, inviter: n.fromUser, createdAt: ts });
          }
        }
        setPersistedFriendRequests?.(frUsers);
        setPersistedFriendRequestsMeta?.(frMeta);
        setPersistedInvites?.(invites);
      }

      // Fetch all (read + unread) with collapse to avoid duplicates per other user
      const allRes = await notificationService.listMyNotifications({ unreadOnly: false, limit: 200, collapse: 'message_by_other' });
      if (allRes.success) {
        const listAll = allRes.data as BackendNotification[];
        const frMetaAll: Record<number, string | Date> = {};
        const invitesAll: Array<{ id: number; status: 'pending' | 'accepted' | 'declined'; group: any; inviter: any; createdAt?: string }> = [];
        // Build latest-per-sender map to ensure no duplicates even if backend collapse is absent
        const msgMap = new Map<number, { otherUserId: number; user: any; createdAt: string }>();
        const orderTokens: Array<{ kind: 'dm' | 'fr' | 'inv'; id?: number }> = [];
        let latestFRUser: User | null = null;
        let latestFRTs = -1;
        for (const n of listAll) {
          const ts = (n as any).updatedAt || n.createdAt;
          if (n.type === 'friend_request' && n.fromUser) {
            const uid = n.fromUser.id;
            const prev = frMetaAll[uid];
            // keep the latest timestamp
            frMetaAll[uid] = prev && new Date(String(prev)) > new Date(String(ts)) ? prev : ts;
            // push FR token once, preserving backend order
            if (!orderTokens.some(t => t.kind === 'fr')) orderTokens.push({ kind: 'fr' });
            const numericTs = new Date(String(ts)).getTime();
            if (!Number.isNaN(numericTs) && numericTs >= latestFRTs) {
              latestFRTs = numericTs;
              latestFRUser = { id: n.fromUser.id, name: n.fromUser.name, avatar: n.fromUser.avatar } as any;
            }
          } else if (n.type === 'group_invite') {
            invitesAll.push({ id: n.id, status: 'pending', group: n.group, inviter: n.fromUser, createdAt: ts });
            // push INV token once, preserving backend order
            if (!orderTokens.some(t => t.kind === 'inv')) orderTokens.push({ kind: 'inv' });
          } else if (n.type === 'message') {
            const otherId = (n as any)?.metadata?.otherUserId ?? n.fromUserId;
            if (typeof otherId === 'number') {
              const prev = msgMap.get(otherId);
              if (!prev || new Date(String(ts)).getTime() > new Date(String(prev.createdAt)).getTime()) {
                msgMap.set(otherId, { otherUserId: otherId, user: n.fromUser, createdAt: String(ts) });
              }
              // push DM token once for this otherId, preserving backend order
              if (!orderTokens.some(t => t.kind === 'dm' && t.id === otherId)) orderTokens.push({ kind: 'dm', id: otherId });
            }
          }
        }
        setPersistedAllFriendRequestsMeta?.(frMetaAll);
        setPersistedAllInvites?.(invitesAll);
        setPersistedAllMessages?.(Array.from(msgMap.values()));
        if (latestFRUser) setPersistedAllFriendRequestsUsers?.([latestFRUser]);
        setBellOrder?.(orderTokens);
      }
    } catch (e) {
      console.error('Error loading notifications:', e);
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
        const list = response.data || [];
        setFriendRequests(list.map((req: any) => req.requester));
        if (typeof setFriendRequestsMeta === 'function') {
          const meta: Record<number, string | Date> = {};
          for (const fr of list) {
            if (fr && fr.requester && typeof fr.requester.id === 'number') {
              meta[fr.requester.id] = fr.createdAt || fr.updatedAt || new Date().toISOString();
            }
          }
          setFriendRequestsMeta(meta);
        }
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
    loadNotifications,
    loadMyGroups,
  };
}
