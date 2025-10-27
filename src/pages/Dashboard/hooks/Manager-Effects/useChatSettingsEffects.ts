import { useEffect } from 'react';
import { getSocket } from '../../../../services/socket';
import { settingsService } from '../../../../services/settingsService';
import toast from 'react-hot-toast';

interface UseChatSettingsEffectsProps {
  e2eeEnabled: boolean;
  e2eeUnlocked: boolean;
  readStatusEnabled: boolean;
  allowMessagesFromNonFriends: boolean;
  hidePhone: boolean;
  hideBirthDate: boolean;
  setE2EEEnabled: (v: boolean) => void;
  setE2EEPinHash: (v: string | null) => void;
  setE2EEUnlocked: (v: boolean) => void;
  setShowEnterPin: (v: boolean) => void;
  setReadStatusEnabled: (v: boolean) => void;
  setHidePhone: (v: boolean) => void;
  setHideBirthDate: (v: boolean) => void;
  setAllowMessagesFromNonFriends: (v: boolean) => void;
  refreshBlockedUsers: () => Promise<void>;
}

export const useChatSettingsEffects = ({
  e2eeEnabled,
  e2eeUnlocked,
  readStatusEnabled,
  allowMessagesFromNonFriends,
  hidePhone,
  hideBirthDate,
  setE2EEEnabled,
  setE2EEPinHash,
  setE2EEUnlocked,
  setShowEnterPin,
  setReadStatusEnabled,
  setHidePhone,
  setHideBirthDate,
  setAllowMessagesFromNonFriends,
  refreshBlockedUsers,
}: UseChatSettingsEffectsProps) => {
  // Cross-tab + socket sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'e2ee_enabled' && e.newValue != null) {
        const enabled = e.newValue === '1';
        setE2EEEnabled(enabled);
        setE2EEUnlocked(false);
        if (enabled) {
          sessionStorage.setItem('e2ee_lock_started_at', String(Date.now()));
        } else {
          sessionStorage.removeItem('e2ee_lock_started_at');
        }
      }
    };
    window.addEventListener('storage', onStorage);
    const socket = getSocket();
    const onStatus = (payload: any) => {
      if (typeof payload?.enabled === 'boolean') {
        setE2EEEnabled(payload.enabled);
        setE2EEUnlocked(false);
        localStorage.setItem('e2ee_enabled', payload.enabled ? '1' : '0');
        if (payload.enabled) {
          sessionStorage.setItem('e2ee_lock_started_at', String(Date.now()));
        } else {
          sessionStorage.removeItem('e2ee_lock_started_at');
        }
      }
    };
    const onPinUpdated = ({ pinHash }: any) => setE2EEPinHash(pinHash);
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
      
      if (typeof payload.e2eeEnabled === 'boolean' && payload.e2eeEnabled !== e2eeEnabled) {
        setE2EEEnabled(payload.e2eeEnabled);
        localStorage.setItem('e2ee_enabled', payload.e2eeEnabled ? '1' : '0');
        if (!payload.e2eeEnabled) {
          setE2EEUnlocked(false);
          sessionStorage.removeItem('e2ee_unlocked');
        }
        changed = true;
      }
      
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

    if (socket) socket.on('e2ee_status', onStatus);
    if (socket) socket.on('e2ee_pin_updated', onPinUpdated);
    if (socket) socket.on('read_status_updated', onReadStatusUpdated);
    if (socket) socket.on('privacy_updated', onPrivacyUpdated);
    if (socket) socket.on('user_blocked', onUserBlocked as any);
    if (socket) socket.on('user_unblocked', onUserUnblocked as any);
    if (socket) socket.on('user_settings_updated', onAdminSettingsUpdate);

    return () => {
      window.removeEventListener('storage', onStorage);
      if (socket) {
        socket.off('e2ee_status', onStatus);
        socket.off('e2ee_pin_updated', onPinUpdated);
        socket.off('read_status_updated', onReadStatusUpdated);
        socket.off('privacy_updated', onPrivacyUpdated);
        socket.off('user_blocked', onUserBlocked as any);
        socket.off('user_unblocked', onUserUnblocked as any);
        socket.off('user_settings_updated', onAdminSettingsUpdate);
      }
    };
  }, [e2eeEnabled, readStatusEnabled, allowMessagesFromNonFriends, hidePhone, hideBirthDate, setE2EEEnabled, setE2EEPinHash, setE2EEUnlocked, setReadStatusEnabled, setHidePhone, setHideBirthDate, setAllowMessagesFromNonFriends, refreshBlockedUsers]);

  // Initial load E2EE
  useEffect(() => {
    settingsService
      .getE2EE()
      .then(({ enabled }) => {
        setE2EEEnabled(enabled);
        localStorage.setItem('e2ee_enabled', enabled ? '1' : '0');
        if (enabled && !e2eeUnlocked) {
          if (!sessionStorage.getItem('e2ee_lock_started_at')) {
            sessionStorage.setItem('e2ee_lock_started_at', String(Date.now()));
          }
          const prompted = sessionStorage.getItem('e2ee_pin_prompt_shown') === '1';
          if (!prompted) {
            setShowEnterPin(true);
            sessionStorage.setItem('e2ee_pin_prompt_shown', '1');
          }
        }
      })
      .catch(() => {});
  }, [e2eeUnlocked, setE2EEEnabled, setShowEnterPin]);

  // Initial load E2EE Pin
  useEffect(() => {
    settingsService
      .getE2EEPin()
      .then(({ pinHash }) => setE2EEPinHash(pinHash || null))
      .catch(() => {});
  }, [setE2EEPinHash]);

  // Initial load all settings
  useEffect(() => {
    const load = async () => {
      try {
        const [e2eeRes, pinRes, readStatusRes, privacyRes] = await Promise.all([
          settingsService.getE2EE(),
          settingsService.getE2EEPin(),
          settingsService.getReadStatus(),
          settingsService.getPrivacy(),
        ]);
        setE2EEEnabled(e2eeRes.enabled);
        localStorage.setItem('e2ee_enabled', e2eeRes.enabled ? '1' : '0');
        setE2EEPinHash(pinRes.pinHash);
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
  }, [setE2EEEnabled, setE2EEPinHash, setReadStatusEnabled, setHidePhone, setHideBirthDate, setAllowMessagesFromNonFriends, refreshBlockedUsers]);
};
