import { Search, X } from 'lucide-react';
import NotificationBell from '../../NotificationBell';
import { useTranslation } from 'react-i18next';
import type { ChatHeaderProps } from '../../interface/ChatHeader.interface';
const ChatHeader = ({
  totalUnread,
  ring,
  ringSeq,
  notificationItems,
  notificationPagination,
  notificationLoading,
  searchTerm,
  activeTab,
  onClose,
  onItemClick,
  onClearAll,
  onItemDismissed,
  onLoadMoreNotifications,
  onSearchChange,
  onTabChange,
  onOpenSettings,
  showSettings
}: ChatHeaderProps) => {
  const { t } = useTranslation('dashboard');
  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between gap-3 mb-3 md-down:flex-wrap">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white md-down:w-full md-down:text-lg">{t('chat.header.title')}</h1>
        <div className="flex items-center gap-2 md-down:w-full md-down:justify-between md-down:gap-3">
          <button
            onClick={onOpenSettings}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors md-down:order-1"
          >
            <span className="text-gray-500 text-lg">⚙️</span>
          </button>
          <div className="md-down:order-2">
            <NotificationBell
              total={totalUnread}
              ring={ring}
              ringSeq={ringSeq}
              items={notificationItems}
              pagination={notificationPagination}
              isLoading={notificationLoading}
              onItemClick={onItemClick}
              onClearAll={onClearAll}
              onItemDismissed={onItemDismissed}
              onLoadMore={onLoadMoreNotifications}
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors md-down:order-3"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      {!showSettings && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('chat.header.searchPlaceholder')}
            value={searchTerm}
            onFocus={() => onTabChange('users')}
            onChange={(e) => onSearchChange(e.target.value)}
            name="chat-search"
            id="chat-search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            inputMode="search"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white text-sm placeholder-gray-500"
          />
        </div>
      )}

      {/* Filter Tabs */}
      {!showSettings && (
        <div className="flex gap-2 overflow-x-auto pb-1 md-down:flex-wrap md-down:gap-2 md-down:justify-start">
          <button
            onClick={() => onTabChange('chats')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeTab === 'chats'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t('chat.header.tabs.all')}
          </button>
          <button
            onClick={() => onTabChange('unread')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeTab === 'unread'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t('chat.header.tabs.unread')}
          </button>
          <button
            onClick={() => onTabChange('users')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t('chat.header.tabs.users')}
          </button>
          <button
            onClick={() => onTabChange('groups')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeTab === 'groups'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t('chat.header.tabs.groups')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
