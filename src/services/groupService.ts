import api from './api';

export interface GroupSummary {
  id: number;
  name: string;
  ownerId: number;
  members: number[];
  avatar?: string;
  background?: string;
  isPinned?: boolean;
}

export interface GroupMessage {
  id: number;
  groupId: number;
  senderId: number;
  content: string;
  messageType: 'text' | 'image' | 'file';
  createdAt: string;
  sender?: {
    id: number;
    name: string;
    avatar?: string;
  };
  GroupMessageReads?: Array<{
    userId: number;
    readAt: string;
    user: {
      id: number;
      name: string;
      avatar?: string;
    };
  }>;
  status?: 'sent' | 'delivered' | 'read';
  readBy?: Array<{ userId: number; readAt: string; user?: { id: number; name: string; avatar?: string } }>;
}

export const groupService = {
  async listMyGroups() {
    const res = await api.get('/groups');
    return res.data as { success: boolean; data: GroupSummary[] };
  },
  async getUserGroups(userId: number) {
    const res = await api.get(`/groups/user/${userId}`);
    return res.data as { success: boolean; data: GroupSummary[] };
  },
  async getCommonGroups(userId: number) {
    const res = await api.get(`/groups/common/${userId}`);
    return res.data as { success: boolean; data: GroupSummary[] };
  },

  async createGroup(name: string, memberIds: number[] = [], options?: { avatar?: string; background?: string }) {
    const res = await api.post('/groups', { name, memberIds, ...(options || {}) });
    return res.data as { success: boolean; data: GroupSummary & { members: number[] } };
  },

  async inviteMembers(groupId: number, memberIds: number[]) {
    const res = await api.post(`/groups/${groupId}/invite`, { memberIds });
    return res.data as { success: boolean; data: { groupId: number; added: number[]; pending?: number[]; pendingInvites?: Array<{ inviteId: number; inviteeId: number }>; } };
  },

  async removeMembers(groupId: number, memberIds: number[]) {
    const res = await api.post(`/groups/${groupId}/remove`, { memberIds });
    return res.data as { success: boolean; data: { groupId: number; removed: number[] } };
  },

  async leaveGroup(groupId: number) {
    const res = await api.post(`/groups/${groupId}/leave`);
    return res.data as { success: boolean; data: { groupId: number; userId: number } };
  },

  async getMyInvites() {
    const res = await api.get('/groups/invites');
    return res.data as { success: boolean; data: Array<{ id: number; status: 'pending' | 'accepted' | 'declined'; group: any; inviter: any }> };
  },

  async deleteGroup(groupId: number) {
    const res = await api.delete(`/groups/${groupId}`);
    return res.data as { success: boolean; data: { groupId: number } };
  },

  async getGroupMessages(groupId: number, page = 1, limit = 50) {
    const res = await api.get(`/groups/${groupId}/messages`, { params: { page, limit } });
    return res.data as { success: boolean; data: GroupMessage[] };
  },

  async searchGroupMessages(groupId: number, q: string, limit = 20) {
    const params = new URLSearchParams();
    params.append('q', q);
    params.append('limit', String(limit));
    const res = await api.get(`/groups/${groupId}/messages/search?${params.toString()}`);
    return res.data as { success: boolean; data: Array<{ id: number; groupId: number; senderId: number; content: string; messageType: 'text'|'image'|'file'; createdAt: string }>; };
  },

  async sendGroupMessage(groupId: number, content: string, messageType: 'text' | 'image' | 'file' = 'text') {
    const res = await api.post(`/groups/${groupId}/message`, { content, messageType });
    return res.data as { success: boolean; data: GroupMessage };
  },

  async updateGroup(groupId: number, updates: { name?: string; avatar?: string; background?: string }) {
    const res = await api.patch(`/groups/${groupId}`, updates);
    return res.data as { success: boolean; data: GroupSummary & { members: number[] } };
  },
  
  async acceptGroupInvite(groupId: number, inviteId: number) {
    const res = await api.post(`/groups/${groupId}/invites/${inviteId}/accept`);
    return res.data as { success: boolean; data: { groupId: number; userId: number } };
  },

  async declineGroupInvite(groupId: number, inviteId: number) {
    const res = await api.post(`/groups/${groupId}/invites/${inviteId}/decline`);
    return res.data as { success: boolean; data: { groupId: number; inviteId: number; status: 'declined' } };
  },

  async markGroupMessagesRead(groupId: number) {
    const res = await api.put(`/groups/${groupId}/read`);
    return res.data as { success: boolean; data: { groupId: number; markedCount: number; readReceiptsCount: number } };
  },
  
  async getGroupMembers(groupId: number) {
    const res = await api.get(`/groups/${groupId}/members`);
    return res.data as { success: boolean; data: Array<{ id: number; name: string; avatar?: string | null; email?: string | null; phone?: string | null; birthDate?: string | null; gender?: string; role: 'member'|'admin'|'owner' }>; };
  },
  
  async recallGroupMessages(groupId: number, messageIds: number[], scope: 'self' | 'all') {
    const res = await api.post(`/groups/${groupId}/message/recall`, { messageIds, scope });
    return res.data as { success: boolean; data: { groupId: number; scope: 'self' | 'all'; messageIds: number[] } };
  },

  async editGroupMessage(groupId: number, messageId: number, content: string) {
    const res = await api.put(`/groups/${groupId}/message/${messageId}`, { content });
    return res.data as { success: boolean; data: { id: number; groupId: number; content: string; updatedAt: string } };
  },

  // React to a group message
  async reactGroupMessage(groupId: number, messageId: number, type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry') {
    const res = await api.post(`/groups/${groupId}/message/${messageId}/react`, { type });
    return res.data as { success: boolean; data: { groupId: number; messageId: number; type: string } };
  },

  // Remove reaction from a group message (optionally a specific type)
  async unreactGroupMessage(groupId: number, messageId: number, type?: 'like'|'love'|'haha'|'wow'|'sad'|'angry') {
    const res = await api.delete(`/groups/${groupId}/message/${messageId}/react`, {
      params: type ? { type } : undefined,
    });
    return res.data as { success: boolean; data: { groupId: number; messageId: number; type?: string } };
  },
};
