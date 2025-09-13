export interface ChatSettingsProps {
  enabled: boolean;
  hasPin: boolean;
  readStatusEnabled: boolean;
  hidePhone: boolean;
  hideBirthDate: boolean;
  allowMessagesFromNonFriends: boolean;
  blockedUsers: Array<{ id: number; name: string; email?: string; avatar?: string | null }>;
  onBack: () => void;
  onToggle: (next: boolean) => void;
  onChangePin: () => void;
  onToggleReadStatus: (enabled: boolean) => void;
  onToggleHidePhone: (enabled: boolean) => void;
  onToggleHideBirthDate: (enabled: boolean) => void;
  onToggleAllowMessagesFromNonFriends: (enabled: boolean) => void;
  onUnblockUser: (userId: number) => void;
}
