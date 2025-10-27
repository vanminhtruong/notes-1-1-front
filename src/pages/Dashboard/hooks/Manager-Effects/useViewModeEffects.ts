import { useEffect } from 'react';
import type { ViewMode } from '../Manager-useState/useViewModeState';

interface UseViewModeEffectsProps {
  viewMode: ViewMode;
  setShowArchived: (value: boolean) => void;
  setCurrentPage: (value: number) => void;
}

export const useViewModeEffects = ({ 
  viewMode, 
  setShowArchived, 
  setCurrentPage 
}: UseViewModeEffectsProps) => {
  useEffect(() => {
    setShowArchived(viewMode === 'archived');
    setCurrentPage(1);
  }, [viewMode, setShowArchived, setCurrentPage]);
};
