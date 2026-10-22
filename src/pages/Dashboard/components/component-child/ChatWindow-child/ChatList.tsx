import React from 'react';
import { MessageCircle, MoreVertical, UserX, Trash2, Ban, Pin, PinOff, CheckSquare, Square, X } from 'lucide-react';
import { useState, memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { formatPreviewText, formatPreviewTime } from '../../../../../utils/utils';
import toast from 'react-hot-toast';
import type { ChatListProps } from '../../interface/ChatList.interface';
import type { User, Message } from '../../interface/ChatTypes.interface';
import { blockService, type BlockStatus } from '@/services/blockService';
import { pinService } from '@/services/pinService';
import LazyLoad from '@/components/LazyLoad';

const ChatList = memo(({ chatList, friends, unreadMap, currentUserId, onStartChat, onRemoveFriend, onDeleteMessages, onRefreshChatList, onRefreshBlockedUsers, onBulkRemoveFriends, onBulkBlock, e2eeEnabled, e2eeUnlocked, lockedPlaceholder }: ChatListProps) => {
  const { t } = useTranslation('dashboard');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [blockStatusMap, setBlockStatusMap] = useState<Record<number, BlockStatus | undefined>>({});
  const [loadingBlockFor, setLoadingBlockFor] = useState<number | null>(null);
  const [pinStatusMap, setPinStatusMap] = useState<Record<number, boolean>>({});
  const [loadingPinFor, setLoadingPinFor] = useState<number | null>(null);

  // Multi-select mode states
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<Set<number>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Fetch block status for all friends in chatList on mount
  useEffect(() => {
    const fetchBlockStatuses = async () => {
      for (const item of chatList) {
        const friendId = item.friend.id;
        if (!blockStatusMap[friendId]) {
          try {
            const res = await blockService.getStatus(friendId);
            setBlockStatusMap((prev) => ({ ...prev, [friendId]: res.data }));
          } catch (e) {
            // Silent fail
          }
        }
      }
    };
    fetchBlockStatuses();
  }, [chatList]);

  const fetchBlockStatus = async (userId: number) => {
    try {
      setLoadingBlockFor(userId);
      const res = await blockService.getStatus(userId);
      setBlockStatusMap((prev) => ({ ...prev, [userId]: res.data }));
    } catch (e: any) {
      // Non-blocking: show a subtle toast but keep menu usable
      const msg = e?.response?.data?.message || 'Failed to fetch block status';
      toast.error(msg);
    } finally {
      setLoadingBlockFor(null);
    }
  };

  const fetchPinStatus = async (userId: number) => {
    try {
      const res = await pinService.getChatPinStatus(userId);
      setPinStatusMap((prev) => ({ ...prev, [userId]: res.data.pinned }));
    } catch (e: any) {
      console.error('Failed to fetch pin status:', e);
    }
  };

  const handleMenuToggle = async (friendId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = openMenuId === friendId ? null : friendId;
    setOpenMenuId(next);
    if (next) {
      // On open, fetch latest block status and pin status for this friend
      fetchBlockStatus(friendId);
      fetchPinStatus(friendId);
      const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    } else {
      setMenuPos(null);
    }
  };

  const handleBlock = async (userId: number) => {
    try {
      await blockService.block(userId);
      setBlockStatusMap((prev) => ({
        ...prev,
        [userId]: {
          blockedByMe: true,
          blockedMe: prev[userId]?.blockedMe ?? false,
          isEitherBlocked: true,
          blockId: prev[userId]?.blockId ?? null
        }
      }));
      // Refresh blocked users list
      if (onRefreshBlockedUsers) {
        await onRefreshBlockedUsers();
      }
      toast.success(t('chat.success.blocked', 'User blocked successfully'));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('chat.errors.block', 'Failed to block user'));
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleUnblock = async (userId: number) => {
    try {
      await blockService.unblock(userId);
      setBlockStatusMap((prev) => ({
        ...prev,
        [userId]: {
          blockedByMe: false,
          blockedMe: prev[userId]?.blockedMe ?? false,
          isEitherBlocked: !!(prev[userId]?.blockedMe),
          blockId: null
        }
      }));
      // Refresh blocked users list
      if (onRefreshBlockedUsers) {
        await onRefreshBlockedUsers();
      }
      toast.success(t('chat.success.unblocked', 'User unblocked successfully'));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('chat.errors.unblock', 'Failed to unblock user'));
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleTogglePin = async (userId: number) => {
    try {
      setLoadingPinFor(userId);
      const currentPinStatus = pinStatusMap[userId] || false;
      const newPinStatus = !currentPinStatus;

      await pinService.togglePinChat(userId, newPinStatus);
      setPinStatusMap((prev) => ({ ...prev, [userId]: newPinStatus }));

      toast.success(newPinStatus ? t('chat.actions.pinned', 'Chat pinned') : t('chat.actions.unpinned', 'Chat unpinned'));
      setOpenMenuId(null);

      // Refresh chat list to show new pin order
      onRefreshChatList?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('chat.errors.pin', 'Failed to update pin status'));
    } finally {
      setLoadingPinFor(null);
    }
  };

  // Multi-select handlers
  const toggleSelectMode = () => {
    setIsSelectMode(prev => {
      if (prev) {
        setSelectedFriends(new Set());
      }
      return !prev;
    });
  };

  const toggleFriendSelection = (friendId: number, friendshipId?: number) => {
    if (!friendshipId) return;
    setSelectedFriends(prev => {
      const next = new Set(prev);
      if (next.has(friendId)) {
        next.delete(friendId);
      } else {
        next.add(friendId);
      }
      return next;
    });
  };

  const selectAllFriends = () => {
    const allIds = chatList.filter(item => item.friendshipId).map(item => item.friend.id);
    setSelectedFriends(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedFriends(new Set());
  };

  const handleBulkUnfriend = async () => {
    if (selectedFriends.size === 0) return;

    const friendshipIdsToRemove = chatList
      .filter(item => selectedFriends.has(item.friend.id) && item.friendshipId)
      .map(item => item.friendshipId as number);

    if (friendshipIdsToRemove.length === 0) return;

    toast.custom((toastData) => (
      <div className={`max-w-sm w-full rounded-xl shadow-lg border ${toastData.visible ? 'animate-enter' : 'animate-leave'} bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-semibold">{t('chat.bulk.confirmUnfriend', { count: selectedFriends.size })}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('chat.bulk.unfriendHint', 'This action cannot be undone.')}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={() => toast.dismiss(toastData.id)} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            {t('actions.cancel')}
          </button>
          <button
            onClick={async () => {
              toast.dismiss(toastData.id);
              if (!onBulkRemoveFriends) return;
              setBulkActionLoading(true);
              try {
                await onBulkRemoveFriends(friendshipIdsToRemove);
                toast.success(t('chat.bulk.unfriendSuccess', { count: friendshipIdsToRemove.length }));
                setSelectedFriends(new Set());
                setIsSelectMode(false);
              } catch (e: any) {
                toast.error(e?.response?.data?.message || t('chat.bulk.unfriendFailed', 'Failed to remove friends'));
              } finally {
                setBulkActionLoading(false);
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            {t('actions.confirm', 'Confirm')}
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  const handleBulkBlock = async () => {
    if (selectedFriends.size === 0) return;

    const userIdsToBlock = Array.from(selectedFriends);

    toast.custom((toastData) => (
      <div className={`max-w-sm w-full rounded-xl shadow-lg border ${toastData.visible ? 'animate-enter' : 'animate-leave'} bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-semibold">{t('chat.bulk.confirmBlock', { count: selectedFriends.size })}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('chat.bulk.blockHint', 'Blocked users cannot message you.')}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={() => toast.dismiss(toastData.id)} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            {t('actions.cancel')}
          </button>
          <button
            onClick={async () => {
              toast.dismiss(toastData.id);
              if (!onBulkBlock) return;
              setBulkActionLoading(true);
              try {
                await onBulkBlock(userIdsToBlock);
                toast.success(t('chat.bulk.blockSuccess', { count: userIdsToBlock.length }));
                setSelectedFriends(new Set());
                setIsSelectMode(false);
                onRefreshBlockedUsers?.();
              } catch (e: any) {
                toast.error(e?.response?.data?.message || t('chat.bulk.blockFailed', 'Failed to block users'));
              } finally {
                setBulkActionLoading(false);
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            {t('actions.confirm', 'Confirm')}
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  const isLocked = !!e2eeEnabled && !e2eeUnlocked;
  return (
    <div className="h-full overflow-y-auto md-down:px-3 md-down:pb-24 md-down:pt-3">
      {/* Multi-select Toolbar */}
      {chatList.length > 0 && (onBulkRemoveFriends || onBulkBlock) && (
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 px-3 py-2 md-down:px-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectMode}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${isSelectMode
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent'
                  }`}
              >
                {isSelectMode ? (
                  <>
                    <X className="w-4 h-4" />
                    {t('chat.bulk.cancel', 'Cancel')}
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    {t('chat.bulk.select', 'Select')}
                  </>
                )}
              </button>

              {isSelectMode && (
                <>
                  <button
                    onClick={selectedFriends.size === chatList.filter(i => i.friendshipId).length ? clearSelection : selectAllFriends}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {selectedFriends.size === chatList.filter(i => i.friendshipId).length ? (
                      <>
                        <Square className="w-4 h-4" />
                        {t('chat.bulk.deselectAll', 'Deselect All')}
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-4 h-4" />
                        {t('chat.bulk.selectAll', 'Select All')}
                      </>
                    )}
                  </button>

                  {selectedFriends.size > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 px-2">
                      {t('chat.bulk.selected', { count: selectedFriends.size })}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Bulk Action Buttons */}
            {isSelectMode && selectedFriends.size > 0 && (
              <div className="flex items-center gap-2">
                {onBulkRemoveFriends && (
                  <button
                    onClick={handleBulkUnfriend}
                    disabled={bulkActionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                  >
                    <UserX className="w-4 h-4" />
                    {t('chat.bulk.unfriend', 'Unfriend')}
                  </button>
                )}
                {onBulkBlock && (
                  <button
                    onClick={handleBulkBlock}
                    disabled={bulkActionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4" />
                    {t('chat.bulk.block', 'Block')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat List when no chat is selected */}
      <div className="p-2 md-down:p-0 md-down:space-y-3">
        {/* Conversations List with previews */}
        {chatList.map((item: { friend: User; lastMessage: Message | null; unreadCount?: number; friendshipId?: number; isPinned?: boolean; nickname?: string | null }, index: number) => {
          const friend = item.friend;
          const displayName = (item as any).nickname && (item as any).nickname.trim().length > 0 ? (item as any).nickname : friend.name;
          const online = friends.find((f) => f.id === friend.id)?.isOnline ?? friend.isOnline;
          const preview = isLocked
            ? (lockedPlaceholder || t('chat.preview.locked', '🔒 Encrypted — unlock to preview'))
            : formatPreviewText(item.lastMessage, currentUserId, {
              recalled: t('chat.preview.recalled'),
              image: t('chat.preview.image'),
              file: t('chat.preview.file'),
              youPrefix: t('chat.preview.youPrefix'),
              noteShare: t('chat.preview.noteShare', 'Shared note') as string,
              callLog: {
                incomingVideo: t('chat.callLog.incomingVideo', 'Incoming video call') as string,
                incomingAudio: t('chat.callLog.incomingAudio', 'Incoming audio call') as string,
                outgoingVideo: t('chat.callLog.outgoingVideo', 'Outgoing video call') as string,
                outgoingAudio: t('chat.callLog.outgoingAudio', 'Outgoing audio call') as string,
                missedYou: t('chat.callLog.missedYou', 'Missed call') as string,
                youCancelled: t('chat.callLog.youCancelled', 'You cancelled the call') as string,
                cancelled: t('chat.callLog.cancelled', 'Call was cancelled') as string,
              }
            });
          const time = formatPreviewTime(item.lastMessage?.createdAt);
          const count = (unreadMap[friend.id] ?? item.unreadCount ?? 0) as number;
          const isUnread = count > 0;
          // Aggregate reactions of last message (any user, any type)
          const reactionCounts = (() => {
            const res: Record<string, number> = {};
            const list = Array.isArray(item.lastMessage?.Reactions) ? (item.lastMessage!.Reactions as any[]) : [];
            for (const r of list) {
              const key = r?.type;
              if (!key) continue;
              res[key] = (res[key] || 0) + Number(r?.count || 1);
            }
            return res;
          })();
          const reactionOrder = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
          const REACTION_EMOJI: Record<string, string> = { like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😡' };
          const reactionItems = reactionOrder
            .filter((k) => (reactionCounts[k] || 0) > 0)
            .map((k) => (
              <span key={k} className="inline-flex items-center gap-0.5">
                <span className={isUnread ? 'leading-none' : 'leading-none opacity-80'}>{REACTION_EMOJI[k]}</span>
                <span className={`text-[11px] leading-none ${isUnread ? 'font-semibold' : ''}`}>{reactionCounts[k]}</span>
              </span>
            ));
          const reactionContainerClass = `inline-flex items-center gap-1 text-xs ${isUnread ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300'}`;
          const previewClass = `text-sm truncate ${isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`;
          return (
            <LazyLoad
              key={friend.id}
              threshold={0.1}
              rootMargin="50px"
              animationDuration={400}
              delay={index * 30}
              reAnimate={true}
            >
              <div
                onClick={() => {
                  if (isSelectMode && item.friendshipId) {
                    toggleFriendSelection(friend.id, item.friendshipId);
                  } else {
                    onStartChat(friend);
                  }
                }}
                className={`flex items-center gap-3 p-3 md-down:p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors md-down:bg-white/80 md-down:dark:bg-gray-800/80 md-down:backdrop-blur md-down:shadow-sm md-down:border md-down:border-gray-200/60 md-down:dark:border-gray-700/60 md-down:mb-3 md-down:last:mb-0 ${isSelectMode && selectedFriends.has(friend.id) ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-300 dark:ring-blue-700' : ''
                  }`}
              >
                {/* Selection Checkbox */}
                {isSelectMode && item.friendshipId && (
                  <div className="flex-shrink-0">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedFriends.has(friend.id)
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      }`}>
                      {selectedFriends.has(friend.id) && (
                        <CheckSquare className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>
                )}

                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-md sm-down:w-10 sm-down:h-10">
                    {friend.avatar ? (
                      <img src={friend.avatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      (displayName || '').charAt(0)
                    )}
                  </div>
                  {online && !blockStatusMap[friend.id]?.blockedByMe && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  )}
                  {blockStatusMap[friend.id]?.blockedByMe && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                      <Ban className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[18px] text-center shadow">
                      {count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 md-down:space-y-0">
                  <div className="flex items-center justify-between gap-2 md-down:flex-nowrap md-down:gap-2">
                    <div className="flex items-center gap-1 md-down:w-full">
                      <p
                        className={`${isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'font-normal text-gray-800 dark:text-gray-300'} truncate leading-tight md-down:text-sm`}
                      >
                        {displayName}
                      </p>
                      {(item as any).isPinned || pinStatusMap[friend.id] ? (
                        <Pin className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1 md-down:w-full md-down:justify-end md-down:mt-0 md-down:leading-[0.9]">
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap md-down:text-[11px]">{time}</span>
                      {onRemoveFriend && item.friendshipId && (
                        <div className="relative">
                          <button
                            onClick={(e) => handleMenuToggle(friend.id, e)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          {openMenuId === friend.id && menuPos && createPortal(
                            <>
                              <div
                                className="fixed inset-0 z-[60]"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setMenuPos(null);
                                }}
                              />
                              <div
                                className="fixed z-[70] min-w-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
                                style={{ top: menuPos.top, right: menuPos.right }}
                              >
                                {/* Pin / Unpin */}
                                <button
                                  disabled={loadingPinFor === friend.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTogglePin(friend.id);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-60"
                                >
                                  {pinStatusMap[friend.id] ? (
                                    <>
                                      <PinOff className="w-4 h-4" />
                                      {t('chat.actions.unpin', 'Unpin')}
                                    </>
                                  ) : (
                                    <>
                                      <Pin className="w-4 h-4" />
                                      {t('chat.actions.pin', 'Pin')}
                                    </>
                                  )}
                                </button>
                                {/* Block / Unblock */}
                                <button
                                  disabled={loadingBlockFor === friend.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const status = blockStatusMap[friend.id];
                                    const isBlockedByMe = !!status?.blockedByMe;
                                    if (isBlockedByMe) {
                                      // Confirm unblocking
                                      toast.custom((toastData) => (
                                        <div className={`max-w-sm w-full rounded-xl shadow-lg border ${toastData.visible ? 'animate-enter' : 'animate-leave'} bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`}>
                                          <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                              <p className="font-semibold">{t('confirm.unblockUser', 'Unblock {{name}}?', { name: friend.name })}</p>
                                            </div>
                                          </div>
                                          <div className="mt-3 flex justify-end gap-2">
                                            <button onClick={() => toast.dismiss(toastData.id)} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                                              {t('actions.cancel')}
                                            </button>
                                            <button onClick={() => { handleUnblock(friend.id); toast.dismiss(toastData.id); }} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm">
                                              {t('actions.confirm', 'Confirm')}
                                            </button>
                                          </div>
                                        </div>
                                      ), { duration: 8000 });
                                    } else {
                                      // Confirm blocking
                                      toast.custom((toastData) => (
                                        <div className={`max-w-sm w-full rounded-xl shadow-lg border ${toastData.visible ? 'animate-enter' : 'animate-leave'} bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`}>
                                          <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                              <p className="font-semibold">{t('confirm.blockUser', 'Block {{name}}?', { name: friend.name })}</p>
                                              <p className="text-sm text-gray-600 dark:text-gray-300">{t('confirm.blockUserHint', 'You and this user will not be able to message each other.')}</p>
                                            </div>
                                          </div>
                                          <div className="mt-3 flex justify-end gap-2">
                                            <button onClick={() => toast.dismiss(toastData.id)} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                                              {t('actions.cancel')}
                                            </button>
                                            <button onClick={() => { handleBlock(friend.id); toast.dismiss(toastData.id); }} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm">
                                              {t('actions.confirm', 'Confirm')}
                                            </button>
                                          </div>
                                        </div>
                                      ), { duration: 8000 });
                                    }
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-60"
                                >
                                  <Ban className="w-4 h-4" />
                                  {blockStatusMap[friend.id]?.blockedByMe ? t('chat.actions.unblock', 'Unblock') : t('chat.actions.block', 'Block')}
                                </button>
                                {onDeleteMessages && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toast.custom((toastData) => (
                                        <div className={`max-w-sm w-full rounded-xl shadow-lg border ${toastData.visible ? 'animate-enter' : 'animate-leave'} bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`}>
                                          <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                              <p className="font-semibold">{t('confirm.deleteMessages', { name: friend.name })}</p>
                                            </div>
                                          </div>
                                          <div className="mt-3 flex justify-end gap-2">
                                            <button
                                              onClick={() => toast.dismiss(toastData.id)}
                                              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                                            >
                                              {t('actions.cancel')}
                                            </button>
                                            <button
                                              onClick={() => {
                                                onDeleteMessages(friend.id, friend.name);
                                                toast.dismiss(toastData.id);
                                              }}
                                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
                                            >
                                              {t('actions.delete')}
                                            </button>
                                          </div>
                                        </div>
                                      ), { duration: 8000 });
                                      setOpenMenuId(null);
                                      setMenuPos(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    {t('chat.actions.deleteMessages')}
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.friendshipId) {
                                      toast.custom((toastData) => (
                                        <div className={`max-w-sm w-full rounded-xl shadow-lg border ${toastData.visible ? 'animate-enter' : 'animate-leave'} bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`}>
                                          <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                              <p className="font-semibold">{t('confirm.removeFriend', { name: friend.name })}</p>
                                            </div>
                                          </div>
                                          <div className="mt-3 flex justify-end gap-2">
                                            <button
                                              onClick={() => toast.dismiss(toastData.id)}
                                              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                                            >
                                              {t('actions.cancel')}
                                            </button>
                                            <button
                                              onClick={() => {
                                                onRemoveFriend(item.friendshipId as number, friend.name);
                                                toast.dismiss(toastData.id);
                                              }}
                                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
                                            >
                                              {t('actions.delete')}
                                            </button>
                                          </div>
                                        </div>
                                      ), { duration: 8000 });
                                    }
                                    setOpenMenuId(null);
                                    setMenuPos(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <UserX className="w-4 h-4" />
                                  {t('chat.actions.removeFriend')}
                                </button>
                              </div>
                            </>,
                            document.body
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 md-down:mt-1 md-down:flex-nowrap md-down:gap-1 min-w-0">
                    {reactionItems.length > 0 && (
                      <div className={`${reactionContainerClass} md-down:text-[11px]`}>
                        {reactionItems}
                      </div>
                    )}
                    <p className={`${previewClass} md-down:text-xs md-down:max-w-full leading-snug flex-1 min-w-0`}>{preview}</p>
                  </div>
                </div>
              </div>
            </LazyLoad>
          );
        })}

        {/* Empty State */}
        {chatList.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">{t('chat.chatList.empty.noChats')}</p>
            <p className="text-sm text-gray-400">{t('chat.chatList.empty.addFriends')}</p>
          </div>
        )}
      </div>
    </div>
  );
});

ChatList.displayName = 'ChatList';

export default ChatList;


