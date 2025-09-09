import type { NotificationItem } from './NotificationBell.interface';

export interface ChatHeaderProps {
  totalUnread: number;
  ring: boolean;
  ringSeq: number;
  notificationItems: NotificationItem[];
  searchTerm: string;
  activeTab: 'users' | 'chats' | 'unread' | 'groups';
  onClose: () => void;
  onItemClick: (userId: number) => void;
  onClearAll: () => void;
  onDeleteItem?: (id: number) => void;
  onSearchChange: (value: string) => void;
  onTabChange: (tab: 'users' | 'chats' | 'unread' | 'groups') => void;
  onOpenSettings: () => void;
  showSettings: boolean;
}
