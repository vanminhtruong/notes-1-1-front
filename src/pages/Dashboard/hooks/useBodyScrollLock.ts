import { useEffect } from 'react';
import { lockBodyScroll, unlockBodyScroll } from '@/utils/scrollLock';

export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      lockBodyScroll('useBodyScrollLock');
    }

    return () => {
      if (isLocked) {
        unlockBodyScroll('useBodyScrollLock');
      }
    };
  }, [isLocked]);
};
