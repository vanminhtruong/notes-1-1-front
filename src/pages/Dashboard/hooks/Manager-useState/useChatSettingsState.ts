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
  e2eeEnabled: boolean;
  e2eePinHash: string | null;
  e2eeUnlocked: boolean;
  showSetPin: boolean;
  showEnterPin: boolean;
  readStatusEnabled: boolean;
  hidePhone: boolean;
  hideBirthDate: boolean;
  allowMessagesFromNonFriends: boolean;
  blockedUsers: Array<{ id: number; name: string; email?: string; avatar?: string | null }>;
  openSettings: () => void;
  closeSettings: () => void;
  setShowSetPin: (v: boolean) => void;
  setShowEnterPin: (v: boolean) => void;
  setE2EEUnlocked: (v: boolean) => void;
  handleToggleE2EE: (next: boolean) => void;
  handleToggleReadStatus: (enabled: boolean) => Promise<void>;
  handleToggleHidePhone: (enabled: boolean) => Promise<void>;
  handleToggleHideBirthDate: (enabled: boolean) => Promise<void>;
  handleToggleAllowMessagesFromNonFriends: (enabled: boolean) => Promise<void>;
  handleUnblockUser: (userId: number) => Promise<void>;
  handleSetPin: (payload: { pinHash: string; oldPinHash?: string }) => Promise<void>;
  setE2EEEnabled: (v: boolean) => void;
  setE2EEPinHash: (v: string | null) => void;
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
    setE2EEEnabled: state.setE2EEEnabled,
    setE2EEPinHash: state.setE2EEPinHash,
    setE2EEUnlocked: state.setE2EEUnlocked,
    setShowSetPin: state.setShowSetPin,
    setReadStatusEnabled: state.setReadStatusEnabled,
    setHidePhone: state.setHidePhone,
    setHideBirthDate: state.setHideBirthDate,
    setAllowMessagesFromNonFriends: state.setAllowMessagesFromNonFriends,
    setBlockedUsers: state.setBlockedUsers,
    e2eeEnabled: state.e2eeEnabled,
    t,
  });

  useChatSettingsEffects({
    e2eeEnabled: state.e2eeEnabled,
    e2eeUnlocked: state.e2eeUnlocked,
    readStatusEnabled: state.readStatusEnabled,
    allowMessagesFromNonFriends: state.allowMessagesFromNonFriends,
    hidePhone: state.hidePhone,
    hideBirthDate: state.hideBirthDate,
    setE2EEEnabled: state.setE2EEEnabled,
    setE2EEPinHash: state.setE2EEPinHash,
    setE2EEUnlocked: state.setE2EEUnlocked,
    setShowEnterPin: state.setShowEnterPin,
    setReadStatusEnabled: state.setReadStatusEnabled,
    setHidePhone: state.setHidePhone,
    setHideBirthDate: state.setHideBirthDate,
    setAllowMessagesFromNonFriends: state.setAllowMessagesFromNonFriends,
    refreshBlockedUsers: handlers.refreshBlockedUsers,
  });

  return {
    e2eeEnabled: state.e2eeEnabled,
    e2eePinHash: state.e2eePinHash,
    e2eeUnlocked: state.e2eeUnlocked,
    showSetPin: state.showSetPin,
    showEnterPin: state.showEnterPin,
    readStatusEnabled: state.readStatusEnabled,
    hidePhone: state.hidePhone,
    hideBirthDate: state.hideBirthDate,
    allowMessagesFromNonFriends: state.allowMessagesFromNonFriends,
    blockedUsers: state.blockedUsers,
    openSettings: handlers.openSettings,
    closeSettings: handlers.closeSettings,
    setShowSetPin: state.setShowSetPin,
    setShowEnterPin: state.setShowEnterPin,
    setE2EEUnlocked: state.setE2EEUnlocked,
    handleToggleE2EE: handlers.handleToggleE2EE,
    handleToggleReadStatus: handlers.handleToggleReadStatus,
    handleToggleHidePhone: handlers.handleToggleHidePhone,
    handleToggleHideBirthDate: handlers.handleToggleHideBirthDate,
    handleToggleAllowMessagesFromNonFriends: handlers.handleToggleAllowMessagesFromNonFriends,
    handleUnblockUser: handlers.handleUnblockUser,
    handleSetPin: handlers.handleSetPin,
    setE2EEEnabled: state.setE2EEEnabled,
    setE2EEPinHash: state.setE2EEPinHash,
    setReadStatusEnabled: state.setReadStatusEnabled,
    setHidePhone: state.setHidePhone,
    setHideBirthDate: state.setHideBirthDate,
    setAllowMessagesFromNonFriends: state.setAllowMessagesFromNonFriends,
    setBlockedUsers: state.setBlockedUsers,
    showSettings: state.showSettings,
  };
}
