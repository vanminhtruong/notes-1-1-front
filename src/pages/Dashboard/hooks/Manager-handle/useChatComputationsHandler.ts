import { useMemo } from 'react';
import type { TFunction } from 'i18next';
import type { User } from '../../components/interface/ChatTypes.interface';
import type { GroupSummary } from '../../../../services/groupService';

export function useFilteredUsers(
  users: User[],
  friends: User[],
  friendRequests: User[],
  searchTerm: string,
  currentUserId?: number | null,
  blockedUsers?: Array<{ id: number; name: string; email?: string; avatar?: string | null }>,
): User[] {
  return useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const friendIds = new Set(friends.map((f) => f.id));
    const requestedIds = new Set(friendRequests.map((u) => u.id));
    const blockedIds = new Set((blockedUsers || []).map((b) => b.id));
    return users.filter((u) => {
      if (currentUserId && u.id === currentUserId) return false;
      if (friendIds.has(u.id)) return false;
      if (requestedIds.has(u.id)) return false;
      if (blockedIds.has(u.id)) return false;
      if (!term) return true;
      return (
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term))
      );
    });
  }, [users, friends, friendRequests, searchTerm, currentUserId, blockedUsers]);
}

export function useGroupOnline(
  selectedGroup: GroupSummary | null,
  onlineIds: number[],
  currentUserId?: number | null,
) {
  return useMemo(() => {
    if (!selectedGroup) return false;
    const memberIds = selectedGroup.members || [];
    if (onlineIds && onlineIds.some((id) => memberIds.includes(id))) return true;
    return currentUserId != null && memberIds.includes(currentUserId);
  }, [selectedGroup?.id, selectedGroup?.members, onlineIds, currentUserId]);
}

export function useRemovableMembers(
  selectedGroup: GroupSummary | null,
  friends: User[],
  users: User[],
  currentUser: User | null | undefined,
  t: TFunction<'dashboard'>
) {
  return useMemo(() => {
    if (!selectedGroup) return [] as Array<{ id: number; name: string; avatar?: string }>;
    const exclude = new Set<number>([selectedGroup.ownerId]);
    return selectedGroup.members
      .filter((id) => !exclude.has(id))
      .map((uid) => {
        const u = (currentUser && currentUser.id === uid)
          ? currentUser
          : friends.find((f) => f.id === uid) || users.find((u2) => u2.id === uid);
        return { id: uid, name: (u?.name || String(t('chat.fallback.user', { id: uid }))) as string, avatar: u?.avatar };
      });
  }, [selectedGroup?.id, selectedGroup?.members, selectedGroup?.ownerId, friends, users, currentUser?.id]);
}
