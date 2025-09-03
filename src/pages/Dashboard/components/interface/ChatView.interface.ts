import type { Message, MessageGroup } from './ChatTypes.interface';

export interface ChatViewProps {
  selectedChat: any;
  messages: Message[];
  groupedMessages: MessageGroup[];
  isPartnerTyping: boolean;
  typingUsers?: Array<{ id: any; name: string; avatar?: string }>;
  menuOpenKey: string | null;
  currentUserId?: number;
  onBack: () => void;
  onMenuToggle: (key: string | null) => void;
  onRecallMessage: (msg: Message, scope: 'self' | 'all') => void;
  onRecallGroup: (group: MessageGroup, scope: 'self' | 'all') => void;
  onDownloadAttachment: (url: string) => void;
  onPreviewImage: (url: string) => void;
  // Group mode
  isGroup?: boolean;
  groupOnline?: boolean;
  onLeaveGroup?: () => void;
  // Group editing
  isGroupOwner?: boolean;
  onEditGroup?: () => void;
  onDeleteGroup?: () => void;
  onRemoveMembers?: () => void;
  // E2EE masking
  maskMessages?: boolean;
  lockedNotice?: string;
  onUnlock?: () => void;
  // Per-chat background (1-1)
  backgroundUrl?: string | null;
  onChangeBackground?: () => void;
  onChangeBackgroundForBoth?: () => void;
  onResetBackground?: () => void;
}
