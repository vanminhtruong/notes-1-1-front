import type { ChangeEvent } from 'react';

export interface MessageInputProps {
  newMessage: string;
  pendingImages: Array<{ id: string; file: File; preview: string }>;
  pendingFiles: Array<{ id: string; file: File }>;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (id: string) => void;
  onRemoveFile: (id: string) => void;
  onTyping: () => void;
  onTypingStop: () => void;
  // Reply preview
  replyingToMessage?: any;
  onClearReply?: () => void;
}
