export type NotificationItem = {
  id: number;
  name: string;
  avatar?: string;
  count: number;
  time?: string | number | Date;
};

export interface NotificationPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface NotificationBellProps {
  total: number;
  ring?: boolean;
  ringSeq?: number;
  items: NotificationItem[];
  pagination?: NotificationPagination;
  isLoading?: boolean;
  onItemClick: (id: number) => void;
  onClearAll?: () => void;
  onItemDismissed?: (id: number) => void;
  onLoadMore?: () => void;
}
