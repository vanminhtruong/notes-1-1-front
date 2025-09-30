import { useMemo } from 'react';
import { type User, type Message, type MessageGroup, type ChatWindowProps, type GroupSummary, useState, useEffect, useRef, toast, useTranslation, chatService, groupService, getSocket, useMessageNotifications, useChatSocket, useChatData, useMessageComposer, useAttachmentDownloader, useGroupedMessages, useFilteredUsers, useUnreadChats, useGroupOnline, useRemovableMembers, useBellNavigation, usePreviewEscape, useVisibilityRefresh, useAutoScroll, useChatOpeners, useChatSettings, useChatBackground, useReadReceipts, useFriendRequestActions, useTypingAndGroupSync, ChatHeader, UsersList, ChatList, ChatView, MessageInput, ImagePreview, GroupsTab, GroupEditorModal, RemoveMembersModal, ChatSettings, SetPinModal, EnterPinModal, SharedNotesTab, getCachedUser } from './interface/chatWindowImports';
import { blockService, type BlockStatus } from '@/services/blockService';
import { notificationService } from '@/services/notificationService';
import type { NotificationPagination } from './interface/NotificationBell.interface';

const ChatWindow = ({ isOpen, onClose }: ChatWindowProps) => {
  const { t } = useTranslation('dashboard');
  const currentUser = getCachedUser();
  const [activeTab, setActiveTab] = useState<'users' | 'chats' | 'unread' | 'groups' | 'sharedNotes'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [, setFriendRequestsMeta] = useState<Record<number, string | Date>>({});
  const [, setPersistedFriendRequests] = useState<User[]>([]);
  const [, setPersistedFriendRequestsMeta] = useState<Record<number, string | Date>>({});
  const [selectedChat, setSelectedChat] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupSummary | null>(null);
  const [messages, setMessages] = useState<(Message | any)[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<number | undefined>(undefined);
  const typingSentRef = useRef(false);
  const [groupTypingUsers, setGroupTypingUsers] = useState<Array<{ id: any; name: string; avatar?: string }>>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<Array<{ id: string; file: File; preview: string }>>([]);
  const [pendingFiles, setPendingFiles] = useState<Array<{ id: string; file: File }>>([]);
  const [menuOpenKey, setMenuOpenKey] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<any | null>(null);
  const [onlineIds, setOnlineIds] = useState<number[]>([]);
  const [chatList, setChatList] = useState<Array<{ friend: User; lastMessage: Message | null; unreadCount?: number; friendshipId?: number; isPinned?: boolean }>>([]);
  const [showGroupEditor, setShowGroupEditor] = useState(false);
  const [showRemoveMembers, setShowRemoveMembers] = useState(false);
  const [, setPendingInvites] = useState<Array<{ id: number; status: 'pending' | 'accepted' | 'declined'; group: any; inviter: any }>>([]);
  const [blockStatus, setBlockStatus] = useState<BlockStatus | null>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const {
    e2eeEnabled,
    e2eePinHash,
    e2eeUnlocked,
    showSetPin,
    showEnterPin,
    readStatusEnabled,
    hidePhone,
    hideBirthDate,
    allowMessagesFromNonFriends,
    blockedUsers,
    openSettings,
    closeSettings,
    setShowSetPin,
    setShowEnterPin,
    setE2EEUnlocked,
    handleToggleE2EE,
    handleToggleReadStatus,
    handleToggleHidePhone,
    handleToggleHideBirthDate,
    handleToggleAllowMessagesFromNonFriends,
    handleUnblockUser,
    handleSetPin,
    showSettings,
  } = useChatSettings(t);

  // Notifications: unread per user + group + ring animation
  const { unreadMap, ring, ringSeq, totalUnread, totalGroupUnread, markChatAsRead, markGroupAsRead, markAllRead, hydrateFromChatList } = useMessageNotifications(
    currentUser?.id,
    selectedChat?.id ?? null,
    selectedGroup?.id ?? null
  );
  const [myGroups, setMyGroups] = useState<GroupSummary[]>([]);
  const [bellFeedItems, setBellFeedItems] = useState<Array<{ id: number; name: string; avatar?: string | null; count?: number; time?: string }>>([]);
  const [bellBadgeTotal, setBellBadgeTotal] = useState<number>(0);
  const [bellPagination, setBellPagination] = useState<NotificationPagination | undefined>(undefined);
  const [bellLoading, setBellLoading] = useState<boolean>(false);
  const loadBellFeed = async (page: number = 1, limit: number = 4) => {
    setBellLoading(true);
    try {
      const [feedRes, badgeRes] = await Promise.all([
        notificationService.getBellFeed({ page, limit }),
        notificationService.getBellBadge().catch(() => null),
      ]);
      if (feedRes?.success && feedRes.data) {
        if (page === 1) {
          setBellFeedItems(feedRes.data.items || []);
        } else {
          setBellFeedItems(prev => [...prev, ...(feedRes.data.items || [])]);
        }
        setBellPagination(feedRes.data.pagination);
      }
      if (badgeRes?.success) setBellBadgeTotal(Number(badgeRes.data?.total || 0));
    } catch {}
    finally {
      setBellLoading(false);
    }
  };

  const handleLoadMoreNotifications = () => {
    if (bellPagination?.hasNextPage) {
      loadBellFeed(bellPagination.currentPage + 1);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadBellFeed();
  }, []);

  const handleBellItemDismiss = async (id: number) => {
    try {
      if (id === -1001) {
        await notificationService.dismissBellItem('fr');
        setBellFeedItems((prev) => prev.filter((x) => x.id !== -1001));
      } else if (id === -1002) {
        await notificationService.dismissBellItem('inv');
        setBellFeedItems((prev) => prev.filter((x) => x.id !== -1002));
      } else if (id <= -300000) {
        const groupId = -id - 300000;
        await notificationService.dismissBellItem('group', groupId);
        setBellFeedItems((prev) => prev.filter((x) => x.id !== id));
      } else {
        await notificationService.dismissBellItem('dm', id);
        setBellFeedItems((prev) => prev.filter((x) => x.id !== id));
      }
      // Reload first page after dismiss
      await loadBellFeed(1);
    } catch (e) {
      // soft fail, keep UI unchanged if error
    }
  };

  const bellNotificationItems = useMemo(() => {
    return (bellFeedItems || []).map((it) => ({
      id: it.id,
      name: it.name,
      avatar: (it.avatar || undefined) as string | undefined,
      count: Number(it.count || 0),
      time: it.time,
    }));
  }, [bellFeedItems]);

  const reloadBellFeed = async () => {
    await loadBellFeed(1);
  };

  const unreadChats = useUnreadChats(chatList, unreadMap);

  useEffect(() => {
    if (Array.isArray(chatList) && chatList.length >= 0) {
      hydrateFromChatList(chatList as any);
    }
  }, [chatList]);

  const filteredUsers = useFilteredUsers(users, friends, friendRequests, searchTerm, currentUser?.id);
  const groupedMessages = useGroupedMessages(messages);
  const isSelectedGroupOnline = useGroupOnline(selectedGroup, onlineIds, currentUser?.id);
  const removableMembers = useRemovableMembers(selectedGroup, friends, users, currentUser, t);
  const scrollToBottom = () => {};

  useEffect(() => {
    if (isOpen) setSearchTerm('');
  }, [isOpen]);

  useEffect(() => {
    if (showEnterPin) setSearchTerm('');
  }, [showEnterPin]);

  useEffect(() => {
    setSearchTerm('');
  }, [currentUser?.id]);

  // Load per-chat background (1-1 only)
  const { chatBackgroundUrl, changeBackground, changeBackgroundForBoth, resetBackground } = useChatBackground(selectedChat?.id ?? null, t);

  // Prepend older messages (lazy load). Keep order ascending and dedupe by id.
  const handlePrependMessages = (older: any[]) => {
    if (!Array.isArray(older) || older.length === 0) return;
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m: any) => m.id));
      // Ensure older list is in ascending order (backend already returns ascending)
      const dedup = older.filter((m: any) => m && !existingIds.has(m.id));
      if (dedup.length === 0) return prev;
      return [...dedup, ...prev];
    });
  };

  // Remove messages by IDs (for admin deletion)
  const handleRemoveMessages = (messageIds: number[]) => {
    setMessages((prev) => prev.filter((m: any) => !messageIds.includes(m.id)));
  };

  // Update or insert a chatList entry with a new last message
  const upsertChatListWithMessage = (otherUserId: number, msg: Message) => {
    setChatList((prev) => {
      const baseFriend = friends.find((f) => f.id === otherUserId) || users.find((u) => u.id === otherUserId);
      if (!baseFriend) return prev;
      // Only update the existing item's lastMessage; do not reorder on client.
      const exists = prev.some((it) => it.friend.id === otherUserId);
      if (!exists) return prev;
      // Enrich friend avatar/name from message payload if available
      const enrichFromMsg = (it: typeof prev[number]) => {
        let name = it.friend.name;
        let avatar = (it.friend as any).avatar || null;
        const isOtherSender = (msg as any)?.senderId === otherUserId;
        const isOtherReceiver = (msg as any)?.receiverId === otherUserId;
        if (isOtherSender) {
          if ((msg as any)?.senderName) name = (msg as any).senderName;
          if ((msg as any)?.senderAvatar !== undefined) avatar = (msg as any).senderAvatar;
        } else if (isOtherReceiver) {
          if ((msg as any)?.receiverName) name = (msg as any).receiverName;
          if ((msg as any)?.receiverAvatar !== undefined) avatar = (msg as any).receiverAvatar;
        }
        return { ...it.friend, name, avatar } as any;
      };
      return prev.map((it) => (
        it.friend.id === otherUserId
          ? { ...it, friend: enrichFromMsg(it), lastMessage: msg }
          : it
      ));
    });
  };

  const tt = t;

  const confirmWithToast = (message: string) => new Promise<boolean>((resolve) => {
    const id = toast.custom((toastObj) => (
      <div className={`max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 ${toastObj.visible ? 'animate-in fade-in zoom-in' : 'animate-out fade-out zoom-out'}`}>
        <div className="text-sm text-gray-800 dark:text-gray-100 mb-3">{message}</div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => { toast.dismiss(id); resolve(false); }}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
          >
            {tt('actions.cancel', 'Cancel')}
          </button>
          <button
            onClick={() => { toast.dismiss(id); resolve(true); }}
            className="px-3 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white"
          >
            {tt('actions.confirm', 'Confirm')}
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  });

  const { loadUsers, loadFriends, loadChatList, loadFriendRequests, loadPendingInvites, loadNotifications } = useChatData({
    setUsers,
    setFriends,
    setOnlineIds,
    setChatList,
    setFriendRequests,
    setFriendRequestsMeta,
    setPersistedFriendRequests,
    setPersistedFriendRequestsMeta,
    setPendingInvites,
    setMyGroups,
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const editMessage = async (msg: Message, content: string) => {
    try {
      if (selectedGroup) {
        const res = await groupService.editGroupMessage(selectedGroup.id, msg.id, content);
        if (res.success) {
          setMessages((prev) => prev.map((m: any) => (m.id === msg.id ? { ...m, content: res.data.content, updatedAt: res.data.updatedAt } : m)));
          toast.success(t('chat.success.edit', 'Đã cập nhật tin nhắn'));
        }
      } else if (selectedChat) {
        const res = await chatService.editMessage(msg.id, content);
        if (res.success) {
          setMessages((prev) => prev.map((m: any) => (m.id === msg.id ? { ...m, content: res.data.content, updatedAt: res.data.updatedAt } : m)));
          setChatList((prev) => prev.map((it) => {
            const lm = it.lastMessage;
            if (!lm || lm.id !== msg.id) return it;
            return { ...it, lastMessage: { ...lm, content: res.data.content } };
          }));
          toast.success(t('chat.success.edit', 'Đã cập nhật tin nhắn'));
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('chat.errors.generic'));
    }
  };

  const { downloadAttachment } = useAttachmentDownloader(t);

  const { handleFileChange, sendMessage, sendGroupMessage, handleTyping, handleGroupTyping } = useMessageComposer({
    selectedChat,
    selectedGroup,
    newMessage,
    setNewMessage,
    setMessages,
    pendingImages,
    setPendingImages,
    pendingFiles,
    setPendingFiles,
    scrollToBottom,
    typingTimeoutRef,
    typingSentRef,
    upsertChatListWithMessage,
    t,
    replyingToMessage,
    clearReply: () => setReplyingToMessage(null),
  });

  useChatSocket({
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
    loadChatList,
    loadPendingInvites,
    loadNotifications,
    upsertChatListWithMessage,
    scrollToBottom,
    reloadBellFeed,
    t,
  });

  useReadReceipts({
    selectedChatId: selectedChat?.id ?? null,
    currentUserId: currentUser?.id,
    messages,
    markChatAsRead,
    loadChatList,
    setMessages,
  });

  const { startChat, startGroupChat } = useChatOpeners({
    currentUser,
    friends,
    users,
    setSelectedChat,
    setSelectedGroup,
    setActiveTab,
    markChatAsRead,
    markGroupAsRead,
    refreshChatList: loadChatList,
    setChatList,
    setMenuOpenKey,
    setMessages,
    setHistoryLoading,
    pendingImages,
    setPendingImages,
    pendingFiles,
    setPendingFiles,
    scrollToBottom,
  });

  const { handleBellItemClick } = useBellNavigation({
    friends,
    users,
    myGroups,
    startChat,
    startGroupChat,
    setActiveTab,
  });

  const recallGroup = async (group: MessageGroup, scope: 'self' | 'all') => {
    const ids = group.items.map((i) => i.id);
    try {
      let ok = false;
      if (selectedGroup) {
        const resp = await groupService.recallGroupMessages(selectedGroup.id, ids, scope);
        ok = !!resp.success;
      } else if (selectedChat) {
        const resp = await chatService.recallMessages(ids, scope);
        ok = !!resp.success;
      } else {
        return;
      }
      if (ok) {
        if (scope === 'self') {
          setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
          toast.success(t('chat.success.recallSelf'));
        } else {
          setMessages((prev) => prev.map((m) => (ids.includes(m.id) ? { ...m, isDeletedForAll: true } : m)));
          toast.success(t('chat.success.recallAll'));
        }
        setMenuOpenKey(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.recall'));
    }
  };

  const recallMessage = async (msg: Message, scope: 'self' | 'all') => {
    try {
      let ok = false;
      if (selectedGroup) {
        const resp = await groupService.recallGroupMessages(selectedGroup.id, [msg.id], scope);
        ok = !!resp.success;
      } else if (selectedChat) {
        const resp = await chatService.recallMessages([msg.id], scope);
        ok = !!resp.success;
      } else {
        return;
      }
      if (ok) {
        if (scope === 'self') {
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
          toast.success(t('chat.success.recallSelf'));
        } else {
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isDeletedForAll: true } : m)));
          setChatList((prev) => prev.map((it) => {
            const lm = it.lastMessage;
            if (!lm || lm.id !== msg.id) return it;
            return { ...it, lastMessage: { ...lm, isDeletedForAll: true } };
          }));
          toast.success(t('chat.success.recallAll'));
        }
        setMenuOpenKey(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.recall'));
    }
  };

  useAutoScroll(messages, isPartnerTyping, scrollToBottom, selectedChat?.id, selectedGroup?.id);

  usePreviewEscape(previewImage, setPreviewImage);

  // Fallback: when window/tab regains focus, refresh Users + FriendRequests if Users tab is active
  useVisibilityRefresh(activeTab, searchTerm, loadUsers, loadFriendRequests);

  // Typing indicators and group sync extracted
  useTypingAndGroupSync({
    selectedChatId: selectedChat?.id ?? null,
    selectedGroup,
    friends,
    users,
    setIsPartnerTyping,
    setGroupTypingUsers,
    setMessages,
  });

  // Fetch and keep block status in sync for the selected 1-1 chat
  useEffect(() => {
    let mounted = true;
    setBlockStatus(null);
    if (!selectedChat) return;
    (async () => {
      try {
        const res = await blockService.getStatus(selectedChat.id);
        if (mounted) setBlockStatus(res.data);
      } catch {
        if (mounted) setBlockStatus(null);
      }
    })();

    const socket = getSocket();
    const refreshIfMatch = (payload: any) => {
      const userId = Number(payload?.userId);
      const targetId = Number(payload?.targetId);
      const me = Number(currentUser?.id);
      const other = Number(selectedChat?.id);
      if (!me || !other) return;
      const involvesPair = (userId === me && targetId === other) || (userId === other && targetId === me);
      if (involvesPair) {
        blockService
          .getStatus(other)
          .then((res) => setBlockStatus(res.data))
          .catch(() => {});
      }
    };
    if (socket) {
      socket.on('user_blocked', refreshIfMatch);
      socket.on('user_unblocked', refreshIfMatch);
    }
    return () => {
      mounted = false;
      if (socket) {
        socket.off('user_blocked', refreshIfMatch);
        socket.off('user_unblocked', refreshIfMatch);
      }
    };
  }, [selectedChat?.id, currentUser?.id]);

  // Friend request actions extracted
  const { sendFriendRequest, acceptFriendRequest, rejectFriendRequest } = useFriendRequestActions({
    setUsers,
    loadFriends,
    loadFriendRequests,
    loadUsers,
    searchTerm,
    loadChatList,
    t,
  });

  const handleDeleteMessages = async (friendId: number, friendName: string) => {
    try {
      const response = await chatService.deleteAllMessages(friendId);
      if (response.success) {
        toast.success(t('chat.success.messagesDeletedForMe', { name: friendName }));
        // Update chat list to remove the last message
        setChatList((prev) => prev.map((item) => 
          item.friend.id === friendId 
            ? { ...item, lastMessage: null, unreadCount: 0 }
            : item
        ));
        // If currently viewing this chat, clear messages
        if (selectedChat?.id === friendId) {
          setMessages([]);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.generic'));
    }
  };

  // Block a user (for non-friends in Users tab)
  const handleBlockUser = async (user: User) => {
    try {
      const ok = await confirmWithToast(String(t('chat.confirm.block', { name: user.name, defaultValue: `Bạn có chắc chắn muốn chặn ${user.name}?` } as any)));
      if (!ok) return;
      const res = await blockService.block(user.id);
      if (res?.success) {
        // Optimistic: loại bỏ khỏi danh sách users hiện tại để không còn gợi ý
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        // Refresh từ backend để đồng bộ theo bộ lọc server (không lưu local theo rule)
        try { await loadUsers(searchTerm); } catch {}
        // Lưu ý: toast sự kiện đã được kích hoạt qua socket (useChatSocket) -> tránh toast trùng lặp
      }
    } catch (error: any) {
      // Nếu backend trả lỗi (ví dụ đã chặn), hiển thị thông báo
      toast.error(error?.response?.data?.message || t('chat.errors.generic'));
    }
  };

  if (!isOpen) return null;

  // Tổng badge: ưu tiên số liệu backend (DM + Group + FR + Invite).
  // Fallback/phản hồi tức thời: nếu backend chưa kịp trả, dùng tổng local (DM + Group + Friend Requests)
  const frCountLocal = Array.isArray(friendRequests) ? friendRequests.length : 0;
  const bellTotal = Math.max(
    Number(bellBadgeTotal || 0),
    Number((totalUnread || 0) + (totalGroupUnread || 0) + (frCountLocal || 0))
  );

  // Remove friend function
  const handleRemoveFriend = async (friendshipId: number, friendName: string) => {
    try {
      const response = await chatService.removeFriend(friendshipId);
      if (response.success) {
        toast.success(t('chat.success.friendRemoved', { name: friendName }));
        loadFriends();
        loadChatList();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.generic'));
    }
  };

  return (
    <div
      className="fixed inset-y-0 right-0 w-[32rem] max-w-full bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col z-50 transition-all duration-300 xl-down:w-[28rem] lg-down:w-[26rem] md-down:inset-0 md-down:w-full md-down:h-full md-down:max-h-screen md-down:shadow-none md-down:border-0 md-down:rounded-none md-down:bg-white/95 md-down:dark:bg-gray-900/95 md-down:backdrop-blur sm-down:bg-white sm-down:dark:bg-gray-900"
    >
      {/* Header */}
      <ChatHeader
        totalUnread={bellTotal}
        ring={ring}
        ringSeq={ringSeq}
        notificationItems={bellNotificationItems}
        notificationPagination={bellPagination}
        notificationLoading={bellLoading}
        searchTerm={searchTerm}
        activeTab={activeTab}
        onClose={onClose}
        onItemClick={handleBellItemClick}
        onItemDismissed={handleBellItemDismiss}
        onLoadMoreNotifications={handleLoadMoreNotifications}
        onClearAll={() => {
          // Mark per-chat and per-group counters as read locally for snappy UI + call backend APIs
          void (async () => {
            try {
              await markAllRead();
              // Persist: mark backend notifications (friend_request, group_invite) as read  
              await notificationService.markAllRead();
              // Refresh persisted notifications so aggregates disappear across refresh
              try { await loadNotifications(); } catch {}
              try { await loadPendingInvites(); } catch {}
              try {
                await loadBellFeed(1);
              } catch {}
            } catch {}
          })();
        }}
        onSearchChange={(value) => {
          setSearchTerm(value);
          loadUsers(value);
        }}
        onTabChange={setActiveTab}
        onOpenSettings={openSettings}
        showSettings={showSettings}
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {showSettings ? (
          <ChatSettings
            enabled={e2eeEnabled}
            hasPin={!!e2eePinHash}
            readStatusEnabled={readStatusEnabled}
            hidePhone={hidePhone}
            hideBirthDate={hideBirthDate}
            allowMessagesFromNonFriends={allowMessagesFromNonFriends}
            blockedUsers={blockedUsers as any}
            onBack={closeSettings}
            onToggle={handleToggleE2EE}
            onChangePin={() => setShowSetPin(true)}
            onToggleReadStatus={handleToggleReadStatus}
            onToggleHidePhone={handleToggleHidePhone}
            onToggleHideBirthDate={handleToggleHideBirthDate}
            onToggleAllowMessagesFromNonFriends={handleToggleAllowMessagesFromNonFriends}
            onUnblockUser={handleUnblockUser}
          />
        ) : (
          <>
        {activeTab === 'users' && (
          <UsersList
            friendRequests={friendRequests}
            filteredUsers={filteredUsers}
            onAcceptFriendRequest={acceptFriendRequest}
            onRejectFriendRequest={rejectFriendRequest}
            onSendFriendRequest={sendFriendRequest}
            onStartChat={startChat}
            onBlockUser={handleBlockUser}
          />
        )}

        {activeTab === 'chats' && (
          <div className="h-full flex flex-col">
            {selectedChat ? (
              <>
                <ChatView
                  selectedChat={selectedChat}
                  messages={messages}
                  groupedMessages={groupedMessages}
                  isPartnerTyping={isPartnerTyping}
                  menuOpenKey={menuOpenKey}
                  currentUserId={currentUser?.id}
                  initialAlias={(chatList.find((c) => c.friend.id === selectedChat.id) as any)?.nickname ?? null}
                  onBack={() => { setSelectedChat(null); setActiveTab('chats'); }}
                  onMenuToggle={setMenuOpenKey}
                  onRecallMessage={recallMessage}
                  onRecallGroup={recallGroup}
                  onEditMessage={editMessage}
                  onDownloadAttachment={downloadAttachment}
                  onPreviewImage={setPreviewImage}
                  initialLoading={historyLoading}
                  onPrependMessages={handlePrependMessages}
                  onRemoveMessages={handleRemoveMessages}
                  maskMessages={e2eeEnabled && !e2eeUnlocked}
                  lockedNotice={t('chat.encryption.chatLocked')}
                  onUnlock={() => setShowEnterPin(true)}
                  backgroundUrl={chatBackgroundUrl}
                  onChangeBackground={async () => {
                    if (!selectedChat) return;
                    await changeBackground(selectedChat.id);
                  }}
                  onChangeBackgroundForBoth={async () => {
                    if (!selectedChat) return;
                    await changeBackgroundForBoth(selectedChat.id);
                  }}
                  onResetBackground={async () => {
                    if (!selectedChat) return;
                    await resetBackground(selectedChat.id);
                  }}
                  blocked={blockStatus ? !!blockStatus.isEitherBlocked : true}
                  onReplyRequested={(m) => setReplyingToMessage(m)}
                />
                {!(blockStatus?.isEitherBlocked) ? (
                  <MessageInput
                    newMessage={newMessage}
                    pendingImages={pendingImages}
                    pendingFiles={pendingFiles}
                    onMessageChange={setNewMessage}
                    onSendMessage={sendMessage}
                    onFileChange={handleFileChange}
                    onRemoveImage={(id: string) => setPendingImages((prev) => prev.filter((p) => p.id !== id))}
                    onRemoveFile={(id: string) => setPendingFiles((prev) => prev.filter((p) => p.id !== id))}
                    onTyping={handleTyping}
                    onTypingStop={() => {
                      const socket = getSocket();
                      if (socket && selectedChat) {
                        socket.emit('typing_stop', { receiverId: selectedChat.id });
                        typingSentRef.current = false;
                      }
                    }}
                    replyingToMessage={replyingToMessage as any}
                    onClearReply={() => setReplyingToMessage(null)}
                  />
                ) : (
                  <div className="p-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    {t('chat.blocked.inputHidden', 'You cannot send messages or upload files in this conversation because one of you has blocked the other.')}
                  </div>
                )}
              </>
            ) : (
              <ChatList
                chatList={chatList}
                friends={friends}
                unreadMap={unreadMap}
                currentUserId={currentUser?.id}
                onStartChat={startChat}
                onRemoveFriend={handleRemoveFriend}
                onDeleteMessages={handleDeleteMessages}
                onRefreshChatList={loadChatList}
                e2eeEnabled={e2eeEnabled}
                e2eeUnlocked={e2eeUnlocked}
                lockedPlaceholder={t('chat.encryption.previewLocked')}
              />
            )}
          </div>
        )}

        {activeTab === 'unread' && (
          <div className="h-full flex flex-col">
            <ChatList
              chatList={unreadChats}
              friends={friends}
              unreadMap={unreadMap}
              currentUserId={currentUser?.id}
              onStartChat={startChat}
              onRemoveFriend={handleRemoveFriend}
              onDeleteMessages={handleDeleteMessages}
              onRefreshChatList={loadChatList}
              e2eeEnabled={e2eeEnabled}
              e2eeUnlocked={e2eeUnlocked}
              lockedPlaceholder={"\uD83D\uDD12 Encrypted — unlock to preview"}
            />
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="h-full flex flex-col">
            {selectedGroup ? (
              <>
                <ChatView
                  selectedChat={selectedGroup as any}
                  messages={messages}
                  groupedMessages={groupedMessages}
                  isPartnerTyping={false}
                  typingUsers={groupTypingUsers}
                  menuOpenKey={menuOpenKey}
                  currentUserId={currentUser?.id}
                  onBack={() => {
                    const gid = selectedGroup?.id;
                    setSelectedGroup(null);
                    setActiveTab('groups');
                    // After switching view, notify GroupsTab to clear badge and refresh
                    try {
                      if (typeof window !== 'undefined' && gid) {
                        setTimeout(() => {
                          try { window.dispatchEvent(new CustomEvent('group_marked_read', { detail: { groupId: gid } })); } catch {}
                        }, 60);
                      }
                    } catch {}
                  }}
                  onMenuToggle={setMenuOpenKey}
                  onRecallMessage={recallMessage}
                  onRecallGroup={recallGroup}
                  onEditMessage={editMessage}
                  onDownloadAttachment={downloadAttachment}
                  onPreviewImage={setPreviewImage}
                  initialLoading={historyLoading}
                  onPrependMessages={handlePrependMessages}
                  onRemoveMessages={handleRemoveMessages}
                  isGroup
                  groupOnline={isSelectedGroupOnline}
                  isGroupOwner={!!currentUser && currentUser.id === selectedGroup.ownerId}
                  onEditGroup={() => setShowGroupEditor(true)}
                  onRemoveMembers={() => setShowRemoveMembers(true)}
                  onLeaveGroup={async () => {
                    // Shown only for non-owners by ChatView
                    if (!selectedGroup) return;
                    const ok = await confirmWithToast(String(t('chat.groups.confirm.leave')));
                    if (!ok) return;
                    try {
                      const res = await groupService.leaveGroup(selectedGroup.id);
                      if (res.success) {
                        toast.success(t('chat.groups.success.left'));
                        setSelectedGroup(null);
                        setMessages([]);
                      }
                    } catch (err: any) {
                      toast.error(err.response?.data?.message || t('chat.errors.generic'));
                    }
                  }}
                  onDeleteGroup={async () => {
                    // Shown only for owners by ChatView
                    if (!selectedGroup) return;
                    const ok = await confirmWithToast(String(t('chat.groups.confirm.delete')));
                    if (!ok) return;
                    try {
                      const res = await groupService.deleteGroup(selectedGroup.id);
                      if (res.success) {
                        setSelectedGroup(null);
                        setMessages([]);
                      }
                    } catch (err: any) {
                      toast.error(err.response?.data?.message || t('chat.groups.errors.deleteFailed'));
                    }
                  }}
                  maskMessages={e2eeEnabled && !e2eeUnlocked}
                  lockedNotice={t('chat.encryption.groupLocked')}
                  onUnlock={() => setShowEnterPin(true)}
                  onReplyRequested={(m) => setReplyingToMessage(m)}
                />
                <RemoveMembersModal
                  isOpen={showRemoveMembers}
                  onClose={() => setShowRemoveMembers(false)}
                  members={removableMembers}
                  onConfirm={async (memberIds: number[]) => {
                    if (!selectedGroup) return;
                    try {
                      const res = await groupService.removeMembers(selectedGroup.id, memberIds);
                      if (res.success) {
                        toast.success(t('chat.groups.success.removed'));
                        setShowRemoveMembers(false);
                        // Update members locally; socket will also sync
                        setSelectedGroup((prev) => prev ? { ...prev, members: prev.members.filter((id) => !memberIds.includes(id)) } : prev);
                      }
                    } catch (err: any) {
                      toast.error(err.response?.data?.message || t('chat.groups.errors.removeFailed'));
                    }
                  }}
                />
                {(() => {
                  const isOwner = !!currentUser && selectedGroup.ownerId === currentUser.id;
                  const myRole = (selectedGroup as any)?.myRole as ('member'|'admin'|'owner'|undefined);
                  const isAdmin = myRole === 'admin' || myRole === 'owner' || isOwner;
                  const adminsOnly = !!(selectedGroup as any)?.adminsOnly;
                  const canSendGroup = !adminsOnly || isAdmin;
                  if (canSendGroup) {
                    return (
                      <MessageInput
                        newMessage={newMessage}
                        pendingImages={pendingImages}
                        pendingFiles={pendingFiles}
                        onMessageChange={setNewMessage}
                        onSendMessage={sendGroupMessage}
                        onFileChange={handleFileChange}
                        onRemoveImage={(id: string) => setPendingImages((prev) => prev.filter((p) => p.id !== id))}
                        onRemoveFile={(id: string) => setPendingFiles((prev) => prev.filter((p) => p.id !== id))}
                        onTyping={handleGroupTyping}
                        onTypingStop={() => {
                          const socket = getSocket();
                          if (socket && selectedGroup) {
                            socket.emit('group_typing', { groupId: selectedGroup.id, isTyping: false });
                            typingSentRef.current = false;
                          }
                        }}
                        replyingToMessage={replyingToMessage as any}
                        onClearReply={() => setReplyingToMessage(null)}
                      />
                    );
                  }
                  return (
                    <div className="p-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                      {t('chat.groups.adminsOnly.inputHidden', 'Chỉ quản trị viên mới được gửi tin nhắn vào nhóm. Tìm hiểu thêm')}
                    </div>
                  );
                })()}
              </>
            ) : (
              <GroupsTab onSelectGroup={startGroupChat} />
            )}
          </div>
        )}

        {activeTab === 'sharedNotes' && (
          <SharedNotesTab 
            searchTerm={searchTerm}
            currentUserId={currentUser?.id}
          />
        )}
          </>
        )}
      </div>

      {/* Group Editor Modal */}
      <GroupEditorModal
        isOpen={showGroupEditor}
        mode="edit"
        initial={selectedGroup || undefined}
        onClose={() => setShowGroupEditor(false)}
        onSuccess={(g) => {
          setSelectedGroup((prev) => (prev && prev.id === g.id ? g : prev));
        }}
      />

      <ImagePreview
        previewImage={previewImage}
        onClose={() => setPreviewImage(null)}
      />

      {/* E2EE PIN modals */}
      <SetPinModal
        isOpen={showSetPin}
        onClose={() => setShowSetPin(false)}
        hasExisting={!!e2eePinHash}
        onSet={handleSetPin}
      />
      <EnterPinModal
        isOpen={showEnterPin}
        onClose={() => setShowEnterPin(false)}
        onUnlock={() => {
          setE2EEUnlocked(true);
          sessionStorage.setItem('e2ee_unlocked', '1');
          setShowEnterPin(false);
        }}
        expectedHash={e2eePinHash}
      />
    </div>
  );
};

export default ChatWindow;