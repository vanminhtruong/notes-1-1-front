import api from './api';

export const pinService = {
  // Pin/Unpin a chat (1-1)
  togglePinChat: async (userId: number, pinned: boolean) => {
    const response = await api.put(`/chat/${userId}/pin`, { pinned });
    return response.data;
  },

  // Get pin status for a chat (1-1)  
  getChatPinStatus: async (userId: number) => {
    const response = await api.get(`/chat/${userId}/pin`);
    return response.data;
  },

  // Pin/Unpin a group
  togglePinGroup: async (groupId: number, pinned: boolean) => {
    const response = await api.put(`/groups/${groupId}/pin`, { pinned });
    return response.data;
  },

  // Get pin status for a group
  getGroupPinStatus: async (groupId: number) => {
    const response = await api.get(`/groups/${groupId}/pin`);
    return response.data;
  },

  // Pin/Unpin a specific message in 1-1 chat
  togglePinMessage: async (messageId: number, pinned: boolean) => {
    const response = await api.put(`/chat/message/${messageId}/pin`, { pinned });
    return response.data;
  },

  // List pinned messages for a 1-1 chat with specific user
  listPinnedMessages: async (userId: number) => {
    const response = await api.get(`/chat/${userId}/pins`, { params: { t: Date.now() } });
    return response.data;
  },

  // Pin/Unpin a specific group message
  togglePinGroupMessage: async (groupId: number, messageId: number, pinned: boolean) => {
    const response = await api.put(`/groups/${groupId}/message/${messageId}/pin`, { pinned });
    return response.data;
  },

  // List pinned messages in a group
  listGroupPinnedMessages: async (groupId: number) => {
    const response = await api.get(`/groups/${groupId}/pins`, { params: { t: Date.now() } });
    return response.data;
  },
};
