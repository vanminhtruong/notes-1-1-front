// Barrel file to consolidate imports for ChatWindow

// third-party
export { default as toast } from 'react-hot-toast';
export { useTranslation } from 'react-i18next';
export { useState, useEffect, useRef, useMemo } from 'react';

// services
export { chatService } from '../../../../services/chatService.ts';
export { groupService } from '../../../../services/groupService.ts';
export { getSocket } from '../../../../services/socket.ts';

// global hooks (outside components)
export { useMessageNotifications } from '../../../../hooks/useMessageNotifications.ts';

// local hooks
export { useChatSocket } from '../../hooks/useChatWindow/useChatSocket.ts';
export { useChatData } from '../../hooks/useChatWindow/useChatData.ts';
export { useMessageComposer } from '../../hooks/useChatWindow/useMessageComposer.ts';
export { useAttachmentDownloader } from '../../hooks/useChatWindow/useAttachmentDownloader.ts';
export { useGroupedMessages } from '../../hooks/useChatWindow/useGroupedMessages.ts';
export { useFilteredUsers, useUnreadChats, useGroupOnline, useRemovableMembers, useNotificationItems } from '../../hooks/useChatWindow/useChatComputations.ts';
export { useBellNavigation } from '../../hooks/useChatWindow/useBellNavigation.ts';
export { usePreviewEscape } from '../../hooks/useChatWindow/usePreviewEscape.ts';
export { useVisibilityRefresh } from '../../hooks/useChatWindow/useVisibilityRefresh.ts';
export { useAutoScroll } from '../../hooks/useChatWindow/useAutoScroll.ts';
export { useChatOpeners } from '../../hooks/useChatWindow/useChatOpeners.ts';
export { useChatSettings } from '../../hooks/useChatWindow/useChatSettings.ts';
export { useChatBackground } from '../../hooks/useChatWindow/useChatBackground.ts';
export { useReadReceipts } from '../../hooks/useChatWindow/useReadReceipts.ts';
export { useFriendRequestActions } from '../../hooks/useChatWindow/useFriendRequestActions.ts';
export { useTypingAndGroupSync } from '../../hooks/useChatWindow/useTypingAndGroupSync.ts';

// child components
export { default as ChatHeader } from '../component-child/ChatWindow-child/ChatHeader.tsx';
export { default as UsersList } from '../component-child/ChatWindow-child/UsersList.tsx';
export { default as ChatList } from '../component-child/ChatWindow-child/ChatList.tsx';
export { default as ChatView } from '../component-child/ChatWindow-child/ChatView.tsx';
export { default as MessageInput } from '../component-child/ChatWindow-child/MessageInput.tsx';
export { default as ImagePreview } from '../component-child/ChatWindow-child/ImagePreview.tsx';
export { default as GroupsTab } from '../component-child/ChatWindow-child/GroupsTab.tsx';
export { default as GroupEditorModal } from '../component-child/ChatWindow-child/GroupEditorModal.tsx';
export { default as RemoveMembersModal } from '../component-child/ChatWindow-child/RemoveMembersModal.tsx';
export { default as ChatSettings } from '../component-child/ChatWindow-child/ChatSettings.tsx';
export { default as SetPinModal } from '../component-child/ChatWindow-child/SetPinModal.tsx';
export { default as EnterPinModal } from '../component-child/ChatWindow-child/EnterPinModal.tsx';

// types and utils
export type { User, Message, MessageGroup, ChatWindowProps } from './ChatTypes.interface.ts';
export { getCachedUser } from '../../../../utils/utils.ts';
export type { GroupSummary } from '../../../../services/groupService.ts';
