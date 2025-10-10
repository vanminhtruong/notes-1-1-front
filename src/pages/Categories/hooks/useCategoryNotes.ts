import { useState, useEffect, useCallback } from 'react';
import { notesService, type Note } from '@/services/notesService';
import { toast } from 'react-hot-toast';

interface UseCategoryNotesReturn {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  refreshNotes: () => void;
}

export const useCategoryNotes = (categoryId: number | null, pageSize: number = 3): UseCategoryNotesReturn => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotes = useCallback(async () => {
    if (!categoryId) {
      setNotes([]);
      setTotalPages(1);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await notesService.getNotes({
        category: categoryId.toString(),
        page: currentPage,
        limit: pageSize,
        isArchived: false,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });

      setNotes(response.notes);
      setTotalPages(response.pagination.totalPages || 1);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load notes';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, currentPage, pageSize]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId]);

  const refreshNotes = useCallback(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    isLoading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
    refreshNotes,
  };
};
