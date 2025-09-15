export type NotificationItem = {
  id: number;
  name: string;
  avatar?: string;
  count: number;
  time?: string | number | Date;
};

export interface NotificationBellProps {
  total: number;
  ring?: boolean;
  ringSeq?: number;
  items: NotificationItem[];
  onItemClick: (id: number) => void;
  onClearAll?: () => void;
  onItemDismissed?: (id: number) => void;
}
