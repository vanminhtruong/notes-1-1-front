import { useMessageNotifications } from '../../components/interface/chatWindowImports';

// Only read receipts remain; no unread badge, map, or notification ring.
export const useMessageNotificationsHandler = () => useMessageNotifications();
