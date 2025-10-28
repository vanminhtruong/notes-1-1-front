import { useCallback } from 'react';
import { getSocket } from '../../../../services/socket';
import { settingsService } from '../../../../services/settingsService';
import { blockService } from '../../../../services/blockService';
import toast from 'react-hot-toast';
import type { TFunction } from 'i18next';

interface UseChatSettingsHandlerProps {
  setShowSettings: (v: boolean) => void;
  setE2EEEnabled: (v: boolean) => void;
  setE2EEPinHash: (v: string | null) => void;
  setE2EEUnlocked: (v: boolean) => void;
  setShowSetPin: (v: boolean) => void;
  setReadStatusEnabled: (v: boolean) => void;
  setHidePhone: (v: boolean) => void;
  setHideBirthDate: (v: boolean) => void;
  setAllowMessagesFromNonFriends: (v: boolean) => void;
  setBlockedUsers: (v: Array<{ id: number; name: string; email?: string; avatar?: string | null }>) => void;
  e2eeEnabled: boolean;
  t: TFunction<'dashboard'>;
  onRefreshFriends?: () => Promise<void>;
  onRefreshUsers?: (search?: string) => Promise<void>;
}

export const useChatSettingsHandler = ({
  setShowSettings,
  setE2EEEnabled,
  setE2EEPinHash,
  setE2EEUnlocked,
  setShowSetPin,
  setReadStatusEnabled,
  setHidePhone,
  setHideBirthDate,
  setAllowMessagesFromNonFriends,
  setBlockedUsers,
  e2eeEnabled,
  t,
  onRefreshFriends,
  onRefreshUsers,
}: UseChatSettingsHandlerProps) => {
  const openSettings = useCallback(() => setShowSettings(true), [setShowSettings]);
  const closeSettings = useCallback(() => setShowSettings(false), [setShowSettings]);

  const refreshBlockedUsers = useCallback(async () => {
    try {
      const res = await blockService.listBlockedUsers();
      if (res?.success && Array.isArray(res.data)) {
        setBlockedUsers(res.data as any);
      } else {
        setBlockedUsers([]);
      }
    } catch {
      // silent
    }
  }, [setBlockedUsers]);

  const handleToggleE2EE = useCallback((next: boolean) => {
    setE2EEEnabled(next);
    localStorage.setItem('e2ee_enabled', next ? '1' : '0');
    if (!next) {
      setE2EEUnlocked(false);
      sessionStorage.removeItem('e2ee_unlocked');
    }
    settingsService.setE2EE(next).catch(() => {
      const reverted = !next;
      setE2EEEnabled(reverted);
      localStorage.setItem('e2ee_enabled', reverted ? '1' : '0');
      toast.error(t('chat.errors.settingsUpdateFailed'));
    });
  }, [setE2EEEnabled, setE2EEUnlocked, t]);

  const handleUnblockUser = useCallback(async (userId: number) => {
    try {
      await blockService.unblock(userId);
      await refreshBlockedUsers();
      // Refresh friends and users list to sync with backend
      if (onRefreshFriends) {
        await onRefreshFriends();
      }
      if (onRefreshUsers) {
        await onRefreshUsers();
      }
      toast.success(t('chat.notifications.youUnblocked', { name: '', defaultValue: 'Unblocked user' }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('chat.errors.generic'));
    }
  }, [refreshBlockedUsers, t, onRefreshFriends, onRefreshUsers]);

  const handleToggleAllowMessagesFromNonFriends = useCallback(async (enabled: boolean) => {
    try {
      setAllowMessagesFromNonFriends(enabled);
      const res = await settingsService.setPrivacy({ allowMessagesFromNonFriends: enabled });
      setAllowMessagesFromNonFriends(res.allowMessagesFromNonFriends);
      toast.success(t('chat.success.settingsUpdated', 'Settings updated successfully'));
    } catch (error: any) {
      setAllowMessagesFromNonFriends(!enabled);
      toast.error(error?.response?.data?.message || t('chat.errors.settingsUpdateFailed', 'Failed to update settings'));
    }
  }, [setAllowMessagesFromNonFriends, t]);

  const handleToggleReadStatus = useCallback(async (enabled: boolean) => {
    try {
      setReadStatusEnabled(enabled);
      await settingsService.setReadStatus(enabled);
      toast.success(t('chat.success.settingsUpdated', 'Settings updated successfully'));
    } catch (error: any) {
      setReadStatusEnabled(!enabled);
      toast.error(error?.response?.data?.message || t('chat.errors.settingsUpdateFailed', 'Failed to update settings'));
    }
  }, [setReadStatusEnabled, t]);

  const handleToggleHidePhone = useCallback(async (enabled: boolean) => {
    try {
      setHidePhone(enabled);
      const res = await settingsService.setPrivacy({ hidePhone: enabled });
      setHidePhone(res.hidePhone);
      toast.success(t('chat.success.settingsUpdated', 'Settings updated successfully'));
    } catch (error: any) {
      setHidePhone(!enabled);
      toast.error(error?.response?.data?.message || t('chat.errors.settingsUpdateFailed', 'Failed to update settings'));
    }
  }, [setHidePhone, t]);

  const handleToggleHideBirthDate = useCallback(async (enabled: boolean) => {
    try {
      setHideBirthDate(enabled);
      const res = await settingsService.setPrivacy({ hideBirthDate: enabled });
      setHideBirthDate(res.hideBirthDate);
      toast.success(t('chat.success.settingsUpdated', 'Settings updated successfully'));
    } catch (error: any) {
      setHideBirthDate(!enabled);
      toast.error(error?.response?.data?.message || t('chat.errors.settingsUpdateFailed', 'Failed to update settings'));
    }
  }, [setHideBirthDate, t]);

  const handleSetPin = useCallback(async (payload: { pinHash: string; oldPinHash?: string }) => {
    try {
      const res = await settingsService.setE2EEPin({ pinHash: payload.pinHash, oldPinHash: payload.oldPinHash });
      const saved = res.pinHash || null;
      setE2EEPinHash(saved);
      if (saved && !e2eeEnabled) {
        setE2EEEnabled(true);
        localStorage.setItem('e2ee_enabled', '1');
        setE2EEUnlocked(false);
        sessionStorage.removeItem('e2ee_unlocked');
        sessionStorage.setItem('e2ee_lock_started_at', String(Date.now()));
        const socket = getSocket();
        if (socket) socket.emit('e2ee_status', { enabled: true });
        settingsService.setE2EE(true).catch(() => {
          setE2EEEnabled(false);
          localStorage.setItem('e2ee_enabled', '0');
          toast.error(t('chat.errors.encryptionEnableFailed'));
        });
      }
      setShowSetPin(false);
      toast.success(t('chat.success.pinUpdated'));
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('chat.errors.pinUpdateFailed');
      toast.error(msg);
    }
  }, [setE2EEPinHash, e2eeEnabled, setE2EEEnabled, setE2EEUnlocked, setShowSetPin, t]);

  return {
    openSettings,
    closeSettings,
    refreshBlockedUsers,
    handleToggleE2EE,
    handleUnblockUser,
    handleToggleAllowMessagesFromNonFriends,
    handleToggleReadStatus,
    handleToggleHidePhone,
    handleToggleHideBirthDate,
    handleSetPin,
  };
};
