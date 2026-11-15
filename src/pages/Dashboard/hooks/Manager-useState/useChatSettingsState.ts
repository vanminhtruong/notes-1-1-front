// This file is kept for backward compatibility
// The actual implementation has been split into:
// - Manager-useState/useChatSettingsStateOnly.ts (state only)
// - Manager-handle/useChatSettingsHandler.ts (handlers)
// - Manager-Effects/useChatSettingsEffects.ts (effects)

import type { TFunction } from 'i18next';
import { useChatSettingsStateOnly } from './useChatSettingsStateOnly';
import { useChatSettingsHandler } from '../Manager-handle/useChatSettingsHandler';
import { useChatSettingsEffects } from '../Manager-Effects/useChatSettingsEffects';

export interface UseChatSettings {
  readStatusEnabled: boolean;
  hidePhone: boolean;
  hideBirthDate: boolean;
  allowMessagesFromNonFriends: boolean;
  blockedUsers: Array<{ id: number; name: string; email?: string; avatar?: string | null }>;
  openSettings: () => void;
  closeSettings: () => void;
  handleToggleReadStatus: (enabled: boolean) => Promise<void>;
  handleToggleHidePhone: (enabled: boolean) => Promise<void>;
  handleToggleHideBirthDate: (enabled: boolean) => Promise<void>;
  handleToggleAllowMessagesFromNonFriends: (enabled: boolean) => Promise<void>;
  handleUnblockUser: (userId: number) => Promise<void>;
  setReadStatusEnabled: (v: boolean) => void;
  setHidePhone: (v: boolean) => void;
  setHideBirthDate: (v: boolean) => void;
  setAllowMessagesFromNonFriends: (v: boolean) => void;
  setBlockedUsers: (v: Array<{ id: number; name: string; email?: string; avatar?: string | null }>) => void;
  showSettings: boolean;
}

// Wrapper hook for backward compatibility
export function useChatSettings(t: TFunction<'dashboard'>): UseChatSettings {
  const state = useChatSettingsStateOnly();

  const handlers = useChatSettingsHandler({
    setShowSettings: state.setShowSettings,
    setReadStatusEnabled: state.setReadStatusEnabled,
    setHidePhone: state.setHidePhone,
    setHideBirthDate: state.setHideBirthDate,
    setAllowMessagesFromNonFriends: state.setAllowMessagesFromNonFriends,
    setBlockedUsers: state.setBlockedUsers,
    t,
  });

  useChatSettingsEffects({
    readStatusEnabled: state.readStatusEnabled,
    allowMessagesFromNonFriends: state.allowMessagesFromNonFriends,
    hidePhone: state.hidePhone,
    hideBirthDate: state.hideBirthDate,
    setReadStatusEnabled: state.setReadStatusEnabled,
    setHidePhone: state.setHidePhone,
    setHideBirthDate: state.setHideBirthDate,
    setAllowMessagesFromNonFriends: state.setAllowMessagesFromNonFriends,
    refreshBlockedUsers: handlers.refreshBlockedUsers,
  });

  return {
    readStatusEnabled: state.readStatusEnabled,
    hidePhone: state.hidePhone,
    hideBirthDate: state.hideBirthDate,
    allowMessagesFromNonFriends: state.allowMessagesFromNonFriends,
    blockedUsers: state.blockedUsers,
    openSettings: handlers.openSettings,
    closeSettings: handlers.closeSettings,
    handleToggleReadStatus: handlers.handleToggleReadStatus,
    handleToggleHidePhone: handlers.handleToggleHidePhone,
    handleToggleHideBirthDate: handlers.handleToggleHideBirthDate,
    handleToggleAllowMessagesFromNonFriends: handlers.handleToggleAllowMessagesFromNonFriends,
    handleUnblockUser: handlers.handleUnblockUser,
    setReadStatusEnabled: state.setReadStatusEnabled,
    setHidePhone: state.setHidePhone,
    setHideBirthDate: state.setHideBirthDate,
    setAllowMessagesFromNonFriends: state.setAllowMessagesFromNonFriends,
    setBlockedUsers: state.setBlockedUsers,
    showSettings: state.showSettings,
  };
}
