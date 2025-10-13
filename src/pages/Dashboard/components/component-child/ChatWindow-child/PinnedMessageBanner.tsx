import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pin, File, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Message } from '../../interface/ChatTypes.interface';

interface PinnedMessageBannerProps {
  pinnedMessages: Array<{ 
    id: number; 
    content?: string; 
    messageType?: string; 
    createdAt?: string;
    sender?: { id: number; name: string; avatar?: string };
  }>;
  messages: Message[];
  isGroup: boolean;
  onScrollToMessage: (messageId: number) => void;
  onUnpinMessage: (messageId: number) => void;
}

const PinnedMessageBanner = ({
  pinnedMessages,
  messages,
  isGroup,
  onScrollToMessage,
  onUnpinMessage,
}: PinnedMessageBannerProps) => {
  const { t } = useTranslation('dashboard');
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get current pinned message
  const currentPinned = pinnedMessages[currentIndex];

  // Find full message details from messages array
  const fullMessage = messages.find(m => m.id === currentPinned?.id);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpenId]);

  if (!currentPinned) return null;

  // Format display text
  const formatDisplayText = (pm: typeof currentPinned) => {
    const prefix = 'NOTE_SHARE::';
    const isSharedNote = typeof pm.content === 'string' && pm.content.startsWith(prefix);
    let displayText = pm.content || '';
    
    if (isSharedNote && pm.content) {
      try {
        const raw = pm.content.slice(prefix.length);
        const obj = JSON.parse(decodeURIComponent(raw));
        if (obj && obj.title) {
          displayText = obj.title;
        }
      } catch {
        displayText = 'Ghi chú';
      }
    } else if (pm.messageType === 'image') {
      displayText = t('chat.preview.image', 'Hình ảnh');
    } else if (pm.messageType === 'file') {
      displayText = t('chat.preview.file', 'Tệp đính kèm');
    } else {
      try {
        displayText = decodeURIComponent(pm.content || '');
      } catch {
        displayText = pm.content || '';
      }
    }
    
    return displayText;
  };

  // Get sender name
  const getSenderName = () => {
    if (!isGroup) return '';
    if (fullMessage?.sender?.name) return fullMessage.sender.name;
    if (currentPinned.sender?.name) return currentPinned.sender.name;
    return t('chat.menu.unknownUser', 'Người dùng');
  };

  const displayText = formatDisplayText(currentPinned);
  const senderName = getSenderName();
  const hasMultiplePinned = pinnedMessages.length > 1;

  // Handle next/prev navigation
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % pinnedMessages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + pinnedMessages.length) % pinnedMessages.length);
  };

  // Collapsed view
  if (!isExpanded) {
    return (
      <div className="pinner sticky top-0 z-50 w-full backdrop-blur bg-gradient-to-r from-blue-50/95 to-indigo-50/95 dark:from-gray-900/95 dark:to-gray-800/95 border-b border-blue-200/60 dark:border-blue-900/40 shadow-sm md-down:rounded-2xl md-down:mx-2 md-down:w-[calc(100%-1rem)] sm-down:rounded-xl sm-down:mx-1.5 xs-down:rounded-lg xs-down:mx-1">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-blue-100/50 dark:hover:bg-gray-800/50 transition-colors group md-down:rounded-2xl sm-down:rounded-xl xs-down:rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <Pin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {hasMultiplePinned && (
                <span className="absolute -top-1 -right-1 bg-blue-600 dark:bg-blue-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {pinnedMessages.length}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
              {t('chat.menu.pinnedMessages', 'Tin nhắn đã ghim')}
            </span>
            {hasMultiplePinned && (
              <span className="text-xs text-blue-700 dark:text-blue-400 bg-blue-200/60 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                {pinnedMessages.length}
              </span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    );
  }

  // Expanded view
  return (
    <div className="pinner sticky top-0 z-50 w-full backdrop-blur bg-gradient-to-r from-blue-50/95 to-indigo-50/95 dark:from-gray-900/95 dark:to-gray-800/95 border-b border-blue-200/60 dark:border-blue-900/40 shadow-md md-down:rounded-2xl md-down:mx-2 md-down:w-[calc(100%-1rem)] sm-down:rounded-xl sm-down:mx-1.5 xs-down:rounded-lg xs-down:mx-1">
      <div className="px-3 py-2.5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Pin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {hasMultiplePinned && (
                <span className="absolute -top-1 -right-1 bg-blue-600 dark:bg-blue-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {pinnedMessages.length}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">
              {t('chat.menu.pinnedMessages', 'Tin nhắn đã ghim')}
            </span>
            {isGroup && senderName && (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                • {senderName}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Navigation arrows if multiple pinned */}
            {hasMultiplePinned && (
              <div className="flex items-center gap-0.5 text-[11px] text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/40 rounded px-2 py-1 font-medium">
                <button
                  onClick={handlePrev}
                  className="hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                  aria-label="Previous pinned message"
                >
                  ◀
                </button>
                <span className="mx-1">{currentIndex + 1}/{pinnedMessages.length}</span>
                <button
                  onClick={handleNext}
                  className="hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                  aria-label="Next pinned message"
                >
                  ▶
                </button>
              </div>
            )}
            
            {/* Menu button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpenId(menuOpenId === currentPinned.id ? null : currentPinned.id)}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
              
              {menuOpenId === currentPinned.id && (
                <div className="absolute right-0 top-full mt-1 min-w-[180px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <button
                    onClick={() => {
                      onScrollToMessage(currentPinned.id);
                      setMenuOpenId(null);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {t('chat.menu.viewMessage', 'Xem tin nhắn')}
                  </button>
                  <button
                    onClick={() => {
                      onUnpinMessage(currentPinned.id);
                      setMenuOpenId(null);
                      // Move to next pinned or close if last
                      if (hasMultiplePinned && currentIndex >= pinnedMessages.length - 1) {
                        setCurrentIndex(0);
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                  >
                    {t('chat.menu.unpinMessage', 'Bỏ ghim')}
                  </button>
                </div>
              )}
            </div>
            
            {/* Collapse button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full transition-colors group"
              aria-label="Thu gọn"
            >
              <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Message content box */}
        <button
          onClick={() => onScrollToMessage(currentPinned.id)}
          className="w-full text-left group md-down:rounded-xl sm-down:rounded-lg xs-down:rounded-md"
        >
          <div className="relative bg-white dark:bg-gray-800 rounded-xl p-3 hover:shadow-md transition-all border border-blue-200/40 dark:border-blue-900/30 overflow-hidden md-down:rounded-xl sm-down:rounded-lg xs-down:rounded-md">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400" />
            
            <div className="pl-2">
              {/* File indicator if file type */}
              {currentPinned.messageType === 'file' && (
                <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  <File className="w-3.5 h-3.5" />
                  <span>{t('chat.preview.file', 'Tệp đính kèm')}</span>
                </div>
              )}
              
              {/* Message text and timestamp in same row */}
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13px] leading-relaxed text-gray-900 dark:text-gray-100 line-clamp-2 break-words font-medium flex-1">
                  {currentPinned.messageType === 'image' ? (
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">📷</span>
                      <span className="italic text-gray-600 dark:text-gray-400">{displayText}</span>
                    </span>
                  ) : (
                    displayText
                  )}
                </div>
                
                {/* Timestamp */}
                {currentPinned.createdAt && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                    <span className="inline-block w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
                    <span>
                      {new Date(currentPinned.createdAt).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PinnedMessageBanner;
