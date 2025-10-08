import { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';

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

  return (
    <div className="fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[520px] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="text-sm font-semibold">{String(t('chat.nickname.title', 'Đặt tên gọi nhớ'))}</div>
          <button
            onClick={onClose}
            className="w-8 h-8 inline-flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={String(t('actions.close','Close'))}
            title={String(t('actions.close','Close'))}
          >
            ✕
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-6">
          <div className="flex flex-col items-center gap-3 mb-5">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold shadow">
              {user.avatar ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                (user.name || '').charAt(0)
              )}
            </div>
            <div className="text-sm text-center text-gray-700 dark:text-gray-300">
              {String(t('chat.nickname.description', { name: user.name, defaultValue: 'Hãy đặt cho {{name}} một cái tên dễ nhớ. Lưu ý: Tên gọi nhớ sẽ chỉ hiển thị riêng với bạn.' } as any))}
            </div>
          </div>
          <div className="space-y-2">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={String(t('chat.nickname.inputPlaceholder', 'Nhập tên gọi nhớ'))}
              maxLength={60}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 text-right">{value.length}/60</div>
          </div>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
          >
            {String(t('actions.cancel', 'Hủy'))}
          </button>
          <button
            disabled={saving}
            onClick={handleConfirm}
            className={`px-3 py-2 rounded-md text-white text-sm ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {String(t('chat.nickname.confirm', 'Xác nhận'))}
          </button>
        </div>
      </div>
    </div>
  );
});

NicknameModal.displayName = 'NicknameModal';

export default NicknameModal;

