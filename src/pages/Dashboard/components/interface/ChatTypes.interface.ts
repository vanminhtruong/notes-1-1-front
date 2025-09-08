export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  groupId?: number;
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'system';
  isDeletedForAll?: boolean;
  createdAt: string;
  // For group messages (and optionally DMs), backend may include sender object
  sender?: User;
  // Message status tracking
  status?: 'sent' | 'delivered' | 'read';
  readBy?: Array<{ userId: number; readAt: string; user?: User }>;
  // Reactions (added by backend include)
  Reactions?: Array<{ userId: number; type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'; count?: number }>;  
}

export interface MessageGroup {
  senderId: number;
  items: Message[];
  start: string;
  end: string;
}

export interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}
