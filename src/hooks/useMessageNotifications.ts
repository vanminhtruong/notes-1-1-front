import { useEffect, useMemo, useRef, useState } from 'react';
import { getSocket } from '../services/socket';
import { chatService } from '../services/chatService';
import { groupService } from '../services/groupService';

export type UnreadMap = Record<number, number>;
export type GroupUnreadMap = Record<number, number>;


export function useMessageNotifications(currentUserId?: number, selectedChatId?: number | null, selectedGroupId?: number | null) {
  const [unreadMap, setUnreadMap] = useState<UnreadMap>({});
  const [groupUnreadMap, setGroupUnreadMap] = useState<GroupUnreadMap>({});
  const [ring, setRing] = useState(false);
  const prevTotalRef = useRef<number>(0);
  const [ringSeq, setRingSeq] = useState(0);

  const playNotificationSound = () => {
    try {
      const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      
      // Create Facebook-like notification sound with two tones
      const createTone = (frequency: number, startTime: number, duration: number, volume: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = frequency;
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Envelope: quick attack, short sustain, quick release
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(volume * 0.3, startTime + duration * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      const now = ctx.currentTime;
      
      // First tone: higher pitch (like Facebook's "pop")
      createTone(800, now, 0.15, 0.08);
      
      // Second tone: slightly lower pitch with slight delay
      createTone(600, now + 0.05, 0.2, 0.06);
      
    } catch {}
  };


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

  // Seed unreadMap from backend on mount or when user changes
  useEffect(() => {
    let mounted = true;
    const seedFromServer = async () => {
      if (!currentUserId) return;
      try {
        const res = await chatService.getChatList();
        if (!mounted || !res?.success) return;
        const items = (res.data || []) as Array<{ friend?: { id: number }; unreadCount?: number; userId?: number }>;
        setUnreadMap((prev) => {
          const next: UnreadMap = { ...prev };
          for (const it of items) {
            const id = (it.friend && it.friend.id) ?? it.userId;
            const cnt = it.unreadCount ?? 0;
            if (typeof id === 'number' && cnt >= 0) {
              const existing = next[id] || 0;
              next[id] = Math.max(existing, cnt);
            }
          }
          return next;
        });
      } catch {
        // silent
      }
    };
    void seedFromServer();
    return () => {
      mounted = false;
    };
  }, [currentUserId]);

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

  // Hydrate unreadMap from a chatList snapshot (e.g., after loadChatList)
  const hydrateFromChatList = (items: Array<{ friend: { id: number }; unreadCount?: number }>) => {
    if (!Array.isArray(items)) return;
    setUnreadMap((prev) => {
      const next: UnreadMap = { ...prev };
      for (const it of items) {
        if (!it?.friend || typeof it.friend.id !== 'number') continue;
        const id = it.friend.id;
        const cnt = it.unreadCount ?? 0;
        const existing = next[id] || 0;
        next[id] = Math.max(existing, cnt);
      }
      return next;
    });
  };

  const markChatAsRead = async (otherUserId: number, onSuccess?: () => void) => {
    console.log(`[markChatAsRead] Starting for userId: ${otherUserId}`);
    
    // Update local state immediately for UI responsiveness
    setUnreadMap((prev) => {
      if (prev[otherUserId] === 0) {
        console.log(`[markChatAsRead] Already marked as read for userId: ${otherUserId}`);
        return prev;
      }
      console.log(`[markChatAsRead] Setting local unread to 0 for userId: ${otherUserId}`);
      return { ...prev, [otherUserId]: 0 };
    });
    
    // Call backend to mark messages as read
    try {
      console.log(`[markChatAsRead] Calling backend API for userId: ${otherUserId}`);
      const response = await chatService.markMessagesAsRead(otherUserId);
      console.log(`[markChatAsRead] Backend response:`, response);
      
      // Call success callback to refresh chat list
      if (onSuccess) {
        console.log(`[markChatAsRead] Calling success callback for userId: ${otherUserId}`);
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      // Revert local state on error
      setUnreadMap((prev) => {
        const reverted = { ...prev };
        delete reverted[otherUserId];
        return reverted;
      });
    }
  };

  const markGroupAsRead = async (groupId: number) => {
    console.log(`[markGroupAsRead] Starting for groupId: ${groupId}`);
    
    // Update local state immediately for UI responsiveness
    setGroupUnreadMap((prev) => {
      if (prev[groupId] === 0) {
        console.log(`[markGroupAsRead] Already marked as read for groupId: ${groupId}`);
        return prev;
      }
      console.log(`[markGroupAsRead] Setting local unread to 0 for groupId: ${groupId}`);
      return { ...prev, [groupId]: 0 } as GroupUnreadMap;
    });
    
    // Call backend to mark group messages as read
    try {
      console.log(`[markGroupAsRead] Calling backend API for groupId: ${groupId}`);
      const response = await groupService.markGroupMessagesRead(groupId);
      console.log(`[markGroupAsRead] Backend response:`, response);
    } catch (error) {
      console.error('Failed to mark group messages as read:', error);
      // Revert local state on error
      setGroupUnreadMap((prev) => {
        const reverted = { ...prev };
        delete reverted[groupId];
        return reverted;
      });
    }
  };

  const resetAll = () => { setUnreadMap({}); setGroupUnreadMap({}); };

  return { unreadMap, groupUnreadMap, totalUnread, totalGroupUnread, ring, ringSeq, markChatAsRead, markGroupAsRead, resetAll, hydrateFromChatList };
}
