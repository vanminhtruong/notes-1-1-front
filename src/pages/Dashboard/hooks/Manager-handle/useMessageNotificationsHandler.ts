import { useMessageNotifications } from '../../components/interface/chatWindowImports';

interface UseMessageNotificationsHandlerProps {
  currentUserId: number | undefined;
  selectedChatId: number | null;
  selectedGroupId: number | null;
}

export const useMessageNotificationsHandler = ({
  currentUserId,
  selectedChatId,
  selectedGroupId,
}: UseMessageNotificationsHandlerProps) => {
  const { 
    unreadMap, 
    ring, 
    ringSeq, 
    totalUnread, 
    totalGroupUnread, 
    markChatAsRead, 
    markGroupAsRead, 
    markAllRead, 
    hydrateFromChatList 
  } = useMessageNotifications(
    currentUserId,
    selectedChatId,
    selectedGroupId
  );

  return {
    unreadMap,
    ring,
    ringSeq,
    totalUnread,
    totalGroupUnread,
    markChatAsRead,
    markGroupAsRead,
    markAllRead,
    hydrateFromChatList,
  };
};
