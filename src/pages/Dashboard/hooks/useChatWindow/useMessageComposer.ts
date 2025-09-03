import type { Dispatch, SetStateAction, ChangeEvent, MutableRefObject } from 'react';
import toast from 'react-hot-toast';
import { uploadService } from '../../../../services/uploadService';
import { chatService } from '../../../../services/chatService';
import { groupService } from '../../../../services/groupService';
import { getSocket } from '../../../../services/socket';
import type { User, Message } from '../../components/interface/ChatTypes.interface';
import type { GroupSummary } from '../../../../services/groupService';

interface UseMessageComposerParams {
  selectedChat: User | null;
  selectedGroup: GroupSummary | null;
  newMessage: string;
  setNewMessage: Dispatch<SetStateAction<string>>;
  setMessages: Dispatch<SetStateAction<any[]>>;
  pendingImages: Array<{ id: string; file: File; preview: string }>;
  setPendingImages: Dispatch<SetStateAction<Array<{ id: string; file: File; preview: string }>>>;
  pendingFiles: Array<{ id: string; file: File }>;
  setPendingFiles: Dispatch<SetStateAction<Array<{ id: string; file: File }>>>;
  scrollToBottom: () => void;
  typingTimeoutRef: MutableRefObject<number | undefined>;
  typingSentRef: MutableRefObject<boolean>;
  upsertChatListWithMessage: (otherUserId: number, msg: Message) => void;
  t: (key: string, defaultValue?: any) => string;
}

