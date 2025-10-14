import { CheckIcon, CheckCheckIcon } from 'lucide-react';
import { useEffect, memo } from 'react';
import type { MessageStatusProps } from '../../interface/MessageStatus.interface';
import { useTranslation } from 'react-i18next';

// CSS for smooth avatar animations
const avatarAnimationStyles = `
  @keyframes avatarSlideIn {
    0% {
      opacity: 0;
      transform: translateY(15px) translateX(-5px) scale(0.6) rotate(-10deg);
      filter: blur(2px);
    }
    25% {
      opacity: 0.4;
      transform: translateY(10px) translateX(-3px) scale(0.75) rotate(-5deg);
      filter: blur(1px);
    }
    50% {
      opacity: 0.7;
      transform: translateY(5px) translateX(-1px) scale(0.9) rotate(-2deg);
      filter: blur(0.5px);
    }
    75% {
      opacity: 0.9;
      transform: translateY(2px) translateX(0) scale(1.05) rotate(1deg);
      filter: blur(0px);
    }
    100% {
      opacity: 1;
      transform: translateY(0) translateX(0) scale(1) rotate(0deg);
      filter: blur(0px);
    }
  }
  
  @keyframes avatarFloat {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-2px);
    }
  }
  
  @keyframes avatarPulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
    }
    50% {
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
  }
  
  .animate-avatarSlideIn {
    animation: avatarSlideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  .animate-avatarFloat {
    animation: avatarFloat 2s ease-in-out infinite;
  }
  
  .animate-avatarPulse {
    animation: avatarPulse 2s ease-in-out infinite;
  }
  
  .avatar-container {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
  }
  
  .avatar-container:hover {
    transform: translateY(-3px) scale(1.15);
    filter: brightness(1.1) saturate(1.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

 
const MessageStatus = memo(({ message, isOwnMessage, currentUserId, allMessages }: MessageStatusProps) => {
  const { t, i18n } = useTranslation('dashboard');
  // Inject custom CSS styles for animations
  useEffect(() => {
    const styleId = 'avatar-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = avatarAnimationStyles;
      document.head.appendChild(style);
    }
  }, []);

  // Only show status for own messages
  if (!isOwnMessage || !message.status) {
    return null;
  }

  const renderStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return (
          <CheckIcon className="w-4 h-4 text-gray-400" />
        );
      case 'delivered':
        return (
          <CheckCheckIcon className="w-4 h-4 text-gray-400" />
        );
      case 'read':
        // When read receipts are present, hide the double-check icon
        return null;
      default:
        return null;
    }
  };

  // Simple resolve: just use the user data provided in readBy
  const resolveUser = (readInfo: any) => {
    return readInfo.user || { id: readInfo.userId, name: String(t('chat.fallback.user', { id: readInfo.userId })) };
  };

  // Find latest message sent by current user to limit where we show status icons
  const latestMyMessageId = (() => {
    try {
      const myMessages = (allMessages || [])
        .filter((m: any) => m && Number(m.senderId) === Number(currentUserId) && !m.isDeletedForAll);
      if (myMessages.length === 0) return null;
      // Prefer createdAt when present, fallback to id
      myMessages.sort((a: any, b: any) => {
        const ta = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : (a.createdAt as any as number);
        const tb = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : (b.createdAt as any as number);
        if (Number.isFinite(ta) && Number.isFinite(tb)) return ta - tb;
        return (a.id || 0) - (b.id || 0);
      });
      return myMessages[myMessages.length - 1]?.id ?? null;
    } catch {
      return null;
    }
  })();

  const isLatestMine = isOwnMessage && latestMyMessageId != null && Number(latestMyMessageId) === Number((message as any)?.id);

  const renderReadByAvatars = () => {
    if (message.status !== 'read' || !message.readBy || message.readBy.length === 0) {
      return null;
    }

    // Filter out current user from readBy list
    const readByOthers = message.readBy.filter(rb => rb.userId !== currentUserId);
    
    if (readByOthers.length === 0) {
      return null;
    }

    // Find the last message sent by current user that each reader has read
    // Only show avatars on the last message that each person read
    if (!allMessages || allMessages.length === 0) {
      return null;
    }

    // Get all messages from current user sorted by ID (newest last)
    const myMessages = allMessages
      .filter(m => m.senderId === currentUserId)
      .sort((a, b) => a.id - b.id);

    // For each reader, find the last message they read
    const readersOnLastMessage = readByOthers.filter(readInfo => {
      // Find all messages this person has read
      const messagesReadByThisPerson = myMessages.filter(m => 
        m.readBy && m.readBy.some(rb => rb.userId === readInfo.userId)
      );
      
      if (messagesReadByThisPerson.length === 0) return false;
      
      // Get the last message they read
      const lastReadMessage = messagesReadByThisPerson[messagesReadByThisPerson.length - 1];
      
      // Only show avatar if this is that last message
      return lastReadMessage.id === message.id;
    });

    if (readersOnLastMessage.length === 0) {
      return null;
    }

    // Show read avatars only for users whose last read message is this one
    const avatarsToShow = readersOnLastMessage;

    return (
      <div className="flex -space-x-1 ml-1 transform transition-all duration-300 ease-out">
        {avatarsToShow.slice(0, 3).map((readInfo, index) => {
          const user = resolveUser(readInfo);
          const displayName = user?.name || t('chat.fallback.user', { id: readInfo.userId });
          return (
            <div
              key={readInfo.userId}
              className="w-4 h-4 rounded-full overflow-hidden border border-white dark:border-gray-800 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold avatar-container animate-avatarSlideIn animate-avatarFloat animate-avatarPulse"
              style={{ 
                zIndex: avatarsToShow.length - index,
                animationDelay: `${index * 150}ms`
              }}
              title={t('chat.readBy.title', { name: displayName, time: new Date(readInfo.readAt).toLocaleTimeString(i18n.language) })}
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                (user?.name || 'U').charAt(0)
              )}
            </div>
          );
        })}
        {avatarsToShow.length > 3 && (
          <div 
            className="w-4 h-4 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white text-xs avatar-container animate-avatarSlideIn animate-avatarFloat"
            style={{ animationDelay: `${avatarsToShow.length * 150}ms` }}
            title={t('chat.readBy.more', { count: avatarsToShow.length - 3 })}
          >
            +{avatarsToShow.length - 3}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-1">
      {/* Only show status icon on the latest message sent by me */}
      {isLatestMine ? renderStatusIcon() : null}
      {renderReadByAvatars()}
    </div>
  );
});

MessageStatus.displayName = 'MessageStatus';

export default MessageStatus;

