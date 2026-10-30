import { 
  useUnreadChats, 
  useFilteredUsers, 
  useGroupedMessages, 
  useGroupOnline, 
  useRemovableMembers 
} from '../../components/interface/chatWindowImports';
import type { User, GroupSummary, Message } from '../../components/interface/chatWindowImports';

interface UseComputedValuesHandlerParams {
  chatList: Parameters<typeof useUnreadChats>[0];
  unreadMap: Record<number, number>;
  users: User[];
  friends: User[];
  friendRequests: User[];
  searchTerm: string;
  currentUserId: number | undefined;
  blockedUsers: Parameters<typeof useFilteredUsers>[5];
  messages: Message[];
  selectedGroup: GroupSummary | null;
  onlineIds: Parameters<typeof useGroupOnline>[1];
  t: Parameters<typeof useRemovableMembers>[4];
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
  const currentUser = users.find((user) => user.id === currentUserId)
    ?? friends.find((user) => user.id === currentUserId);
  const removableMembers = useRemovableMembers(selectedGroup, friends, users, currentUser, t);

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
