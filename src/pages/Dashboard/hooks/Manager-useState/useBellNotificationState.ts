import { useState } from 'react';
import type { NotificationPagination } from '../../components/interface/NotificationBell.interface';

export const useBellNotificationState = () => {
  const [bellFeedItems, setBellFeedItems] = useState<Array<{ id: number; name: string; avatar?: string | null; count?: number; time?: string }>>([]);
  const [bellBadgeTotal, setBellBadgeTotal] = useState<number>(0);
  const [bellPagination, setBellPagination] = useState<NotificationPagination | undefined>(undefined);
  const [bellLoading, setBellLoading] = useState<boolean>(false);

  return {
    bellFeedItems,
    setBellFeedItems,
    bellBadgeTotal,
    setBellBadgeTotal,
    bellPagination,
    setBellPagination,
    bellLoading,
    setBellLoading,
  };
};
