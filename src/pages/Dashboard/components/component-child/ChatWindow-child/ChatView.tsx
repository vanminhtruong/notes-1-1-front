import { useRef, useEffect, useState, memo } from 'react';
import { MoreVertical, ChevronDown, Pencil, Users, Video, Key } from 'lucide-react';
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
import { useOptionalCall } from '@/contexts/CallContext';
import { toast } from 'react-hot-toast';
import type { ChatViewProps } from '../../interface/ChatView.interface';
const ChatView = memo(({
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
  initialLoading,
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
  onPrependMessages,
  onRemoveMessages,
  onReplyRequested,
  onUpdateRecipientStatus,
}: ChatViewProps) => {
  const { t, i18n } = useTranslation('dashboard');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const prependingRef = useRef(false);
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
  // Group roles map to render owner/admin badges on avatars
  const [groupRoleMap, setGroupRoleMap] = useState<Record<number, 'owner'|'admin'|'member'>>({});
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
  // Lazy-load state
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);
  // Only display spinner when user is scrolling upwards to load older messages
  const [showTopSpinner, setShowTopSpinner] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef<number>(1);
  const hasMoreRef = useRef<boolean>(true);
  const loadingRef = useRef<boolean>(false);
  const isGroupRef = useRef<boolean>(!!isGroup);
  const selectedIdRef = useRef<number | null>(null);
  const onPrependRef = useRef<((older: any[]) => void) | null>(null);
  // Track which pages have been loaded in this session to avoid re-fetching the same page again
  const loadedPagesRef = useRef<Set<number>>(new Set<number>());
  // Mutex to prevent duplicate concurrent loads from scroll + IntersectionObserver
  const fetchingPrevRef = useRef<boolean>(false);
  // Throttle scroll handler to avoid rapid retriggers near the top
  const scrollThrottleRef = useRef<number>(0);
  // Chỉ tải khi người dùng đã thực sự cuộn lên (tránh auto-load khi mount hoặc sentinel sẵn trong viewport)
  const userInteractedRef = useRef<boolean>(false);
  const prevScrollTopRef = useRef<number>(0);
  // Chỉ bật cơ chế load ngược khi phiên cuộn bắt đầu từ đáy (tin nhắn mới nhất)
  const startedFromBottomRef = useRef<boolean>(false);
  // Keep reference to IntersectionObserver to disconnect when exhausted
  const observerRef = useRef<IntersectionObserver | null>(null);
  // Track last scroll direction to ensure we only load when scrolling upwards
  const lastScrollDirUpRef = useRef<boolean>(false);
  // Hard stop when reached the very first page to avoid any re-trigger
  const exhaustedRef = useRef<boolean>(false);
  // Track if user has already loaded messages in this session to prevent multiple loads
  const hasLoadedInSessionRef = useRef<boolean>(false);
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { loadingRef.current = isLoadingPrev; }, [isLoadingPrev]);
  useEffect(() => { isGroupRef.current = !!isGroup; }, [isGroup]);
  useEffect(() => { selectedIdRef.current = Number((selectedChat as any)?.id) || null; }, [(selectedChat as any)?.id]);
  useEffect(() => { onPrependRef.current = typeof onPrependMessages === 'function' ? onPrependMessages as any : null; }, [onPrependMessages]);

  // Keep roles up-to-date to show owner/admin badges on avatars in group chat
  useEffect(() => {
    if (!isGroup) { setGroupRoleMap({}); return; }
    const gid = Number((selectedChat as any)?.id);
    if (!gid) { setGroupRoleMap({}); return; }
    let canceled = false;
    const load = async () => {
      try {
        const res = await groupService.getGroupMembers(gid);
        if (!canceled) {
          const map: Record<number, 'owner'|'admin'|'member'> = {};
          for (const u of (res?.data || [])) {
            const role = (u?.role === 'owner' || u?.role === 'admin') ? u.role : 'member';
            map[Number(u.id)] = role as any;
          }
          setGroupRoleMap(map);
        }
      } catch {
        if (!canceled) setGroupRoleMap({});
      }
    };
    load();
    const socket = getSocket();
    const onRoleUpdated = (payload: { groupId: number; userId: number; role: 'admin'|'member' }) => {
      try {
        if (!payload || Number(payload.groupId) !== Number(gid)) return;
        setGroupRoleMap(prev => ({ ...prev, [Number(payload.userId)]: (payload.role === 'admin' ? 'admin' : 'member') }));
      } catch {}
    };
    if (socket) socket.on('group_member_role_updated', onRoleUpdated);
    return () => {
      canceled = true;
      if (socket) socket.off('group_member_role_updated', onRoleUpdated);
    };
  }, [isGroup, (selectedChat as any)?.id]);

  // Reference onRemoveMembers to satisfy linter when parent passes it but we don't use it inside
  useEffect(() => { /* noop */ }, [onRemoveMembers]);

  // Reply state is managed by parent via onReplyRequested

  // Voice/Video call controls used in header (optional if provider not mounted)
  const callCtx = useOptionalCall();

  // Group members side panel state
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const openMembersPanel = () => {
    setHeaderMenuOpen(false);
    if (!isGroup) return;
    setShowMembersPanel(true);
  };

  // Local async confirm using toast.custom (duplicate of ChatWindow's pattern to avoid prop plumbing)
  const confirmWithToast = (message: string) => new Promise<boolean>((resolve) => {
    const id = toast.custom((toastObj) => (
      <div className={`max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 ${toastObj.visible ? 'animate-in fade-in zoom-in' : 'animate-out fade-out zoom-out'}`}>
        <div className="text-sm text-gray-800 dark:text-gray-100 mb-3">{message}</div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => { toast.dismiss(id); resolve(false); }}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
          >
            {t('actions.cancel', 'Cancel')}
          </button>
          <button
            onClick={() => { toast.dismiss(id); resolve(true); }}
            className="px-3 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white"
          >
            {t('actions.confirm', 'Confirm')}
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  });

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
      // Enrich with privacy-aware member info from backend
      try {
        const gid = Number((selectedChat as any)?.id);
        if (gid) {
          const membersRes = await groupService.getGroupMembers(gid);
          const found = (membersRes?.data || []).find((m: any) => Number(m.id) === Number(user.id));
          if (found) {
            // Prefer backend-shaped object which already respects privacy
            setProfileUser(found);
          } else {
            setProfileUser(user);
          }
        } else {
          setProfileUser(user);
        }
      } catch {
        setProfileUser(user);
      }
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

  const handleReplyMessage = (message: any) => {
    // Notify parent to set replying state and focus input area
    if (onReplyRequested) onReplyRequested(message);
    scrollToBottom();
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
    // Avoid jumping to bottom when we are prepending older messages
    if (prependingRef.current) return;
    // For normal updates (new incoming/outgoing), keep behavior
    scrollToBottom();
    // Đánh dấu phiên cuộn khởi đầu từ đáy để cho phép lazy-load khi cuộn lên
    startedFromBottomRef.current = true;
  }, [messages]);

  // Reset pagination when switching chat/group
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    // Reset tương tác cuộn khi chuyển cuộc trò chuyện để tránh auto-load
    userInteractedRef.current = false;
    prevScrollTopRef.current = scrollerRef.current ? scrollerRef.current.scrollTop : 0;
    // Yêu cầu người dùng quay lại đáy, chỉ khi ở đáy mới kích hoạt load ngược
    startedFromBottomRef.current = false;
    // Reset exhausted state for new conversation
    exhaustedRef.current = false;
    // Reset session load flag for new conversation
    hasLoadedInSessionRef.current = false;
    // Reset loaded pages and seed with current page=1 to prevent re-loading the first page
    loadedPagesRef.current = new Set<number>([1]);
  }, [isGroup, (selectedChat as any)?.id]);

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
      console.log('📌 ChatView: DM recalled, updating pinned messages:', payload);
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
    const onGroupMessagesDeleted = (payload: { groupId: number; count: number }) => {
      try {
        const gid = Number((selectedChat as any)?.id);
        if (!isGroup || !payload || payload.groupId !== gid) return;
        setPinnedMessages([]);
      } catch {}
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
    socket.on('group_messages_deleted', onGroupMessagesDeleted);
    socket.on('messages_deleted', onDmDeleted);
    
    // Admin message deletion events
    const onAdminMessageDeleted = (payload: { messageId: number; chatUserId: number; deletedBy: string }) => {
      try {
        if (isGroup) return;
        const currentId = Number((selectedChat as any)?.id);
        if (payload.chatUserId !== currentId) return;
        
        console.log(`🔥 Admin deleted message ${payload.messageId} in 1-1 chat with user ${payload.chatUserId}`);
        
        // Remove message from UI immediately
        if (onRemoveMessages) {
          console.log(`🗑️ Removing message ${payload.messageId} from UI`);
          onRemoveMessages([payload.messageId]);
        } else {
          console.warn('⚠️ onRemoveMessages callback not available');
        }
        
        // Show notification
        if (payload.deletedBy === 'admin') {
          toast('Một tin nhắn đã bị admin xóa', { 
            duration: 3000,
            icon: '⚠️'
          });
        }
      } catch (error) {
        console.error('Error handling admin message deletion:', error);
      }
    };
    
    const onAdminGroupMessageDeleted = (payload: { messageId: number; groupId: number; deletedBy: string }) => {
      try {
        if (!isGroup) return;
        const currentGroupId = Number((selectedChat as any)?.id);
        if (payload.groupId !== currentGroupId) return;
        
        console.log(`🔥 Admin deleted group message ${payload.messageId} in group ${payload.groupId}`);
        
        // Remove message from UI immediately
        if (onRemoveMessages) {
          console.log(`🗑️ Removing group message ${payload.messageId} from UI`);
          onRemoveMessages([payload.messageId]);
        } else {
          console.warn('⚠️ onRemoveMessages callback not available');
        }
        
        // Show notification
        if (payload.deletedBy === 'admin') {
          toast('Một tin nhắn nhóm đã bị admin xóa', { 
            duration: 3000,
            icon: '⚠️'
          });
        }
      } catch (error) {
        console.error('Error handling admin group message deletion:', error);
      }
    };
    
    socket.on('admin_message_deleted', onAdminMessageDeleted);
    socket.on('admin_group_message_deleted', onAdminGroupMessageDeleted);
    return () => {
      socket.off('message_pinned', onPinnedDM);
      socket.off('group_message_pinned', onPinnedGroup);
      socket.off('messages_recalled', onDmRecalled);
      socket.off('group_messages_recalled', onGroupRecalled);
      socket.off('group_messages_deleted', onGroupMessagesDeleted);
      socket.off('messages_deleted', onDmDeleted);
      socket.off('admin_message_deleted', onAdminMessageDeleted);
      socket.off('admin_group_message_deleted', onAdminGroupMessageDeleted);
      socket.off('nickname_updated', onNicknameUpdated);
    };
  }, [isGroup, (selectedChat as any)?.id, currentUserId]);

  useEffect(() => {
    // Always bring the view to the bottom to reveal typing indicator in 1-1 chat
    if (!isPartnerTyping || maskMessages) return;
    setTimeout(scrollToBottom, 50);
  }, [isPartnerTyping, maskMessages]);

  useEffect(() => {
    // Always bring the view to the bottom to reveal typing indicator in group chat
    if (!isGroup) return;
    if (!typingUsers || typingUsers.length === 0 || maskMessages) return;
    setTimeout(scrollToBottom, 50);
  }, [typingUsers, isGroup, maskMessages]);

  // Toggle "Back to bottom" button visibility on scroll
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowBackToBottom(distanceToBottom > 150);
      // Đánh dấu đã có tương tác cuộn lên (so sánh hướng cuộn)
      if (el.scrollTop < (prevScrollTopRef.current || 0)) {
        userInteractedRef.current = true;
        lastScrollDirUpRef.current = true;
      } else if (el.scrollTop > (prevScrollTopRef.current || 0)) {
        lastScrollDirUpRef.current = false;
        // Hide spinner when scrolling downwards
        if (showTopSpinner) setShowTopSpinner(false);
        // Reset startedFromBottomRef when user scrolls back to near bottom (within 100px)
        if (distanceToBottom <= 100) {
          startedFromBottomRef.current = true;
        }
      }
      // Trigger lazy-load when near top (increased threshold for reliability)
      if (el.scrollTop <= 200) {
        // Chỉ cho phép tải khi người dùng đã cuộn lên ít nhất một lần và chưa tải trong phiên này
        if (exhaustedRef.current || !userInteractedRef.current || !startedFromBottomRef.current || !lastScrollDirUpRef.current || hasLoadedInSessionRef.current) {
          prevScrollTopRef.current = el.scrollTop;
          return;
        }
        // Throttle rapid scroll events to once per 150ms
        const now = Date.now();
        if (now - (scrollThrottleRef.current || 0) < 150) return;
        scrollThrottleRef.current = now;
        void (async () => {
          // Strong guard to avoid duplicate concurrent loads
          if (fetchingPrevRef.current || loadingRef.current || !hasMoreRef.current) return;
          let startAt = Date.now();
          try {
            fetchingPrevRef.current = true;
            startAt = Date.now();
            const prevHeight = el.scrollHeight;
            const nextPage = (pageRef.current || 1) + 1;
            // Skip if this page was already fetched in this session
            if (loadedPagesRef.current.has(nextPage)) {
              fetchingPrevRef.current = false;
              return;
            }
            // Confirmed we will fetch: show spinner for upward loading and mark as loaded in session
            setShowTopSpinner(true);
            setIsLoadingPrev(true);
            hasLoadedInSessionRef.current = true;
            const LIMIT = 10;
            let fetched: any[] | null = null;
            let newHasMore: boolean = !!hasMoreRef.current;
            if (isGroupRef.current) {
              const gid = Number(selectedIdRef.current || 0);
              if (!gid) return;
              const res = await groupService.getGroupMessages(gid, nextPage, LIMIT);
              if (res?.success && Array.isArray(res.data)) {
                fetched = res.data as any[];
                newHasMore = (res as any)?.pagination ? !!(res as any).pagination.hasMore : (res.data.length === LIMIT);
              } else {
                newHasMore = false;
              }
            } else {
              const uid = Number(selectedIdRef.current || 0);
              if (!uid) return;
              const res = await chatService.getChatMessages(uid, nextPage, LIMIT);
              if (res?.success && Array.isArray(res.data)) {
                fetched = res.data as any[];
                newHasMore = (res as any)?.pagination ? !!(res as any).pagination.hasMore : (res.data.length === LIMIT);
                // Update recipient status if provided
                if (res.recipient && typeof res.recipient.isActive === 'boolean' && onUpdateRecipientStatus) {
                  onUpdateRecipientStatus(res.recipient.isActive);
                }
              } else {
                newHasMore = false;
              }
            }
            // Buffering: do not prepend yet; wait until finally after the delay
            // Use captured prevHeight for anchor after we actually prepend
            ;(el as any).__prevHeight = prevHeight;
            ;(el as any).__nextPage = nextPage;
            ;(el as any).__more = newHasMore;
            ;(el as any).__fetched = fetched;
          } catch {
            // stop further attempts on error for this session
            setHasMore(false);
          } finally {
            // Đảm bảo hiệu ứng loading hiển thị tối thiểu ~2.5s
            const elapsed = Date.now() - startAt;
            if (elapsed < 2500) {
              await new Promise((r) => setTimeout(r, 2500 - elapsed));
            }
            // After delay, apply buffered prepend (if any), then anchor scroll
            const bufferedFetched = (el as any).__fetched as any[] | null;
            const bufferedNextPage = (el as any).__nextPage as number | undefined;
            const bufferedMore = (el as any).__more as boolean | undefined;
            // Update ref synchronously to avoid re-trigger race before React state syncs
            if (typeof bufferedMore === 'boolean') {
              hasMoreRef.current = bufferedMore;
            }
            const bufferedPrevHeight = (el as any).__prevHeight as number | undefined;
            if (bufferedFetched && onPrependRef.current) {
              prependingRef.current = true;
              onPrependRef.current(bufferedFetched);
              if (typeof bufferedNextPage === 'number') {
                setPage(bufferedNextPage);
                // Mark this page as loaded to avoid future duplicates
                loadedPagesRef.current.add(bufferedNextPage);
              }
              if (typeof bufferedMore === 'boolean') setHasMore(bufferedMore);
              setTimeout(() => {
                const newHeight = el.scrollHeight;
                const base = (typeof bufferedPrevHeight === 'number') ? bufferedPrevHeight : newHeight;
                el.scrollTop = newHeight - base + el.scrollTop;
                prependingRef.current = false;
              }, 50);
            } else if (typeof bufferedMore === 'boolean') {
              setHasMore(bufferedMore);
            }
            // If no more data, disconnect observer to prevent re-triggers at top
            if (bufferedMore === false && observerRef.current) {
              exhaustedRef.current = true;
              try { observerRef.current.disconnect(); } catch {}
            }
            // Cleanup buffer
            delete (el as any).__fetched;
            delete (el as any).__nextPage;
            delete (el as any).__more;
            delete (el as any).__prevHeight;
            setIsLoadingPrev(false);
            setShowTopSpinner(false);
            fetchingPrevRef.current = false;
          }
        })();
      }
      prevScrollTopRef.current = el.scrollTop;
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // IntersectionObserver sentinel at the very top to ensure loading triggers reliably
  useEffect(() => {
    const rootEl = scrollerRef.current;
    const sentinel = topSentinelRef.current;
    if (!rootEl || !sentinel) return;
    let cancelled = false;
    const io = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (!e || !e.isIntersecting) return;
      // Chỉ cho phép khi người dùng đã cuộn lên để tránh tự tải khi sentinel sẵn trong viewport và chưa tải trong phiên này
      if (exhaustedRef.current || !userInteractedRef.current || !startedFromBottomRef.current || !lastScrollDirUpRef.current || hasLoadedInSessionRef.current) return;
      if (fetchingPrevRef.current || loadingRef.current || !hasMoreRef.current) return;
      // Trigger the same fetch logic as onScroll
      (async () => {
        let startAt = Date.now();
        try {
          fetchingPrevRef.current = true;
          startAt = Date.now();
          const prevHeight = rootEl.scrollHeight;
          const nextPage = (pageRef.current || 1) + 1;
          // Skip if already fetched this page in current session
          if (loadedPagesRef.current.has(nextPage)) {
            fetchingPrevRef.current = false;
            return;
          }
          // Confirmed fetch -> show spinner for upward load and mark as loaded in session
          setShowTopSpinner(true);
          setIsLoadingPrev(true);
          hasLoadedInSessionRef.current = true;
          const LIMIT = 10;
          let fetched: any[] | null = null;
          let newHasMore: boolean = !!hasMoreRef.current;
          if (isGroupRef.current) {
            const gid = Number(selectedIdRef.current || 0);
            if (!gid) return;
            const res = await groupService.getGroupMessages(gid, nextPage, LIMIT);
            if (!cancelled && res?.success && Array.isArray(res.data)) {
              fetched = res.data as any[];
              newHasMore = (res as any)?.pagination ? !!(res as any).pagination.hasMore : (res.data.length === LIMIT);
            } else if (!cancelled) {
              newHasMore = false;
            }
          } else {
            const uid = Number(selectedIdRef.current || 0);
            if (!uid) return;
            const res = await chatService.getChatMessages(uid, nextPage, LIMIT);
            if (!cancelled && res?.success && Array.isArray(res.data)) {
              fetched = res.data as any[];
              newHasMore = (res as any)?.pagination ? !!(res as any).pagination.hasMore : (res.data.length === LIMIT);
              // Update recipient status if provided
              if (res.recipient && typeof res.recipient.isActive === 'boolean' && onUpdateRecipientStatus) {
                onUpdateRecipientStatus(res.recipient.isActive);
              }
            } else if (!cancelled) {
              newHasMore = false;
            }
          }
          // Buffer for after-delay application
          ;(rootEl as any).__prevHeight = prevHeight;
          ;(rootEl as any).__nextPage = nextPage;
          ;(rootEl as any).__more = newHasMore;
          ;(rootEl as any).__fetched = fetched;
        } catch {
          if (!cancelled) setHasMore(false);
        } finally {
          // Đảm bảo hiệu ứng loading hiển thị tối thiểu ~2.5s
          const elapsed = Date.now() - startAt;
          if (elapsed < 2500) {
            await new Promise((r) => setTimeout(r, 2500 - elapsed));
          }
          // Apply buffered prepend after delay
          if (!cancelled) {
            const bufferedFetched = (rootEl as any).__fetched as any[] | null;
            const bufferedNextPage = (rootEl as any).__nextPage as number | undefined;
            const bufferedMore = (rootEl as any).__more as boolean | undefined;
            // Update ref synchronously to avoid re-trigger race before React state syncs
            if (typeof bufferedMore === 'boolean') {
              hasMoreRef.current = bufferedMore;
            }
            const bufferedPrevHeight = (rootEl as any).__prevHeight as number | undefined;
            if (bufferedFetched && onPrependRef.current) {
              prependingRef.current = true;
              onPrependRef.current(bufferedFetched);
              if (typeof bufferedNextPage === 'number') {
                setPage(bufferedNextPage);
                // Mark this page as loaded
                loadedPagesRef.current.add(bufferedNextPage);
              }
              if (typeof bufferedMore === 'boolean') setHasMore(bufferedMore);
              setTimeout(() => {
                const newHeight = rootEl.scrollHeight;
                const base = (typeof bufferedPrevHeight === 'number') ? bufferedPrevHeight : newHeight;
                rootEl.scrollTop = newHeight - base + rootEl.scrollTop;
                prependingRef.current = false;
              }, 50);
            } else if (typeof bufferedMore === 'boolean') {
              setHasMore(bufferedMore);
            }
            // If no more data, disconnect observer to prevent re-triggers at top
            if (bufferedMore === false && observerRef.current) {
              try { observerRef.current.disconnect(); } catch {}
            }
            // Cleanup buffer
            delete (rootEl as any).__fetched;
            delete (rootEl as any).__nextPage;
            delete (rootEl as any).__more;
            delete (rootEl as any).__prevHeight;
            setIsLoadingPrev(false);
            setShowTopSpinner(false);
          }
          fetchingPrevRef.current = false;
        }
      })();
    }, { root: rootEl, rootMargin: '0px', threshold: 0.01 });
    observerRef.current = io;
    io.observe(sentinel);
    return () => { cancelled = true; io.disconnect(); };
  }, [isGroup, (selectedChat as any)?.id]);

  // Update current time every minute to refresh offline duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  // Disable body scroll when chat view is open
  useEffect(() => {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const prevHtmlOverflow = htmlEl.style.overflow;
    const prevBodyOverflow = bodyEl.style.overflow;
    htmlEl.style.overflow = 'hidden';
    bodyEl.style.overflow = 'hidden';

    return () => {
      htmlEl.style.overflow = prevHtmlOverflow;
      bodyEl.style.overflow = prevBodyOverflow;
    };
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
      <div className="px-4 py-3 md-down:px-3 md-down:py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 md-down:shadow-sm">
        <div className="flex items-center gap-3 md-down:flex-nowrap md-down:gap-2">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors md-down:order-1 md-down:-ml-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="relative md-down:order-2 md-down:w-10 md-down:h-10">
            <div className="w-10 h-10 md-down:w-full md-down:h-full rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold shadow-md">
              {/* DM: open user profile. Group: open members panel */}
              <button
                type="button"
                onClick={() => { if (isGroup) { openMembersPanel(); } else { handleOpenProfile(selectedChat); } }}
                title={isGroup ? t('chat.groups.actions.viewMembers', 'Xem thành viên') : t('chat.chatView.viewProfile', 'Xem thông tin')}
                aria-disabled={isGroup ? false : !!blocked}
                className={`w-full h-full ${isGroup ? 'cursor-pointer' : (!blocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60')}`}
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
          <div className="flex-1 min-w-0 md-down:order-3 md-down:w-auto md-down:pt-0">
            <h3 className="font-semibold text-gray-900 dark:text-white md-down:text-base truncate">{!isGroup && aliasName ? aliasName : selectedChat.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 md-down:text-[11px] truncate">
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
          <div className="flex items-center gap-2 relative md-down:order-4 md-down:w-auto md-down:justify-end md-down:flex-nowrap md-down:gap-1">
            {/* Keep existing header icons if needed */}
            {!isGroup && (
              <>
                <button
                  onClick={() => {
                    try {
                      if (blocked) { toast.error(t('chat.errors.callBlocked', 'Không thể gọi do hai bên đã chặn nhau')); return; }
                      const otherId = Number((selectedChat as any)?.id);
                      if (!otherId) return;
                      if (!callCtx) return;
                      callCtx.startCall({ id: otherId, name: selectedChat.name, avatar: selectedChat.avatar || null });
                    } catch {}
                  }}
                  title={t('chat.chatView.actions.voiceCall', 'Gọi thoại')}
                  aria-label={t('chat.chatView.actions.voiceCall', 'Gọi thoại')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    try {
                      if (blocked) { toast.error(t('chat.errors.callBlocked', 'Không thể gọi do hai bên đã chặn nhau')); return; }
                      const otherId = Number((selectedChat as any)?.id);
                      if (!otherId) return;
                      if (!callCtx?.startVideoCall) return;
                      callCtx.startVideoCall({ id: otherId, name: selectedChat.name, avatar: selectedChat.avatar || null });
                    } catch {}
                  }}
                  title={t('chat.chatView.actions.videoCall', 'Gọi video')}
                  aria-label={t('chat.chatView.actions.videoCall', 'Gọi video')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <Video className="w-5 h-5 text-blue-600" />
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
                    {isGroupOwner && (
                      <button
                        onClick={async () => {
                          try {
                            const gid = Number((selectedChat as any)?.id);
                            if (!gid) return;
                            setHeaderMenuOpen(false);
                            const next = !Boolean((selectedChat as any)?.adminsOnly);
                            await groupService.updateGroup(gid, { adminsOnly: next });
                            toast.success(t('chat.groups.success.updated'));
                          } catch (e: any) {
                            toast.error(e?.response?.data?.message || t('chat.groups.errors.updateFailed'));
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {((selectedChat as any)?.adminsOnly ? t('chat.groups.actions.adminsOnlyDisable', 'Cho phép mọi người nhắn tin') : t('chat.groups.actions.adminsOnlyEnable', 'Chỉ quản trị được gửi tin nhắn'))}
                      </button>
                    )}
                    {isGroupOwner && onEditGroup && (
                      <button
                        onClick={() => { setHeaderMenuOpen(false); onEditGroup(); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {t('chat.groups.actions.edit')}
                      </button>
                    )}
                    {isGroupOwner && (
                      <button
                        onClick={async () => {
                          try {
                            const gid = Number((selectedChat as any)?.id);
                            if (!gid) return;
                            setHeaderMenuOpen(false);
                            const ok = await confirmWithToast(String(t('chat.groups.confirm.deleteAllMessages', { defaultValue: 'Delete all messages in this group?' } as any)));
                            if (!ok) return;
                            const res = await groupService.deleteAllGroupMessages(gid);
                            if (res?.success) {
                              setPinnedMessages([]);
                              // Messages will be cleared via socket event
                              toast.success(t('chat.groups.success.messagesDeleted', 'Đã xóa toàn bộ tin nhắn nhóm'));
                            }
                          } catch (e: any) {
                            toast.error(e?.response?.data?.message || t('chat.errors.generic'));
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {t('chat.groups.actions.deleteAllMessages', 'Xóa toàn bộ tin nhắn')}
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
        className="flex-1 overflow-y-auto px-0 pb-4 pt-0 relative md-down:px-3 md-down:pb-28 md-down:pt-2"
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
        {initialLoading ? (
          <div className="min-h-[180px] flex items-center justify-center">
            <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <div className="w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" aria-label={t('chat.loadingHistory', 'Đang tải lịch sử...')} />
              <span className="text-sm">{t('chat.loadingHistory', 'Đang tải lịch sử...')}</span>
            </div>
          </div>
        ) : (
          <>
        {/* Pinned banner */}
        {!maskMessages && pinnedMessages.length > 0 && (
          <div className="sticky top-0 z-30 pt-2 pb-2 mb-2 py-0 w-full backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/70 border-b border-yellow-200/60 dark:border-yellow-700/40">
            <div className="px-4 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                <span className="inline-block w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                {t('chat.menu.pinnedMessages', 'Tin nhắn đã ghim')}
              </span>
              {pinnedMessages.map((pm) => {
                // Check if pinned message is a shared note
                const prefix = 'NOTE_SHARE::';
                const isSharedNote = typeof pm.content === 'string' && pm.content.startsWith(prefix);
                let displayText = pm.content || '';
                
                if (isSharedNote && pm.content) {
                  try {
                    const raw = pm.content.slice(prefix.length);
                    const obj = JSON.parse(decodeURIComponent(raw));
                    if (obj && obj.title) {
                      displayText = `📝 ${obj.title}`;
                    }
                  } catch {
                    displayText = '📝 Ghi chú';
                  }
                } else if (pm.messageType === 'image') {
                  displayText = t('chat.preview.image');
                } else if (pm.messageType === 'file') {
                  displayText = t('chat.preview.file');
                } else {
                  try {
                    displayText = decodeURIComponent(pm.content || '');
                  } catch {
                    displayText = pm.content || '';
                  }
                }
                
                return (
                  <button
                    key={`pin-${pm.id}`}
                    onClick={() => scrollToMessage(pm.id)}
                    className="inline-flex items-center gap-1 max-w-[220px] px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800/60 border border-yellow-300/60 dark:border-yellow-700/40"
                    title={displayText}
                  >
                    <span className="truncate">{displayText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {/* Top loading spinner for lazy load (placed after pinned banner) */}
        {isLoadingPrev && showTopSpinner ? (
          <div className="sticky top-0 z-40 flex items-center justify-center pt-2 pb-1 bg-transparent">
            <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" aria-label={t('chat.loadingOlder', 'Đang tải tin nhắn cũ...')} />
          </div>
        ) : null}

        {/* Top intersection sentinel (1px) to trigger loads reliably */}
        <div ref={topSentinelRef} style={{ height: 1 }} />

        {/* Overlay to hide older messages area during loading (spinner remains visible) */}
        {isLoadingPrev && showTopSpinner && (
          <div
            className="absolute top-0 left-0 right-0 z-30 h-24 md:h-28 bg-white dark:bg-gray-900"
            aria-hidden="true"
          />
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
          <div className="space-y-1.5 relative z-10 mt-1 px-4">
            {(() => {
              let lastDateKey: string | null = null;
              return visibleGroups.map((group) => {
                const date = new Date(group.start);
                const dateKey = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
                const showSep = lastDateKey !== dateKey;
                if (showSep) lastDateKey = dateKey;

                const isOwnMessage = group.senderId === currentUserId;
                const showAvatar = !isOwnMessage;
                const images = group.items.filter((i) => i.messageType === 'image');
                const files = group.items.filter((i) => i.messageType === 'file');
                const firstId = group.items[0]?.id ?? `s-${group.start}`;
                const lastId = group.items[group.items.length - 1]?.id ?? `e-${group.end}`;
                const groupKey = `g-${group.senderId}-${firstId}-${lastId}`;
                const hasMedia = images.length > 0 || files.length > 0;
                const isSameDayGroup = new Date(group.start).toDateString() === new Date(group.end).toDateString();
                const showGroupMenu = !hasMedia && !isSameDayGroup;
                const showPerMessageTextMenu = isSameDayGroup;
                const allRecalled = group.items.every((i) => i.isDeletedForAll);

                const today = new Date();
                const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
                const diffDays = Math.floor((startOf(today).getTime() - startOf(date).getTime()) / (24 * 60 * 60 * 1000));
                const sepLabel = diffDays === 0
                  ? t('chat.chatView.daySeparator.today', 'Hôm nay')
                  : diffDays === 1
                    ? t('chat.chatView.daySeparator.yesterday', 'Hôm qua')
                    : date.toLocaleDateString(i18n.language || undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });

                return (
                  (() => {
                    const isSystemGroup = group.items.every((i) => i.messageType === 'system');
                    if (isSystemGroup) {
                      const sortedSys = [...group.items].sort((a, b) => {
                        const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : (a.createdAt as any as number);
                        const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : (b.createdAt as any as number);
                        return timeA - timeB;
                      });
                      return (
                        <>
                          {showSep && (
                            <div className="w-full flex items-center justify-center py-2" key={`sep-${dateKey}`}>
                              <span className="px-3 py-1 text-xs rounded-full bg-gray-200/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-200 shadow-sm">{sepLabel}</span>
                            </div>
                          )}
                          {sortedSys.map((it) => {
                            const raw = String(it.content || '');
                            const m = raw.match(/^(.+?)\s+(joined|left)\s+the\s+group/i);
                            const name = (m && m[1]) || ((it as any)?.sender?.name) || 'User';
                            const isJoined = !!(m && String(m[2]).toLowerCase() === 'joined');
                            const localized = isJoined
                              ? String(t('chat.system.joined', { name }))
                              : String(t('chat.system.left', { name }));
                            return (
                              <div key={`sys-${it.id}`} className="w-full flex items-center justify-center py-1">
                                <span className="px-3 py-1 text-xs rounded-full bg-gray-200/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-200 shadow-sm">{localized}</span>
                              </div>
                            );
                          })}
                        </>
                      );
                    }
                    return (
                      <>
                        {showSep && (
                          <div className="w-full flex items-center justify-center py-2" key={`sep-${dateKey}`}>
                            <span className="px-3 py-1 text-xs rounded-full bg-gray-200/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-200 shadow-sm">{sepLabel}</span>
                          </div>
                        )}
                        {/* Original group rendering */}
                        <div key={groupKey} className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          {showAvatar && (
                            (() => {
                              const senderId = group.senderId as number;
                              const isSenderBlocked = isGroup ? blockedUserMap[senderId] !== false : !!blocked;
                              return (
                                <div className="relative w-7 h-7 flex-shrink-0 mt-auto">
                                  <button
                                    type="button"
                                    onClick={!isSenderBlocked ? () => {
                                      const first = group.items[0];
                                      const user = (first as any)?.sender ?? selectedChat;
                                      handleOpenProfile(user);
                                    } : undefined}
                                    title={!isSenderBlocked ? t('chat.chatView.viewProfile', 'Xem thông tin') : undefined}
                                    aria-disabled={isSenderBlocked}
                                    className={`w-7 h-7 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold ${!isSenderBlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                                  >
                                    {(() => {
                                      const first = group.items[0];
                                      const senderName = (first as any)?.sender?.name || `User ${((first as any)?.senderId ?? '')}`;
                                      const senderAvatar = (first as any)?.sender?.avatar || null;
                                      return senderAvatar ? (
                                        <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                                      ) : (
                                        (senderName || '').charAt(0)
                                      );
                                    })()}
                                  </button>
                                  {/* Role indicator on sender avatar (group only): owner (gold) / admin (silver) */}
                                  {isGroup && (() => {
                                    const sender = Number(senderId);
                                    const fallbackOwner = Number((selectedChat as any)?.ownerId) === sender ? 'owner' : undefined;
                                    const role = (groupRoleMap && groupRoleMap[sender]) || fallbackOwner as ('owner'|'admin'|'member'|undefined);
                                    if (role === 'owner') {
                                      return (
                                        <span className="absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white dark:bg-gray-900 border border-amber-300 dark:border-amber-600 shadow-sm">
                                          <Key className="w-2 h-2 text-amber-500" />
                                        </span>
                                      );
                                    }
                                    if (role === 'admin') {
                                      return (
                                        <span className="absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 shadow-sm">
                                          <Key className="w-2 h-2 text-gray-500 dark:text-gray-300" />
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              );
                            })()
                          )}
                      <div className={`relative max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
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
                                {isOwnMessage && !group.items.every((i) => i.isDeletedForAll) && (
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
                          <>
                            <div className="flex flex-col gap-2">
                              {(() => {
                                // When every item in this sender-time group was recalled,
                                // compress sequences of image/file (+ optional following text)
                                // into a single recalled placeholder to avoid duplicates.
                                const sortedItems = group.items
                                  .slice()
                                  .sort((a, b) => {
                                    const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : (a.createdAt as any as number);
                                    const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : (b.createdAt as any as number);
                                    return timeA - timeB;
                                  });
                                const result: any[] = [];
                                let i = 0;
                                while (i < sortedItems.length) {
                                  const current = sortedItems[i];
                                  if (current.messageType === 'image' || current.messageType === 'file') {
                                    // Collapse consecutive attachments and an optional trailing text into one placeholder
                                    let j = i;
                                    while (j < sortedItems.length && (sortedItems[j].messageType === 'image' || sortedItems[j].messageType === 'file')) {
                                      j++;
                                    }
                                    if (j < sortedItems.length && sortedItems[j].messageType === 'text') {
                                      j++;
                                    }
                                    const placeholderMsg = current; // Use first item as representative
                                    result.push(
                                      <MessageBubble
                                        key={`recalled-combo-${placeholderMsg.id}`}
                                        message={placeholderMsg}
                                        isOwnMessage={isOwnMessage}
                                        isRecalled={true}
                                        menuOpenKey={menuOpenKey}
                                        messageKey={`item-${placeholderMsg.id}`}
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
                                        onReplyMessage={handleReplyMessage}
                                        onJumpToMessage={scrollToMessage}
                                      />
                                    );
                                    i = j;
                                  } else {
                                    // Text-only item (not part of an attachment combo) -> single placeholder
                                    result.push(
                                      <MessageBubble
                                        key={`recalled-${current.id}`}
                                        message={current}
                                        isOwnMessage={isOwnMessage}
                                        isRecalled={true}
                                        menuOpenKey={menuOpenKey}
                                        messageKey={`item-${current.id}`}
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
                                        onReplyMessage={handleReplyMessage}
                                        onJumpToMessage={scrollToMessage}
                                      />
                                    );
                                    i++;
                                  }
                                }
                                return result;
                              })()}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col gap-2">
                              {(() => {
                                const sortedItems = group.items.sort((a, b) => {
                                  const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : (a.createdAt as any as number);
                                  const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : (b.createdAt as any as number);
                                  return timeA - timeB;
                                });
                                const result: any[] = [];
                                let i = 0;
                                while (i < sortedItems.length) {
                                  const current = sortedItems[i];
                                  // Gom ảnh/file liền kề và (nếu có) text ngay sau đó vào CÙNG một bubble
                                  if (current.messageType === 'image' || current.messageType === 'file') {
                                    const attachments: any[] = [];
                                    let j = i;
                                    while (j < sortedItems.length && (sortedItems[j].messageType === 'image' || sortedItems[j].messageType === 'file')) {
                                      attachments.push(sortedItems[j]);
                                      j++;
                                    }
                                    let textMsg: any | null = null;
                                    if (j < sortedItems.length && sortedItems[j].messageType === 'text') {
                                      textMsg = sortedItems[j];
                                      j++;
                                    }
                                    const imgs = attachments.filter((a) => a.messageType === 'image' && !a.isDeletedForAll);
                                    const files = attachments.filter((a) => a.messageType === 'file' && !a.isDeletedForAll);
                                    result.push(
                                      <div key={`combo-${current.id}`} className={`relative group ${isOwnMessage ? 'flex justify-end' : 'flex justify-start'}`}>
                                        <div className="relative">
                                          {/* Menu ba chấm cho combo bubble */}
                                          <button
                                            onClick={() => onMenuToggle(menuOpenKey === `combo-${current.id}` ? null : `combo-${current.id}`)}
                                            className={`absolute -top-2 ${isOwnMessage ? '-right-2' : '-left-2'} z-30 p-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 transition-opacity`}
                                            title={t('chat.menu.options')}
                                            aria-label={t('chat.menu.messageOptionsAria')}
                                          >
                                            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                          </button>
                                          {menuOpenKey === `combo-${current.id}` && (
                                            <div
                                              className={`absolute z-40 ${isOwnMessage ? 'right-0' : 'left-0'} top-4 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1`}
                                              onMouseLeave={() => onMenuToggle(null)}
                                            >
                                              <button
                                                onClick={() => {
                                                  attachments.forEach((m: any) => { if (!m.isDeletedForAll) onRecallMessage(m, 'self'); });
                                                  if (textMsg && !textMsg.isDeletedForAll) onRecallMessage(textMsg, 'self');
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                              >
                                                {t('chat.menu.recall.self')}
                                              </button>
                                              {isOwnMessage && (
                                                <button
                                                  onClick={() => {
                                                    attachments.forEach((m: any) => { if (!m.isDeletedForAll) onRecallMessage(m, 'all'); });
                                                    if (textMsg && !textMsg.isDeletedForAll) onRecallMessage(textMsg, 'all');
                                                  }}
                                                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                  {t('chat.menu.recall.all')}
                                                </button>
                                              )}
                                            </div>
                                          )}
                                          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-3 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap w-fit ${isOwnMessage ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm'}`}>
                                          {imgs.length > 0 && (
                                            <div className={`grid gap-1 ${imgs.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                              {imgs.map((img) => (
                                                <div key={img.id} className="relative">
                                                  <img
                                                    src={img.content}
                                                    alt={t('chat.message.imageAlt')}
                                                    onClick={() => onPreviewImage && onPreviewImage(img.content)}
                                                    className="w-40 h-40 cursor-zoom-in rounded-xl object-cover"
                                                  />
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          {files.length > 0 && (
                                            <div className={`${imgs.length > 0 ? 'mt-2' : ''} space-y-1`}>
                                              {files.map((f) => (
                                                <button
                                                  key={f.id}
                                                  type="button"
                                                  onClick={() => onDownloadAttachment && onDownloadAttachment(f.content)}
                                                  className="w-full flex items-center gap-2 px-2 py-1 rounded-md bg-transparent text-current text-left"
                                                  title={t('chat.attachment.downloadFileTitle')}
                                                  aria-label={t('chat.attachment.downloadFileAria')}
                                                >
                                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M8 2a1 1 0 00-1 1v2H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2V3a1 1 0 10-2 0v2H9V3a1 1 0 00-1-1z" />
                                                  </svg>
                                                  <span className="truncate max-w-[220px]">{(() => { try { const u = new URL(f.content); return decodeURIComponent(u.pathname.split('/').pop() || t('chat.attachment.fileFallback')); } catch { return f.content; } })()}</span>
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                          {textMsg && !textMsg.isDeletedForAll && (
                                            <div className={`${(imgs.length > 0 || files.length > 0) ? 'mt-2' : ''}`}>{textMsg.content}</div>
                                          )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                    i = j;
                                  } else {
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
                                        onReplyMessage={handleReplyMessage}
                                        onJumpToMessage={scrollToMessage}
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
                  </>
                );
                  })()
                );
              });
            })()}
          </div>
        )}
        {!isGroup && isPartnerTyping && !maskMessages && (
          <div className="mt-3 px-4 flex gap-2 justify-start relative z-10">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-500/30 dark:ring-blue-400/30 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-auto shadow">
              {selectedChat.avatar ? (
                <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
              ) : (
                selectedChat.name.charAt(0)
              )}
            </div>
            <div className="max-w-[70%] flex flex-col items-start">
              <div className="px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm shadow-md">
                <div className="flex items-center gap-1 py-0.5">
                  <span className="w-2 h-2 bg-blue-500/80 dark:bg-blue-400/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-blue-500/60 dark:bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-blue-500/40 dark:bg-blue-400/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        {isGroup && typingUsers && typingUsers.length > 0 && !maskMessages && (
          <div className="mt-3 px-4 flex gap-2 justify-start relative z-10">
            <div className="flex -space-x-2 mt-auto">
              {(() => {
                const list = ((typingUsers ?? []) as any[]).slice(0, 2);
                return list.map((u: any, idx: number) => {
                  const name = String(u?.name || '').trim() || 'U';
                  const avatar = (u as any)?.avatar || null;
                  return (
                    <div key={u?.id ?? idx} className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-900 shadow">
                      {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-semibold">{name.charAt(0)}</div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
            <div className="flex flex-col items-start gap-0.5">
              {/* Bubble: không chứa chữ 'Đang nhập...' chỉ hiển thị chấm */}
              <div className="px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm shadow-md">
                <div className="flex items-center gap-1 py-0.5">
                  <span className="w-2 h-2 bg-blue-500/80 dark:bg-blue-400/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-blue-500/60 dark:bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-blue-500/40 dark:bg-blue-400/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
              {/* Tên người đang nhập (nhẹ, nhỏ) */}
              <div className="text-[11px] leading-none text-gray-500 dark:text-gray-400 px-1">
                {(typingUsers ?? []).map((u) => u.name).join(', ')}
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
          </>
        )}
      </div>

      {/* Profile Modal */}
      {profileUser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center" role="dialog" aria-modal="true">
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
                  const viewingSelf = Number(profileUser?.id) === Number(currentUserId);
                  const shouldMaskPhone = !viewingSelf && (profileUser.hidePhone === true || (typeof profileUser.hidePhone === 'undefined' && (profileUser.phone == null || profileUser.phone === '')));
                  const shouldMaskBirth = !viewingSelf && (profileUser.hideBirthDate === true || (typeof profileUser.hideBirthDate === 'undefined' && (profileUser.birthDate == null || profileUser.birthDate === '')));
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('chat.chatView.profile.email', 'Email')}</span>
                        <span className="text-gray-900 dark:text-gray-200 break-all">{profileUser.email || notProvided}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('chat.chatView.profile.phone', 'Số điện thoại')}</span>
                        <span className="text-gray-900 dark:text-gray-200">{shouldMaskPhone ? t('chat.chatView.profile.phoneHiddenMask', '.....') : (profileUser.phone || notProvided)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('chat.chatView.profile.birthDate', 'Ngày sinh')}</span>
                        <span className="text-gray-900 dark:text-gray-200">{shouldMaskBirth ? t('chat.chatView.profile.birthDateHiddenMask', '../..') : (formatDateMDYY(profileUser.birthDate) || notProvided)}</span>
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
        isOwner={!!isGroupOwner}
        currentUserId={Number(currentUserId)}
      />

      {/* Common Groups Modal */}
      <CommonGroupsModal
        open={!!(profileUser && showCommonGroups)}
        onClose={() => setShowCommonGroups(false)}
        userId={profileUser ? Number(profileUser.id) : null}
      />

      {/* Call modal is rendered globally via GlobalCallUI */}
    </>
  );
});

ChatView.displayName = 'ChatView';

export default ChatView;

