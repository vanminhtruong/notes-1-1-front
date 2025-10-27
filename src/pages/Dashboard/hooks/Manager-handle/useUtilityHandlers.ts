import { useCallback } from 'react';
import type { NoteCategory } from '@/services/notesService';

export const useUtilityHandlers = () => {
  const moveToFront = useCallback((arr: NoteCategory[], id?: number) => {
    if (!id) return arr;
    const idx = arr.findIndex(c => c.id === id);
    if (idx <= 0) return arr;
    const copy = arr.slice();
    const [item] = copy.splice(idx, 1);
    return [item, ...copy];
  }, []);

  return {
    moveToFront,
  };
};
