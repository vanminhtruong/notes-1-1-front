import { useCallback } from 'react';
import { settingsService } from '../../../../services/settingsService';
import { blockService } from '../../../../services/blockService';
import toast from 'react-hot-toast';
import type { TFunction } from 'i18next';

interface UseChatSettingsHandlerProps {
  setShowSettings: (v: boolean) => void;
  setReadStatusEnabled: (v: boolean) => void;
  setHidePhone: (v: boolean) => void;
  setHideBirthDate: (v: boolean) => void;
  setAllowMessagesFromNonFriends: (v: boolean) => void;
  setBlockedUsers: (v: Array<{ id: number; name: string; email?: string; avatar?: string | null }>) => void;
  t: TFunction<'dashboard'>;
  onRefreshFriends?: () => Promise<void>;
  onRefreshUsers?: (search?: string) => Promise<void>;
}

export const useChatSettingsHandler = ({
  setShowSettings,
  setReadStatusEnabled,
  setHidePhone,
  setHideBirthDate,
  setAllowMessagesFromNonFriends,
  setBlockedUsers,
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

  return {
    openSettings,
    closeSettings,
    refreshBlockedUsers,
    handleUnblockUser,
    handleToggleAllowMessagesFromNonFriends,
    handleToggleReadStatus,
    handleToggleHidePhone,
    handleToggleHideBirthDate,
  };
};
