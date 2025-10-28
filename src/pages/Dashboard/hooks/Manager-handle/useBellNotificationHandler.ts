import { useCallback } from 'react';
import { notificationService } from '@/services/notificationService';

interface UseBellNotificationHandlerProps {
  setBellFeedItems: React.Dispatch<React.SetStateAction<Array<{ id: number; name: string; avatar?: string | null; count?: number; time?: string }>>>;
  setBellPagination: React.Dispatch<React.SetStateAction<any>>;
  setBellBadgeTotal: React.Dispatch<React.SetStateAction<number>>;
  setBellLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useBellNotificationHandler = ({
  setBellFeedItems,
  setBellPagination,
  setBellBadgeTotal,
  setBellLoading,
}: UseBellNotificationHandlerProps) => {
  const loadBellFeed = useCallback(async (page: number = 1, limit: number = 4) => {
    setBellLoading(true);
    try {
      const [feedRes, badgeRes] = await Promise.all([
        notificationService.getBellFeed({ page, limit }),
        notificationService.getBellBadge().catch(() => null),
      ]);
      if (feedRes?.success && feedRes.data) {
        if (page === 1) {
          setBellFeedItems(feedRes.data.items || []);
        } else {
          setBellFeedItems(prev => [...prev, ...(feedRes.data.items || [])]);
        }
        setBellPagination(feedRes.data.pagination);
      }
      if (badgeRes?.success) setBellBadgeTotal(Number(badgeRes.data?.total || 0));
    } catch {}
    finally {
      setBellLoading(false);
    }
  }, [setBellFeedItems, setBellPagination, setBellBadgeTotal, setBellLoading]);

  const handleBellItemDismiss = useCallback(async (id: number, loadBellFeed: (page: number) => Promise<void>) => {
    try {
      if (id === -1001) {
        await notificationService.dismissBellItem('fr');
        setBellFeedItems((prev) => prev.filter((x) => x.id !== -1001));
      } else if (id === -1002) {
        await notificationService.dismissBellItem('inv');
        setBellFeedItems((prev) => prev.filter((x) => x.id !== -1002));
      } else if (id <= -300000) {
        const groupId = -id - 300000;
        await notificationService.dismissBellItem('group', groupId);
        setBellFeedItems((prev) => prev.filter((x) => x.id !== id));
      } else {
        await notificationService.dismissBellItem('dm', id);
        setBellFeedItems((prev) => prev.filter((x) => x.id !== id));
      }
      await loadBellFeed(1);
    } catch (e) {}
  }, [setBellFeedItems]);

  const reloadBellFeed = useCallback(async () => {
    await loadBellFeed(1);
  }, [loadBellFeed]);

  return {
    loadBellFeed,
    handleBellItemDismiss,
    reloadBellFeed,
  };
};
