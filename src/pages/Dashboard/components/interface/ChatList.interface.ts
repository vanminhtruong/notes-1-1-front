import type { User, Message } from './ChatTypes.interface';

export interface ChatListProps {
  chatList: Array<{ friend: User; lastMessage: Message | null; unreadCount?: number; friendshipId?: number; isPinned?: boolean }>;
  friends: User[];
  unreadMap: Record<number, number>;
  currentUserId?: number;
  onStartChat: (user: User) => void;
  onRemoveFriend?: (friendshipId: number, friendName: string) => void;
  onDeleteMessages?: (friendId: number, friendName: string) => void;
  onRefreshChatList?: () => void;
  e2eeEnabled?: boolean;
  e2eeUnlocked?: boolean;
  lockedPlaceholder?: string;
}
