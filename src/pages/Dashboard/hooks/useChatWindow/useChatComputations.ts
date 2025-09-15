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
  pendingInvites: Array<{ id: number; status: 'pending' | 'accepted' | 'declined'; group: any; inviter: any; createdAt?: string }>,
  t: TFunction<'dashboard'>,
  chatList?: Array<{ friend: User; lastMessage: Message | null }>,
  friendRequestsMeta?: Record<number, string | Date>,
  groupLastAt?: Record<number, string>,
  friendRequestCountOverride?: number,
  friendRequestLatestAt?: string | Date,
  groupInviteCountOverride?: number,
  groupInviteLatestAt?: string | Date,
  includeChatAndGroup: boolean = true,
  persistedAllMessages?: Array<{ otherUserId: number; user: any; createdAt: string }>,
): NotificationItem[] {
  // Build a fast lookup for persisted users (from notifications API) to prefer their avatars if friends/users lack them
  const persistedUserMap = useMemo(() => {
    const map = new Map<number, any>();
    (persistedAllMessages || []).forEach((m) => {
      if (m && typeof m.otherUserId === 'number') map.set(m.otherUserId, m.user);
    });
    return map;
  }, [persistedAllMessages]);

  // Absolutize avatar URL if backend provided a relative path
  const baseFromEnv = (import.meta as any).env?.VITE_BACKEND_HTTP_URL as string | undefined;
  const host = (typeof window !== 'undefined' && window.location?.hostname) ? window.location.hostname : 'localhost';
  const baseOrigin = (baseFromEnv || `http://${host}:3000`).replace(/\/$/, '');
  const absolutize = (avatar?: string | null) => {
    if (!avatar) return avatar as any;
    const av = String(avatar);
    const lower = av.toLowerCase();
    if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('data:')) return av;
    const needsSlash = !av.startsWith('/');
    return `${baseOrigin}${needsSlash ? '/' : ''}${av}`;
  };

  return useMemo(() => {
    const items: NotificationItem[] = [];

    if (includeChatAndGroup) {
      const entries = Object.entries(unreadMap || {});
      // Only include DM entries that truly have unread > 0. Zero-count presence is handled by persistedAllMessages below.
      const dmItems: NotificationItem[] = entries
        .map(([id, count]) => ({ id: Number(id), count: Number(count || 0) }))
        .filter((e) => e.count > 0)
        .map((e) => {
          const uid = e.id;
          const clItem = (chatList || []).find((it) => it.friend.id === uid);
          const last = clItem?.lastMessage as any;
          // Only surface as DM item when we actually have at least one message in chat history
          if (!last) return null as any;
          const user = friends.find((f) => f.id === uid) || users.find((u) => u.id === uid) || persistedUserMap.get(uid);
          const time = last?.createdAt;
          return { id: uid, name: (user?.name || String(t('chat.fallback.user', { id: uid }))) as string, avatar: absolutize((user as any)?.avatar), count: e.count, time } as NotificationItem;
        })
        .filter(Boolean as any)
        .sort((a, b) => b.count - a.count);
      items.push(...dmItems);

      const groupItems = Object.entries(groupUnreadMap || {})
        .map(([gidStr, count]) => ({ gid: Number(gidStr), cnt: Number(count || 0) }))
        .filter((e) => e.cnt > 0)
        .map((e) => {
          const gid = e.gid;
          const g = myGroups.find((gr) => gr.id === gid);
          return {
            id: -300000 - gid,
            name: (g?.name || `Group ${gid}`) as string,
            avatar: absolutize(g?.avatar as any),
            count: e.cnt,
            time: (groupLastAt && groupLastAt[gid]) || (g as any)?.lastMessageAt,
          } as NotificationItem;
        })
        .sort((a, b) => b.count - a.count);
      items.push(...groupItems);
      // Merge persisted messages (ALL) for senders (count 0) so self-sent messages still appear
      if (Array.isArray(persistedAllMessages) && persistedAllMessages.length > 0) {
        const presentIds = new Set(items.filter((it) => it.id > 0).map((it) => it.id));
        const extra = persistedAllMessages
          // Always surface prior DM history even if there is a pending friend request
          .filter((m) => !presentIds.has(m.otherUserId))
          .map((m) => {
            const u = friends.find((f) => f.id === m.otherUserId) || users.find((u2) => u2.id === m.otherUserId) || m.user;
            return {
              id: m.otherUserId,
              name: (u?.name || String(t('chat.fallback.user', { id: m.otherUserId }))) as string,
              avatar: absolutize((u as any)?.avatar),
              count: 0,
              time: m.createdAt,
            } as NotificationItem;
          });
        // Keep the newest first for these extras
        extra.sort((a, b) => new Date(String(b.time)).getTime() - new Date(String(a.time)).getTime());
        items.push(...extra);
      }

      // Ensure group chat notifications remain visible after Mark all as read:
      // If a group has recent activity (lastMessageAt) but no unread, surface it as 0-count.
      if (Array.isArray(myGroups) && myGroups.length > 0) {
        const presentGroupIds = new Set<number>(
          items
            .filter((it) => typeof it.id === 'number' && (it.id as number) <= -300000)
            .map((it) => -((it.id as number) + 300000))
        );
        const zeroGroups = myGroups
          .filter((g: any) => !!g?.lastMessageAt)
          .filter((g: any) => !presentGroupIds.has(g.id))
          .map((g: any) => ({
            id: -300000 - g.id,
            name: (g?.name || `Group ${g?.id}`) as string,
            avatar: absolutize(g?.avatar as any),
            count: 0,
            time: (groupLastAt && groupLastAt[g.id]) || g?.lastMessageAt,
          } as NotificationItem));
        items.push(...zeroGroups);
      }
    }

    // Friend requests aggregate (override-driven)
    if (friendRequestCountOverride && friendRequestCountOverride > 0) {
      // If exactly one unread friend request, try to identify that requester by latest meta
      let frUser: any | undefined = undefined;
      if (friendRequestCountOverride === 1) {
        // Find id with latest timestamp from friendRequestsMeta
        let maxId: number | undefined;
        let maxTs = -1;
        if (friendRequestsMeta && Object.keys(friendRequestsMeta).length > 0) {
          for (const [sid, val] of Object.entries(friendRequestsMeta)) {
            const ts = new Date(String(val)).getTime();
            if (!isNaN(ts) && ts >= maxTs) { maxTs = ts; maxId = Number(sid); }
          }
        }
        if (maxId != null) {
          frUser = (friendRequests as any[]).find((u) => u && u.id === maxId)
            || friends.find((f) => f.id === maxId)
            || users.find((u) => u.id === maxId);
        }
        if (!frUser && friendRequests.length >= 1) frUser = (friendRequests as any[])[0];
      } else if (friendRequests.length === 1) {
        frUser = (friendRequests as any[])[0];
      }
      const frAvatar = frUser ? absolutize((frUser as any)?.avatar) : undefined;
      const latestFRTime = friendRequestLatestAt ? new Date(friendRequestLatestAt as any) : undefined;
      const frName = (frUser && (frUser as any)?.name) || String(t('chat.notificationsBell.friendRequests', 'Friend requests'));
      items.push({
        id: -1001,
        name: frName,
        count: friendRequestCountOverride,
        avatar: frAvatar,
        time: latestFRTime,
      });
    }
    // Group invites aggregate (override-driven)
    if (groupInviteCountOverride && groupInviteCountOverride > 0) {
      // Use the latest invite time if available
      const latestInvTime = groupInviteLatestAt ? new Date(groupInviteLatestAt as any) : undefined;
      let inv0: any | undefined = undefined;
      if (groupInviteCountOverride === 1) {
        if (latestInvTime && pendingInvites && pendingInvites.length > 0) {
          // Pick invite whose createdAt is closest to latestInvTime
          let bestIdx = -1; let bestDiff = Number.POSITIVE_INFINITY;
          pendingInvites.forEach((inv: any, idx: number) => {
            const ts = new Date(String(inv?.createdAt)).getTime();
            const diff = Math.abs(ts - latestInvTime.getTime());
            if (!isNaN(diff) && diff < bestDiff) { bestDiff = diff; bestIdx = idx; }
          });
          if (bestIdx >= 0) inv0 = (pendingInvites as any)[bestIdx];
        }
        if (!inv0 && pendingInvites.length >= 1) inv0 = (pendingInvites as any)[0];
      } else if (pendingInvites.length === 1) {
        inv0 = (pendingInvites as any)[0];
      }
      const invAvatar = absolutize(inv0?.group?.avatar || undefined);
      const invName = inv0?.group?.name || inv0?.inviter?.name || String(t('chat.notificationsBell.groupInvites', 'Group invitations'));
      items.push({
        id: -1002,
        name: invName,
        count: groupInviteCountOverride,
        time: latestInvTime,
        avatar: invAvatar,
      });
    }
    // Final dedupe by id: prefer higher count; if equal, prefer newer time; otherwise keep first.
    const byId = new Map<number, NotificationItem>();
    for (const it of items) {
      const prev = byId.get(it.id);
      if (!prev) { byId.set(it.id, it); continue; }
      const prevCount = Number((prev as any).count || 0);
      const currCount = Number((it as any).count || 0);
      if (currCount > prevCount) { byId.set(it.id, it); continue; }
      if (currCount === prevCount) {
        const pt = prev.time ? new Date(String(prev.time)).getTime() : 0;
        const ct = it.time ? new Date(String(it.time)).getTime() : 0;
        if (ct > pt) { byId.set(it.id, it); continue; }
      }
      // else keep prev
    }
    const arr = Array.from(byId.values());
    return arr;
  }, [unreadMap, groupUnreadMap, myGroups, friends, users, friendRequests, pendingInvites, chatList, friendRequestsMeta, groupLastAt, friendRequestCountOverride, friendRequestLatestAt, groupInviteCountOverride, groupInviteLatestAt, includeChatAndGroup, persistedAllMessages]);
}
