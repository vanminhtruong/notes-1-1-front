import api from './api';

export interface BlockStatus {
  blockedByMe: boolean;
  blockedMe: boolean;
  isEitherBlocked: boolean;
  blockId: number | null;
}

export const blockService = {
  async block(targetId: number) {
    const res = await api.post('/blocks', { targetId });
    return res.data as { success: boolean; data: any };
  },
  async unblock(targetId: number) {
    const res = await api.delete(`/blocks/${targetId}`);
    return res.data as { success: boolean; data: { deleted: number } };
  },
  async getStatus(targetId: number) {
    const res = await api.get(`/blocks/status?targetId=${targetId}`);
    return res.data as { success: boolean; data: BlockStatus };
  },
  async listBlockedUsers() {
    const res = await api.get('/blocks');
    return res.data as { success: boolean; data: Array<{ id: number; name: string; email: string; avatar?: string | null; lastSeenAt?: string | null }>; };
  },
};
