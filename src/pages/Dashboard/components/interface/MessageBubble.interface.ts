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
  onDownloadAttachment: (url: string) => void;
  onPreviewImage: (url: string) => void;
}
