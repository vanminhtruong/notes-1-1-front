import { useEffect } from 'react';
import { getSocket } from '../../components/interface/chatWindowImports';
import type { User } from '../../components/interface/chatWindowImports';

interface UseUserStatusUpdateEffectProps {
  selectedChat: User | null;
  setSelectedChat: React.Dispatch<React.SetStateAction<User | null>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setFriends: React.Dispatch<React.SetStateAction<User[]>>;
  setChatList: React.Dispatch<React.SetStateAction<any[]>>;
}

export const useUserStatusUpdateEffect = ({
  selectedChat,
  setSelectedChat,
  setUsers,
  setFriends,
  setChatList,
}: UseUserStatusUpdateEffectProps) => {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUserStatusUpdate = (data: { userId: number; isActive: boolean }) => {
      if (selectedChat && selectedChat.id === data.userId) {
        setSelectedChat((prev) => prev ? { ...prev, isActive: data.isActive } : null);
      }

      setUsers((prev) => 
        prev.map((u) => u.id === data.userId ? { ...u, isActive: data.isActive } : u)
      );

      setFriends((prev) => 
        prev.map((u) => u.id === data.userId ? { ...u, isActive: data.isActive } : u)
      );

      setChatList((prev) =>
        prev.map((chat) =>
          chat.friend.id === data.userId
            ? { ...chat, friend: { ...chat.friend, isActive: data.isActive } }
            : chat
        )
      );
    };

    socket.on('user_status_updated', handleUserStatusUpdate);

    return () => {
      socket.off('user_status_updated', handleUserStatusUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.id]);
};
