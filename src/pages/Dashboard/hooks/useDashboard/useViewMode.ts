import { useState, useEffect } from 'react';
import type { ViewMode } from '../../components/ViewToggle';

interface UseViewModeProps {
  setShowArchived: (value: boolean) => void;
  setCurrentPage: (page: number) => void;
}

export const useViewMode = ({ setShowArchived, setCurrentPage }: UseViewModeProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('active');

  // Sync viewMode with showArchived filter
  useEffect(() => {
    if (viewMode === 'archived') {
      setShowArchived(true);
    } else if (viewMode === 'active') {
      setShowArchived(false);
    }
    // Reset to first page when switching tabs
    setCurrentPage(1);
  }, [viewMode, setShowArchived, setCurrentPage]);

  return {
    viewMode,
    setViewMode,
  };
};
