import { useRef, useEffect, useState } from 'react';
import { MoreVertical, ChevronDown, Pencil, Users } from 'lucide-react';
import MessageBubble from './MessageBubble';
import NicknameModal from './NicknameModal';
import { useTranslation } from 'react-i18next';
import { formatDateMDYY, formatDateTimeMDYY_HHmm } from '../../../../../utils/utils';
import { blockService } from '@/services/blockService';
import { pinService } from '@/services/pinService';
import { chatService } from '@/services/chatService';
import { groupService } from '@/services/groupService';
import GroupMembersPanel from './GroupMembersPanel';
import CommonGroupsModal from './CommonGroupsModal';
import { getSocket } from '@/services/socket';
import { toast } from 'react-hot-toast';
import type { ChatViewProps } from '../../interface/ChatView.interface';
const ChatView = ({
  selectedChat,
  messages,
  groupedMessages,
  isPartnerTyping,
  typingUsers,
  menuOpenKey,
  currentUserId,
  initialAlias,
  onBack,
  onMenuToggle,
  onRecallMessage,
  onRecallGroup,
  onEditMessage,
  onDownloadAttachment,
  onPreviewImage,
  isGroup,
  groupOnline,
  onLeaveGroup,
  isGroupOwner,
  onEditGroup,
  onDeleteGroup,
  onRemoveMembers,
  maskMessages,
  lockedNotice,
  onUnlock,
  backgroundUrl,
  onChangeBackground,
  onChangeBackgroundForBoth,
  onResetBackground,
  blocked,
}: ChatViewProps) => {
  const { t, i18n } = useTranslation('dashboard');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [dmMenuOpen, setDmMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const isDarkTheme = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const [profileUser, setProfileUser] = useState<any | null>(null);
  const [aliasName, setAliasName] = useState<string>(initialAlias || '');
  const [showBackToBottom, setShowBackToBottom] = useState(false);
  // Cache block status per user in group chats to disable only blocked users' avatars
  const [blockedUserMap, setBlockedUserMap] = useState<Record<number, boolean>>({});
  const [pinnedMessages, setPinnedMessages] = useState<Array<{ id: number; content?: string; messageType?: string; createdAt?: string }>>([]);
  // Nickname editor state
  const [showNickname, setShowNickname] = useState(false);
  const [nicknameValue, setNicknameValue] = useState('');
  // Inline message search panel state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ id: number; content: string; messageType?: string; createdAt: string; senderId?: number }>>([]);
  // Common groups modal state
  const [showCommonGroups, setShowCommonGroups] = useState(false);

  // Group members side panel state
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const openMembersPanel = () => {
    setHeaderMenuOpen(false);
    if (!isGroup) return;
    setShowMembersPanel(true);
  };

  // Safely open user profile: for group chats, check block status with that user before opening
  const handleOpenProfile = async (user: any) => {
    if (!user) return;
    if (isGroup) {
      try {
        const res = await blockService.getStatus(Number(user.id));
        if (res?.data?.isEitherBlocked) {
          toast.error(t('chat.blocked.profileHidden', 'Bạn không thể xem thông tin vì một trong hai đã chặn nhau.'));
          return;
        }
      } catch (_) {
        // On network error, be conservative: do not open
        toast.error(t('chat.errors.generic', 'Đã xảy ra lỗi. Vui lòng thử lại.'));
        return;
      }
      setProfileUser(user);
      // Fetch alias (nickname) for this user (only visible to me)
      try {
        const r = await chatService.getChatNickname(Number(user.id));
        setAliasName(r?.data?.nickname || '');
      } catch { setAliasName(''); }
    } else {
      // 1-1 chat: rely on passed blocked flag
      if (!blocked) {
        setProfileUser(user);
        try {
          const r = await chatService.getChatNickname(Number(user.id));
          setAliasName(r?.data?.nickname || '');
        } catch { setAliasName(''); }
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMessage = (messageId: number) => {
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // brief highlight
      el.classList.add('ring-2', 'ring-yellow-400');
      setTimeout(() => el.classList.remove('ring-2', 'ring-yellow-400'), 1200);
    }
  };

  // Perform live search when query changes
  useEffect(() => {
    let canceled = false;
    const q = searchQuery.trim();
    if (!showSearch) return;
    if (q.length === 0) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const run = async () => {
      try {
        if (isGroup) {
          const gid = Number((selectedChat as any)?.id);
          const res = await groupService.searchGroupMessages(gid, q, 30);
          if (!canceled) setSearchResults(res.success ? (res.data as any) : []);
        } else {
          const uid = Number((selectedChat as any)?.id);
          const res = await chatService.searchMessages(uid, q, 30);
          if (!canceled) setSearchResults(res.success ? (res.data as any) : []);
        }
      } catch {
        if (!canceled) setSearchResults([]);
      } finally {
        if (!canceled) setSearching(false);
      }
    };
    const t = setTimeout(run, 200);
    return () => { canceled = true; clearTimeout(t); };
  }, [showSearch, searchQuery, isGroup, (selectedChat as any)?.id]);

  const loadPinnedMessages = async () => {
    try {
      if (isGroup) {
        const res = await pinService.listGroupPinnedMessages(Number((selectedChat as any)?.id));
        if (res?.success) setPinnedMessages(res.data || []);
      } else {
        const res = await pinService.listPinnedMessages(Number((selectedChat as any)?.id));
        if (res?.success) setPinnedMessages(res.data || []);
      }
    } catch (e) {
      // silent
    }
  };

  const handleTogglePinMessage = async (messageId: number, nextPinned: boolean) => {
    try {
      if (isGroup) {
        const gid = Number((selectedChat as any)?.id);
        await pinService.togglePinGroupMessage(gid, messageId, nextPinned);
      } else {
        await pinService.togglePinMessage(messageId, nextPinned);
      }
      await loadPinnedMessages();
      toast.success(nextPinned ? t('chat.menu.pinned', 'Đã ghim') : t('chat.menu.unpinned', 'Đã bỏ ghim'));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('chat.errors.generic'));
    }
  };

  useEffect(() => {
    // Always scroll to bottom when messages change to ensure new messages are visible
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadPinnedMessages();
  }, [isGroup, (selectedChat as any)?.id]);

  // Fetch alias (nickname) for current 1-1 chat.
  // Show initialAlias immediately, then refresh in background without overriding if input is already set.
  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        if (isGroup) { if (!canceled) setAliasName(''); return; }
        const id = Number((selectedChat as any)?.id);
        if (!id) { if (!canceled) setAliasName(''); return; }
        const r = await chatService.getChatNickname(id);
        if (!canceled) {
          const fresh = r?.data?.nickname || '';
          // Only update if no initial alias or value differs and user hasn't typed
          if (!initialAlias || initialAlias !== fresh) {
            setAliasName(fresh);
          }
        }
      } catch {
        if (!canceled) setAliasName((prev) => prev);
      }
    })();
    return () => { canceled = true; };
  }, [isGroup, (selectedChat as any)?.id, initialAlias]);

  // Realtime: refresh banner when someone pins/unpins
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onPinnedDM = (payload: { messageId: number; participants: number[]; pinned: boolean }) => {
      try {
        const otherId = Number((selectedChat as any)?.id);
        if (isGroup) return;
        if (!Array.isArray(payload?.participants)) return;
        // current chat participants are [currentUserId, otherId]
        if (payload.participants.includes(Number(currentUserId)) && payload.participants.includes(otherId)) {
          loadPinnedMessages();
        }
      } catch {}
    };

    const onPinnedGroup = (payload: { messageId: number; groupId: number; pinned: boolean }) => {
      try {
        const gid = Number((selectedChat as any)?.id);
        if (!isGroup) return;
        if (payload?.groupId === gid) {
          loadPinnedMessages();
        }
      } catch {}
    };

    socket.on('message_pinned', onPinnedDM);
    socket.on('group_message_pinned', onPinnedGroup);
    // Real-time nickname update across tabs/devices for current user
    const onNicknameUpdated = (payload: { otherUserId: number; nickname: string | null }) => {
      try {
        if (isGroup) return;
        const currentId = Number((selectedChat as any)?.id);
        if (payload?.otherUserId === currentId) {
          setAliasName(payload?.nickname || '');
        }
      } catch {}
    };
    socket.on('nickname_updated', onNicknameUpdated);
    // Also refresh on message recalls so stale pins disappear
    const onDmRecalled = (payload: { scope: 'self' | 'all'; messageIds: number[] }) => {
      if (isGroup) return;
      // Optimistically drop recalled IDs from local banner to reflect instantly
      if (Array.isArray(payload?.messageIds) && payload.messageIds.length > 0) {
        setPinnedMessages((prev) => prev.filter((pm) => !payload.messageIds.includes(pm.id)));
      }
      // Then re-fetch to ensure server truth (handles cross-device and cleanup)
      loadPinnedMessages();
    };
    const onGroupRecalled = (payload: { groupId: number; scope: 'self' | 'all'; messageIds: number[] }) => {
      if (!isGroup) return;
      const gid = Number((selectedChat as any)?.id);
      if (payload?.groupId === gid) {
        // Optimistically remove recalled IDs
        if (Array.isArray(payload?.messageIds) && payload.messageIds.length > 0) {
          setPinnedMessages((prev) => prev.filter((pm) => !payload.messageIds.includes(pm.id)));
        }
        loadPinnedMessages();
      }
    };
    // When user clears 1-1 chat history (delete for me), server emits 'messages_deleted' only to current user
    const onDmDeleted = (payload: { deletedWith: number; deletedBy: number; count: number; scope: 'self' }) => {
      try {
        if (isGroup) return;
        const otherId = Number((selectedChat as any)?.id);
        if (Number(payload?.deletedWith) === otherId) {
          // Optimistically clear banner when user clears history for this DM
          setPinnedMessages([]);
          loadPinnedMessages();
        }
      } catch {}
    };
    socket.on('messages_recalled', onDmRecalled);
    socket.on('group_messages_recalled', onGroupRecalled);
    socket.on('messages_deleted', onDmDeleted);
    return () => {
      socket.off('message_pinned', onPinnedDM);
      socket.off('group_message_pinned', onPinnedGroup);
      socket.off('messages_recalled', onDmRecalled);
      socket.off('group_messages_recalled', onGroupRecalled);
      socket.off('messages_deleted', onDmDeleted);
      socket.off('nickname_updated', onNicknameUpdated);
    };
  }, [isGroup, (selectedChat as any)?.id, currentUserId]);

  useEffect(() => {
    if (!isPartnerTyping) return;
    const el = scrollerRef.current;
    if (!el) return;
    const threshold = 80; // px
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceToBottom <= threshold) {
      setTimeout(scrollToBottom, 50);
    }
  }, [isPartnerTyping]);

  // Toggle "Back to bottom" button visibility on scroll
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowBackToBottom(distanceToBottom > 150);
    };
    onScroll();
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Update current time every minute to refresh offline duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  // One-shot ticks anchored to lastSeen: at 20s (to reveal "20 seconds ago") and at next minute boundary
  useEffect(() => {
    if (isGroup) return;
    const lastSeenAt = (selectedChat as any)?.lastSeenAt;
    if (!lastSeenAt) return;
    const last = new Date(lastSeenAt).getTime();
    const now = Date.now();
    const ageSec = Math.floor((now - last) / 1000);
    const timers: number[] = [] as unknown as number[];
    if (ageSec < 20) {
      timers.push(setTimeout(() => setCurrentTime(new Date()), (20 - ageSec) * 1000) as unknown as number);
    }
    // Schedule a tick at the next minute boundary after lastSeen
    const remainder = ageSec % 60;
    const msUntilNextMinute = ((remainder === 0 ? 60 : 60 - remainder) * 1000);
    timers.push(setTimeout(() => setCurrentTime(new Date()), msUntilNextMinute) as unknown as number);
    return () => {
      timers.forEach((t) => clearTimeout(t as unknown as number));
    };
  }, [isGroup, (selectedChat as any)?.lastSeenAt]);

  // When messages are masked (locked), still allow showing only my own outgoing messages
  // so the sender can see what they just sent. Otherwise show all grouped messages.
  const lockStartedAt = Number(sessionStorage.getItem('e2ee_lock_started_at') || '0');
  const visibleGroups = maskMessages
    ? groupedMessages
        .filter((g) => g.senderId === currentUserId)
        .map((g) => {
          const filteredItems = g.items.filter((i) => {
            const ts = typeof i.createdAt === 'string' ? new Date(i.createdAt).getTime() : (i.createdAt as any as number);
            return !Number.isFinite(lockStartedAt) || lockStartedAt === 0 ? true : ts >= lockStartedAt;
          });
          return { ...g, items: filteredItems };
        })
        .filter((g) => g.items.length > 0)
    : groupedMessages;

  // Prefetch block statuses for senders present in the currently visible groups (group chat only)
  useEffect(() => {
    if (!isGroup) return;
    const ids = Array.from(new Set(visibleGroups.map((g) => g.senderId).filter((id) => !!id && id !== currentUserId)));
    const toFetch = ids.filter((id) => blockedUserMap[id as number] === undefined) as number[];
    if (toFetch.length === 0) return;
    (async () => {
      try {
        const results = await Promise.allSettled(toFetch.map((id) => blockService.getStatus(Number(id))));
        setBlockedUserMap((prev) => {
          const next = { ...prev };
          results.forEach((res, idx) => {
            const id = toFetch[idx];
            if (res.status === 'fulfilled') {
              next[id] = !!res.value?.data?.isEitherBlocked;
            } else {
              // Conservative default on error: treat as blocked (disabled)
              next[id] = true;
            }
          });
          return next;
        });
      } catch {
        // Ignore; individual results handled above
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGroup, visibleGroups, currentUserId]);

  return (
    <>
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold shadow-md">
              {/* Avatar clickable only for 1-1 chat to open profile; disabled for group */}
              <button
                type="button"
                onClick={() => { handleOpenProfile(selectedChat); }}
                title={t('chat.chatView.viewProfile', 'Xem thông tin')}
                aria-disabled={!!blocked}
                className={`w-full h-full ${!blocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              >
                {selectedChat.avatar ? (
                  <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
                ) : (
                  selectedChat.name.charAt(0)
                )}
              </button>
            </div>
            {(isGroup ? groupOnline === true : selectedChat.isOnline === true) && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{!isGroup && aliasName ? aliasName : selectedChat.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(isGroup ? groupOnline : selectedChat.isOnline) ? 
                t('chat.chatView.status.online') : 
                (() => {
                  if (!selectedChat.lastSeenAt) {
                    return t('chat.chatView.status.offline');
                  }
                  const lastSeen = new Date(selectedChat.lastSeenAt);
                  const diffMs = currentTime.getTime() - lastSeen.getTime();
                  const diffSeconds = Math.floor(diffMs / 1000);
                  // Show plain offline for the first 0-19s
                  if (diffSeconds < 20) {
                    return t('chat.chatView.status.offline');
                  }
                  try {
                    const rtf = new Intl.RelativeTimeFormat(i18n.language || undefined, { numeric: 'auto' });
                    // Between 20s and 59s, always show "20 seconds ago" (fixed)
                    if (diffSeconds < 60) {
                      return rtf.format(-20, 'second');
                    } else if (diffSeconds < 3600) {
                      const minutes = Math.floor(diffSeconds / 60);
                      return rtf.format(-minutes, 'minute');
                    } else if (diffSeconds < 86400) {
                      const hours = Math.floor(diffSeconds / 3600);
                      return rtf.format(-hours, 'hour');
                    } else {
                      const days = Math.floor(diffSeconds / 86400);
                      return rtf.format(-days, 'day');
                    }
                  } catch {
                    // Fallback if Intl.RelativeTimeFormat not available
                    if (diffSeconds < 60) {
                      return '20s ago';
                    } else if (diffSeconds < 3600) {
                      const minutes = Math.floor(diffSeconds / 60);
                      return `${minutes}m ago`;
                    } else if (diffSeconds < 86400) {
                      const hours = Math.floor(diffSeconds / 3600);
                      return `${hours}h ago`;
                    } else {
                      const days = Math.floor(diffSeconds / 86400);
                      return `${days}d ago`;
                    }
                  }
                })()
              }
            </p>
            {/* Set nickname action for 1-1 chats only; place a small button under name in profile modal as requested */}
          </div>
          <div className="flex items-center gap-2 relative">
            {/* Keep existing header icons if needed */}
            {!isGroup && (
              <>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3a1 1 0 011 1v.5a1 1 0 11-2 0V4a1 1 0 011-1zM15 4a1 1 0 011 1v.5a1 1 0 11-2 0V5a1 1 0 011-1zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zM19 8.25a1.25 1.25 0 10-2.5 0v7.5a1.25 1.25 0 102.5 0v-7.5z" />
                  </svg>
                </button>
                {/* Three dots menu for 1-1 chat */}
                <button
                  onClick={() => setDmMenuOpen((v) => !v)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  title={t('chat.menu.options')}
                  aria-label={t('chat.menu.chatOptionsAria')}
                >
                  <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
                {dmMenuOpen && (
                  <div
                    className="absolute right-0 top-10 z-50 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1"
                    onMouseLeave={() => setDmMenuOpen(false)}
                  >
                    <button
                      onClick={() => { setDmMenuOpen(false); setShowSearch(true); setSearchQuery(''); setSearchResults([]); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('chat.menu.searchMessages', 'Search messages')}
                    </button>
                    <button
                      onClick={() => { setDmMenuOpen(false); onChangeBackground && onChangeBackground(); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('chat.menu.changeBackground', 'Đổi ảnh nền')}
                    </button>
                    <button
                      onClick={() => { setDmMenuOpen(false); onChangeBackgroundForBoth && onChangeBackgroundForBoth(); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('chat.menu.changeBackgroundForBoth', 'Đổi ảnh nền cho cả hai')}
                    </button>
                    {backgroundUrl ? (
                      <button
                        onClick={() => { setDmMenuOpen(false); onResetBackground && onResetBackground(); }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {t('chat.menu.resetBackground', 'Khôi phục nền mặc định')}
                      </button>
                    ) : null}
                  </div>
                )}
              </>
            )}

            {isGroup && (
              <>
                <button
                  onClick={() => setHeaderMenuOpen((v) => !v)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  title={t('chat.menu.options')}
                  aria-label={t('chat.menu.chatOptionsAria')}
                >
                  <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                </button>
                {headerMenuOpen && (
                  <div className="absolute right-0 top-10 z-50 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1"
                       onMouseLeave={() => setHeaderMenuOpen(false)}
                  >
                    <button
                      onClick={() => { openMembersPanel(); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('chat.groups.actions.viewMembers', 'Xem thành viên')}
                    </button>
                    <button
                      onClick={() => { setHeaderMenuOpen(false); setShowSearch(true); setSearchQuery(''); setSearchResults([]); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t('chat.menu.searchMessages', 'Search messages')}
                    </button>
                    {isGroupOwner && onEditGroup && (
                      <button
                        onClick={() => { setHeaderMenuOpen(false); onEditGroup(); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {t('chat.groups.actions.edit')}
                      </button>
                    )}
                    {isGroupOwner && onRemoveMembers && (
                      <button
                        onClick={() => { setHeaderMenuOpen(false); onRemoveMembers(); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {t('chat.groups.actions.removeMember')}
                      </button>
                    )}
                    {isGroupOwner && (
                      onDeleteGroup ? (
                        <button
                          onClick={() => { setHeaderMenuOpen(false); onDeleteGroup(); }}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {t('chat.groups.actions.delete')}
                        </button>
                      ) : null
                    )}
                    {!isGroupOwner && onLeaveGroup && (
                      <button
                        onClick={() => { setHeaderMenuOpen(false); onLeaveGroup(); }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {t('chat.groups.actions.leave')}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('chat.search.placeholder', 'Search messages…')}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
            >
              {t('actions.close', 'Close')}
            </button>
          </div>
          <div className="mt-3 max-h-[46vh] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 p-2">
            {searching ? (
              <div className="px-3 py-6 text-sm text-gray-500 dark:text-gray-400">{t('chat.search.searching', 'Searching...')}</div>
            ) : searchQuery.trim().length === 0 ? (
              <div className="px-3 py-6 text-sm text-gray-500 dark:text-gray-400">{t('chat.search.hint', 'Type to search messages')}</div>
            ) : searchResults.length === 0 ? (
              <div className="px-3 py-6 text-sm text-gray-500 dark:text-gray-400">{t('chat.search.noResults', 'No matching messages')}</div>
            ) : (
              <ul className="space-y-1">
                {searchResults.map((m) => {
                  const ts = new Date(m.createdAt);
                  const renderHighlighted = () => {
                    const q = searchQuery.trim();
                    const parts = String(m.content || '').split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
                    return (
                      <span>
                        {parts.map((p, idx) => (
                          <span key={idx} className={p.toLowerCase() === q.toLowerCase() ? 'bg-yellow-200 dark:bg-yellow-800/60 rounded px-0.5' : ''}>{p}</span>
                        ))}
                      </span>
                    );
                  };
                  return (
                    <li key={`sr-${m.id}`}>
                      <button
                        onClick={() => { setShowSearch(false); scrollToMessage(m.id); }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                          {m.messageType === 'image' ? t('chat.preview.image') : m.messageType === 'file' ? t('chat.preview.file') : renderHighlighted()}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {ts.toLocaleString(i18n.language || undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Dedicated Nickname Modal */}
      <NicknameModal
        open={!!profileUser && showNickname}
        onClose={() => setShowNickname(false)}
        user={profileUser ? { id: Number(profileUser.id), name: String(profileUser.name || ''), avatar: profileUser.avatar || null } : null}
        initialNickname={nicknameValue}
        onConfirm={async (nick) => {
          try {
            const otherId = Number(profileUser?.id || (selectedChat as any)?.id);
            await chatService.setChatNickname(otherId, nick);
            toast.success(String(t('chat.nickname.saved', 'Đã lưu tên gọi nhớ')));
            setAliasName(nick || '');
          } catch (e: any) {
            toast.error(e?.response?.data?.message || String(t('chat.errors.generic')));
          }
        }}
      />


      {/* Messages */}
      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto px-0 pb-4 pt-0 relative"
        style={
          (backgroundUrl || (isGroup && selectedChat?.background))
            ? {
                backgroundImage: `${isDarkTheme
                  ? 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35))'
                  : 'linear-gradient(rgba(255,255,255,0.15), rgba(255,255,255,0.15))'
                }, url(${backgroundUrl || selectedChat.background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
              }
            : undefined
        }
      >
        {/* Pinned banner */}
        {!maskMessages && pinnedMessages.length > 0 && (
          <div className="sticky top-0 z-30 pt-2 pb-2 mb-2 py-0 w-full backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/70 border-b border-yellow-200/60 dark:border-yellow-700/40">
            <div className="px-4 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                <span className="inline-block w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                {t('chat.menu.pinnedMessages', 'Tin nhắn đã ghim')}
              </span>
              {pinnedMessages.map((pm) => (
                <button
                  key={`pin-${pm.id}`}
                  onClick={() => scrollToMessage(pm.id)}
                  className="inline-flex items-center gap-1 max-w-[220px] px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800/60 border border-yellow-300/60 dark:border-yellow-700/40"
                  title={String(pm.content || '')}
                >
                  <span className="truncate">{pm.messageType === 'image' ? t('chat.preview.image') : pm.messageType === 'file' ? t('chat.preview.file') : (pm.content || '')}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {maskMessages && (
          <div className="relative z-10 mb-4 flex items-center justify-center text-center select-none">
            <div>
              <div className="text-5xl mb-4">🔒</div>
              <div className="text-gray-700 dark:text-gray-200 font-medium mb-2">
                {lockedNotice || t('chat.locked.notice', 'Đoạn tin nhắn đã bị mã hóa')}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('chat.locked.hint', 'Hãy nhập PIN để mở khóa và xem lịch sử cuộc trò chuyện. Bạn vẫn có thể tiếp tục nhắn tin.')}
              </div>
              {typeof onUnlock === 'function' && (
                <button
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  onClick={onUnlock}
                >
                  {t('chat.locked.unlockCta', 'Nhập PIN để mở khóa')}
                </button>
              )}
            </div>
          </div>
        )}
        {visibleGroups.length === 0 ? (
          !maskMessages ? (
            <div className="text-center py-8 relative z-10">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg">
                {selectedChat.avatar ? (
                  <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
                ) : (
                  selectedChat.name.charAt(0)
                )}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{!isGroup && aliasName ? aliasName : selectedChat.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('chat.chatView.empty.youAreFriends', { name: selectedChat.name })}</p>
            </div>
          ) : null
        ) : (
          <div className="space-y-4 relative z-10 mt-4 px-4">
            {visibleGroups.map((group) => {
              const isOwnMessage = group.senderId === currentUserId;
              const showAvatar = !isOwnMessage;
              const images = group.items.filter((i) => i.messageType === 'image');
              const files = group.items.filter((i) => i.messageType === 'file');
              // Use a stable, unique key per group based on sender and message id range
              const firstId = group.items[0]?.id ?? `s-${group.start}`;
              const lastId = group.items[group.items.length - 1]?.id ?? `e-${group.end}`;
              const groupKey = `g-${group.senderId}-${firstId}-${lastId}`;
              const hasMedia = images.length > 0 || files.length > 0;
              const isSameDayGroup = new Date(group.start).toDateString() === new Date(group.end).toDateString();
              const showGroupMenu = !hasMedia && !isSameDayGroup;
              const showPerMessageTextMenu = isSameDayGroup;
              const allRecalled = group.items.every((i) => i.isDeletedForAll);

              // System messages: render centered notices
              const isSystemGroup = group.items.every((i) => i.messageType === 'system');
              if (isSystemGroup) {
                return (
                  <div key={groupKey} className="flex justify-center">
                    <div className="max-w-[80%] text-center text-xs italic text-gray-600 dark:text-gray-300">
                      {group.items.map((it) => (
                        <div key={`sys-${it.id}`} className="py-1">
                          {it.content}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={groupKey} className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  {showAvatar && (
                    (() => {
                      const senderId = group.senderId as number;
                      // In group chat: disable if blocked OR still loading (undefined)
                      const isSenderBlocked = isGroup ? blockedUserMap[senderId] !== false : !!blocked;
                      return (
                        <button
                          type="button"
                          onClick={!isSenderBlocked ? () => {
                            const first = group.items[0];
                            const user = first?.sender ?? selectedChat;
                            handleOpenProfile(user);
                          } : undefined}
                          title={!isSenderBlocked ? t('chat.chatView.viewProfile', 'Xem thông tin') : undefined}
                          aria-disabled={isSenderBlocked}
                          className={`w-7 h-7 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-auto ${!isSenderBlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                        >
                          {(() => {
                            const first = group.items[0];
                            const avatar = first?.sender?.avatar ?? selectedChat.avatar;
                            const name = first?.sender?.name ?? selectedChat.name;
                            return avatar ? (
                              <img src={avatar} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              (name || '').charAt(0)
                            );
                          })()}
                        </button>
                      );
                    })()
                  )}
                  <div className={`relative max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                    {/* Group-level menu: only for text-only and NOT same-day */}
                    {showGroupMenu && (
                      <>
                        <button
                          onClick={() => onMenuToggle(menuOpenKey === groupKey ? null : groupKey)}
                          className={`absolute -top-3 ${isOwnMessage ? '-right-3' : '-left-3'} p-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity`}
                          title={t('chat.menu.options')}
                          aria-label={t('chat.menu.messageOptionsAria')}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        {menuOpenKey === groupKey && (
                          <div className={`absolute z-40 ${isOwnMessage ? 'right-0' : 'left-0'} top-4 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1`}
                            onMouseLeave={() => onMenuToggle(null)}
                          >
                            <button
                              onClick={() => onRecallGroup(group, 'self')}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {t('chat.menu.recall.self')}
                            </button>
                            {isOwnMessage && !allRecalled && (
                              <button
                                onClick={() => onRecallGroup(group, 'all')}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                {t('chat.menu.recall.all')}
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Content */}
                    {allRecalled ? (
                      <div className="relative group">
                        <div className={`px-4 py-2 rounded-2xl text-xs italic text-gray-500 bg-gray-100 dark:bg-gray-700 ${isOwnMessage ? 'rounded-br-md' : 'rounded-bl-md'} shadow-sm`}>
                          {t('chat.recalled.text')}
                        </div>
                        <button
                          onClick={() => onMenuToggle(menuOpenKey === groupKey ? null : groupKey)}
                          className={`absolute -top-2 ${isOwnMessage ? '-right-2' : '-left-2'} z-30 p-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 transition-opacity`}
                          title={t('chat.menu.options')}
                          aria-label={t('chat.menu.messageOptionsAria')}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        {menuOpenKey === groupKey && (
                          <div className={`absolute z-10 ${isOwnMessage ? 'right-0' : 'left-0'} top-4 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1`}
                            onMouseLeave={() => onMenuToggle(null)}
                          >
                            <button
                              onClick={() => onRecallGroup(group, 'self')}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {t('chat.menu.recall.self')}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Render all items in chronological order with proper grouping for images */}
                        <div className="flex flex-col gap-2">
                          {(() => {
                            const sortedItems = group.items.sort((a, b) => {
                              const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : (a.createdAt as any as number);
                              const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : (b.createdAt as any as number);
                              return timeA - timeB;
                            });

                            const result = [];
                            let i = 0;
                            
                            while (i < sortedItems.length) {
                              const current = sortedItems[i];
                              
                              if (current.messageType === 'image') {
                                // Group consecutive images into a grid
                                const imageGroup = [current];
                                let j = i + 1;
                                
                                while (j < sortedItems.length && sortedItems[j].messageType === 'image') {
                                  imageGroup.push(sortedItems[j]);
                                  j++;
                                }
                                
                                result.push(
                                  <div key={`img-group-${current.id}`} className={`grid gap-1 ${imageGroup.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {imageGroup.map((img) => (
                                      <MessageBubble
                                        key={img.id}
                                        message={img}
                                        isOwnMessage={isOwnMessage}
                                        isRecalled={img.isDeletedForAll}
                                        menuOpenKey={menuOpenKey}
                                        messageKey={`img-${img.id}`}
                                        showMenu={true}
                                        currentUserId={currentUserId}
                                        allMessages={messages}
                                        onMenuToggle={onMenuToggle}
                                        onRecallMessage={onRecallMessage}
                                        onEditMessage={onEditMessage}
                                        onDownloadAttachment={onDownloadAttachment}
                                        onPreviewImage={onPreviewImage}
                                        pinnedIdSet={new Set(pinnedMessages.map((p) => p.id))}
                                        onTogglePinMessage={handleTogglePinMessage}
                                        onOpenProfile={handleOpenProfile}
                                        disableReactions={!isGroup && !!blocked}
                                      />
                                    ))}
                                  </div>
                                );
                                
                                i = j;
                              } else {
                                // Render non-image items individually
                                result.push(
                                  <MessageBubble
                                    key={current.id}
                                    message={current}
                                    isOwnMessage={isOwnMessage}
                                    isRecalled={current.isDeletedForAll}
                                    menuOpenKey={menuOpenKey}
                                    messageKey={`item-${current.id}`}
                                    showMenu={showPerMessageTextMenu || !!current.isDeletedForAll}
                                    currentUserId={currentUserId}
                                    allMessages={messages}
                                    onMenuToggle={onMenuToggle}
                                    onRecallMessage={onRecallMessage}
                                    onEditMessage={onEditMessage}
                                    onDownloadAttachment={onDownloadAttachment}
                                    onPreviewImage={onPreviewImage}
                                    pinnedIdSet={new Set(pinnedMessages.map((p) => p.id))}
                                    onTogglePinMessage={handleTogglePinMessage}
                                    onOpenProfile={handleOpenProfile}
                                    disableReactions={!isGroup && !!blocked}
                                  />
                                );
                                i++;
                              }
                            }
                            
                            return result;
                          })()}
                        </div>
                      </>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                      {new Date(group.end).toLocaleTimeString(i18n.language || undefined, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!isGroup && isPartnerTyping && !maskMessages && (
          <div className="mt-3 flex gap-2 justify-start relative z-10">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-auto">
              {selectedChat.avatar ? (
                <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
              ) : (
                selectedChat.name.charAt(0)
              )}
            </div>
            <div className="max-w-[70%] flex flex-col items-start">
              <div className="px-4 py-2 rounded-2xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm">
                <div className="flex items-center gap-1 py-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        {isGroup && typingUsers && typingUsers.length > 0 && !maskMessages && (
          <div className="mt-3 flex gap-2 justify-start relative z-10">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-auto">
              {selectedChat.avatar ? (
                <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
              ) : (
                selectedChat.name.charAt(0)
              )}
            </div>
            <div className="max-w-[70%] flex flex-col items-start">
              <div className="px-4 py-2 rounded-2xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm">
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                  {typingUsers.map(u => u.name).join(', ')}
                </div>
                <div className="flex items-center gap-1 py-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        {showBackToBottom && (
          <div className="sticky bottom-4 z-20 w-full flex justify-center pointer-events-none">
            <button
              onClick={scrollToBottom}
              className="px-3 py-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none pointer-events-auto"
              aria-label={t('chat.chatView.backToBottom', 'Xuống cuối')}
              title={t('chat.chatView.backToBottom', 'Xuống cuối')}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        )}
        <div ref={messagesEndRef} className="relative z-10" />
      </div>

      {/* Profile Modal */}
      {profileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setProfileUser(null)} />

          {/* Modal panel */}
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">{t('chat.chatView.profile.title', 'Thông tin người dùng')}</h4>
              <button
                onClick={() => setProfileUser(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={t('chat.chatView.profile.close', 'Đóng thông tin')}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <div className="flex flex-col items-center gap-3 mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold shadow-md">
                  {profileUser.avatar ? (
                    <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
                  ) : (
                    (profileUser.name || '').charAt(0)
                  )}
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{aliasName || profileUser.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {profileUser.isOnline ? t('chat.chatView.status.online') : t('chat.chatView.status.offline')}
                  </div>
                  {Number(profileUser?.id) !== Number(currentUserId) && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50 shadow-sm transition-colors"
                        onClick={async () => {
                          try {
                            const otherId = Number(profileUser.id || (selectedChat as any)?.id);
                            const res = await chatService.getChatNickname(otherId);
                            setNicknameValue(res?.data?.nickname || '');
                          } catch {
                            setNicknameValue('');
                          }
                          setShowNickname(true);
                        }}
                        title={String(t('chat.nickname.setButton', { defaultValue: 'Đặt tên gọi nhớ' } as any))}
                        aria-label={String(t('chat.nickname.setButton', { defaultValue: 'Đặt tên gọi nhớ' } as any))}
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="text-xs font-medium">{String(t('chat.nickname.setButton', { defaultValue: 'Đặt tên gọi nhớ' } as any))}</span>
                      </button>
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-blue-300 hover:text-blue-700 dark:hover:text-blue-300 shadow-sm transition-colors"
                        onClick={() => setShowCommonGroups(true)}
                        title={String(t('chat.commonGroups.title', { defaultValue: 'Nhóm chung' } as any))}
                        aria-label={String(t('chat.commonGroups.title', { defaultValue: 'Nhóm chung' } as any))}
                      >
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-medium">{String(t('chat.commonGroups.title', { defaultValue: 'Nhóm chung' } as any))}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {(() => {
                  const notProvided = t('common.notProvided', 'Chưa cập nhật');
                  const genderLabel = (g: any) => {
                    switch (g) {
                      case 'male': return t('gender.male', 'Nam');
                      case 'female': return t('gender.female', 'Nữ');
                      case 'other': return t('gender.other', 'Khác');
                      case 'unspecified': return t('gender.unspecified', 'Không xác định');
                      default: return notProvided;
                    }
                  };
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('chat.chatView.profile.email', 'Email')}</span>
                        <span className="text-gray-900 dark:text-gray-200 break-all">{profileUser.email || notProvided}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('chat.chatView.profile.phone', 'Số điện thoại')}</span>
                        <span className="text-gray-900 dark:text-gray-200">{profileUser.hidePhone ? t('chat.chatView.profile.phoneHiddenMask', '.....') : (profileUser.phone || notProvided)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('chat.chatView.profile.birthDate', 'Ngày sinh')}</span>
                        <span className="text-gray-900 dark:text-gray-200">{profileUser.hideBirthDate ? t('chat.chatView.profile.birthDateHiddenMask', '../..') : (formatDateMDYY(profileUser.birthDate) || notProvided)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('chat.chatView.profile.gender', 'Giới tính')}</span>
                        <span className="text-gray-900 dark:text-gray-200">{genderLabel(profileUser.gender)}</span>
                      </div>

                      {profileUser.lastSeenAt && !profileUser.isOnline && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">{t('chat.chatView.profile.lastSeen', 'Hoạt động')}</span>
                          <span className="text-gray-900 dark:text-gray-200">{formatDateTimeMDYY_HHmm(profileUser.lastSeenAt) || notProvided}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {t('chat.chatView.profile.privacy', 'Một số thông tin có thể không hiển thị nếu người dùng không chia sẻ.')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Group Members Sidebar */}
      <GroupMembersPanel
        open={!!(isGroup && showMembersPanel)}
        groupId={isGroup ? Number((selectedChat as any)?.id) : null}
        onClose={() => setShowMembersPanel(false)}
        onOpenProfile={(user) => handleOpenProfile(user)}
      />

      {/* Common Groups Modal */}
      <CommonGroupsModal
        open={!!(profileUser && showCommonGroups)}
        onClose={() => setShowCommonGroups(false)}
        userId={profileUser ? Number(profileUser.id) : null}
      />
    </>
  );
};

export default ChatView;
