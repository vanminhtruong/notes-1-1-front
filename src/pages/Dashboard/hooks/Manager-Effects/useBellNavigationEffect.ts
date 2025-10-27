import type React from 'react';
import type { User } from '../../components/interface/ChatTypes.interface';
import type { GroupSummary } from '../../../../services/groupService';

export function useBellNavigation(
  params: {
    friends: User[];
    users: User[];
    myGroups: GroupSummary[];
    startChat: (user: User) => void;
    startGroupChat: (group: GroupSummary) => void;
    setActiveTab: React.Dispatch<React.SetStateAction<'users' | 'chats' | 'unread' | 'groups' | 'sharedNotes'>>;
  }
) {
  const { friends, users, myGroups, startChat, startGroupChat, setActiveTab } = params;

  const openChatById = (userId: number) => {
    const user = friends.find((f) => f.id === userId) || users.find((u) => u.id === userId);
    if (user) startChat(user);
  };

  const handleBellItemClick = (id: number) => {
    if (id === -1001) {
      setActiveTab('users');
      return;
    }
    if (id === -1002) {
      setActiveTab('groups');
      return;
    }
    if (id <= -300000) {
      const gid = -(id + 300000);
      const g = myGroups.find((gg) => gg.id === gid);
      if (g) {
        startGroupChat(g);
      } else {
        setActiveTab('groups');
      }
      return;
    }
    openChatById(id);
  };

  return { handleBellItemClick };
}
