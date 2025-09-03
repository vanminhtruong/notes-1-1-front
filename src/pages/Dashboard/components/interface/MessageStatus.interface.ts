import type { Message } from './ChatTypes.interface';

export interface MessageStatusProps {
  message: Message;
  isOwnMessage: boolean;
  currentUserId?: number;
  allMessages?: Message[];
}
