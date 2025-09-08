import React from 'react';

export type CallMode = 'incoming' | 'outgoing' | 'active' | 'hidden';

interface CallUser {
  id: number;
  name?: string;
  avatar?: string | null;
}

interface CallModalProps {
  open: boolean;
  mode: CallMode;
  user: CallUser | null;
  elapsedSeconds?: number;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  onEnd?: () => void;
}

const CallModal: React.FC<CallModalProps> = ({ open, mode, user, elapsedSeconds = 0, onAccept, onReject, onCancel, onEnd }) => {
  if (!open || mode === 'hidden') return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeStr = `${pad(mins)}:${pad(secs)}`;
  const title = mode === 'incoming' ? 'Cuộc gọi đến' : mode === 'outgoing' ? 'Đang gọi...' : 'Đang trong cuộc gọi';
  const primaryAction = () => {
    if (mode === 'incoming') return onAccept;
    if (mode === 'outgoing') return onCancel;
    return onEnd;
  };
  const primaryText = mode === 'incoming' ? 'Chấp nhận' : mode === 'outgoing' ? 'Hủy' : 'Kết thúc';
  const secondaryAction = () => {
    if (mode === 'incoming') return onReject;
    return undefined;
  };
  const secondaryText = mode === 'incoming' ? 'Từ chối' : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold">
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.name || ''} className="w-full h-full object-cover" />
            ) : (
              (user?.name || '?').charAt(0)
            )}
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{user?.name || 'Người dùng'}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {mode === 'active' ? timeStr : title}
          </div>
          <div className="flex items-center justify-center gap-3">
            {secondaryAction() && (
              <button
                onClick={secondaryAction()}
                className="px-4 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50"
              >
                {secondaryText}
              </button>
            )}
            <button
              onClick={primaryAction()}
              className={`px-4 py-2 rounded-full ${mode === 'incoming' ? 'bg-green-600 hover:bg-green-700' : mode === 'outgoing' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
            >
              {primaryText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
