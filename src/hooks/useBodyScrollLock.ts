import { useEffect } from 'react';
import { lockBodyScroll, unlockBodyScroll } from '@/utils/scrollLock';

/**
 * Hook to disable body scroll when modal/overlay is open.
 * Uses a reference-counted util to prevent conflicts giữa nhiều modal.
 */
export const useBodyScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      lockBodyScroll('useBodyScrollLock');
      return () => {
        unlockBodyScroll('useBodyScrollLock');
      };
    } else {
      // Ensure body scroll restored when toggled off
      unlockBodyScroll('useBodyScrollLock');
    }
    return;
  }, [isOpen]);
};
