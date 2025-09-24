import { Search, Check, X, UserPlus, MessageSquare, Ban, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { UsersListProps } from '../../interface/ChatUI.interface';
import type { User } from '../../interface/ChatTypes.interface';

const UsersList = ({
  friendRequests,
  filteredUsers,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onSendFriendRequest,
  onStartChat,
  onBlockUser,
}: UsersListProps) => {
  const { t } = useTranslation('dashboard');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);
  return (
    <div className="h-full flex flex-col overflow-y-auto md-down:px-3 md-down:pb-24">
      {/* User Lists */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 md-down:p-0 md-down:space-y-3">
        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 px-2 md-down:mt-2">
              {t('chat.usersList.friendRequests')}
            </h4>
            {friendRequests.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg md-down:bg-white/70 md-down:dark:bg-gray-800/70 md-down:backdrop-blur md-down:shadow-sm md-down:mb-3 md-down:last:mb-0"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold text-lg shadow-md sm-down:w-10 sm-down:h-10">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0 md-down:pr-2">
                  <p className="font-semibold text-gray-900 dark:text-white truncate md-down:text-sm">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate md-down:text-xs">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 md-down:flex-row md-down:items-center md-down:gap-2">
                  <button
                    onClick={() => onAcceptFriendRequest(user.id)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                    title={t('chat.usersList.actions.accept')}
                    aria-label={t('chat.usersList.actions.acceptRequest')}
                  >
                    <Check className="w-5 h-5" />
                    <span className="sr-only">{t('chat.usersList.actions.accept')}</span>
                  </button>
                  <button
                    onClick={() => onRejectFriendRequest(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    title={t('chat.usersList.actions.reject')}
                    aria-label={t('chat.usersList.actions.rejectRequest')}
                  >
                    <X className="w-5 h-5" />
                    <span className="sr-only">{t('chat.usersList.actions.reject')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users search results (not friends, not self, no pending request) */}
        {filteredUsers.length > 0 && (
          <div className="mb-2 md-down:mt-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 px-2 md-down:mt-2 md-down:mb-2">
              {t('chat.usersList.users')}
            </h4>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg md-down:bg-white/70 md-down:dark:bg-gray-800/70 md-down:backdrop-blur md-down:shadow-sm md-down:mb-3 md-down:last:mb-0"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold text-lg shadow-md sm-down:w-10 sm-down:h-10">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0 md-down:pr-2">
                  <p className="font-semibold text-gray-900 dark:text-white truncate md-down:text-sm">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate md-down:text-xs">{user.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-2 shrink-0 md-down:flex-row md-down:items-center md-down:gap-2">
                  {/* Gửi kết bạn giữ bên ngoài */}
                  <button
                    onClick={() => onSendFriendRequest(user.id)}
                    className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    title={t('chat.usersList.sendRequest')}
                    aria-label={t('chat.usersList.sendRequest')}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="sr-only">{t('chat.usersList.sendRequest')}</span>
                  </button>
                  {/* Menu ba chấm chứa Message + Block */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = openMenuId === user.id ? null : user.id;
                        setOpenMenuId(next);
                        if (next) {
                          const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                          setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
                          setMenuUser(user);
                        } else {
                          setMenuPos(null);
                          setMenuUser(null);
                        }
                      }}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      title={t('chat.menu.options')}
                      aria-label={t('chat.menu.options')}
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredUsers.length === 0 && friendRequests.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">{t('chat.usersList.empty.noResults')}</p>
            <p className="text-sm text-gray-400">{t('chat.usersList.empty.tryAnother')}</p>
          </div>
        )}
      </div>
      {/* Portal menu fixed để tránh bị ancestor che */}
      {openMenuId && menuUser && menuPos
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-[60]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenMenuId(null);
                  setMenuPos(null);
                  setMenuUser(null);
                }}
              />
              <div
                className="fixed z-[70] min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1"
                style={{ top: menuPos.top, right: menuPos.right }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartChat(menuUser);
                    setOpenMenuId(null);
                    setMenuPos(null);
                    setMenuUser(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t('chat.usersList.actions.message', 'Nhắn tin')}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBlockUser(menuUser);
                    setOpenMenuId(null);
                    setMenuPos(null);
                    setMenuUser(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  {t('chat.actions.block', 'Chặn')}
                </button>
              </div>
            </>,
            document.body
          )
        : null}
    </div>
  );
};

export default UsersList;
