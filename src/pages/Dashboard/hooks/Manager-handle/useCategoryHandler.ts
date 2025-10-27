import { useCallback } from 'react';
import { notesService, type NoteCategory } from '@/services/notesService';

interface UseCategoryHandlerProps {
  setCategories: React.Dispatch<React.SetStateAction<NoteCategory[]>>;
}

export const useCategoryHandler = ({
  setCategories,
}: UseCategoryHandlerProps) => {
  // Fetch categories function
  const loadCategories = useCallback(async () => {
    try {
      const response = await notesService.getCategories({ sortBy: 'maxSelectionCount', sortOrder: 'DESC' });
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, [setCategories]);

  return {
    loadCategories,
  };
};
