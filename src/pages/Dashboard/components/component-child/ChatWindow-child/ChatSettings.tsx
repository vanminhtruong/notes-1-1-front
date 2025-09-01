import React from 'react';
import { useTranslation } from 'react-i18next';

interface ChatSettingsProps {
  enabled: boolean;
  hasPin: boolean;
  readStatusEnabled: boolean;
  onBack: () => void;
  onToggle: (next: boolean) => void;
  onChangePin: () => void;
  onToggleReadStatus: (enabled: boolean) => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({ enabled, hasPin, readStatusEnabled, onBack, onToggle, onChangePin, onToggleReadStatus }) => {
  const { t } = useTranslation('dashboard');
  
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('chat.settings.title')}</h2>
        <button onClick={onBack} className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">{t('chat.settings.back')}</button>
      </div>

      <div className="p-4 space-y-6">
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
    </div>
  );
};

export default ChatSettings;
