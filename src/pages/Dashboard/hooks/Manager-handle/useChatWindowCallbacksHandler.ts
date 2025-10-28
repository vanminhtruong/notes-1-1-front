import { useCallback } from 'react';
import { getSocket } from '../../components/interface/chatWindowImports';
import type { User, GroupSummary } from '../../components/interface/chatWindowImports';

interface UseChatWindowCallbacksHandlerProps {
  selectedChat: User | null;
  selectedGroup: GroupSummary | null;
  setSelectedChat: React.Dispatch<React.SetStateAction<User | null>>;
  setSelectedGroup: React.Dispatch<React.SetStateAction<GroupSummary | null>>;
  setActiveTab: React.Dispatch<React.SetStateAction<'users' | 'chats' | 'unread' | 'groups' | 'sharedNotes'>>;
  setReplyingToMessage: React.Dispatch<React.SetStateAction<any | null>>;
  setShowGroupEditor: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRemoveMembers: React.Dispatch<React.SetStateAction<boolean>>;
  setPreviewImage: React.Dispatch<React.SetStateAction<string | null>>;
  setPendingImages: React.Dispatch<React.SetStateAction<Array<{ id: string; file: File; preview: string }>>>;
  setPendingFiles: React.Dispatch<React.SetStateAction<Array<{ id: string; file: File }>>>;
  typingSentRef: React.MutableRefObject<boolean>;
  chatSettingsState: any;
  chatBackgroundHandler: any;
}

export const useChatWindowCallbacksHandler = ({
  selectedChat,
  selectedGroup,
  setSelectedChat,
  setSelectedGroup,
  setActiveTab,
  setReplyingToMessage,
  setShowGroupEditor,
  setShowRemoveMembers,
  setPreviewImage,
  setPendingImages,
  setPendingFiles,
  typingSentRef,
  chatSettingsState,
  chatBackgroundHandler,
}: UseChatWindowCallbacksHandlerProps) => {
  const handleBackToChats = useCallback(() => {
    setSelectedChat(null);
    setActiveTab('chats');
  }, [setSelectedChat, setActiveTab]);

  const handleBackToGroups = useCallback(() => {
    const gid = selectedGroup?.id;
    setSelectedGroup(null);
    setActiveTab('groups');
    if (typeof window !== 'undefined' && gid) {
      setTimeout(() => {
        try { window.dispatchEvent(new CustomEvent('group_marked_read', { detail: { groupId: gid } })); } catch {}
      }, 60);
    }
  }, [selectedGroup?.id, setSelectedGroup, setActiveTab]);

  const handleUnlock = useCallback(() => chatSettingsState.setShowEnterPin(true), [chatSettingsState]);
  const handleSetReplyingToMessage = useCallback((m: any) => setReplyingToMessage(m), [setReplyingToMessage]);
  const handleClearReply = useCallback(() => setReplyingToMessage(null), [setReplyingToMessage]);
  const handleCloseGroupEditor = useCallback(() => setShowGroupEditor(false), [setShowGroupEditor]);
  const handleCloseRemoveMembers = useCallback(() => setShowRemoveMembers(false), [setShowRemoveMembers]);
  const handlePreviewImage = useCallback((url: string | null) => setPreviewImage(url), [setPreviewImage]);
  const handleClosePreview = useCallback(() => setPreviewImage(null), [setPreviewImage]);
  const handleRemoveImage = useCallback((id: string) => setPendingImages((prev) => prev.filter((p) => p.id !== id)), [setPendingImages]);
  const handleRemoveFile = useCallback((id: string) => setPendingFiles((prev) => prev.filter((p) => p.id !== id)), [setPendingFiles]);

  const handleTypingStop = useCallback(() => {
    const socket = getSocket();
    if (socket && selectedChat) {
      socket.emit('typing_stop', { receiverId: selectedChat.id });
      typingSentRef.current = false;
    }
  }, [selectedChat, typingSentRef]);

  const handleGroupTypingStop = useCallback(() => {
    const socket = getSocket();
    if (socket && selectedGroup) {
      socket.emit('group_typing', { groupId: selectedGroup.id, isTyping: false });
      typingSentRef.current = false;
    }
  }, [selectedGroup, typingSentRef]);

  const handleChangeBackground = useCallback(async () => {
    if (!selectedChat) return;
    await chatBackgroundHandler.changeBackground(selectedChat.id);
  }, [selectedChat, chatBackgroundHandler]);

  const handleChangeBackgroundForBoth = useCallback(async () => {
    if (!selectedChat) return;
    await chatBackgroundHandler.changeBackgroundForBoth(selectedChat.id);
  }, [selectedChat, chatBackgroundHandler]);

  const handleResetBackground = useCallback(async () => {
    if (!selectedChat) return;
    await chatBackgroundHandler.resetBackground(selectedChat.id);
  }, [selectedChat, chatBackgroundHandler]);

  const handleUpdateRecipientStatus = useCallback((isActive: boolean) => {
    if (selectedChat) {
      setSelectedChat((prev) => prev ? { ...prev, isActive } : null);
    }
  }, [selectedChat, setSelectedChat]);

  const handleEditGroup = useCallback(() => setShowGroupEditor(true), [setShowGroupEditor]);
  const handleRemoveMembersOpen = useCallback(() => setShowRemoveMembers(true), [setShowRemoveMembers]);

  const handleSetPinClose = useCallback(() => chatSettingsState.setShowSetPin(false), [chatSettingsState]);
  const handleEnterPinClose = useCallback(() => chatSettingsState.setShowEnterPin(false), [chatSettingsState]);
  const handleEnterPinUnlock = useCallback(() => {
    chatSettingsState.setE2EEUnlocked(true);
    sessionStorage.setItem('e2ee_unlocked', '1');
    chatSettingsState.setShowEnterPin(false);
  }, [chatSettingsState]);

  return {
    handleBackToChats,
    handleBackToGroups,
    handleUnlock,
    handleSetReplyingToMessage,
    handleClearReply,
    handleCloseGroupEditor,
    handleCloseRemoveMembers,
    handlePreviewImage,
    handleClosePreview,
    handleRemoveImage,
    handleRemoveFile,
    handleTypingStop,
    handleGroupTypingStop,
    handleChangeBackground,
    handleChangeBackgroundForBoth,
    handleResetBackground,
    handleUpdateRecipientStatus,
    handleEditGroup,
    handleRemoveMembersOpen,
    handleSetPinClose,
    handleEnterPinClose,
    handleEnterPinUnlock,
  };
};
