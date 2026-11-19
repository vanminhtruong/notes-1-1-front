import { useCallback } from 'react';
import { notificationService } from '@/services/notificationService';

interface UseSearchAndNotificationHandlerProps {
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  loadUsers: (term: string) => Promise<void>;

  loadNotifications: () => Promise<void>;
  loadPendingInvites: () => Promise<void>;
  loadBellFeed: (page: number) => Promise<void>;
}

export const useSearchAndNotificationHandler = ({
  setSearchTerm,
  loadUsers,

  loadNotifications,
  loadPendingInvites,
  loadBellFeed,
}: UseSearchAndNotificationHandlerProps) => {
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    loadUsers(value);
  }, [loadUsers, setSearchTerm]);

  const handleClearAll = useCallback(async () => {
    try {

      await notificationService.markAllRead();
      try { await loadNotifications(); } catch {}
      try { await loadPendingInvites(); } catch {}
      try { await loadBellFeed(1); } catch {}
    } catch {}
  }, [loadNotifications, loadPendingInvites, loadBellFeed]);

  return {
    handleSearchChange,
    handleClearAll,
  };
};
