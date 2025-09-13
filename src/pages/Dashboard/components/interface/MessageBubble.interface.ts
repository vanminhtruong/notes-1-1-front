import type { Message } from './ChatTypes.interface';

export interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  isRecalled?: boolean;
  menuOpenKey: string | null;
  messageKey: string;
  showMenu: boolean;
  currentUserId?: number;
  allMessages?: Message[];
  onMenuToggle: (key: string | null) => void;
  onRecallMessage: (msg: Message, scope: 'self' | 'all') => void;
  onEditMessage: (msg: Message, content: string) => void | Promise<void>;
  onDownloadAttachment: (url: string) => void;
  onPreviewImage: (url: string) => void;
  // Pin/unpin support
  pinnedIdSet?: Set<number> | number[];
  onTogglePinMessage?: (messageId: number, nextPinned: boolean) => void;
  // Open user info modal
  onOpenProfile?: (user: { id: number; name?: string; avatar?: string | null }) => void;
  // Disable reactions UI (e.g., when blocked in 1-1 chat)
  disableReactions?: boolean;
  // Reply functionality
  onReplyMessage?: (msg: Message) => void;
  // Jump to replied message
  onJumpToMessage?: (messageId: number) => void;
}
