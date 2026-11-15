export interface ChatSettingsProps {
  readStatusEnabled: boolean;
  hidePhone: boolean;
  hideBirthDate: boolean;
  allowMessagesFromNonFriends: boolean;
  blockedUsers: Array<{ id: number; name: string; email?: string; avatar?: string | null }>;
  onBack: () => void;
  onToggleReadStatus: (enabled: boolean) => void;
  onToggleHidePhone: (enabled: boolean) => void;
  onToggleHideBirthDate: (enabled: boolean) => void;
  onToggleAllowMessagesFromNonFriends: (enabled: boolean) => void;
  onUnblockUser: (userId: number) => void;
}
