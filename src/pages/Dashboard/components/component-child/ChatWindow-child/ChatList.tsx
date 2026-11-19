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
import './chat-tabs.css';

const ChatList = memo(({ chatList, friends, currentUserId, onStartChat, onRemoveFriend, onDeleteMessages, onRefreshChatList, onRefreshBlockedUsers, onBulkRemoveFriends, onBulkBlock }: ChatListProps) => {
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
          <button onClick={() => toast.remove(toastData.id)} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            {t('actions.cancel')}
          </button>
          <button
            onClick={async () => {
              toast.remove(toastData.id);
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
          <button onClick={() => toast.remove(toastData.id)} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            {t('actions.cancel')}
          </button>
          <button
            onClick={async () => {
              toast.remove(toastData.id);
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

  return (
    <div className="ct ct-scroll h-full">
      {/* Multi-select Toolbar: split controls and destructive actions into separate responsive rows. */}
      {chatList.length > 0 && (onBulkRemoveFriends || onBulkBlock) && (
        <div className="ct-bar">
          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectMode}
                disabled={bulkActionLoading}
                aria-pressed={isSelectMode}
                className={`ct-btn ${isSelectMode ? 'ct-btn--on' : ''}`}
              >
                {isSelectMode ? (
                  <>
                    <X className="h-4 w-4 shrink-0" />
                    <span>{t('chat.bulk.cancel', 'Cancel')}</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 shrink-0" />
                    <span>{t('chat.bulk.select', 'Select')}</span>
                  </>
                )}
              </button>

              {isSelectMode && (
                <>
                  <button
                    type="button"
                    onClick={selectedFriends.size > 0 && selectedFriends.size === chatList.filter(item => item.friendshipId).length ? clearSelection : selectAllFriends}
                    disabled={bulkActionLoading}
                    className="ct-btn ct-btn--ghost"
                  >
                    {selectedFriends.size > 0 && selectedFriends.size === chatList.filter(item => item.friendshipId).length ? (
                      <>
                        <Square className="h-4 w-4 shrink-0" />
                        <span>{t('chat.bulk.deselectAll', 'Deselect All')}</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 shrink-0" />
                        <span>{t('chat.bulk.selectAll', 'Select All')}</span>
                      </>
                    )}
                  </button>

                  {selectedFriends.size > 0 && (
                    <span
                      role="status"
                      aria-live="polite"
                      className="ct-pill-count"
                    >
                      {t('chat.bulk.selected', { count: selectedFriends.size })}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Bulk actions always get their own row, and wrap on very narrow screens. */}
            {isSelectMode && selectedFriends.size > 0 && (
              <div className="flex w-full min-w-0 flex-wrap items-stretch gap-2">
                {onBulkRemoveFriends && (
                  <button
                    type="button"
                    onClick={handleBulkUnfriend}
                    disabled={bulkActionLoading}
                    className="ct-btn ct-btn--danger ct-btn--grow"
                  >
                    <UserX className="h-4 w-4 shrink-0" />
                    <span>{t('chat.bulk.unfriend', 'Unfriend')}</span>
                  </button>
                )}
                {onBulkBlock && (
                  <button
                    type="button"
                    onClick={handleBulkBlock}
                    disabled={bulkActionLoading}
                    className="ct-btn ct-btn--grow"
                  >
                    <Ban className="h-4 w-4 shrink-0" />
                    <span>{t('chat.bulk.block', 'Block')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Chat List when no chat is selected */}
      <div className="ct-list">
        {/* Conversations List with previews */}
        {chatList.map((item: { friend: User; lastMessage: Message | null; friendshipId?: number; isPinned?: boolean; nickname?: string | null }, index: number) => {
          const friend = item.friend;
          const displayName = (item as any).nickname && (item as any).nickname.trim().length > 0 ? (item as any).nickname : friend.name;
          const online = friends.find((f) => f.id === friend.id)?.isOnline ?? friend.isOnline;
          const preview = formatPreviewText(item.lastMessage, currentUserId, {
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
                <span className={'leading-none opacity-80'}>{REACTION_EMOJI[k]}</span>
                <span className={`text-[11px] leading-none ${''}`}>{reactionCounts[k]}</span>
              </span>
            ));
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
                className={`ct-row ${isSelectMode && selectedFriends.has(friend.id) ? 'ct-row--sel' : ''
                  }`}
              >
                {/* Selection Checkbox */}
                {isSelectMode && item.friendshipId && (
                  <div className="flex-shrink-0">
                    <div className="ct-check" data-on={selectedFriends.has(friend.id) ? 'true' : 'false'}>
                      {selectedFriends.has(friend.id) && (
                        <CheckSquare className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>
                )}

                <div className="ct-avatar-wrap">
                  <div className="ct-avatar">
                    {friend.avatar ? (
                      <img src={friend.avatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      (displayName || '').charAt(0)
                    )}
                  </div>
                  {online && !blockStatusMap[friend.id]?.blockedByMe && (
                    <div className="ct-dot"></div>
                  )}
                  {blockStatusMap[friend.id]?.blockedByMe && (
                    <div className="ct-dot ct-dot--blocked">
                      <Ban className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="ct-body">
                  <div className="ct-line">
                    <div className="ct-name">
                      <p
                        className="ct-name-text"
                      >
                        {displayName}
                      </p>
                      {(item as any).isPinned || pinStatusMap[friend.id] ? (
                        <Pin className="ct-pin w-3.5 h-3.5" />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="ct-time">{time}</span>
                      {onRemoveFriend && item.friendshipId && (
                        <div className="relative">
                          <button
                            onClick={(e) => handleMenuToggle(friend.id, e)}
                            className="ct-icon-btn"
                          >
                            <MoreVertical className="w-4 h-4" />
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
                                className="ct-menu fixed z-[70]"
                                style={{ top: menuPos.top, right: menuPos.right }}
                              >
                                {/* Pin / Unpin */}
                                <button
                                  disabled={loadingPinFor === friend.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTogglePin(friend.id);
                                  }}
                                  className="ct-menu-item"
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
                                            <button onClick={() => toast.remove(toastData.id)} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                                              {t('actions.cancel')}
                                            </button>
                                            <button onClick={() => { handleUnblock(friend.id); toast.remove(toastData.id); }} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm">
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
                                            <button onClick={() => toast.remove(toastData.id)} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                                              {t('actions.cancel')}
                                            </button>
                                            <button onClick={() => { handleBlock(friend.id); toast.remove(toastData.id); }} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm">
                                              {t('actions.confirm', 'Confirm')}
                                            </button>
                                          </div>
                                        </div>
                                      ), { duration: 8000 });
                                    }
                                  }}
                                  className="ct-menu-item"
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
                                              onClick={() => toast.remove(toastData.id)}
                                              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                                            >
                                              {t('actions.cancel')}
                                            </button>
                                            <button
                                              onClick={() => {
                                                onDeleteMessages(friend.id, friend.name);
                                                toast.remove(toastData.id);
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
                                    className="ct-menu-item ct-menu-item--warn"
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
                                              onClick={() => toast.remove(toastData.id)}
                                              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                                            >
                                              {t('actions.cancel')}
                                            </button>
                                            <button
                                              onClick={() => {
                                                onRemoveFriend(item.friendshipId as number, friend.name);
                                                toast.remove(toastData.id);
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
                                  className="ct-menu-item ct-menu-item--danger"
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
                  <div className="ct-preview">
                    {reactionItems.length > 0 && (
                      <div className="ct-reacts">
                        {reactionItems}
                      </div>
                    )}
                    <p className="flex-1">{preview}</p>
                  </div>
                </div>
              </div>
            </LazyLoad>
          );
        })}

        {/* Empty State */}
        {chatList.length === 0 && (
          <div className="ct-empty">
            <span className="ct-empty-icon"><MessageCircle className="w-8 h-8" strokeWidth={1.7} /></span>
            <p className="ct-empty-title">{t('chat.chatList.empty.noChats')}</p>
            <p className="ct-empty-desc">{t('chat.chatList.empty.addFriends')}</p>
          </div>
        )}
      </div>
    </div>
  );
});

ChatList.displayName = 'ChatList';

export default ChatList;


