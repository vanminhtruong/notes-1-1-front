import { useRef, useEffect, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import type { Message, MessageGroup } from './types';
import MessageBubble from './MessageBubble';
import { useTranslation } from 'react-i18next';


interface ChatViewProps {
  selectedChat: any;
  messages: Message[];
  groupedMessages: MessageGroup[];
  isPartnerTyping: boolean;
  typingUsers?: Array<{ id: any; name: string; avatar?: string }>;
  menuOpenKey: string | null;
  currentUserId?: number;
  onBack: () => void;
  onMenuToggle: (key: string | null) => void;
  onRecallMessage: (msg: Message, scope: 'self' | 'all') => void;
  onRecallGroup: (group: MessageGroup, scope: 'self' | 'all') => void;
  onDownloadAttachment: (url: string) => void;
  onPreviewImage: (url: string) => void;
  // Group mode
  isGroup?: boolean;
  groupOnline?: boolean;
  onLeaveGroup?: () => void;
  // Group editing
  isGroupOwner?: boolean;
  onEditGroup?: () => void;
  onDeleteGroup?: () => void;
  onRemoveMembers?: () => void;
  // E2EE masking
  maskMessages?: boolean;
  lockedNotice?: string;
  onUnlock?: () => void;
}

const ChatView = ({
  selectedChat,
  messages,
  groupedMessages,
  isPartnerTyping,
  typingUsers,
  menuOpenKey,
  currentUserId,
  onBack,
  onMenuToggle,
  onRecallMessage,
  onRecallGroup,
  onDownloadAttachment,
  onPreviewImage,
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
}: ChatViewProps) => {
  const { t } = useTranslation('dashboard');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Always scroll to bottom when messages change to ensure new messages are visible
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isPartnerTyping) return;
    const el = scrollerRef.current;
    if (!el) return;
    const threshold = 80; // px
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceToBottom <= threshold) {
      setTimeout(scrollToBottom, 50);
    }
  }, [isPartnerTyping]);

  // Update current time every second to refresh offline duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  return (
    <>
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold shadow-md">
              {selectedChat.avatar ? (
                <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
              ) : (
                selectedChat.name.charAt(0)
              )}
            </div>
            {(isGroup ? groupOnline === true : selectedChat.isOnline === true) && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{selectedChat.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(isGroup ? groupOnline : selectedChat.isOnline) ? 
                t('chat.chatView.status.online') : 
                (() => {
                  if (!selectedChat.lastSeenAt) {
                    return t('chat.chatView.status.offline');
                  }
                  
                  const lastSeen = new Date(selectedChat.lastSeenAt);
                  const diffMs = currentTime.getTime() - lastSeen.getTime();
                  const diffSeconds = Math.floor(diffMs / 1000);
                  
                  // Only show if offline for more than 20 seconds
                  if (diffSeconds < 20) {
                    return t('chat.chatView.status.offline');
                  }
                  
                  if (diffSeconds < 60) {
                    return '20 giây trước';
                  } else if (diffSeconds < 3600) { // Less than 1 hour
                    const minutes = Math.floor(diffSeconds / 60);
                    return `${minutes} phút trước`;
                  } else if (diffSeconds < 86400) { // Less than 24 hours
                    const hours = Math.floor(diffSeconds / 3600);
                    return `${hours} giờ trước`;
                  } else {
                    const days = Math.floor(diffSeconds / 86400);
                    return `${days} ngày trước`;
                  }
                })()
              }
            </p>
          </div>
          <div className="flex items-center gap-2 relative">
            {/* Keep existing header icons if needed */}
            {!isGroup && (
              <>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3a1 1 0 011 1v.5a1 1 0 11-2 0V4a1 1 0 011-1zM15 4a1 1 0 011 1v.5a1 1 0 11-2 0V5a1 1 0 011-1zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zM19 8.25a1.25 1.25 0 10-2.5 0v7.5a1.25 1.25 0 102.5 0v-7.5z" />
                  </svg>
                </button>
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
                  <div className="absolute right-0 top-10 z-20 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1"
                       onMouseLeave={() => setHeaderMenuOpen(false)}
                  >
                    {isGroupOwner && onEditGroup && (
                      <button
                        onClick={() => { setHeaderMenuOpen(false); onEditGroup(); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {t('chat.groups.actions.edit')}
                      </button>
                    )}
                    {isGroupOwner && onRemoveMembers && (
                      <button
                        onClick={() => { setHeaderMenuOpen(false); onRemoveMembers(); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {t('chat.groups.actions.removeMember')}
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

      {/* Messages */}
      <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 relative">
        {isGroup && selectedChat?.background && (
          <div aria-hidden className="absolute inset-0">
            <div
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url(${selectedChat.background})` }}
            />
            <div className="absolute inset-0 bg-white/60 dark:bg-black/40" />
          </div>
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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{selectedChat.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('chat.chatView.empty.youAreFriends', { name: selectedChat.name })}</p>
            </div>
          ) : null
        ) : (
          <div className="space-y-4 relative z-10">
            {visibleGroups.map((group) => {
              const isOwnMessage = group.senderId === currentUserId;
              const showAvatar = !isOwnMessage;
              const images = group.items.filter((i) => i.messageType === 'image');
              const files = group.items.filter((i) => i.messageType === 'file');
              const texts = group.items.filter((i) => !i.messageType || i.messageType === 'text');
              // Use a stable, unique key per group based on sender and message id range
              const firstId = group.items[0]?.id ?? `s-${group.start}`;
              const lastId = group.items[group.items.length - 1]?.id ?? `e-${group.end}`;
              const groupKey = `g-${group.senderId}-${firstId}-${lastId}`;
              const hasMedia = images.length > 0 || files.length > 0;
              const isSameDayGroup = new Date(group.start).toDateString() === new Date(group.end).toDateString();
              const showGroupMenu = !hasMedia && !isSameDayGroup;
              const showPerMessageTextMenu = isSameDayGroup;
              const allRecalled = group.items.every((i) => i.isDeletedForAll);

              // System messages: render centered notices
              const isSystemGroup = group.items.every((i) => i.messageType === 'system');
              if (isSystemGroup) {
                return (
                  <div key={groupKey} className="flex justify-center">
                    <div className="max-w-[80%] text-center text-xs italic text-gray-600 dark:text-gray-300">
                      {group.items.map((it) => (
                        <div key={`sys-${it.id}`} className="py-1">
                          {it.content}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={groupKey} className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  {showAvatar && (
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-auto">
                      {(() => {
                        const first = group.items[0];
                        const avatar = first?.sender?.avatar ?? selectedChat.avatar;
                        const name = first?.sender?.name ?? selectedChat.name;
                        return avatar ? (
                          <img src={avatar} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          (name || '').charAt(0)
                        );
                      })()}
                    </div>
                  )}
                  <div className={`relative max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                    {/* Group-level menu: only for text-only and NOT same-day */}
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
                          <div className={`absolute z-10 ${isOwnMessage ? 'right-0' : 'left-0'} top-4 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1`}
                            onMouseLeave={() => onMenuToggle(null)}
                          >
                            <button
                              onClick={() => onRecallGroup(group, 'self')}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {t('chat.menu.recall.self')}
                            </button>
                            {isOwnMessage && !allRecalled && (
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
                      <div className="relative group">
                        <div className={`px-4 py-2 rounded-2xl text-xs italic text-gray-500 bg-gray-100 dark:bg-gray-700 ${isOwnMessage ? 'rounded-br-md' : 'rounded-bl-md'} shadow-sm`}>
                          {t('chat.recalled.text')}
                        </div>
                        <button
                          onClick={() => onMenuToggle(menuOpenKey === groupKey ? null : groupKey)}
                          className={`absolute -top-2 ${isOwnMessage ? '-right-2' : '-left-2'} z-30 p-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 transition-opacity`}
                          title={t('chat.menu.options')}
                          aria-label={t('chat.menu.messageOptionsAria')}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        {menuOpenKey === groupKey && (
                          <div className={`absolute z-10 ${isOwnMessage ? 'right-0' : 'left-0'} top-4 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1`}
                            onMouseLeave={() => onMenuToggle(null)}
                          >
                            <button
                              onClick={() => onRecallGroup(group, 'self')}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {t('chat.menu.recall.self')}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Render all items in chronological order with proper grouping for images */}
                        <div className="flex flex-col gap-2">
                          {(() => {
                            const sortedItems = group.items.sort((a, b) => {
                              const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : (a.createdAt as any as number);
                              const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : (b.createdAt as any as number);
                              return timeA - timeB;
                            });

                            const result = [];
                            let i = 0;
                            
                            while (i < sortedItems.length) {
                              const current = sortedItems[i];
                              
                              if (current.messageType === 'image') {
                                // Group consecutive images into a grid
                                const imageGroup = [current];
                                let j = i + 1;
                                
                                while (j < sortedItems.length && sortedItems[j].messageType === 'image') {
                                  imageGroup.push(sortedItems[j]);
                                  j++;
                                }
                                
                                result.push(
                                  <div key={`img-group-${current.id}`} className={`grid gap-1 ${imageGroup.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {imageGroup.map((img) => (
                                      <MessageBubble
                                        key={img.id}
                                        message={img}
                                        isOwnMessage={isOwnMessage}
                                        isRecalled={img.isDeletedForAll}
                                        menuOpenKey={menuOpenKey}
                                        messageKey={`img-${img.id}`}
                                        showMenu={true}
                                        currentUserId={currentUserId}
                                        allMessages={messages}
                                        onMenuToggle={onMenuToggle}
                                        onRecallMessage={onRecallMessage}
                                        onDownloadAttachment={onDownloadAttachment}
                                        onPreviewImage={onPreviewImage}
                                      />
                                    ))}
                                  </div>
                                );
                                
                                i = j;
                              } else {
                                // Render non-image items individually
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
                                    onDownloadAttachment={onDownloadAttachment}
                                    onPreviewImage={onPreviewImage}
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
                      {new Date(group.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!isGroup && isPartnerTyping && !maskMessages && (
          <div className="mt-3 flex gap-2 justify-start relative z-10">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-auto">
              {selectedChat.avatar ? (
                <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
              ) : (
                selectedChat.name.charAt(0)
              )}
            </div>
            <div className="max-w-[70%] flex flex-col items-start">
              <div className="px-4 py-2 rounded-2xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm">
                <div className="flex items-center gap-1 py-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        {isGroup && typingUsers && typingUsers.length > 0 && !maskMessages && (
          <div className="mt-3 flex gap-2 justify-start relative z-10">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-auto">
              {selectedChat.avatar ? (
                <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
              ) : (
                selectedChat.name.charAt(0)
              )}
            </div>
            <div className="max-w-[70%] flex flex-col items-start">
              <div className="px-4 py-2 rounded-2xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm">
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                  {typingUsers.map(u => u.name).join(', ')}
                </div>
                <div className="flex items-center gap-1 py-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="relative z-10" />
      </div>
    </>
  );
};

export default ChatView;
