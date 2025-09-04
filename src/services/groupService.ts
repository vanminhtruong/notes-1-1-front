import api from './api';

export interface GroupSummary {
  id: number;
  name: string;
  ownerId: number;
  members: number[];
  avatar?: string;
  background?: string;
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
};
