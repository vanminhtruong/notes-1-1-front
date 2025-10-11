/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import type React from 'react';
import toast from 'react-hot-toast';
import { getSocket } from '../../../../services/socket';
import { groupService } from '../../../../services/groupService';
import type { TFunction } from 'i18next';
import type { GroupSummary } from '../../../../services/groupService';
import type { User, Message } from '../../components/interface/ChatTypes.interface';

// Keep payload types loose to avoid over-constraining external events

type TypingUser = { id: any; name: string; avatar?: string };

type ChatListItem = { friend: User; lastMessage: Message | null; unreadCount?: number; friendshipId?: number; nickname?: string | null };

interface UseChatSocketParams {
  currentUser: User | null | undefined;
  selectedChat: User | null;
  selectedGroup: GroupSummary | null;
  friends: User[];
  users: User[];
  searchTerm: string;
  onlineIds: number[];
  readStatusEnabled: boolean;
  // setters
  setFriends: React.Dispatch<React.SetStateAction<User[]>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<User | null>>;
  setSelectedGroup: React.Dispatch<React.SetStateAction<GroupSummary | null>>;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setOnlineIds: React.Dispatch<React.SetStateAction<number[]>>;
  setGroupTypingUsers: React.Dispatch<React.SetStateAction<TypingUser[]>>;
  setChatList: React.Dispatch<React.SetStateAction<ChatListItem[]>>;
  setIsPartnerTyping: React.Dispatch<React.SetStateAction<boolean>>;
  // loaders
  loadFriendRequests: (arg?: any) => any;
  loadFriends: (arg?: any) => any;
  loadUsers: (term?: string) => any;
  loadPendingInvites: (arg?: any) => any;
  loadChatList?: () => any;
  loadNotifications?: () => any;
  // helpers
  upsertChatListWithMessage: (otherUserId: number, msg: Message) => void;
  scrollToBottom: () => void;
  t: TFunction<"dashboard">;
  // bell feed reloader
  reloadBellFeed?: () => any;
}

