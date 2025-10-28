import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { blockService } from '@/services/blockService';
import type { User } from '../../components/interface/chatWindowImports';

interface UseBlockUserHandlerProps {
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  searchTerm: string;
  loadUsers: (term: string) => Promise<void>;
  refreshBlockedUsers: () => Promise<void>;
  confirmWithToast: (message: string) => Promise<boolean>;
  t: any;
}

export const useBlockUserHandler = ({
  setUsers,
  searchTerm,
  loadUsers,
  refreshBlockedUsers,
  confirmWithToast,
  t,
}: UseBlockUserHandlerProps) => {
  const handleBlockUser = useCallback(async (user: User) => {
    try {
      const ok = await confirmWithToast(String(t('chat.confirm.block', { name: user.name, defaultValue: `Bạn có chắc chắn muốn chặn ${user.name}?` } as any)));
      if (!ok) return;
      const res = await blockService.block(user.id);
      if (res?.success) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        await refreshBlockedUsers();
        try { await loadUsers(searchTerm); } catch {}
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('chat.errors.generic'));
    }
  }, [confirmWithToast, t, loadUsers, searchTerm, refreshBlockedUsers, setUsers]);

  return {
    handleBlockUser,
  };
};
