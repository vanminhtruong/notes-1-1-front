import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { chatService } from '../../components/interface/chatWindowImports';
import type { User, Message } from '../../components/interface/chatWindowImports';

interface UseChatListHandlerProps {
  friends: User[];
  users: User[];
  selectedChat: User | null;
  setChatList: React.Dispatch<React.SetStateAction<Array<{ friend: User; lastMessage: Message | null; unreadCount?: number; friendshipId?: number; isPinned?: boolean }>>>;
  setMessages: React.Dispatch<React.SetStateAction<(Message | any)[]>>;
  loadFriends: () => Promise<void>;
  loadChatList: () => Promise<void>;
  t: any;
}

export const useChatListHandler = ({
  friends,
  users,
  selectedChat,
  setChatList,
  setMessages,
  loadFriends,
  loadChatList,
  t,
}: UseChatListHandlerProps) => {
  const upsertChatListWithMessage = useCallback((otherUserId: number, msg: Message) => {
    setChatList((prev) => {
      const baseFriend = friends.find((f) => f.id === otherUserId) || users.find((u) => u.id === otherUserId);
      if (!baseFriend) return prev;
      const exists = prev.some((it) => it.friend.id === otherUserId);
      if (!exists) return prev;
      
      const enrichFromMsg = (it: typeof prev[number]) => {
        let name = it.friend.name;
        let avatar = (it.friend as any).avatar || null;
        const isOtherSender = (msg as any)?.senderId === otherUserId;
        const isOtherReceiver = (msg as any)?.receiverId === otherUserId;
        if (isOtherSender) {
          if ((msg as any)?.senderName) name = (msg as any).senderName;
          if ((msg as any)?.senderAvatar !== undefined) avatar = (msg as any).senderAvatar;
        } else if (isOtherReceiver) {
          if ((msg as any)?.receiverName) name = (msg as any).receiverName;
          if ((msg as any)?.receiverAvatar !== undefined) avatar = (msg as any).receiverAvatar;
        }
        return { ...it.friend, name, avatar } as any;
      };
      
      return prev.map((it) => (
        it.friend.id === otherUserId
          ? { ...it, friend: enrichFromMsg(it), lastMessage: msg }
          : it
      ));
    });
  }, [friends, users, setChatList]);

  const handleDeleteMessages = useCallback(async (friendId: number, friendName: string) => {
    try {
      const response = await chatService.deleteAllMessages(friendId);
      if (response.success) {
        toast.success(t('chat.success.messagesDeletedForMe', { name: friendName }));
        setChatList((prev) => prev.map((item) => 
          item.friend.id === friendId 
            ? { ...item, lastMessage: null, unreadCount: 0 }
            : item
        ));
        if (selectedChat?.id === friendId) {
          setMessages([]);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.generic'));
    }
  }, [selectedChat?.id, setChatList, setMessages, t]);

  const handleRemoveFriend = useCallback(async (friendshipId: number, friendName: string) => {
    try {
      const response = await chatService.removeFriend(friendshipId);
      if (response.success) {
        toast.success(t('chat.success.friendRemoved', { name: friendName }));
        loadFriends();
        loadChatList();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.generic'));
    }
  }, [t, loadFriends, loadChatList]);

  return {
    upsertChatListWithMessage,
    handleDeleteMessages,
    handleRemoveFriend,
  };
};
