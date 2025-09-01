// Barrel file to consolidate imports for ChatWindow

// third-party
export { default as toast } from 'react-hot-toast';
export { useTranslation } from 'react-i18next';
export { useState, useEffect, useRef } from 'react';

// services
export { chatService } from '../../../services/chatService';
export { groupService } from '../../../services/groupService';
export { getSocket } from '../../../services/socket';

// global hooks (outside components)
export { useMessageNotifications } from '../../../hooks/useMessageNotifications';

// local hooks
export { useChatSocket } from '../hooks/useChatSocket';
export { useChatData } from '../hooks/useChatData';
export { useMessageComposer } from '../hooks/useMessageComposer';
export { useAttachmentDownloader } from '../hooks/useAttachmentDownloader';
export { useGroupedMessages } from '../hooks/useGroupedMessages';
export { useFilteredUsers, useUnreadChats, useGroupOnline, useRemovableMembers, useNotificationItems } from '../hooks/useChatComputations';
export { useBellNavigation } from '../hooks/useBellNavigation';
export { usePreviewEscape } from '../hooks/usePreviewEscape';
export { useVisibilityRefresh } from '../hooks/useVisibilityRefresh';
export { useAutoScroll } from '../hooks/useAutoScroll';
export { useChatOpeners } from '../hooks/useChatOpeners';
export { useChatSettings } from '../hooks/useChatSettings';
export { useChatBackground } from '../hooks/useChatBackground';
export { useReadReceipts } from '../hooks/useReadReceipts';
export { useFriendRequestActions } from '../hooks/useFriendRequestActions';
export { useTypingAndGroupSync } from '../hooks/useTypingAndGroupSync';

// child components
export { default as ChatHeader } from './component-child/ChatWindow-child/ChatHeader';
export { default as UsersList } from './component-child/ChatWindow-child/UsersList';
export { default as ChatList } from './component-child/ChatWindow-child/ChatList';
export { default as ChatView } from './component-child/ChatWindow-child/ChatView';
export { default as MessageInput } from './component-child/ChatWindow-child/MessageInput';
export { default as ImagePreview } from './component-child/ChatWindow-child/ImagePreview';
export { default as GroupsTab } from './component-child/ChatWindow-child/GroupsTab.tsx';
export { default as GroupEditorModal } from './component-child/ChatWindow-child/GroupEditorModal';
export { default as RemoveMembersModal } from './component-child/ChatWindow-child/RemoveMembersModal';
export { default as ChatSettings } from './component-child/ChatWindow-child/ChatSettings';
export { default as SetPinModal } from './component-child/ChatWindow-child/SetPinModal';
export { default as EnterPinModal } from './component-child/ChatWindow-child/EnterPinModal';

// types and utils
export type { User, Message, MessageGroup, ChatWindowProps } from './component-child/ChatWindow-child/types';
export { getCachedUser } from './component-child/ChatWindow-child/utils';
export type { GroupSummary } from '../../../services/groupService';
