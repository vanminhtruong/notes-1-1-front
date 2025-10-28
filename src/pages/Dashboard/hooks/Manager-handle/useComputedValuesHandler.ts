import { useMemo } from 'react';
import { 
  useUnreadChats, 
  useFilteredUsers, 
  useGroupedMessages, 
  useGroupOnline, 
  useRemovableMembers 
} from '../../components/interface/chatWindowImports';
import type { ChatItem, User, FriendRequest, GroupSummary, Message } from '../../components/interface/chatWindowImports';

interface UseComputedValuesHandlerParams {
  chatList: ChatItem[];
  unreadMap: Record<number, number>;
  users: User[];
  friends: User[];
  friendRequests: FriendRequest[];
  searchTerm: string;
  currentUserId: number | undefined;
  blockedUsers: number[];
  messages: Message[];
  selectedGroup: GroupSummary | null;
  onlineIds: Set<number>;
  t: (key: string, defaultValue?: string) => string;
}

export const useComputedValuesHandler = (params: UseComputedValuesHandlerParams) => {
  const {
    chatList,
    unreadMap,
    users,
    friends,
    friendRequests,
    searchTerm,
    currentUserId,
    blockedUsers,
    messages,
    selectedGroup,
    onlineIds,
    t,
  } = params;

  // Computed values using global hooks
  const unreadChats = useUnreadChats(chatList, unreadMap);
  const filteredUsers = useFilteredUsers(users, friends, friendRequests, searchTerm, currentUserId, blockedUsers);
  const groupedMessages = useGroupedMessages(messages);
  const isSelectedGroupOnline = useGroupOnline(selectedGroup, onlineIds, currentUserId);
  const removableMembers = useRemovableMembers(selectedGroup, friends, users, { id: currentUserId } as any, t);

  const scrollToBottom = () => {};

  return {
    unreadChats,
    filteredUsers,
    groupedMessages,
    isSelectedGroupOnline,
    removableMembers,
    scrollToBottom,
  };
};
