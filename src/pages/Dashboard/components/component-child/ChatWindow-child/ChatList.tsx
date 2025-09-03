import { MessageCircle, MoreVertical, UserX, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatPreviewText, formatPreviewTime } from '../../../../../utils/utils';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import type { ChatListProps } from '../../interface/ChatList.interface';
const ChatList = ({ chatList, friends, unreadMap, currentUserId, onStartChat, onRemoveFriend, onDeleteMessages, e2eeEnabled, e2eeUnlocked, lockedPlaceholder }: ChatListProps) => {
  const { t } = useTranslation('dashboard');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const isLocked = !!e2eeEnabled && !e2eeUnlocked;
  return (
    <div className="h-full overflow-y-auto">
      {/* Chat List when no chat is selected */}
      <div className="p-2">
        {/* Conversations List with previews */}
        {chatList.map((item) => {
          const friend = item.friend;
          const online = friends.find((f) => f.id === friend.id)?.isOnline ?? friend.isOnline;
          const preview = isLocked
            ? (lockedPlaceholder || t('chat.preview.locked', '🔒 Encrypted — unlock to preview'))
            : formatPreviewText(item.lastMessage, currentUserId, {
                recalled: t('chat.preview.recalled'),
                image: t('chat.preview.image'),
                file: t('chat.preview.file'),
                youPrefix: t('chat.preview.youPrefix')
              });
          const time = formatPreviewTime(item.lastMessage?.createdAt);
          const count = (unreadMap[friend.id] ?? item.unreadCount ?? 0) as number;
          const isUnread = count > 0;
          const previewClass = `text-sm truncate ${
            isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
          }`;
          return (
            <div
              key={friend.id}
              onClick={() => onStartChat(friend)}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                  {friend.avatar ? (
                    <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                  ) : (
                    friend.name.charAt(0)
                  )}
                </div>
                {online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                )}
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[18px] text-center shadow">
                    {count}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`${isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'font-normal text-gray-800 dark:text-gray-300'} truncate`}
                  >
                    {friend.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{time}</span>
                    {onRemoveFriend && item.friendshipId && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === friend.id ? null : friend.id);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        {openMenuId === friend.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenMenuId(null);
                              }}
                            />
                            <div className="absolute right-0 top-8 z-20 min-w-[160px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
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
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <UserX className="w-4 h-4" />
                                {t('chat.actions.removeFriend')}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className={previewClass}>{preview}</p>
              </div>
            </div>
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
};

export default ChatList;

