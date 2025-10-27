import { useCallback } from 'react';
import { notesService, type Note } from '@/services/notesService';
import { toast } from 'react-hot-toast';

interface UseCategoryNotesHandlerProps {
  categoryId: number | null;
  pageSize: number;
  currentPage: number;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTotalPages: (pages: number) => void;
}

export const useCategoryNotesHandler = ({
  categoryId,
  pageSize,
  currentPage,
  setNotes,
  setIsLoading,
  setError,
  setTotalPages,
}: UseCategoryNotesHandlerProps) => {
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
  }, [categoryId, currentPage, pageSize, setNotes, setIsLoading, setError, setTotalPages]);

  const refreshNotes = useCallback(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    fetchNotes,
    refreshNotes,
  };
};
