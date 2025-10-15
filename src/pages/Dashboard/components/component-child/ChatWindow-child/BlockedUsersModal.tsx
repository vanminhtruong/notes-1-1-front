import { useMemo, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ShieldOff, Search, UserX, AlertCircle } from 'lucide-react';

type BlockedUser = { id: number; name: string; email?: string; avatar?: string | null };

interface BlockedUsersModalProps {
  isOpen: boolean;
  users: readonly BlockedUser[];
  onUnblock: (userId: number) => void;
  onClose: () => void;
}

const BlockedUsersModal = memo(({ isOpen, users, onUnblock, onClose }: BlockedUsersModalProps) => {
  const { t } = useTranslation('dashboard');
  const [query, setQuery] = useState('');
  const [unblocking, setUnblocking] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users || [];
    return (users || []).filter((u) =>
      (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q))
    );
  }, [users, query]);

  const handleUnblock = async (userId: number) => {
    setUnblocking(userId);
    try {
      await onUnblock(userId);
    } finally {
      setUnblocking(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 xl-down:p-3.5 lg-down:p-3 md-down:p-2.5 sm-down:p-2 xs-down:p-1.5 z-50 animate-fadeIn"
      role="dialog" 
      aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl xl-down:rounded-xl lg-down:rounded-xl md-down:rounded-lg sm-down:rounded-lg xs-down:rounded-lg shadow-2xl w-[540px] max-w-full max-h-[90vh] overflow-hidden animate-slideUp flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 xl-down:px-5 xl-down:py-4 lg-down:px-5 lg-down:py-4 md-down:px-4 md-down:py-3.5 sm-down:px-3.5 sm-down:py-3 xs-down:px-3 xs-down:py-2.5">
          <div className="flex items-center gap-3 md-down:gap-2.5 xs-down:gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-md md-down:w-9 md-down:h-9 xs-down:w-8 xs-down:h-8">
              <ShieldOff className="w-5 h-5 text-white md-down:w-4.5 md-down:h-4.5 xs-down:w-4 xs-down:h-4" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white xl-down:text-lg lg-down:text-lg md-down:text-base sm-down:text-base xs-down:text-sm">
                {t('chat.settings.blocked.title', 'Người bị chặn')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 md-down:text-[11px] xs-down:text-[10px]">
                {t('chat.settings.blocked.subtitle', `${users?.length || 0} người đã bị chặn`)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all duration-200 md-down:w-7 md-down:h-7 xs-down:w-6 xs-down:h-6"
            aria-label={t('actions.close', 'Close')}
          >
            <X className="w-5 h-5 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 xl-down:p-5 lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3">
          {/* Search Input */}
          <div className="mb-4 md-down:mb-3 xs-down:mb-2.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 md-down:text-xs md-down:mb-1.5 xs-down:text-[11px] xs-down:mb-1">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
              {t('chat.settings.blocked.searchLabel', 'Tìm kiếm người bị chặn')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none md-down:pl-2.5 xs-down:pl-2">
                <Search className="h-5 w-5 text-gray-400 md-down:h-4 md-down:w-4 xs-down:h-3.5 xs-down:w-3.5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('chat.search.placeholder', 'Tìm kiếm...') as string}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 placeholder:text-gray-400 md-down:pl-9 md-down:pr-3 md-down:py-2 md-down:text-sm xs-down:pl-8 xs-down:pr-2.5 xs-down:py-1.5 xs-down:text-xs"
              />
            </div>
          </div>

          {/* User List */}
          <div className="border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden md-down:rounded-lg xs-down:rounded-md">
            <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 border-b border-gray-200 dark:border-gray-700 md-down:px-3 md-down:py-1.5 xs-down:px-2.5 xs-down:py-1">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide md-down:text-[11px] xs-down:text-[10px]">
                {t('chat.settings.blocked.listTitle', `Danh sách (${filtered.length})`)}
              </p>
            </div>
            <div className="max-h-[400px] overflow-y-auto md-down:max-h-[350px] sm-down:max-h-[300px] xs-down:max-h-[250px]">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center md-down:py-10 xs-down:py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 md-down:w-14 md-down:h-14 md-down:mb-2.5 xs-down:w-12 xs-down:h-12 xs-down:mb-2">
                    {users && users.length > 0 ? (
                      <Search className="w-8 h-8 text-gray-400 dark:text-gray-500 md-down:w-7 md-down:h-7 xs-down:w-6 xs-down:h-6" />
                    ) : (
                      <UserX className="w-8 h-8 text-gray-400 dark:text-gray-500 md-down:w-7 md-down:h-7 xs-down:w-6 xs-down:h-6" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 md-down:text-xs xs-down:text-[11px]">
                    {users && users.length > 0
                      ? t('chat.search.noResults', 'Không tìm thấy kết quả')
                      : t('chat.settings.blocked.empty', 'Bạn chưa chặn ai')}
                  </p>
                  {users && users.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 md-down:text-[11px] xs-down:text-[10px]">
                      {t('chat.search.tryDifferent', 'Thử tìm kiếm với từ khóa khác')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((u) => (
                    <div
                      key={u.id}
                      className="group flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 md-down:px-3 md-down:py-2.5 xs-down:px-2.5 xs-down:py-2"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 md-down:gap-2.5 xs-down:gap-2">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white dark:ring-gray-800 md-down:w-9 md-down:h-9 xs-down:w-8 xs-down:h-8">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm md-down:text-xs xs-down:text-[11px]">{(u.name || 'U').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-600 dark:bg-red-500 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5">
                            <ShieldOff className="w-3 h-3 text-white md-down:w-2.5 md-down:h-2.5 xs-down:w-2 xs-down:h-2" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate md-down:text-xs xs-down:text-[11px]">
                            {u.name}
                          </div>
                          {u.email && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate md-down:text-[11px] xs-down:text-[10px]">
                              {u.email}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnblock(u.id)}
                        disabled={unblocking === u.id}
                        className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg md-down:px-3 md-down:py-1.5 md-down:text-xs md-down:gap-1.5 xs-down:px-2.5 xs-down:py-1 xs-down:text-[11px] xs-down:gap-1"
                      >
                        {unblocking === u.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
                            {t('chat.settings.blocked.unblocking', 'Đang bỏ chặn...')}
                          </>
                        ) : (
                          <>
                            <ShieldOff className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
                            {t('chat.settings.blocked.unblock', 'Bỏ chặn')}
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info Notice */}
          {users && users.length > 0 && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg md-down:mt-3 md-down:p-2.5 xs-down:mt-2.5 xs-down:p-2">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
              <p className="text-xs text-blue-700 dark:text-blue-300 md-down:text-[11px] xs-down:text-[10px]">
                {t('chat.settings.blocked.notice', 'Khi bỏ chặn, bạn và người này có thể nhắn tin cho nhau trở lại')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end xl-down:px-5 xl-down:py-3.5 lg-down:px-5 lg-down:py-3.5 md-down:px-4 md-down:py-3 sm-down:px-3.5 sm-down:py-2.5 xs-down:px-3 xs-down:py-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 md-down:px-4 md-down:py-2 md-down:text-xs xs-down:px-3 xs-down:py-1.5 xs-down:text-[11px]"
          >
            {t('actions.close', 'Đóng')}
          </button>
        </div>
      </div>

      {/* Add animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
});

BlockedUsersModal.displayName = 'BlockedUsersModal';

export default BlockedUsersModal;

