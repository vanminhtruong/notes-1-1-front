import { useRef, useState, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { summarizeReplyContent } from '@/utils/utils';
import { Ban, CornerUpLeft, FileText, Paperclip, Send, Smile, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MessageInputProps } from '../../interface/MessageInput.interface';
import './message-input.css';

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
  recipientIsActive = true,
  isGroup = false
}: MessageInputProps) => {
  const { t } = useTranslation('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [emojiPosition, setEmojiPosition] = useState({ left: 8, top: 8, width: 272 });
  const [showEmoji, setShowEmoji] = useState(false);
  // Local draft so the input + send button never depend on the parent state
  // being in sync. It is still mirrored to the parent via onMessageChange.
  const [draft, setDraft] = useState(newMessage);

  useEffect(() => {
    setDraft(newMessage);
  }, [newMessage]);

  // A compact but rich emoji set (can be expanded easily)
  const emojis = (
    '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥳 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 🤥 😶 😐 😑 🙄 😬 🤥 😴 🤤 😪 😷 🤒 🤕 🤧 🥴 😵 🤠 😺 😸 😹 😻 😼 😽 🙀 😿 😾 ✨ ❤️ 🧡 💛 💚 💙 💜 🤍 🤎 🖤 👍 👎 🙌 👏 🤝 ✌️ 🤞 🤟 🤘 👋 🤙 💪 🙏'
  ).split(' ');

  // Close emoji picker when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!showEmoji) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node) &&
          !emojiPickerRef.current?.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showEmoji]);

  const updateEmojiPosition = () => {
    const rect = emojiButtonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(288, window.innerWidth - 16);
    const top = Math.max(8, rect.top - Math.min(274, window.innerHeight - 24));
    const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
    setEmojiPosition({ left, top, width });
  };

  useEffect(() => {
    if (!showEmoji) return;
    updateEmojiPosition();
    window.addEventListener('resize', updateEmojiPosition);
    window.addEventListener('scroll', updateEmojiPosition, true);
    return () => {
      window.removeEventListener('resize', updateEmojiPosition);
      window.removeEventListener('scroll', updateEmojiPosition, true);
    };
  }, [showEmoji]);

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleEmojiClick = (emoji: string) => {
    const next = `${draft}${emoji}`;
    setDraft(next);
    onMessageChange(next);
    // Notify typing to keep UX consistent
    onTyping();
  };

  const hasContent = draft.trim().length > 0 || pendingImages.length > 0 || pendingFiles.length > 0;

  const handleSend = () => {
    const value = draft;
    if (!value.trim() && pendingImages.length === 0 && pendingFiles.length === 0) return;
    // Clear the local draft right away for instant feedback. The parent will
    // also clear; if the send fails the composer restores the text.
    setDraft('');
    onSendMessage(value);
  };

  // If recipient is banned, show warning instead of input
  if (!recipientIsActive) {
    return (
      <div className="mc-root">
        <div className="mc-banned">
          <Ban className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          <span>{t('chat.input.recipientBanned', 'Tài khoản bị vô hiệu hóa do vi phạm chính sách')}</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mc-root">
      {replyingToMessage && (
        <div className="mc-reply">
          <div className="min-w-0 flex-1">
            <div className="mc-reply-name">
              <CornerUpLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
              <span>
                {t('chat.reply.replyingTo', 'Trả lời')} {replyingToMessage.sender?.name || `User ${replyingToMessage.senderId || replyingToMessage.userId || ''}`}
              </span>
            </div>
            <div className="mc-reply-text">
              {summarizeReplyContent(replyingToMessage.messageType, replyingToMessage.content, t)}
            </div>
          </div>
          {onClearReply && (
            <button
              type="button"
              onClick={onClearReply}
              className="mc-icon-btn mc-icon-btn--ghost mc-icon-btn--sm"
              aria-label={t('chat.reply.cancel', 'Hủy trả lời')}
              title={t('chat.reply.cancel', 'Hủy trả lời')}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>
      )}
      {pendingImages.length > 0 && (
        <div className="mc-attachments">
          {pendingImages.map((img) => (
            <div key={img.id} className="mc-thumb">
              <img src={img.preview} alt={t('chat.input.attachmentAlt')} />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(img.preview);
                  onRemoveImage(img.id);
                }}
                className="mc-chip-x"
                aria-label={t('chat.input.removeImageAria')}
                title={t('chat.input.removeImageAria')}
              >
                <X className="h-3 w-3" strokeWidth={2.4} />
              </button>
            </div>
          ))}
        </div>
      )}
      {pendingFiles.length > 0 && (
        <div className="mc-attachments">
          {pendingFiles.map((f) => (
            <div key={f.id} className="mc-file" title={f.file.name}>
              <FileText className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              <span>{f.file.name}</span>
              <button
                type="button"
                onClick={() => onRemoveFile(f.id)}
                className="mc-chip-x"
                aria-label={t('chat.input.removeFileAria')}
                title={t('chat.input.removeFileAria')}
              >
                <X className="h-3 w-3" strokeWidth={2.4} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mc-shell">
        <span aria-hidden="true" className="mc-glow" />
        <div className="mc-capsule" data-filled={hasContent}>
          <button
            type="button"
            onClick={handlePlusClick}
            className="mc-icon-btn"
            aria-label={t('chat.input.attachFileAria')}
            title={t('chat.input.attachFileAria')}
          >
            <Paperclip className="h-[19px] w-[19px]" strokeWidth={1.9} />
          </button>
          <input ref={fileInputRef} type="file" multiple onChange={onFileChange} className="hidden" />

          <div className="mc-field">
            <input
              type="text"
              value={draft}
              onChange={(e) => { setDraft(e.target.value); onMessageChange(e.target.value); onTyping(); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
              onBlur={onTypingStop}
              placeholder={isGroup ? t('chat.input.groupPlaceholder', 'Nhắn tin cho nhóm...') : t('chat.input.messagePlaceholder', 'Write a message...')}
              className="mc-input"
            />
            <button
              type="button"
              ref={emojiButtonRef}
              onClick={() => { updateEmojiPosition(); setShowEmoji((s) => !s); }}
              aria-label={t('chat.input.chooseEmoji', 'Choose emoji')}
              aria-expanded={showEmoji}
              className="mc-icon-btn mc-icon-btn--ghost"
            >
              <Smile className="h-[19px] w-[19px]" strokeWidth={1.9} />
            </button>
            {showEmoji && createPortal(
              <div
                ref={emojiPickerRef}
                style={{ left: emojiPosition.left, top: emojiPosition.top, width: emojiPosition.width }}
                className="mc-pop"
              >
                {emojis.map((e, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleEmojiClick(e)}
                    className="mc-emoji"
                  >
                    {e}
                  </button>
                ))}
              </div>,
              document.body
            )}
          </div>

          <span aria-hidden="true" className="mc-divider" />
          <button
            type="button"
            onClick={handleSend}
            disabled={!hasContent}
            className="mc-send"
            aria-label={t('chat.input.send', 'Gửi')}
            title={t('chat.input.send', 'Gửi')}
          >
            <Send className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
