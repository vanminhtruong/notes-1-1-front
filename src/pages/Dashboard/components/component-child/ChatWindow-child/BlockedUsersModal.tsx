import { createPortal } from 'react-dom';
import ModalScrollArea from '@/components/ModalScrollArea';
import { useMemo, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ShieldOff, Search, UserX, Info } from 'lucide-react';
import './ChatSettings.scss';

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

  const hasUsers = !!users && users.length > 0;

  return createPortal(
    <div className="cs-overlay" role="dialog" aria-modal="true">
      <div className="cs-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cs-modal-head">
          <div className="cs-modal-brand">
            <div className="cs-icon cs-icon--danger" aria-hidden="true"><ShieldOff size={20} /></div>
            <div>
              <h3 className="cs-modal-title">{t('chat.settings.blocked.title', 'Người bị chặn')}</h3>
              <p className="cs-modal-sub">{t('chat.settings.blocked.subtitle', { count: users?.length || 0 })}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="cs-close" aria-label={t('actions.close', 'Close')}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <ModalScrollArea className="cs-modal-body flex-1">
          {/* Search Input */}
          <label className="cs-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('chat.search.placeholder', 'Tìm kiếm...') as string}
              aria-label={t('chat.settings.blocked.searchLabel', 'Tìm kiếm người bị chặn')}
            />
          </label>

          {/* User List */}
          <div className="cs-list">
            <div className="cs-list-head">{t('chat.settings.blocked.listTitle', { count: filtered.length })}</div>
            <ModalScrollArea className="max-h-[400px] md-down:max-h-[350px] sm-down:max-h-[300px] xs-down:max-h-[250px]">
              {filtered.length === 0 ? (
                <div className="cs-empty">
                  <div className="cs-empty-icon">
                    {hasUsers ? <Search size={26} /> : <UserX size={26} />}
                  </div>
                  <p className="cs-empty-title">
                    {hasUsers
                      ? t('chat.search.noResults', 'Không tìm thấy kết quả')
                      : t('chat.settings.blocked.empty', 'Bạn chưa chặn ai')}
                  </p>
                  {hasUsers && (
                    <p className="cs-empty-sub">{t('chat.search.tryDifferent', 'Thử tìm kiếm với từ khóa khác')}</p>
                  )}
                </div>
              ) : (
                <div>
                  {filtered.map((u) => (
                    <div key={u.id} className="cs-row">
                      <div className="cs-user">
                        <div className="cs-avatar-wrap">
                          <div className="cs-avatar">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} />
                            ) : (
                              <span>{(u.name || 'U').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="cs-avatar-badge" aria-hidden="true"><ShieldOff size={10} /></div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="cs-user-name">{u.name}</div>
                          {u.email && <div className="cs-user-email">{u.email}</div>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnblock(u.id)}
                        disabled={unblocking === u.id}
                        className="cs-unblock"
                      >
                        {unblocking === u.id ? (
                          <>
                            <span className="cs-spinner" />
                            <span>{t('chat.settings.blocked.unblocking', 'Đang bỏ chặn...')}</span>
                          </>
                        ) : (
                          <>
                            <ShieldOff size={15} aria-hidden="true" />
                            <span>{t('chat.settings.blocked.unblock', 'Bỏ chặn')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </ModalScrollArea>
          </div>

          {/* Info Notice */}
          {hasUsers && (
            <div className="cs-notice">
              <Info size={15} aria-hidden="true" />
              <p>{t('chat.settings.blocked.notice', 'Khi bỏ chặn, bạn và người này có thể nhắn tin cho nhau trở lại')}</p>
            </div>
          )}
        </ModalScrollArea>

        {/* Footer */}
        <div className="cs-modal-foot">
          <button type="button" onClick={onClose} className="cs-btn-ghost">
            {t('actions.close', 'Đóng')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});

BlockedUsersModal.displayName = 'BlockedUsersModal';

export default BlockedUsersModal;