export function useMessageComposer({
  selectedChat,
  selectedGroup,
  newMessage,
  setNewMessage,
  setMessages,
  pendingImages,
  setPendingImages,
  pendingFiles,
  setPendingFiles,
  scrollToBottom,
  typingTimeoutRef,
  typingSentRef,
  upsertChatListWithMessage,
  t,
}: UseMessageComposerParams) {
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    // Reset input so selecting same file again triggers change
    e.target.value = '';
    if (files.length === 0) return;

    const MAX_IMG = 5 * 1024 * 1024; // 5MB images
    const MAX_FILE = 20 * 1024 * 1024; // 20MB generic files

    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    const otherFiles = files.filter((f) => !f.type.startsWith('image/'));

    const validImages = imageFiles.filter((f) => f.size <= MAX_IMG);
    const skippedImages = imageFiles.length - validImages.length;

    const validOthers = otherFiles.filter((f) => f.size <= MAX_FILE);
    const skippedOthers = otherFiles.length - validOthers.length;

    if (skippedImages > 0 || skippedOthers > 0) {
      toast.error(t('chat.errors.oversizedFiles'));
    }

    if (validImages.length > 0) {
      const newImgs = validImages.map((file, idx) => ({
        id: `${Date.now()}_img_${idx}_${file.name}`,
        file,
        preview: URL.createObjectURL(file),
      }));
      setPendingImages((prev) => [...prev, ...newImgs]);
    }

    if (validOthers.length > 0) {
      const newFiles = validOthers.map((file, idx) => ({
        id: `${Date.now()}_file_${idx}_${file.name}`,
        file,
      }));
      setPendingFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && pendingImages.length === 0 && pendingFiles.length === 0) || !selectedChat) return;

    try {
      let sentSomething = false;

      // Upload and send all pending images sequentially
      if (pendingImages.length > 0) {
        for (const img of pendingImages) {
          try {
            const { url } = await uploadService.uploadImage(img.file);
            const resp = await chatService.sendMessage(selectedChat.id, url, 'image');
            if (resp.success) {
              setMessages((prev) => {
                const exists = prev.some((m: any) => m.id === resp.data.id);
                const messageWithStatus = { ...resp.data, status: 'sent' };
                return exists ? prev : [...prev, messageWithStatus];
              });
              sentSomething = true;
              // Update chat list preview for image send
              upsertChatListWithMessage(selectedChat.id, resp.data as Message);
            }
          } finally {
            URL.revokeObjectURL(img.preview);
          }
        }
        // Clear all pending images after sending
        setPendingImages([]);
      }

      // Upload and send all pending files sequentially
      if (pendingFiles.length > 0) {
        for (const f of pendingFiles) {
          const { url } = await uploadService.uploadFile(f.file);
          const resp = await chatService.sendMessage(selectedChat.id, url, 'file');
          if (resp.success) {
            setMessages((prev) => {
              const exists = prev.some((m: any) => m.id === resp.data.id);
              const messageWithStatus = { ...resp.data, status: 'sent' };
              return exists ? prev : [...prev, messageWithStatus];
            });
            sentSomething = true;
            // Update chat list preview for file send
            upsertChatListWithMessage(selectedChat.id, resp.data as Message);
          }
        }
        setPendingFiles([]);
      }

      // If there is text, send it too
      if (newMessage.trim()) {
        const response = await chatService.sendMessage(selectedChat.id, newMessage.trim(), 'text');
        if (response.success) {
          const apiMsg = response.data;
          setMessages((prev) => {
            const exists = prev.some((m: any) => m.id === apiMsg.id);
            const messageWithStatus = { ...apiMsg, status: 'sent' };
            return exists ? prev : [...prev, messageWithStatus];
          });
          setNewMessage('');
          sentSomething = true;
          // Update chat list preview
          upsertChatListWithMessage(selectedChat.id, apiMsg as Message);
        }
      }

      if (sentSomething) {
        scrollToBottom();
        // stop typing if active
        const socket = getSocket();
        if (socket && typingSentRef.current) {
          socket.emit('typing_stop', { receiverId: selectedChat.id });
          typingSentRef.current = false;
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.sendMessage'));
    }
  };

  const sendGroupMessage = async () => {
    if ((!newMessage.trim() && pendingImages.length === 0 && pendingFiles.length === 0) || !selectedGroup) return;

    try {
      let sentSomething = false;

      // Upload and send all pending images sequentially
      if (pendingImages.length > 0) {
        for (const img of pendingImages) {
          try {
            const { url } = await uploadService.uploadImage(img.file);
            const resp = await groupService.sendGroupMessage(selectedGroup.id, url, 'image');
            if (resp.success) {
              setMessages((prev: any[]) => {
                const exists = prev.some((m: any) => m.id === resp.data.id);
                const messageWithStatus = { ...resp.data, status: 'sent' };
                return exists ? prev : [...prev, messageWithStatus];
              });
              sentSomething = true;
            }
          } finally {
            URL.revokeObjectURL(img.preview);
          }
        }
        setPendingImages([]);
      }

      // Upload and send all pending files sequentially
      if (pendingFiles.length > 0) {
        for (const f of pendingFiles) {
          const { url } = await uploadService.uploadFile(f.file);
          const resp = await groupService.sendGroupMessage(selectedGroup.id, url, 'file');
          if (resp.success) {
            setMessages((prev: any[]) => {
              const exists = prev.some((m: any) => m.id === resp.data.id);
              const messageWithStatus = { ...resp.data, status: 'sent' };
              return exists ? prev : [...prev, messageWithStatus];
            });
            sentSomething = true;
          }
        }
        setPendingFiles([]);
      }

      // If there is text, send it too
      if (newMessage.trim()) {
        const response = await groupService.sendGroupMessage(selectedGroup.id, newMessage.trim(), 'text');
        if (response.success) {
          const apiMsg = response.data;
          setMessages((prev: any[]) => {
            const exists = prev.some((m: any) => m.id === apiMsg.id);
            const messageWithStatus = { ...apiMsg, status: 'sent' };
            return exists ? prev : [...prev, messageWithStatus];
          });
          setNewMessage('');
          sentSomething = true;
        }
      }

      if (sentSomething) {
        scrollToBottom();
        // stop group typing if active
        const socket = getSocket();
        if (socket && typingSentRef.current && selectedGroup) {
          socket.emit('group_typing', { groupId: selectedGroup.id, isTyping: false });
          typingSentRef.current = false;
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('chat.errors.sendMessage'));
    }
  };

  const handleTyping = () => {
    if (!selectedChat) return;
    const socket = getSocket();
    if (!socket) return;
    // emit typing_start once
    if (!typingSentRef.current) {
      socket.emit('typing_start', { receiverId: selectedChat.id });
      typingSentRef.current = true;
    }
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit('typing_stop', { receiverId: selectedChat.id });
      typingSentRef.current = false;
    }, 1200);
  };

  const handleGroupTyping = () => {
    if (!selectedGroup) return;
    const socket = getSocket();
    if (!socket) return;
    // emit group_typing true once, then debounce stop
    if (!typingSentRef.current) {
      socket.emit('group_typing', { groupId: selectedGroup.id, isTyping: true });
      typingSentRef.current = true;
    }
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit('group_typing', { groupId: selectedGroup.id, isTyping: false });
      typingSentRef.current = false;
    }, 1200);
  };

  return {
    handleFileChange,
    sendMessage,
    sendGroupMessage,
    handleTyping,
    handleGroupTyping,
  };
}
