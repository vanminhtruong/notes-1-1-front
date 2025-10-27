import { useEffect } from 'react';

interface UseCategoryNotesEffectsProps {
  categoryId: number | null;
  fetchNotes: () => Promise<void>;
  setCurrentPage: (page: number) => void;
}

export const useCategoryNotesEffects = ({
  categoryId,
  fetchNotes,
  setCurrentPage,
}: UseCategoryNotesEffectsProps) => {
  // Fetch notes when dependencies change
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, setCurrentPage]);
};
