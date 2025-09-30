import { Reply, Pin, MoreVertical, Video, Phone } from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import MessageStatus from './MessageStatus';
import ReactionDetailsModal from './ReactionDetailsModal';
import type { MessageBubbleProps } from '../../interface/MessageBubble.interface';
import { chatService } from '@/services/chatService';
import { groupService } from '@/services/groupService';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useOptionalCall } from '@/contexts/CallContext';
import SharedNoteCard from './SharedNoteCard';

const MessageBubble = ({
  message,
  isOwnMessage,
  isRecalled = false,
  menuOpenKey,
  messageKey,
  showMenu,
  currentUserId,
  allMessages,
  onMenuToggle,
  onRecallMessage,
  onEditMessage,
  onDownloadAttachment,
  onPreviewImage,
  pinnedIdSet,
  onTogglePinMessage,
  onOpenProfile,
  disableReactions,
  onReplyMessage,
  onJumpToMessage,
}: MessageBubbleProps) => {
  const { t } = useTranslation('dashboard');
  // Call controls for redial from call-log cards (optional)
  const callCtx = useOptionalCall();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>(String(message.content || ''));
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState<Array<{ userId: number; type: any }>>(message.Reactions || []);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const myTypes = useMemo<string[]>(() => {
    const list = Array.isArray(message.Reactions) ? message.Reactions : [];
    return list.filter((r: any) => r.userId === currentUserId).map((r: any) => r.type);
  }, [message.Reactions, currentUserId]);
  // No local burst counting; rely on server-persisted counts for accuracy
  const [floatItems, setFloatItems] = useState<Array<{ id: number; emoji: string; dx: number }>>([]);
  const floatItemsRef = useRef<Array<{ id: number; emoji: string; dx: number }>>([]);
  useEffect(() => { floatItemsRef.current = floatItems; }, [floatItems]);
  const EMOJI: Record<'like'|'love'|'haha'|'wow'|'sad'|'angry', string> = {
    like: '👍',
    love: '❤️',
    haha: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😡',
  };
  
  // Clear my specific reaction type (and reset local burst for that type)
  const clearMyReactionType = async (type: 'like'|'love'|'haha'|'wow'|'sad'|'angry') => {
    try {
      setReactions(prev => (Array.isArray(prev) ? prev.filter(r => !(r.userId === currentUserId && r.type === type)) : prev));
      if (message.groupId) await groupService.unreactGroupMessage(message.groupId, message.id, type);
      else await chatService.unreactMessage(message.id, type);
    } catch {}
  };

  // Resolve display name for tooltips from available data
  const resolveUserName = (uid: number): string => {
    if (uid === currentUserId) return 'Bạn';
    if ((message as any)?.sender?.id === uid) return (message as any).sender.name || `User ${uid}`;
    if ((message as any)?.receiver?.id === uid) return (message as any).receiver.name || `User ${uid}`;
    const found = (allMessages || []).find((m: any) => (m?.sender?.id === uid) || (m as any)?.receiver?.id === uid) as any;
    if (found?.sender?.id === uid && found?.sender?.name) return found.sender.name as string;
    if ((found as any)?.receiver?.id === uid && (found as any)?.receiver?.name) return (found as any).receiver.name as string;
    return `User ${uid}`;
  };

  // Resolve user info for modal list
  const resolveUserInfo = (uid: number) => {
    if (uid === currentUserId) return { id: uid, name: 'Bạn', avatar: undefined };
    if ((message as any)?.sender?.id === uid) {
      return { id: uid, name: (message as any).sender.name, avatar: (message as any).sender.avatar };
    }
    if ((message as any)?.receiver?.id === uid) {
      return { id: uid, name: (message as any).receiver.name, avatar: (message as any).receiver.avatar };
    }
    const found = (allMessages || []).find((m: any) => (m?.sender?.id === uid) || (m as any)?.receiver?.id === uid) as any;
    if (found?.sender?.id === uid) return { id: uid, name: found.sender.name, avatar: (found.sender as any)?.avatar };
    if ((found as any)?.receiver?.id === uid) return { id: uid, name: (found as any).receiver.name, avatar: (found as any).receiver?.avatar };
    return { id: uid, name: `User ${uid}`, avatar: undefined };
  };

  // Keep local state in sync when parent updates message (e.g., via sockets)
  useEffect(() => {
    const list = message.Reactions || [];
    setReactions(list);
    // myTypes is derived via useMemo
  }, [message.Reactions, message.id, currentUserId]);

  const handleReact = async (next: any | null, allowBurst = false) => {
    if (disableReactions) return;
    try {
      // For repeated same-type clicks, optimistically increment count and still call backend
      if (allowBurst && next && myTypes.includes(next)) {
        setReactions(prev => {
          const list = Array.isArray(prev) ? prev : [];
          const idx = list.findIndex(r => r.userId === currentUserId && r.type === next);
          if (idx >= 0) {
            const updated = [...list];
            const prevCount = Number((updated[idx] as any).count || 1);
            updated[idx] = { ...updated[idx], count: prevCount + 1 } as any;
            return updated as any;
          }
          return [...list, { userId: currentUserId as number, type: next, count: 1 }];
        });
        // proceed to backend call below
      }

      // Optimistic update only if adding same type or still under 3
      if (next == null) {
        setReactions(prev => (Array.isArray(prev) ? prev.filter(r => r.userId !== currentUserId) : prev));
      } else if (myTypes.includes(next) || myTypes.length < 3) {
        setReactions(prev => {
          const list = Array.isArray(prev) ? prev : [];
          const idx = list.findIndex(r => r.userId === currentUserId && r.type === next);
          if (idx >= 0) return list; // already optimistically incremented above for burst
          return [...list, { userId: currentUserId as number, type: next, count: 1 }];
        });
      }

      if (message.groupId) {
        if (next == null) await groupService.unreactGroupMessage(message.groupId, message.id);
        else await groupService.reactGroupMessage(message.groupId, message.id, next);
      } else {
        if (next == null) await chatService.unreactMessage(message.id);
        else await chatService.reactMessage(message.id, next);
      }
    } catch (_err) {
      // rollback UI on error could be added; minimal toast for now
      // no toast to keep UI clean; server socket will resync
    }
  };
  
  // Robust burst queue so heavy repetitions are not dropped
  const burstQueueRef = useRef<Record<string, number>>({});
  const drainTimerRef = useRef<number | null>(null);
  const SPAWN_CAP = 5; // allow more concurrent for smoother heavy bursts

  const spawnInternal = (emoji: string) => {
    const id = Date.now() + Math.random();
    const dx = Math.round(Math.random() * 24 - 12);
    setFloatItems((prev) => [...prev, { id, emoji, dx }]);
    window.setTimeout(() => {
      setFloatItems((prev) => prev.filter((it) => it.id !== id));
    }, 950);
  };

  const startDrain = () => {
    if (drainTimerRef.current) return;
    drainTimerRef.current = window.setInterval(() => {
      const keys = Object.keys(burstQueueRef.current);
      if (keys.length === 0) {
        if (drainTimerRef.current) { window.clearInterval(drainTimerRef.current); drainTimerRef.current = null; }
        return;
      }
      let anySpawned = false;
      for (const k of keys) {
        const pending = burstQueueRef.current[k] || 0;
        if (pending <= 0) continue;
        const concurrent = floatItemsRef.current.filter((it) => it.emoji === k).length;
        const allow = Math.max(0, SPAWN_CAP - concurrent);
        if (allow <= 0) continue;
        const take = Math.min(allow, pending);
        for (let i = 0; i < take; i++) spawnInternal(k);
        burstQueueRef.current[k] = pending - take;
        anySpawned = anySpawned || take > 0;
      }
      // If all drained, stop timer
      if (!anySpawned && Object.values(burstQueueRef.current).every((v) => (v || 0) <= 0)) {
        if (drainTimerRef.current) { window.clearInterval(drainTimerRef.current); drainTimerRef.current = null; }
      }
    }, 60);
  };

  const enqueueBurst = (emoji: string, count = 1) => {
    if (disableReactions) return;
    burstQueueRef.current[emoji] = (burstQueueRef.current[emoji] || 0) + Math.max(1, count);
    startDrain();
  };
  
  // Show burst animation when another client reacts (cross-client)
  useEffect(() => {
    const onBurst = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as { messageId: number; type: 'like'|'love'|'haha'|'wow'|'sad'|'angry'; count?: number };
        if (!detail || Number(detail.messageId) !== Number(message.id)) return;
        const emoji = EMOJI[detail.type as keyof typeof EMOJI];
        const n = Math.max(1, Number(detail.count || 1));
        if (emoji) enqueueBurst(emoji, n);
      } catch {}
    };
    if (typeof window !== 'undefined') window.addEventListener('reaction_burst', onBurst as any);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('reaction_burst', onBurst as any); };
  }, [message.id]);
  const isPinned = (() => {
    if (!message?.id) return false;
    if (!Array.isArray(pinnedIdSet) && !(pinnedIdSet instanceof Set)) return false;
    if (Array.isArray(pinnedIdSet)) return pinnedIdSet.includes(message.id as any);
    return (pinnedIdSet as Set<number>).has(message.id as any);
  })();
  
  // Check if this is a shared message (shared note)
  const isSharedMessage = typeof message.content === 'string' && message.content.startsWith('NOTE_SHARE::');
  const renderImageMessage = () => (
    <div
      className={`px-2.5 py-2 rounded-2xl w-fit ${
        isOwnMessage
          ? 'bg-blue-600 text-white rounded-br-md'
          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
      }`}
    >
      <div className="relative">
        <img
          src={message.content}
          alt={t('chat.message.imageAlt')}
          onClick={() => onPreviewImage(message.content)}
          className="w-40 h-40 cursor-zoom-in rounded-xl object-cover"
        />
        <button
          type="button"
          className="absolute bottom-1 right-1 z-10 p-1 rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"
          aria-label={t('chat.attachment.downloadImageAria')}
          title={t('chat.attachment.downloadImageTitle')}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDownloadAttachment(message.content); }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 14a1 1 0 011-1h2.586l1.707 1.707a1 1 0 001.414 0L11.414 13H14a1 1 0 011 1v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z" />
            <path d="M7 3a1 1 0 011-1h4a1 1 0 011 1v6h1.586a1 1 0 01.707 1.707l-4.586 4.586a1 1 0 01-1.414 0L4.707 10.707A1 1 0 015.414 9H7V3z" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderFileMessage = () => (
    <div
      className={`px-2.5 py-2 rounded-2xl w-fit ${
        isOwnMessage
          ? 'bg-blue-600 text-white rounded-br-md'
          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
      }`}
    >
      <button
        type="button"
        onClick={() => onDownloadAttachment(message.content)}
        className={`flex items-center gap-2 px-1 py-1 rounded-md bg-transparent text-current w-full text-left`}
        title={t('chat.attachment.downloadFileTitle')}
        aria-label={t('chat.attachment.downloadFileAria')}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 2a1 1 0 00-1 1v2H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2V3a1 1 0 10-2 0v2H9V3a1 1 0 00-1-1z" />
        </svg>
        <span className="truncate max-w-[220px]">{(() => { try { const u = new URL(message.content); return decodeURIComponent(u.pathname.split('/').pop() || t('chat.attachment.fileFallback')); } catch { return message.content; } })()}</span>
        <span className="ml-auto inline-flex items-center gap-1 text-xs opacity-80">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 14a1 1 0 011-1h2.586l1.707 1.707a1 1 0 001.414 0L11.414 13H14a1 1 0 011 1v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z" />
            <path d="M7 3a1 1 0 011-1h4a1 1 0 011 1v6h1.586a1 1 0 01.707 1.707l-4.586 4.586a1 1 0 01-1.414 0L4.707 10.707A1 1 0 015.414 9H7V3z" />
          </svg>
          {t('chat.attachment.downloadLabel')}
        </span>
      </button>
    </div>
  );

  const renderTextMessage = () => (
    (() => {
      // Detect shared note payload encoded as NOTE_SHARE::<uri-encoded json>
      const prefix = 'NOTE_SHARE::';
      if (typeof message.content === 'string' && message.content.startsWith(prefix)) {
        try {
          const raw = message.content.slice(prefix.length);
          const obj = JSON.parse(decodeURIComponent(raw));
          if (obj && (obj.type === 'note' || obj.v === 1)) {
            const note = obj as { id: number; title: string; content?: string; imageUrl?: string | null; category: string; priority: 'low'|'medium'|'high'; createdAt: string };
            return (
              <SharedNoteCard 
                note={note} 
                isOwnMessage={isOwnMessage}
              />
            );
          }
        } catch {}
      }

      // Detect call log payload encoded as CALL_LOG::<uri-encoded json>
      const callPrefix = 'CALL_LOG::';
      if (typeof message.content === 'string' && message.content.startsWith(callPrefix)) {
        try {
          const raw = message.content.slice(callPrefix.length);
          const obj = JSON.parse(decodeURIComponent(raw));
          const media: 'audio'|'video' = obj.media === 'video' ? 'video' : 'audio';
          const direction: 'incoming'|'outgoing' = obj.direction === 'incoming' ? 'incoming' : 'outgoing';
          // Show direction from the current viewer's perspective
          const viewDir: 'incoming'|'outgoing' = isOwnMessage ? direction : (direction === 'incoming' ? 'outgoing' : 'incoming');
          const result: 'answered'|'missed'|'cancelled' = (['answered','missed','cancelled'].includes(obj.result) ? obj.result : 'answered');
          const durationSec: number | undefined = typeof obj.durationSec === 'number' ? obj.durationSec : undefined;
          const otherId = isOwnMessage ? (message as any).receiverId : (message as any).senderId;
          // Duration text
          const fmtDuration = (sec?: number) => {
            if (!sec || sec <= 0) return null;
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            return (
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                {media === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                <span>{String(t('chat.callLog.duration', { m, s, defaultValue: `${m} minutes ${s} seconds` } as any))}</span>
              </div>
            );
          };
          const header = (() => {
            if (result === 'missed') return (
              isOwnMessage
                ? <span className="font-semibold">{media === 'video' ? t('chat.callLog.incomingVideo', 'Cuộc gọi video đến') : t('chat.callLog.incomingAudio', 'Cuộc gọi thoại đến')}</span>
                : <span className="text-red-600 dark:text-red-400 font-semibold">{t('chat.callLog.missedYou', 'Bạn bị nhỡ')}</span>
            );
            if (result === 'cancelled') return (
              <span className={`${isOwnMessage ? 'text-red-600 dark:text-red-400' : ''} font-semibold`}>
                {isOwnMessage ? t('chat.callLog.youCancelled', 'Bạn đã hủy cuộc gọi') : t('chat.callLog.cancelled', 'Cuộc gọi đã bị hủy')}
              </span>
            );
            if (viewDir === 'incoming') return <span className="font-semibold">{media === 'video' ? t('chat.callLog.incomingVideo', 'Cuộc gọi video đến') : t('chat.callLog.incomingAudio', 'Cuộc gọi thoại đến')}</span>;
            return <span className="font-semibold">{media === 'video' ? t('chat.callLog.outgoingVideo', 'Cuộc gọi video đi') : t('chat.callLog.outgoingAudio', 'Cuộc gọi thoại đi')}</span>;
          })();
          const label = media === 'video' ? t('chat.callLog.video', 'Cuộc gọi video') : t('chat.callLog.audio', 'Cuộc gọi thoại');
          return (
            <div className={`w-[200px] md:w-[220px] bg-white/80 dark:bg-gray-800/90 backdrop-blur rounded-xl p-3 border ${result === 'missed' ? 'border-red-200 dark:border-red-900/40' : 'border-white/20 dark:border-gray-700/30'} ${isOwnMessage ? 'rounded-br-md' : 'rounded-bl-md'} shadow-sm`}
                 role="group" aria-label="call-log">
              <div className="text-gray-900 dark:text-white mb-0.5 flex items-center gap-1.5 text-sm">
                {media === 'video' ? <Video className={`w-3.5 h-3.5 ${result==='missed' ? 'text-red-600 dark:text-red-400' : 'text-blue-600'}`} /> : <Phone className={`w-3.5 h-3.5 ${result==='missed' ? 'text-red-600 dark:text-red-400' : 'text-blue-600'}`} />}
                {header}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                {media === 'video' ? <Video className="w-3.5 h-3.5 opacity-70" /> : <Phone className="w-3.5 h-3.5 opacity-70" />}
                <span>{label}</span>
              </div>
              {fmtDuration(durationSec)}
              <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      const id = Number(otherId);
                      if (!id) return;
                      if (!callCtx) return;
                      if (media === 'video') callCtx.startVideoCall && callCtx.startVideoCall({ id, name: (message as any)?.receiver?.name || (message as any)?.sender?.name || `User ${id}`, avatar: ((message as any)?.receiver?.avatar || (message as any)?.sender?.avatar) || null });
                      else callCtx.startCall({ id, name: (message as any)?.receiver?.name || (message as any)?.sender?.name || `User ${id}`, avatar: ((message as any)?.receiver?.avatar || (message as any)?.sender?.avatar) || null });
                    } catch {}
                  }}
                >
                  {t('chat.callLog.redial', 'Gọi lại')}
                </button>
              </div>
            </div>
          );
        } catch {}
      }

      return (
        <>
          {isEditing ? (
            <div className={`w-full max-w-[420px] ${isOwnMessage ? '' : ''}`}>
              <textarea
                className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 ${
                  isOwnMessage
                    ? 'border-blue-300 focus:ring-blue-400'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-gray-400'
                }`}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={3}
                autoFocus
              />
              <div className="mt-2 flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  onClick={async () => {
                    const val = editValue?.trim();
                    if (!val) return;
                    await onEditMessage(message, val);
                    setIsEditing(false);
                    onMenuToggle(null);
                  }}
                >
                  {t('chat.menu.save', 'Lưu')}
                </button>
                <button
                  className="px-3 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm"
                  onClick={() => { setIsEditing(false); setEditValue(String(message.content)); onMenuToggle(null); }}
                >
                  {t('chat.menu.cancel', 'Hủy')}
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`px-3 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap w-fit ${
                isOwnMessage
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
              }`}
            >
              {/* Quoted inside bubble if text + has reply */}
              {(() => {
                const replyTo = (message as any)?.replyToMessage;
                if (!replyTo) return null;
                const handleJump = () => { if (onJumpToMessage && replyTo?.id) onJumpToMessage(Number(replyTo.id)); };
                return (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleJump(); }}
                    className="mb-1.5 w-full text-left px-2.5 py-1.5 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/55 border-l-4 border-blue-500 text-[13px] transition-colors"
                    title={t('chat.reply.jumpToMessage', 'Đi tới tin nhắn gốc')}
                    aria-label={t('chat.reply.jumpToMessage', 'Đi tới tin nhắn gốc')}
                  >
                    <div className="font-semibold text-blue-800 dark:text-blue-200 mb-0.5">
                      {replyTo.sender?.name || `User ${replyTo.senderId}`}
                    </div>
                    <div className="text-blue-800/90 dark:text-blue-200/90 line-clamp-2">
                      {replyTo.messageType === 'image' ? '📷 Hình ảnh' :
                       replyTo.messageType === 'file' ? '📎 Tệp đính kèm' :
                       replyTo.content}
                    </div>
                  </button>
                );
              })()}

              {/* Main text content */}
              <div>{message.content}</div>
            </div>
          )}
        </>
      );
    })()
  );

  const renderRecalledMessage = () => (
    <div className={`px-4 py-2 rounded-2xl text-xs italic text-gray-500 bg-gray-100 dark:bg-gray-700 ${isOwnMessage ? 'rounded-br-md' : 'rounded-bl-md'} shadow-sm`}>
      {message.messageType === 'image' ? t('chat.recalled.image') : message.messageType === 'file' ? t('chat.recalled.file') : t('chat.recalled.text')}
    </div>
  );

  const renderQuotedMessage = () => {
    const replyTo = (message as any)?.replyToMessage;
    if (!replyTo) return null;
    // Avoid outer quoted block for text messages; it is rendered inside bubble above
    if (message.messageType === 'text') return null;
    
    const handleJump = () => {
      if (onJumpToMessage && replyTo?.id) onJumpToMessage(Number(replyTo.id));
    };

    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); handleJump(); }}
        className={`mb-2 w-full text-left px-3 py-2 rounded-lg border-l-4 border-blue-500 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/55 text-sm transition-colors`}
        title={t('chat.reply.jumpToMessage', 'Đi tới tin nhắn gốc')}
        aria-label={t('chat.reply.jumpToMessage', 'Đi tới tin nhắn gốc')}
      >
        <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
          {replyTo.sender?.name || `User ${replyTo.senderId}`}
        </div>
        <div className="text-blue-800/90 dark:text-blue-200/90 line-clamp-2">
          {replyTo.messageType === 'image' ? '📷 Hình ảnh' :
           replyTo.messageType === 'file' ? '📎 Tệp đính kèm' :
           replyTo.content}
        </div>
      </button>
    );
  };

  const renderContent = () => {
    if (isRecalled) {
      return renderRecalledMessage();
    }

    return (
      <div>
        {renderQuotedMessage()}
        {(() => {
          switch (message.messageType) {
            case 'image':
              return renderImageMessage();
            case 'file':
              return renderFileMessage();
            default:
              return renderTextMessage();
          }
        })()}
      </div>
    );
  };

  return (
    <Tooltip.Provider delayDuration={150} skipDelayDuration={250}>
    <div id={`message-${message.id}`} className={`relative group ${isOwnMessage ? 'flex justify-end' : 'flex justify-start'}`}
         onMouseLeave={() => setShowReactions(false)}>
      <div className="relative">
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {renderContent()}
          {isPinned && (
            <div className={`mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${isOwnMessage ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
              <Pin className="w-3 h-3" />
              {t('chat.menu.pinned', 'Đã ghim')}
            </div>
          )}
          {/* Aggregated reactions display */}
          {Array.isArray(reactions) && reactions.length > 0 && (
            <div
              className={`mt-1 inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 border ${isOwnMessage ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200'} cursor-pointer select-none`}
              onClick={() => setShowReactionModal(true)}
              role="button"
              aria-label={String(t('chat.reactions.modal.title', { defaultValue: 'Reactions' } as any))}
            >
            {(() => {
              const counts: Record<string, number> = {};
              for (const r of reactions) counts[r.type] = (counts[r.type] || 0) + Number((r as any).count || 1);
              const order = ['like','love','haha','wow','sad','angry'];
              return order
                .filter(k => (counts[k] || 0))
                .map((k) => {
                  const total = counts[k] || 0;
                  // Tooltip: list users who reacted of this type
                  const users = reactions
                    .filter(r => r.type === k)
                    .map(r => (r.userId === currentUserId ? 'Bạn' : resolveUserName(r.userId)));
                  const title = users.length > 0 
                    ? String(t('chat.reactions.tooltip.reactedBy', { names: users.join(', '), defaultValue: `${users.join(', ')} reacted` } as any))
                    : String(t('chat.reactions.tooltip.default', { defaultValue: 'Reacted' } as any));
                  return (
                    <Tooltip.Root key={k}>
                      <Tooltip.Trigger asChild>
                        <span className={myTypes.includes(k) ? 'font-semibold' : ''}>
                          {EMOJI[k as keyof typeof EMOJI]} {total}
                        </span>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content side="top" align="center" className="z-50 select-none rounded-md bg-black/80 px-2 py-1 text-xs text-white shadow-md">
                          {title}
                          <Tooltip.Arrow className="fill-black/80" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  );
                });
            })()}
          </div>
        )}
          <MessageStatus 
            message={message} 
            isOwnMessage={isOwnMessage} 
            currentUserId={currentUserId}
            allMessages={allMessages}
          />
        </div>
      </div>
      {/* Reply button - positioned to the left of message */}
      {!isRecalled && onReplyMessage && (
        <button
          type="button"
          className={`absolute ${isOwnMessage ? '-left-8' : '-left-8'} top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-700`}
          onClick={() => onReplyMessage(message)}
          title={t('chat.reply.button', 'Trả lời tin nhắn')}
          aria-label={t('chat.reply.button', 'Trả lời tin nhắn')}
        >
          <Reply className="w-4 h-4" />
        </button>
      )}

      {/* Reaction trigger */}
      {!isRecalled && !disableReactions && (
        <div className={`absolute ${isOwnMessage ? 'right-0' : 'left-0'} -bottom-3 flex ${isOwnMessage ? 'flex-row-reverse' : ''} items-center gap-2`}>
          {/* Quick heart */}
          <button
            type="button"
            className="p-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow text-sm opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
            onMouseEnter={() => setShowReactions(true)}
            onFocus={() => setShowReactions(true)}
            onClick={() => {
              const already = myTypes.includes('love');
              handleReact('love', already);
              enqueueBurst('❤️', 1);
            }}
            title={String(t('chat.reactions.types.love', { defaultValue: 'Love' } as any))}
            aria-label={String(t('chat.reactions.types.love', { defaultValue: 'Love' } as any))}
          >
            <span className="inline-block text-xs">❤️</span>
          </button>

          {/* Emoji picker on hover */}
          {showReactions && !disableReactions && (
            <div className={`relative z-50 px-2 py-1 rounded-2xl shadow-lg border ${isDarkMode() ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'}`}
                 onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
              <div className="flex items-center gap-2">
                {(['like','love','haha','wow','sad','angry'] as const).map((k) => {
                  const label = String(t(`chat.reactions.types.${k}`, { defaultValue: k } as any));
                  return (
                    <div key={k} className="relative inline-flex">
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            className={`text-xl leading-none hover:scale-110 transition-transform ${myTypes.includes(k) ? 'ring-2 ring-blue-400 rounded-full' : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleReact(k, true); enqueueBurst(EMOJI[k], 1); }}
                          >
                            {EMOJI[k]}
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content side="top" align="center" className="z-50 select-none rounded-md bg-black/80 px-2 py-1 text-xs text-white shadow-md">
                            {label}
                            <Tooltip.Arrow className="fill-black/80" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                      {myTypes.includes(k) && (
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <button
                              className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={(e) => { e.stopPropagation(); clearMyReactionType(k); setShowReactions(false); }}
                              aria-label={String(t('chat.reactions.removeType', { type: label, defaultValue: `Remove ${label}` } as any))}
                            >
                              ×
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content side="top" align="center" className="z-50 select-none rounded-md bg-black/80 px-2 py-1 text-xs text-white shadow-md">
                              {String(t('chat.reactions.removeType', { type: label, defaultValue: `Remove ${label}` } as any))}
                              <Tooltip.Arrow className="fill-black/80" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Floating emojis container */}
          <div className="pointer-events-none absolute -bottom-1 left-0 right-0">
            {floatItems.map((it) => {
              const style = (isOwnMessage
                ? ({ right: 0, marginLeft: `${it.dx}px` } as React.CSSProperties)
                : ({ left: 0, marginLeft: `${it.dx}px` } as React.CSSProperties)
              );
              return (
                <span key={it.id} className="emoji-float select-none" style={style}>
                  {it.emoji}
                </span>
              );
            })}
          </div>

          {/* Local styles for float animation */}
          <style>{`
            @keyframes emoji-float-up {
              0%   { transform: translateY(0) scale(0.9);   opacity: 0.9; }
              70%  { transform: translateY(-40px) scale(1.05); opacity: 1; }
              100% { transform: translateY(-68px) scale(1.15); opacity: 0; }
            }
            .emoji-float {
              position: absolute;
              bottom: 0;
              color: #e0245e;
              font-size: 14px;
              animation: emoji-float-up 900ms ease-out forwards;
              text-shadow: 0 1px 1px rgba(0,0,0,0.12);
            }
          `}</style>
        </div>
      )}
        {/* Menu button */}
        {showMenu && (
          <>
            <button
              onClick={() => onMenuToggle(menuOpenKey === messageKey ? null : messageKey)}
              className={`absolute -top-2 ${isOwnMessage ? '-right-2' : '-left-2'} z-30 p-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 transition-opacity`}
              title={t('chat.menu.options')}
              aria-label={t('chat.menu.messageOptionsAria')}
            >
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            {menuOpenKey === messageKey && (
              <div className={`absolute z-50 ${isOwnMessage ? 'right-0' : 'left-0'} top-4 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1`}
                onMouseLeave={() => onMenuToggle(null)}
              >
                {typeof onTogglePinMessage === 'function' && !isRecalled && (
                  <button
                    onClick={() => onTogglePinMessage(message.id as any, !isPinned)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {isPinned ? t('chat.menu.unpinMessage', 'Bỏ ghim tin nhắn') : t('chat.menu.pinMessage', 'Ghim tin nhắn')}
                  </button>
                )}
                <button
                  onClick={() => onRecallMessage(message, 'self')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('chat.menu.recall.self')}
                </button>
                {isOwnMessage && !isRecalled && (message.messageType === undefined || message.messageType === 'text') && !isSharedMessage && (
                  <button
                    onClick={() => { setIsEditing(true); setEditValue(String(message.content)); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('chat.menu.edit', 'Sửa tin nhắn')}
                  </button>
                )}
                {isOwnMessage && !isRecalled && (
                  <button
                    onClick={() => onRecallMessage(message, 'all')}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    {t('chat.menu.recall.all')}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    {/* Reaction details modal */}
    {showReactionModal && (
      <ReactionDetailsModal
        open={showReactionModal}
        onClose={() => setShowReactionModal(false)}
        reactions={(reactions as any[]) || []}
        resolveUser={(uid: number) => resolveUserInfo(uid)}
        t={(key: any, opts?: any) => String(t(key, opts))}
        onOpenProfile={onOpenProfile as any}
      />
    )}
    </Tooltip.Provider>
  );
};

function isDarkMode() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

export default MessageBubble;
