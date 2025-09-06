import { type User, type Message, type MessageGroup, type ChatWindowProps, type GroupSummary, useState, useEffect, useRef, toast, useTranslation, chatService, groupService, getSocket, useMessageNotifications, useChatSocket, useChatData, useMessageComposer, useAttachmentDownloader, useGroupedMessages, useFilteredUsers, useUnreadChats, useGroupOnline, useRemovableMembers, useNotificationItems, useBellNavigation, usePreviewEscape, useVisibilityRefresh, useAutoScroll, useChatOpeners, useChatSettings, useChatBackground, useReadReceipts, useFriendRequestActions, useTypingAndGroupSync, ChatHeader, UsersList, ChatList, ChatView, MessageInput, ImagePreview, GroupsTab, GroupEditorModal, RemoveMembersModal, ChatSettings, SetPinModal, EnterPinModal, getCachedUser } from './interface/chatWindowImports';
import { blockService, type BlockStatus } from '@/services/blockService';

const ChatWindow = ({ isOpen, onClose }: ChatWindowProps) => {
  const { t } = useTranslation('dashboard');
  const currentUser = getCachedUser();
  const [activeTab, setActiveTab] = useState<'users' | 'chats' | 'unread' | 'groups'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [selectedChat, setSelectedChat] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupSummary | null>(null);
  const [messages, setMessages] = useState<(Message | any)[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<number | undefined>(undefined);
  const typingSentRef = useRef(false);
  // Track group typing users: { id, name, avatar? }
  const [groupTypingUsers, setGroupTypingUsers] = useState<Array<{ id: any; name: string; avatar?: string }>>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<Array<{ id: string; file: File; preview: string }>>([]);
  const [pendingFiles, setPendingFiles] = useState<Array<{ id: string; file: File }>>([]);
  const [menuOpenKey, setMenuOpenKey] = useState<string | null>(null);
  // Track online user IDs for presence aggregation
  const [onlineIds, setOnlineIds] = useState<number[]>([]);
  // Chat list for last message previews
  const [chatList, setChatList] = useState<Array<{ friend: User; lastMessage: Message | null; unreadCount?: number; friendshipId?: number; isPinned?: boolean }>>([]);
  // Group editor modal visibility
  const [showGroupEditor, setShowGroupEditor] = useState(false);
  const [showRemoveMembers, setShowRemoveMembers] = useState(false);
  // Pending group invites
  const [pendingInvites, setPendingInvites] = useState<Array<{ id: number; status: 'pending' | 'accepted' | 'declined'; group: any; inviter: any }>>([]);
  // Block status for currently selected direct chat
  const [blockStatus, setBlockStatus] = useState<BlockStatus | null>(null);

  // Settings & E2EE state (extracted)
  const {
    e2eeEnabled,
    e2eePinHash,
    e2eeUnlocked,
    showSetPin,
    showEnterPin,
    readStatusEnabled,
    hidePhone,
    hideBirthDate,
    openSettings,
    closeSettings,
    setShowSetPin,
    setShowEnterPin,
    setE2EEUnlocked,
    handleToggleE2EE,
    handleToggleReadStatus,
    handleToggleHidePhone,
    handleToggleHideBirthDate,
    handleSetPin,
    showSettings,
  } = useChatSettings(t);

  // Notifications: unread per user + group + ring animation
  const { unreadMap, groupUnreadMap, totalUnread, totalGroupUnread, ring, ringSeq, markChatAsRead, markGroupAsRead, resetAll, hydrateFromChatList } = useMessageNotifications(
    currentUser?.id,
    selectedChat?.id ?? null,
    selectedGroup?.id ?? null
  );
  // Cache my groups to resolve names/avatars for bell items
  const [myGroups, setMyGroups] = useState<GroupSummary[]>([]);
  const notificationItems = useNotificationItems(
    unreadMap,
    groupUnreadMap,
    myGroups,
    friends,
    users,
    friendRequests,
    pendingInvites,
    t
  );

  // Chats that currently have unread messages
  const unreadChats = useUnreadChats(chatList, unreadMap);

  // Keep unreadMap in sync with backend-sourced chatList counts for persistence
  useEffect(() => {
    if (Array.isArray(chatList) && chatList.length >= 0) {
      hydrateFromChatList(chatList as any);
    }
  }, [chatList]);

  // Users tab search results (exclude self, existing friends, and received requests)
  const filteredUsers = useFilteredUsers(users, friends, friendRequests, searchTerm, currentUser?.id);

  // Group consecutive messages from the same sender within a short time window
  const groupedMessages = useGroupedMessages(messages);

  // Consider group online if ANY member is online, including current user
  const isSelectedGroupOnline = useGroupOnline(selectedGroup, onlineIds, currentUser?.id);

  // Members list for the RemoveMembersModal (exclude owner)
  const removableMembers = useRemovableMembers(selectedGroup, friends, users, currentUser, t);

  // ChatView handles scrolling to bottom on message changes and typing; keep a no-op here
  // to satisfy useMessageComposer interface without redundant refs in this component.
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

  // Update or insert a chatList entry with a new last message
  const upsertChatListWithMessage = (otherUserId: number, msg: Message) => {
    setChatList((prev) => {
      const friend = friends.find((f) => f.id === otherUserId) || users.find((u) => u.id === otherUserId);
      if (!friend) return prev;
      // Only update the existing item's lastMessage; do not reorder on client.
      const exists = prev.some((it) => it.friend.id === otherUserId);
      if (!exists) return prev;
      return prev.map((it) => (
        it.friend.id === otherUserId 
          ? { ...it, lastMessage: msg } 
          : it
      ));
    });
  };

  // Local hooks: load data, compose messages, and downloading
  const { loadUsers, loadFriends, loadChatList, loadFriendRequests, loadPendingInvites } = useChatData({
    setUsers,
    setFriends,
    setOnlineIds,
    setChatList,
    setFriendRequests,
    setPendingInvites,
    setMyGroups,
  });

  // Edit a single message (1-1 or group)
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
          // Reflect in chat list preview if this was the last message
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
  });

  // Socket listeners extracted to hook to keep component lean
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
    upsertChatListWithMessage,
    scrollToBottom,
    t,
  });

  // Send read receipts for unread messages when opening a chat
  useReadReceipts({
    selectedChatId: selectedChat?.id ?? null,
    currentUserId: currentUser?.id,
    messages,
    markChatAsRead,
    loadChatList,
    setMessages,
  });

  // Start a direct chat with a user
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

  // Recall a group of messages (works for both 1-1 grouped and group chat)
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

  // Recall a single message (works for both 1-1 and group)
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
          // reflect immediately in chat list preview if needed
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

  // Close preview on ESC
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

  if (!isOpen) return null;

  // Total unread across chats + groups + friend requests + group invites
  const bellTotal = (totalUnread || 0) + (totalGroupUnread || 0) + (friendRequests?.length || 0) + (pendingInvites?.length || 0);

  // handleBellItemClick provided by hook above

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

  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col z-50">
      {/* Header */}
      <ChatHeader
        totalUnread={bellTotal}
        ring={ring}
        ringSeq={ringSeq}
        notificationItems={notificationItems}
        searchTerm={searchTerm}
        activeTab={activeTab}
        onClose={onClose}
        onItemClick={handleBellItemClick}
        onClearAll={resetAll}
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
            onBack={closeSettings}
            onToggle={handleToggleE2EE}
            onChangePin={() => setShowSetPin(true)}
            onToggleReadStatus={handleToggleReadStatus}
            onToggleHidePhone={handleToggleHidePhone}
            onToggleHideBirthDate={handleToggleHideBirthDate}
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
                  onBack={() => { setSelectedChat(null); setActiveTab('chats'); }}
                  onMenuToggle={setMenuOpenKey}
                  onRecallMessage={recallMessage}
                  onRecallGroup={recallGroup}
                  onEditMessage={editMessage}
                  onDownloadAttachment={downloadAttachment}
                  onPreviewImage={setPreviewImage}
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
                  onBack={() => { setSelectedGroup(null); setActiveTab('groups'); }}
                  onMenuToggle={setMenuOpenKey}
                  onRecallMessage={recallMessage}
                  onRecallGroup={recallGroup}
                  onEditMessage={editMessage}
                  onDownloadAttachment={downloadAttachment}
                  onPreviewImage={setPreviewImage}
                  isGroup
                  groupOnline={isSelectedGroupOnline}
                  isGroupOwner={!!currentUser && currentUser.id === selectedGroup.ownerId}
                  onEditGroup={() => setShowGroupEditor(true)}
                  onRemoveMembers={() => setShowRemoveMembers(true)}
                  onLeaveGroup={async () => {
                    // Shown only for non-owners by ChatView
                    if (!selectedGroup) return;
                    if (!window.confirm(t('chat.groups.confirm.leave'))) return;
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
                    if (!window.confirm(t('chat.groups.confirm.delete'))) return;
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
                />
              </>
            ) : (
              <GroupsTab onSelectGroup={startGroupChat} />
            )}
          </div>
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