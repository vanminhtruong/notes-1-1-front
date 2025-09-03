export interface ChatSettingsProps {
  enabled: boolean;
  hasPin: boolean;
  readStatusEnabled: boolean;
  hidePhone: boolean;
  hideBirthDate: boolean;
  onBack: () => void;
  onToggle: (next: boolean) => void;
  onChangePin: () => void;
  onToggleReadStatus: (enabled: boolean) => void;
  onToggleHidePhone: (enabled: boolean) => void;
  onToggleHideBirthDate: (enabled: boolean) => void;
}
