import { useState } from 'react';

export const useChatSettingsStateOnly = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [e2eeEnabled, setE2EEEnabled] = useState<boolean>(() => localStorage.getItem('e2ee_enabled') === '1');
  const [e2eePinHash, setE2EEPinHash] = useState<string | null>(null);
  const [e2eeUnlocked, setE2EEUnlocked] = useState<boolean>(() => sessionStorage.getItem('e2ee_unlocked') === '1');
  const [showSetPin, setShowSetPin] = useState(false);
  const [showEnterPin, setShowEnterPin] = useState(false);
  const [readStatusEnabled, setReadStatusEnabled] = useState<boolean>(true);
  const [hidePhone, setHidePhone] = useState<boolean>(false);
  const [hideBirthDate, setHideBirthDate] = useState<boolean>(false);
  const [allowMessagesFromNonFriends, setAllowMessagesFromNonFriends] = useState<boolean>(true);
  const [blockedUsers, setBlockedUsers] = useState<Array<{ id: number; name: string; email?: string; avatar?: string | null }>>([]);

  return {
    showSettings,
    setShowSettings,
    e2eeEnabled,
    setE2EEEnabled,
    e2eePinHash,
    setE2EEPinHash,
    e2eeUnlocked,
    setE2EEUnlocked,
    showSetPin,
    setShowSetPin,
    showEnterPin,
    setShowEnterPin,
    readStatusEnabled,
    setReadStatusEnabled,
    hidePhone,
    setHidePhone,
    hideBirthDate,
    setHideBirthDate,
    allowMessagesFromNonFriends,
    setAllowMessagesFromNonFriends,
    blockedUsers,
    setBlockedUsers,
  };
};
