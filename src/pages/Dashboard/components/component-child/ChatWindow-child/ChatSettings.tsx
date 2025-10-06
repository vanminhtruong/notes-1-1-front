import React, { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatSettingsProps } from '../../interface/ChatSettings.interface';
import BlockedUsersModal from './BlockedUsersModal';

const ChatSettings: React.FC<ChatSettingsProps> = memo(({ enabled, hasPin, readStatusEnabled, hidePhone, hideBirthDate, allowMessagesFromNonFriends, blockedUsers, onBack, onToggle, onChangePin, onToggleReadStatus, onToggleHidePhone, onToggleHideBirthDate, onToggleAllowMessagesFromNonFriends, onUnblockUser }) => {
  const { t } = useTranslation('dashboard');
  
  const [showBlocked, setShowBlocked] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('chat.settings.title')}</h2>
        <button onClick={onBack} className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">{t('chat.settings.back')}</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{t('chat.settings.encryption.title')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('chat.settings.encryption.description')}</div>
            </div>
            <button
              onClick={() => onToggle(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              aria-pressed={enabled}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {enabled ? t('chat.settings.encryption.enabled') : t('chat.settings.encryption.disabled')}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{t('chat.settings.readStatus.title')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('chat.settings.readStatus.description')}</div>
            </div>
            <button
              onClick={() => onToggleReadStatus(!readStatusEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${readStatusEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              aria-pressed={readStatusEnabled}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${readStatusEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {readStatusEnabled ? t('chat.settings.readStatus.enabled') : t('chat.settings.readStatus.disabled')}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0 pr-3">
              <div className="font-medium text-gray-900 dark:text-gray-100">{t('chat.settings.messagingFromNonFriends.title', 'Cho phép nhận tin nhắn từ người lạ')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('chat.settings.messagingFromNonFriends.description', 'Nếu bật, người chưa kết bạn vẫn có thể gửi tin nhắn cho bạn.')}</div>
            </div>
            <button
              onClick={() => onToggleAllowMessagesFromNonFriends(!allowMessagesFromNonFriends)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${allowMessagesFromNonFriends ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              aria-pressed={allowMessagesFromNonFriends}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allowMessagesFromNonFriends ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {allowMessagesFromNonFriends ? t('chat.settings.messagingFromNonFriends.enabled', 'Đã cho phép nhận tin từ người lạ') : t('chat.settings.messagingFromNonFriends.disabled', 'Không cho phép nhận tin từ người lạ')}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{t('chat.settings.privacy.hidePhone.title', 'Ẩn số điện thoại')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('chat.settings.privacy.hidePhone.description', 'Ẩn số điện thoại của bạn khỏi người khác')}</div>
            </div>
            <button
              onClick={() => onToggleHidePhone(!hidePhone)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hidePhone ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              aria-pressed={hidePhone}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hidePhone ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {hidePhone ? t('chat.settings.privacy.hidePhone.enabled', 'Số điện thoại sẽ bị ẩn') : t('chat.settings.privacy.hidePhone.disabled', 'Số điện thoại sẽ hiển thị')}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{t('chat.settings.privacy.hideBirthDate.title', 'Ẩn ngày sinh')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('chat.settings.privacy.hideBirthDate.description', 'Ẩn ngày sinh của bạn khỏi người khác')}</div>
            </div>
            <button
              onClick={() => onToggleHideBirthDate(!hideBirthDate)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hideBirthDate ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              aria-pressed={hideBirthDate}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hideBirthDate ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {hideBirthDate ? t('chat.settings.privacy.hideBirthDate.enabled', 'Ngày sinh sẽ bị ẩn') : t('chat.settings.privacy.hideBirthDate.disabled', 'Ngày sinh sẽ hiển thị')}
          </div>
        </div>

        {/* Blocked users entry */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{t('chat.settings.blocked.title', 'Người bị chặn')}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{t('chat.settings.blocked.description', 'Quản lý danh sách những người bạn đã chặn. Bạn có thể bỏ chặn bất kỳ lúc nào.')}</div>
          </div>
          <button
            onClick={() => setShowBlocked(true)}
            className="shrink-0 inline-flex items-center whitespace-nowrap px-3 py-1.5 text-sm rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {t('chat.settings.blocked.viewList', 'Xem danh sách')}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{t('chat.settings.pin.title')}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{hasPin ? t('chat.settings.pin.change') : t('chat.settings.pin.set')}</div>
          </div>
          <button
            onClick={onChangePin}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {hasPin ? t('chat.settings.pin.changeButton') : t('chat.settings.pin.setButton')}
          </button>
        </div>
      </div>
      {/* Modal: Blocked Users */}
      <BlockedUsersModal
        isOpen={showBlocked}
        users={blockedUsers as any}
        onUnblock={onUnblockUser}
        onClose={() => setShowBlocked(false)}
      />
    </div>
  );
});

ChatSettings.displayName = 'ChatSettings';

export default ChatSettings;
