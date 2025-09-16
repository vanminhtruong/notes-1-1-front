import api from './api';

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
  content: string;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  isDeletedForAll?: boolean;
  createdAt: string;
  sender?: {
    id: number;
    name: string;
    avatar?: string;
  };
  receiver?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface ChatListItem {
  friend: User;
  lastMessage: Message | null;
  unreadCount: number;
  friendshipId: number;
}

export const chatService = {
  // Get all users for search
  async getUsers(search?: string, limit = 10) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', limit.toString());

    const response = await api.get(`/friends/users?${params}`);
    return response.data;
  },

  // Send friend request
  async sendFriendRequest(userId: number) {
    const response = await api.post('/friends/request', { userId });
    return response.data;
  },

  // Get received friend requests
  async getFriendRequests() {
    const response = await api.get('/friends/requests');
    return response.data;
  },

  // Get sent friend requests
  async getSentRequests() {
    const response = await api.get('/friends/requests/sent');
    return response.data;
  },

  // Accept friend request
  async acceptFriendRequest(friendshipId: number) {
    const response = await api.put(`/friends/requests/${friendshipId}/accept`);
    return response.data;
  },

  // Reject friend request
  async rejectFriendRequest(friendshipId: number) {
    const response = await api.delete(`/friends/requests/${friendshipId}/reject`);
    return response.data;
  },

  // Get friends list
  async getFriends() {
    const response = await api.get('/friends');
    return response.data;
  },

  // Get chat list
  async getChatList() {
    const response = await api.get('/chat');
    return response.data;
  },

  // Get chat messages
  async getChatMessages(userId: number, page = 1, limit = 10) {
    const response = await api.get(`/chat/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Search chat messages with a specific user
  async searchMessages(userId: number, q: string, limit = 20) {
    const params = new URLSearchParams();
    params.append('q', q);
    params.append('limit', String(limit));
    const response = await api.get(`/chat/${userId}/search?${params.toString()}`);
    return response.data as { success: boolean; data: Array<{ id: number; senderId: number; receiverId: number; content: string; messageType: 'text'|'image'|'file'; createdAt: string }>; };
  },

  // Send message
  async sendMessage(
    receiverId: number,
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    replyToMessageId?: number | null,
  ) {
    const payload: any = { receiverId, content, messageType };
    if (replyToMessageId) payload.replyToMessageId = replyToMessageId;
    const response = await api.post('/chat/message', payload);
    return response.data;
  },

  // Mark messages as read
  async markMessagesAsRead(senderId: number) {
    const response = await api.put(`/chat/${senderId}/read`);
    return response.data;
  },

  // Get unread count
  async getUnreadCount() {
    const response = await api.get('/chat/unread-count');
    return response.data;
  },

  // Recall messages
  async recallMessages(messageIds: number[], scope: 'self' | 'all') {
    const response = await api.post('/chat/message/recall', { messageIds, scope });
    return response.data;
  },

  // Edit a text message
  async editMessage(messageId: number, content: string) {
    const response = await api.put(`/chat/message/${messageId}`, { content });
    return response.data as { success: boolean; data: { id: number; content: string; updatedAt: string } };
  },

  // React to a DM message
  async reactMessage(messageId: number, type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry') {
    const res = await api.post(`/chat/message/${messageId}/react`, { type });
    return res.data as { success: boolean; data: { messageId: number; type: string } };
  },

  // Remove reaction from a DM message (optionally a specific type)
  async unreactMessage(messageId: number, type?: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry') {
    const res = await api.delete(`/chat/message/${messageId}/react`, {
      params: type ? { type } : undefined,
    });
    return res.data as { success: boolean; data: { messageId: number; type?: string } };
  },

  // Remove friend
  async removeFriend(friendshipId: number) {
    const response = await api.delete(`/friends/${friendshipId}`);
    return response.data;
  },

  // Delete all messages with a user
  async deleteAllMessages(userId: number) {
    const response = await api.delete(`/chat/${userId}/messages`);
    return response.data;
  },

  // Get per-chat background (1-1)
  async getChatBackground(userId: number) {
    const response = await api.get(`/chat/${userId}/background`);
    return response.data as { success: boolean; data: { backgroundUrl: string | null } };
  },

  // Set per-chat background (pass null to reset)
  async setChatBackground(userId: number, backgroundUrl: string | null) {
    const response = await api.put(`/chat/${userId}/background`, { backgroundUrl });
    return response.data as { success: boolean; data: { backgroundUrl: string | null } };
  },

  // Get per-chat nickname
  async getChatNickname(userId: number) {
    const response = await api.get(`/chat/${userId}/nickname`);
    return response.data as { success: boolean; data: { nickname: string | null } };
  },

  // Set per-chat nickname (pass empty string or null to clear)
  async setChatNickname(userId: number, nickname: string | null) {
    const response = await api.put(`/chat/${userId}/nickname`, { nickname });
    return response.data as { success: boolean; data: { nickname: string | null } };
  }
};
