// Re-export types for backward compatibility
export type { ChatListItem } from '../Manager-handle/useChatDataHandler';

// This file is kept for backward compatibility
// The actual implementation has been split into:
// - Manager-handle/useChatDataHandler.ts (handlers)
// - Manager-Effects/useChatDataEffects.ts (effects)

import type { Dispatch, SetStateAction } from 'react';
import type { User } from '../../components/interface/ChatTypes.interface';
import type { GroupSummary } from '../../../../services/groupService';
import type { ChatListItem } from '../Manager-handle/useChatDataHandler';
import { useChatDataHandler } from '../Manager-handle/useChatDataHandler';
import { useChatDataEffects } from '../Manager-Effects/useChatDataEffects';

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
  setPersistedAllFriendRequestsMeta?: Dispatch<SetStateAction<Record<number, string | Date>>>;
  setPersistedAllInvites?: Dispatch<SetStateAction<Array<{ id: number; status: 'pending' | 'accepted' | 'declined'; group: any; inviter: any; createdAt?: string }>>>;
  setPersistedAllMessages?: Dispatch<SetStateAction<Array<{ otherUserId: number; user: any; createdAt: string }>>>;
  setPersistedAllFriendRequestsUsers?: Dispatch<SetStateAction<User[]>>;
  setBellOrder?: Dispatch<SetStateAction<Array<{ kind: 'dm' | 'fr' | 'inv'; id?: number }>>>;
  setMyGroups: Dispatch<SetStateAction<GroupSummary[]>>;
}

// Wrapper hook for backward compatibility
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
  const handlers = useChatDataHandler({
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
  });

  useChatDataEffects({
    loadFriends: handlers.loadFriends,
    loadFriendRequests: handlers.loadFriendRequests,
    loadUsers: handlers.loadUsers,
    loadChatList: handlers.loadChatList,
    loadPendingInvites: handlers.loadPendingInvites,
    loadMyGroups: handlers.loadMyGroups,
  });

  return handlers;
}
