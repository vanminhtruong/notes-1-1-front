import { chatService } from '../../../../services/chatService';
import toast from 'react-hot-toast';
import type { TFunction } from 'i18next';

interface Params {
  setUsers: (updater: any) => void;
  loadFriends: () => Promise<void> | void;
  loadFriendRequests: () => Promise<void> | void;
  loadUsers: (q?: string) => Promise<void> | void;
  searchTerm: string;
  loadChatList: () => Promise<void> | void;
  t: TFunction<'dashboard'>;
}

export function useFriendRequestActions({
  setUsers,
  loadFriends,
  loadFriendRequests,
  loadUsers,
  searchTerm,
  loadChatList,
  t,
}: Params) {
  const sendFriendRequest = async (userId: number) => {
    try {
      const response = await chatService.sendFriendRequest(userId);
      if (response.success) {
        toast.success(t('chat.success.sentFriendRequest'));
        setUsers((prev: any[]) => prev.filter((u: any) => u.id !== userId));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.generic'));
    }
  };

  const acceptFriendRequest = async (userId: number) => {
    try {
      const friendRequestsResponse = await chatService.getFriendRequests();
      const friendship = friendRequestsResponse.data.find((req: any) => req.requester.id === userId);

      if (friendship) {
        const response = await chatService.acceptFriendRequest(friendship.id);
        if (response.success) {
          toast.success(t('chat.success.acceptedFriendRequest'));
          loadFriends();
          loadFriendRequests();
          loadUsers(searchTerm);
          loadChatList();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.generic'));
    }
  };

  const rejectFriendRequest = async (userId: number) => {
    try {
      const friendRequestsResponse = await chatService.getFriendRequests();
      const friendship = friendRequestsResponse.data.find((req: any) => req.requester.id === userId);

      if (friendship) {
        const response = await chatService.rejectFriendRequest(friendship.id);
        if (response.success) {
          toast.success(t('chat.success.rejectedFriendRequest'));
          loadFriendRequests();
          loadUsers(searchTerm);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.generic'));
    }
  };

  return { sendFriendRequest, acceptFriendRequest, rejectFriendRequest };
}
