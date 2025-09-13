import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type BlockedUser = { id: number; name: string; email?: string; avatar?: string | null };

interface BlockedUsersModalProps {
  isOpen: boolean;
  users: BlockedUser[];
  onUnblock: (userId: number) => void;
  onClose: () => void;
}

const BlockedUsersModal: React.FC<BlockedUsersModalProps> = ({ isOpen, users, onUnblock, onClose }) => {
  const { t } = useTranslation('dashboard');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users || [];
    return (users || []).filter((u) =>
      (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q))
    );
  }, [users, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('chat.settings.blocked.title', 'Người bị chặn')}
          </h3>
          <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" onClick={onClose} aria-label={t('actions.close', 'Close')}>
            &times;
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('chat.search.placeholder', 'Search…') as string}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="max-h-80 overflow-auto divide-y divide-gray-200 dark:divide-gray-800 rounded-md border border-gray-200 dark:border-gray-800">
            {filtered.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold text-sm">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      (u.name || 'U').charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{u.name}</div>
                    {u.email && <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</div>}
                  </div>
                </div>
                <button
                  onClick={() => onUnblock(u.id)}
                  className="shrink-0 inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('chat.settings.blocked.unblock', 'Bỏ chặn')}
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {users && users.length > 0
                  ? t('chat.search.noResults', 'No results')
                  : t('chat.settings.blocked.empty', "Bạn chưa chặn ai")}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {t('chat.settings.back', 'Back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockedUsersModal;
