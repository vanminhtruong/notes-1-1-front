import api from './api';

export interface BackendNotification {
  id: number;
  userId: number; // recipient
  type: 'friend_request' | 'group_invite' | string;
  fromUserId?: number | null;
  groupId?: number | null;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  fromUser?: { id: number; name: string; avatar?: string | null } | null;
  group?: { id: number; name: string; avatar?: string | null } | null;
}

export const notificationService = {
  async listMyNotifications(params?: { unreadOnly?: boolean; limit?: number; collapse?: 'message_by_other' | string }) {
    const res = await api.get('/notifications', { params });
    return res.data as { success: boolean; data: BackendNotification[] };
  },
  async getBellFeed() {
    const res = await api.get('/notifications/bell');
    return res.data as { success: boolean; data: Array<{ id: number; name: string; avatar?: string | null; count?: number; time?: string }> };
  },
  async getBellBadge() {
    const res = await api.get('/notifications/bell/badge');
    return res.data as { success: boolean; data: { total: number; dm: number; group: number; fr: number; inv: number } };
  },
  async dismissBellItem(scope: 'dm' | 'group' | 'fr' | 'inv', id?: number) {
    const res = await api.post('/notifications/bell/dismiss', { scope, id });
    return res.data as { success: boolean };
  },
  async markAllRead() {
    const res = await api.put('/notifications/read-all');
    return res.data as { success: boolean; data: { updated: number } };
  },
};
