import { MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MessageStatus from './MessageStatus';
import type { MessageBubbleProps } from '../../interface/MessageBubble.interface';

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
  onDownloadAttachment,
  onPreviewImage
}: MessageBubbleProps) => {
  const { t } = useTranslation('dashboard');
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
    <div
      className={`px-3 py-1.5 rounded-2xl text-sm break-words whitespace-pre-wrap w-fit ${
        isOwnMessage
          ? 'bg-blue-600 text-white rounded-br-md'
          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
      }`}
    >
      {message.content}
    </div>
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
    <div className={`relative group ${isOwnMessage ? 'flex justify-end' : 'flex justify-start'}`}>
      <div className="relative">
        <div className="flex flex-col">
          {renderContent()}
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
              <div className={`absolute z-10 ${isOwnMessage ? 'right-0' : 'left-0'} top-4 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1`}
                onMouseLeave={() => onMenuToggle(null)}
              >
                <button
                  onClick={() => onRecallMessage(message, 'self')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('chat.menu.recall.self')}
                </button>
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
