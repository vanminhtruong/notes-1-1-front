import React from 'react';

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
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Settings</h2>
        <button onClick={onBack} className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Back</button>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">End-to-end encryption</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Protect your messages with a PIN on this account</div>
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
            {enabled ? 'Encryption is ON. Messages in All tab require a PIN each login to view.' : 'Encryption is OFF.'}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Read Status</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Show when messages are read by recipients</div>
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
            {readStatusEnabled ? 'Read receipts are enabled. Read receipts will work only if both you and the other person have this setting enabled.' : 'Read receipts are disabled. Others cannot see when you read their messages and you cannot see when others read yours.'}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">PIN</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{hasPin ? 'Change your PIN.' : 'Set a PIN to enable encryption.'}</div>
          </div>
          <button
            onClick={onChangePin}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {hasPin ? 'Change PIN' : 'Set PIN'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSettings;
