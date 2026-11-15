import { useEffect } from 'react';
import { getSocket } from '../../../../services/socket';
import { settingsService } from '../../../../services/settingsService';
import toast from 'react-hot-toast';

interface UseChatSettingsEffectsProps {
  readStatusEnabled: boolean;
  allowMessagesFromNonFriends: boolean;
  hidePhone: boolean;
  hideBirthDate: boolean;
  setReadStatusEnabled: (v: boolean) => void;
  setHidePhone: (v: boolean) => void;
  setHideBirthDate: (v: boolean) => void;
  setAllowMessagesFromNonFriends: (v: boolean) => void;
  refreshBlockedUsers: () => Promise<void>;
}

export const useChatSettingsEffects = ({
  readStatusEnabled,
  allowMessagesFromNonFriends,
  hidePhone,
  hideBirthDate,
  setReadStatusEnabled,
  setHidePhone,
  setHideBirthDate,
  setAllowMessagesFromNonFriends,
  refreshBlockedUsers,
}: UseChatSettingsEffectsProps) => {
  // Cross-tab + socket sync
  useEffect(() => {
    const socket = getSocket();
    const onReadStatusUpdated = ({ enabled }: any) => setReadStatusEnabled(enabled);
    const onPrivacyUpdated = ({ hidePhone, hideBirthDate, allowMessagesFromNonFriends }: any) => {
      if (typeof hidePhone === 'boolean') setHidePhone(hidePhone);
      if (typeof hideBirthDate === 'boolean') setHideBirthDate(hideBirthDate);
      if (typeof allowMessagesFromNonFriends === 'boolean') setAllowMessagesFromNonFriends(allowMessagesFromNonFriends);
    };
    const onUserBlocked = () => { refreshBlockedUsers(); };
    const onUserUnblocked = () => { refreshBlockedUsers(); };

    // Admin changed settings - Real-time sync
    const onAdminSettingsUpdate = (payload: any) => {
      let changed = false;
      
      if (typeof payload.readStatusEnabled === 'boolean' && payload.readStatusEnabled !== readStatusEnabled) {
        setReadStatusEnabled(payload.readStatusEnabled);
        changed = true;
      }
      
      if (typeof payload.allowMessagesFromNonFriends === 'boolean' && payload.allowMessagesFromNonFriends !== allowMessagesFromNonFriends) {
        setAllowMessagesFromNonFriends(payload.allowMessagesFromNonFriends);
        changed = true;
      }
      
      if (typeof payload.hidePhone === 'boolean' && payload.hidePhone !== hidePhone) {
        setHidePhone(payload.hidePhone);
        changed = true;
      }
      
      if (typeof payload.hideBirthDate === 'boolean' && payload.hideBirthDate !== hideBirthDate) {
        setHideBirthDate(payload.hideBirthDate);
        changed = true;
      }
      
      if (changed && payload.message) {
        toast(payload.message, {
          icon: '⚙️',
          duration: 5000,
        });
      }
    };

    if (socket) socket.on('read_status_updated', onReadStatusUpdated);
    if (socket) socket.on('privacy_updated', onPrivacyUpdated);
    if (socket) socket.on('user_blocked', onUserBlocked as any);
    if (socket) socket.on('user_unblocked', onUserUnblocked as any);
    if (socket) socket.on('user_settings_updated', onAdminSettingsUpdate);

    return () => {
      if (socket) {
        socket.off('read_status_updated', onReadStatusUpdated);
        socket.off('privacy_updated', onPrivacyUpdated);
        socket.off('user_blocked', onUserBlocked as any);
        socket.off('user_unblocked', onUserUnblocked as any);
        socket.off('user_settings_updated', onAdminSettingsUpdate);
      }
    };
  }, [readStatusEnabled, allowMessagesFromNonFriends, hidePhone, hideBirthDate, setReadStatusEnabled, setHidePhone, setHideBirthDate, setAllowMessagesFromNonFriends, refreshBlockedUsers]);

  // Initial load all settings
  useEffect(() => {
    const load = async () => {
      try {
        const [readStatusRes, privacyRes] = await Promise.all([
          settingsService.getReadStatus(),
          settingsService.getPrivacy(),
        ]);
        setReadStatusEnabled(readStatusRes.enabled);
        setHidePhone(privacyRes.hidePhone);
        setHideBirthDate(privacyRes.hideBirthDate);
        setAllowMessagesFromNonFriends(privacyRes.allowMessagesFromNonFriends);
        await refreshBlockedUsers();
      } catch {
        // noop
      }
    };
    load();
  }, [setReadStatusEnabled, setHidePhone, setHideBirthDate, setAllowMessagesFromNonFriends, refreshBlockedUsers]);
};
