import { MoreVertical, Clock, Pin } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MessageStatus from './MessageStatus';
import type { MessageBubbleProps } from '../../interface/MessageBubble.interface';
import { formatDateMDYY } from '@/utils/utils';

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
}: MessageBubbleProps) => {
  const { t } = useTranslation('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>(String(message.content || ''));
  const isPinned = (() => {
    if (!message?.id) return false;
    if (!Array.isArray(pinnedIdSet) && !(pinnedIdSet instanceof Set)) return false;
    if (Array.isArray(pinnedIdSet)) return pinnedIdSet.includes(message.id as any);
    return (pinnedIdSet as Set<number>).has(message.id as any);
  })();
  
  // Check if this is a shared message (shared note)
  const isSharedMessage = typeof message.content === 'string' && message.content.startsWith('NOTE_SHARE::');
  const renderImageMessage = () => (
    <div className="relative">
      <img
        src={message.content}
        alt={t('chat.message.imageAlt')}
        onClick={() => onPreviewImage(message.content)}
        className={`w-36 h-36 cursor-zoom-in rounded-2xl ${isOwnMessage ? 'rounded-br-md' : 'rounded-bl-md'} shadow-sm object-cover border border-gray-200 dark:border-gray-700`}
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
  );

  const renderFileMessage = () => (
    <button
      type="button"
      onClick={() => onDownloadAttachment(message.content)}
      className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${isOwnMessage ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm'} border border-gray-200 dark:border-gray-700 w-full text-left`}
      title={t('chat.attachment.downloadFileTitle')}
      aria-label={t('chat.attachment.downloadFileAria')}
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M8 2a1 1 0 00-1 1v2H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2V3a1 1 0 10-2 0v2H9V3a1 1 0 00-1-1z" />
      </svg>
      <span className="truncate max-w-[200px]">{(() => { try { const u = new URL(message.content); return decodeURIComponent(u.pathname.split('/').pop() || t('chat.attachment.fileFallback')); } catch { return message.content; } })()}</span>
      <span className="ml-auto inline-flex items-center gap-1 text-xs opacity-80">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 14a1 1 0 011-1h2.586l1.707 1.707a1 1 0 001.414 0L11.414 13H14a1 1 0 011 1v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z" />
          <path d="M7 3a1 1 0 011-1h4a1 1 0 011 1v6h1.586a1 1 0 01.707 1.707l-4.586 4.586a1 1 0 01-1.414 0L4.707 10.707A1 1 0 015.414 9H7V3z" />
        </svg>
        {t('chat.attachment.downloadLabel')}
      </span>
    </button>
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
            const priorityChip = (p: string) => {
              const base = 'px-2 py-1 text-xs font-medium rounded-lg border';
              switch (p) {
                case 'high':
                  return `${base} bg-red-100 text-red-800 border-red-200`;
                case 'medium':
                  return `${base} bg-yellow-100 text-yellow-800 border-yellow-200`;
                case 'low':
                default:
                  return `${base} bg-green-100 text-green-800 border-green-200`;
              }
            };
            return (
              <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 max-w-[360px]">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">{note.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{note.content || t('messages.noContent')}</p>
                {note.imageUrl && (
                  <div className="mb-4">
                    <img src={note.imageUrl} alt={note.title} className="w-full h-40 object-cover rounded-xl border" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={priorityChip(note.priority)}>{
                      note.priority === 'high' ? t('priority.high') : note.priority === 'medium' ? t('priority.medium') : t('priority.low')
                    }</span>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600">{t(`category.${note.category}`)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatDateMDYY(note.createdAt)}
                  </div>
                </div>
              </div>
            );
          }
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
              className={`px-3 py-1.5 rounded-2xl text-sm break-words whitespace-pre-wrap w-fit ${
                isOwnMessage
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
              }`}
            >
              {message.content}
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

  const renderContent = () => {
    if (isRecalled) {
      return renderRecalledMessage();
    }

    switch (message.messageType) {
      case 'image':
        return renderImageMessage();
      case 'file':
        return renderFileMessage();
      default:
        return renderTextMessage();
    }
  };

  return (
    <div id={`message-${message.id}`} className={`relative group ${isOwnMessage ? 'flex justify-end' : 'flex justify-start'}`}>
      <div className="relative">
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {renderContent()}
          {isPinned && (
            <div className={`mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${isOwnMessage ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
              <Pin className="w-3 h-3" />
              {t('chat.menu.pinned', 'Đã ghim')}
            </div>
          )}
          <MessageStatus 
            message={message} 
            isOwnMessage={isOwnMessage} 
            currentUserId={currentUserId}
            allMessages={allMessages}
          />
        </div>
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
    </div>
  );
};

export default MessageBubble;
