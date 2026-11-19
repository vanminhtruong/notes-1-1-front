import { createPortal } from 'react-dom';
import { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, UserPen } from 'lucide-react';
import ModalScrollArea from '@/components/ModalScrollArea';

type Props = {
  open: boolean;
  onClose: () => void;
  user: { id: number; name: string; avatar?: string | null } | null;
  initialNickname?: string;
  onConfirm: (nickname: string | null) => Promise<void> | void;
};

const NicknameModal = memo(function NicknameModal({ open, onClose, user, initialNickname = '', onConfirm }: Props) {
  const { t } = useTranslation('dashboard');
  const [value, setValue] = useState(initialNickname || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(initialNickname || '');
  }, [initialNickname, open]);

  if (!open || !user) return null;

  const handleConfirm = async () => {
    if (saving) return;
    try {
      setSaving(true);
      await onConfirm(value.trim() ? value.trim() : null);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="pm-overlay z-[10060]">
      <div className="pm-panel pm-panel--sm" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="pm-header">
          <h2 className="pm-title">
            <UserPen />
            {String(t('chat.nickname.title', 'Đặt tên gọi nhớ'))}
          </h2>
          <button
            onClick={onClose}
            className="pm-close"
            aria-label={String(t('actions.close', 'Close'))}
            title={String(t('actions.close', 'Close'))}
          >
            <X />
          </button>
        </div>
        {/* Body */}
        <ModalScrollArea className="pm-body">
          <div className="flex flex-col items-center gap-3 mb-5 text-center">
            <div
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold shadow-lg"
              style={{ background: 'var(--pm-grad)', color: 'var(--pm-on-accent)', boxShadow: '0 0 0 4px var(--pm-surface), 0 0 0 5px var(--pm-line-strong)' }}
            >
              {user.avatar ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                (user.name || '').charAt(0)
              )}
            </div>
            <p className="text-sm break-words" style={{ color: 'var(--pm-muted)' }}>
              {String(t('chat.nickname.description', { name: user.name, defaultValue: 'Hãy đặt cho {{name}} một cái tên dễ nhớ. Lưu ý: Tên gọi nhớ sẽ chỉ hiển thị riêng với bạn.' } as any))}
            </p>
          </div>
          <div>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={String(t('chat.nickname.inputPlaceholder', 'Nhập tên gọi nhớ'))}
              maxLength={60}
              className="pm-input w-full"
            />
            <div className="mt-1.5 text-xs text-right" style={{ color: 'var(--pm-muted)' }}>{value.length}/60</div>
          </div>
        </ModalScrollArea>
        {/* Footer */}
        <div className="pm-footer">
          <button onClick={onClose} className="pm-btn pm-btn--ghost">
            {String(t('actions.cancel', 'Hủy'))}
          </button>
          <button disabled={saving} onClick={handleConfirm} className="pm-btn pm-btn--primary">
            {String(t('chat.nickname.confirm', 'Xác nhận'))}
          </button>
        </div>
      </div>
    </div>
  , document.body);
});

NicknameModal.displayName = 'NicknameModal';

export default NicknameModal;
