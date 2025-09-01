import { CheckIcon, CheckCheckIcon } from 'lucide-react';
import type { Message } from './types';
import { useMemo, useEffect } from 'react';

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

interface MessageStatusProps {
  message: Message;
  isOwnMessage: boolean;
  currentUserId?: number;
  allMessages?: Message[];
}

const MessageStatus = ({ message, isOwnMessage, currentUserId, allMessages = [] }: MessageStatusProps) => {
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

  // Calculate latest read message for each user to avoid duplicate avatars
  const latestReadByUser = useMemo(() => {
    if (!allMessages.length || !message.readBy) return new Map();

    const userLatestReads = new Map<number, { messageId: number; readAt: string }>();
    
    // Go through all messages and find the latest read message for each user
    allMessages
      .filter(msg => msg.senderId === currentUserId && msg.readBy) // Only own messages with readBy data
      .forEach(msg => {
        msg.readBy?.forEach(readInfo => {
          if (readInfo.userId === currentUserId) return; // Skip current user
          
          const existing = userLatestReads.get(readInfo.userId);
          if (!existing || new Date(readInfo.readAt) > new Date(existing.readAt)) {
            userLatestReads.set(readInfo.userId, {
              messageId: msg.id,
              readAt: readInfo.readAt
            });
          }
        });
      });

    return userLatestReads;
  }, [allMessages, currentUserId, message.readBy]);

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
        return (
          <CheckCheckIcon className="w-4 h-4 text-blue-500" />
        );
      default:
        return null;
    }
  };

  const renderReadByAvatars = () => {
    if (message.status !== 'read' || !message.readBy || message.readBy.length === 0) {
      return null;
    }

    // Filter out current user from readBy list
    const readByOthers = message.readBy.filter(rb => rb.userId !== currentUserId);
    
    if (readByOthers.length === 0) {
      return null;
    }

    // Only show avatars on the latest read message for each user to avoid duplicates
    const avatarsToShow = readByOthers.filter(readInfo => {
      const latestRead = latestReadByUser.get(readInfo.userId);
      return latestRead && latestRead.messageId === message.id;
    });

    if (avatarsToShow.length === 0) {
      return null;
    }

    return (
      <div className="flex -space-x-1 ml-1 transform transition-all duration-300 ease-out">
        {avatarsToShow.slice(0, 3).map((readInfo, index) => {
          const user = readInfo.user;
          return (
            <div
              key={readInfo.userId}
              className="w-4 h-4 rounded-full overflow-hidden border border-white dark:border-gray-800 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold avatar-container animate-avatarSlideIn animate-avatarFloat animate-avatarPulse"
              style={{ 
                zIndex: avatarsToShow.length - index,
                animationDelay: `${index * 150}ms`
              }}
              title={`${user?.name || `User ${readInfo.userId}`} đã xem lúc ${new Date(readInfo.readAt).toLocaleTimeString()}`}
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
            title={`+${avatarsToShow.length - 3} người khác đã xem`}
          >
            +{avatarsToShow.length - 3}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-end mt-1 px-1">
      <div className="flex items-center gap-1">
        {renderStatusIcon()}
        {renderReadByAvatars()}
      </div>
    </div>
  );
};

export default MessageStatus;
