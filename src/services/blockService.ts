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
};
