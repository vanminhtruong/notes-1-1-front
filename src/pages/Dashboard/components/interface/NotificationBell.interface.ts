export type NotificationItem = {
  id: number;
  name: string;
  avatar?: string;
  count: number;
};

export interface NotificationBellProps {
  total: number;
  ring?: boolean;
  ringSeq?: number;
  items: NotificationItem[];
  onItemClick: (id: number) => void;
  onClearAll?: () => void;
}
