import type { Message, MessageGroup } from './ChatTypes.interface';

export interface ChatViewProps {
  selectedChat: any;
  messages: Message[];
  groupedMessages: MessageGroup[];
  isPartnerTyping: boolean;
  typingUsers?: Array<{ id: any; name: string; avatar?: string }>;
  menuOpenKey: string | null;
  currentUserId?: number;
  initialAlias?: string | null;
  onBack: () => void;
  onMenuToggle: (key: string | null) => void;
  onRecallMessage: (msg: Message, scope: 'self' | 'all') => void;
  onRecallGroup: (group: MessageGroup, scope: 'self' | 'all') => void;
  onEditMessage: (msg: Message, content: string) => void | Promise<void>;
  onDownloadAttachment: (url: string) => void;
  onPreviewImage: (url: string) => void;
  // Lazy loading: parent will prepend older messages
  onPrependMessages?: (older: Message[]) => void;
  // Remove messages by IDs (for admin deletion)
  onRemoveMessages?: (messageIds: number[]) => void;
  // Initial history loading state (hide messages until loaded)
  initialLoading?: boolean;
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
  // Blocking state (1-1)
  blocked?: boolean;
  // Reply functionality
  replyingToMessage?: any;
  onClearReply?: () => void;
  onReplyRequested?: (message: any) => void;
  // Update recipient status when loading messages
  onUpdateRecipientStatus?: (isActive: boolean) => void;
}
