import { useState } from 'react';
import type { BlockStatus } from '@/services/blockService';

export const useBlockStatusState = () => {
  const [blockStatus, setBlockStatus] = useState<BlockStatus | null>(null);

  return {
    blockStatus,
    setBlockStatus,
  };
};
