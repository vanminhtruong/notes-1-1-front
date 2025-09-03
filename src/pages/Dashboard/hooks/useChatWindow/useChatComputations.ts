import { useMemo } from 'react';
import type { TFunction } from 'i18next';
import type { User, Message } from '../../components/interface/ChatTypes.interface';
import type { GroupSummary } from '../../../../services/groupService';
import type { NotificationItem } from '../../components/interface/NotificationBell.interface';

export function useFilteredUsers(
  users: User[],
  friends: User[],
  friendRequests: User[],
  searchTerm: string,
  currentUserId?: number | null,
): User[] {
  return useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const friendIds = new Set(friends.map((f) => f.id));
    const requestedIds = new Set(friendRequests.map((u) => u.id));
    return users.filter((u) => {
      if (currentUserId && u.id === currentUserId) return false;
      if (friendIds.has(u.id)) return false;
      if (requestedIds.has(u.id)) return false;
      if (!term) return true;
      return (
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term))
      );
    });
  }, [users, friends, friendRequests, searchTerm, currentUserId]);
}

export function useUnreadChats(
  chatList: Array<{ friend: User; lastMessage: Message | null; unreadCount?: number; friendshipId?: number }>,
  unreadMap: Record<number, number | undefined>
) {
  return useMemo(() => {
    return chatList.filter((it) => {
      const count = (unreadMap[it.friend.id] ?? it.unreadCount ?? 0) as number;
      return count > 0;
    });
  }, [chatList, unreadMap]);
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

export function useNotificationItems(
  unreadMap: Record<number, number | undefined>,
  groupUnreadMap: Record<number, number | undefined> | undefined,
  myGroups: GroupSummary[],
  friends: User[],
  users: User[],
  friendRequests: User[],
  pendingInvites: Array<{ id: number; status: 'pending' | 'accepted' | 'declined'; group: any; inviter: any }>,
  t: TFunction<'dashboard'>
): NotificationItem[] {
  return useMemo(() => {
    const entries = Object.entries(unreadMap || {});
    const items: NotificationItem[] = entries
      .map(([id, count]) => {
        const uid = Number(id);
        const user = friends.find((f) => f.id === uid) || users.find((u) => u.id === uid);
        return { id: uid, name: (user?.name || String(t('chat.fallback.user', { id: uid }))) as string, avatar: user?.avatar, count: (count as number) || 0 };
      })
      .sort((a, b) => b.count - a.count);

    const groupItems = Object.entries(groupUnreadMap || {})
      .map(([gidStr, count]) => {
        const gid = Number(gidStr);
        const g = myGroups.find((gg) => gg.id === gid);
        return {
          id: -300000 - gid,
          name: (g?.name || `Group ${gid}`) as string,
          avatar: g?.avatar,
          count: (count as number) || 0,
        } as NotificationItem;
      })
      .sort((a, b) => b.count - a.count);
    items.push(...groupItems);

    if (friendRequests.length > 0) {
      items.push({
        id: -1001,
        name: String(t('chat.notificationsBell.friendRequests', 'Friend requests')),
        count: friendRequests.length,
      });
    }
    if (pendingInvites.length > 0) {
      items.push({
        id: -1002,
        name: String(t('chat.notificationsBell.groupInvites', 'Group invitations')),
        count: pendingInvites.length,
      });
    }
    return items;
  }, [unreadMap, groupUnreadMap, myGroups, friends, users, friendRequests.length, pendingInvites.length]);
}
