import { useRef, useState, useEffect, memo } from 'react';
import { summarizeReplyContent } from '@/utils/utils';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MessageInputProps } from '../../interface/MessageInput.interface';
const MessageInput = memo(({
  newMessage,
  pendingImages,
  pendingFiles,
  onMessageChange,
  onSendMessage,
  onFileChange,
  onRemoveImage,
  onRemoveFile,
  onTyping,
  onTypingStop,
  replyingToMessage,
  onClearReply,
  recipientIsActive = true
}: MessageInputProps) => {
  const { t } = useTranslation('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  // A compact but rich emoji set (can be expanded easily)
  const emojis = (
    '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥳 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 🤥 😶 😐 😑 🙄 😬 🤥 😴 🤤 😪 😷 🤒 🤕 🤧 🥴 😵 🤠 😺 😸 😹 😻 😼 😽 🙀 😿 😾 ✨ ❤️ 🧡 💛 💚 💙 💜 🤍 🤎 🖤 👍 👎 🙌 👏 🤝 ✌️ 🤞 🤟 🤘 👋 🤙 💪 🙏'
  ).split(' ');

  // Close emoji picker when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!showEmoji) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showEmoji]);

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleEmojiClick = (emoji: string) => {
    const next = `${newMessage}${emoji}`;
    onMessageChange(next);
    // Notify typing to keep UX consistent
    onTyping();
  };

  // If recipient is banned, show warning instead of input
  if (!recipientIsActive) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-700">
        <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-300">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{t('chat.input.recipientBanned', 'Tài khoản bị vô hiệu hóa do vi phạm chính sách')}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 relative z-50 md-down:p-3 sm-down:p-2"
    >
      {replyingToMessage && (
        <div className="mb-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-0.5">
              {t('chat.reply.replyingTo', 'Trả lời')} {replyingToMessage.sender?.name || `User ${replyingToMessage.senderId || replyingToMessage.userId || ''}`}
            </div>
            <div className="text-sm text-blue-700/90 dark:text-blue-300/90 truncate">
              {summarizeReplyContent(replyingToMessage.messageType, replyingToMessage.content, t)}
            </div>
          </div>
          {onClearReply && (
            <button
              type="button"
              onClick={onClearReply}
              className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/40 text-blue-600 dark:text-blue-300"
              aria-label={t('chat.reply.cancel', 'Hủy trả lời')}
              title={t('chat.reply.cancel', 'Hủy trả lời')}
            >
              ×
            </button>
          )}
        </div>
      )}
      {pendingImages.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {pendingImages.map((img) => (
            <div key={img.id} className="relative inline-block">
              <img
                src={img.preview}
                alt={t('chat.input.attachmentAlt')}
                className="w-12 h-12 rounded-md object-cover border border-gray-200 dark:border-gray-700"
              />
              <button
                onClick={() => {
                  URL.revokeObjectURL(img.preview);
                  onRemoveImage(img.id);
                }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-gray-700 shadow hover:bg-gray-100 flex items-center justify-center"
                aria-label={t('chat.input.removeImageAria')}
                title={t('chat.input.removeImageAria')}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {pendingFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {pendingFiles.map((f) => (
            <div
              key={f.id}
              className="relative inline-flex items-center gap-2 max-w-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200"
              title={f.file.name}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 2a1 1 0 00-1 1v2H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2V3a1 1 0 10-2 0v2H9V3a1 1 0 00-1-1z" />
              </svg>
              <span className="truncate">{f.file.name}</span>
              <button
                onClick={() => onRemoveFile(f.id)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-gray-700 shadow hover:bg-gray-100 flex items-center justify-center"
                aria-label={t('chat.input.removeFileAria')}
                title={t('chat.input.removeFileAria')}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-3 md-down:gap-2">
        <button
          onClick={handlePlusClick}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors flex-shrink-0 md-down:p-1.5"
          aria-label={t('chat.input.attachFileAria')}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        <input ref={fileInputRef} type="file" multiple onChange={onFileChange} className="hidden" />
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => { onMessageChange(e.target.value); onTyping(); }}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            onBlur={onTypingStop}
            placeholder={t('chat.input.placeholder')}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 pr-12 md-down:px-3 md-down:py-2.5 md-down:pr-10 sm-down:px-3 sm-down:py-2 sm-down:pr-9"
          />
          <button
            type="button"
            onClick={() => setShowEmoji((s) => !s)}
            aria-label={t('chat.input.chooseEmoji', 'Choose emoji')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 md-down:right-2 md-down:p-0.5"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zM9 9a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </button>
          {showEmoji && (
            <div className="absolute bottom-12 right-0 w-64 max-h-64 overflow-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 grid grid-cols-8 gap-1 z-50">
              {emojis.map((e, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleEmojiClick(e)}
                  className="text-xl leading-none p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onSendMessage}
          disabled={!newMessage.trim() && pendingImages.length === 0 && pendingFiles.length === 0}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed md-down:p-1.5"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;

