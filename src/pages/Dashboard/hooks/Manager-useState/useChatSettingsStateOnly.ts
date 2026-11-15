import { useState } from 'react';

export const useChatSettingsStateOnly = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [readStatusEnabled, setReadStatusEnabled] = useState<boolean>(true);
  const [hidePhone, setHidePhone] = useState<boolean>(false);
  const [hideBirthDate, setHideBirthDate] = useState<boolean>(false);
  const [allowMessagesFromNonFriends, setAllowMessagesFromNonFriends] = useState<boolean>(true);
  const [blockedUsers, setBlockedUsers] = useState<Array<{ id: number; name: string; email?: string; avatar?: string | null }>>([]);

  return {
    showSettings,
    setShowSettings,
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
