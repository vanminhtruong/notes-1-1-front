/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import type React from 'react';
import toast from 'react-hot-toast';
import { getSocket } from '../../../../services/socket';
import type { TFunction } from 'i18next';
import type { GroupSummary } from '../../../../services/groupService';
import type { User, Message } from '../../components/interface/ChatTypes.interface';

// Keep payload types loose to avoid over-constraining external events

type TypingUser = { id: any; name: string; avatar?: string };

type ChatListItem = { friend: User; lastMessage: Message | null; unreadCount?: number; friendshipId?: number };

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
  // helpers
  upsertChatListWithMessage: (otherUserId: number, msg: Message) => void;
  scrollToBottom: () => void;
  t: TFunction<"dashboard">;
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
    upsertChatListWithMessage,
    scrollToBottom,
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

    const onNewFriendReq = (data: any) => {
      toast.success(String(t('chat.notifications.newFriendRequest', { name: data.requester?.name } as any)));
      loadFriendRequests();
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
    };
    const onFriendRejected = (data: any) => {
      toast(String(t('chat.notifications.friendRejected', { name: data.rejectedBy?.name } as any)));
      loadUsers(searchTerm);
      loadFriendRequests();
    };
    const onFriendDeclined = (data: any) => onFriendRejected(data);
    const onFriendCancelled = () => {
      loadUsers(searchTerm);
      loadFriendRequests();
    };

    const onGroupInvited = () => {
      loadPendingInvites();
      toast(String(t('chat.groups.notifications.newInvite', { defaultValue: 'You have a new group invitation' })));
    };

    const onNewMessage = (data: any) => {
      if (selectedChat && (data.senderId === selectedChat.id || data.receiverId === selectedChat.id)) {
        setMessages((prev: any[]) => {
          const exists = Array.isArray(prev) && prev.some((m: any) => m.id === data.id);
          if (exists) return prev;
          
          let messageWithStatus;
          // If receiving message from someone else while chat is open, mark as read immediately
          if (data.senderId !== currentUser?.id) {
            messageWithStatus = {
              ...data,
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
              socket.emit('message_read', { messageId: data.id, chatId: selectedChat.id });
            }
          } else {
            // Own message - keep as sent until backend confirms delivery
            messageWithStatus = {
              ...data,
              status: 'sent'
            };
          }
          
          return [...(prev as any[]), messageWithStatus];
        });
        setTimeout(scrollToBottom, 100);
      }
      const isOwn = currentUser && data.senderId === currentUser.id;
      const otherId = isOwn ? data.receiverId : data.senderId;
      if (otherId != null) {
        upsertChatListWithMessage(otherId, data as Message);
        // Ensure ordering matches backend logic (pinned first)
        if (typeof loadChatList === 'function') {
          loadChatList();
        }
      }
    };

    const onGroupMessage = (data: any) => {
      if (selectedGroup && data.groupId === selectedGroup.id) {
        const enriched = data.sender
          ? data
          : {
              ...data,
              sender: (data.senderAvatar || data.senderName)
                ? { id: data.senderId, name: data.senderName, avatar: data.senderAvatar }
                : resolveUser(data.senderId),
            };
        
        // Set initial status based on sender
        const messageWithStatus = {
          ...enriched,
          status: enriched.senderId === currentUser?.id ? 'sent' : 'delivered'
        };

        // Auto-send read receipt for group messages when viewing
        if (enriched.senderId !== currentUser?.id) {
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
          } else {
            // Still mark as delivered for unread count purposes, but no read receipts
            messageWithStatus.status = 'delivered';
          }
        }

        setMessages((prev: any[]) => {
          const exists = Array.isArray(prev) && prev.some((m: any) => m.id === messageWithStatus.id);
          if (exists) return prev as any[];
          return [...(prev as any[]), messageWithStatus];
        });
        setTimeout(scrollToBottom, 100);
      }
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
      // Update message status to read and add readBy info
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
        setSelectedGroup(data);
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
      setSelectedGroup((prev: GroupSummary | null) => (prev ? { ...prev, members: prev.members.filter((id: number) => id !== data.userId) } : prev));
      const u = resolveUser(data.userId) as any;
      const name = u?.name || `User ${data.userId}`;
      const sysMsg = {
        id: Date.now(),
        senderId: 0,
        receiverId: data.groupId,
        content: `${name} left the group`,
        messageType: 'system' as const,
        createdAt: new Date().toISOString(),
      } as any;
      setMessages((prev) => ([...(prev as any[]), sysMsg]));
      setTimeout(scrollToBottom, 100);
    };

    const onGroupDeleted = (data: { groupId: number }) => {
      if (selectedGroup && data.groupId === selectedGroup.id) {
        toast(String(t('chat.groups.success.deleted')));
        setSelectedGroup(null);
        setMessages([]);
      }
    };

    const onFriendRemoved = (data: any) => {
      toast.error(String(t('chat.notifications.friendRemoved', { name: data.removedBy?.name, defaultValue: `${data.removedBy?.name} removed you as friend` })));
      setFriends((prev: User[]) => prev.filter((f) => f.id !== data.removedBy?.id));
      setChatList((prev: ChatListItem[]) => prev.filter((item) => item.friend.id !== data.removedBy?.id));
      if (selectedChat && selectedChat.id === data.removedBy?.id) {
        setSelectedChat(null);
        setMessages([]);
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
    socket.off('messages_recalled');
    socket.off('group_updated', onGroupUpdated);
    socket.off('group_invited', onGroupInvited);
    socket.off('group_member_left', onGroupMemberLeft);

    socket.on('new_friend_request', onNewFriendReq);
    socket.on('friend_request_accepted', onFriendAccepted);
    socket.on('friend_request_rejected', onFriendRejected);
    socket.on('friend_request_declined', onFriendDeclined);
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
    socket.on('group_deleted', onGroupDeleted);
    socket.on('message_edited', (payload: { id: number; content: string; updatedAt?: string }) => {
      setMessages((prev: any[]) => prev.map((m: any) => (m.id === payload.id ? { ...m, content: payload.content, updatedAt: payload.updatedAt || m.updatedAt } : m)));
    });
    socket.on('group_messages_recalled', (payload: { groupId: number; scope: 'self'|'all'; messageIds: number[] }) => {
      if (!payload || !selectedGroup || payload.groupId !== selectedGroup.id) return;
      setMessages((prev: any[]) => {
        if (!Array.isArray(prev) || prev.length === 0) return prev;
        const idSet = new Set(payload.messageIds);
        if (payload.scope === 'self') {
          return prev.filter((m: any) => !idSet.has(m.id));
        }
        return prev.map((m: any) => (idSet.has(m.id) ? { ...m, isDeletedForAll: true } : m));
      });
    });
    socket.on('group_message_edited', (payload: { id: number; groupId: number; content: string; updatedAt?: string }) => {
      if (!selectedGroup || payload.groupId !== selectedGroup.id) return;
      setMessages((prev: any[]) => prev.map((m: any) => (m.id === payload.id ? { ...m, content: payload.content, updatedAt: payload.updatedAt || m.updatedAt } : m)));
    });
    socket.on('message_sent', onMessageSent);
    socket.on('message_delivered', onMessageDelivered);
    socket.on('message_read', onMessageRead);
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
    socket.on('group_updated', onGroupUpdated);
    socket.on('group_invited', onGroupInvited);
    socket.on('friend_removed', onFriendRemoved);
    socket.on('messages_recalled', (payload: { scope: 'self' | 'all'; messageIds: number[] }) => {
      setMessages((prev: any[]) => {
        if (!Array.isArray(prev) || prev.length === 0) return prev;
        const idSet = new Set(payload.messageIds);
        if (payload.scope === 'self') {
          return prev.filter((m: any) => !idSet.has(m.id));
        } else {
          return prev.map((m: any) => (idSet.has(m.id) ? { ...m, isDeletedForAll: true } : m));
        }
      });
      setChatList((prev: ChatListItem[]) => {
        const idSet = new Set(payload.messageIds);
        return prev.map((it) => {
          const lm = it.lastMessage;
          if (!lm) return it;
          if (!idSet.has(lm.id)) return it;
          if (payload.scope === 'all') {
            return { ...it, lastMessage: { ...lm, isDeletedForAll: true } } as ChatListItem;
          }
          return it;
        });
      });
    });

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
      socket.off('message_edited');
      socket.off('group_messages_recalled');
      socket.off('group_message_edited');
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
      socket.off('group_updated', onGroupUpdated);
      socket.off('group_invited', onGroupInvited);
      socket.off('messages_recalled');
      if ((socket as any).offAny) {
        try {
          (socket as any).offAny(onAnyLogger);
        } catch (_err) {
          /* ignore */
        }
      }
    };
  }, [currentUser, selectedChat, selectedGroup, friends, users, searchTerm]);
}
