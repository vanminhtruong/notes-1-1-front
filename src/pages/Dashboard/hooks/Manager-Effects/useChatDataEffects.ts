import { useEffect } from 'react';

interface UseChatDataEffectsProps {
  loadFriends: () => Promise<void>;
  loadFriendRequests: () => Promise<void>;
  loadUsers: (search?: string) => Promise<void>;
  loadChatList: () => Promise<void>;
  loadPendingInvites: () => Promise<void>;
  loadMyGroups: () => Promise<void>;
}

export const useChatDataEffects = ({
  loadFriends,
  loadFriendRequests,
  loadUsers,
  loadChatList,
  loadPendingInvites,
  loadMyGroups,
}: UseChatDataEffectsProps) => {
  // Initial load (moved from ChatWindow)
  useEffect(() => {
    loadFriends();
    loadFriendRequests();
    loadUsers();
    loadChatList();
    loadPendingInvites();
  }, [loadFriends, loadFriendRequests, loadUsers, loadChatList, loadPendingInvites]);

  // Fetch groups once for bell metadata
  useEffect(() => {
    loadMyGroups();
  }, [loadMyGroups]);
};
