import { useState, useRef } from 'react';

export const useMessageInputState = () => {
  const [newMessage, setNewMessage] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<number | undefined>(undefined);
  const typingSentRef = useRef(false);
  const [groupTypingUsers, setGroupTypingUsers] = useState<Array<{ id: any; name: string; avatar?: string }>>([]);
  const [replyingToMessage, setReplyingToMessage] = useState<any | null>(null);

  return {
    newMessage,
    setNewMessage,
    isPartnerTyping,
    setIsPartnerTyping,
    typingTimeoutRef,
    typingSentRef,
    groupTypingUsers,
    setGroupTypingUsers,
    replyingToMessage,
    setReplyingToMessage,
  };
};
