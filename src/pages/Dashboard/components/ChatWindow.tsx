import { useState, useEffect, useRef } from 'react';
import { chatService } from '../../../services/chatService';
import toast from 'react-hot-toast';
import { useChatSocket } from '../hooks/useChatSocket';
import { getSocket } from '../../../services/socket';
import { useMessageNotifications } from '../../../hooks/useMessageNotifications';
import { useTranslation } from 'react-i18next';

// Import types and utils
import type { User, Message, MessageGroup, ChatWindowProps } from './component-child/ChatWindow-child/types';
import { getCachedUser } from './component-child/ChatWindow-child/utils';
import type { GroupSummary } from '../../../services/groupService';
import { groupService } from '../../../services/groupService';

// Import child components
import { useChatData } from '../hooks/useChatData';
import { useMessageComposer } from '../hooks/useMessageComposer';
import { useAttachmentDownloader } from '../hooks/useAttachmentDownloader';
import { useGroupedMessages } from '../hooks/useGroupedMessages';
import { useFilteredUsers, useUnreadChats, useGroupOnline, useRemovableMembers, useNotificationItems } from '../hooks/useChatComputations';
import { useBellNavigation } from '../hooks/useBellNavigation';
import { usePreviewEscape } from '../hooks/usePreviewEscape';
import { useVisibilityRefresh } from '../hooks/useVisibilityRefresh';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useChatOpeners } from '../hooks/useChatOpeners';
import { settingsService } from '../../../services/settingsService';
import ChatHeader from './component-child/ChatWindow-child/ChatHeader';
import UsersList from './component-child/ChatWindow-child/UsersList';
import ChatList from './component-child/ChatWindow-child/ChatList';
import ChatView from './component-child/ChatWindow-child/ChatView';
import MessageInput from './component-child/ChatWindow-child/MessageInput';
import ImagePreview from './component-child/ChatWindow-child/ImagePreview';
import GroupsTab from './component-child/ChatWindow-child/GroupsTab.tsx';
import GroupEditorModal from './component-child/ChatWindow-child/GroupEditorModal';
import RemoveMembersModal from './component-child/ChatWindow-child/RemoveMembersModal';
import ChatSettings from './component-child/ChatWindow-child/ChatSettings';
import SetPinModal from './component-child/ChatWindow-child/SetPinModal';
import EnterPinModal from './component-child/ChatWindow-child/EnterPinModal';

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
  const [chatList, setChatList] = useState<Array<{ friend: User; lastMessage: Message | null; unreadCount?: number; friendshipId?: number }>>([]);
  // Group editor modal visibility
  const [showGroupEditor, setShowGroupEditor] = useState(false);
  const [showRemoveMembers, setShowRemoveMembers] = useState(false);
  // Pending group invites
  const [pendingInvites, setPendingInvites] = useState<Array<{ id: number; status: 'pending' | 'accepted' | 'declined'; group: any; inviter: any }>>([]);

  // Settings & E2EE state
  const [showSettings, setShowSettings] = useState(false);
  const [e2eeEnabled, setE2EEEnabled] = useState<boolean>(() => localStorage.getItem('e2ee_enabled') === '1');
  const [e2eePinHash, setE2EEPinHash] = useState<string | null>(null);
  const [e2eeUnlocked, setE2EEUnlocked] = useState<boolean>(() => sessionStorage.getItem('e2ee_unlocked') === '1');
  const [showSetPin, setShowSetPin] = useState(false);
  const [showEnterPin, setShowEnterPin] = useState(false);
  const [readStatusEnabled, setReadStatusEnabled] = useState<boolean>(true);

  // Notifications: unread per user + group + ring animation
  const { unreadMap, groupUnreadMap, totalUnread, totalGroupUnread, ring, ringSeq, markChatAsRead, markGroupAsRead, resetAll } = useMessageNotifications(
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

  // Update or insert a chatList entry with a new last message
  const upsertChatListWithMessage = (otherUserId: number, msg: Message) => {
    setChatList((prev) => {
      const friend = friends.find((f) => f.id === otherUserId) || users.find((u) => u.id === otherUserId);
      if (!friend) return prev;
      const rest = prev.filter((it) => it.friend.id !== otherUserId);
      const existing = prev.find((it) => it.friend.id === otherUserId);
      const next = [
        { friend: friend as User, lastMessage: msg, unreadCount: existing?.unreadCount, friendshipId: existing?.friendshipId },
        ...rest,
      ];
      next.sort((a, b) => {
        const at = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const bt = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return bt - at;
      });
      return next;
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
  useEffect(() => {
    if (!selectedChat || !currentUser) return;
    
    const socket = getSocket();
    if (!socket) return;

    // Send read receipt for all unread messages in this chat
    const unreadMessages = messages.filter(msg => 
      msg.senderId !== currentUser.id && 
      (!msg.status || msg.status !== 'read')
    );

    if (unreadMessages.length > 0) {
      // Update status immediately in UI
      setMessages((prev: any[]) => {
        return prev.map((m: any) => {
          if (unreadMessages.some(um => um.id === m.id)) {
            const readBy = m.readBy || [];
            const existingIndex = readBy.findIndex((rb: any) => rb.userId === currentUser.id);
            let updatedReadBy;
            
            if (existingIndex >= 0) {
              updatedReadBy = [...readBy];
              updatedReadBy[existingIndex] = {
                userId: currentUser.id,
                readAt: new Date().toISOString(),
                user: currentUser
              };
            } else {
              updatedReadBy = [...readBy, {
                userId: currentUser.id,
                readAt: new Date().toISOString(),
                user: currentUser
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

      // Then emit to backend
      unreadMessages.forEach(msg => {
        socket.emit('message_read', { 
          messageId: msg.id, 
          chatId: selectedChat.id,
          userId: currentUser.id,
          readAt: new Date().toISOString()
        });
      });
    }
  }, [selectedChat?.id, currentUser?.id, messages.length]);

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
    setChatList,
    setMenuOpenKey,
    setMessages,
    pendingImages,
    setPendingImages,
    pendingFiles,
    setPendingFiles,
    scrollToBottom,
  });

  // Settings handlers
  const openSettings = () => setShowSettings(true);
  const closeSettings = () => setShowSettings(false);
  const handleToggleE2EE = (next: boolean) => {
    setE2EEEnabled(next);
    localStorage.setItem('e2ee_enabled', next ? '1' : '0');
    if (!next) {
      setE2EEUnlocked(false);
      sessionStorage.removeItem('e2ee_unlocked');
    }
    // Persist to backend (optimistic)
    settingsService.setE2EE(next).catch(() => {
      // revert on failure
      const reverted = !next;
      setE2EEEnabled(reverted);
      localStorage.setItem('e2ee_enabled', reverted ? '1' : '0');
      toast.error('Failed to update encryption setting');
    });
  };

  const handleToggleReadStatus = async (enabled: boolean) => {
    try {
      setReadStatusEnabled(enabled);
      await settingsService.setReadStatus(enabled);
      toast.success(t('chat.success.settingsUpdated', 'Settings updated successfully'));
    } catch (error: any) {
      // Revert on failure
      setReadStatusEnabled(!enabled);
      toast.error(error.response?.data?.message || t('chat.errors.settingsUpdateFailed', 'Failed to update settings'));
    }
  };

  const handleSetPin = async (payload: { pinHash: string; oldPinHash?: string }) => {
    try {
      const res = await settingsService.setE2EEPin({ pinHash: payload.pinHash, oldPinHash: payload.oldPinHash });
      const saved = res.pinHash || null;
      setE2EEPinHash(saved);
      // Enable on first set
      if (saved && !e2eeEnabled) {
        setE2EEEnabled(true);
        localStorage.setItem('e2ee_enabled', '1');
        setE2EEUnlocked(false);
        sessionStorage.removeItem('e2ee_unlocked');
        sessionStorage.setItem('e2ee_lock_started_at', String(Date.now()));
        const socket = getSocket();
        if (socket) socket.emit('e2ee_status', { enabled: true });
        // Persist to backend
        settingsService.setE2EE(true).catch(() => {
          setE2EEEnabled(false);
          localStorage.setItem('e2ee_enabled', '0');
          toast.error('Failed to enable encryption');
        });
      }
      setShowSetPin(false);
      toast.success('PIN updated');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update PIN';
      toast.error(msg);
    }
  };

  const handleChangePin = () => setShowSetPin(true);

  // Cross-tab and socket realtime sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'e2ee_enabled' && e.newValue != null) {
        setE2EEEnabled(e.newValue === '1');
        setE2EEUnlocked(false);
        if (e.newValue === '1') {
          sessionStorage.setItem('e2ee_lock_started_at', String(Date.now()));
        } else {
          sessionStorage.removeItem('e2ee_lock_started_at');
        }
      }
    };
    window.addEventListener('storage', onStorage);
    const socket = getSocket();
    const onStatus = (payload: any) => {
      if (typeof payload?.enabled === 'boolean') {
        setE2EEEnabled(payload.enabled);
        setE2EEUnlocked(false);
        localStorage.setItem('e2ee_enabled', payload.enabled ? '1' : '0');
        if (payload.enabled) {
          sessionStorage.setItem('e2ee_lock_started_at', String(Date.now()));
        } else {
          sessionStorage.removeItem('e2ee_lock_started_at');
        }
      }
    };
    const onPinUpdated = ({ pinHash }: any) => {
      setE2EEPinHash(pinHash);
    };
    const onReadStatusUpdated = ({ enabled }: any) => {
      setReadStatusEnabled(enabled);
    };
    if (socket) socket.on('e2ee_status', onStatus);
    if (socket) socket.on('e2ee_pin_updated', onPinUpdated);
    if (socket) socket.on('read_status_updated', onReadStatusUpdated);
    return () => {
      window.removeEventListener('storage', onStorage);
      if (socket) {
        socket.off('e2ee_status', onStatus);
        socket.off('e2ee_pin_updated', onPinUpdated);
        socket.off('read_status_updated', onReadStatusUpdated);
      }
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      try {
        const [e2eeRes, pinRes, readStatusRes] = await Promise.all([
          settingsService.getE2EE(),
          settingsService.getE2EEPin(),
          settingsService.getReadStatus()
        ]);
        setE2EEEnabled(e2eeRes.enabled);
        localStorage.setItem('e2ee_enabled', e2eeRes.enabled ? '1' : '0');
        setE2EEPinHash(pinRes.pinHash);
        setReadStatusEnabled(readStatusRes.enabled);
      } catch (e) {
        console.warn('Failed to load settings:', e);
      }
    };
    load();
  }, [currentUser]);

  // Initial fetch from backend for E2EE state
  useEffect(() => {
    settingsService.getE2EE()
      .then(({ enabled }) => {
        setE2EEEnabled(enabled);
        localStorage.setItem('e2ee_enabled', enabled ? '1' : '0');
        if (enabled && !e2eeUnlocked) {
          if (!sessionStorage.getItem('e2ee_lock_started_at')) {
            sessionStorage.setItem('e2ee_lock_started_at', String(Date.now()));
          }
          const prompted = sessionStorage.getItem('e2ee_pin_prompt_shown') === '1';
          if (!prompted) {
            setShowEnterPin(true);
            sessionStorage.setItem('e2ee_pin_prompt_shown', '1');
          }
        }
      })
      .catch(() => {
        // ignore if backend not reachable; fall back to local state
      });
  }, []);

  // Initial fetch PIN hash from backend
  useEffect(() => {
    settingsService.getE2EEPin()
      .then(({ pinHash }) => {
        setE2EEPinHash(pinHash || null);
      })
      .catch(() => {
        // ignore if backend not reachable
      });
  }, []);

  // Removed auto-prompt when switching to All (chats) tab to avoid forcing unlock on tab click

  // Handle bell item clicks: special negative IDs for sections
  const { handleBellItemClick } = useBellNavigation({
    friends,
    users,
    myGroups,
    startChat,
    startGroupChat,
    setActiveTab,
  });

  // Recall a group of messages
  const recallGroup = async (group: MessageGroup, scope: 'self' | 'all') => {
    if (!selectedChat) return;
    const ids = group.items.map((i) => i.id);
    try {
      const resp = await chatService.recallMessages(ids, scope);
      if (resp.success) {
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

  // Recall a single message (used for text-only groups to recall individually)
  const recallMessage = async (msg: Message, scope: 'self' | 'all') => {
    if (!selectedChat) return;
    try {
      const resp = await chatService.recallMessages([msg.id], scope);
      if (resp.success) {
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

  // Reset typing indicator when switching chats
  useEffect(() => {
    setIsPartnerTyping(false);
  }, [selectedChat?.id]);

  // Reset group typing users when switching groups
  useEffect(() => {
    setGroupTypingUsers([]);
  }, [selectedGroup?.id]);

  // Keep sender avatars fresh in group chat when friends/users update
  useEffect(() => {
    if (!selectedGroup) return;
    if ((!friends || friends.length === 0) && (!users || users.length === 0)) return;
    setMessages((prev: any[]) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev;
      const byId = new Map<number, any>();
      friends.forEach((u) => byId.set(u.id, u));
      users.forEach((u) => byId.set(u.id, u));
      return prev.map((m: any) => {
        if (!m || typeof m !== 'object' || !('senderId' in m)) return m;
        const u = byId.get(m.senderId);
        if (!u) return m;
        const sender = m.sender || {};
        if (sender.avatar !== u.avatar || sender.name !== u.name) {
          return { ...m, sender: { id: u.id, name: u.name, avatar: u.avatar } };
        }
        return m;
      });
    });
  }, [selectedGroup?.id, friends, users]);

  // Send friend request
  const sendFriendRequest = async (userId: number) => {
    try {
      const response = await chatService.sendFriendRequest(userId);
      if (response.success) {
        toast.success(t('chat.success.sentFriendRequest'));
        setUsers(prev => prev.filter(u => u.id !== userId));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.generic'));
    }
  };

  const acceptFriendRequest = async (userId: number) => {
    try {
      // Find the friendship record
      const friendRequestsResponse = await chatService.getFriendRequests();
      const friendship = friendRequestsResponse.data.find((req: any) => req.requester.id === userId);
      
      if (friendship) {
        const response = await chatService.acceptFriendRequest(friendship.id);
        if (response.success) {
          toast.success(t('chat.success.acceptedFriendRequest'));
          loadFriends();
          loadFriendRequests();
          loadUsers(searchTerm);
          // Ensure All (chats) tab reflects the new friend immediately
          loadChatList();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.generic'));
    }
  };

  const rejectFriendRequest = async (userId: number) => {
    try {
      // Find the friendship record
      const friendRequestsResponse = await chatService.getFriendRequests();
      const friendship = friendRequestsResponse.data.find((req: any) => req.requester.id === userId);
      
      if (friendship) {
        const response = await chatService.rejectFriendRequest(friendship.id);
        if (response.success) {
          toast.success(t('chat.success.rejectedFriendRequest'));
          loadFriendRequests();
          loadUsers(searchTerm);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.generic'));
    }
  };

  if (!isOpen) return null;

  // Total unread across chats + groups + friend requests + group invites
  const bellTotal = (totalUnread || 0) + (totalGroupUnread || 0) + (friendRequests?.length || 0) + (pendingInvites?.length || 0);

  // handleBellItemClick provided by hook above

  // Remove friend function
  const handleRemoveFriend = async (friendshipId: number, friendName: string) => {
    try {
      const response = await chatService.removeFriend(friendshipId);
      if (response.success) {
        toast.success(t('chat.success.friendRemoved', `Removed ${friendName} as friend`));
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
        toast.success(t('chat.success.messagesDeletedForMe', `Deleted all messages with ${friendName} for you`));
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
            onBack={closeSettings}
            onToggle={handleToggleE2EE}
            onChangePin={handleChangePin}
            onToggleReadStatus={handleToggleReadStatus}
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
                  onDownloadAttachment={downloadAttachment}
                  onPreviewImage={setPreviewImage}
                  maskMessages={e2eeEnabled && !e2eeUnlocked}
                  lockedNotice={t('chat.encryption.chatLocked')}
                  onUnlock={() => setShowEnterPin(true)}
                />
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
                    if (!window.confirm('Leave group?')) return;
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
                    if (!window.confirm('Delete group?')) return;
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
                  onConfirm={async (memberIds) => {
                    if (!selectedGroup) return;
                    try {
                      const res = await groupService.removeMembers(selectedGroup.id, memberIds);
                      if (res.success) {
                        toast.success(t('chat.groups.success.removed', 'Removed member(s)'));
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
