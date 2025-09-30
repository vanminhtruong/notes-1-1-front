import type { NotificationItem, NotificationPagination } from './NotificationBell.interface';

export interface ChatHeaderProps {
  totalUnread: number;
  ring: boolean;
  ringSeq: number;
  notificationItems: NotificationItem[];
  notificationPagination?: NotificationPagination;
  notificationLoading?: boolean;
  searchTerm: string;
  activeTab: 'users' | 'chats' | 'unread' | 'groups' | 'sharedNotes';
  onClose: () => void;
  onItemClick: (userId: number) => void;
  onClearAll: () => void;
  onItemDismissed?: (id: number) => void;
  onLoadMoreNotifications?: () => void;
  onSearchChange: (value: string) => void;
  onTabChange: (tab: 'users' | 'chats' | 'unread' | 'groups' | 'sharedNotes') => void;
  onOpenSettings: () => void;
  showSettings: boolean;
}
