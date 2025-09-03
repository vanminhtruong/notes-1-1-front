import { Search, Check, X, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UsersListProps } from '../../interface/ChatUI.interface';

const UsersList = ({
  friendRequests,
  filteredUsers,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onSendFriendRequest
}: UsersListProps) => {
  const { t } = useTranslation('dashboard');
  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* User Lists */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 px-2">
              {t('chat.usersList.friendRequests')}
            </h4>
            {friendRequests.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold text-lg shadow-md">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAcceptFriendRequest(user.id)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                    title={t('chat.usersList.actions.accept')}
                    aria-label={t('chat.usersList.actions.acceptRequest')}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onRejectFriendRequest(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    title={t('chat.usersList.actions.reject')}
                    aria-label={t('chat.usersList.actions.rejectRequest')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users search results (not friends, not self, no pending request) */}
        {filteredUsers.length > 0 && (
          <div className="mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 px-2">
              {t('chat.usersList.users')}
            </h4>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold text-lg shadow-md">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => onSendFriendRequest(user.id)}
                  className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('chat.usersList.sendRequest')}
                </button>
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
    </div>
  );
};

export default UsersList;
