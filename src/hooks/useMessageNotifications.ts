import { useEffect, useMemo, useRef, useState } from 'react';
import { getSocket } from '../services/socket';

export type UnreadMap = Record<number, number>;
export type GroupUnreadMap = Record<number, number>;

function loadPersisted(userId?: number): UnreadMap {
  if (!userId) return {};
  try {
    const raw = localStorage.getItem(`chat_unread_${userId}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as UnreadMap;
  } catch {}
  return {};
}

function loadPersistedGroup(userId?: number): GroupUnreadMap {
  if (!userId) return {};
  try {
    const raw = localStorage.getItem(`group_unread_${userId}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as GroupUnreadMap;
  } catch {}
  return {};
}

function persist(userId: number | undefined, map: UnreadMap) {
  if (!userId) return;
  try {
    localStorage.setItem(`chat_unread_${userId}`, JSON.stringify(map));
  } catch {}
}

function persistGroup(userId: number | undefined, map: GroupUnreadMap) {
  if (!userId) return;
  try {
    localStorage.setItem(`group_unread_${userId}`, JSON.stringify(map));
  } catch {}
}

export function useMessageNotifications(currentUserId?: number, selectedChatId?: number | null, selectedGroupId?: number | null) {
  const [unreadMap, setUnreadMap] = useState<UnreadMap>(() => loadPersisted(currentUserId));
  const [groupUnreadMap, setGroupUnreadMap] = useState<GroupUnreadMap>(() => loadPersistedGroup(currentUserId));
  const [ring, setRing] = useState(false);
  const prevTotalRef = useRef<number>(0);
  const [ringSeq, setRingSeq] = useState(0);

  const playNotificationSound = () => {
    try {
      const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 880; // A5
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.03, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {}
  };

  // Persist on change
  useEffect(() => {
    persist(currentUserId, unreadMap);
  }, [currentUserId, unreadMap]);

  // Persist group on change
  useEffect(() => {
    persistGroup(currentUserId, groupUnreadMap);
  }, [currentUserId, groupUnreadMap]);

  const totalUnread = useMemo(() => Object.values(unreadMap).reduce((a, b) => a + (b || 0), 0), [unreadMap]);
  const totalGroupUnread = useMemo(() => Object.values(groupUnreadMap).reduce((a, b) => a + (b || 0), 0), [groupUnreadMap]);

  // Trigger ring when combined total (DM + Group) increases
  useEffect(() => {
    let timeout: number | undefined;
    const combined = (totalUnread || 0) + (totalGroupUnread || 0);
    if (combined > prevTotalRef.current) {
      setRing(true);
      // Play a short beep for new notifications
      playNotificationSound();
      timeout = window.setTimeout(() => setRing(false), 900);
      setRingSeq((s) => s + 1);
    }
    // Always update previous total after handling
    prevTotalRef.current = combined;
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [totalUnread, totalGroupUnread]);

  // Subscribe to new_message events for unread tracking
  useEffect(() => {
    if (!currentUserId) return;
    const socket = getSocket();
    if (!socket) return;

    const onNewMessage = (data: any) => {
      // Determine the other participant
      const isOwn = data.senderId === currentUserId;
      const otherId = isOwn ? data.receiverId : data.senderId;

      // Ignore if message belongs to currently open chat
      if (selectedChatId && otherId === selectedChatId) return;

      // Only count messages that are not sent by self
      if (!isOwn) {
        setUnreadMap((prev) => ({ ...prev, [otherId]: (prev[otherId] || 0) + 1 }));
      }
    };

    socket.off('new_message', onNewMessage); // ensure no dup
    socket.on('new_message', onNewMessage);

    return () => {
      socket.off('new_message', onNewMessage);
    };
  }, [currentUserId, selectedChatId]);

  // Subscribe to group_message events for unread tracking
  useEffect(() => {
    if (!currentUserId) return;
    const socket = getSocket();
    if (!socket) return;

    const onGroupMessage = (data: any) => {
      const isOwn = data.senderId === currentUserId;
      const gid = data.groupId;
      // Ignore own messages and messages in currently opened group
      if (isOwn) return;
      if (selectedGroupId && gid === selectedGroupId) return;
      setGroupUnreadMap((prev) => ({ ...prev, [gid]: (prev[gid] || 0) + 1 }));
    };

    socket.off('group_message', onGroupMessage);
    socket.on('group_message', onGroupMessage);

    return () => {
      socket.off('group_message', onGroupMessage);
    };
  }, [currentUserId, selectedGroupId]);

  const markChatAsRead = (otherUserId: number) => {
    setUnreadMap((prev) => {
      if (!prev[otherUserId]) return prev;
      const n = { ...prev };
      delete n[otherUserId];
      return n;
    });
  };

  const markGroupAsRead = (groupId: number) => {
    setGroupUnreadMap((prev) => {
      if (!prev[groupId]) return prev;
      const n = { ...prev } as GroupUnreadMap;
      delete n[groupId];
      return n;
    });
  };

  const resetAll = () => { setUnreadMap({}); setGroupUnreadMap({}); };

  return { unreadMap, groupUnreadMap, totalUnread, totalGroupUnread, ring, ringSeq, markChatAsRead, markGroupAsRead, resetAll };
}
