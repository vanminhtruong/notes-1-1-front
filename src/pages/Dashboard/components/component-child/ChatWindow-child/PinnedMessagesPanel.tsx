import { useState } from 'react';
import { Pin, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PinnedMessage {
  id: number;
  content?: string;
  messageType?: string;
  createdAt?: string;
}

interface PinnedMessagesPanelProps {
  pinnedMessages: PinnedMessage[];
  onScrollToMessage: (messageId: number) => void;
  onUnpin: (messageId: number) => void;
}

const PinnedMessagesPanel = ({ pinnedMessages, onScrollToMessage, onUnpin }: PinnedMessagesPanelProps) => {
  const { t } = useTranslation('dashboard');
  const [collapsed, setCollapsed] = useState(true);

  if (pinnedMessages.length === 0) return null;

  return (
    <div className="sticky top-0 z-30 w-full md:px-0 px-0 md:pt-0 pt-0">
      <div className="backdrop-blur-md bg-gradient-to-b from-amber-50/95 to-yellow-50/90 dark:from-gray-900/95 dark:to-gray-800/90 dark-black:from-black/98 dark-black:to-zinc-950/95 shadow-sm border-b-2 border-yellow-400/30 dark:border-yellow-600/30 dark-black:border-yellow-500/20 md:rounded-none rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-yellow-100/30 dark:hover:bg-gray-800/50 dark-black:hover:bg-zinc-900/60 transition-colors md:rounded-none rounded-t-2xl"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 dark-black:from-yellow-500 dark-black:to-amber-600 shadow-md">
          <Pin className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-sm font-bold text-yellow-700 dark:text-yellow-400 dark-black:text-yellow-500">
            {t('chat.menu.pinnedMessages', 'Tin nhắn đã ghim')}
          </h3>
          <p className="text-xs text-yellow-600/70 dark:text-yellow-400/60 dark-black:text-yellow-500/70">
            {pinnedMessages.length} {pinnedMessages.length === 1 ? 'tin nhắn' : 'tin nhắn'}
          </p>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-yellow-600 dark:text-yellow-400 dark-black:text-yellow-500 transition-transform duration-300 ${collapsed ? '-rotate-180' : ''}`}
        />
      </button>
      
      {/* Pinned messages list */}
      {!collapsed && (
        <div className="px-3 pb-3 pt-1 space-y-2 md:rounded-none rounded-b-2xl max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-500/50 scrollbar-track-transparent">
          {pinnedMessages.map((pm, index) => {
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
              displayText = '🖼️ ' + t('chat.preview.image', 'Hình ảnh');
            } else if (pm.messageType === 'file') {
              displayText = '📎 ' + t('chat.preview.file', 'File');
            } else {
              try {
                displayText = decodeURIComponent(pm.content || '');
              } catch {
                displayText = pm.content || '';
              }
            }
            
            // Format time
            const messageTime = pm.createdAt ? new Date(pm.createdAt) : null;
            const timeStr = messageTime ? 
              messageTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }) 
              : '';
            
            return (
              <div
                key={`pin-${pm.id}`}
                className="group relative bg-white dark:bg-gray-800 dark-black:bg-zinc-900 rounded-xl shadow-sm hover:shadow-md border border-yellow-200/50 dark:border-yellow-700/30 dark-black:border-yellow-600/20 overflow-hidden transition-all duration-200 hover:scale-[1.01]"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInSlide 0.3s ease-out forwards'
                }}
              >
                {/* Decorative gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-amber-400/20 dark-black:from-yellow-500/15 dark-black:to-amber-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content wrapper */}
                <div className="relative flex items-start gap-3 p-3">
                  {/* Pin indicator */}
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-1 h-full min-h-[20px] rounded-full bg-gradient-to-b from-yellow-500 to-amber-500 dark-black:from-yellow-500 dark-black:to-amber-600" />
                  </div>
                  
                  {/* Message content - clickable to scroll */}
                  <button
                    onClick={() => onScrollToMessage(pm.id)}
                    className="flex-1 min-w-0 text-left group/msg flex items-start gap-2"
                  >
                    <p className="flex-1 text-[13px] leading-relaxed text-gray-800 dark:text-gray-100 dark-black:text-gray-200 line-clamp-2 break-words group-hover/msg:text-yellow-800 dark:group-hover/msg:text-yellow-300 dark-black:group-hover/msg:text-yellow-400 transition-colors">
                      {displayText}
                    </p>
                    <span className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] text-yellow-600 dark:text-yellow-400 dark-black:text-yellow-500 font-medium whitespace-nowrap mt-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {timeStr}
                    </span>
                  </button>
                  
                  {/* Unpin button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnpin(pm.id);
                    }}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark-black:bg-red-950/30 dark-black:hover:bg-red-950/50 transition-all duration-200 hover:scale-110"
                    title={t('chat.menu.unpinned', 'Bỏ ghim')}
                  >
                    <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400 dark-black:text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};

export default PinnedMessagesPanel;
