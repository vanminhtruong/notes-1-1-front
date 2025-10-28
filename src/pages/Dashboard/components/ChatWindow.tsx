import { useMemo, useCallback, memo } from 'react';
import { type ChatWindowProps, toast, useTranslation, useMessageNotifications, useChatSocket, useChatData, useMessageComposer, useAttachmentDownloader, useGroupedMessages, useFilteredUsers, useUnreadChats, useGroupOnline, useRemovableMembers, useBellNavigation, usePreviewEscape, useVisibilityRefresh, useAutoScroll, useChatOpeners, useChatSettingsStateOnly, useChatSettingsHandler, useChatSettingsEffects, useChatBackgroundState, useChatBackgroundHandler, useChatBackgroundEffects, useReadReceipts, useFriendRequestActions, useTypingAndGroupSync, ChatHeader, UsersList, ChatList, ChatView, MessageInput, ImagePreview, GroupsTab, GroupEditorModal, RemoveMembersModal, ChatSettings, SetPinModal, EnterPinModal, SharedNotesTab, getCachedUser } from './interface/chatWindowImports';
import * as DashboardHooks from '../hooks';

const ChatWindow = memo(({ isOpen, onClose }: ChatWindowProps) => {
  const { t } = useTranslation('dashboard');
  const currentUser = getCachedUser();
  
  // State hooks
  const chatWindowState = DashboardHooks.useChatWindowState();
  const messageInputState = DashboardHooks.useMessageInputState();
  const attachmentState = DashboardHooks.useAttachmentState();
  const groupModalsState = DashboardHooks.useGroupModalsState();
  const blockStatusState = DashboardHooks.useBlockStatusState();
  const bellNotificationState = DashboardHooks.useBellNotificationState();
  
  // Chat settings - split into 3 hooks
  const chatSettingsState = useChatSettingsStateOnly();

  // Notifications handler - unread per user + group + ring animation
  const { unreadMap, ring, ringSeq, totalUnread, totalGroupUnread, markChatAsRead, markGroupAsRead, markAllRead, hydrateFromChatList } = DashboardHooks.useMessageNotificationsHandler({
    currentUserId: currentUser?.id,
    selectedChatId: chatWindowState.selectedChat?.id ?? null,
    selectedGroupId: chatWindowState.selectedGroup?.id ?? null,
  });

  // Bell notification handler
  const bellNotificationHandler = DashboardHooks.useBellNotificationHandler({
    setBellFeedItems: bellNotificationState.setBellFeedItems,
    setBellPagination: bellNotificationState.setBellPagination,
    setBellBadgeTotal: bellNotificationState.setBellBadgeTotal,
    setBellLoading: bellNotificationState.setBellLoading,
  });

  const handleLoadMoreNotifications = useCallback(() => {
    if (bellNotificationState.bellPagination?.hasNextPage) {
      bellNotificationHandler.loadBellFeed(bellNotificationState.bellPagination.currentPage + 1);
    }
  }, [bellNotificationState.bellPagination, bellNotificationHandler]);

  const bellNotificationItems = useMemo(() => {
    return (bellNotificationState.bellFeedItems || []).map((it) => ({
      id: it.id,
      name: it.name,
      avatar: (it.avatar || undefined) as string | undefined,
      count: Number(it.count || 0),
      time: it.time,
    }));
  }, [bellNotificationState.bellFeedItems]);

  const unreadChats = useUnreadChats(chatWindowState.chatList, unreadMap);
  const filteredUsers = useFilteredUsers(chatWindowState.users, chatWindowState.friends, chatWindowState.friendRequests, chatWindowState.searchTerm, currentUser?.id, chatSettingsState.blockedUsers);
  const groupedMessages = useGroupedMessages(chatWindowState.messages);
  const isSelectedGroupOnline = useGroupOnline(chatWindowState.selectedGroup, chatWindowState.onlineIds, currentUser?.id);
  const removableMembers = useRemovableMembers(chatWindowState.selectedGroup, chatWindowState.friends, chatWindowState.users, currentUser, t);
  const scrollToBottom = () => {};

  // Load per-chat background (1-1 only)
  const chatBackgroundState = useChatBackgroundState();
  const chatBackgroundHandler = useChatBackgroundHandler({
    setChatBackgroundUrl: chatBackgroundState.setChatBackgroundUrl,
    t,
  });
  useChatBackgroundEffects({
    selectedChatId: chatWindowState.selectedChat?.id ?? null,
    setChatBackgroundUrl: chatBackgroundState.setChatBackgroundUrl,
  });

  const tt = t;

  const confirmWithToast = useCallback((message: string) => new Promise<boolean>((resolve) => {
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
  }), [tt]);

  // Load data functions - must be declared before being used
  const { loadUsers, loadFriends, loadChatList, loadFriendRequests, loadPendingInvites, loadNotifications } = useChatData({
    setUsers: chatWindowState.setUsers,
    setFriends: chatWindowState.setFriends,
    setOnlineIds: chatWindowState.setOnlineIds,
    setChatList: chatWindowState.setChatList,
    setFriendRequests: chatWindowState.setFriendRequests,
    setFriendRequestsMeta: chatWindowState.setFriendRequestsMeta,
    setPersistedFriendRequests: chatWindowState.setPersistedFriendRequests,
    setPersistedFriendRequestsMeta: chatWindowState.setPersistedFriendRequestsMeta,
    setPendingInvites: chatWindowState.setPendingInvites,
    setMyGroups: chatWindowState.setMyGroups,
  });

  // Message actions handler
  const messageActionsHandler = DashboardHooks.useMessageActionsHandler({
    selectedChat: chatWindowState.selectedChat,
    selectedGroup: chatWindowState.selectedGroup,
    setMessages: chatWindowState.setMessages,
    setChatList: chatWindowState.setChatList,
    setMenuOpenKey: attachmentState.setMenuOpenKey,
    t,
  });

  // Chat list handler
  const chatListHandler = DashboardHooks.useChatListHandler({
    friends: chatWindowState.friends,
    users: chatWindowState.users,
    selectedChat: chatWindowState.selectedChat,
    setChatList: chatWindowState.setChatList,
    setMessages: chatWindowState.setMessages,
    loadFriends,
    loadChatList,
    t,
  });

  // Initialize chatSettingsHandler after loadUsers and loadFriends are available
  const chatSettingsHandler = useChatSettingsHandler({
    setShowSettings: chatSettingsState.setShowSettings,
    setE2EEEnabled: chatSettingsState.setE2EEEnabled,
    setE2EEPinHash: chatSettingsState.setE2EEPinHash,
    setE2EEUnlocked: chatSettingsState.setE2EEUnlocked,
    setShowSetPin: chatSettingsState.setShowSetPin,
    setReadStatusEnabled: chatSettingsState.setReadStatusEnabled,
    setHidePhone: chatSettingsState.setHidePhone,
    setHideBirthDate: chatSettingsState.setHideBirthDate,
    setAllowMessagesFromNonFriends: chatSettingsState.setAllowMessagesFromNonFriends,
    setBlockedUsers: chatSettingsState.setBlockedUsers,
    e2eeEnabled: chatSettingsState.e2eeEnabled,
    t,
    onRefreshFriends: loadFriends,
    onRefreshUsers: loadUsers,
  });

  useChatSettingsEffects({
    e2eeEnabled: chatSettingsState.e2eeEnabled,
    e2eeUnlocked: chatSettingsState.e2eeUnlocked,
    readStatusEnabled: chatSettingsState.readStatusEnabled,
    allowMessagesFromNonFriends: chatSettingsState.allowMessagesFromNonFriends,
    hidePhone: chatSettingsState.hidePhone,
    hideBirthDate: chatSettingsState.hideBirthDate,
    setE2EEEnabled: chatSettingsState.setE2EEEnabled,
    setE2EEPinHash: chatSettingsState.setE2EEPinHash,
    setE2EEUnlocked: chatSettingsState.setE2EEUnlocked,
    setShowEnterPin: chatSettingsState.setShowEnterPin,
    setReadStatusEnabled: chatSettingsState.setReadStatusEnabled,
    setHidePhone: chatSettingsState.setHidePhone,
    setHideBirthDate: chatSettingsState.setHideBirthDate,
    setAllowMessagesFromNonFriends: chatSettingsState.setAllowMessagesFromNonFriends,
    refreshBlockedUsers: chatSettingsHandler.refreshBlockedUsers,
  });

  // Initialize effects
  DashboardHooks.useChatWindowInitEffects({
    loadNotifications,
    loadBellFeed: bellNotificationHandler.loadBellFeed,
  });

  DashboardHooks.useSearchTermEffects({
    isOpen,
    showEnterPin: chatSettingsState.showEnterPin,
    currentUserId: currentUser?.id,
    setSearchTerm: chatWindowState.setSearchTerm,
  });

  DashboardHooks.useChatListHydrateEffect({
    chatList: chatWindowState.chatList,
    hydrateFromChatList,
  });

  // Use editMessage from messageActionsHandler
  const editMessage = messageActionsHandler.editMessage;

  const { downloadAttachment } = useAttachmentDownloader(t);

  const { handleFileChange, sendMessage, sendGroupMessage, handleTyping, handleGroupTyping } = useMessageComposer({
    selectedChat: chatWindowState.selectedChat,
    selectedGroup: chatWindowState.selectedGroup,
    newMessage: messageInputState.newMessage,
    setNewMessage: messageInputState.setNewMessage,
    setMessages: chatWindowState.setMessages,
    pendingImages: attachmentState.pendingImages,
    setPendingImages: attachmentState.setPendingImages,
    pendingFiles: attachmentState.pendingFiles,
    setPendingFiles: attachmentState.setPendingFiles,
    scrollToBottom,
    typingTimeoutRef: messageInputState.typingTimeoutRef,
    typingSentRef: messageInputState.typingSentRef,
    upsertChatListWithMessage: chatListHandler.upsertChatListWithMessage,
    t,
    replyingToMessage: messageInputState.replyingToMessage,
    clearReply: () => messageInputState.setReplyingToMessage(null),
  });

  useChatSocket({
    currentUser,
    selectedChat: chatWindowState.selectedChat,
    selectedGroup: chatWindowState.selectedGroup,
    friends: chatWindowState.friends,
    users: chatWindowState.users,
    searchTerm: chatWindowState.searchTerm,
    onlineIds: chatWindowState.onlineIds,
    readStatusEnabled: chatSettingsState.readStatusEnabled,
    setFriends: chatWindowState.setFriends,
    setUsers: chatWindowState.setUsers,
    setSelectedChat: chatWindowState.setSelectedChat,
    setSelectedGroup: chatWindowState.setSelectedGroup,
    setMessages: chatWindowState.setMessages,
    setOnlineIds: chatWindowState.setOnlineIds,
    setGroupTypingUsers: messageInputState.setGroupTypingUsers,
    setChatList: chatWindowState.setChatList,
    setIsPartnerTyping: messageInputState.setIsPartnerTyping,
    loadFriendRequests,
    loadFriends,
    loadUsers,
    loadChatList,
    loadPendingInvites,
    loadNotifications,
    upsertChatListWithMessage: chatListHandler.upsertChatListWithMessage,
    scrollToBottom,
    reloadBellFeed: bellNotificationHandler.reloadBellFeed,
    t,
  });

  useReadReceipts({
    selectedChatId: chatWindowState.selectedChat?.id ?? null,
    currentUserId: currentUser?.id,
    messages: chatWindowState.messages,
    markChatAsRead,
    loadChatList,
    setMessages: chatWindowState.setMessages,
  });

  const { startChat, startGroupChat } = useChatOpeners({
    currentUser,
    friends: chatWindowState.friends,
    users: chatWindowState.users,
    setSelectedChat: chatWindowState.setSelectedChat,
    setSelectedGroup: chatWindowState.setSelectedGroup,
    setActiveTab: chatWindowState.setActiveTab,
    markChatAsRead,
    markGroupAsRead,
    refreshChatList: loadChatList,
    setChatList: chatWindowState.setChatList,
    setMenuOpenKey: attachmentState.setMenuOpenKey,
    setMessages: chatWindowState.setMessages,
    setHistoryLoading: chatWindowState.setHistoryLoading,
    pendingImages: attachmentState.pendingImages,
    setPendingImages: attachmentState.setPendingImages,
    pendingFiles: attachmentState.pendingFiles,
    setPendingFiles: attachmentState.setPendingFiles,
    scrollToBottom,
  });

  const { handleBellItemClick } = useBellNavigation({
    friends: chatWindowState.friends,
    users: chatWindowState.users,
    myGroups: chatWindowState.myGroups,
    startChat,
    startGroupChat,
    setActiveTab: chatWindowState.setActiveTab,
  });

  // Use recallGroup and recallMessage from messageActionsHandler
  const recallGroup = messageActionsHandler.recallGroup;
  const recallMessage = messageActionsHandler.recallMessage;

  useAutoScroll(chatWindowState.messages, messageInputState.isPartnerTyping, scrollToBottom, chatWindowState.selectedChat?.id, chatWindowState.selectedGroup?.id);

  usePreviewEscape(attachmentState.previewImage, attachmentState.setPreviewImage);

  // Fallback: when window/tab regains focus, refresh Users + FriendRequests if Users tab is active
  useVisibilityRefresh(chatWindowState.activeTab, chatWindowState.searchTerm, loadUsers, loadFriendRequests);

  // Typing indicators and group sync extracted
  useTypingAndGroupSync({
    selectedChatId: chatWindowState.selectedChat?.id ?? null,
    selectedGroup: chatWindowState.selectedGroup,
    friends: chatWindowState.friends,
    users: chatWindowState.users,
    setIsPartnerTyping: messageInputState.setIsPartnerTyping,
    setGroupTypingUsers: messageInputState.setGroupTypingUsers,
    setMessages: chatWindowState.setMessages,
  });

  // Fetch and keep block status in sync for the selected 1-1 chat
  DashboardHooks.useBlockStatusEffect({
    selectedChat: chatWindowState.selectedChat,
    currentUserId: currentUser?.id,
    setBlockStatus: blockStatusState.setBlockStatus,
  });

  // Listen for user status changes (banned/unbanned)
  DashboardHooks.useUserStatusUpdateEffect({
    selectedChat: chatWindowState.selectedChat,
    setSelectedChat: chatWindowState.setSelectedChat,
    setUsers: chatWindowState.setUsers,
    setFriends: chatWindowState.setFriends,
    setChatList: chatWindowState.setChatList,
  });

  // Friend request actions extracted
  const { sendFriendRequest, acceptFriendRequest, rejectFriendRequest } = useFriendRequestActions({
    setUsers: chatWindowState.setUsers,
    loadFriends,
    loadFriendRequests,
    loadUsers,
    searchTerm: chatWindowState.searchTerm,
    loadChatList,
    t,
  });

  // Use handleDeleteMessages from chatListHandler
  const handleDeleteMessages = chatListHandler.handleDeleteMessages;

  // Block user handler
  const blockUserHandler = DashboardHooks.useBlockUserHandler({
    setUsers: chatWindowState.setUsers,
    searchTerm: chatWindowState.searchTerm,
    loadUsers,
    refreshBlockedUsers: chatSettingsHandler.refreshBlockedUsers,
    confirmWithToast,
    t,
  });
  const handleBlockUser = blockUserHandler.handleBlockUser;

  if (!isOpen) return null;

  // Tổng badge: ưu tiên số liệu backend (DM + Group + FR + Invite).
  // Fallback/phản hồi tức thời: nếu backend chưa kịp trả, dùng tổng local (DM + Group + Friend Requests)
  const frCountLocal = Array.isArray(chatWindowState.friendRequests) ? chatWindowState.friendRequests.length : 0;
  const bellTotal = Math.max(
    Number(bellNotificationState.bellBadgeTotal || 0),
    Number((totalUnread || 0) + (totalGroupUnread || 0) + (frCountLocal || 0))
  );

  // Use handleRemoveFriend from chatListHandler
  const handleRemoveFriend = chatListHandler.handleRemoveFriend;

  // Search and notification handler
  const searchAndNotificationHandler = DashboardHooks.useSearchAndNotificationHandler({
    setSearchTerm: chatWindowState.setSearchTerm,
    loadUsers,
    markAllRead,
    loadNotifications,
    loadPendingInvites,
    loadBellFeed: bellNotificationHandler.loadBellFeed,
  });
  const handleSearchChange = searchAndNotificationHandler.handleSearchChange;
  const handleClearAll = searchAndNotificationHandler.handleClearAll;

  // Chat window callbacks handler
  const chatWindowCallbacksHandler = DashboardHooks.useChatWindowCallbacksHandler({
    selectedChat: chatWindowState.selectedChat,
    selectedGroup: chatWindowState.selectedGroup,
    setSelectedChat: chatWindowState.setSelectedChat,
    setSelectedGroup: chatWindowState.setSelectedGroup,
    setActiveTab: chatWindowState.setActiveTab,
    setReplyingToMessage: messageInputState.setReplyingToMessage,
    setShowGroupEditor: groupModalsState.setShowGroupEditor,
    setShowRemoveMembers: groupModalsState.setShowRemoveMembers,
    setPreviewImage: attachmentState.setPreviewImage,
    setPendingImages: attachmentState.setPendingImages,
    setPendingFiles: attachmentState.setPendingFiles,
    typingSentRef: messageInputState.typingSentRef,
    chatSettingsState,
    chatBackgroundHandler,
  });

  // Group actions handler
  const groupActionsHandler = DashboardHooks.useGroupActionsHandler({
    selectedGroup: chatWindowState.selectedGroup,
    setSelectedGroup: chatWindowState.setSelectedGroup,
    setMessages: chatWindowState.setMessages,
    setShowRemoveMembers: groupModalsState.setShowRemoveMembers,
    confirmWithToast,
    t,
  });


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
        notificationPagination={bellNotificationState.bellPagination}
        notificationLoading={bellNotificationState.bellLoading}
        searchTerm={chatWindowState.searchTerm}
        activeTab={chatWindowState.activeTab}
        onClose={onClose}
        onItemClick={handleBellItemClick}
        onItemDismissed={(id) => bellNotificationHandler.handleBellItemDismiss(id, bellNotificationHandler.loadBellFeed)}
        onLoadMoreNotifications={handleLoadMoreNotifications}
        onClearAll={handleClearAll}
        onSearchChange={handleSearchChange}
        onTabChange={chatWindowState.setActiveTab}
        onOpenSettings={chatSettingsHandler.openSettings}
        showSettings={chatSettingsState.showSettings}
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {chatSettingsState.showSettings ? (
          <ChatSettings
            enabled={chatSettingsState.e2eeEnabled}
            hasPin={!!chatSettingsState.e2eePinHash}
            readStatusEnabled={chatSettingsState.readStatusEnabled}
            hidePhone={chatSettingsState.hidePhone}
            hideBirthDate={chatSettingsState.hideBirthDate}
            allowMessagesFromNonFriends={chatSettingsState.allowMessagesFromNonFriends}
            blockedUsers={chatSettingsState.blockedUsers as any}
            onBack={chatSettingsHandler.closeSettings}
            onToggle={chatSettingsHandler.handleToggleE2EE}
            onChangePin={() => chatSettingsState.setShowSetPin(true)}
            onToggleReadStatus={chatSettingsHandler.handleToggleReadStatus}
            onToggleHidePhone={chatSettingsHandler.handleToggleHidePhone}
            onToggleHideBirthDate={chatSettingsHandler.handleToggleHideBirthDate}
            onToggleAllowMessagesFromNonFriends={chatSettingsHandler.handleToggleAllowMessagesFromNonFriends}
            onUnblockUser={chatSettingsHandler.handleUnblockUser}
          />
        ) : (
          <>
        {chatWindowState.activeTab === 'users' && (
          <UsersList
            friendRequests={chatWindowState.friendRequests}
            filteredUsers={filteredUsers}
            onAcceptFriendRequest={acceptFriendRequest}
            onRejectFriendRequest={rejectFriendRequest}
            onSendFriendRequest={sendFriendRequest}
            onStartChat={startChat}
            onBlockUser={handleBlockUser}
          />
        )}

        {chatWindowState.activeTab === 'chats' && (
          <div className="h-full flex flex-col">
            {chatWindowState.selectedChat ? (
              <>
                <ChatView
                  selectedChat={chatWindowState.selectedChat}
                  messages={chatWindowState.messages}
                  groupedMessages={groupedMessages}
                  isPartnerTyping={messageInputState.isPartnerTyping}
                  menuOpenKey={attachmentState.menuOpenKey}
                  currentUserId={currentUser?.id}
                  initialAlias={(chatWindowState.chatList.find((c) => c.friend.id === chatWindowState.selectedChat!.id) as any)?.nickname ?? null}
                  onBack={chatWindowCallbacksHandler.handleBackToChats}
                  onMenuToggle={attachmentState.setMenuOpenKey}
                  onRecallMessage={recallMessage}
                  onRecallGroup={recallGroup}
                  onEditMessage={editMessage}
                  onDownloadAttachment={downloadAttachment}
                  onPreviewImage={chatWindowCallbacksHandler.handlePreviewImage}
                  initialLoading={chatWindowState.historyLoading}
                  onPrependMessages={messageActionsHandler.handlePrependMessages}
                  onRemoveMessages={messageActionsHandler.handleRemoveMessages}
                  maskMessages={chatSettingsState.e2eeEnabled && !chatSettingsState.e2eeUnlocked}
                  lockedNotice={t('chat.encryption.chatLocked')}
                  onUnlock={chatWindowCallbacksHandler.handleUnlock}
                  backgroundUrl={chatBackgroundState.chatBackgroundUrl}
                  onChangeBackground={chatWindowCallbacksHandler.handleChangeBackground}
                  onChangeBackgroundForBoth={chatWindowCallbacksHandler.handleChangeBackgroundForBoth}
                  onResetBackground={chatWindowCallbacksHandler.handleResetBackground}
                  blocked={blockStatusState.blockStatus ? !!blockStatusState.blockStatus.isEitherBlocked : true}
                  onReplyRequested={chatWindowCallbacksHandler.handleSetReplyingToMessage}
                  onUpdateRecipientStatus={chatWindowCallbacksHandler.handleUpdateRecipientStatus}
                />
                {!(blockStatusState.blockStatus?.isEitherBlocked) ? (
                  <MessageInput
                    newMessage={messageInputState.newMessage}
                    pendingImages={attachmentState.pendingImages}
                    pendingFiles={attachmentState.pendingFiles}
                    onMessageChange={messageInputState.setNewMessage}
                    onSendMessage={sendMessage}
                    onFileChange={handleFileChange}
                    onRemoveImage={chatWindowCallbacksHandler.handleRemoveImage}
                    onRemoveFile={chatWindowCallbacksHandler.handleRemoveFile}
                    onTyping={handleTyping}
                    onTypingStop={chatWindowCallbacksHandler.handleTypingStop}
                    replyingToMessage={messageInputState.replyingToMessage as any}
                    onClearReply={chatWindowCallbacksHandler.handleClearReply}
                    recipientIsActive={chatWindowState.selectedChat?.isActive !== false}
                  />
                ) : (
                  <div className="p-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    {t('chat.blocked.inputHidden', 'You cannot send messages or upload files in this conversation because one of you has blocked the other.')}
                  </div>
                )}
              </>
            ) : (
              <ChatList
                chatList={chatWindowState.chatList}
                friends={chatWindowState.friends}
                unreadMap={unreadMap}
                currentUserId={currentUser?.id}
                onStartChat={startChat}
                onRemoveFriend={handleRemoveFriend}
                onDeleteMessages={handleDeleteMessages}
                onRefreshChatList={loadChatList}
                onRefreshBlockedUsers={chatSettingsHandler.refreshBlockedUsers}
                e2eeEnabled={chatSettingsState.e2eeEnabled}
                e2eeUnlocked={chatSettingsState.e2eeUnlocked}
                lockedPlaceholder={t('chat.encryption.previewLocked')}
              />
            )}
          </div>
        )}

        {chatWindowState.activeTab === 'unread' && (
          <div className="h-full flex flex-col">
            <ChatList
              chatList={unreadChats}
              friends={chatWindowState.friends}
              unreadMap={unreadMap}
              currentUserId={currentUser?.id}
              onStartChat={startChat}
              onRemoveFriend={handleRemoveFriend}
              onDeleteMessages={handleDeleteMessages}
              onRefreshChatList={loadChatList}
              onRefreshBlockedUsers={chatSettingsHandler.refreshBlockedUsers}
              e2eeEnabled={chatSettingsState.e2eeEnabled}
              e2eeUnlocked={chatSettingsState.e2eeUnlocked}
              lockedPlaceholder="🔒 Encrypted — unlock to preview"
            />
          </div>
        )}

        {chatWindowState.activeTab === 'groups' && (
          <div className="h-full flex flex-col">
            {chatWindowState.selectedGroup ? (
              <>
                <ChatView
                  selectedChat={chatWindowState.selectedGroup as any}
                  messages={chatWindowState.messages}
                  groupedMessages={groupedMessages}
                  isPartnerTyping={false}
                  typingUsers={messageInputState.groupTypingUsers}
                  menuOpenKey={attachmentState.menuOpenKey}
                  currentUserId={currentUser?.id}
                  onBack={chatWindowCallbacksHandler.handleBackToGroups}
                  onMenuToggle={attachmentState.setMenuOpenKey}
                  onRecallMessage={recallMessage}
                  onRecallGroup={recallGroup}
                  onEditMessage={editMessage}
                  onDownloadAttachment={downloadAttachment}
                  onPreviewImage={chatWindowCallbacksHandler.handlePreviewImage}
                  initialLoading={chatWindowState.historyLoading}
                  onPrependMessages={messageActionsHandler.handlePrependMessages}
                  onRemoveMessages={messageActionsHandler.handleRemoveMessages}
                  isGroup
                  groupOnline={isSelectedGroupOnline}
                  isGroupOwner={!!currentUser && currentUser.id === chatWindowState.selectedGroup.ownerId}
                  onEditGroup={chatWindowCallbacksHandler.handleEditGroup}
                  onRemoveMembers={chatWindowCallbacksHandler.handleRemoveMembersOpen}
                  onLeaveGroup={groupActionsHandler.handleLeaveGroup}
                  onDeleteGroup={groupActionsHandler.handleDeleteGroup}
                  maskMessages={chatSettingsState.e2eeEnabled && !chatSettingsState.e2eeUnlocked}
                  lockedNotice={t('chat.encryption.groupLocked')}
                  onUnlock={chatWindowCallbacksHandler.handleUnlock}
                  onReplyRequested={chatWindowCallbacksHandler.handleSetReplyingToMessage}
                />
                <RemoveMembersModal
                  isOpen={groupModalsState.showRemoveMembers}
                  onClose={chatWindowCallbacksHandler.handleCloseRemoveMembers}
                  members={removableMembers}
                  onConfirm={groupActionsHandler.handleRemoveMembersConfirm}
                />
                {(() => {
                  const isOwner = !!currentUser && chatWindowState.selectedGroup!.ownerId === currentUser.id;
                  const myRole = (chatWindowState.selectedGroup as any)?.myRole as ('member'|'admin'|'owner'|undefined);
                  const isAdmin = myRole === 'admin' || myRole === 'owner' || isOwner;
                  const adminsOnly = !!(chatWindowState.selectedGroup as any)?.adminsOnly;
                  const canSendGroup = !adminsOnly || isAdmin;
                  if (canSendGroup) {
                    return (
                      <MessageInput
                        newMessage={messageInputState.newMessage}
                        pendingImages={attachmentState.pendingImages}
                        pendingFiles={attachmentState.pendingFiles}
                        onMessageChange={messageInputState.setNewMessage}
                        onSendMessage={sendGroupMessage}
                        onFileChange={handleFileChange}
                        onRemoveImage={chatWindowCallbacksHandler.handleRemoveImage}
                        onRemoveFile={chatWindowCallbacksHandler.handleRemoveFile}
                        onTyping={handleGroupTyping}
                        onTypingStop={chatWindowCallbacksHandler.handleGroupTypingStop}
                        replyingToMessage={messageInputState.replyingToMessage as any}
                        onClearReply={chatWindowCallbacksHandler.handleClearReply}
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

        {chatWindowState.activeTab === 'sharedNotes' && (
          <SharedNotesTab 
            searchTerm={chatWindowState.searchTerm}
            currentUserId={currentUser?.id}
          />
        )}
          </>
        )}
      </div>

      {/* Group Editor Modal */}
      <GroupEditorModal
        isOpen={groupModalsState.showGroupEditor}
        mode="edit"
        initial={chatWindowState.selectedGroup || undefined}
        onClose={chatWindowCallbacksHandler.handleCloseGroupEditor}
        onSuccess={groupActionsHandler.handleGroupEditorSuccess}
      />

      <ImagePreview
        previewImage={attachmentState.previewImage}
        onClose={chatWindowCallbacksHandler.handleClosePreview}
      />

      {/* E2EE PIN modals */}
      <SetPinModal
        isOpen={chatSettingsState.showSetPin}
        onClose={chatWindowCallbacksHandler.handleSetPinClose}
        hasExisting={!!chatSettingsState.e2eePinHash}
        onSet={chatSettingsHandler.handleSetPin}
      />
      <EnterPinModal
        isOpen={chatSettingsState.showEnterPin}
        onClose={chatWindowCallbacksHandler.handleEnterPinClose}
        onUnlock={chatWindowCallbacksHandler.handleEnterPinUnlock}
        expectedHash={chatSettingsState.e2eePinHash}
      />
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;
