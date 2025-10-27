import { useState } from 'react';
import type { Note } from '@/services/notesService';

export const useCategoryNotesState = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  return {
    notes,
    setNotes,
    isLoading,
    setIsLoading,
    error,
    setError,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
  };
};