export function useChatSocket(params: UseChatSocketParams) {
  const {
    currentUser,
    selectedChat,
    selectedGroup,
    friends,
    users,
    searchTerm,
    onlineIds,
    readStatusEnabled,
    setFriends,
    setUsers,
    setSelectedChat,
    setSelectedGroup,
    setMessages,
    setOnlineIds,
    setGroupTypingUsers,
    setChatList,
    setIsPartnerTyping,
    loadFriendRequests,
    loadFriends,
    loadUsers,
    loadPendingInvites,
    loadChatList,
    loadNotifications,
    upsertChatListWithMessage,
    scrollToBottom,
    reloadBellFeed,
    t,
  } = params;

  useEffect(() => {
    if (!currentUser) return;
    const socket = getSocket();
    if (!socket) return;

    const resolveUser = (uid: number) => {
      if (currentUser && currentUser.id === uid) return currentUser;
      const found = friends.find((f) => f.id === uid) || users.find((u) => u.id === uid);
      if (found) return found as any;
      return { id: uid, name: String(t('chat.fallback.user', { id: uid })) } as any;
    };

    // Helper: detect NOTE_SHARE payload and extract note id
    const extractSharedNoteId = (content: any): number | null => {
      try {
        if (typeof content !== 'string') return null;
        const prefix = 'NOTE_SHARE::';
        if (!content.startsWith(prefix)) return null;
        const raw = content.slice(prefix.length);
        const obj = JSON.parse(decodeURIComponent(raw));
        if (obj && (obj.type === 'note' || obj.v === 1) && typeof obj.id === 'number') {
          return obj.id as number;
        }
        return null;
      } catch {
        return null;
      }
    };

    // Realtime: a shared note has been removed (by owner delete or receiver remove)
    // payload: { id: sharedNoteId, noteId: number, messageId?: number }
    const onSharedNoteRemoved = (payload: { id: number; noteId?: number; messageId?: number }) => {
      setMessages((prev: any[]) => {
        return prev.filter((m: any) => {
          // If backend provided the original messageId, remove exact message
          if (payload?.messageId && m.id === payload.messageId) return false;
          // Else fallback: remove NOTE_SHARE messages whose embedded noteId matches
          const nid = extractSharedNoteId(m.content);
          if (payload?.noteId && nid && nid === payload.noteId) return false;
          return true;
        });
      });
      // Also update chat list lastMessage if necessary
      setChatList((prev: any[]) => prev.map((it: any) => {
        const lm = it?.lastMessage;
        if (!lm) return it;
        if (payload?.messageId && lm.id === payload.messageId) return { ...it, lastMessage: null };
        const nid = extractSharedNoteId(lm.content);
        if (payload?.noteId && nid && nid === payload.noteId) return { ...it, lastMessage: null };
        return it;
      }));
    };

    // Owner-only: note deleted on my account, remove any NOTE_SHARE messages referencing this note
    const onNoteDeleted = (payload: { id: number }) => {
      const noteId = payload && Number(payload.id);
      if (!noteId) return;
      setMessages((prev: any[]) => prev.filter((m: any) => {
        const nid = extractSharedNoteId(m.content);
        return !(nid && nid === noteId);
      }));
      setChatList((prev: any[]) => prev.map((it: any) => {
        const lm = it?.lastMessage;
        if (!lm) return it;
        const nid = extractSharedNoteId(lm.content);
        return (nid && nid === noteId) ? { ...it, lastMessage: null } : it;
      }));
      
      // Dispatch window event for SharedNoteCard to listen
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('note_deleted', { detail: { id: noteId } }));
        }
      } catch {}
    };

    // Realtime: note updated, sync NOTE_SHARE messages with new content
    const onNoteUpdated = (payload: { note?: any }) => {
      const updatedNote = payload?.note;
      if (!updatedNote || !updatedNote.id) return;
      
      const noteId = Number(updatedNote.id);
      const newPayload = {
        id: noteId,
        title: updatedNote.title || '',
        content: updatedNote.content || '',
        imageUrl: updatedNote.imageUrl || null,
        videoUrl: updatedNote.videoUrl || null,
        youtubeUrl: updatedNote.youtubeUrl || null,
        category: updatedNote.category || 'personal',
        priority: updatedNote.priority || 'medium',
        createdAt: updatedNote.createdAt || new Date().toISOString(),
        type: 'note',
        v: 1
      };
      
      const newContent = `NOTE_SHARE::${encodeURIComponent(JSON.stringify(newPayload))}`;
      
      // Update messages containing this shared note
      setMessages((prev: any[]) => prev.map((m: any) => {
        const nid = extractSharedNoteId(m.content);
        if (nid && nid === noteId) {
          return { ...m, content: newContent };
        }
        return m;
      }));
      
      // Update chat list lastMessage if it's a NOTE_SHARE
      setChatList((prev: any[]) => prev.map((it: any) => {
        const lm = it?.lastMessage;
        if (!lm) return it;
        const nid = extractSharedNoteId(lm.content);
        if (nid && nid === noteId) {
          return { ...it, lastMessage: { ...lm, content: newContent } };
        }
        return it;
      }));
      
      // Dispatch window event for SharedNoteCard to listen
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('note_updated', { detail: updatedNote }));
        }
      } catch {}
    };

    // Owner deleted all messages in a group
    const onGroupMessagesDeleted = (payload: { groupId: number; count: number }) => {
      try {
        if (!payload || !selectedGroup || payload.groupId !== selectedGroup.id) return;
        setMessages([]);
        try { toast.success(String(t('chat.groups.success.messagesDeleted', { defaultValue: 'All group messages were deleted' } as any))); } catch {}
      } catch {}
    };

    // Admin actions: message recalled/deleted
    const onMessageRecalledByAdmin = (payload: { messageId: number; content: string; messageType: string }) => {
      setMessages((prev: any[]) => prev.map((m: any) => 
        m.id === payload.messageId 
          ? { ...m, content: payload.content, messageType: payload.messageType, isRecalled: true }
          : m
      ));
      // Update chat list if this is the last message
      setChatList((prev: any[]) => prev.map((it: any) => {
        const lm = it?.lastMessage;
        if (!lm || lm.id !== payload.messageId) return it;
        return { ...it, lastMessage: { ...lm, content: payload.content, messageType: payload.messageType, isRecalled: true } };
      }));
    };

    // Admin actions: message edited
    const onMessageEditedByAdmin = (payload: { messageId: number; content: string; updatedAt?: string }) => {
      setMessages((prev: any[]) => prev.map((m: any) => (
        m.id === payload.messageId ? { ...m, content: payload.content, updatedAt: payload.updatedAt || m.updatedAt } : m
      )));
      // Update chat list lastMessage if needed
      setChatList((prev: any[]) => prev.map((it: any) => {
        const lm = it?.lastMessage;
        if (!lm || lm.id !== payload.messageId) return it;
        return { ...it, lastMessage: { ...lm, content: payload.content, updatedAt: payload.updatedAt || (lm as any).updatedAt } };
      }));
    };

    const onMessageDeletedByAdmin = (payload: { messageId: number }) => {
      console.log('🗑️ User frontend: Received message_deleted_by_admin event:', payload);
      setMessages((prev: any[]) => prev.filter((m: any) => m.id !== payload.messageId));
      // Update chat list - remove if this was the last message
      setChatList((prev: any[]) => prev.map((it: any) => {
        const lm = it?.lastMessage;
        if (!lm || lm.id !== payload.messageId) return it;
        return { ...it, lastMessage: null };
      }));
    };

    const onGroupMessageRecalledByAdmin = (payload: { groupId: number; messageId: number; content: string; messageType: string }) => {
      if (!selectedGroup || payload.groupId !== selectedGroup.id) return;
      setMessages((prev: any[]) => prev.map((m: any) => 
        m.id === payload.messageId 
          ? { ...m, content: payload.content, messageType: payload.messageType, isRecalled: true }
          : m
      ));
    };

    const onGroupMessageDeletedByAdmin = (payload: { groupId: number; messageId: number }) => {
      if (!selectedGroup || payload.groupId !== selectedGroup.id) return;
      setMessages((prev: any[]) => prev.filter((m: any) => m.id !== payload.messageId));
    };

    const onGroupMessageEditedByAdmin = (payload: { groupId: number; messageId: number; content: string; updatedAt?: string }) => {
      if (!selectedGroup || payload.groupId !== selectedGroup.id) return;
      setMessages((prev: any[]) => prev.map((m: any) => (
        m.id === payload.messageId ? { ...m, content: payload.content, updatedAt: payload.updatedAt || m.updatedAt } : m
      )));
    };

    // Khi admin xóa một thông báo của người dùng: cập nhật realtime chuông thông báo
    const onNotificationDeletedByAdmin = (_payload: { id: number }) => {
      try {
        if (typeof reloadBellFeed === 'function') reloadBellFeed();
      } catch {}
      try {
        if (typeof loadNotifications === 'function') loadNotifications();
      } catch {}
    };

    // Khi admin xóa TẤT CẢ thông báo của người dùng: reload realtime
    const onNotificationsClearedByAdmin = (_payload: { userId: number; deleted?: number }) => {
      try { if (typeof reloadBellFeed === 'function') reloadBellFeed(); } catch {}
      try { if (typeof loadNotifications === 'function') loadNotifications(); } catch {}
    };

    // Đăng ký lắng nghe sự kiện xóa thông báo bởi admin để cập nhật chuông realtime
    socket.on('notification_deleted_by_admin', onNotificationDeletedByAdmin);
    socket.on('notifications_cleared_by_admin', onNotificationsClearedByAdmin);

    const onNewFriendReq = (data: any) => {
      toast.success(String(t('chat.notifications.newFriendRequest', { name: data.requester?.name } as any)));
      loadFriendRequests();
      if (typeof loadNotifications === 'function') {
        loadNotifications();
      }
      try { if (typeof reloadBellFeed === 'function') reloadBellFeed(); } catch {}
    };
    const onFriendAccepted = (data: any) => {
      const other = data.acceptedBy || data.requester; // requester field when accepter receives event
      const otherId = other?.id;
      if (otherId) {
        // Friendly toast copy depending on payload
        const name = other?.name;
        toast.success(String(t('chat.notifications.friendAccepted', { name } as any)));

        // Upsert friend immediately for real-time update
        const base = users.find(u => u.id === otherId) || other;
        setFriends(prev => {
          if (prev.some(f => f.id === otherId)) return prev;
          return [...prev, { ...base, isOnline: onlineIds.includes(otherId) } as any];
        });

        // Remove from users list if present
        setUsers(prev => prev.filter(u => u.id !== otherId));
      }
      
      // Ensure it also appears in the All (chats) tab immediately
      if (otherId) {
        setChatList((prev: ChatListItem[]) => {
          const exists = prev.some((it) => it.friend.id === otherId);
          if (exists) return prev;
          const friendEntry = (users.find(u => u.id === otherId) || other) as User;
          // Put new friend at top with no last message yet
          return [{ friend: friendEntry, lastMessage: null }, ...prev];
        });
      }
      
      // Reload to ensure consistency and full profile data
      loadFriends();
      loadUsers();
      loadFriendRequests();
      if (typeof loadChatList === 'function') {
        loadChatList();
      }
      try { if (typeof reloadBellFeed === 'function') reloadBellFeed(); } catch {}
    };
    const onFriendRejected = (data: any) => {
      toast(String(t('chat.notifications.friendRejected', { name: data.rejectedBy?.name } as any)));
      // Optimistic upsert vào danh sách Users để phản ánh ngay khi bị từ chối (không cần F5)
      try {
        const candidate = data?.rejectedBy;
        if (candidate && typeof candidate.id === 'number') {
          const term = String(searchTerm || '').trim().toLowerCase();
          const matches = !term
            || (String(candidate.name || '').toLowerCase().includes(term))
            || (String(candidate.email || '').toLowerCase().includes(term));
          if (matches) {
            setUsers((prev: User[]) => {
              if (Array.isArray(prev) && prev.some((u) => u.id === candidate.id)) return prev;
              return [candidate as User, ...prev];
            });
          }
          // Sau khi refresh danh sách từ backend, đảm bảo vẫn còn candidate nếu backend chưa kịp đưa user này vào gợi ý
          try {
            const p = loadUsers(searchTerm);
            if (p && typeof (p as Promise<any>).then === 'function') {
              (p as Promise<any>).then(() => {
                setUsers((prev: User[]) => {
                  const exists = Array.isArray(prev) && prev.some((u) => u.id === candidate.id);
                  if (exists) return prev;
                  const term2 = String(searchTerm || '').trim().toLowerCase();
                  const matches2 = !term2
                    || (String(candidate.name || '').toLowerCase().includes(term2))
                    || (String(candidate.email || '').toLowerCase().includes(term2));
                  return matches2 ? [candidate as User, ...prev] : prev;
                });
              }).catch(() => {
                // fallback: vẫn giữ optimistic nếu load thất bại
              });
            } else {
              // Nếu loadUsers là sync, vẫn merge sau đó
              setUsers((prev: User[]) => {
                const exists = Array.isArray(prev) && prev.some((u) => u.id === candidate.id);
                if (exists) return prev;
                return [candidate as User, ...prev];
              });
            }
          } catch {}
          // Đã gọi loadUsers ở trên, không cần gọi lần nữa bên dưới
          loadFriendRequests();
          try { if (typeof reloadBellFeed === 'function') reloadBellFeed(); } catch {}
          return;
        }
      } catch {}
      // Fallback nếu payload không có rejectedBy
      loadUsers(searchTerm);
      loadFriendRequests();
      try { if (typeof reloadBellFeed === 'function') reloadBellFeed(); } catch {}
    };
    const onFriendDeclined = (data: any) => onFriendRejected(data);
    const onFriendCancelled = () => {
      loadUsers(searchTerm);
      loadFriendRequests();
      try { if (typeof reloadBellFeed === 'function') reloadBellFeed(); } catch {}
    };

    // Friend removed handler (restore original)
    const onFriendRemoved = (data: any) => {
      toast.error(String(t('chat.notifications.friendRemoved', { name: data.removedBy?.name, defaultValue: `${data.removedBy?.name} removed you as friend` } as any)));
      setFriends((prev: User[]) => prev.filter((f) => f.id !== data.removedBy?.id));
      setChatList((prev: ChatListItem[]) => prev.filter((item) => item.friend.id !== data.removedBy?.id));
      if (selectedChat && selectedChat.id === data.removedBy?.id) {
        setSelectedChat(null);
        setMessages([]);
      }
    };

    const onGroupInvited = () => {
      loadPendingInvites();
      if (typeof loadNotifications === 'function') {
        loadNotifications();
      }
      toast(String(t('chat.groups.notifications.newInvite', { defaultValue: 'You have a new group invitation' })));
      try { if (typeof reloadBellFeed === 'function') reloadBellFeed(); } catch {}
    };

    const onNewMessage = (data: any) => {
      // Ensure DM payload has full sender/receiver objects so UI can show avatar immediately
      const base = data?.sender
        ? data
        : {
            ...data,
            sender: (data.senderAvatar || data.senderName)
              ? { id: data.senderId, name: data.senderName, avatar: data.senderAvatar }
              : resolveUser(data.senderId),
            receiver: resolveUser(data.receiverId),
          };

      if (selectedChat && (base.senderId === selectedChat.id || base.receiverId === selectedChat.id)) {
        setMessages((prev: any[]) => {
          const exists = Array.isArray(prev) && prev.some((m: any) => m.id === base.id);
          if (exists) return prev;

          // Enrich reply inline if server only sent replyToMessageId
          const resolvedReply = (!base.replyToMessage && base.replyToMessageId)
            ? (prev as any[]).find((m: any) => m.id === base.replyToMessageId)
            : undefined;
          const enriched = resolvedReply ? { ...base, replyToMessage: resolvedReply } : base;

          let messageWithStatus: any;
          // If receiving message from someone else while chat is open, mark as read immediately
          if (enriched.senderId !== currentUser?.id) {
            messageWithStatus = {
              ...enriched,
              status: 'read',
              readBy: [{
                userId: currentUser.id,
                readAt: new Date().toISOString(),
                user: currentUser
              }]
            };

            // Send read receipt to backend
            const socket = getSocket();
            if (socket) {
              socket.emit('message_read', { messageId: enriched.id, chatId: selectedChat.id });
            }
          } else {
            // Own message - keep as sent until backend confirms delivery
            messageWithStatus = {
              ...enriched,
              status: 'sent'
            };
          }

          return [...(prev as any[]), messageWithStatus];
        });
        setTimeout(scrollToBottom, 100);
        // Also update the header's selectedChat avatar/name immediately
        try {
          const isOwnMsg = !!(currentUser && base.senderId === currentUser.id);
          const otherIdForHeader = isOwnMsg ? base.receiverId : base.senderId;
          if (selectedChat && selectedChat.id === otherIdForHeader) {
            const nextName = isOwnMsg ? (base.receiverName || selectedChat.name) : (base.senderName || selectedChat.name);
            const nextAvatar = isOwnMsg
              ? ((base as any).receiverAvatar !== undefined ? (base as any).receiverAvatar : (selectedChat as any).avatar)
              : ((base as any).senderAvatar !== undefined ? (base as any).senderAvatar : (selectedChat as any).avatar);
            setSelectedChat((prev) => (prev ? { ...prev, name: nextName, avatar: nextAvatar } as any : prev));
          }
        } catch { /* noop */ }
      }
      const isOwn = currentUser && base.senderId === currentUser.id;
      const otherId = isOwn ? base.receiverId : base.senderId;
      if (otherId != null) {
        upsertChatListWithMessage(otherId, base as Message);
        // Also merge avatar/name into friends and users lists so future opens have correct data
        const nextName = isOwn ? (base.receiverName as any) : (base.senderName as any);
        const nextAvatar = isOwn ? ((base as any).receiverAvatar) : ((base as any).senderAvatar);
        if (nextName !== undefined || nextAvatar !== undefined) {
          setFriends((prev: any[]) => prev.map((f: any) => (
            f.id === otherId ? { ...f, name: nextName || f.name, avatar: (nextAvatar !== undefined ? nextAvatar : (f as any).avatar) } : f
          )));
          setUsers((prev: any[]) => prev.map((u: any) => (
            u.id === otherId ? { ...u, name: nextName || u.name, avatar: (nextAvatar !== undefined ? nextAvatar : (u as any).avatar) } : u
          )));
        }
        // Ensure ordering matches backend logic (pinned first)
        if (typeof loadChatList === 'function') {
          loadChatList();
        }
      }
      try { if (typeof reloadBellFeed === 'function') reloadBellFeed(); } catch {}
    };

    const onGroupMessage = (data: any) => {
      if (selectedGroup && data.groupId === selectedGroup.id) {
        const base = data.sender
          ? data
          : {
              ...data,
              sender: (data.senderAvatar || data.senderName)
                ? { id: data.senderId, name: data.senderName, avatar: data.senderAvatar }
                : resolveUser(data.senderId),
            };

        setMessages((prev: any[]) => {
          const exists = Array.isArray(prev) && prev.some((m: any) => m.id === base.id);
          if (exists) return prev as any[];

          // Enrich reply inline if only replyToMessageId is present
          const resolvedReply = (!base.replyToMessage && base.replyToMessageId)
            ? (prev as any[]).find((m: any) => m.id === base.replyToMessageId)
            : undefined;
          const enriched = resolvedReply ? { ...base, replyToMessage: resolvedReply } : base;

          // Set initial status based on sender
          const messageWithStatus: any = {
            ...enriched,
            status: enriched.senderId === currentUser?.id ? 'sent' : 'delivered'
          };

          // Auto-mark read for unread count purposes when viewing this group
          if (enriched.senderId !== currentUser?.id) {
            // Notify backend to mark as read regardless of read receipts preference
            try { void groupService.markGroupMessagesRead(selectedGroup.id); } catch {}
            // Also dispatch UI event so GroupsTab (if mounted) clears badge immediately
            try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('group_marked_read', { detail: { groupId: selectedGroup.id } })); } catch {}
            // Only send read receipts and mark with readBy if readStatusEnabled is true
            if (readStatusEnabled) {
              messageWithStatus.status = 'read';
              messageWithStatus.readBy = [{
                userId: currentUser.id,
                readAt: new Date().toISOString(),
                user: currentUser
              }];

              const socket = getSocket();
              if (socket) {
                socket.emit('group_message_read', { 
                  messageId: enriched.id, 
                  groupId: selectedGroup.id,
                  userId: currentUser?.id,
                  readAt: new Date().toISOString()
                });
              }
            }
          }

          return [...(prev as any[]), messageWithStatus];
        });
        setTimeout(scrollToBottom, 100);
      }
      try { if (typeof reloadBellFeed === 'function') reloadBellFeed(); } catch {}
    };

    const onMessageSent = (data: any) => {
      // Update message status to what's provided by backend (sent/delivered)
      setMessages((prev: any[]) => {
        const targetId = data?.messageId ?? data?.id;
        const status = data?.status || 'sent';
        return prev.map((m: any) => 
          m.id === targetId ? { ...m, status } : m
        );
      });
    };

    const onMessageDelivered = (data: any) => {
      // Update message status to delivered
      setMessages((prev: any[]) => {
        return prev.map((m: any) => 
          m.id === data.messageId ? { ...m, status: 'delivered' } : m
        );
      });
    };

    const onMessageRead = (data: any) => {
      // Update message status to read và bổ sung readBy với thông tin user đầy đủ
      setMessages((prev: any[]) => {
        return prev.map((m: any) => {
          if (m.id !== data.messageId) return m;

          const readBy = Array.isArray(m.readBy) ? m.readBy : [];
          const payloadUserId = Number(data.userId);
          const selectedMatch = (selectedChat && Number((selectedChat as any).id) === payloadUserId) ? selectedChat : undefined;
          const listMatch = friends.find((f: any) => Number(f.id) === payloadUserId) || users.find((u: any) => Number(u.id) === payloadUserId);
          const resolvedUser = (
            data.user
            || selectedMatch
            || (listMatch as any)
            || resolveUser(payloadUserId)
          );

          const withoutUser = readBy.filter((rb: any) => Number(rb.userId) !== payloadUserId);
          const updatedReadBy = [
            ...withoutUser,
            { userId: payloadUserId, readAt: data.readAt, user: resolvedUser },
          ];

          return { ...m, status: 'read', readBy: updatedReadBy };
        });
      });
    };

    const onMessageBlocked = (data: any) => {
      try {
        const isCurrentChat = !!(selectedChat && data && data.receiverId === selectedChat.id);
        const msg = isCurrentChat
          ? String(t('chat.errors.messageBlockedCurrent', { defaultValue: 'Message not sent. Messaging between you and this user is blocked.' } as any))
          : String(t('chat.errors.messageBlocked', { defaultValue: 'Message not sent due to blocking.' } as any));
        toast.error(msg);
      } catch (_err) {
        /* ignore */
      }
    };

    const onUserBlocked = (data: { userId: number; targetId: number }) => {
      try {
        if (!data) return;
        const iAmBlocker = !!(currentUser && data.userId === currentUser.id);
        const iAmBlocked = !!(currentUser && data.targetId === currentUser.id);
        const otherId = iAmBlocker ? data.targetId : data.userId;
        const other = resolveUser(otherId) as any;

        if (iAmBlocker) {
          toast(String(t('chat.notifications.youBlocked', { name: other?.name, defaultValue: `You blocked ${other?.name || 'this user'}` } as any)));
        } else if (iAmBlocked) {
          toast.error(String(t('chat.notifications.youWereBlocked', { name: other?.name, defaultValue: `You were blocked by ${other?.name || 'this user'}` } as any)));
        }

        if (typeof loadChatList === 'function') {
          loadChatList();
        }
      } catch (_err) {
        /* ignore */
      }
    };

    const onUserUnblocked = (data: { userId: number; targetId: number }) => {
      try {
        if (!data) return;
        const iAmUnblocker = !!(currentUser && data.userId === currentUser.id);
        const iAmUnblocked = !!(currentUser && data.targetId === currentUser.id);
        const otherId = iAmUnblocker ? data.targetId : data.userId;
        const other = resolveUser(otherId) as any;

        if (iAmUnblocker) {
          toast.success(String(t('chat.notifications.youUnblocked', { name: other?.name, defaultValue: `You unblocked ${other?.name || 'this user'}` } as any)));
        } else if (iAmUnblocked) {
          toast.success(String(t('chat.notifications.unblockedYou', { name: other?.name, defaultValue: `${other?.name || 'This user'} unblocked you` } as any)));
        }

        if (typeof loadChatList === 'function') {
          loadChatList();
        }
      } catch (_err) {
        /* ignore */
      }
    };

    const onGroupMessageDelivered = (data: any) => {
      // Update group message status to delivered
      setMessages((prev: any[]) => {
        return prev.map((m: any) => 
          m.id === data.messageId ? { ...m, status: 'delivered' } : m
        );
      });
      // Refresh bell badge to reflect potential unread increments for recipients
      try { if (typeof reloadBellFeed === 'function') reloadBellFeed(); } catch {}
    };

    const onGroupMessageRead = (data: any) => {
      // Update group message read status and add readBy info
      setMessages((prev: any[]) => {
        return prev.map((m: any) => {
          if (m.id === data.messageId) {
            const readBy = m.readBy || [];
            const existingIndex = readBy.findIndex((rb: any) => rb.userId === data.userId);
            let updatedReadBy;
            
            if (existingIndex >= 0) {
              updatedReadBy = [...readBy];
              updatedReadBy[existingIndex] = {
                userId: data.userId,
                readAt: data.readAt,
                user: data.user || resolveUser(data.userId)
              };
            } else {
              updatedReadBy = [...readBy, {
                userId: data.userId,
                readAt: data.readAt,
                user: data.user || resolveUser(data.userId)
              }];
            }
            
            return { 
              ...m, 
              status: 'read',
              readBy: updatedReadBy
            };
          }
          return m;
        });
      });
      // Refresh bell badge to reflect decrements when messages are read
      try { if (typeof reloadBellFeed === 'function') reloadBellFeed(); } catch {}
    };

    const onUserOnline = (data: any) => {
      const uid = data.userId;
      setFriends((prev: User[]) => prev.map((f) => (f.id === uid ? { ...f, isOnline: true } : f)));
      setOnlineIds((prev: number[]) => [...prev.filter((id: number) => id !== uid), uid]);
      
      // Update selectedChat if it's the same user
      if (selectedChat && selectedChat.id === uid) {
        setSelectedChat((prev) => prev ? { ...prev, isOnline: true } : prev);
      }
    };

    const onUserOffline = (data: any) => {
      console.log('User offline:', data);
      setFriends((prev: any[]) => 
        prev.map((friend: any) => 
          friend.id === data.userId 
            ? { ...friend, isOnline: false, lastSeenAt: data.lastSeenAt }
            : friend
        )
      );
      setOnlineIds((prev: number[]) => prev.filter((id: number) => id !== data.userId));
      
      // Update selectedChat if it's the same user
      if (selectedChat && selectedChat.id === data.userId) {
        setSelectedChat((prev) => prev ? { 
          ...prev, 
          isOnline: false, 
          lastSeenAt: data.lastSeenAt 
        } : prev);
      }
    };

    const onUserProfileUpdated = (data: any) => {
      const { userId, user: updatedUser } = data;
      
      // Update friends list with new profile data
      setFriends((prev: User[]) => 
        prev.map((friend) => 
          friend.id === userId ? { ...friend, ...updatedUser } : friend
        )
      );
      
      // Update users list if the user is there
      setUsers((prev: User[]) => 
        prev.map((user) => 
          user.id === userId ? { ...user, ...updatedUser } : user
        )
      );
      
      // Update selectedChat if it's the same user
      if (selectedChat && selectedChat.id === userId) {
        setSelectedChat((prev) => prev ? { ...prev, ...updatedUser } : prev);
      }
      
      // Update chat list with new profile data
      setChatList((prev: ChatListItem[]) => 
        prev.map((item) => 
          item.friend.id === userId 
            ? { ...item, friend: { ...item.friend, ...updatedUser } }
            : item
        )
      );
    };

    const onUserTyping = (data: any) => {
      if (selectedChat && data.userId === selectedChat.id) {
        setIsPartnerTyping(!!data.isTyping);
      }
    };

    const onGroupTyping = (payload: { groupId: any; userId: any; isTyping: boolean }) => {
      if (!selectedGroup || payload.groupId !== selectedGroup.id) return;
      if (currentUser && payload.userId === currentUser.id) return;
      const u = friends.find((f) => f.id === payload.userId) || users.find((u2) => u2.id === payload.userId);
      const tu: TypingUser = u ? { id: u.id, name: u.name, avatar: (u as any).avatar } : { id: payload.userId, name: `User ${payload.userId}` };
      setGroupTypingUsers((prev: TypingUser[]) => {
        const exists = prev.some((p) => p.id === payload.userId);
        if (payload.isTyping) {
          return exists ? prev : [...prev, tu];
        } else {
          return prev.filter((p) => p.id !== payload.userId);
        }
      });
    };

    const onGroupUpdated = (data: any) => {
      if (selectedGroup && data && data.id === selectedGroup.id) {
        setSelectedGroup((prev: any) => (prev ? { ...data, myRole: prev.myRole || data.myRole } : data));
      }
    };

    const onGroupMembersRemoved = (data: { groupId: number; removed: number[] }) => {
      if (!selectedGroup || data.groupId !== selectedGroup.id) return;
      setSelectedGroup((prev: GroupSummary | null) => (prev ? { ...prev, members: prev.members.filter((id: number) => !data.removed.includes(id)) } : prev));
      if (currentUser && data.removed.includes(currentUser.id)) {
        toast(String(t('chat.groups.notifications.removed', { defaultValue: 'You were removed from the group' })));
        setSelectedGroup(null);
        setMessages([]);
        return;
      }
      const others = data.removed || [];
      if (others.length > 0) {
        const names = others.map((uid) => (resolveUser(uid) as any)?.name).join(', ');
        const content = others.length === 1 ? `${names} was removed from the group` : `${names} were removed from the group`;
        const sysMsg = {
          id: Date.now(),
          senderId: 0,
          receiverId: data.groupId,
          content,
          messageType: 'system' as const,
          createdAt: new Date().toISOString(),
        } as any;
        setMessages((prev: any[]) => ([...(prev as any[]), sysMsg]));
        setTimeout(scrollToBottom, 100);
      }
    };

    const onGroupMemberRemoved = (data: { groupId: number; removed: number[] }) => {
      onGroupMembersRemoved(data);
    };

    const onGroupMemberLeft = (data: { groupId: number; userId: number }) => {
      if (!selectedGroup || data.groupId !== selectedGroup.id) return;
      // Update local members; do not inject ephemeral system message here.
      // Backend now persists and emits a system group_message that will arrive via onGroupMessage.
      setSelectedGroup((prev: GroupSummary | null) => (prev ? { ...prev, members: prev.members.filter((id: number) => id !== data.userId) } : prev));
      setTimeout(scrollToBottom, 100);
    };

    const onGroupDeleted = (data: { groupId: number }) => {
      if (selectedGroup && data.groupId === selectedGroup.id) {
        toast(String(t('chat.groups.success.deleted')));
        setSelectedGroup(null);
        setMessages([]);
      }
    };

    const onGroupMemberRoleUpdated = (payload: { groupId: number; userId: number; role: 'admin'|'member' }) => {
      if (!payload || !selectedGroup || payload.groupId !== selectedGroup.id) return;
      // If it's me, update myRole and inform
      if (currentUser && payload.userId === currentUser.id) {
        setSelectedGroup((prev: any) => (prev ? { ...prev, myRole: payload.role } : prev));
        try {
          const msg = payload.role === 'admin'
            ? String(t('chat.groups.notifications.promoted', { defaultValue: 'You were promoted to admin' } as any))
            : String(t('chat.groups.notifications.demoted', { defaultValue: 'You were demoted to member' } as any));
          toast.success(msg);
        } catch {}
      }
    };
    const onMessageReacted = (payload: { messageId: number; userId: number; type: 'like'|'love'|'haha'|'wow'|'sad'|'angry'; count?: number }) => {
      let burstDelta = 1;
      setMessages((prev: any[]) => prev.map((m: any) => {
        if (m.id !== payload.messageId) return m;
        const list = Array.isArray(m.Reactions) ? m.Reactions : [];
        const idx = list.findIndex((r: any) => r.userId === payload.userId && r.type === payload.type);
        if (idx >= 0) {
          const updated = [...list];
          const prevCount = Number(updated[idx].count || 1);
          const nextCount = payload.count ?? (prevCount + 1);
          burstDelta = Math.max(1, nextCount - prevCount);
          updated[idx] = { ...updated[idx], count: nextCount };
          return { ...m, Reactions: updated };
        }
        const nextCount = payload.count ?? 1;
        burstDelta = Math.max(1, nextCount);
        return { ...m, Reactions: [...list, { userId: payload.userId, type: payload.type, count: nextCount }] };
      }));
      // Trigger burst animation on other clients (avoid double on the reacting client)
      try {
        if (typeof window !== 'undefined' && (!currentUser || payload.userId !== currentUser.id)) {
          window.dispatchEvent(new CustomEvent('reaction_burst', { detail: { messageId: payload.messageId, type: payload.type, count: burstDelta } }));
        }
      } catch {}
      // Also reflect in chat list if this message is currently the lastMessage for a chat
      setChatList((prev: any[]) => prev.map((it: any) => {
        const lm = it?.lastMessage;
        if (!lm || lm.id !== payload.messageId) return it;
        const list = Array.isArray(lm.Reactions) ? lm.Reactions : [];
        const idx = list.findIndex((r: any) => r.userId === payload.userId && r.type === payload.type);
        if (idx >= 0) {
          const updated = [...list];
          const prevCount = Number(updated[idx].count || 1);
          updated[idx] = { ...updated[idx], count: payload.count ?? (prevCount + 1) };
          return { ...it, lastMessage: { ...lm, Reactions: updated } };
        }
        return { ...it, lastMessage: { ...lm, Reactions: [...list, { userId: payload.userId, type: payload.type, count: payload.count ?? 1 }] } };
      }));
    };

    const onMessageUnreacted = (payload: { messageId: number; userId: number; type?: 'like'|'love'|'haha'|'wow'|'sad'|'angry' }) => {
      setMessages((prev: any[]) => prev.map((m: any) => {
        if (m.id !== payload.messageId) return m;
        const list = Array.isArray(m.Reactions) ? m.Reactions : [];
        if (payload.type) {
          return { ...m, Reactions: list.filter((r: any) => !(r.userId === payload.userId && r.type === payload.type)) };
        }
        // Fallback: remove all reactions by user if type not provided
        return { ...m, Reactions: list.filter((r: any) => r.userId !== payload.userId) };
      }));
      // Update chat list mirrors
      setChatList((prev: any[]) => prev.map((it: any) => {
        const lm = it?.lastMessage;
        if (!lm || lm.id !== payload.messageId) return it;
        const list = Array.isArray(lm.Reactions) ? lm.Reactions : [];
        if (payload.type) {
          return { ...it, lastMessage: { ...lm, Reactions: list.filter((r: any) => !(r.userId === payload.userId && r.type === payload.type)) } };
        }
        return { ...it, lastMessage: { ...lm, Reactions: list.filter((r: any) => r.userId !== payload.userId) } };
      }));
    };

    // Reactions: group messages
    const onGroupMessageReacted = (payload: { groupId: number; messageId: number; userId: number; type: 'like'|'love'|'haha'|'wow'|'sad'|'angry'; count?: number }) => {
      if (!selectedGroup || payload.groupId !== selectedGroup.id) return;
      let burstDelta = 1;
      setMessages((prev: any[]) => prev.map((m: any) => {
        if (m.id !== payload.messageId) return m;
        const list = Array.isArray(m.Reactions) ? m.Reactions : [];
        const idx = list.findIndex((r: any) => r.userId === payload.userId && r.type === payload.type);
        if (idx >= 0) {
          const updated = [...list];
          const prevCount = Number(updated[idx].count || 1);
          const nextCount = payload.count ?? (prevCount + 1);
          burstDelta = Math.max(1, nextCount - prevCount);
          updated[idx] = { ...updated[idx], count: nextCount };
          return { ...m, Reactions: updated };
        }
        const nextCount = payload.count ?? 1;
        burstDelta = Math.max(1, nextCount);
        return { ...m, Reactions: [...list, { userId: payload.userId, type: payload.type, count: nextCount }] };
      }));
      // Trigger burst animation on other clients (avoid double on the reacting client)
      try {
        if (typeof window !== 'undefined' && (!currentUser || payload.userId !== currentUser.id)) {
          window.dispatchEvent(new CustomEvent('reaction_burst', { detail: { messageId: payload.messageId, type: payload.type, count: burstDelta } }));
        }
      } catch {}
    };

    const onGroupMessageUnreacted = (payload: { groupId: number; messageId: number; userId: number; type?: 'like'|'love'|'haha'|'wow'|'sad'|'angry' }) => {
      if (!selectedGroup || payload.groupId !== selectedGroup.id) return;
      setMessages((prev: any[]) => prev.map((m: any) => {
        if (m.id !== payload.messageId) return m;
        const list = Array.isArray(m.Reactions) ? m.Reactions : [];
        if (payload.type) {
          return { ...m, Reactions: list.filter((r: any) => !(r.userId === payload.userId && r.type === payload.type)) };
        }
        return { ...m, Reactions: list.filter((r: any) => r.userId !== payload.userId) };
      }));
    };

    // ===== Shared Notes permissions realtime (admin updates) =====
    // When admin updates shared note permissions for individual share
    const onSharedPermissionsUpdated = (payload: {
      sharedNoteId: number;
      noteId: number;
      sharedByUserId: number;
      sharedWithUserId: number;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
      message?: string | null;
    }) => {
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('shared_permissions_updated', { detail: payload }));
        }
      } catch {}
    };

    // Generic refresh events emitted by backend for convenience
    const onNoteSharedWithMe = (sharedNote: any) => {
      try {
        if (typeof window !== 'undefined') {
          const detail = {
            sharedNoteId: Number(sharedNote?.id),
            noteId: Number(sharedNote?.noteId || sharedNote?.note?.id),
            sharedByUserId: Number(sharedNote?.sharedByUser?.id || sharedNote?.sharedByUserId),
            sharedWithUserId: Number(sharedNote?.sharedWithUser?.id || sharedNote?.sharedWithUserId),
            canCreate: !!sharedNote?.canCreate,
            canEdit: !!sharedNote?.canEdit,
            canDelete: !!sharedNote?.canDelete,
            message: sharedNote?.message ?? null,
          };
          window.dispatchEvent(new CustomEvent('note_shared_with_me', { detail }));
        }
      } catch {}
    };

    const onNoteSharedByMe = (sharedNote: any) => {
      try {
        if (typeof window !== 'undefined') {
          const detail = {
            sharedNoteId: Number(sharedNote?.id),
            noteId: Number(sharedNote?.noteId || sharedNote?.note?.id),
            sharedByUserId: Number(sharedNote?.sharedByUser?.id || sharedNote?.sharedByUserId),
            sharedWithUserId: Number(sharedNote?.sharedWithUser?.id || sharedNote?.sharedWithUserId),
            canCreate: !!sharedNote?.canCreate,
            canEdit: !!sharedNote?.canEdit,
            canDelete: !!sharedNote?.canDelete,
            message: sharedNote?.message ?? null,
          };
          window.dispatchEvent(new CustomEvent('note_shared_by_me', { detail }));
        }
      } catch {}
    };

    // Create-permissions changed list should be refreshed
    const onCreatePermissionsChanged = (payload: any) => {
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('create_permissions_changed', { detail: payload }));
        }
      } catch {}
    };

    // Group shared note updated by admin -> notify open group chat
    const onGroupSharedNoteUpdatedByAdmin = (payload: { id: number }) => {
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('group_shared_note_updated_by_admin', { detail: payload }));
        }
      } catch {}
    };

    const onGroupSharedNoteUpdated = (payload: { id: number }) => {
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('group_shared_note_updated', { detail: payload }));
        }
      } catch {}
    };

    // Real-time nickname update for current user's view
    const onNicknameUpdated = (payload: { otherUserId: number; nickname: string | null }) => {
      try {
        if (!payload || typeof payload.otherUserId !== 'number') return;
        setChatList((prev: ChatListItem[]) => prev.map((it) => (
          it.friend.id === payload.otherUserId
            ? { ...it, nickname: payload.nickname ?? null }
            : it
        )));
        if (typeof loadChatList === 'function') {
          loadChatList();
        }
      } catch (_e) {
        /* ignore */
      }
    };

    const onAnyLogger = (...args: any[]) => {
      try {
        const [event, payload] = args as any[];
        if (typeof event === 'string' && process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.debug('[socket:onAny]', event, payload);
        }
      } catch (_err) {
        /* ignore */
      }
    };

    if ((socket as any).onAny) {
      (socket as any).onAny(onAnyLogger);
    }

    // Dedicated handlers for recall events so we can off() them specifically
    const dmRecalledHandler = (payload: { scope: 'self' | 'all'; messageIds: number[] }) => {
      console.log('🔄 Frontend: dmRecalledHandler received:', payload);
      setMessages((prev: any[]) => {
        if (!Array.isArray(prev) || prev.length === 0) return prev;
        const idSet = new Set(payload.messageIds);
        if (payload.scope === 'self') {
          console.log('🔄 Filtering messages for self recall');
          return prev.filter((m: any) => !idSet.has(m.id));
        } else {
          console.log('🔄 Marking messages as deletedForAll for all recall');
          const newMessages = prev.map((m: any) => {
            if (idSet.has(m.id)) {
              console.log(`🔄 Marking message ${m.id} as deletedForAll`);
              return { ...m, isDeletedForAll: true };
            }
            return m;
          });
          return newMessages;
        }
      });
      setChatList((prev: any) => {
        const idSet = new Set(payload.messageIds);
        return prev.map((it: any) => {
          const lm = it.lastMessage;
          if (!lm) return it;
          if (!idSet.has(lm.id)) return it;
          if (payload.scope === 'all') {
            return { ...it, lastMessage: { ...lm, isDeletedForAll: true } };
          }
          return it;
        });
      });
    };

    const groupRecalledHandler = (payload: { groupId: number; scope: 'self'|'all'; messageIds: number[] }) => {
      if (!payload || !selectedGroup || payload.groupId !== selectedGroup.id) return;
      setMessages((prev: any[]) => {
        if (!Array.isArray(prev) || prev.length === 0) return prev as any[];
        const idSet = new Set(payload.messageIds);
        if (payload.scope === 'self') {
          return prev.filter((m: any) => !idSet.has(m.id));
        }
        return prev.map((m: any) => (idSet.has(m.id) ? { ...m, isDeletedForAll: true } : m));
      });
    };

    // Clear listeners then register
    socket.off('new_friend_request', onNewFriendReq);
    socket.off('friend_request_accepted', onFriendAccepted);
    socket.off('friend_request_rejected', onFriendRejected);
    socket.off('friend_request_declined', onFriendDeclined);
    socket.off('friend_request_canceled', onFriendCancelled as any);
    socket.off('friend_request_cancelled', onFriendCancelled as any);
    socket.off('friend_request_denied', onFriendRejected as any);
    socket.off('friend_request_reject', onFriendRejected as any);
    socket.off('friendRejected', onFriendRejected as any);
    socket.off('friendRequestRejected', onFriendRejected as any);
    socket.off('friendship_updated', onFriendRejected as any);
    socket.off('friendship:update', onFriendRejected as any);
    socket.off('friend_request_withdrawn', onFriendCancelled as any);
    socket.off('friendRequestCanceled', onFriendCancelled as any);
    socket.off('friendRequestCancelled', onFriendCancelled as any);
    socket.off('new_message', onNewMessage);
    socket.off('group_message', onGroupMessage);
    socket.off('message_sent', onMessageSent);
    socket.off('message_delivered', onMessageDelivered);
    socket.off('message_read', onMessageRead);
    socket.off('message_blocked', onMessageBlocked);
    socket.off('user_blocked', onUserBlocked as any);
    socket.off('user_unblocked', onUserUnblocked as any);
    socket.off('group_message_delivered', onGroupMessageDelivered);
    socket.off('group_message_read', onGroupMessageRead);
    socket.off('user_online', onUserOnline);
    socket.off('user_offline', onUserOffline);
    socket.off('user_profile_updated', onUserProfileUpdated);
    socket.off('user_typing', onUserTyping);
    socket.off('group_typing', onGroupTyping as any);
    socket.off('messages_recalled', dmRecalledHandler);
    socket.off('group_messages_recalled', groupRecalledHandler);
    socket.off('group_updated', onGroupUpdated);
    socket.off('group_invited', onGroupInvited);
    socket.off('group_member_left', onGroupMemberLeft);

    socket.on('new_friend_request', onNewFriendReq);
    socket.on('friend_request_accepted', onFriendAccepted);
    socket.on('friend_request_rejected', onFriendRejected);
    socket.on('friend_request_declined', onFriendDeclined);
    socket.on('group_invited', onGroupInvited);
    socket.on('friend_request_canceled', onFriendCancelled as any);
    socket.on('friend_request_cancelled', onFriendCancelled as any);
    socket.on('friend_request_denied', onFriendRejected as any);
    socket.on('friend_request_reject', onFriendRejected as any);
    socket.on('friendRejected', onFriendRejected as any);
    socket.on('friendRequestRejected', onFriendRejected as any);
    socket.on('friendship_updated', onFriendRejected as any);
    socket.on('friendship:update', onFriendRejected as any);
    socket.on('friend_request_withdrawn', onFriendCancelled as any);
    socket.on('friendRequestCanceled', onFriendCancelled as any);
    socket.on('friendRequestCancelled', onFriendCancelled as any);
    socket.on('new_message', onNewMessage);
    socket.on('group_message', onGroupMessage);
    socket.on('group_members_removed', onGroupMembersRemoved);
    socket.on('group_member_removed', onGroupMemberRemoved);
    socket.on('group_member_left', onGroupMemberLeft);
    socket.on('group_updated', onGroupUpdated);
    socket.on('group_deleted', onGroupDeleted);
    socket.on('group_member_role_updated', onGroupMemberRoleUpdated);
    socket.on('message_reacted', onMessageReacted);
    socket.on('message_unreacted', onMessageUnreacted);
    socket.on('group_message_reacted', onGroupMessageReacted);
    socket.on('group_message_unreacted', onGroupMessageUnreacted);
    socket.on('nickname_updated', onNicknameUpdated);
    socket.on('friend_removed', onFriendRemoved);
    socket.on('message_edited', (payload: { id: number; content: string; updatedAt?: string }) => {
      setMessages((prev: any[]) => prev.map((m: any) => (m.id === payload.id ? { ...m, content: payload.content, updatedAt: payload.updatedAt || m.updatedAt } : m)));
    });
    socket.on('messages_recalled', dmRecalledHandler);
    socket.on('group_messages_recalled', groupRecalledHandler);
    socket.on('group_message_edited', (payload: { id: number; groupId: number; content: string; updatedAt?: string }) => {
      if (!selectedGroup || payload.groupId !== selectedGroup.id) return;
      setMessages((prev: any[]) => prev.map((m: any) => (m.id === payload.id ? { ...m, content: payload.content, updatedAt: payload.updatedAt || m.updatedAt } : m)));
    });
    socket.on('group_messages_deleted', onGroupMessagesDeleted);
    socket.on('message_sent', onMessageSent);
    socket.on('message_delivered', onMessageDelivered);
    socket.on('message_read', onMessageRead);
    socket.on('shared_note_removed', onSharedNoteRemoved);
    socket.on('note_deleted', onNoteDeleted);
    socket.on('note_updated', onNoteUpdated);
    socket.on('message_blocked', onMessageBlocked);
    socket.on('user_blocked', onUserBlocked as any);
    socket.on('user_unblocked', onUserUnblocked as any);
    socket.on('group_message_delivered', onGroupMessageDelivered);
    socket.on('group_message_read', onGroupMessageRead);
    socket.on('user_online', onUserOnline);
    socket.on('user_offline', onUserOffline);
    socket.on('user_profile_updated', onUserProfileUpdated);
    socket.on('user_typing', onUserTyping);
    socket.on('group_typing', onGroupTyping as any);

    // Shared notes permissions realtime (admin updates)
    socket.on('shared_permissions_updated', onSharedPermissionsUpdated);
    socket.on('note_shared_with_me', onNoteSharedWithMe);
    socket.on('note_shared_by_me', onNoteSharedByMe);
    socket.on('create_permissions_changed', onCreatePermissionsChanged);
    socket.on('group_shared_note_updated_by_admin', onGroupSharedNoteUpdatedByAdmin);
    socket.on('group_shared_note_updated', onGroupSharedNoteUpdated);

    // Reactions: direct messages
    socket.on('message_reacted', onMessageReacted);
    socket.on('message_unreacted', onMessageUnreacted);

    // Reactions: group messages
    socket.on('group_message_reacted', onGroupMessageReacted);
    socket.on('group_message_unreacted', onGroupMessageUnreacted);

    // Admin actions
    socket.on('message_recalled_by_admin', onMessageRecalledByAdmin);
    socket.on('message_deleted_by_admin', onMessageDeletedByAdmin);
    socket.on('group_message_recalled_by_admin', onGroupMessageRecalledByAdmin);
    socket.on('group_message_deleted_by_admin', onGroupMessageDeletedByAdmin);
    socket.on('message_edited_by_admin', onMessageEditedByAdmin);
    socket.on('group_message_edited_by_admin', onGroupMessageEditedByAdmin);

    return () => {
      socket.off('new_friend_request', onNewFriendReq);
      socket.off('friend_request_accepted', onFriendAccepted);
      socket.off('friend_request_rejected', onFriendRejected);
      socket.off('friend_request_declined', onFriendDeclined);
      socket.off('friend_request_canceled', onFriendCancelled as any);
      socket.off('friend_request_cancelled', onFriendCancelled as any);
      socket.off('friend_request_denied', onFriendRejected as any);
      socket.off('friend_request_reject', onFriendRejected as any);
      socket.off('friendRejected', onFriendRejected as any);
      socket.off('friendRequestRejected', onFriendRejected as any);
      socket.off('friendship_updated', onFriendRejected as any);
      socket.off('friendship:update', onFriendRejected as any);
      socket.off('friend_request_withdrawn', onFriendCancelled as any);
      socket.off('friendRequestCanceled', onFriendCancelled as any);
      socket.off('friendRequestCancelled', onFriendCancelled as any);
      socket.off('new_message', onNewMessage);
      socket.off('group_message', onGroupMessage);
      socket.off('friend_removed', onFriendRemoved);
      socket.off('group_members_removed', onGroupMembersRemoved);
      socket.off('group_member_removed', onGroupMemberRemoved);
      socket.off('group_member_left', onGroupMemberLeft);
      socket.off('group_deleted', onGroupDeleted);
    socket.off('group_member_role_updated', onGroupMemberRoleUpdated);
      socket.off('message_reacted', onMessageReacted);
      socket.off('message_unreacted', onMessageUnreacted);
      socket.off('group_message_reacted', onGroupMessageReacted);
      socket.off('group_message_unreacted', onGroupMessageUnreacted);
      socket.off('nickname_updated', onNicknameUpdated);
      socket.off('message_edited');
      socket.off('message_recalled_by_admin', onMessageRecalledByAdmin);
      socket.off('message_deleted_by_admin', onMessageDeletedByAdmin);
      socket.off('group_message_recalled_by_admin', onGroupMessageRecalledByAdmin);
      socket.off('group_message_deleted_by_admin', onGroupMessageDeletedByAdmin);
      socket.off('message_edited_by_admin', onMessageEditedByAdmin);
      socket.off('group_message_edited_by_admin', onGroupMessageEditedByAdmin);
      socket.off('group_messages_recalled', groupRecalledHandler);
      socket.off('group_message_edited');
      socket.off('group_messages_deleted', onGroupMessagesDeleted);
      socket.off('message_sent', onMessageSent);
      socket.off('message_delivered', onMessageDelivered);
      socket.off('message_read', onMessageRead);
      socket.off('shared_note_removed', onSharedNoteRemoved);
      socket.off('note_deleted', onNoteDeleted);
      socket.off('note_updated', onNoteUpdated);
      socket.off('message_blocked', onMessageBlocked);
      socket.off('user_blocked', onUserBlocked as any);
      socket.off('user_unblocked', onUserUnblocked as any);
      socket.off('group_message_delivered', onGroupMessageDelivered);
      socket.off('group_message_read', onGroupMessageRead);
      socket.off('user_online', onUserOnline);
      socket.off('user_offline', onUserOffline);
      socket.off('user_profile_updated', onUserProfileUpdated);
      socket.off('user_typing', onUserTyping);
      socket.off('group_typing', onGroupTyping as any);
      socket.off('group_updated', onGroupUpdated);
      socket.off('group_invited', onGroupInvited);
      socket.off('messages_recalled', dmRecalledHandler);
      socket.off('shared_permissions_updated', onSharedPermissionsUpdated);
      socket.off('note_shared_with_me', onNoteSharedWithMe);
      socket.off('note_shared_by_me', onNoteSharedByMe);
      socket.off('create_permissions_changed', onCreatePermissionsChanged);
      socket.off('group_shared_note_updated_by_admin', onGroupSharedNoteUpdatedByAdmin);
      socket.off('group_shared_note_updated', onGroupSharedNoteUpdated);
      if ((socket as any).offAny) {
        try {
          (socket as any).offAny(onAnyLogger);
        } catch (_err) {
          /* ignore */
        }
      }
    };
  }, [currentUser, selectedChat, selectedGroup, friends, users, searchTerm]);

  // Enrich readBy.user khi profile (selectedChat/friends/users) thay đổi để cập nhật avatar real-time
  useEffect(() => {
    try {
      setMessages((prev: any[]) => {
        if (!Array.isArray(prev) || prev.length === 0) return prev;
        const fr = friends || [];
        const us = users || [];
        const sc = selectedChat;
        let changed = false;
        const next = prev.map((m: any) => {
          if (!Array.isArray(m.readBy) || m.readBy.length === 0) return m;
          let innerChanged = false;
          const enriched = m.readBy.map((rb: any) => {
            if (rb?.user?.avatar) return rb;
            const uid = Number(rb.userId);
            const match = (sc && Number((sc as any).id) === uid)
              ? sc
              : (fr.find((f: any) => Number(f.id) === uid) || us.find((u: any) => Number(u.id) === uid));
            if (match) {
              innerChanged = true;
              return { ...rb, user: { ...(rb.user || {}), ...match } };
            }
            return rb;
          });
          if (innerChanged) { changed = true; return { ...m, readBy: enriched }; }
          return m;
        });
        return changed ? next : prev;
      });
    } catch {/* ignore */}
  }, [selectedChat, friends, users, setMessages]);
}
