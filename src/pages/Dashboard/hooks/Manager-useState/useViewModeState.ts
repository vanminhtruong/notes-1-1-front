import { useState } from 'react';

export type ViewMode = 'active' | 'archived' | 'folders' | 'tags';

export const useViewModeState = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('active');

  return {
    viewMode,
    setViewMode,
  };
};
