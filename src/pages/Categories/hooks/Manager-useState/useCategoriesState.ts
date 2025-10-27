import { useState } from 'react';
import type { NoteCategory } from '@/services/notesService';

export const useCategoriesState = () => {
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return {
    categories,
    setCategories,
    isLoading,
    setIsLoading,
  };
};
