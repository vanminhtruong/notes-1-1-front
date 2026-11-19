import React, { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCheck, ChevronRight, Phone, Cake, ShieldOff, Settings2 } from 'lucide-react';
import type { ChatSettingsProps } from '../../interface/ChatSettings.interface';
import BlockedUsersModal from './BlockedUsersModal';
import './ChatSettings.scss';

interface SettingToggleProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

const SettingToggle = memo(({ icon, title, description, status, checked, onChange }: SettingToggleProps) => (
  <div className="cs-card">
    <div className={`cs-icon${checked ? ' cs-icon--on' : ''}`} aria-hidden="true">{icon}</div>
    <div className="cs-body">
      <div className="cs-name">{title}</div>
      <div className="cs-desc">{description}</div>
      <div className={`cs-status${checked ? ' cs-status--on' : ''}`}>{status}</div>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={title}
      className="cs-switch"
      onClick={() => onChange(!checked)}
    />
  </div>
));
SettingToggle.displayName = 'SettingToggle';

const ChatSettings: React.FC<ChatSettingsProps> = memo(({ readStatusEnabled, hidePhone, hideBirthDate, blockedUsers, onBack, onToggleReadStatus, onToggleHidePhone, onToggleHideBirthDate, onUnblockUser }) => {
  const { t } = useTranslation('dashboard');

  const [showBlocked, setShowBlocked] = useState(false);

  return (
    <div className="cs-root">
      <div className="cs-header">
        <div className="cs-header-brand">
          <div className="cs-logo" aria-hidden="true"><Settings2 size={20} /></div>
          <h2 className="cs-title">{t('chat.settings.title')}</h2>
        </div>
        <button type="button" onClick={onBack} className="cs-back">
          <ArrowLeft size={16} aria-hidden="true" />
          {t('chat.settings.back')}
        </button>
      </div>

      <div className="cs-scroll">
        <SettingToggle
          icon={<CheckCheck size={20} />}
          title={t('chat.settings.readStatus.title')}
          description={t('chat.settings.readStatus.description')}
          status={readStatusEnabled ? t('chat.settings.readStatus.enabled') : t('chat.settings.readStatus.disabled')}
          checked={!!readStatusEnabled}
          onChange={onToggleReadStatus}
        />

        <SettingToggle
          icon={<Phone size={20} />}
          title={t('chat.settings.privacy.hidePhone.title', 'Ẩn số điện thoại')}
          description={t('chat.settings.privacy.hidePhone.description', 'Ẩn số điện thoại của bạn khỏi người khác')}
          status={hidePhone ? t('chat.settings.privacy.hidePhone.enabled', 'Số điện thoại sẽ bị ẩn') : t('chat.settings.privacy.hidePhone.disabled', 'Số điện thoại sẽ hiển thị')}
          checked={!!hidePhone}
          onChange={onToggleHidePhone}
        />

        <SettingToggle
          icon={<Cake size={20} />}
          title={t('chat.settings.privacy.hideBirthDate.title', 'Ẩn ngày sinh')}
          description={t('chat.settings.privacy.hideBirthDate.description', 'Ẩn ngày sinh của bạn khỏi người khác')}
          status={hideBirthDate ? t('chat.settings.privacy.hideBirthDate.enabled', 'Ngày sinh sẽ bị ẩn') : t('chat.settings.privacy.hideBirthDate.disabled', 'Ngày sinh sẽ hiển thị')}
          checked={!!hideBirthDate}
          onChange={onToggleHideBirthDate}
        />

        {/* Blocked users entry */}
        <div className="cs-card">
          <div className="cs-icon cs-icon--danger" aria-hidden="true"><ShieldOff size={20} /></div>
          <div className="cs-body">
            <div className="cs-name">{t('chat.settings.blocked.title', 'Người bị chặn')}</div>
            <div className="cs-desc">{t('chat.settings.blocked.description', 'Quản lý danh sách những người bạn đã chặn. Bạn có thể bỏ chặn bất kỳ lúc nào.')}</div>
          </div>
          <button type="button" onClick={() => setShowBlocked(true)} className="cs-pill">
            {t('chat.settings.blocked.viewList', 'Xem danh sách')}
            <ChevronRight size={16} aria-hidden="true" />
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
