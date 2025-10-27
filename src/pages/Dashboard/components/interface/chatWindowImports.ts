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
export { useChatSocket } from '../../hooks/Manager-Effects/useChatSocketEffects.ts';
export { useChatData } from '../../hooks/Manager-useState/useChatDataState.ts';
export { useMessageComposer } from '../../hooks/Manager-handle/useMessageComposerHandler.ts';
export { useAttachmentDownloader } from '../../hooks/Manager-handle/useAttachmentDownloaderHandler.ts';
export { useGroupedMessages } from '../../hooks/Manager-useState/useGroupedMessagesState.ts';
export { useFilteredUsers, useUnreadChats, useGroupOnline, useRemovableMembers, useNotificationItems } from '../../hooks/Manager-handle/useChatComputationsHandler.ts';
export { useBellNavigation } from '../../hooks/Manager-Effects/useBellNavigationEffect.ts';
export { usePreviewEscape } from '../../hooks/Manager-Effects/usePreviewEscapeEffect.ts';
export { useVisibilityRefresh } from '../../hooks/Manager-Effects/useVisibilityRefreshEffect.ts';
export { useAutoScroll } from '../../hooks/Manager-Effects/useAutoScrollEffect.ts';
export { useChatOpeners } from '../../hooks/Manager-handle/useChatOpenersHandler.ts';
export { useChatSettingsStateOnly } from '../../hooks/Manager-useState/useChatSettingsStateOnly.ts';
export { useChatSettingsHandler } from '../../hooks/Manager-handle/useChatSettingsHandler.ts';
export { useChatSettingsEffects } from '../../hooks/Manager-Effects/useChatSettingsEffects.ts';
export { useChatBackgroundState } from '../../hooks/Manager-useState/useChatBackgroundState.ts';
export { useChatBackgroundHandler } from '../../hooks/Manager-handle/useChatBackgroundHandler.ts';
export { useChatBackgroundEffects } from '../../hooks/Manager-Effects/useChatBackgroundEffects.ts';
export { useReadReceipts } from '../../hooks/Manager-Effects/useReadReceiptsEffect.ts';
export { useFriendRequestActions } from '../../hooks/Manager-handle/useFriendRequestActionsHandler.ts';
export { useTypingAndGroupSync } from '../../hooks/Manager-Effects/useTypingAndGroupSyncEffect.ts';

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
export { SharedNotesTab } from '../component-child/SharedNotesTab.tsx';

// types and utils
export type { User, Message, MessageGroup, ChatWindowProps } from './ChatTypes.interface.ts';
export { getCachedUser } from '../../../../utils/utils.ts';
export type { GroupSummary } from '../../../../services/groupService.ts';
